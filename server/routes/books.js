const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // папка uploads в корне server
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// Получить все книги
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT books.*, users.username, users.full_name
       FROM books LEFT JOIN users ON books.added_by = users.id
       ORDER BY books.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка получения книг:', err.message);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Добавить книгу (с загрузкой обложки и файла книги)
router.post('/', authenticateToken, upload.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'file', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, author, description, category } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Название книги обязательно' });
    }

    // URL для загруженных файлов
    let cover_url = null;
    let file_url = null;
    if (req.files?.cover?.length > 0) {
      cover_url = `https://${req.get('host')}/uploads/${req.files.cover[0].filename}`;    }
    if (req.files?.file?.length > 0) {
      file_url = `https://${req.get('host')}/uploads/${req.files.file[0].filename}`;
    }

    const newBook = await pool.query(
      `INSERT INTO books (title, author, description, category, cover_url, file_url, added_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, author || null, description || null, category || null, cover_url, file_url, req.user.id]
    );

    const bookWithUser = await pool.query(
      `SELECT books.*, users.username, users.full_name
       FROM books LEFT JOIN users ON books.added_by = users.id
       WHERE books.id = $1`,
      [newBook.rows[0].id]
    );
    res.status(201).json(bookWithUser.rows[0]);
  } catch (err) {
    console.error('Ошибка добавления книги:', err.message);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Удалить книгу (admin)
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

// Статус лайка для книги
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
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const userLike = await pool.query('SELECT 1 FROM likes WHERE user_id = $1 AND book_id = $2', [decoded.id, id]);
          liked = userLike.rows.length > 0;
        } catch (e) { /* невалидный токен */ }
      }
    }
    res.json({ likes, liked });
  } catch (err) {
    console.error('Ошибка получения лайков:', err);
    res.status(500).json({ error: 'Ошибка получения лайков' });
  }
});

// Переключить лайк
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

module.exports = router;