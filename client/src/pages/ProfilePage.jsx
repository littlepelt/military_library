import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

function ProfilePage() {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', rank: '', unit: '' });
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/auth/profile');
        setProfile(response.data);
        setFormData({
          full_name: response.data.full_name || '',
          rank: response.data.rank || '',
          unit: response.data.unit || '',
        });
      } catch (err) {
        setError('Не удалось загрузить профиль');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveMessage('');
    try {
      const response = await api.put('/api/auth/profile', formData);
      setProfile(response.data);
      const updatedUser = { ...user, full_name: response.data.full_name, rank: response.data.rank, unit: response.data.unit };
      login(localStorage.getItem('token'), updatedUser);
      setEditMode(false);
      setSaveMessage('Профиль обновлён');
    } catch (err) {
      setSaveMessage(err.response?.data?.error || 'Ошибка при сохранении');
    }
  };

  if (loading) return <div className="container">Загрузка профиля...</div>;
  if (error) return <div className="container"><p className="error">{error}</p></div>;
  if (!profile) return <div className="container">Пользователь не найден</div>;

  return (
    <div className="container">
      <div className="card">
        <h2>Профиль военнослужащего</h2>
        {!editMode ? (
          <div>
            <p><strong>Логин:</strong> {profile.username}</p>
            <p><strong>Имя:</strong> {profile.full_name || '—'}</p>
            <p><strong>Звание:</strong> {profile.rank || '—'}</p>
            <p><strong>Воинская часть:</strong> {profile.unit || '—'}</p>
            <p><strong>Роль:</strong> {profile.role}</p>
            <p><strong>Дата регистрации:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
            <button onClick={() => setEditMode(true)}>Редактировать</button>
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div>
              <label>Имя:</label>
              <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} />
            </div>
            <div>
              <label>Звание:</label>
              <input type="text" name="rank" value={formData.rank} onChange={handleChange} />
            </div>
            <div>
              <label>Воинская часть:</label>
              <input type="text" name="unit" value={formData.unit} onChange={handleChange} />
            </div>
            <div>
              <button type="submit">Сохранить</button>
              <button type="button" onClick={() => setEditMode(false)}>Отмена</button>
            </div>
            {saveMessage && <p className={saveMessage.includes('обновлён') ? 'success' : 'error'}>{saveMessage}</p>}
          </form>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;