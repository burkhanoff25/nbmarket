# parser.py
import re
import logging
from typing import Set
from bs4 import BeautifulSoup

logger = logging.getLogger("1688_extractor")

# Set up browser rendering with Playwright fallback
PLAYWRIGHT_AVAILABLE = False
try:
    from playwright.async_api import async_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    logger.warning("Playwright is not installed. Dynamic pages will fall back to static fetch.")

def normalize_url(url: str) -> str:
    """
    Normalizes image URLs by ensuring https schema, resolving relatives,
    and removing thumbnail/compression parameters to get the original high-res image.
    """
    if not url:
        return ""
    
    # Strip spaces
    url = url.strip()
    
    # Handle protocol relative URLs
    if url.startswith("//"):
        url = "https:" + url
    elif not url.startswith("http://") and not url.startswith("https://"):
        # If it's relative
        url = "https://" + url

    # Remove HTML escapes in JSON variables
    url = url.replace("\\/", "/")
    url = url.replace("&amp;", "&")

    # Regular expressions to strip thumbnail qualifiers:
    # Example: .jpg_300x300.jpg -> .jpg
    # Example: .png_60x60.webp -> .png
    # Example: .jpg_q80.jpg -> .jpg
    # Example: .jpg_.webp -> .jpg
    url = re.sub(
        r'(\.jpg|\.png|\.webp|\.gif|\.jpeg|\.jfif|._)_(?:60x60|80x80|100x100|220x220|300x300|640x640|q\d+|cib|xz|max|sum|copy)?\.(?:jpg|png|webp|gif|jpeg|jfif)',
        r'\1',
        url,
        flags=re.IGNORECASE
    )
    
    # Remove webp converts: .jpg_.webp -> .jpg
    url = re.sub(r'(\.jpg|\.png|\.jpeg|\.gif|\.jfif)_\.webp$', r'\1', url, flags=re.IGNORECASE)
    
    # Strip any trailing query parameters like image compression
    if "?" in url:
        url = url.split("?")[0]
        
    return url

def extract_images_from_html(html: str) -> Set[str]:
    """
    Parses HTML content to find all image elements and script variables.
    Normalizes all extracted URLs and filters duplicates.
    """
    extracted_urls = set()
    soup = BeautifulSoup(html, "lxml")
    
    # 1. Parse standard HTML tag sources
    img_attrs = ['src', 'data-src', 'lazy-src', 'original-src', 'data-lazyload-src', 'data-original', 'data-lazy-src']
    for img in soup.find_all(['img', 'source']):
        for attr in img_attrs:
            val = img.get(attr)
            if val:
                extracted_urls.add(val)
        
        # Check srcset
        srcset = img.get('srcset')
        if srcset:
            # Format: url1 1x, url2 2x
            parts = srcset.split(',')
            for part in parts:
                clean_part = part.strip().split(' ')[0]
                if clean_part:
                    extracted_urls.add(clean_part)

    # 2. Parse links that point directly to image files
    for a in soup.find_all('a', href=True):
        href = a['href']
        if re.search(r'\.(jpg|png|webp|jpeg|gif)(?:_|$)', href, re.IGNORECASE):
            extracted_urls.add(href)

    # 3. Parse embedded JSON structures and javascript variables in <script> tags
    script_regex = re.compile(
        r'(?:https?:)?//[a-zA-Z0-9\.\-_]+\.alicdn\.com/img/ibank/[a-zA-Z0-9\.\-_/!!]+(?:\.jpg|\.png|\.webp|\.jpeg|\.gif)(?:_[a-zA-Z0-9\.\-_]+)?',
        re.IGNORECASE
    )
    
    for script in soup.find_all('script'):
        if script.string:
            # Direct regex match for alicdn image structures
            matches = script_regex.findall(script.string)
            for m in matches:
                extracted_urls.add(m)
                
            # Search for specific common JSON structure keys containing URLs
            # e.g., "url":"...", "image":"...", "original":"..."
            json_url_pattern = re.compile(r'"(?:url|image|original|imgUrl|img|mainImage)"\s*:\s*"([^"]+)"')
            json_matches = json_url_pattern.findall(script.string)
            for jm in json_matches:
                if "alicdn.com" in jm:
                    extracted_urls.add(jm)

    # 4. Clean and normalize all extracted URLs
    normalized_urls = set()
    for u in extracted_urls:
        normalized = normalize_url(u)
        # Filter out invalid structures and trackers
        if normalized and "alicdn.com" in normalized and not normalized.endswith(".js") and not normalized.endswith(".css"):
            normalized_urls.add(normalized)
            
    return normalized_urls

def extract_title(html: str) -> str:
    """
    Extracts the product title from HTML metadata to name the output folder.
    """
    soup = BeautifulSoup(html, "lxml")
    
    # Try different selectors for 1688 titles
    title = ""
    title_tag = soup.find('h1', class_='d-title')
    if title_tag:
        title = title_tag.get_text()
    
    if not title:
        title_meta = soup.find('meta', property='og:title')
        if title_meta:
            title = title_meta.get('content')
            
    if not title:
        title_tag = soup.find('title')
        if title_tag:
            title = title_tag.get_text()
            
    if not title:
        title = "1688-Product"
        
    # Clean file name invalid characters
    title = re.sub(r'[\/:*?"<>|]', '_', title)
    return title.strip()

async def fetch_page_dynamic(url: str) -> str:
    """
    Uses Playwright fallback to render Javascript and scroll down the page
    to trigger lazy-loaded images (e.g., product detail images).
    """
    if not PLAYWRIGHT_AVAILABLE:
        logger.error("Cannot perform dynamic page fetching because Playwright is not installed.")
        raise RuntimeError("Playwright is missing.")

    logger.info(f"Launching Playwright to render: {url}")
    async with async_playwright() as p:
        # Launch browser in headless mode
        browser = await p.chromium.launch(headless=True)
        # Create a realistic user agent
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        
        # Go to the page and wait for loading
        await page.goto(url, wait_until="domcontentloaded", timeout=60000)
        
        # 1688 pages frequently trigger a slide-verification/login prompt.
        # We wait briefly for standard detail layouts
        await page.wait_for_timeout(3000)
        
        logger.info("Scrolling page down to trigger lazy loading...")
        # Gradually scroll down the page
        for i in range(10):
            await page.evaluate(f"window.scrollBy(0, window.innerHeight * {i})")
            await page.wait_for_timeout(400)
            
        # Scroll to bottom
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await page.wait_for_timeout(1000)
        
        html = await page.content()
        await browser.close()
        return html
