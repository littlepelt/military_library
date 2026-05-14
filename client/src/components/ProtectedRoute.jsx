import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Пока идёт проверка localStorage, можно показать загрузку
    return <div>Загрузка...</div>;
  }

  if (!isAuthenticated) {
    // Если не авторизован – отправляем на страницу входа
    return <Navigate to="/login" replace />;
  }

  // Если авторизован – показываем переданный компонент (children)
  return children;
}

export default ProtectedRoute;