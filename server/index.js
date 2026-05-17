const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const initDb = require('./initDb');

const app = express();
const port = process.env.PORT || 5000;

// Создаём папку для загрузок, если её нет
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Папка uploads создана');
}

// Middleware
app.use(cors());
app.use(express.json());

// Раздача статических файлов из uploads
app.use('/uploads', express.static(uploadDir));

// Подключаем маршруты
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/books/:bookId/comments', require('./routes/comments'));

// Тестовый маршрут
app.get('/', (req, res) => {
  res.send('Сервер работает! Добро пожаловать в военную библиотеку.');
});

// Инициализация БД и запуск сервера
initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Сервер запущен на порту ${port}`);
    });
  })
  .catch((err) => {
    console.error('Не удалось инициализировать БД:', err);
    process.exit(1);
  });