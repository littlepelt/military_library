import { useAuth } from '../contexts/AuthContext';

function LibraryPage() {
  const { user, logout } = useAuth();

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2>Военная библиотека</h2>
      <p>Добро пожаловать, {user?.full_name || user?.username}!</p>
      <p>Здесь будет список книг и документов.</p>
      <button onClick={logout} style={{ marginTop: '1rem' }}>Выйти</button>
    </div>
  );
}

export default LibraryPage;