// pipeline.js
// Handles translation simulation, price conversion, checklist validation, and database storage.

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const db = require('./database');

const DELIVERY_FEE_CNY = 2; // Flat 2 CNY delivery fee per item

// Ensure public/images directory exists for proxy storage
const imagesDir = path.resolve(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Downloads image with Referer headers, converts to WebP, and retries 3 times on failure
async function downloadAndConvertImage(url, sourceId, index, retries = 3, delayMs = 2000) {
  if (!url) return null;
  if (url.startsWith('data:')) return url; // Skip base64 placeholders

  if (url.startsWith('//')) {
    url = 'https:' + url;
  }

  const crypto = require('crypto');
  const hash = crypto.createHash('md5').update(url).digest('hex');
  const outputFilename = `${hash}.webp`;
  const outputPath = path.join(imagesDir, outputFilename);
  const localUrlPath = `/images/${outputFilename}`;

  // If already cached locally, return the local link directly
  if (fs.existsSync(outputPath)) {
    return localUrlPath;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.taobao.com/'
        },
        signal: AbortSignal.timeout(10000) // 10 seconds request timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Verify and convert image bytes to WebP format
      await sharp(buffer)
        .webp({ quality: 85 })
        .toFile(outputPath);

      return localUrlPath;
    } catch (err) {
      console.warn(`[Image Download] Attempt ${attempt} failed for: ${url}. Error: ${err.message}`);
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        // Detailed console logging on final failure as requested
        console.error(`[ERROR] Image download failed after ${retries} attempts:`);
        console.error(`  Product Source ID: ${sourceId}`);
        console.error(`  Image URL: ${url}`);
        console.error(`  Error: ${err.message}`);
        throw err;
      }
    }
  }
}


// Checks if string contains Cyrillic characters
function containsCyrillic(str) {
  const cyrillicRegex = /[\u0400-\u04FF]/;
  return cyrillicRegex.test(str);
}

// Simple validation function following the Pre-launch checklist
function validateProduct(p) {
  // We no longer auto-populate with SVGs to ensure 'rasm_xatosi' logic triggers correctly.
  
  const errors = [];

  // 1. name_uz check
  if (!p.name_uz || p.name_uz.trim().length === 0) {
    errors.push('O\'zbekcha nomi bo\'sh bo\'lishi mumkin emas');
  } else {
    const wordCount = p.name_uz.trim().split(/\s+/).length;
    if (wordCount <= 5) {
      errors.push(`O'zbekcha nomi juda qisqa (${wordCount} ta so'z). Kamida 6 ta so'z bo'lishi kerak`);
    }
    if (containsCyrillic(p.name_uz)) {
      errors.push('O\'zbekcha nomida kirill alifbosi aralashgan. Faqat lotin alifbosi ruxsat etiladi');
    }
  }

  // 2. description_uz check
  if (!p.description_uz || p.description_uz.trim().length === 0) {
    errors.push('Tavsif bo\'sh bo\'lishi mumkin emas');
  } else {
    const wordCount = p.description_uz.trim().split(/\s+/).length;
    if (wordCount < 40) {
      errors.push(`Tavsif matni juda qisqa (${wordCount} ta so'z). Kamida 40 ta so'z bo'lishi kerak`);
    }
    if (containsCyrillic(p.description_uz)) {
      errors.push('Tavsifda kirill alifbosi aralashgan. Faqat lotin alifbosi ruxsat etiladi');
    }
  }

  // 3. Images check
  if (!p.images || !Array.isArray(p.images) || p.images.length < 3) {
    errors.push(`Kamida 3 ta mahsulot rasmi bo'lishi shart (Hozirgi soni: ${p.images ? p.images.length : 0})`);
  }

  // 4. Price check
  if (p.price_cny <= 0) {
    errors.push('Xitoy yuanidagi (CNY) narxi 0 dan katta bo\'lishi shart');
  }
  if (!p.price_uzs || p.price_uzs <= 0) {
    errors.push('O\'zbek so\'midagi (UZS) yakuniy hisoblangan narxi 0 dan katta bo\'lishi shart');
  }

  // 5. Category check
  const categoryNames = [
    "Elektronika va aksessuarlar",
    "Kiyim-kechak (ayollar)",
    "Kiyim-kechak (erkaklar)",
    "Uy va ro'zg'or buyumlari",
    "Go'zallik va gigiyena",
    "Bolalar dunyosi",
    "Sport va faol dam olish",
    "Avto aksessuarlar",
    "Boshqa / mavsumiy"
  ];
  if (!p.category || !categoryNames.includes(p.category)) {
    errors.push(`Kategoriya noto'g'ri yoki tanlanmagan: "${p.category}"`);
  }

  // 6. Forbidden words check
  const forbiddenWords = ['shubhali', 'soxta', 'fake', 'original emas', 'yomon', 'musor'];
  const contentToSearch = `${p.name_uz} ${p.description_uz}`.toLowerCase();
  forbiddenWords.forEach(word => {
    if (contentToSearch.includes(word)) {
      errors.push(`Taqiqlangan so'z aniqlandi: "${word}"`);
    }
  });

  return errors;
}

