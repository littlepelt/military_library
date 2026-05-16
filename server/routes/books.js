const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const { authenticateToken, requireAdmin} = require('../middleware/auth');

// Middleware проверки авторизации (вынесем для удобства)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  if (!token) {
    return res.status(401).json({ error: 'Требуется токен авторизации' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Неверный или просроченный токен' });
    }
    req.user = user; // добавляем данные пользователя в запрос
    next();
  });
};

// Получить все книги
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT books.*, users.username, users.full_name FROM books LEFT JOIN users ON books.added_by = users.id ORDER BY books.created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка получения книг:', err.message);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Добавить книгу (только авторизованные)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, author, description, category, file_url } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Название книги обязательно' });
    }
    const newBook = await pool.query(
      `INSERT INTO books (title, author, description, category, file_url, added_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, author || null, description || null, category || null, file_url || null, req.user.id]
    );
    // Присоединяем имя пользователя для ответа (как в GET)
    const bookWithUser = await pool.query(
      'SELECT books.*, users.username, users.full_name FROM books LEFT JOIN users ON books.added_by = users.id WHERE books.id = $1',
      [newBook.rows[0].id]
    );
    res.status(201).json(bookWithUser.rows[0]);
  } catch (err) {
    console.error('Ошибка добавления книги:', err.message);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// DELETE /api/books/:id (только admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM books WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Книга не найдена' });
    }
    res.json({ message: 'Книга успешно удалена' });
  } catch (err) {
    console.error('Ошибка удаления книги:', err.message);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;