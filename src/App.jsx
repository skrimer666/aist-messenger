import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Profile from './pages/Profile';
// Позже добавишь ChatLayout

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat" element={<div>Чаты (в разработке)</div>} />
      </Routes>
    </Router>
  );
}