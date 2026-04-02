import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const Results = () => {
  const [searchParams] = useSearchParams();
  const showId = searchParams.get('id');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = localStorage.getItem('currentUser') || 'Қонақ';

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/results');
        setResults(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Дерек алу қатесі:", error);
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const formatTime = (seconds) => {
    if (!seconds) return "0 мин 0 сек";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins > 0 ? mins + ' мин ' : '0 мин '}${secs} сек`;
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    const h = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    return `${d}.${m}.${y} ${h}:${min}`;
  };

  const getBadgeStyle = (score) => {
    if (score >= 90) return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }; 
    if (score >= 70) return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }; 
    if (score >= 50) return { bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }; 
    return { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }; 
  };

  const r = results.find(res => String(res.id) === String(showId));

  if (loading) {
    return (
      <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
        <Navbar />
        <main className="main-content" style={{textAlign: 'center', padding: '3rem', color: 'var(--text-primary)'}}>Жүктелуде...</main>
      </div>
    );
  }

  // 1. ТОЛЫҚ НӘТИЖЕНІ КӨРСЕТУ БӨЛІМІ
  if (showId && r) {
    const answersData = typeof r.answers === 'string' ? JSON.parse(r.answers) : r.answers;

    return (
      <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
        <Navbar />
        
        <style>{`
          .res-container { max-width: 1000px; margin: 0 auto; padding: 2rem; }
          .res-card { background: var(--bg-card); padding: 3rem; border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
          .stats-row { display: flex; justify-content: center; gap: 4rem; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 2rem 0; margin: 2rem 0; }
          .action-btns { margin-top: 2rem; display: flex; gap: 1rem; justify-content: center; }
          
          /* МОБИЛЬДІ АДАПТИВТІЛІК */
          @media (max-width: 768px) {
            .res-container { padding: 1rem; }
            .res-card { padding: 1.5rem; }
            .stats-row { gap: 1.5rem; flex-wrap: wrap; padding: 1.5rem 0; }
            .stats-row > div { width: 40%; } /* Телефонда 2 қатармен тұрады */
            .action-btns { flex-direction: column; }
            .action-btns a, .action-btns button { width: 100%; text-align: center; }
          }
        `}</style>

        <main className="main-content res-container">
          <div className="res-card">
            <div style={{ color: getBadgeStyle(r.score).color, fontSize: '5rem', fontWeight: 800, textAlign: 'center', lineHeight: 1 }}>
              {r.score}%
            </div>
            <p style={{ fontWeight: 600, textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)' }}>
              {r.score >= 90 ? 'Тамаша нәтиже! Сіз керемет білім көрсеттіңіз!' : (r.score >= 70 ? 'Жақсы нәтиже!' : 'Тағы тырысып көріңіз!')}
            </p>

            <div className="stats-row">
              <div style={{textAlign:'center'}}><div style={{color: '#10B981', fontSize: '1.75rem', fontWeight: 700}}>{r.correct_count}</div><div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px'}}>ДҰРЫС</div></div>
              <div style={{textAlign:'center'}}><div style={{color: '#EF4444', fontSize: '1.75rem', fontWeight: 700}}>{r.total_questions - r.correct_count}</div><div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px'}}>ҚАТЕ</div></div>
              <div style={{textAlign:'center'}}><div style={{color: '#3B82F6', fontSize: '1.75rem', fontWeight: 700}}>{r.total_questions}</div><div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px'}}>БАРЛЫҒЫ</div></div>
              <div style={{textAlign:'center'}}><div style={{color: '#F59E0B', fontSize: '1.75rem', fontWeight: 700}}>{formatTime(r.time_spent)}</div><div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px'}}>УАҚЫТ</div></div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Тест: {r.quiz_title} | Күні: {formatDate(r.date)} | Пайдаланушы: {r.username}
            </div>

            <div className="action-btns">
              <Link to="/results" style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid var(--border)', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600, background: 'var(--bg-page)' }}>Басты бет</Link>
              <Link to={`/quiz/${r.quiz_id}`} style={{ padding: '12px 24px', borderRadius: '8px', background: 'var(--primary)', color: 'white', textDecoration: 'none', fontWeight: 600 }}>Қайта тапсыру</Link>
              <button style={{ padding: '12px 24px', borderRadius: '8px', background: '#10b981', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }} onClick={() => window.print()}>Баспаға шығару</button>
            </div>
          </div>

          <div style={{ marginTop: '3rem', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Жауаптарды қарау</div>
          
          {answersData && answersData.map((ans, idx) => {
            // 1. БАЗАДАН КЕЛГЕН ЖАУАПТЫ ТҮЗЕТУ ЛОГИКАСЫ (ИНДЕКСТІ МӘТІНГЕ АЙНАЛДЫРУ)
            let correctText = ans.correctAnswer;
            if (!isNaN(correctText) && String(correctText).trim() !== '' && Number(correctText) >= 0 && Number(correctText) < ans.options.length) {
              correctText = ans.options[Number(correctText)];
            }

            let userText = ans.userAnswer;
            if (!isNaN(userText) && String(userText).trim() !== '' && Number(userText) >= 0 && Number(userText) < ans.options.length) {
              userText = ans.options[Number(userText)];
            }

            // Шынайы дұрыстығын тексеру
            const isTrulyCorrect = String(userText).trim() === String(correctText).trim();

            const correctIndex = ans.options.findIndex(opt => String(opt).trim() === String(correctText).trim());
            const correctLetter = correctIndex !== -1 ? String.fromCharCode(65 + correctIndex) : '';

            return (
              <div key={idx} style={{ marginBottom: '1.5rem', background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <div style={{ marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  СҰРАҚ {idx + 1} <span style={{ color: isTrulyCorrect ? '#10B981' : '#EF4444', marginLeft: '12px' }}>{isTrulyCorrect ? 'ДҰРЫС' : 'ҚАТЕ'}</span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{ans.question}</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {ans.options.map((opt, oIdx) => {
                    const isUserSelected = String(userText).trim() === String(opt).trim();
                    const isActuallyCorrect = String(correctText).trim() === String(opt).trim();
                    
                    let border = '1px solid var(--border)';
                    let bg = 'transparent';
                    let textColor = 'var(--text-primary)';
                    let circleBg = 'var(--bg-page)';
                    let circleColor = 'var(--text-secondary)';

                    if (isUserSelected) { 
                      if (isActuallyCorrect) {
                        border = '1px solid #10B981'; bg = 'rgba(16, 185, 129, 0.05)'; textColor = '#10B981'; circleBg = '#10B981'; circleColor = 'white';
                      } else {
                        border = '1px solid #EF4444'; bg = 'rgba(239, 68, 68, 0.05)'; textColor = '#EF4444'; circleBg = '#EF4444'; circleColor = 'white';
                      }
                    } else if (isActuallyCorrect) {
                      border = '1px solid #10B981'; bg = 'transparent'; textColor = '#10B981'; circleBg = 'transparent'; circleColor = '#10B981';
                    }

                    return (
                      <div key={oIdx} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: '8px', border: border, background: bg }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: circleBg, color: circleColor, border: isActuallyCorrect && !isUserSelected ? '1px solid #10B981' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                          {String.fromCharCode(65 + oIdx)}
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 500, color: textColor }}>{opt}</div>
                        
                        {isUserSelected && (
                          <div style={{ marginLeft: 'auto', fontSize: '1.2rem', color: textColor, fontWeight: 800 }}>
                            {isActuallyCorrect ? '✓' : '✗'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!isTrulyCorrect && (
                  <div style={{ marginTop: '1.5rem', padding: '16px', background: 'rgba(16, 185, 129, 0.05)', borderLeft: '4px solid #10b981', borderRadius: '0 8px 8px 0', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>💡</span>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Дұрыс жауап:</div>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {correctLetter ? `${correctLetter}) ` : ''}{correctText}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </main>
      </div>
    );
  }

  // 2. БАРЛЫҚ НӘТИЖЕЛЕР КЕСТЕСІ БӨЛІМІ
  const myResults = results.filter(res => res.username === currentUser);

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <style>{`
        .table-container { background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border); overflow-x: auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
        .res-table { width: 100%; border-collapse: collapse; min-width: 700px; }
        .res-table th { padding: 1.25rem 1.5rem; background: var(--bg-page); border-bottom: 1px solid var(--border); text-align: left; font-size: 0.75rem; color: var(--text-muted); letter-spacing: 1px; text-transform: uppercase; }
        .res-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); }
        
        @media (max-width: 768px) {
          .main-content { padding: 1rem !important; }
        }
      `}</style>

      <main className="main-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{marginBottom: '1.5rem'}}>
          <h1 style={{fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-primary)'}}>Менің нәтижелерім</h1>
          <p style={{color: 'var(--text-muted)', margin: 0}}>Барлық тапсырылған тесттер тарихы</p>
        </div>
        
        <div className="table-container">
          <table className="res-table">
            <thead>
              <tr>
                <th>NO</th>
                <th>ТЕСТ</th>
                <th>БАЛЛ</th>
                <th>ДҰРЫС</th>
                <th>УАҚЫТ</th>
                <th>КҮНІ</th>
                <th>ӘРЕКЕТ</th>
              </tr>
            </thead>
            <tbody>
              {myResults.length > 0 ? (
                myResults.map((res, index) => {
                  const style = getBadgeStyle(res.score);
                  return (
                    <tr key={res.id}>
                      <td style={{fontWeight: 600, color: 'var(--text-secondary)'}}>{index + 1}</td>
                      <td style={{fontWeight: 600, color: 'var(--text-primary)'}}>{res.quiz_title}</td>
                      <td>
                        <span style={{ background: style.bg, color: style.color, padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem' }}>
                          {res.score}%
                        </span>
                      </td>
                      <td style={{color: 'var(--text-secondary)', fontWeight: 500}}>{res.correct_count} / {res.total_questions}</td>
                      <td style={{color: 'var(--text-secondary)', fontWeight: 500}}>{formatTime(res.time_spent)}</td>
                      <td style={{color: 'var(--text-secondary)', fontWeight: 500}}>{formatDate(res.date)}</td>
                      <td>
                        <Link to={`/results?id=${res.id}`} style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid var(--border)', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, background: 'var(--bg-page)', cursor: 'pointer', whiteSpace: 'nowrap' }}>Қарау</Link>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr><td colSpan="7" style={{textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', fontWeight: 500}}>Әлі тест тапсырмағансыз</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Results;