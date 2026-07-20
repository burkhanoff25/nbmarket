# test_extractor.py
import unittest
from parser import normalize_url, extract_images_from_html, extract_title

class Test1688ImageExtractor(unittest.TestCase):
    
    def test_normalize_url_simple(self):
        # Basic URL prepend
        self.assertEqual(
            normalize_url("//cbu01.alicdn.com/img/ibank/1234.jpg"),
            "https://cbu01.alicdn.com/img/ibank/1234.jpg"
        )
        
    def test_normalize_url_thumbnail_stripping(self):
        # Strips various thumbnail sizes
        self.assertEqual(
            normalize_url("https://cbu01.alicdn.com/img/ibank/2020/123_300x300.jpg_300x300.jpg"),
            "https://cbu01.alicdn.com/img/ibank/2020/123_300x300.jpg"
        )
        self.assertEqual(
            normalize_url("https://cbu01.alicdn.com/img/ibank/2020/abc.jpg_60x60.jpg"),
            "https://cbu01.alicdn.com/img/ibank/2020/abc.jpg"
        )
        self.assertEqual(
            normalize_url("https://cbu01.alicdn.com/img/ibank/2020/img.png_220x220.webp"),
            "https://cbu01.alicdn.com/img/ibank/2020/img.png"
        )
        self.assertEqual(
            normalize_url("https://cbu01.alicdn.com/img/ibank/2020/photo.jpg_q80.jpg"),
            "https://cbu01.alicdn.com/img/ibank/2020/photo.jpg"
        )

    def test_normalize_url_webp_conversion(self):
        # Strips trailing webp extension formats
        self.assertEqual(
            normalize_url("https://cbu01.alicdn.com/img/ibank/img.jpg_.webp"),
            "https://cbu01.alicdn.com/img/ibank/img.jpg"
        )

    def test_normalize_url_query_parameters(self):
        # Strips query strings
        self.assertEqual(
            normalize_url("https://cbu01.alicdn.com/img/ibank/img.jpg?time=12345"),
            "https://cbu01.alicdn.com/img/ibank/img.jpg"
        )

    def test_extract_images_from_html_attributes(self):
        html = """
        <html>
            <body>
                <img src="//cbu01.alicdn.com/img/ibank/img1.jpg_300x300.jpg" />
                <img data-src="https://cbu01.alicdn.com/img/ibank/img2.png_60x60.png" />
                <source srcset="//cbu01.alicdn.com/img/ibank/img3.webp 1x, //cbu01.alicdn.com/img/ibank/img4.webp 2x" />
                <img data-lazyload-src="//cbu01.alicdn.com/img/ibank/img5.jpg_.webp" />
            </body>
        </html>
        """
        urls = extract_images_from_html(html)
        
        self.assertIn("https://cbu01.alicdn.com/img/ibank/img1.jpg", urls)
        self.assertIn("https://cbu01.alicdn.com/img/ibank/img2.png", urls)
        self.assertIn("https://cbu01.alicdn.com/img/ibank/img3.webp", urls)
        self.assertIn("https://cbu01.alicdn.com/img/ibank/img4.webp", urls)
        self.assertIn("https://cbu01.alicdn.com/img/ibank/img5.jpg", urls)
        self.assertEqual(len(urls), 5)

    def test_extract_images_from_javascript(self):
        html = """
        <html>
            <script>
                var detailData = {
                    "imageList": [
                        "//cbu01.alicdn.com/img/ibank/js_img1.jpg_60x60.jpg",
                        "https://cbu01.alicdn.com/img/ibank/js_img2.png_300x300.jpg"
                    ],
                    "mainImage": "https://cbu01.alicdn.com/img/ibank/js_img3.webp"
                };
            </script>
        </html>
        """
        urls = extract_images_from_html(html)
        
        self.assertIn("https://cbu01.alicdn.com/img/ibank/js_img1.jpg", urls)
        self.assertIn("https://cbu01.alicdn.com/img/ibank/js_img2.png", urls)
        self.assertIn("https://cbu01.alicdn.com/img/ibank/js_img3.webp", urls)
        self.assertEqual(len(urls), 3)

    def test_extract_title(self):
        html = """
        <html>
            <head>
                <meta property="og:title" content="1688 Premium Wireless Bluetooth Earphones" />
            </head>
            <body>
                <h1 class="d-title">Earphones Wireless Original</h1>
            </body>
        </html>
        """
        title = extract_title(html)
        self.assertEqual(title, "Earphones Wireless Original")

if __name__ == "__main__":
    unittest.main()
