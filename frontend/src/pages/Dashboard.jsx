import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const [quizzes, setQuizzes] = useState([]); 
  const [allResults, setAllResults] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Барлығы');
  const [loading, setLoading] = useState(true);
  const user = localStorage.getItem('currentUser') || 'Пайдаланушы';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resResults, resQuizzes] = await Promise.all([
          axios.get('http://localhost:5000/api/results'),
          axios.get('http://localhost:5000/api/quizzes')
        ]);
        
        setAllResults(resResults.data);
        setUserResults(resResults.data.filter(r => r.username === user));
        setQuizzes(resQuizzes.data); 
      } catch (error) {
        console.error("Дерек алу қатесі:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const totalTests = userResults.length;
  const avgScore = totalTests > 0 ? Math.round(userResults.reduce((acc, curr) => acc + curr.score, 0) / totalTests) : 0;
  const recentResults = [...userResults].reverse().slice(0, 4);

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

  const userStats = {};
  allResults.forEach(r => {
    const uname = r.username || 'Атаусыз';
    if (!userStats[uname]) {
      userStats[uname] = { username: uname, tests: 0, totalScore: 0, bestScore: 0 };
    }
    userStats[uname].tests += 1;
    userStats[uname].totalScore += r.score;
    if (r.score > userStats[uname].bestScore) userStats[uname].bestScore = r.score;
  });

  const processedUsers = Object.values(userStats).map(u => ({
    ...u,
    avgScore: Math.round(u.totalScore / u.tests)
  }));

  processedUsers.sort((a, b) => {
    if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
    if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore; 
    return a.username.localeCompare(b.username); 
  });

  const leaderboard = processedUsers;
  const userRank = leaderboard.findIndex(u => u.username === user) + 1 || '-';
  const top3 = leaderboard.slice(0, 3);

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
    return q.category === categoryMap[activeCategory] || q.category === activeCategory;
  });

  const scrollToQuizzes = () => {
    document.getElementById('quizzes-section').scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-page)' }}><div className="spinner" style={{width:'40px', height:'40px', border:'4px solid var(--border)', borderTopColor:'var(--primary)', borderRadius:'50%', animation:'spin 1s linear infinite'}}></div><style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style></div>;

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', overflowX: 'hidden' }}>
      <Navbar />
      <style>{`
        body { font-family: 'Inter', sans-serif; margin: 0; overflow-x: hidden; }
        
        /* Глобалды Layout */
        .dash-layout { max-width: 1440px; margin: 2rem auto; padding: 0 2.5rem; display: grid; grid-template-columns: 1fr 380px; gap: 2.5rem; box-sizing: border-box; }
        
        /* Басты баннер */
        .main-banner { background: linear-gradient(135deg, #4f46e5, #8b5cf6); border-radius: 20px; padding: 2.5rem; color: white; display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; box-shadow: 0 10px 25px -5px rgba(79,70,229,0.3); position: relative; overflow: hidden; }
        .main-banner::after { content: ''; position: absolute; right: -10%; top: -50%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%); border-radius: 50%; }
        
        .banner-content { position: relative; z-index: 1; }
        .banner-title { font-size: 2.2rem; font-weight: 800; margin: 0 0 8px 0; line-height: 1.2; }
        .banner-desc { margin: 0 0 1.5rem 0; opacity: 0.9; font-size: 1rem; }
        
        .banner-stats { display: flex; gap: 1rem; position: relative; z-index: 1; }
        .banner-stat-box { background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); padding: 1.25rem 1.5rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.2); text-align: center; display: flex; flex-direction: column; gap: 4px; min-width: 120px; }
        .stat-val { font-size: 2rem; font-weight: 800; line-height: 1; }
        
        /* Категориялар */
        .cat-tabs { display: flex; gap: 10px; margin-bottom: 1.5rem; overflow-x: auto; padding-bottom: 8px; -webkit-overflow-scrolling: touch; }
        .cat-tab { padding: 8px 16px; border-radius: 20px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: 0.2s; white-space: nowrap; flex-shrink: 0; }
        .cat-tab.active { background: var(--primary); color: white; border: 1px solid var(--primary); box-shadow: 0 4px 6px rgba(79,70,229,0.2); }
        .cat-tab.inactive { background: var(--bg-card); color: var(--text-secondary); border: 1px solid var(--border); }
        
        /* Тест Карточкалары */
        .quiz-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
        .q-card { background: var(--bg-card); border-radius: 20px; overflow: hidden; border: 1px solid var(--border); transition: 0.3s; display: flex; flex-direction: column; }
        .q-card:hover { transform: translateY(-5px); box-shadow: 0 12px 20px -8px rgba(0,0,0,0.15); border-color: var(--primary); }
        .q-card-top { padding: 1.5rem; display: flex; justify-content: space-between; align-items: flex-start; color: white; }
        .q-card-body { padding: 1.5rem; flex: 1; display: flex; flex-direction: column; }
        
        /* Оң жақ виджеттер */
        .widget { background: var(--bg-card); border-radius: 20px; padding: 1.75rem; border: 1px solid var(--border); margin-bottom: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); transition: 0.3s; }
        .rank-widget { background: linear-gradient(135deg, #1e1b4b, #312e81); color: white; border: none; box-shadow: 0 10px 15px -3px rgba(30,27,75,0.4); }

        /* =======================================================
           МОБИЛЬДІ АДАПТИВТІЛІК (МЕДИА СҰРАНЫСТАР)
           ======================================================= */
        @media (max-width: 1024px) {
          .dash-layout { grid-template-columns: 1fr; padding: 0 1.5rem; gap: 1.5rem; }
        }
        
        @media (max-width: 768px) {
          .dash-layout { padding: 0 1rem; margin: 1rem auto; }
          
          .main-banner { flex-direction: column; padding: 1.5rem; text-align: center; gap: 1.5rem; border-radius: 16px; }
          .main-banner::after { width: 300px; height: 300px; right: -20%; top: -20%; }
          .banner-title { font-size: 1.75rem; }
          .banner-desc { font-size: 0.95rem; }
          .banner-content button { width: 100%; justify-content: center; }
          
          .banner-stats { width: 100%; justify-content: center; flex-wrap: wrap; }
          .banner-stat-box { flex: 1; min-width: 45%; padding: 1rem; }
          .stat-val { font-size: 1.75rem; }
          
          .cat-tabs { margin-bottom: 1rem; }
          .quiz-grid { grid-template-columns: 1fr; gap: 1rem; }
          .q-card-top, .q-card-body { padding: 1.25rem; }
          
          .widget { padding: 1.25rem; border-radius: 16px; }
        }
      `}</style>

      <main className="main-content" style={{ padding: 0, maxWidth: '100%', boxSizing: 'border-box' }}>
        <div className="dash-layout">
          
          {/* ================= СОЛ ЖАҚ ================= */}
          <div style={{ width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
            <div className="main-banner">
              <div className="banner-content">
                <div style={{ opacity: 0.9, fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'inherit', gap: '6px' }}>Қайырлы күн 👋</div>
                <h1 className="banner-title">Қош келдіңіз, {user}!</h1>
                <p className="banner-desc">
                  {totalTests > 0 ? `Осы аптада ${testsThisWeekCount} тест өттіңіз. Жалғастырыңыз!` : 'Тест тапсыруды бастаңыз!'}
                </p>
                <button 
                  onClick={scrollToQuizzes}
                  style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease' }}
                >
                  ▷ Оқуды жалғастыру
                </button>
              </div>
              <div className="banner-stats">
                <div className="banner-stat-box">
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>Өткен тесттер</span>
                  <span className="stat-val">{totalTests}</span>
                </div>
                <div className="banner-stat-box">
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>Орт. балл</span>
                  <span className="stat-val">{avgScore}%</span>
                </div>
              </div>
            </div>

            <div id="quizzes-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingTop: '0.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Қолжетімді тесттер</h2>
            </div>

            <div className="cat-tabs">
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`cat-tab ${activeCategory === cat ? 'active' : 'inactive'}`}>
                  {cat}
                </button>
              ))}
            </div>

            {filteredQuizzes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--bg-card)', borderRadius: '20px', border: '1px dashed var(--border)' }}>
                <h3 style={{ color: 'var(--text-muted)' }}>Осы категорияда әзірге тест жоқ</h3>
              </div>
            ) : (
              <div className="quiz-grid">
                {filteredQuizzes.map((q) => {
                  const bgColors = { Programming: '#ef4444', Web: '#3b82f6', Networks: '#0ea5e9', Security: '#8b5cf6' };
                  const qBg = bgColors[q.category] || '#10b981';
                  const icons = { Programming: '💻', Web: '🌐', Networks: '📡', Security: '🔒' };
                  const qIcon = icons[q.category] || '📝';

                  const questionCount = Array.isArray(q.questions) ? q.questions.length : 0;
                  const timeLimit = q.timeLimit || (questionCount * 60);

                  return (
                    <div key={q.id} className="q-card">
                      <div className="q-card-top" style={{ background: qBg, height: '90px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem' }}>{qIcon}</div>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>{q.difficulty || 'Белгісіз'}</div>
                      </div>
                      <div className="q-card-body">
                        <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', color: 'var(--text-primary)' }}>{q.title}</h3>
                        <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 }}>{q.description || `${q.category} бойынша біліміңізді тексеріңіз.`}</p>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontWeight: 500 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📄 {questionCount} сұрақ</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>⏱ {Math.floor(timeLimit / 60)} мин</span>
                        </div>

                        <Link to={`/quiz/${q.id}`} style={{ display: 'block', textAlign: 'center', border: '1px solid var(--border)', color: 'var(--primary)', background: 'var(--bg-page)', padding: '12px', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, transition: '0.2s' }}>
                          ▷ Тестті бастау
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ================= ОҢ ЖАҚ ВИДЖЕТТЕР ================= */}
          <div style={{ width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
            
            {/* Профиль XP */}
            <div className="widget">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: '56px', height: '56px', background: 'var(--primary)', color: 'white', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.6rem', fontWeight: 700, flexShrink: 0 }}>
                  {user.charAt(0).toUpperCase()}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user}</div>
                  <div style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 600 }}>{userStatus}</div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Апталық прогресс</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Осы аптадағы орт. балл</p>
                </div>
                <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
                  +{thisWeekAvg}% ↑
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '100px' }}>
                {weekScores.map((score, idx) => {
                  const isToday = idx === currentDayIndex;
                  const h = score > 0 ? Math.max(score, 10) : 0;
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                      <span style={{ fontSize: '0.7rem', color: isToday ? 'var(--primary)' : 'var(--text-muted)', fontWeight: isToday ? 700 : 600, opacity: score > 0 ? 1 : 0 }}>{score}</span>
                      <div style={{ width: '100%', maxWidth: '24px', height: '75px', background: 'var(--bg-page)', borderRadius: '6px', position: 'relative' }}>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${h}%`, background: isToday ? 'var(--primary)' : 'var(--border)', borderRadius: '6px', transition: '1s ease' }}></div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: isToday ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isToday ? 700 : 500 }}>{weekDays[idx]}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Рейтинг */}
            <div className="widget rank-widget">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🏆</span><h3 style={{ margin: 0, fontSize: '1.15rem', color: 'white' }}>Рейтинг</h3>
              </div>
              <p style={{ fontSize: '0.85rem', opacity: 0.9, lineHeight: 1.5, marginBottom: '1.5rem', color: '#cbd5e1' }}>Сіз жалпы рейтингте <strong>#{userRank}</strong> орындасыз.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                {top3.map((u, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: i===0?'#f59e0b':i===1?'#94a3b8':'#d97706', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.username}</div>
                    <div style={{ marginLeft: 'auto', fontWeight: 800, color: 'white' }}>{u.bestScore}%</div>
                  </div>
                ))}
              </div>
              <Link to="/leaderboard" style={{ display: 'block', textAlign: 'center', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px', color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>👥 Толық рейтингті көру</Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;