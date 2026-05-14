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

    // Отправляем данные созданного пользователя (кроме пароля)
    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user: newUser.rows[0],
    });
  } catch (err) {
    console.error('Ошибка регистрации:', err.message);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;