import { useState } from 'react';
import api from '../api';

function AddBookForm({ onBookAdded }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [bookFile, setBookFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!title.trim()) {
      setError('Название обязательно');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('author', author);
      formData.append('description', description);
      formData.append('category', category);
      if (coverFile) {
        formData.append('cover', coverFile);
      }
      if (bookFile) {
        formData.append('file', bookFile);
      }

      await api.post('/api/books', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage('Книга добавлена!');
      // Очистка полей
      setTitle('');
      setAuthor('');
      setDescription('');
      setCategory('');
      setCoverFile(null);
      setBookFile(null);
      if (onBookAdded) onBookAdded();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при добавлении книги');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card" style={{ marginTop: '0' }}>
      <h3>Добавить книгу</h3>
      <form onSubmit={handleSubmit}>
        <label>Название *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        <label>Автор</label>
        <input value={author} onChange={(e) => setAuthor(e.target.value)} />
        <label>Описание</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        <label>Категория</label>
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Например: Устав" />
        <label>Обложка (изображение)</label>
        <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} />
        <label>Файл книги (PDF, DOCX)</label>
        <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(e) => setBookFile(e.target.files[0])} />
        <button type="submit" disabled={uploading} style={{ marginTop: '1rem' }}>
          {uploading ? 'Загрузка...' : 'Добавить'}
        </button>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

export default AddBookForm;