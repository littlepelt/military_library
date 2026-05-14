// db.js
const { Pool } = require('pg');

// Создаём пул соединений, используя строку подключения из переменной окружения
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // для Render PostgreSQL это необходимо
  },
});

module.exports = pool;