// Runs the pipeline processing for a list of raw products
async function runImportPipeline(rawProducts) {
  console.log(`Pipeline starting for ${rawProducts.length} items...`);
  
  let successCount = 0;
  let failedCount = 0;
  let pendingCount = 0;

  const settings = await db.getSettings();
  const EXCHANGE_RATE = parseFloat(settings.EXCHANGE_RATE) || 1820;
  const MARKUP_PERCENTAGE = parseFloat(settings.MARKUP_PERCENTAGE) || 0.25;

  for (const raw of rawProducts) {
    // 1. Price conversion
    const baseCny = raw.price_cny;
    let priceUzs = 0;

    if (baseCny > 0) {
      // Yakuniy narx = (asl narx + yetkazib berish) * kurs + ustama (25%)
      const costInCny = baseCny + DELIVERY_FEE_CNY;
      const rawUzs = costInCny * EXCHANGE_RATE * (1 + MARKUP_PERCENTAGE);
      // Round to nearest 100 UZS
      priceUzs = Math.round(rawUzs / 100) * 100;
    }

    // Download and convert images locally, handling retries and errors
    let finalImages = [];
    let imageErrors = [];

    if (raw.images && Array.isArray(raw.images)) {
      for (let idx = 0; idx < raw.images.length; idx++) {
        const imgUrl = raw.images[idx];
        try {
          const localUrlPath = await downloadAndConvertImage(imgUrl, raw.source_id, idx + 1);
          if (localUrlPath) {
            finalImages.push(localUrlPath);
          }
        } catch (err) {
          imageErrors.push(`Rasm yuklashda xatolik: URL="${imgUrl}" (${err.message})`);
        }
      }
    }

    const processedProduct = {
      id: raw.id,
      source_id: raw.source_id,
      name_original: raw.name_original,
      name_uz: raw.name_uz,
      description_uz: raw.description_uz,
      category: raw.category,
      price_cny: baseCny,
      price_uzs: priceUzs,
      images: finalImages,
      main_image: finalImages.length > 0 ? finalImages[0] : '',
      stock_status: raw.stock_status || 'instock',
      rating: raw.rating || 0.0,
      moq: raw.moq || 1,
      last_synced_at: new Date().toISOString()
    };

    // 2. Validate product
    const validationErrors = validateProduct(processedProduct);
    
    // Clear old validation logs first
    await db.clearValidationLogs(processedProduct.id);

    // If image downloads failed, flag with status 'rasm_xatosi'
    if (imageErrors.length > 0) {
      processedProduct.status = 'rasm_xatosi';
      failedCount++;
      
      // Save product with whatever images succeeded or empty
      await db.saveProduct(processedProduct);

      // Log download errors
      for (const err of imageErrors) {
        await db.logValidationError(processedProduct.id, processedProduct.source_id, err);
      }
      // Also log standard validation errors
      for (const err of validationErrors) {
        await db.logValidationError(processedProduct.id, processedProduct.source_id, err);
      }
    } else if (validationErrors.length > 0) {
      processedProduct.status = 'failed';
      failedCount++;
      
      // Save product in database
      await db.saveProduct(processedProduct);

      // Log all validation errors
      for (const err of validationErrors) {
        await db.logValidationError(processedProduct.id, processedProduct.source_id, err);
      }
    } else {
      // If validation passes, we can set it to approved, but let's randomly set a few to 'pending'
      // so the user has products in the "Pending Review" queue in the admin dashboard.
      // e.g. 15% of valid products go to 'pending', the rest directly to 'approved'.
      const rand = Math.random();
      if (rand < 0.15) {
        processedProduct.status = 'pending';
        pendingCount++;
      } else {
        processedProduct.status = 'approved';
        successCount++;
      }

      await db.saveProduct(processedProduct);
    }
  }

  console.log(`Pipeline complete. Approved: ${successCount}, Pending: ${pendingCount}, Failed: ${failedCount}`);
  return {
    success: true,
    stats: {
      approved: successCount,
      pending: pendingCount,
      failed: failedCount
    }
  };
}

module.exports = {
  runImportPipeline,
  validateProduct
};
