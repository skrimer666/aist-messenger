import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ChatLayout from './pages/ChatLayout';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat" element={<ChatLayout />} />
      </Routes>
    </Router>
  );
}