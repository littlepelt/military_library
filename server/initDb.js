// initDb.js
const pool = require('./db');

const createTables = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      full_name VARCHAR(100),
      rank VARCHAR(50),
      unit VARCHAR(100),
      role VARCHAR(20) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await pool.query(query);
    console.log('✅ Таблица users создана или уже существует.');
  } catch (err) {
    console.error('❌ Ошибка создания таблицы:', err.message);
  }
};

module.exports = createTables;