import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import Navbar from '../components/Navbar';

const Profile = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const currentUser = localStorage.getItem('currentUser') || 'Қонақ';
  
  const [newUsername, setNewUsername] = useState(currentUser);
  const [email, setEmail] = useState(`${currentUser.toLowerCase().replace(/\s+/g, '')}@quiz.kz`);
  const [password, setPassword] = useState('');

  const [analytics, setAnalytics] = useState({ radarData: [], totalMistakes: 0 });

  useEffect(() => {
    const fetchMyResults = async () => {
      try {
        const response = await axios.get('https://online-quiz-system-ufwp.onrender.com/api/results');
        const myData = response.data.filter(r => r.username === currentUser);
        setResults(myData);

        try {
            const statRes = await axios.get(`https://online-quiz-system-ufwp.onrender.com/api/analytics/${currentUser}`);
            setAnalytics(statRes.data);
        } catch (e) {
            console.error("Аналитика қатесі:", e);
        }

      } catch (error) {
        console.error("Дерек алу қатесі:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyResults();
  }, [currentUser]);

  const totalTests = results.length;
  const avgScore = totalTests > 0 ? Math.round(results.reduce((acc, curr) => acc + Number(curr.score), 0) / totalTests) : 0;
  const bestScore = totalTests > 0 ? Math.max(...results.map(r => Number(r.score))) : 0;
  const recentResults = [...results].reverse().slice(0, 5);

  let userStatus = "🎓 Жаңа оқушы";
  if (totalTests > 0) {
    if (avgScore >= 80) userStatus = "⭐ Озат оқушы";
    else if (avgScore >= 60) userStatus = "🌟 Жақсы оқушы";
    else userStatus = "📚 Талпынушы";
  }
  const currentXP = totalTests * 50 + Math.floor(avgScore * 10);
  const maxXP = Math.ceil((currentXP + 1) / 1000) * 1000 || 1000;
  const xpPercent = Math.min(Math.round((currentXP / maxXP) * 100), 100);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (newUsername.trim().length >= 3) {
      localStorage.setItem('currentUser', newUsername);
      alert("Профиль ақпараты сәтті жаңартылды!");
      window.location.reload(); 
    } else {
      alert("Пайдаланушы аты кемінде 3 таңбадан тұруы тиіс!");
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-page)' }}><div style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div><style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style></div>;

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      
      <style>{`
        .profile-layout { max-width: 1200px; margin: 2.5rem auto; padding: 0 2rem; display: grid; grid-template-columns: 380px 1fr; gap: 2.5rem; }
        
        .animate-fade-in { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; transform: translateY(15px); }
        .delay-1 { animation-delay: 0.1s; } .delay-2 { animation-delay: 0.2s; }
        @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }

        .widget { background: var(--bg-card); border-radius: 24px; border: 1px solid var(--border); padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); margin-bottom: 2rem; }
        
        .p-avatar-wrap { display: flex; justify-content: center; position: relative; margin-top: -60px; margin-bottom: 1rem; z-index: 10; }
        .p-avatar { width: 110px; height: 110px; border-radius: 50%; background: linear-gradient(135deg, #4f46e5, #8b5cf6); color: white; display: flex; align-items: center; justify-content: center; font-size: 3.5rem; font-weight: 800; border: 6px solid var(--bg-card); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        
        .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--border); }
        .stat-box { text-align: center; }
        .stat-val { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin-bottom: 4px; }
        .stat-lbl { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .input-grp { margin-bottom: 1.5rem; }
        .input-lbl { display: block; font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
        .input-fld { width: 100%; padding: 12px 16px; border: 1px solid var(--border); background: var(--bg-input); border-radius: 12px; font-size: 0.95rem; color: var(--text-primary); transition: 0.2s; outline: none; box-sizing: border-box; }
        .input-fld:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
        
        .btn-blue { background: var(--primary); color: white; border: none; padding: 14px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 1rem; }
        .btn-blue:hover { filter: brightness(1.1); }

        /* МОБИЛЬДІ АДАПТИВТІЛІК */
        @media (max-width: 992px) {
          .profile-layout { grid-template-columns: 1fr; padding: 0 1.5rem; }
        }
        @media (max-width: 768px) {
          .profile-layout { padding: 0 1rem; margin: 1rem auto; gap: 1rem; }
          .form-grid { grid-template-columns: 1fr; gap: 0; }
          .p-avatar { width: 90px; height: 90px; font-size: 2.5rem; margin-top: -45px; }
          .stat-val { font-size: 1.25rem; }
          .widget { padding: 1.25rem; border-radius: 16px; margin-bottom: 1rem; }
          .stat-grid { margin-top: 1.5rem; padding-top: 1.5rem; gap: 0.5rem; }
          .btn-blue { padding: 12px; font-size: 0.95rem; width: 100%; display: block; }
          .widget h2 { font-size: 1.15rem !important; }
        }
      `}</style>

      <div className="profile-layout">
        
        {/* СОЛ ЖАҚ: ПРОФИЛЬ */}
        <div className="animate-fade-in">
          <div style={{ background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            
            <div style={{ height: '120px', background: 'linear-gradient(135deg, var(--border) 0%, var(--bg-card) 100%)', borderRadius: '24px 24px 0 0', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.2, backgroundImage: 'radial-gradient(var(--text-secondary) 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }}></div>
            </div>
            
            <div style={{ padding: '0 2rem 2rem 2rem' }}>
              <div className="p-avatar-wrap">
                <div className="p-avatar">{currentUser.charAt(0).toUpperCase()}</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{currentUser}</h2>
                <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{email}</p>
                <div style={{ display: 'inline-block', background: 'var(--warning-light)', color: 'var(--warning)', padding: '6px 16px', borderRadius: '20px', fontWeight: 700, fontSize: '0.85rem', border: '1px solid var(--warning)' }}>
                  {userStatus}
                </div>
              </div>

              <div style={{ marginTop: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <span>XP Прогресі</span>
                  <span style={{ color: 'var(--primary)' }}>{currentXP} / {maxXP} XP</span>
                </div>
                <div style={{ height: '10px', background: 'var(--bg-page)', borderRadius: '5px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{ width: `${xpPercent}%`, height: '100%', background: 'var(--primary)', borderRadius: '5px', transition: 'width 1s ease' }}></div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>Келесі деңгейге дейін {maxXP - currentXP} XP қалды</div>
              </div>

              <div className="stat-grid">
                <div className="stat-box">
                  <div className="stat-val">{totalTests}</div>
                  <div className="stat-lbl">Тесттер</div>
                </div>
                <div className="stat-box">
                  <div className="stat-val" style={{ color: 'var(--success)' }}>{avgScore}%</div>
                  <div className="stat-lbl">Орташа</div>
                </div>
                <div className="stat-box">
                  <div className="stat-val" style={{ color: 'var(--warning)' }}>{bestScore}%</div>
                  <div className="stat-lbl">Рекорд</div>
                </div>
              </div>
            </div>
          </div>

          {/* ЖАҢА АНАЛИТИКА ЖӘНЕ ҚАТЕМЕН ЖҰМЫС БӨЛІМІ */}
          <div className="widget animate-fade-in delay-1" style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Аналитика (Radar)</h2>
                  <span style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '6px 12px', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem' }}>
                      {analytics.totalMistakes} қате жіберілді
                  </span>
              </div>
              
              {analytics.radarData && analytics.radarData.length > 0 ? (
                  <div style={{ width: '100%', height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="60%" data={analytics.radarData}>
                              <PolarGrid stroke="var(--border)" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 600 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                              <Radar name="Білім деңгейі" dataKey="A" stroke="#8b5cf6" strokeWidth={3} fill="#8b5cf6" fillOpacity={0.4} />
                          </RadarChart>
                      </ResponsiveContainer>
                  </div>
              ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Аналитика жиналуда...</div>
              )}

              <button 
                  onClick={() => navigate('/quiz/smart')} 
                  disabled={analytics.totalMistakes === 0}
                  style={{ width: '100%', padding: '16px', borderRadius: '16px', background: analytics.totalMistakes > 0 ? 'linear-gradient(135deg, #ef4444, #f97316)' : 'var(--bg-input)', color: analytics.totalMistakes > 0 ? 'white' : 'var(--text-muted)', border: 'none', fontWeight: 800, fontSize: '1.05rem', cursor: analytics.totalMistakes > 0 ? 'pointer' : 'not-allowed', marginTop: '1rem', transition: '0.3s', boxShadow: analytics.totalMistakes > 0 ? '0 4px 15px rgba(239, 68, 68, 0.4)' : 'none' }}>
                  🔥 ҚАТЕЛЕРМЕН ЖҰМЫС (SMART QUIZ)
              </button>
          </div>
        </div>

        {/* ОҢ ЖАҚ: ПАРАМЕТРЛЕР ЖӘНЕ ТАРИХ */}
        <div className="animate-fade-in delay-1">
          
          <div className="widget">
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Профильді өңдеу</h2>
            
            <form onSubmit={handleUpdateProfile}>
              <div className="form-grid">
                <div className="input-grp">
                  <label className="input-lbl">Пайдаланушы аты</label>
                  <input 
                    type="text" 
                    className="input-fld" 
                    value={newUsername} 
                    onChange={(e) => setNewUsername(e.target.value)} 
                    required 
                  />
                </div>
                <div className="input-grp">
                  <label className="input-lbl">Email мекенжайы</label>
                  <input 
                    type="email" 
                    className="input-fld" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
              </div>
              
              <div className="input-grp">
                <label className="input-lbl">Жаңа құпия сөз</label>
                <input 
                  type="password" 
                  className="input-fld" 
                  placeholder="Құпия сөзді өзгерту үшін енгізіңіз" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="submit" className="btn-blue" style={{ width: 'auto' }}>Өзгерістерді сақтау</button>
              </div>
            </form>
          </div>

          <div className="widget animate-fade-in delay-2">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Соңғы нәтижелер</h2>
              <Link to="/results" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>Толық тарих {'>'}</Link>
            </div>
            
            {recentResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📭</div>
                <p style={{ margin: 0 }}>Сіз әлі тест тапсырмағансыз.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentResults.map((r, i) => {
                  const numScore = Number(r.score);
                  let badgeBg = 'var(--danger-light)'; let badgeColor = 'var(--danger)';
                  if (numScore >= 90) { badgeBg = 'var(--success-light)'; badgeColor = 'var(--success)'; }
                  else if (numScore >= 70) { badgeBg = 'var(--primary-light)'; badgeColor = 'var(--primary)'; }
                  else if (numScore >= 50) { badgeBg = 'var(--warning-light)'; badgeColor = 'var(--warning)'; }

                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-input)', borderRadius: '16px', border: '1px solid var(--border)', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{r.quiz_title || r.quizTitle || 'Тест'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(r.date).toLocaleString('kk-KZ')}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{r.correct_count}/{r.total_questions} дұрыс</div>
                        <span style={{ background: badgeBg, color: badgeColor, padding: '6px 12px', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 800 }}>
                          {numScore}%
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;