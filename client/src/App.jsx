import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import LibraryPage from './pages/LibraryPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <BrowserRouter>
      <div>
        <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
          <Link to="/">Главная</Link> | <Link to="/register">Регистрация</Link> |{' '}
          {isAuthenticated ? (
            <>
              <Link to="/library">Библиотека</Link> |{' '}
              <span>{user?.username}</span> |{' '}
              <button onClick={logout}>Выйти</button>
            </>
          ) : (
            <Link to="/login">Вход</Link>
          )}
        </nav>

        <Routes>
          <Route path="/" element={<h1>Информационно-библиотечная система для военнослужащих</h1>} />
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
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;