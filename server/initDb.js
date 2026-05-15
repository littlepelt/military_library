// initDb.js
const pool = require('./db');

const createTables = async () => {
  // Таблица пользователей
  const usersQuery = `
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

  // Таблица книг/документов
  const booksQuery = `
    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255),
      description TEXT,
      category VARCHAR(100),
      file_url TEXT,
      added_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(usersQuery);
    console.log('✅ Таблица users создана или уже существует.');
    await pool.query(booksQuery);
    console.log('✅ Таблица books создана или уже существует.');
  } catch (err) {
    console.error('❌ Ошибка создания таблиц:', err.message);
  }
};

module.exports = createTables;