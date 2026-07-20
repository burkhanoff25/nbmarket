# main.py
import os
import sys
import argparse
import asyncio
import logging
import httpx
from datetime import datetime

from parser import extract_images_from_html, extract_title, fetch_page_dynamic, PLAYWRIGHT_AVAILABLE
from downloader import download_all_images

# Setup Logging
logger = logging.getLogger("1688_extractor")
logger.setLevel(logging.DEBUG)

# File log handler
file_handler = logging.FileHandler("extractor.log", encoding="utf-8")
file_formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
file_handler.setFormatter(file_formatter)
logger.addHandler(file_handler)

# Console log handler
console_handler = logging.StreamHandler(sys.stdout)
console_formatter = logging.Formatter("[*] %(message)s")
console_handler.setFormatter(console_formatter)
console_handler.setLevel(logging.INFO)
logger.addHandler(console_handler)

async def scrape_and_download(url: str, base_output: str, convert_webp: bool, force_playwright: bool):
    logger.info(f"Starting extraction for URL: {url}")
    print(f"\n[*] NB Market 1688 Image Extractor")
    print(f"[*] Sahifa: {url}")
    
    html = ""
    title = "1688-Product"
    images = set()

    # Try static fetch first unless Playwright is explicitly forced
    if not force_playwright:
        try:
            logger.info("Attempting static fetch with HTTPX...")
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5"
            }
            async with httpx.AsyncClient(follow_redirects=True, timeout=15.0) as client:
                response = await client.get(url, headers=headers)
                
                # Check for redirects or captcha redirects
                if "sec.1688.com" in str(response.url) or "login.1688.com" in str(response.url):
                    logger.warning("Static fetch redirected to captcha or login page. Will trigger Playwright fallback.")
                else:
                    html = response.text
                    title = extract_title(html)
                    images = extract_images_from_html(html)
                    logger.info(f"Static fetch retrieved {len(images)} images.")
        except Exception as e:
            logger.warning(f"Static fetch failed or timed out: {e}. Will attempt Playwright fallback.")

    # Fall back to Playwright if no images found, redirect occurred, or forced by user
    if len(images) == 0 or force_playwright:
        if not PLAYWRIGHT_AVAILABLE:
            print("[!] Xato: Tizim Captcha/Javascript himoyasiga duch keldi va Playwright o'rnatilmagan.")
            print("[!] Iltimos, 'playwright install' buyrug'ini bajarib brauzer drayverini o'rnating.")
            sys.exit(1)
            
        print("[*] Himoya aniqlandi. Playwright brauzer simulyatsiyasi ishga tushirilmoqda...")
        try:
            html = await fetch_page_dynamic(url)
            title = extract_title(html)
            images = extract_images_from_html(html)
            logger.info(f"Dynamic fetch retrieved {len(images)} images.")
        except Exception as e:
            logger.error(f"Playwright fetch failed: {e}")
            print(f"[!] Xato: Sahifa tarkibini yuklashda muammo yuz berdi: {e}")
            sys.exit(1)

    if not images:
        print("[!] Xato: Sahifadan birorta ham rasm topilmadi. URL to'g'riligini va sahifa ochiqligini tekshiring.")
        sys.exit(0)

    # Clean title to create a safe output directory path
    folder_name = "".join([c if c.isalnum() or c in (' ', '-', '_') else '_' for c in title]).strip()
    folder_name = " ".join(folder_name.split()) # normalize spaces
    if not folder_name:
        folder_name = "1688-Product-Images"
        
    output_dir = os.path.abspath(os.path.join(base_output, folder_name))
    
    print(f"[*] Mahsulot: {title}")
    print(f"[*] Joylashuv: {output_dir}")
    print(f"[*] Topilgan original rasmlar: {len(images)} ta")
    
    # Sort images to maintain stable list order
    sorted_image_list = sorted(list(images))
    
    # Run async download process
    start_time = datetime.now()
    stats = await download_all_images(sorted_image_list, output_dir, convert_webp)
    duration = datetime.now() - start_time
    
    # Generate download report
    report_path = os.path.join(output_dir, "download_report.txt")
    try:
        with open(report_path, "w", encoding="utf-8") as rf:
            rf.write("==================================================\n")
            rf.write("          1688 PRODUCT IMAGE DOWNLOAD REPORT      \n")
            rf.write("==================================================\n\n")
            rf.write(f"Sana: {start_time.strftime('%Y-%m-%d %H:%M:%S')}\n")
            rf.write(f"Mahsulot sarlavhasi: {title}\n")
            rf.write(f"Original sahifa: {url}\n")
            rf.write(f"Jami aniqlangan rasmlar: {stats['total']} ta\n")
            rf.write(f"Muvaffaqiyatli yuklangan: {stats['success']} ta\n")
            rf.write(f"Yuklashda xato bo'lgan: {stats['failed']} ta\n")
            rf.write(f"Sarf etilgan vaqt: {duration.total_seconds():.1f} soniya\n\n")
            rf.write("Muvaffaqiyatli yuklangan fayllar:\n")
            for idx, p in enumerate(stats['paths'], 1):
                rf.write(f"  {idx:03d}. {os.path.basename(p)} -> {p}\n")
            
            if stats['failed'] > 0:
                rf.write("\nYuklanmay qolgan rasmlar tafsiloti:\n")
                for f_info in stats['failed_details']:
                    rf.write(f"  Url: {f_info['url']}\n  Xato: {f_info['error']}\n\n")
                    
        print(f"[*] Yuklash hisoboti yaratildi: {report_path}")
    except Exception as re_err:
        logger.error(f"Failed to generate report file: {re_err}")

def main():
    parser = argparse.ArgumentParser(description="1688.com Original Product Image Downloader")
    parser.add_argument("url", help="1688 product page detail URL")
    parser.add_argument("-o", "--output", default="downloads", help="Output root directory (default: downloads)")
    parser.add_argument("--convert-webp", action="store_true", help="Automatically convert WEBP images to JPG format")
    parser.add_argument("--playwright", action="store_true", help="Force browser dynamic rendering (ignores static fetch attempt)")
    
    args = parser.parse_args()
    
    asyncio.run(
        scrape_and_download(args.url, args.output, args.convert_webp, args.playwright)
    )

if __name__ == "__main__":
    main()
