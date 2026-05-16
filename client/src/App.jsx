import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import LibraryPage from './pages/LibraryPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const { isAuthenticated, logout, user } = useAuth();
  const { theme, toggleTheme} = useTheme();

  return (
    <BrowserRouter>
      <div>
        <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
          <Link to="/">Главная</Link> | <Link to="/register">Регистрация</Link> |{' '}
          {isAuthenticated ? (
            <>
              <Link to="/library">Библиотека</Link> |{' '}
              <Link to="/profile">Профиль</Link> |{' '}
              <span>{user?.full_name || user?.username}</span> |{' '}
              <button onClick={logout}>Выйти</button>
              <button onClick={toggleTheme} style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '6px', cursor: 'pointer' }}>
  {theme === 'light' ? '🌙 Тёмная' : '☀️ Светлая'}
</button>
            </>
          ) : (
            <Link to="/login">Вход</Link>
          )}
        </nav>

        <Routes>
          <Route path="/" element={<h1>{<HomePage/>}</h1>} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/library" /> : <RegisterPage />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/library" /> : <LoginPage />} />
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <LibraryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;