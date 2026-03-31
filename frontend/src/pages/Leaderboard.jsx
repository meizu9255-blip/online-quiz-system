import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Жадтан қазіргі пайдаланушыны аламыз
  const currentUser = localStorage.getItem('currentUser') || 'Қонақ';

  useEffect(() => {
    const fetchAllResults = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/results');
        const allResults = response.data;
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

        const processedUsers = Object.values(userStats).map(user => ({
          ...user,
          avgScore: Math.round(user.totalScore / user.tests)
        }));

        processedUsers.sort((a, b) => {
          if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
          return b.avgScore - a.avgScore; 
        });

        setLeaderboardData(processedUsers);
      } catch (error) {
        console.error("Рейтингті алу кезінде қате кетті:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllResults();
  }, []);

  const topThree = leaderboardData.slice(0, 3);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-page)' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      
      <style>{`
        .lead-layout { max-width: 900px; margin: 2rem auto; padding: 0 1.5rem; }
        .animate-fade-in { animation: fadeInUp 0.5s ease-out forwards; opacity: 0; transform: translateY(10px); }
        .delay-1 { animation-delay: 0.1s; } .delay-2 { animation-delay: 0.2s; }
        @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }

        /* ПОДИУМ */
        .podium-wrap { display: flex; justify-content: center; align-items: flex-end; gap: 1.5rem; margin: 3rem 0; height: 280px; }
        
        .p-card { 
          background: var(--bg-card); 
          border-radius: 20px; 
          border: 2px solid var(--border); 
          text-align: center; 
          width: 170px; 
          position: relative; 
          box-shadow: 0 10px 20px -5px rgba(0,0,0,0.05); 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: flex-end; /* Бәрін төменге ығыстырамыз */
          padding: 0 1rem 1.5rem 1rem; /* Тек астына padding береміз */
        }
        
        .p-gold { border-color: #f59e0b; z-index: 2; height: 250px; background: linear-gradient(to bottom, var(--bg-card) 50%, rgba(245,158,11,0.08)); }
        .p-silver { border-color: #94a3b8; height: 210px; background: linear-gradient(to bottom, var(--bg-card) 50%, rgba(148,163,184,0.05)); }
        .p-bronze { border-color: #d97706; height: 190px; background: linear-gradient(to bottom, var(--bg-card) 50%, rgba(217,119,6,0.05)); }
        
        .p-rank { 
          width: 44px; height: 44px; border-radius: 50%; color: white; 
          display: flex; align-items: center; justify-content: center; 
          font-weight: 800; font-size: 1.2rem; 
          position: absolute; top: -22px; left: 50%; transform: translateX(-50%); 
          border: 4px solid var(--bg-page); box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 5; 
        }
        .p-gold .p-rank { background: linear-gradient(135deg, #f59e0b, #fbbf24); width: 52px; height: 52px; top: -26px; font-size: 1.5rem; }
        .p-silver .p-rank { background: linear-gradient(135deg, #94a3b8, #cbd5e1); }
        .p-bronze .p-rank { background: linear-gradient(135deg, #d97706, #b45309); }
        
        .p-avatar { width: 60px; height: 60px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 1.8rem; font-weight: 800; margin-bottom: 0.75rem; color: white; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .p-gold .p-avatar { width: 74px; height: 74px; font-size: 2.2rem; margin-bottom: 1rem; }
        
        .p-name { font-weight: 800; font-size: 1.1rem; color: var(--text-primary); margin-bottom: 4px; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .p-gold .p-name { font-size: 1.25rem; }
        
        .p-score { font-weight: 800; font-size: 1.6rem; color: var(--primary); margin-bottom: 4px; line-height: 1; }
        .p-gold .p-score { font-size: 2.2rem; color: #f59e0b; }
        
        .p-lbl { font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

        /* КЕСТЕ */
        .t-container { background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
        .table-scroll { max-height: 500px; overflow-y: auto; border-radius: 0 0 20px 20px; }
        .table-scroll::-webkit-scrollbar { width: 8px; }
        .table-scroll::-webkit-scrollbar-track { background: var(--bg-page); }
        .table-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
        
        .lead-table { width: 100%; border-collapse: collapse; text-align: left; }
        .lead-table th { padding: 1rem 1.5rem; background: var(--bg-page); font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 10;}
        .lead-table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border); color: var(--text-primary); font-weight: 600; font-size: 0.95rem; }
        .lead-table tr:last-child td { border-bottom: none; }
        .lead-table tr:hover td { background: rgba(148, 163, 184, 0.05); }
        
        .t-rank { width: 34px; height: 34px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; background: var(--bg-page); color: var(--text-secondary); }
        .t-mini-av { width: 32px; height: 32px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; }
        .score-badge { background: var(--primary-light); color: var(--primary); padding: 4px 10px; border-radius: 8px; font-weight: 800; font-size: 0.9rem; }
      `}</style>

      <div className="lead-layout">
        
        <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>🏆 Жалпы рейтинг</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0, fontWeight: 500 }}>Сайттағы ең үздік оқушылар көшбасшысы (1-100 орын)</p>
        </div>

        {leaderboardData.length === 0 ? (
          <div className="animate-fade-in delay-1" style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Рейтинг әзірге бос</h3>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem' }}>Жүйеде әлі ешкім тест тапсырмаған.</p>
          </div>
        ) : (
          <>
            {/* ТОП-3 ПОДИУМ */}
            <div className="podium-wrap animate-fade-in delay-1">
              {topThree[1] && (
                <div className="p-card p-silver">
                  <div className="p-rank">2</div>
                  <div className="p-avatar" style={{ background: '#94a3b8' }}>
                    {topThree[1].username.charAt(0).toUpperCase()}
                  </div>
                  <div className="p-name" title={topThree[1].username}>{topThree[1].username}</div>
                  <div className="p-score" style={{ color: 'var(--text-primary)' }}>{topThree[1].bestScore}%</div>
                  <div className="p-lbl">Рекорд</div>
                </div>
              )}

              {topThree[0] && (
                <div className="p-card p-gold">
                  <div className="p-rank">1</div>
                  <div className="p-avatar" style={{ background: '#f59e0b' }}>
                    {topThree[0].username.charAt(0).toUpperCase()}
                  </div>
                  <div className="p-name" title={topThree[0].username}>{topThree[0].username}</div>
                  <div className="p-score">{topThree[0].bestScore}%</div>
                  <div className="p-lbl">Рекорд</div>
                </div>
              )}

              {topThree[2] && (
                <div className="p-card p-bronze">
                  <div className="p-rank">3</div>
                  <div className="p-avatar" style={{ background: '#d97706' }}>
                    {topThree[2].username.charAt(0).toUpperCase()}
                  </div>
                  <div className="p-name" title={topThree[2].username}>{topThree[2].username}</div>
                  <div className="p-score" style={{ color: 'var(--text-primary)' }}>{topThree[2].bestScore}%</div>
                  <div className="p-lbl">Рекорд</div>
                </div>
              )}
            </div>

            {/* БАРЛЫҚ ҚАТЫСУШЫЛАР КЕСТЕСІ (1-ден 100-ге дейін сыяды) */}
            <div className="t-container animate-fade-in delay-2">
              <div className="table-scroll">
                <table className="lead-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px', textAlign: 'center' }}>Орын</th>
                      <th>Пайдаланушы</th>
                      <th style={{ textAlign: 'center' }}>Тесттер саны</th>
                      <th style={{ textAlign: 'center' }}>Орташа балл</th>
                      <th style={{ textAlign: 'center' }}>Ең жоғары</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.map((u, index) => {
                      const isMe = u.username === currentUser;
                      
                      // МЕДАЛЬДАР ЛОГИКАСЫ
                      let rankDisplay = index + 1;
                      let rankStyle = { background: 'var(--bg-page)', color: 'var(--text-secondary)' };
                      
                      if (index === 0) { rankDisplay = '🥇'; rankStyle = { background: 'rgba(245,158,11,0.15)', fontSize: '1.2rem' }; }
                      else if (index === 1) { rankDisplay = '🥈'; rankStyle = { background: 'rgba(148,163,184,0.15)', fontSize: '1.2rem' }; }
                      else if (index === 2) { rankDisplay = '🥉'; rankStyle = { background: 'rgba(217,119,6,0.15)', fontSize: '1.2rem' }; }

                      return (
                        <tr key={index} style={{ background: isMe ? 'var(--primary-light)' : 'transparent' }}>
                          <td style={{ textAlign: 'center' }}>
                            <span className="t-rank" style={rankStyle}>{rankDisplay}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div className="t-mini-av" style={{ background: isMe ? 'var(--primary)' : '#94a3b8' }}>
                                {u.username.charAt(0).toUpperCase()}
                              </div>
                              <span style={{ color: isMe ? 'var(--primary)' : 'var(--text-primary)', fontWeight: isMe ? 800 : 600 }}>
                                {u.username} 
                                {isMe && <span style={{ fontSize: '0.7rem', background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px', fontWeight: 700 }}>Сіз</span>}
                              </span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{u.tests}</td>
                          <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{u.avgScore}%</td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="score-badge">{u.bestScore}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;