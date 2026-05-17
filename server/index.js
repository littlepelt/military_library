const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const initDb = require('./initDb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Раздача загруженных файлов
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Подключаем маршруты
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const booksRoutes = require('./routes/books');
app.use('/api/books', booksRoutes);

const commentsRoutes = require('./routes/comments');
app.use('/api/books/:bookId/comments', commentsRoutes);

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