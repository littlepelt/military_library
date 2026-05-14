import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <BrowserRouter>
      <div>
        <nav>
          <Link to="/">Главная</Link> | <Link to="/register">Регистрация</Link> |{' '}
          <Link to="/login">Вход</Link>
        </nav>
        <Routes>
          <Route path="/" element={<h1>Информационно-библиотечная система для военнослужащих</h1>} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;