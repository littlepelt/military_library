import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    rank: '',
    unit: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, formData);
      login(response.data.token, response.data.user);
      navigate('/library');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Ошибка соединения с сервером');
      }
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Регистрация военнослужащего</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Логин (обязательно):</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required />
          </div>
          <div>
            <label>Пароль (обязательно):</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          <div>
            <label>Полное имя:</label>
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
          <button type="submit">Зарегистрироваться</button>
        </form>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
        <p style={{ marginTop: '1rem' }}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;