const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'market.db');
const db = new sqlite3.Database(dbPath);

// Helper to run query with Promise
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

// Helper to fetch all rows with Promise
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Helper to fetch single row with Promise
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function initDb(force = false) {
  if (force) {
    console.log('Dropping existing tables...');
    await run(`DROP TABLE IF EXISTS products`);
    await run(`DROP TABLE IF EXISTS validation_logs`);
  }

  // Create products table
  await run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      source_id TEXT UNIQUE NOT NULL,
      name_uz TEXT,
      name_original TEXT NOT NULL,
      description_uz TEXT,
      category TEXT NOT NULL,
      price_cny REAL NOT NULL,
      price_uzs REAL,
      images TEXT, -- JSON string array
      main_image TEXT,
      stock_status TEXT DEFAULT 'instock', -- 'instock' | 'outofstock'
      rating REAL,
      moq INTEGER DEFAULT 1,
      status TEXT DEFAULT 'pending', -- 'approved' | 'pending' | 'failed'
      last_synced_at TEXT
    )
  `);

  // Create validation_logs table
  await run(`
    CREATE TABLE IF NOT EXISTS validation_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT,
      source_id TEXT NOT NULL,
      error_message TEXT NOT NULL,
      timestamp TEXT NOT NULL
    )
  `);

  // Create settings table
  await run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  // Initialize default settings if not exist
  const checkSettings = await get(`SELECT COUNT(*) as count FROM settings`);
  if (checkSettings.count === 0) {
    await run(`INSERT INTO settings (key, value) VALUES ('EXCHANGE_RATE', '1820')`);
    await run(`INSERT INTO settings (key, value) VALUES ('MARKUP_PERCENTAGE', '0.25')`);
  }

  console.log('Database tables initialized.');
}

async function saveProduct(p) {
  const imagesJson = JSON.stringify(p.images || []);
  const sql = `
    INSERT INTO products (
      id, source_id, name_uz, name_original, description_uz, 
      category, price_cny, price_uzs, images, main_image, 
      stock_status, rating, moq, status, last_synced_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(source_id) DO UPDATE SET
      name_uz=excluded.name_uz,
      name_original=excluded.name_original,
      description_uz=excluded.description_uz,
      category=excluded.category,
      price_cny=excluded.price_cny,
      price_uzs=excluded.price_uzs,
      images=excluded.images,
      main_image=excluded.main_image,
      stock_status=excluded.stock_status,
      rating=excluded.rating,
      moq=excluded.moq,
      status=excluded.status,
      last_synced_at=excluded.last_synced_at;
  `;
  return run(sql, [
    p.id, p.source_id, p.name_uz, p.name_original, p.description_uz,
    p.category, p.price_cny, p.price_uzs, imagesJson, p.main_image,
    p.stock_status, p.rating, p.moq, p.status, p.last_synced_at
  ]);
}

async function logValidationError(productId, sourceId, errorMessage) {
  const timestamp = new Date().toISOString();
  return run(
    `INSERT INTO validation_logs (product_id, source_id, error_message, timestamp) VALUES (?, ?, ?, ?)`,
    [productId, sourceId, errorMessage, timestamp]
  );
}

async function clearValidationLogs(productId) {
  return run(`DELETE FROM validation_logs WHERE product_id = ?`, [productId]);
}

async function getSettings() {
  const rows = await all('SELECT * FROM settings');
  const config = {};
  for (const row of rows) {
    config[row.key] = row.value;
  }
  return config;
}

async function saveSetting(key, value) {
  return run(`INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`, [key, String(value)]);
}

module.exports = {
  db,
  initDb,
  run,
  all,
  get,
  saveProduct,
  logValidationError,
  clearValidationLogs,
  getSettings,
  saveSetting
};
