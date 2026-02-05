// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register'; // Импортируем созданный Register
import Profile from './pages/Profile';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} /> {/* Теперь этот маршрут будет работать */}
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}