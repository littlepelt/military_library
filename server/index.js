const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Разрешаем запросы от фронтенда
app.use(cors());
// Учим сервер понимать JSON в теле запросов
app.use(express.json());

// Тестовый маршрут, просто чтобы проверить работу
app.get('/', (req, res) => {
  res.send('Сервер работает! Добро пожаловать в военную библиотеку.');
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});