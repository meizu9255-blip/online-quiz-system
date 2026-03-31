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
      <>
        <Navbar />
        <main className="main-content" style={{textAlign: 'center', padding: '3rem'}}>Жүктелуде...</main>
      </>
    );
  }

  // 1. ТОЛЫҚ НӘТИЖЕНІ КӨРСЕТУ БӨЛІМІ
  if (showId && r) {
    const answersData = typeof r.answers === 'string' ? JSON.parse(r.answers) : r.answers;

    return (
      <>
        <Navbar />
        <main className="main-content">
          <div className="result-card" style={{ background: 'var(--bg-card)', padding: '3rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ color: getBadgeStyle(r.score).color, fontSize: '5rem', fontWeight: 800, textAlign: 'center', lineHeight: 1 }}>
              {r.score}%
            </div>
            <p style={{ fontWeight: 600, textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)' }}>
              {r.score >= 90 ? 'Тамаша нәтиже! Сіз керемет білім көрсеттіңіз!' : (r.score >= 70 ? 'Жақсы нәтиже!' : 'Тағы тырысып көріңіз!')}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '2rem 0', margin: '2rem 0' }}>
              <div style={{textAlign:'center'}}><div style={{color: '#10B981', fontSize: '1.75rem', fontWeight: 700}}>{r.correct_count}</div><div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>ДҰРЫС</div></div>
              <div style={{textAlign:'center'}}><div style={{color: '#EF4444', fontSize: '1.75rem', fontWeight: 700}}>{r.total_questions - r.correct_count}</div><div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>ҚАТЕ</div></div>
              <div style={{textAlign:'center'}}><div style={{color: '#3B82F6', fontSize: '1.75rem', fontWeight: 700}}>{r.total_questions}</div><div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>БАРЛЫҒЫ</div></div>
              <div style={{textAlign:'center'}}><div style={{color: '#F59E0B', fontSize: '1.75rem', fontWeight: 700}}>{formatTime(r.time_spent)}</div><div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>УАҚЫТ</div></div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Тест: {r.quiz_title} | Күні: {formatDate(r.date)} | Пайдаланушы: {r.username}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/results" className="btn btn-outline">Басты бет</Link>
              <Link to={`/quiz/${r.quiz_id}`} className="btn btn-primary">Қайта тапсыру</Link>
              <button className="btn btn-success" onClick={() => window.print()}>Баспаға шығару</button>
            </div>
          </div>

          <div style={{ marginTop: '3rem', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700 }}>Жауаптарды қарау</div>
          
          {answersData && answersData.map((ans, idx) => (
            <div key={idx} style={{ marginBottom: '1.5rem', background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                СҰРАҚ {idx + 1} <span style={{ color: ans.isCorrect ? '#10B981' : '#EF4444', marginLeft: '12px' }}>{ans.isCorrect ? 'ДҰРЫС' : 'ҚАТЕ'}</span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>{ans.question}</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {ans.options.map((opt, oIdx) => {
                  const isUser = ans.userAnswer === oIdx;
                  const isCorrect = ans.correctAnswer === oIdx;
                  
                  let border = '1px solid var(--border)';
                  let bg = 'transparent';
                  let label = '';
                  let textColor = 'var(--text-primary)';

                  if (isCorrect) { 
                    border = '1px solid #10B981'; bg = 'rgba(16, 185, 129, 0.05)'; label = 'Дұрыс жауап'; textColor = '#10B981';
                  } else if (isUser && !ans.isCorrect) { 
                    border = '1px solid #EF4444'; bg = 'rgba(239, 68, 68, 0.05)'; label = 'Сіздің жауап'; textColor = '#EF4444';
                  }

                  return (
                    <div key={oIdx} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: '8px', border: border, background: bg }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: isCorrect ? '#10B981' : (isUser ? '#EF4444' : 'var(--bg-page)'), color: (isCorrect || isUser) ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', fontWeight: 700, fontSize: '0.85rem' }}>
                        {String.fromCharCode(65 + oIdx)}
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)' }}>{opt}</div>
                      {label && <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 600, color: textColor }}>{label}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </main>
      </>
    );
  }

  // 2. БАРЛЫҚ НӘТИЖЕЛЕР КЕСТЕСІ БӨЛІМІ
  const myResults = results.filter(res => res.username === currentUser);

  return (
    <>
      <Navbar />
      <main className="main-content">
        <div style={{marginBottom: '2rem'}}>
          <h1 style={{fontSize: '1.75rem', marginBottom: '0.5rem'}}>Менің нәтижелерім</h1>
          <p style={{color: 'var(--text-muted)'}}>Барлық тапсырылған тесттер тарихы</p>
        </div>
        
        <div className="results-table-container" style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table className="results-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>
              <tr>
                <th style={{padding: '1.25rem 1.5rem'}}>NO</th>
                <th style={{padding: '1.25rem 1.5rem'}}>ТЕСТ</th>
                <th style={{padding: '1.25rem 1.5rem'}}>БАЛЛ</th>
                <th style={{padding: '1.25rem 1.5rem'}}>ДҰРЫС</th>
                <th style={{padding: '1.25rem 1.5rem'}}>УАҚЫТ</th>
                <th style={{padding: '1.25rem 1.5rem'}}>КҮНІ</th>
                <th style={{padding: '1.25rem 1.5rem'}}>ӘРЕКЕТ</th>
              </tr>
            </thead>
            <tbody>
              {myResults.length > 0 ? (
                myResults.map((res, index) => {
                  const style = getBadgeStyle(res.score);
                  return (
                    <tr key={res.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{padding: '1.25rem 1.5rem', fontWeight: 600}}>{index + 1}</td>
                      <td style={{padding: '1.25rem 1.5rem', fontWeight: 600}}>{res.quiz_title}</td>
                      <td style={{padding: '1.25rem 1.5rem'}}>
                        <span style={{ background: style.bg, color: style.color, padding: '4px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem' }}>
                          {res.score}%
                        </span>
                      </td>
                      <td style={{padding: '1.25rem 1.5rem', color: 'var(--text-secondary)'}}>{res.correct_count} / {res.total_questions}</td>
                      <td style={{padding: '1.25rem 1.5rem', color: 'var(--text-secondary)'}}>{formatTime(res.time_spent)}</td>
                      <td style={{padding: '1.25rem 1.5rem', color: 'var(--text-secondary)'}}>{formatDate(res.date)}</td>
                      <td style={{padding: '1.25rem 1.5rem'}}>
                        <Link to={`/results?id=${res.id}`} className="btn btn-outline" style={{ padding: '6px 16px', fontSize: '0.8rem', borderRadius: '6px' }}>Қарау</Link>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr><td colSpan="7" style={{textAlign: 'center', padding: '3rem', color: 'var(--text-muted)'}}>Әлі тест тапсырмағансыз</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
};

export default Results;