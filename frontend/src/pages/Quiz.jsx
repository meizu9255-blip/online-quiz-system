import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { quizzes } from '../data/quizzes';

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentQuiz = quizzes.find(q => q.id === parseInt(id));
  const user = localStorage.getItem('currentUser') || 'Қонақ';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(currentQuiz?.questions?.length || 10).fill(-1));
  const [flagged, setFlagged] = useState(Array(currentQuiz?.questions?.length || 10).fill(false));
  const [timeLeft, setTimeLeft] = useState(currentQuiz?.timeLimit || 300);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!currentQuiz) return;
    if (timeLeft <= 0) { handleFinish(); return; }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, currentQuiz]);

  const handleFinish = async () => {
    setIsSubmitting(true);
    const detailedAnswers = currentQuiz.questions.map((q, i) => ({
      question: q.question, options: q.options, userAnswer: answers[i],
      correctAnswer: q.correctAnswer, isCorrect: answers[i] === q.correctAnswer
    }));
    let correctCount = detailedAnswers.filter(a => a.isCorrect).length;
    const newResult = {
      quizId: currentQuiz.id, quizTitle: currentQuiz.title,
      score: Math.round((correctCount / currentQuiz.questions.length) * 100),
      correctCount, totalQuestions: currentQuiz.questions.length,
      timeSpent: currentQuiz.timeLimit - timeLeft, username: user, answers: detailedAnswers
    };
    try {
      const response = await axios.post('http://localhost:5000/api/results', newResult);
      navigate(`/results?id=${response.data.id}`);
    } catch (error) {
      alert("Сервер қатесі!"); navigate('/dashboard');
    }
  };

  if (!currentQuiz) return <div>Тест табылмады</div>;

  const q = currentQuiz.questions[currentIndex];
  const answeredCount = answers.filter(a => a !== -1).length;
  const progressPercent = Math.round((answeredCount / currentQuiz.questions.length) * 100);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .q-top { background: white; height: 70px; display: flex; justify-content: space-between; align-items: center; padding: 0 2rem; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 10; }
        .q-layout { max-width: 1200px; margin: 2rem auto; display: grid; grid-template-columns: 1fr 340px; gap: 2rem; padding: 0 2rem; }
        .q-main { background: white; border-radius: 24px; padding: 2.5rem; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
        
        .opt-item { border: 2px solid #e2e8f0; border-radius: 16px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; cursor: pointer; display: flex; align-items: center; gap: 1rem; transition: 0.2s; font-weight: 500; color: #334155; }
        .opt-item:hover { border-color: #cbd5e1; background: #f8fafc; }
        .opt-item.selected { border-color: #4f46e5; background: #eef2ff; color: #312e81; }
        
        .opt-circle { width: 36px; height: 36px; border-radius: 50%; background: #f1f5f9; display: flex; justify-content: center; align-items: center; font-weight: 700; color: #64748b; flex-shrink: 0; }
        .opt-item.selected .opt-circle { background: #4f46e5; color: white; }
        .opt-check { width: 24px; height: 24px; border-radius: 50%; border: 2px solid #4f46e5; display: flex; justify-content: center; align-items: center; color: #4f46e5; font-size: 0.8rem; margin-left: auto; }
        
        .q-nav-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 1.5rem; }
        .n-btn { height: 44px; border-radius: 12px; border: 1px solid #e2e8f0; background: white; font-weight: 600; color: #64748b; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
        .n-btn.answered { background: #ecfdf5; border-color: #10b981; color: #059669; }
        .n-btn.flagged { border-color: #f59e0b; border-width: 2px; }
        .n-btn.current { background: #4f46e5; color: white; border-color: #4f46e5; }
        
        .b-blue { background: #4f46e5; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .b-blue:hover { background: #4338ca; box-shadow: 0 4px 12px rgba(79,70,229,0.2); }
        .b-blue:disabled { opacity: 0.7; cursor: not-allowed; }
      `}</style>

      {/* ЖОҒАРҒЫ ПАНЕЛЬ */}
      <div className="q-top">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: '#4f46e5', color: 'white', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>⚡</span> QuizKZ
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>{currentQuiz.icon}</span>
            <span style={{ fontWeight: 600, color: '#1e293b' }}>{currentQuiz.title}</span>
            <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{currentQuiz.category}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '250px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>{currentIndex + 1}/{currentQuiz.questions.length}</span>
            <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPercent}%`, background: '#4f46e5', transition: '0.3s ease' }}></div>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>{answeredCount} жауап</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#eff6ff', color: '#3b82f6', padding: '8px 16px', borderRadius: '12px', fontWeight: 700, fontSize: '1rem' }}>
            ⏱ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          <button className="b-blue" onClick={handleFinish} disabled={isSubmitting}>{isSubmitting ? 'Күтіңіз...' : 'Тестті аяқтау'}</button>
        </div>
      </div>

      <div className="q-layout">
        {/* СОЛ ЖАҚ: СҰРАҚ ЖӘНЕ ОПЦИЯЛАР */}
        <div className="q-main">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '6px 16px', borderRadius: '20px', fontWeight: 700, fontSize: '0.85rem' }}>{currentIndex + 1}-сұрақ</span>
              {answers[currentIndex] !== -1 && <span style={{ background: '#ecfdf5', color: '#10b981', padding: '6px 16px', borderRadius: '20px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>✓ Жауап берілді</span>}
            </div>
            <button 
              onClick={() => { const newF = [...flagged]; newF[currentIndex] = !newF[currentIndex]; setFlagged(newF); }}
              style={{ background: flagged[currentIndex] ? '#fffbeb' : 'white', border: `1px solid ${flagged[currentIndex] ? '#f59e0b' : '#e2e8f0'}`, borderRadius: '12px', width: '44px', height: '44px', cursor: 'pointer', color: flagged[currentIndex] ? '#f59e0b' : '#94a3b8', fontSize: '1.2rem', transition: '0.2s' }}
            >⚑</button>
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginBottom: '2.5rem', lineHeight: 1.6 }}>{q.question}</h2>

          <div>
            {q.options.map((opt, i) => (
              <div key={i} className={`opt-item ${answers[currentIndex] === i ? 'selected' : ''}`} onClick={() => { const newAns = [...answers]; newAns[currentIndex] = i; setAnswers(newAns); }}>
                <div className="opt-circle">{String.fromCharCode(65 + i)}</div>
                <div style={{ fontSize: '1.05rem' }}>{opt}</div>
                {answers[currentIndex] === i && <div className="opt-check">✓</div>}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
            <button onClick={() => setCurrentIndex(prev => prev - 1)} disabled={currentIndex === 0} style={{ background: 'transparent', border: 'none', color: currentIndex === 0 ? '#cbd5e1' : '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', fontSize: '1rem' }}>
              〈 Алдыңғы
            </button>
            <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>📖 {answeredCount}/{currentQuiz.questions.length} жауап</span>
            <button className="b-blue" onClick={() => setCurrentIndex(prev => prev + 1)} disabled={currentIndex === currentQuiz.questions.length - 1} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Келесі 〉
            </button>
          </div>
        </div>

        {/* ОҢ ЖАҚ: СҰРАҚ НАВИГАТОРЫ */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', border: '1px solid #e2e8f0', alignSelf: 'start', position: 'sticky', top: '100px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', color: '#0f172a' }}>Сұрақ навигаторы</h3>
          <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.85rem', color: '#64748b' }}>{answeredCount}/{currentQuiz.questions.length} жауап · {flagged.filter(Boolean).length} белгіленген</p>

          <div className="q-nav-grid">
            {currentQuiz.questions.map((_, i) => {
              let cls = "n-btn";
              if (currentIndex === i) cls += " current";
              else if (answers[i] !== -1) cls += " answered";
              if (flagged[i] && currentIndex !== i) cls += " flagged";
              return <button key={i} className={cls} onClick={() => setCurrentIndex(i)}>{i + 1}</button>
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '2rem 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '18px', height: '18px', background: '#4f46e5', borderRadius: '6px' }}></div> Ағымдағы</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '18px', height: '18px', background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '6px' }}></div> Жауап берілді</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '18px', height: '18px', border: '2px solid #f59e0b', borderRadius: '6px', background: '#fffbeb' }}></div> Белгіленген</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '18px', height: '18px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white' }}></div> Жауап берілмеді</div>
          </div>

          <div style={{ background: '#eff6ff', padding: '1.25rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <div style={{ color: '#3b82f6', fontSize: '1.8rem' }}>⏱</div>
            <div>
              <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.1rem' }}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} қалды</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Қарқынды ұстаңыз</div>
            </div>
          </div>

          <button className="b-blue" style={{ width: '100%', padding: '16px', fontSize: '1.05rem' }} onClick={handleFinish} disabled={isSubmitting}>
            {isSubmitting ? 'Сақталуда...' : 'Тестті аяқтау'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;