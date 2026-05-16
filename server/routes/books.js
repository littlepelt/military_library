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

// Получить статус лайка и количество лайков для книги
router.get('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const countResult = await pool.query('SELECT COUNT(*) FROM likes WHERE book_id = $1', [id]);
    const likes = parseInt(countResult.rows[0].count, 10);
    let liked = false;
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const userLike = await pool.query('SELECT 1 FROM likes WHERE user_id = $1 AND book_id = $2', [decoded.id, id]);
          liked = userLike.rows.length > 0;
        } catch (e) { /* невалидный токен – оставляем liked=false */ }
      }
    }
    res.json({ likes, liked });
  } catch (err) {
    console.error('Ошибка получения лайков:', err);
    res.status(500).json({ error: 'Ошибка получения лайков' });
  }
});

// Переключить лайк (только для авторизованных)
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const existing = await pool.query('SELECT 1 FROM likes WHERE user_id = $1 AND book_id = $2', [userId, id]);
    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM likes WHERE user_id = $1 AND book_id = $2', [userId, id]);
      res.json({ liked: false });
    } else {
      await pool.query('INSERT INTO likes (user_id, book_id) VALUES ($1, $2)', [userId, id]);
      res.json({ liked: true });
    }
  } catch (err) {
    console.error('Ошибка переключения лайка:', err);
    res.status(500).json({ error: 'Ошибка переключения лайка' });
  }
});

// ВРЕМЕННЫЙ МАРШРУТ – СОЗДАТЬ ТАБЛИЦУ LIKES (после исправления удалить)
router.post('/create-likes-table', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS likes (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, book_id)
      );
    `);
    res.json({ message: 'Таблица likes успешно создана' });
  } catch (err) {
    console.error('Ошибка при создании таблицы likes:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;