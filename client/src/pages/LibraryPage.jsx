import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import BookItem from '../components/BookItem';
import AddBookForm from '../components/AddBookForm';

function LibraryPage() {
  const { user, logout } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [filterCategory, setFilterCategory] = useState('');

  const fetchBooks = async () => {
    try {
      const response = await api.get('/api/books');
      let data = response.data;
      // Применяем фильтр и сортировку на клиенте (можно и на сервере, но для простоты тут)
      if (filterCategory) {
        data = data.filter(b => b.category === filterCategory);
      }
      data.sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'author') return (a.author || '').localeCompare(b.author || '');
        return new Date(b.created_at) - new Date(a.created_at);
      });
      setBooks(data);
    } catch (err) {
      setError('Не удалось загрузить книги');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [sortBy, filterCategory]);

  const handleDeleteBook = (deletedId) => {
    setBooks(prev => prev.filter(b => b.id !== deletedId));
  };

  // Уникальные категории для фильтра
  const categories = [...new Set(books.map(b => b.category).filter(Boolean))];

  if (loading) return <div className="container">Загрузка библиотеки...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>📚 Военная библиотека</h2>
        <div>
          <span style={{ marginRight: '1rem' }}>{user?.full_name || user?.username}</span>
          <button onClick={logout} className="btn-sm">Выйти</button>
        </div>
      </div>

      {/* Панель управления */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => setShowForm(!showForm)}>{showForm ? 'Скрыть форму' : 'Добавить книгу'}</button>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="created_at">Сначала новые</option>
            <option value="title">По названию</option>
            <option value="author">По автору</option>
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">Все категории</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        {showForm && (
          <div style={{ marginTop: '1rem' }}>
            <AddBookForm onBookAdded={() => { fetchBooks(); setShowForm(false); }} />
          </div>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      {/* Сетка книг (полки) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {books.map(book => (
          <BookItem key={book.id} book={book} onDeleteBook={handleDeleteBook} />
        ))}
      </div>
      {books.length === 0 && <p>Пока нет ни одной книги.</p>}
    </div>
  );
}

export default LibraryPage;