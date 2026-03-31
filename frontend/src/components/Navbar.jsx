import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 1. Жадтан қазіргі пайдаланушыны аламыз (егер жоқ болса 'Қонақ')
  const currentUser = localStorage.getItem('currentUser') || 'Қонақ';
  
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark-mode');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  // 2. Жүйеден шығу функциясы
  const handleLogout = () => {
    localStorage.removeItem('currentUser'); // Жадтағы есімді өшіру
    navigate('/'); // Логин бетіне қайту
  };

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="logo"><span>Quiz</span>KZ</Link>
      
      <button className="hamburger">
        <span></span><span></span><span></span>
      </button>
      
      <ul className="nav-links">
        <li><Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Басты бет</Link></li>
        <li><Link to="/results" className={location.pathname === '/results' ? 'active' : ''}>Нәтижелер</Link></li>
        <li><Link to="/leaderboard" className={location.pathname === '/leaderboard' ? 'active' : ''}>Рейтинг</Link></li>
        <li><Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>Профиль</Link></li>
      </ul>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="btn-theme" title="Тақырыпты ауыстыру" onClick={toggleTheme}>
          <span>{isDark ? '🌙' : '☀️'}</span>
        </button>

        <div className="nav-user">
          {/* Пайдаланушы атының бірінші әрпін аватар қыламыз */}
          <div className="avatar" style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            background: 'var(--primary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'white', 
            fontWeight: '800',
            fontSize: '0.8rem'
          }}>
            {currentUser.charAt(0).toUpperCase()}
          </div>
          
          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            {currentUser}
          </span>

          <button 
            onClick={handleLogout} 
            className="btn-logout"
            style={{ marginLeft: '8px' }}
          >
            Шығу
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;