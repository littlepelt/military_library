import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

function BookItem({ book }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const response = await api.get(`/api/books/${book.id}/comments`);
      setComments(response.data);
    } catch (err) {
      setCommentError('Не удалось загрузить комментарии');
    } finally {
      setLoadingComments(false);
    }
  };

  // Загружаем комментарии при первом открытии
  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, book.id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    setCommentError('');
    if (!newComment.trim()) {
      setCommentError('Введите текст комментария');
      return;
    }
    try {
      await api.post(`/api/books/${book.id}/comments`, { content: newComment });
      setNewComment('');
      // Перезагружаем комментарии
      fetchComments();
    } catch (err) {
      setCommentError(err.response?.data?.error || 'Ошибка при добавлении комментария');
    }
  };

  return (
    <div style={{ border: '1px solid #ddd', margin: '0.5rem 0', padding: '0.75rem' }}>
      <strong>{book.title}</strong> {book.author && `— ${book.author}`}
      <div style={{ fontSize: '0.9rem', color: '#555' }}>
        {book.description && <p>{book.description}</p>}
        {book.category && <span>Категория: {book.category} | </span>}
        {book.file_url && <a href={book.file_url} target="_blank" rel="noopener noreferrer">Скачать/открыть</a>}
      </div>
      <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>
        Добавил: {book.full_name || book.username} {new Date(book.created_at).toLocaleDateString()}
      </div>

      {/* Блок комментариев */}
      <button onClick={() => setShowComments(!showComments)} style={{ fontSize: '0.85rem' }}>
        {showComments ? 'Скрыть обсуждение' : `Обсуждение (${comments.length})`}
      </button>

      {showComments && (
        <div style={{ marginTop: '0.5rem', borderLeft: '2px solid #ccc', paddingLeft: '1rem' }}>
          {loadingComments ? (
            <div>Загрузка комментариев...</div>
          ) : commentError ? (
            <div style={{ color: 'red' }}>{commentError}</div>
          ) : comments.length === 0 ? (
            <div>Пока нет комментариев.</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {comments.map((c) => (
                <li key={c.id} style={{ marginBottom: '0.5rem' }}>
                  <strong>{c.full_name || c.username}</strong>
                  {c.rank && <span> ({c.rank})</span>}
                  <span style={{ color: '#888', marginLeft: '0.5rem', fontSize: '0.8rem' }}>
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                  <p style={{ margin: '0.25rem 0 0 0' }}>{c.content}</p>
                </li>
              ))}
            </ul>
          )}

          {/* Форма добавления комментария (только для авторизованных) */}
          {user ? (
            <form onSubmit={handleAddComment} style={{ marginTop: '0.5rem' }}>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Добавьте комментарий..."
                style={{ width: '70%', marginRight: '0.5rem' }}
              />
              <button type="submit">Отправить</button>
              {commentError && <p style={{ color: 'red', fontSize: '0.85rem' }}>{commentError}</p>}
            </form>
          ) : (
            <p style={{ fontSize: '0.85rem' }}>Войдите, чтобы комментировать.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default BookItem;