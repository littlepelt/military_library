const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db');   // подключение к БД из родительской папки

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, password, full_name, rank, unit } = req.body;

    // Простейшая проверка обязательных полей
    if (!username || !password) {
      return res.status(400).json({ error: 'Логин и пароль обязательны' });
    }

    // Проверяем, нет ли уже такого пользователя
    const userExists = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    if (userExists.rows.length > 0) {
      return res.status(409).json({ error: 'Пользователь с таким логином уже существует' });
    }

    // Хешируем пароль (10 "раундов" соли)
    const hashedPassword = await bcrypt.hash(password, 10);

       // Вставляем нового пользователя
    const newUser = await pool.query(
      `INSERT INTO users (username, password, full_name, rank, unit)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, full_name, rank, unit, role, created_at`,
      [username, hashedPassword, full_name || null, rank || null, unit || null]
    );

    const user = newUser.rows[0];

    // Создаём токен для нового пользователя
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Отправляем и токен, и данные пользователя
    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      token,
      user,
    });
  } catch (err) {
    console.error('Ошибка регистрации:', err.message);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Проверяем, что оба поля переданы
    if (!username || !password) {
      return res.status(400).json({ error: 'Логин и пароль обязательны' });
    }

    // Ищем пользователя в базе
    const userResult = await pool.query(
      'SELECT id, username, password, full_name, rank, unit, role FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    const user = userResult.rows[0];

    // Сравниваем хеш пароля
    const bcrypt = require('bcrypt');
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    // Создаём токен
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }   // токен действует 24 часа
    );

    // Отправляем токен и данные пользователя (без пароля)
    res.json({
      message: 'Вход выполнен успешно',
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        rank: user.rank,
        unit: user.unit,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Ошибка входа:', err.message);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;