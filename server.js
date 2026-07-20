// server.js
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const db = require('./database');
const pipeline = require('./pipeline');
const cjApi = require('./cjApi');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serving static files if needed
app.use(express.static(path.join(__dirname, 'public')));

// Utility to wrap query parameter parsing
function parsePagination(query) {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 12;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

// 1. Dashboard statistics
app.get('/api/stats', async (req, res) => {
  try {
    const totalRow = await db.get('SELECT COUNT(*) as count FROM products');
    const approvedRow = await db.get("SELECT COUNT(*) as count FROM products WHERE status = 'approved'");
    const pendingRow = await db.get("SELECT COUNT(*) as count FROM products WHERE status = 'pending'");
    const failedRow = await db.get("SELECT COUNT(*) as count FROM products WHERE status = 'failed'");
    const rasmXatosiRow = await db.get("SELECT COUNT(*) as count FROM products WHERE status = 'rasm_xatosi'");
    const outOfStockRow = await db.get("SELECT COUNT(*) as count FROM products WHERE stock_status = 'outofstock'");

    const settings = await db.getSettings();
    const EXCHANGE_RATE = parseFloat(settings.EXCHANGE_RATE) || 1820;
    const MARKUP_PERCENTAGE = parseFloat(settings.MARKUP_PERCENTAGE) || 0.25;

    res.json({
      total: totalRow.count,
      approved: approvedRow.count,
      pending: pendingRow.count,
      failed: failedRow.count,
      rasm_xatosi: rasmXatosiRow.count,
      outofstock: outOfStockRow.count,
      exchange_rate: EXCHANGE_RATE,
      markup: `${MARKUP_PERCENTAGE * 100}%`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Fetch products (catalog & admin view)
app.get('/api/products', async (req, res) => {
  try {
    const { category, status, search, moq } = req.query;
    const { page, limit, offset } = parsePagination(req.query);

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (name_uz LIKE ? OR name_original LIKE ? OR source_id LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    if (moq) {
      query += ' AND moq <= ?';
      params.push(parseInt(moq, 10));
    }

    // Count total matching rows
    const countQuery = query.replace('SELECT * FROM products', 'SELECT COUNT(*) as count FROM products');
    const totalResult = await db.get(countQuery, params);
    const total = totalResult.count;

    // Get paginated results
    query += ' ORDER BY last_synced_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = await db.all(query, params);

    // Parse image JSON strings
    const products = rows.map(row => ({
      ...row,
      images: JSON.parse(row.images || '[]')
    }));

    res.json({
      products,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Fetch categories list
app.get('/api/categories', (req, res) => {
  // Return predefined categories instead of reading from seedData
  res.json([
    { id: "TB_CAT_1", name_uz: "Elektronika va aksessuarlar" },
    { id: "TB_CAT_2", name_uz: "Kiyim-kechak (ayollar)" },
    { id: "TB_CAT_3", name_uz: "Kiyim-kechak (erkaklar)" },
    { id: "TB_CAT_4", name_uz: "Uy va ro'zg'or buyumlari" },
    { id: "TB_CAT_5", name_uz: "Go'zallik va gigiyena" },
    { id: "TB_CAT_6", name_uz: "Bolalar dunyosi" },
    { id: "TB_CAT_7", name_uz: "Sport va faol dam olish" },
    { id: "TB_CAT_8", name_uz: "Avto aksessuarlar" },
    { id: "TB_CAT_9", name_uz: "Boshqa / mavsumiy" }
  ]);
});

// 4. Fetch single product details with its validation logs
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    product.images = JSON.parse(product.images || '[]');

    // Fetch logs if the product has failed validation
    const logs = await db.all('SELECT * FROM validation_logs WHERE product_id = ? ORDER BY timestamp DESC', [product.id]);

    res.json({ product, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Update/Edit product details (Admin review action)
app.put('/api/products/:id', async (req, res) => {
  try {
    const { name_uz, description_uz, category, price_cny, moq, stock_status } = req.body;
    const { id } = req.params;

    const existing = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Calculate UZS price based on updated CNY price
    const cnyVal = parseFloat(price_cny) || existing.price_cny;
    const deliveryFeeCny = 2; // Flat delivery
    const costInCny = cnyVal + deliveryFeeCny;
    
    const settings = await db.getSettings();
    const EXCHANGE_RATE = parseFloat(settings.EXCHANGE_RATE) || 1820;
    const MARKUP_PERCENTAGE = parseFloat(settings.MARKUP_PERCENTAGE) || 0.25;
    
    const rawUzs = costInCny * EXCHANGE_RATE * (1 + MARKUP_PERCENTAGE);
    const priceUzs = Math.round(rawUzs / 100) * 100;

    const updated = {
      id,
      source_id: existing.source_id,
      name_original: existing.name_original,
      name_uz: name_uz !== undefined ? name_uz : existing.name_uz,
      description_uz: description_uz !== undefined ? description_uz : existing.description_uz,
      category: category !== undefined ? category : existing.category,
      price_cny: cnyVal,
      price_uzs: priceUzs,
      images: JSON.parse(existing.images || '[]'),
      main_image: existing.main_image,
      stock_status: stock_status !== undefined ? stock_status : existing.stock_status,
      rating: existing.rating,
      moq: moq !== undefined ? parseInt(moq, 10) : existing.moq,
      last_synced_at: new Date().toISOString()
    };

    // Re-validate product after edit
    const errors = pipeline.validateProduct(updated);
    await db.clearValidationLogs(id);

    if (errors.length > 0) {
      updated.status = 'failed';
      // Save errors
      for (const err of errors) {
        await db.logValidationError(id, updated.source_id, err);
      }
    } else {
      updated.status = 'approved';
    }

    await db.saveProduct(updated);

    res.json({
      success: true,
      product: {
        ...updated,
        images: updated.images
      },
      errors
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Manually approve a product
app.post('/api/products/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await db.run("UPDATE products SET status = 'approved' WHERE id = ?", [id]);
    await db.clearValidationLogs(id);

    res.json({ success: true, message: 'Product manually approved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Get global validation error logs (Admin overview)
app.get('/api/validation-logs', async (req, res) => {
  try {
    const logs = await db.all(`
      SELECT l.*, p.name_uz, p.name_original 
      FROM validation_logs l
      LEFT JOIN products p ON l.product_id = p.id
      ORDER BY l.timestamp DESC
      LIMIT 100
    `);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Trigger manual sync or seeding
app.post('/api/sync', async (req, res) => {
  try {
    // Default: 'update' (simulates a daily check for price changes and stock availability)
    console.log('Admin triggered daily check updates...');
    const products = await db.all('SELECT * FROM products');
    const updatedProducts = [];

    for (const p of products) {
      const images = JSON.parse(p.images || '[]');
      
      // Simulate minor price fluctuation (+/- 2%)
      const priceMultiplier = 0.98 + Math.random() * 0.04;
      const newPriceCny = parseFloat((p.price_cny * priceMultiplier).toFixed(2));

      // Simulate stock changes (10% chance to toggle stock state)
      let stock = p.stock_status;
      if (Math.random() < 0.10) {
        stock = stock === 'instock' ? 'outofstock' : 'instock';
      }

      updatedProducts.push({
        id: p.id,
        source_id: p.source_id,
        name_original: p.name_original,
        name_uz: p.name_uz,
        description_uz: p.description_uz,
        category: p.category,
        price_cny: newPriceCny,
        images: images,
        main_image: p.main_image,
        stock_status: stock,
        rating: p.rating,
        moq: p.moq,
        // keep status unchanged if we are just updating prices, but pipeline will re-validate it
      });
    }

    const result = await pipeline.runImportPipeline(updatedProducts);
    res.json({ success: true, message: 'Sync process completed', stats: result.stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Taobao Aggregator API Sync endpoint
app.post('/api/sync/taobao', async (req, res) => {
  console.log('[API] Starting Taobao Dropshipping Aggregator Sync...');
  try {
    // Fetch products from Taobao aggregator (using our toggleable client)
    const response = await cjApi.fetchTaobaoProducts('', 1, 10);
    
    if (response.success && response.products.length > 0) {
      // Run raw retrieved products through our pipeline (translates names, downloads images, converts WebP, saves to DB)
      const result = await pipeline.runImportPipeline(response.products);
      res.json({ success: true, message: 'Taobao sync completed', stats: result.stats });
    } else {
      res.json({ success: true, message: 'No Taobao products found or API offline', stats: { approved: 0, pending: 0, failed: 0 } });
    }
  } catch (err) {
    console.error('[API Error] Taobao Sync failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 10. Settings Endpoints
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await db.getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const { EXCHANGE_RATE, MARKUP_PERCENTAGE } = req.body;
    if (EXCHANGE_RATE !== undefined) {
      await db.saveSetting('EXCHANGE_RATE', String(EXCHANGE_RATE));
    }
    if (MARKUP_PERCENTAGE !== undefined) {
      await db.saveSetting('MARKUP_PERCENTAGE', String(MARKUP_PERCENTAGE));
    }
    res.json({ success: true, message: 'Settings updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Self-initializing server
async function startServer() {
  try {
    // Check if db table has products
    await db.initDb(false);
    const checkProducts = await db.get('SELECT COUNT(*) as count FROM products');
    console.log(`Database has ${checkProducts.count} products.`);

    app.listen(PORT, () => {
      console.log(`NB Market backend running on http://localhost:${PORT}`);
    });
    
    // Start the 24-hour image health check cron job
    startImageHealthCheckCron();
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

// 24-Hour Cron Job: verify all stored local WebP images exist and work
function startImageHealthCheckCron() {
  const fs = require('fs');
  const path = require('path');
  
  // Set interval to run every 24 hours
  setInterval(async () => {
    console.log('[CRON] Starting 24-hour image health check job...');
    try {
      const products = await db.all("SELECT id, source_id, images, status FROM products");
      const imagesDir = path.resolve(__dirname, 'public', 'images');
      let missingCount = 0;

      for (const prod of products) {
        if (!prod.images) continue;
        const images = JSON.parse(prod.images);
        let hasMissing = false;

        for (const imgPath of images) {
          // If it is a local proxy image (starts with /images/)
          if (imgPath.startsWith('/images/')) {
            const localFile = path.join(imagesDir, path.basename(imgPath));
            if (!fs.existsSync(localFile)) {
              console.warn(`[CRON Warning] Missing local image file: ${localFile} for product ${prod.id}`);
              hasMissing = true;
              missingCount++;
            }
          }
        }

        // If product is approved but missing local files, flag it as 'rasm_xatosi'
        if (hasMissing && prod.status === 'approved') {
          await db.run("UPDATE products SET status = 'rasm_xatosi' WHERE id = ?", [prod.id]);
          await db.logValidationError(
            prod.id, 
            prod.source_id, 
            `[CRON] Local image resource files are missing or deleted`
          );
        }
      }
      console.log(`[CRON] Health check finished. Missing local images flagged: ${missingCount}`);
    } catch (e) {
      console.error('[CRON Error] Failed to run image health checks:', e);
    }
  }, 1000 * 60 * 60 * 24); // 24 hours
  
  console.log('[CRON] 24-Hour image verification cron scheduler initialized.');
}

if (process.env.VERCEL) {
  // Export app for Vercel serverless execution
  module.exports = app;
} else {
  // Start server locally
  startServer();
}
