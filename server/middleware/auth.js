// server/middleware/auth.js
const jwt = require('jsonwebtoken');

// Проверка JWT (доступ любому авторизованному)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Требуется токен авторизации' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Неверный или просроченный токен' });
    }
    req.user = user;
    next();
  });
}

// Проверка, что роль admin
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Доступ запрещён. Требуются права администратора.' });
  }
}

module.exports = { authenticateToken, requireAdmin };