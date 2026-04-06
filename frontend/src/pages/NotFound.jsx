import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const NotFound = () => {
  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '8rem', fontWeight: 900, color: 'var(--primary)', margin: 0, lineHeight: 1 }}>404</h1>
        <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '8px 24px', borderRadius: '20px', fontWeight: 800, fontSize: '1.2rem', marginBottom: '1.5rem', marginTop: '-1rem', zIndex: 1, position: 'relative' }}>
          Бет табылмады
        </div>
        
        <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Қап! Сіз адасып кеткен сияқтысыз 🧭</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
          Сіз іздеген бет жойылған, аты өзгертілген немесе уақытша қолжетімсіз болуы мүмкін. Мүмкін сілтемеден қате кеткен шығар?
        </p>
        
        <Link 
          to="/dashboard" 
          style={{ 
            background: 'var(--primary)', 
            color: 'white', 
            textDecoration: 'none', 
            padding: '16px 32px', 
            borderRadius: '16px', 
            fontWeight: 700, 
            fontSize: '1.1rem',
            boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 15px 25px -5px rgba(79, 70, 229, 0.5)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(79, 70, 229, 0.4)'; }}
        >
          🏠 Басты бетке қайту
        </Link>
      </main>
    </div>
  );
};

export default NotFound;
