import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = localStorage.getItem('currentUser') || 'Қонақ';

  // Динамикалық стейттер 
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Тест барысы
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false); 

  // 1. БЭКЕНДТЕН ТЕСТТІ АЛУ
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get('https://online-quiz-system-ufwp.onrender.com/api/quizzes');
        const foundQuiz = response.data.find(q => String(q.id) === String(id) || String(q._id) === String(id));
        
        if (foundQuiz) {
          let parsedQuestions = foundQuiz.questions;
          if (typeof parsedQuestions === 'string') {
            try { parsedQuestions = JSON.parse(parsedQuestions); } catch(e) {}
          }
          
          const processedQuiz = { ...foundQuiz, questions: parsedQuestions };
          setCurrentQuiz(processedQuiz);

          const qCount = parsedQuestions.length || 10;
          setAnswers(Array(qCount).fill(-1));
          setFlagged(Array(qCount).fill(false));
          
          setTimeLeft(processedQuiz.timeLimit || qCount * 60);
        }
      } catch (error) {
        console.error("Тестті алуда қате кетті:", error);
      } finally {
        loading && setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, loading]);

  // =========================================================
  // БРАУЗЕРДІ ЖАҢАРТУ (F5) НЕМЕСЕ ЖАБУ КЕЗІНДЕГІ ЕСКЕРТУ
  // =========================================================
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const hasAnswered = answers.some(a => a !== -1);
      // Егер кем дегенде 1 сұраққа жауап берілсе ЖӘНЕ тест аяқталмаса
      if (hasAnswered && !isFinished) {
        e.preventDefault();
        e.returnValue = ''; // Ескерту шығару үшін міндетті
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [answers, isFinished]);
  // =========================================================

  // 2. УАҚЫТТЫ ЕСЕПТЕУ
  useEffect(() => {
    if (!currentQuiz || isSubmitting || isFinished) return;
    if (timeLeft <= 0) { 
      handleFinish(); 
      return; 
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, currentQuiz, isSubmitting, isFinished]);

  // 3. НӘТИЖЕНІ БАЗАҒА САҚТАП, НӘТИЖЕ БЕТІНЕ ӨТУ
  const handleFinish = async () => {
    setIsSubmitting(true);
    setIsFinished(true); 
    let correctCount = 0;

    const detailedAnswers = currentQuiz.questions.map((q, i) => {
      let correctText = q.correctAnswer;
      if (correctText !== null && correctText !== undefined && !isNaN(correctText) && String(correctText).trim() !== '' && Number(correctText) >= 0 && Number(correctText) < q.options.length) {
        correctText = q.options[Number(correctText)];
      }

      let userSelectedText = null;
      if (answers[i] !== -1) {
        userSelectedText = q.options[answers[i]];
      }

      let isCorrect = false;
      if (userSelectedText !== null && correctText !== null) {
         isCorrect = String(userSelectedText).trim() === String(correctText).trim();
      }
      
      if (isCorrect) correctCount++;

      return {
        question: q.questionText || q.question, 
        options: q.options, 
        userAnswer: userSelectedText,
        correctAnswer: correctText, 
        isCorrect
      };
    });

    const maxTime = currentQuiz.timeLimit || currentQuiz.questions.length * 60;
    
    const newResult = {
      quizId: currentQuiz.id || id, 
      quizTitle: currentQuiz.title,
      score: Math.round((correctCount / currentQuiz.questions.length) * 100),
      correctCount, 
      totalQuestions: currentQuiz.questions.length,
      timeSpent: maxTime - timeLeft, 
      username: user, 
      answers: detailedAnswers
    };

    try {
      const response = await axios.post('https://online-quiz-system-ufwp.onrender.com/api/results', newResult);
      navigate(`/results?id=${response.data.id}`); 
    } catch (error) {
      alert("Серверге сақтау қатесі!"); 
      navigate('/dashboard');
    }
  };

  const getIcon = (cat) => {
    switch(cat?.toLowerCase()) {
      case 'web': return '🌐';
      case 'programming': return '💻';
      case 'networks': return '📡';
      case 'security': return '🔒';
      default: return '📝';
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20vh', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Жүктелуде...</div>;
  if (!currentQuiz) return <div style={{ textAlign: 'center', marginTop: '20vh', color: 'var(--text-primary)' }}><h2>Тест табылмады 😕</h2><button onClick={() => navigate('/dashboard')} style={{ padding: '10px 20px', background: 'var(--primary)', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Басты бетке қайту</button></div>;

  const q = currentQuiz.questions[currentIndex];
  const answeredCount = answers.filter(a => a !== -1).length;
  const progressPercent = Math.round((answeredCount / currentQuiz.questions.length) * 100);
  const qText = q.questionText || q.question;

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .q-top { background: var(--bg-card); height: 70px; display: flex; justify-content: space-between; align-items: center; padding: 0 2rem; border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 10; }
        .q-layout { max-width: 1200px; margin: 2rem auto; display: grid; grid-template-columns: 1fr 340px; gap: 2rem; padding: 0 2rem; }
        .q-main { background: var(--bg-card); border-radius: 24px; padding: 2.5rem; border: 1px solid var(--border); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
        
        .opt-item { border: 2px solid var(--border); border-radius: 16px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; cursor: pointer; display: flex; align-items: center; gap: 1rem; transition: 0.2s; font-weight: 500; color: var(--text-primary); }
        .opt-item:hover { border-color: var(--primary); background: var(--bg-page); }
        .opt-item.selected { border-color: var(--primary); background: var(--primary-light); color: var(--primary); }
        
        .opt-circle { width: 36px; height: 36px; border-radius: 50%; background: var(--bg-page); display: flex; justify-content: center; align-items: center; font-weight: 700; color: var(--text-secondary); flex-shrink: 0; }
        .opt-item.selected .opt-circle { background: var(--primary); color: white; }
        .opt-check { width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--primary); display: flex; justify-content: center; align-items: center; color: var(--primary); font-size: 0.8rem; margin-left: auto; }
        
        .q-nav-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 1.5rem; }
        .n-btn { height: 44px; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-card); font-weight: 600; color: var(--text-secondary); cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
        .n-btn.answered { background: rgba(16,185,129,0.1); border-color: #10b981; color: #10b981; }
        .n-btn.flagged { background: rgba(245,158,11,0.1); border-color: #f59e0b; border-width: 2px; color: #f59e0b; }
        .n-btn.current { background: var(--primary); color: white; border-color: var(--primary); }
        
        .b-blue { background: var(--primary); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .b-blue:hover { filter: brightness(1.1); box-shadow: 0 4px 12px rgba(79,70,229,0.2); }
        .b-blue:disabled { opacity: 0.7; cursor: not-allowed; }
      `}</style>

      {/* ЖОҒАРҒЫ ПАНЕЛЬ */}
      <div className="q-top">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: 'var(--primary)', color: 'white', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>⚡</span> QuizKZ
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>{getIcon(currentQuiz.category)}</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{currentQuiz.title}</span>
            <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{currentQuiz.category}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '250px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{currentIndex + 1}/{currentQuiz.questions.length}</span>
            <div style={{ flex: 1, height: '8px', background: 'var(--bg-page)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPercent}%`, background: 'var(--primary)', transition: '0.3s ease' }}></div>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{answeredCount} жауап</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary-light)', color: 'var(--primary)', padding: '8px 16px', borderRadius: '12px', fontWeight: 700, fontSize: '1rem' }}>
            ⏱ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          <button className="b-blue" onClick={handleFinish} disabled={isSubmitting}>{isSubmitting ? 'Күтіңіз...' : 'Тестті аяқтау'}</button>
        </div>
      </div>

      <div className="q-layout">
        <div className="q-main">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '6px 16px', borderRadius: '20px', fontWeight: 700, fontSize: '0.85rem' }}>{currentIndex + 1}-сұрақ</span>
              {answers[currentIndex] !== -1 && <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '6px 16px', borderRadius: '20px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>✓ Жауап берілді</span>}
            </div>
            <button 
              onClick={() => { const newF = [...flagged]; newF[currentIndex] = !newF[currentIndex]; setFlagged(newF); }}
              style={{ background: flagged[currentIndex] ? 'rgba(245,158,11,0.1)' : 'var(--bg-card)', border: `1px solid ${flagged[currentIndex] ? '#f59e0b' : 'var(--border)'}`, borderRadius: '12px', width: '44px', height: '44px', cursor: 'pointer', color: flagged[currentIndex] ? '#f59e0b' : 'var(--text-secondary)', fontSize: '1.2rem', transition: '0.2s' }}
            >⚑</button>
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2.5rem', lineHeight: 1.6 }}>{qText}</h2>

          <div>
            {q.options.map((opt, i) => (
              <div key={i} className={`opt-item ${answers[currentIndex] === i ? 'selected' : ''}`} onClick={() => { const newAns = [...answers]; newAns[currentIndex] = i; setAnswers(newAns); }}>
                <div className="opt-circle">{String.fromCharCode(65 + i)}</div>
                <div style={{ fontSize: '1.05rem' }}>{opt}</div>
                {answers[currentIndex] === i && <div className="opt-check">✓</div>}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <button onClick={() => setCurrentIndex(prev => prev - 1)} disabled={currentIndex === 0} style={{ background: 'transparent', border: 'none', color: currentIndex === 0 ? 'var(--text-muted)' : 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', fontSize: '1rem' }}>
              〈 Алдыңғы
            </button>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>📖 {answeredCount}/{currentQuiz.questions.length} жауап</span>
            <button className="b-blue" onClick={() => setCurrentIndex(prev => prev + 1)} disabled={currentIndex === currentQuiz.questions.length - 1} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Келесі 〉
            </button>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '2rem', border: '1px solid var(--border)', alignSelf: 'start', position: 'sticky', top: '100px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', color: 'var(--text-primary)' }}>Сұрақ навигаторы</h3>
          <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{answeredCount}/{currentQuiz.questions.length} жауап · {flagged.filter(Boolean).length} белгіленген</p>

          <div className="q-nav-grid">
            {currentQuiz.questions.map((_, i) => {
              let cls = "n-btn";
              if (currentIndex === i) cls += " current";
              else if (answers[i] !== -1) cls += " answered";
              if (flagged[i] && currentIndex !== i) cls += " flagged";
              return <button key={i} className={cls} onClick={() => setCurrentIndex(i)}>{i + 1}</button>
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '2rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '18px', height: '18px', background: 'var(--primary)', borderRadius: '6px' }}></div> Ағымдағы</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '18px', height: '18px', background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', borderRadius: '6px' }}></div> Жауап берілді</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '18px', height: '18px', border: '2px solid #f59e0b', borderRadius: '6px', background: 'rgba(245,158,11,0.1)' }}></div> Белгіленген</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '18px', height: '18px', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-card)' }}></div> Жауап берілмеді</div>
          </div>

          <div style={{ background: 'var(--primary-light)', padding: '1.25rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <div style={{ color: 'var(--primary)', fontSize: '1.8rem' }}>⏱</div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} қалды</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Қарқынды ұстаңыз</div>
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