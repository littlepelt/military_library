const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const { authenticateToken, requireAdmin} = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
// POST /api/books/upload (загрузка обложки)
router.post('/upload', authenticateToken, upload.single('cover'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

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