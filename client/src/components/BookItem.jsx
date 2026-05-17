import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

function BookItem({ book, onDeleteBook }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  // Лайки
  const [likeData, setLikeData] = useState({ likes: 0, liked: false });
  const [likeLoading, setLikeLoading] = useState(false);

  const isAdmin = user?.role === 'admin';

  // Загрузка комментариев
  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const response = await api.get(`/api/books/${book.id}/comments`);
      setComments(response.data);
    } catch {
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

  // Статус лайков
  const fetchLikeStatus = async () => {
    try {
      const response = await api.get(`/api/books/${book.id}/like`);
      setLikeData(response.data);
    } catch (err) {
      console.error('Ошибка загрузки лайков:', err);
    }
  };

  useEffect(() => {
    fetchLikeStatus();
  }, [book.id]);

  const handleToggleLike = async () => {
    if (!user) return;
    setLikeLoading(true);
    try {
      const response = await api.post(`/api/books/${book.id}/like`);
      setLikeData((prev) => ({
        likes: response.data.liked ? prev.likes + 1 : prev.likes - 1,
        liked: response.data.liked,
      }));
    } catch (err) {
      console.error('Ошибка переключения лайка:', err);
    } finally {
      setLikeLoading(false);
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      {book.cover_url && (
        <img
          src={book.cover_url}
          alt="Обложка"
          style={{
            width: '100%',
            height: '180px',
            objectFit: 'cover',
            borderRadius: '8px',
            marginBottom: '0.5rem',
          }}
        />
      )}
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: '0 0 0.5rem' }}>{book.title}</h3>
        {book.author && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Автор: {book.author}</p>
        )}
        {book.category && (
          <span
            style={{
              background: 'var(--accent)',
              color: '#fff',
              padding: '0.2rem 0.6rem',
              borderRadius: '12px',
              fontSize: '0.8rem',
            }}
          >
            {book.category}
          </span>
        )}
        {book.description && <p style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>{book.description}</p>}
        {book.file_url && (
          <a href={book.file_url} download rel="noopener noreferrer">📄 Скачать документ</a>
        )}
        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Добавил: {book.full_name || book.username} | {new Date(book.created_at).toLocaleDateString()}
        </div>
      </div>

      <div
        style={{
          marginTop: 'auto',
          borderTop: '1px solid var(--border)',
          paddingTop: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <button onClick={() => setShowComments(!showComments)} className="btn-sm">
          {showComments ? 'Скрыть' : `Обсуждение (${comments.length})`}
        </button>

        <button
          onClick={handleToggleLike}
          disabled={!user || likeLoading}
          className="btn-sm"
          style={{
            background: 'transparent',
            color: likeData.liked ? 'var(--danger)' : 'var(--text-secondary)',
            border: 'none',
            cursor: user ? 'pointer' : 'default',
            fontSize: '1.1rem',
          }}
          title={user ? 'Нравится' : 'Войдите, чтобы оценить'}
        >
          {likeData.liked ? '❤️' : '🤍'} {likeData.likes}
        </button>

        {isAdmin && (
          <button
            onClick={() => {
              if (window.confirm('Удалить книгу?')) {
                onDeleteBook(book.id);
              }
            }}
            className="btn-danger btn-sm"
          >
            Удалить книгу
          </button>
        )}
      </div>

      {showComments && (
        <div style={{ marginTop: '0.5rem', borderLeft: '2px solid var(--border)', paddingLeft: '1rem' }}>
          {loadingComments ? (
            <div>Загрузка...</div>
          ) : (
            comments.map((c) => (
              <div key={c.id} style={{ marginBottom: '0.5rem' }}>
                <strong>{c.full_name || c.username}</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                  {new Date(c.created_at).toLocaleString()}
                </span>
                <p style={{ margin: '0.2rem 0' }}>{c.content}</p>
                {isAdmin && (
                  <button
                    onClick={() => {
                      api.delete(`/api/books/${book.id}/comments/${c.id}`).then(fetchComments);
                    }}
                    className="btn-danger btn-sm"
                  >
                    Удалить
                  </button>
                )}
              </div>
            ))
          )}
          <form onSubmit={handleAddComment} style={{ marginTop: '0.5rem' }}>
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Комментарий..."
              style={{ width: '70%', marginRight: '0.5rem' }}
            />
            <button type="submit" className="btn-sm">
              Отправить
            </button>
            {commentError && <p className="error">{commentError}</p>}
          </form>
        </div>
      )}
    </div>
  );
}

export default BookItem;