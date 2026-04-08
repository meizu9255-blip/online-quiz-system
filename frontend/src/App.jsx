import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import Leaderboard from './pages/Leaderboard'; 
import Profile from './pages/Profile';        
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/quiz/:id" element={<Quiz />} />
        <Route path="/results" element={<Results />} />
        <Route path="/leaderboard" element={<Leaderboard />} /> {/* Рейтинг жолы */}
        <Route path="/profile" element={<Profile />} />         {/* Профиль жолы */}
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<NotFound />} /> {/* 404 Қателік беті */}
      </Routes>
    </Router>
  );
}

export default App;