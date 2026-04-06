import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const AdminPanel = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const currentUser = localStorage.getItem('currentUser');

  useEffect(() => {
    if (currentUser !== 'admin' && currentUser !== 'Admin') {
      alert('Сізге бұл бетке кіруге рұқсат жоқ! Тек Админ кіре алады.');
      navigate('/dashboard');
      return;
    }
    fetchQuizzes();
  }, [currentUser, navigate]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const initialFormState = {
    title: '',
    category: 'Programming',
    difficulty: 'Бастаушы',
    timeLimit: 600,
    questions: [
      { questionText: '', options: ['', '', '', ''], correctAnswer: '' }
    ]
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get('https://online-quiz-system-ufwp.onrender.com/api/quizzes');
      setQuizzes(response.data);
    } catch (error) {
      console.error("Дерек алу қатесі:", error);
      alert("Бэкенд қосылмаған немесе қате кетті!");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.correctAnswer || !q.options.includes(q.correctAnswer)) {
        alert(`${i + 1}-сұрақтың дұрыс жауабы көрсетілмеген немесе нұсқаларға сәйкес келмейді!`);
        return;
      }
    }

    try {
      if (editMode) {
        await axios.put(`https://online-quiz-system-ufwp.onrender.com/api/quizzes/${formData.id || formData._id}`, formData);
        alert('Тест сәтті жаңартылды!');
      } else {
        await axios.post('https://online-quiz-system-ufwp.onrender.com/api/quizzes', formData);
        alert('Жаңа тест сәтті қосылды!');
      }
      setIsModalOpen(false);
      fetchQuizzes();
    } catch (error) {
      console.error("Сақтау қатесі:", error);
      alert('Деректерді сақтау мүмкін болмады.');
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Бұл тестті өшіруге сенімдісіз бе?')) {
      try {
        await axios.delete(`https://online-quiz-system-ufwp.onrender.com/api/quizzes/${id}`);
        alert('Тест өшірілді!');
        fetchQuizzes();
      } catch (error) {
        console.error("Өшіру қатесі:", error);
      }
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index][field] = value;
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[qIndex].options[optIndex] = value;
    
    if (updatedQuestions[qIndex].correctAnswer === formData.questions[qIndex].options[optIndex]) {
      updatedQuestions[qIndex].correctAnswer = value;
    }
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { questionText: '', options: ['', '', '', ''], correctAnswer: '' }]
    });
  };

  const removeQuestion = (index) => {
    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const openAddModal = () => {
    setEditMode(false);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (quiz) => {
    setEditMode(true);
    const quizData = { ...quiz };
    
    let parsedQuestions = quizData.questions;
    if (typeof parsedQuestions === 'string') {
      try { parsedQuestions = JSON.parse(parsedQuestions); } catch(e) { parsedQuestions = []; }
    }

    if (parsedQuestions && parsedQuestions.length > 0) {
      quizData.questions = parsedQuestions.map(q => {
        let ans = q.correctAnswer !== undefined ? q.correctAnswer : (q.answer !== undefined ? q.answer : '');
        
        if (ans !== '' && !isNaN(ans) && Number(ans) >= 0 && Number(ans) < 4) {
            ans = q.options[Number(ans)];
        }
        return {
          questionText: String(q.questionText || q.question || '').trim(),
          options: q.options ? q.options.map(o => String(o).trim()) : ['', '', '', ''],
          correctAnswer: String(ans).trim() 
        };
      });
    } else {
      quizData.questions = [{ questionText: '', options: ['', '', '', ''], correctAnswer: '' }];
    }

    setFormData(quizData);
    setIsModalOpen(true);
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Жүктелуде...</div>;

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      
      <style>{`
        .admin-layout { max-width: 1200px; margin: 2rem auto; padding: 0 1.5rem; }
        .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .btn-primary { background: var(--primary); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .btn-primary:hover { filter: brightness(1.1); transform: translateY(-2px); }
        .btn-danger { background: var(--danger-light); color: var(--danger); border: none; padding: 8px 16px; border-radius: 8px; font-weight: 700; cursor: pointer; }
        
        .table-container { background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border); overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
        .admin-table th { padding: 1.2rem 1.5rem; background: var(--bg-page); font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; border-bottom: 1px solid var(--border); }
        .admin-table td { padding: 1.2rem 1.5rem; border-bottom: 1px solid var(--border); color: var(--text-primary); font-weight: 500; font-size: 0.95rem; }
        
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 2rem; }
        .modal-content { background: var(--bg-card); width: 100%; max-width: 800px; max-height: 90vh; overflow-y: auto; border-radius: 24px; padding: 2rem; border: 1px solid var(--border); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
        .modal-content::-webkit-scrollbar { width: 8px; }
        .modal-content::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
        
        .form-group { margin-bottom: 1.2rem; }
        .form-label { display: block; font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; }
        .form-input { width: 100%; padding: 12px 16px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 12px; color: var(--text-primary); outline: none; }
        .form-input:focus { border-color: var(--primary); }
        
        .question-box { background: var(--bg-page); border: 1px solid var(--border); padding: 1.5rem; border-radius: 16px; margin-bottom: 1.5rem; }
        .q-header { display: flex; justify-content: space-between; font-weight: 800; margin-bottom: 1rem; color: var(--text-primary); }
      `}</style>

      <div className="admin-layout">
        <div className="admin-header">
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Басқару панелі (Admin)</h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Нағыз REST API (GET, POST, PUT, DELETE)</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {/* Тек "Жаңа тест қосу" батырмасы қалды */}
            <button className="btn-primary" onClick={openAddModal}>+ Жаңа тест қосу</button>
          </div>
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Тақырыбы</th>
                <th>Категория</th>
                <th style={{ textAlign: 'center' }}>Сұрақ саны</th>
                <th style={{ textAlign: 'center' }}>Әрекеттер</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz, idx) => {
                let qCount = 0;
                if (typeof quiz.questions === 'string') {
                  try { qCount = JSON.parse(quiz.questions).length; } catch(e){}
                } else if (Array.isArray(quiz.questions)) {
                  qCount = quiz.questions.length;
                }
                
                return (
                  <tr key={quiz.id || quiz._id || idx}>
                    <td style={{ fontWeight: 700 }}>{quiz.title}</td>
                    <td><span style={{ background: 'var(--bg-page)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>{quiz.category}</span></td>
                    <td style={{ textAlign: 'center' }}>{qCount}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => openEditModal(quiz)} style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', marginRight: '8px' }}>✏️ Өзгерту</button>
                      <button onClick={() => handleDelete(quiz.id || quiz._id)} style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>🗑️ Өшіру</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>{editMode ? 'Тестті өзгерту' : 'Жаңа тест жасау'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Тест атауы</label>
                <input type="text" className="form-input" required placeholder="Мысалы: React негіздері" 
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div className="form-group">
                  <label className="form-label">Категория</label>
                  <select className="form-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="Web">Web</option>
                    <option value="Programming">Programming</option>
                    <option value="Networks">Networks</option>
                    <option value="Security">Security</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Күрделілігі</label>
                  <select className="form-input" value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})}>
                    <option value="Бастаушы">Бастаушы</option>
                    <option value="Орташа">Орташа</option>
                    <option value="Жоғары">Жоғары</option>
                  </select>
                </div>
              </div>

              <h3 style={{ borderBottom: '2px solid var(--border)', paddingBottom: '10px', color: 'var(--text-primary)' }}>Сұрақтар</h3>
              
              {formData.questions.map((q, qIndex) => (
                <div key={qIndex} className="question-box">
                  <div className="q-header">
                    <span>Сұрақ {qIndex + 1}</span>
                    {formData.questions.length > 1 && (
                      <button type="button" onClick={() => removeQuestion(qIndex)} className="btn-danger">Өшіру</button>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Сұрақ мәтіні</label>
                    <input type="text" className="form-input" required value={q.questionText} onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    {q.options.map((opt, optIndex) => (
                      <div key={optIndex}>
                        <label className="form-label">{optIndex + 1}-нұсқа</label>
                        <input type="text" className="form-input" required value={opt} onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)} />
                      </div>
                    ))}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Дұрыс жауапты таңдаңыз</label>
                    <select className="form-input" required value={q.correctAnswer || ""} onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}>
                      <option value="">-- Дұрыс нұсқаны таңдаңыз --</option>
                      {q.options.map((opt, i) => (
                        opt.trim() !== '' && <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}

              <button type="button" onClick={addQuestion} style={{ width: '100%', background: 'transparent', border: '2px dashed var(--primary)', color: 'var(--primary)', padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', marginBottom: '2rem' }}>
                + Тағы бір сұрақ қосу
              </button>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', background: 'var(--bg-page)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>Болдырмау</button>
                <button type="submit" className="btn-primary">{editMode ? 'Өзгерістерді сақтау' : 'Бэкендке жіберу'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;