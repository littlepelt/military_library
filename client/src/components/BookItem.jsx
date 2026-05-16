import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

function BookItem({ book, onDeleteBook }) {  // добавили onDeleteBook для обновления списка
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const isAdmin = user?.role === 'admin';

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
      fetchComments();
    } catch (err) {
      setCommentError(err.response?.data?.error || 'Ошибка при добавлении комментария');
    }
  };

  const handleDeleteBook = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить эту книгу?')) return;
    try {
      await api.delete(`/api/books/${book.id}`);
      if (onDeleteBook) onDeleteBook(book.id); // уведомить родительский компонент
    } catch (err) {
      alert(err.response?.data?.error || 'Ошибка при удалении книги');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Удалить этот комментарий?')) return;
    try {
      await api.delete(`/api/books/${book.id}/comments/${commentId}`);
      fetchComments(); // обновить список
    } catch (err) {
      alert(err.response?.data?.error || 'Ошибка при удалении комментария');
    }
  };

  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <strong>{book.title}</strong> {book.author && `— ${book.author}`}
          <div style={{ fontSize: '0.9rem', color: '#555' }}>
            {book.description && <p>{book.description}</p>}
            {book.category && <span>Категория: {book.category} | </span>}
            {book.file_url && <a href={book.file_url} target="_blank" rel="noopener noreferrer">Скачать/открыть</a>}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>
            Добавил: {book.full_name || book.username} | {new Date(book.created_at).toLocaleDateString()}
          </div>
        </div>
        {isAdmin && (
          <button onClick={handleDeleteBook} style={{ background: 'var(--danger)', padding: '0.25rem 0.75rem' }}>
            Удалить книгу
          </button>
        )}
      </div>

      <button onClick={() => setShowComments(!showComments)} style={{ fontSize: '0.85rem', marginRight: '0.5rem' }}>
        {showComments ? 'Скрыть обсуждение' : `Обсуждение (${comments.length})`}
      </button>

      {showComments && (
        <div style={{ marginTop: '0.5rem', borderLeft: '2px solid #ccc', paddingLeft: '1rem' }}>
          {loadingComments ? (
            <div>Загрузка комментариев...</div>
          ) : commentError ? (
            <div className="error">{commentError}</div>
          ) : comments.length === 0 ? (
            <div>Пока нет комментариев.</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {comments.map((c) => (
                <li key={c.id} style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong>{c.full_name || c.username}</strong>
                    {c.rank && <span> ({c.rank})</span>}
                    <span style={{ color: '#888', marginLeft: '0.5rem', fontSize: '0.8rem' }}>
                      {new Date(c.created_at).toLocaleString()}
                    </span>
                    <p style={{ margin: '0.25rem 0 0 0' }}>{c.content}</p>
                  </div>
                  {isAdmin && (
                    <button onClick={() => handleDeleteComment(c.id)} style={{ background: 'var(--danger)', padding: '0.15rem 0.5rem', fontSize: '0.8rem' }}>
                      Удалить
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

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
              {commentError && <p className="error">{commentError}</p>}
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