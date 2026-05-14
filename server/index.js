const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');            // наш модуль подключения
const initDb = require('./initDb');     // инициализация таблиц

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Тестовый маршрут
app.get('/', (req, res) => {
  res.send('Сервер работает! Добро пожаловать в военную библиотеку.');
});

// Запуск сервера после инициализации БД
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