const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');
const initDb = require('./initDb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(express.json());

const multer = require('multer');
const path = require('path');

// Настройка хранилища для обложек
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });
app.use('/uploads', express.static('uploads'));

// Подключаем маршруты аутентификации
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