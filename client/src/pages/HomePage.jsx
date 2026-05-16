import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function HomePage() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="container">
      <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>📚 Военная библиотека</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Закрытая информационно-библиотечная система для военнослужащих.
          Храните, систематизируйте и обсуждайте уставы, приказы и методические материалы.
        </p>
        {!isAuthenticated ? (
          <div>
            <Link to="/register" style={{ marginRight: '1rem' }}>
              <button type="button" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>Регистрация</button>
            </Link>
            <Link to="/login">
              <button type="button" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>Вход</button>
            </Link>
          </div>
        ) : (
          <Link to="/library">
            <button type="button" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>Перейти в библиотеку</button>
          </Link>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3>📖 Документы</h3>
          <p style={{ color: 'var(--text-secondary)' }}>База уставов, приказов и учебных пособий.</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3>💬 Обсуждения</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Комментарии и обратная связь по материалам.</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3>🔐 Защищённый доступ</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Только для авторизованных военнослужащих.</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;