import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import BookItem from '../components/BookItem';

function LibraryPage() {
  const { user, logout } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [addMessage, setAddMessage] = useState('');

  const handleDeleteBook = (deletedId) => {
  setBooks(prevBooks => prevBooks.filter(b => b.id !== deletedId));
  }; 

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
      setTitle('');
      setAuthor('');
      setDescription('');
      setCategory('');
      setFileUrl('');
      setAddMessage('Книга успешно добавлена!');
      fetchBooks();
    } catch (err) {
      setAddMessage(err.response?.data?.error || 'Ошибка при добавлении книги');
    }
  };

  if (loading) return <div className="container">Загрузка библиотеки...</div>;

  return (
    <div className="container">
      <h2>Военная библиотека</h2>
      <p style={{ marginBottom: '1rem' }}>Добро пожаловать, {user?.full_name || user?.username}!</p>
      <button onClick={logout} style={{ marginBottom: '2rem' }}>Выйти</button>

      <div className="card">
        <h3>Добавить книгу или документ</h3>
        <form onSubmit={handleAddBook}>
          <div>
            <label>Название *:</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label>Автор:</label>
            <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
          <div>
            <label>Описание:</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3" />
          </div>
          <div>
            <label>Категория:</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Устав, приказ, учение..." />
          </div>
          <div>
            <label>Ссылка на файл (URL):</label>
            <input type="text" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
          </div>
          <button type="submit">Добавить</button>
          {addMessage && <p className={addMessage.includes('успешно') ? 'success' : 'error'} style={{ marginTop: '0.5rem' }}>{addMessage}</p>}
        </form>
      </div>

      <div className="card">
        <h3>Список документов</h3>
        {error && <p className="error">{error}</p>}
        {books.length === 0 ? (
        <p>Пока нет ни одной книги.</p>
        ) : (
         books.map((book) => (
        <BookItem key={book.id} book={book} onDeleteBook={handleDeleteBook} />
        ))
      )}
      </div>
    </div>
  );
}

export default LibraryPage;