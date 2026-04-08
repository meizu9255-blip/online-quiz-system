import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)', fontFamily: 'var(--font)' }}>
      {/* NAVBAR */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ color: 'var(--primary)' }}>⚡</span> QuizKZ
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login" className="btn btn-ghost" style={{ fontWeight: 600 }}>Кіру</Link>
          <Link to="/register" className="btn btn-primary" style={{ padding: '8px 20px', borderRadius: '10px' }}>Тіркелу</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '6rem 2rem 4rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, left: -100, width: 300, height: 300, background: 'var(--primary-light)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.6, zIndex: 0 }}></div>
        <div style={{ position: 'absolute', bottom: -50, right: -50, width: 250, height: 250, background: 'var(--secondary)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.15, zIndex: 0 }}></div>
        
        <div style={{ maxWidth: '800px', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'var(--primary-bg)', color: 'var(--primary)', padding: '6px 16px', borderRadius: '20px', fontWeight: 700, fontSize: '0.85rem', marginBottom: '1.5rem', border: '1px solid var(--primary-light)' }}>
            🚀 Ақылды тесттер платформасы
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-1px' }}>
            Біліміңізді <span style={{ color: 'var(--primary)' }}>жақсартыңыз</span> және жаңа белестерге жетіңіз
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Бейімделген тесттер, нақты уақыттағы аналитика және толық статистика — дағдыларыңызды жетілдірудің ең тиімді жолы.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1.1rem', borderRadius: '12px', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)' }}>
              Тегін бастау
            </Link>
            <Link to="/login" className="btn btn-outline" style={{ padding: '14px 32px', fontSize: '1.1rem', borderRadius: '12px' }}>
              Менде аккаунт бар
            </Link>
          </div>
        </div>
      </header>

      {/* FEATURES SECTION */}
      <section style={{ padding: '4rem 2rem 6rem', background: 'var(--bg-card)', zIndex: 1 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: '3rem', color: 'var(--text-primary)' }}>Неліктен QuizKZ?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            <div style={{ padding: '2rem', borderRadius: '20px', background: 'var(--bg-page)', border: '1px solid var(--border)', transition: 'transform 0.3s', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.5rem' }}>⚡</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>Ақылды (Smart) Тесттер</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>Жіберілген қателеріңіз бойынша арнайы жасалған тесттер арқылы әлсіз тұстарыңызды тез түзеңіз.</p>
            </div>

            <div style={{ padding: '2rem', borderRadius: '20px', background: 'var(--bg-page)', border: '1px solid var(--border)', transition: 'transform 0.3s', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.5rem' }}>📊</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>Терең Аналитика</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>Radar диаграммасы және нақты статистикамен қай пәндерден үлгеріміңіз жақсы екенін көріңіз.</p>
            </div>

            <div style={{ padding: '2rem', borderRadius: '20px', background: 'var(--bg-page)', border: '1px solid var(--border)', transition: 'transform 0.3s', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'var(--warning-light)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.5rem' }}>🏆</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>Көшбасшылар тақтасы</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>Басқа оқушылармен жарысып, рейтингте бірінші орынға шығу үшін XP жинап отырыңыз.</p>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', borderTop: '1px solid var(--border)' }}>
        © {new Date().getFullYear()} QuizKZ. Барлық құқықтар қорғалған.
      </footer>
    </div>
  );
};

export default Landing;
