import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { quizzes } from '../data/quizzes';

const Dashboard = () => {
  const [allResults, setAllResults] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Барлығы');
  const [loading, setLoading] = useState(true);
  const user = localStorage.getItem('currentUser') || 'Пайдаланушы';

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/results');
        setAllResults(response.data);
        setUserResults(response.data.filter(r => r.username === user));
      } catch (error) {
        console.error("Дерек алу қатесі:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [user]);

  // ==========================================
  // СТАТИСТИКА ЖӘНЕ ДИНАМИКАЛЫҚ ДЕРЕКТЕР
  // ==========================================
  const totalTests = userResults.length;
  const avgScore = totalTests > 0 ? Math.round(userResults.reduce((acc, curr) => acc + curr.score, 0) / totalTests) : 0;
  const recentResults = [...userResults].reverse().slice(0, 4);

  // Динамикалық статус пен XP есептеу (Жаңа оқушы үшін 0-ден басталады)
  let userStatus = "🎓 Жаңа оқушы";
  let currentXP = 0;
  let maxXP = 1000;
  let xpPercent = 0;

  if (totalTests > 0) {
    if (avgScore >= 80) userStatus = "⭐ Озат оқушы";
    else if (avgScore >= 60) userStatus = "🌟 Жақсы оқушы";
    else userStatus = "📚 Талпынушы";

    currentXP = totalTests * 50 + Math.floor(avgScore * 10);
    maxXP = Math.ceil((currentXP + 1) / 1000) * 1000 || 1000;
    xpPercent = Math.min(Math.round((currentXP / maxXP) * 100), 100);
  }

  // Рейтинг есептеу
  const userMaxScores = {};
  allResults.forEach(r => {
    if (!userMaxScores[r.username] || r.score > userMaxScores[r.username]) {
      userMaxScores[r.username] = r.score;
    }
  });
  const leaderboard = Object.keys(userMaxScores)
    .map(username => ({ username, score: userMaxScores[username] }))
    .sort((a, b) => b.score - a.score);
  const userRank = leaderboard.findIndex(u => u.username === user) + 1 || '-';
  const top3 = leaderboard.slice(0, 3);

  // Апталық прогресс (Шынайы)
  const weekDays = ['Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сн', 'Жк'];
  const weekScores = [0, 0, 0, 0, 0, 0, 0];
  
  const today = new Date();
  const currentDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; 
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDayIndex);
  startOfWeek.setHours(0, 0, 0, 0);

  const dayTotals = {0:{sum:0,count:0}, 1:{sum:0,count:0}, 2:{sum:0,count:0}, 3:{sum:0,count:0}, 4:{sum:0,count:0}, 5:{sum:0,count:0}, 6:{sum:0,count:0}};

  userResults.forEach(r => {
    const d = new Date(r.date);
    if (d >= startOfWeek) {
      const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
      dayTotals[dayIdx].sum += r.score;
      dayTotals[dayIdx].count += 1;
    }
  });

  for (let i = 0; i <= 6; i++) {
    if (dayTotals[i].count > 0) weekScores[i] = Math.round(dayTotals[i].sum / dayTotals[i].count);
  }

  const thisWeekTests = userResults.filter(r => new Date(r.date) >= startOfWeek);
  const thisWeekAvg = thisWeekTests.length > 0 ? Math.round(thisWeekTests.reduce((acc, curr) => acc + curr.score, 0) / thisWeekTests.length) : 0;
  const testsThisWeekCount = thisWeekTests.length;

  const categories = ['Барлығы', 'Web', 'Программалау', 'Желілер', 'Қауіпсіздік'];
  const filteredQuizzes = quizzes.filter(q => {
    if (activeCategory === 'Барлығы') return true;
    const categoryMap = { 'Web': 'Web', 'Программалау': 'Programming', 'Желілер': 'Networks', 'Қауіпсіздік': 'Security' };
    return q.category === categoryMap[activeCategory];
  });

  const scrollToQuizzes = () => {
    document.getElementById('quizzes-section').scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-page)' }}><div className="spinner" style={{width:'40px', height:'40px', border:'4px solid var(--border)', borderTopColor:'var(--primary)', borderRadius:'50%', animation:'spin 1s linear infinite'}}></div><style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style></div>;

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <Navbar />
      <style>{`
        /* ТЕК АЙНЫМАЛЫЛАР ҚОЛДАНЫЛДЫ - DARK MODE ҮШІН ЖӘНЕ КЕҢ ЕТІП ЖАСАЛДЫ */
        body { font-family: 'Inter', sans-serif; margin: 0; }
        .dash-layout { max-width: 1440px; margin: 2rem auto; padding: 0 2.5rem; display: grid; grid-template-columns: 1fr 380px; gap: 2.5rem; }
        
        .main-banner { background: linear-gradient(135deg, #4f46e5, #8b5cf6); border-radius: 20px; padding: 2rem 2.5rem; color: white; display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; box-shadow: 0 10px 25px -5px rgba(79,70,229,0.3); position: relative; overflow: hidden; }
        .main-banner::after { content: ''; position: absolute; right: -10%; top: -50%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%); border-radius: 50%; }
        .banner-stat-box { background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); padding: 1rem 1.5rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.2); text-align: center; display: flex; flex-direction: column; gap: 4px; min-width: 120px; }
        
        .cat-tabs { display: flex; gap: 12px; margin-bottom: 1.5rem; overflow-x: auto; padding-bottom: 4px; }
        .cat-tab { padding: 8px 16px; border-radius: 20px; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: 0.2s; white-space: nowrap; }
        .cat-tab.active { background: var(--primary); color: white; border: 1px solid var(--primary); box-shadow: 0 4px 6px rgba(79,70,229,0.2); }
        .cat-tab.inactive { background: var(--bg-card); color: var(--text-secondary); border: 1px solid var(--border); }
        .cat-tab.inactive:hover { background: var(--bg-page); }
        
        .quiz-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
        .q-card { background: var(--bg-card); border-radius: 20px; overflow: hidden; border: 1px solid var(--border); transition: 0.3s; display: flex; flex-direction: column; }
        .q-card:hover { transform: translateY(-5px); box-shadow: 0 12px 20px -8px rgba(0,0,0,0.15); border-color: var(--primary); }
        .q-card-top { padding: 1.5rem; display: flex; justify-content: space-between; align-items: flex-start; color: white; }
        .q-card-body { padding: 1.5rem; flex: 1; display: flex; flex-direction: column; }
        
        .widget { background: var(--bg-card); border-radius: 20px; padding: 1.75rem; border: 1px solid var(--border); margin-bottom: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); transition: 0.3s; }
        .rank-widget { background: linear-gradient(135deg, #1e1b4b, #312e81); color: white; border: none; box-shadow: 0 10px 15px -3px rgba(30,27,75,0.4); }
      `}</style>

      <main className="main-content" style={{ padding: 0, maxWidth: '100%' }}>
        <div className="dash-layout">
          
          {/* ================= СОЛ ЖАҚ ================= */}
          <div>
            <div className="main-banner">
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ opacity: 0.9, fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>Қайырлы күн 👋</div>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 8px 0' }}>Қош келдіңіз, {user}!</h1>
                <p style={{ margin: '0 0 1.5rem 0', opacity: 0.9, fontSize: '1rem' }}>
                  {totalTests > 0 ? `Осы аптада ${testsThisWeekCount} тест өттіңіз. Жалғастырыңыз!` : 'Тест тапсыруды бастаңыз!'}
                </p>
                <button 
                  onClick={scrollToQuizzes}
                  style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '10px 24px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease' }}
                  onMouseOver={(e) => {e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'}}
                  onMouseOut={(e) => {e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(0)'}}
                >
                  ▷ Оқуды жалғастыру
                </button>
              </div>
              <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                <div className="banner-stat-box">
                  <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>Өткен тесттер</span>
                  <span style={{ fontSize: '2rem', fontWeight: 800 }}>{totalTests}</span>
                </div>
                <div className="banner-stat-box">
                  <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>Орт. балл</span>
                  <span style={{ fontSize: '2rem', fontWeight: 800 }}>{avgScore}%</span>
                </div>
              </div>
            </div>

            <div id="quizzes-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingTop: '1rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Қолжетімді тесттер</h2>
              <Link to="/tests" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600 }}>Барлығы {'>'}</Link>
            </div>

            <div className="cat-tabs">
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`cat-tab ${activeCategory === cat ? 'active' : 'inactive'}`}>
                  {cat}
                </button>
              ))}
            </div>

            <div className="quiz-grid">
              {filteredQuizzes.map((q) => {
                const bgColors = { Programming: '#ef4444', Web: '#3b82f6', Networks: '#0ea5e9', Security: '#8b5cf6' };
                const qBg = bgColors[q.category] || '#10b981';

                return (
                  <div key={q.id} className="q-card">
                    <div className="q-card-top" style={{ background: qBg, height: '100px' }}>
                      <div style={{ width: '45px', height: '45px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.8rem' }}>{q.icon}</div>
                      <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>{q.difficulty}</div>
                    </div>
                    <div className="q-card-body">
                      <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', color: 'var(--text-primary)' }}>{q.title}</h3>
                      <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 }}>{q.description}</p>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontWeight: 500 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📄 {q.questions.length} сұрақ</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>⏱ {Math.floor(q.timeLimit / 60)} мин</span>
                      </div>

                      <Link to={`/quiz/${q.id}`} style={{ display: 'block', textAlign: 'center', border: '1px solid var(--border)', color: 'var(--primary)', background: 'var(--bg-page)', padding: '12px', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, transition: '0.2s' }} onMouseOver={e => {e.target.style.background='var(--primary)'; e.target.style.color='white'; e.target.style.borderColor='var(--primary)'}} onMouseOut={e => {e.target.style.background='var(--bg-page)'; e.target.style.color='var(--primary)'; e.target.style.borderColor='var(--border)'}}>
                        ▷ Тестті бастау
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ================= ОҢ ЖАҚ ВИДЖЕТТЕР ================= */}
          <div>
            
            {/* Профиль XP */}
            <div className="widget">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: '60px', height: '60px', background: 'var(--primary)', color: 'white', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.8rem', fontWeight: 700 }}>
                  {user.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{user}</div>
                  <div style={{ fontSize: '0.9rem', color: '#f59e0b', fontWeight: 600 }}>{userStatus}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                <span>XP Прогресі</span>
                <span style={{ color: 'var(--primary)' }}>{currentXP} / {maxXP}</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-page)', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ width: `${xpPercent}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px', transition: 'width 1s ease' }}></div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Келесі деңгейге {maxXP - currentXP} XP қалды</div>
            </div>

            {/* Апталық Прогресс */}
            <div className="widget">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', color: 'var(--text-primary)' }}>Апталық прогресс</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Осы аптадағы орт. балл</p>
                </div>
                <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
                  +{thisWeekAvg}% ↑
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '110px' }}>
                {weekScores.map((score, idx) => {
                  const isToday = idx === currentDayIndex;
                  const h = score > 0 ? Math.max(score, 10) : 0;
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <span style={{ fontSize: '0.75rem', color: isToday ? 'var(--primary)' : 'var(--text-muted)', fontWeight: isToday ? 700 : 600, opacity: score > 0 ? 1 : 0 }}>{score}</span>
                      <div style={{ width: '100%', maxWidth: '30px', height: '85px', background: 'var(--bg-page)', borderRadius: '6px', position: 'relative' }}>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${h}%`, background: isToday ? 'var(--primary)' : 'var(--border)', borderRadius: '6px', transition: '1s ease' }}></div>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: isToday ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isToday ? 700 : 500 }}>{weekDays[idx]}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Соңғы нәтижелер */}
            <div className="widget">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>Соңғы нәтижелер</h3>
                <Link to="/results" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Барлығы {'>'}</Link>
              </div>
              {recentResults.length === 0 ? <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center' }}>Әлі тест тапсырмадыңыз</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recentResults.map((r, i) => {
                    let badgeBg = 'var(--danger-light)'; let badgeColor = 'var(--danger)';
                    if (r.score >= 90) { badgeBg = 'var(--success-light)'; badgeColor = 'var(--success)'; }
                    else if (r.score >= 70) { badgeBg = 'var(--primary-light)'; badgeColor = 'var(--primary)'; }
                    else if (r.score >= 50) { badgeBg = 'var(--warning-light)'; badgeColor = 'var(--warning)'; }

                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i !== recentResults.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <div style={{ width: '42px', height: '42px', background: badgeBg, color: badgeColor, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🏅</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{r.quiz_title}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{r.correct_count}/{r.total_questions} дұрыс</div>
                        </div>
                        <div style={{ marginLeft: 'auto', background: 'var(--bg-page)', padding: '6px 10px', borderRadius: '8px', color: badgeColor, fontWeight: 700, fontSize: '0.95rem' }}>{r.score}%</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Рейтинг */}
            <div className="widget rank-widget">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🏆</span><h3 style={{ margin: 0, fontSize: '1.2rem', color: 'white' }}>Рейтинг</h3>
              </div>
              <p style={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.5, marginBottom: '1.5rem', color: '#cbd5e1' }}>Сіз жалпы рейтингте <strong>#{userRank}</strong> орындасыз. Топ 3-ке кіру үшін тестті жиі тапсырыңыз!</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
                {top3.map((u, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: i===0?'#f59e0b':i===1?'#94a3b8':'#d97706', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800 }}>{i + 1}</div>
                    <div style={{ fontWeight: 600, fontSize: '1rem', color: 'white' }}>{u.username}</div>
                    <div style={{ marginLeft: 'auto', fontWeight: 800, color: 'white' }}>{u.score}%</div>
                  </div>
                ))}
              </div>
              <Link to="/leaderboard" style={{ display: 'block', textAlign: 'center', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px', color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', transition: '0.2s' }} onMouseOver={e => e.target.style.background='rgba(255,255,255,0.2)'} onMouseOut={e => e.target.style.background='rgba(255,255,255,0.1)'}>👥 Толық рейтингті көру</Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;