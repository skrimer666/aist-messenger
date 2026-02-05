import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './components/register';
import ChatLayout from './components/ChatLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<ChatLayout />} />
        <Route path="/" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}