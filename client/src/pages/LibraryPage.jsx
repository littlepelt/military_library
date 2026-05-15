import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

function LibraryPage() {
  const { user, logout } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Поля формы
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [addMessage, setAddMessage] = useState('');

  // Загрузка списка книг
  const fetchBooks = async () => {
    try {
      const response = await api.get('/api/books');
      setBooks(response.data);
    } catch (err) {
      setError('Не удалось загрузить список книг');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Добавление книги
  const handleAddBook = async (e) => {
    e.preventDefault();
    setAddMessage('');
    if (!title.trim()) {
      setAddMessage('Название книги обязательно');
      return;
    }
    try {
      await api.post('/api/books', {
        title,
        author,
        description,
        category,
        file_url: fileUrl,
      });
      // Очищаем поля
      setTitle('');
      setAuthor('');
      setDescription('');
      setCategory('');
      setFileUrl('');
      setAddMessage('Книга успешно добавлена!');
      // Перезагружаем список
      fetchBooks();
    } catch (err) {
      setAddMessage(err.response?.data?.error || 'Ошибка при добавлении книги');
    }
  };

  if (loading) return <div>Загрузка библиотеки...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <h2>Военная библиотека</h2>
      <p>Добро пожаловать, {user?.full_name || user?.username}!</p>
      <button onClick={logout} style={{ marginBottom: '2rem' }}>Выйти</button>

      {/* Форма добавления книги */}
      <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '2rem' }}>
        <h3>Добавить книгу или документ</h3>
        <form onSubmit={handleAddBook}>
          <div>
            <label>Название *:</label><br />
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: '100%' }} />
          </div>
          <div>
            <label>Автор:</label><br />
            <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div>
            <label>Описание:</label><br />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3" style={{ width: '100%' }} />
          </div>
          <div>
            <label>Категория:</label><br />
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Устав, приказ, учение..." style={{ width: '100%' }} />
          </div>
          <div>
            <label>Ссылка на файл (URL):</label><br />
            <input type="text" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} style={{ width: '100%' }} />
          </div>
          <button type="submit" style={{ marginTop: '0.5rem' }}>Добавить</button>
          {addMessage && <p style={{ color: addMessage.includes('успешно') ? 'green' : 'red' }}>{addMessage}</p>}
        </form>
      </div>

      {/* Список книг */}
      <h3>Список документов</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {books.length === 0 ? (
        <p>Пока нет ни одной книги.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {books.map((book) => (
            <li key={book.id} style={{ border: '1px solid #ddd', margin: '0.5rem 0', padding: '0.75rem' }}>
              <strong>{book.title}</strong> {book.author && `— ${book.author}`}
              <div style={{ fontSize: '0.9rem', color: '#555' }}>
                {book.description && <p>{book.description}</p>}
                {book.category && <span>Категория: {book.category} | </span>}
                {book.file_url && <a href={book.file_url} target="_blank" rel="noopener noreferrer">Скачать/открыть</a>}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#888' }}>
                Добавил: {book.full_name || book.username} {new Date(book.created_at).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LibraryPage;