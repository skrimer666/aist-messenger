import { Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Profile from './pages/Profile';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;