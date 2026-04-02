import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = localStorage.getItem('currentUser') || 'Қонақ';
  const isAdmin = currentUser.toLowerCase() === 'admin';
  
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark-mode');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    if (!isDark) document.documentElement.classList.add('dark-mode');
    else document.documentElement.classList.remove('dark-mode');
    localStorage.setItem('theme', newTheme);
  };

  const handleLogout = () => {
    if (window.confirm('Жүйеден шығасыз ба?')) {
      localStorage.removeItem('currentUser');
      navigate('/');
    }
  };

  return (
    <nav className="navbar">
      <style>{`
        .navbar {
          background: var(--bg-card);
          border-bottom: 1px solid var(--border);
          padding: 0 2rem;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        
        .nav-left { flex: 1; display: flex; align-items: center; }
        .nav-center { display: flex; align-items: center; gap: 0.5rem; }
        .nav-right { flex: 1; display: flex; align-items: center; justify-content: flex-end; gap: 12px; }
        
        .nav-brand { font-size: 1.5rem; font-weight: 800; text-decoration: none; color: var(--text-primary); }
        .nav-brand span { color: var(--primary); }
        
        .nav-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          padding: 8px 16px;
          border-radius: 10px;
          transition: 0.2s;
          white-space: nowrap;
        }
        .nav-link:hover, .nav-link.active { color: var(--primary); background: var(--primary-light); }
        
        .user-profile {
          display: flex; align-items: center; gap: 8px;
          background: var(--bg-page); padding: 4px 12px 4px 4px; border-radius: 20px; border: 1px solid var(--border);
        }
        .user-avatar {
          width: 32px; height: 32px; background: var(--primary); color: white;
          border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem;
        }
        
        .hamburger { display: none; flex-direction: column; gap: 5px; background: transparent; border: none; cursor: pointer; padding: 5px; }
        .hamburger span { width: 25px; height: 3px; background: var(--text-primary); border-radius: 3px; transition: 0.3s; }

        /* МОБИЛЬДІ МӘЗІР СТИЛІ */
        .mobile-menu {
          position: absolute; top: 70px; left: 0; right: 0;
          background: var(--bg-card); flex-direction: column; padding: 1rem; gap: 0.5rem;
          border-bottom: 1px solid var(--border); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
          display: none; /* Әдепкі бойынша жасыру */
        }

        @media (max-width: 1024px) {
          .nav-center { display: none; } /* Компьютер мәзірін жасыру */
          .hamburger { display: flex; } /* Гамбургерді шығару */
          .mobile-menu { display: ${isMenuOpen ? 'flex' : 'none'}; } /* Тек ашылғанда шығару */
          .user-name { display: none; }
        }
      `}</style>

      {/* 1. СОЛ ЖАҚ */}
      <div className="nav-left">
        <Link to="/dashboard" className="nav-brand"><span>Quiz</span>KZ</Link>
      </div>

      {/* 2. ОРТА (Тек компьютерде) */}
      <div className="nav-center">
        <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>Басты бет</Link>
        <Link to="/results" className={`nav-link ${location.pathname === '/results' ? 'active' : ''}`}>Нәтижелер</Link>
        <Link to="/leaderboard" className={`nav-link ${location.pathname === '/leaderboard' ? 'active' : ''}`}>Рейтинг</Link>
        <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}>Профиль</Link>
        {isAdmin && <Link to="/admin" className="nav-link" style={{color:'var(--primary)'}}>⚙️ Админ</Link>}
      </div>

      {/* 3. ОҢ ЖАҚ */}
      <div className="nav-right">
        <button onClick={toggleTheme} className="nav-link" style={{background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer'}}>
          {isDark ? '🌙' : '☀️'}
        </button>
        
        <div className="user-profile">
          <div className="user-avatar">{currentUser.charAt(0).toUpperCase()}</div>
          <span className="user-name" style={{fontWeight:600, fontSize:'0.85rem', color:'var(--text-primary)'}}>{currentUser}</span>
        </div>
        
        <button onClick={handleLogout} className="nav-link" style={{background:'none', border:'none', cursor:'pointer'}}>Шығу</button>
        
        <button className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span style={{ transform: isMenuOpen ? 'rotate(45deg) translate(5px, 6px)' : 'none' }}></span>
          <span style={{ opacity: isMenuOpen ? 0 : 1 }}></span>
          <span style={{ transform: isMenuOpen ? 'rotate(-45deg) translate(5px, -6px)' : 'none' }}></span>
        </button>
      </div>

      {/* 4. МОБИЛЬДІ МӘЗІР (Тек телефонда) */}
      <div className="mobile-menu">
        <Link to="/dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>Басты бет</Link>
        <Link to="/results" className="nav-link" onClick={() => setIsMenuOpen(false)}>Нәтижелер</Link>
        <Link to="/leaderboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>Рейтинг</Link>
        <Link to="/profile" className="nav-link" onClick={() => setIsMenuOpen(false)}>Профиль</Link>
        {isAdmin && <Link to="/admin" className="nav-link" onClick={() => setIsMenuOpen(false)}>⚙️ Админ Панель</Link>}
      </div>
    </nav>
  );
};

export default Navbar;