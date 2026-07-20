# downloader.py
import os
import httpx
import asyncio
import logging
from io import BytesIO
import aiofiles
from PIL import Image
from typing import List, Dict, Tuple

logger = logging.getLogger("1688_extractor")

# Max concurrent downloads to avoid rate limits
CONCURRENCY_LIMIT = 10
semaphore = asyncio.Semaphore(CONCURRENCY_LIMIT)

async def download_image(
    client: httpx.AsyncClient,
    url: str,
    save_path_prefix: str,
    index: int,
    convert_webp: bool = False,
    max_retries: int = 3
) -> Tuple[bool, str, str]:
    """
    Downloads an image asynchronously, validates its integrity with Pillow,
    detects its extension, converts WEBP to JPG if requested, and saves it.
    
    Returns:
        (success, saved_file_path, error_message)
    """
    async with semaphore:
        attempt = 0
        backoff = 1.0
        
        while attempt < max_retries:
            try:
                # Add a realistic header to bypass anti-scraping blocks
                headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Referer": "https://detail.1688.com/"
                }
                
                response = await client.get(url, headers=headers, timeout=15.0)
                
                if response.status_code != 200:
                    raise httpx.HTTPStatusError(
                        f"HTTP {response.status_code}", 
                        request=response.request, 
                        response=response
                    )
                
                img_bytes = response.content
                
                # Verify image integrity with Pillow
                try:
                    img = Image.open(BytesIO(img_bytes))
                    # Verify checks image file header integrity without reading pixel data
                    img.verify()
                    
                    # Re-open after verify() since verify() closes the stream or leaves it unusable
                    img = Image.open(BytesIO(img_bytes))
                    img_format = img.format.lower() # 'jpeg', 'png', 'webp'
                except Exception as e:
                    logger.warning(f"Corrupted or invalid image bytes from {url}: {e}")
                    return False, "", "Corrupted/Invalid image format"

                # Define appropriate file extension
                ext = img_format
                if ext == "jpeg":
                    ext = "jpg"
                
                do_convert = convert_webp and img_format == "webp"
                
                if do_convert:
                    ext = "jpg"
                
                # Construct final clean file name
                filename = f"product-{index:03d}.{ext}"
                final_path = os.path.join(save_path_prefix, filename)
                
                # Perform webp -> jpg conversion
                if do_convert:
                    try:
                        # Convert mode to RGB in case webp has transparent layers
                        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                            bg = Image.new('RGB', img.size, (255, 255, 255))
                            bg.paste(img, mask=img.split()[3] if img.mode == 'RGBA' else img.split()[1])
                            img = bg
                        else:
                            img = img.convert('RGB')
                            
                        # Save image to path directly using PIL save (runs in loop thread, we use executor to not block async loop)
                        loop = asyncio.get_event_loop()
                        await loop.run_in_executor(
                            None, 
                            lambda: img.save(final_path, 'JPEG', quality=95)
                        )
                    except Exception as conversion_err:
                        logger.error(f"Failed to convert webp to jpg: {conversion_err}")
                        return False, "", f"Conversion failed: {conversion_err}"
                else:
                    # Save raw bytes asynchronously
                    async with aiofiles.open(final_path, 'wb') as f:
                        await f.write(img_bytes)
                
                return True, final_path, ""
                
            except Exception as e:
                attempt += 1
                logger.warning(f"Attempt {attempt} failed downloading {url}: {e}")
                if attempt == max_retries:
                    return False, "", str(e)
                # Exponential backoff
                await asyncio.sleep(backoff)
                backoff *= 2.0
                
        return False, "", "Max retries exceeded"

async def download_all_images(
    urls: List[str],
    output_dir: str,
    convert_webp: bool = False
) -> Dict:
    """
    Coordinates concurrent downloads of all normalized image URLs.
    Logs progress to stdout.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    logger.info(f"Starting concurrent downloads of {len(urls)} images to {output_dir}")
    print(f"\n[+] Yuklash jarayoni boshlandi: jami {len(urls)} ta rasm")
    
    # Configure httpx Client with limits
    limits = httpx.Limits(max_keepalive_connections=5, max_connections=15)
    async with httpx.AsyncClient(limits=limits, follow_redirects=True) as client:
        # Build tasks list
        tasks = []
        for idx, url in enumerate(urls, 1):
            tasks.append(
                download_image(client, url, output_dir, idx, convert_webp)
            )
            
        # Execute tasks concurrently
        results = await asyncio.gather(*tasks)
        
    # Analyze results
    success_count = 0
    failed_count = 0
    downloaded_paths = []
    failed_reports = []
    
    for idx, (success, path, err_msg) in enumerate(results):
        url = urls[idx]
        if success:
            success_count += 1
            downloaded_paths.append(path)
            print(f"  [{success_count + failed_count}/{len(urls)}] Muvaffaqiyatli: {os.path.basename(path)}")
        else:
            failed_count += 1
            failed_reports.append({"url": url, "error": err_msg})
            print(f"  [{success_count + failed_count}/{len(urls)}] XATO: {url} -> {err_msg}")

    print(f"\n[+] Yakunlandi: Muvaffaqiyatli: {success_count}, Xatoliklar: {failed_count}")
    
    return {
        "total": len(urls),
        "success": success_count,
        "failed": failed_count,
        "paths": downloaded_paths,
        "failed_details": failed_reports
    }
