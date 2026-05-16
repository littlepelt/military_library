import { useState } from 'react';
import api from '../api';

function AddBookForm({ onBookAdded }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleCoverChange = (e) => {
    setCoverFile(e.target.files[0]);
  };

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
      let coverUrl = '';
      // Загрузка обложки, если выбран файл
      if (coverFile) {
        const formData = new FormData();
        formData.append('cover', coverFile);
        const uploadRes = await api.post('/api/books/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        coverUrl = uploadRes.data.url;
      }
      // Создание книги
      await api.post('/api/books', {
        title, author, description, category, file_url: fileUrl, cover_url: coverUrl
      });
      setMessage('Книга добавлена!');
      setTitle(''); setAuthor(''); setDescription(''); setCategory(''); setFileUrl(''); setCoverFile(null);
      if (onBookAdded) onBookAdded();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка');
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
        <label>Ссылка на файл</label>
        <input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="URL документа" />
        <label>Обложка</label>
        <input type="file" accept="image/*" onChange={handleCoverChange} />
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