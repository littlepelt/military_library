const express = require('express');
const router = express.Router({ mergeParams: true }); // чтобы получать bookId из родительского маршрута
const pool = require('../db');
const jwt = require('jsonwebtoken');
const { authenticateToken, requireAdmin}= require('../middleware/auth')

// GET /api/books/:bookId/comments
router.get('/', async (req, res) => {
  try {
    const { bookId } = req.params;
    const result = await pool.query(
      `SELECT comments.*, users.username, users.full_name, users.rank
       FROM comments
       JOIN users ON comments.user_id = users.id
       WHERE comments.book_id = $1
       ORDER BY comments.created_at ASC`,
      [bookId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка получения комментариев:', err.message);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// POST /api/books/:bookId/comments (требует авторизации)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.params;
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Текст комментария не может быть пустым' });
    }
    // Проверим, существует ли книга
    const bookExists = await pool.query('SELECT id FROM books WHERE id = $1', [bookId]);
    if (bookExists.rows.length === 0) {
      return res.status(404).json({ error: 'Книга не найдена' });
    }
    const newComment = await pool.query(
      `INSERT INTO comments (book_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [bookId, req.user.id, content.trim()]
    );
    // Получаем полные данные с именем пользователя
    const commentWithUser = await pool.query(
      `SELECT comments.*, users.username, users.full_name, users.rank
       FROM comments
       JOIN users ON comments.user_id = users.id
       WHERE comments.id = $1`,
      [newComment.rows[0].id]
    );
    res.status(201).json(commentWithUser.rows[0]);
  } catch (err) {
    console.error('Ошибка добавления комментария:', err.message);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// DELETE /api/books/:bookId/comments/:commentId (только admin)
router.delete('/:commentId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { bookId, commentId } = req.params;
    const result = await pool.query(
      'DELETE FROM comments WHERE id = $1 AND book_id = $2 RETURNING *',
      [commentId, bookId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Комментарий не найден' });
    }
    res.json({ message: 'Комментарий успешно удалён' });
  } catch (err) {
    console.error('Ошибка удаления комментария:', err.message);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;