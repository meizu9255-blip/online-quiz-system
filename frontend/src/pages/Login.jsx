import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  
  const [rememberMe, setRememberMe] = useState(false);

  // Құпия сөзді қалпына келтіру үшін жаңа стейттер
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState(''); // 'loading', 'success', ''

  // Popup-тан келетін хабарламаны тыңдау (Google/GitHub кіргенде)
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'OAUTH_LOGIN') {
        localStorage.setItem('currentUser', event.data.username);
        navigate('/dashboard');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    
    try {
      const response = await axios.post('https://online-quiz-system-ufwp.onrender.com/api/login', { email, password });
      
      localStorage.setItem('currentUser', response.data.username);
      
      navigate('/dashboard');
    } catch (error) {
      if (error.response) setErrorMsg(error.response.data.error);
      else setErrorMsg("Сервермен байланыс жоқ!");
    } finally {
      setIsLoading(false);
    }
  };


  const handleForgotPassword = (e) => {
    e.preventDefault();
    setForgotStatus('loading');
    
    setTimeout(() => {
      setForgotStatus('success');
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStatus('');
        setForgotEmail('');
      }, 2000);
    }, 1500);
  };

  const handleOAuthLogin = (provider) => {
    const width = 450; const height = 600;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;
    const popup = window.open('', `${provider} Login`, `width=${width},height=${height},top=${top},left=${left}`);

    if (provider === 'Google') {
      popup.document.write(`
        <html><body style="margin:0; font-family: 'Segoe UI', Roboto, sans-serif; background: #202124; color: #e8eaed; display: flex; justify-content: center; padding-top: 40px; user-select: none;">
          <div style="border: 1px solid #5f6368; border-radius: 8px; width: 448px; padding: 36px 40px; background: #202124; box-sizing: border-box;">
            <div style="display: flex; align-items: center; margin-bottom: 16px; justify-content: center;">
              <svg viewBox="0 0 24 24" width="24" height="24" style="margin-right: 8px;"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              <span style="font-size: 15px; font-weight: 500;">Вход через аккаунт Google</span>
            </div>
            <div style="text-align: center; margin-bottom: 24px;">
               <div style="background: #2563EB; color: white; width: 40px; height: 40px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; margin-bottom: 12px;">⚡</div>
               <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 400;">Выберите аккаунт</h1>
               <p style="margin: 0; font-size: 15px;">Переход в приложение "QuizKZ"</p>
            </div>
            <div style="border-top: 1px solid #5f6368; margin-bottom: 8px;"></div>
            
            <div onclick="login('beks', 'meizu9255@gmail.com')" style="display: flex; align-items: center; padding: 12px 16px; cursor: pointer; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='#303134'" onmouseout="this.style.background='transparent'">
               <img src="https://ui-avatars.com/api/?name=Beks&background=4f46e5&color=fff&rounded=true" width="32" height="32" style="margin-right: 16px; border-radius: 50%;">
               <div style="flex: 1;">
                  <div style="font-size: 14px; font-weight: 500; margin-bottom: 2px;">beks</div>
                  <div style="font-size: 12px; color: #9aa0a6;">meizu9255@gmail.com</div>
               </div>
            </div>
            <div style="border-top: 1px solid #5f6368; margin: 4px 0;"></div>
            
            <div onclick="login('Zangar', 'zangar.orazbai08@gmail.com')" style="display: flex; align-items: center; padding: 12px 16px; cursor: pointer; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='#303134'" onmouseout="this.style.background='transparent'">
               <img src="https://ui-avatars.com/api/?name=Zangar&background=f59e0b&color=fff&rounded=true" width="32" height="32" style="margin-right: 16px; border-radius: 50%;">
               <div style="flex: 1;">
                  <div style="font-size: 14px; font-weight: 500; margin-bottom: 2px;">Zangar</div>
                  <div style="font-size: 12px; color: #9aa0a6;">zangar.orazbai08@gmail.com</div>
               </div>
            </div>
            <div style="border-top: 1px solid #5f6368; margin: 4px 0;"></div>
            
            <div style="display: flex; align-items: center; padding: 12px 16px; cursor: pointer; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='#303134'" onmouseout="this.style.background='transparent'">
               <div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; margin-right: 16px; color: #e8eaed;">
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
               </div>
               <div style="font-size: 14px; font-weight: 500;">Использовать другой аккаунт</div>
            </div>
            <p style="font-size: 12px; color: #9aa0a6; margin-top: 30px; line-height: 1.5;">Прежде чем начать работу с приложением "QuizKZ", вы можете ознакомиться с его <span style="color: #8ab4f8; cursor: pointer;">политикой конфиденциальности</span> и <span style="color: #8ab4f8; cursor: pointer;">условиями использования</span>.</p>
          </div>
          <script>
            function login(name, email) { window.opener.postMessage({ type: 'OAUTH_LOGIN', username: name, email: email }, '*'); window.close(); }
          </script>
        </body></html>
      `);
    } else if (provider === 'GitHub') {
      popup.document.write(`
        <html><body style="margin:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background: #0d1117; color: #c9d1d9; display: flex; justify-content: center; padding-top: 60px; user-select: none;">
          <div style="width: 340px; display: flex; flex-direction: column; align-items: center;">
            <svg height="48" viewBox="0 0 16 16" width="48" fill="#c9d1d9" style="margin-bottom: 24px;"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
            <h1 style="font-size: 24px; font-weight: 300; margin: 0 0 16px 0;">Sign in to GitHub</h1>
            <p style="margin: 0 0 20px 0; font-size: 14px;">to continue to <strong>QuizKZ</strong></p>
            <div style="background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 20px; width: 100%; box-sizing: border-box;">
              <label style="display: block; font-size: 14px; margin-bottom: 8px;">Username or email address</label>
              <input type="text" value="beks" readonly style="width: 100%; padding: 5px 12px; font-size: 14px; line-height: 20px; color: #c9d1d9; background-color: #0d1117; border: 1px solid #30363d; border-radius: 6px; box-sizing: border-box; margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <label style="font-size: 14px;">Password</label><span style="font-size: 12px; color: #58a6ff; cursor: pointer;">Forgot password?</span>
              </div>
              <input type="password" value="********" readonly style="width: 100%; padding: 5px 12px; font-size: 14px; line-height: 20px; color: #c9d1d9; background-color: #0d1117; border: 1px solid #30363d; border-radius: 6px; box-sizing: border-box; margin-bottom: 20px;">
              <button onclick="login('beks', 'meizu9255@gmail.com')" style="width: 100%; background-color: #238636; color: white; border: 1px solid rgba(240,246,252,0.1); padding: 6px 16px; font-size: 14px; font-weight: 500; line-height: 20px; border-radius: 6px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.backgroundColor='#2ea043'" onmouseout="this.style.backgroundColor='#238636'">Sign in</button>
            </div>
          </div>
          <script>function login(name, email) { window.opener.postMessage({ type: 'OAUTH_LOGIN', username: name, email: email }, '*'); window.close(); }</script>
        </body></html>
      `);
    }
  };

  return (
    <div className="auth-container">
      {/* СОЛ ЖАҚ */}
      <div className="auth-left">
        <div className="auth-card">
          <div className="logo-icon">⚡ QuizKZ</div>
          <h1>Қош келдіңіз</h1>
          <p className="subtitle">Оқуды жалғастыру үшін жүйеге кіріңіз</p>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
            <Link to="/" className="btn btn-primary" style={{ flex: 1, textAlign: 'center' }}>Кіру</Link>
            <Link to="/register" className="btn btn-outline" style={{ flex: 1, textAlign: 'center' }}>Тіркелу</Link>
          </div>

          {errorMsg && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem', background: 'var(--danger-light)', padding: '10px', borderRadius: '8px' }}>{errorMsg}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Электрондық пошта</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ margin: 0 }}>Құпия сөз</label>
                <span onClick={() => setShowForgotModal(true)} style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Құпия сөзді ұмыттыңыз ба?</span>
              </div>
              
              {/* Input пен Иконканы бөлек контейнерге саламыз */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  style={{ width: '100%', padding: '12px 40px 12px 16px', letterSpacing: showPassword ? 'normal' : '2px', boxSizing: 'border-box' }} 
                  required 
                />
                <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '8px' }}>
              <input 
                type="checkbox" 
                id="remember" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember" style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>30 күн бойы есте сақта</label>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
              {isLoading ? 'Күте тұрыңыз...' : 'Жүйеге кіру'}
            </button>
          </form>

          {/* OAUTH БАТЫРМАЛАРЫ */}
          <div style={{ display: 'flex', alignItems: 'center', textAlign: 'center', margin: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <div style={{ flex: 1, borderBottom: '1px solid var(--border)' }}></div>
            <span style={{ padding: '0 10px' }}>немесе арқылы кіру</span>
            <div style={{ flex: 1, borderBottom: '1px solid var(--border)' }}></div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={() => handleOAuthLogin('Google')} className="btn btn-outline" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#ea4335"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg> Google
            </button>
            <button type="button" onClick={() => handleOAuthLogin('GitHub')} className="btn btn-outline" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> GitHub
            </button>
          </div>
        </div>
      </div>

      {/* ОҢ ЖАҚ */}
      <div className="auth-right">
        <div className="auth-right-content">
          <h2>Ақылдырақ үйрен,<br/>жақсырақ тексер.</h2>
          <p>Бейімделген тесттер, жылдам аналитика және прогресті бақылау — дағдыларыңызды жетілдірудің барлығы осында.</p>
          
          <div className="auth-features">
            <div className="feature-item"><div className="feature-icon">⏱</div><span>Нақты уақыт таймері</span></div>
            <div className="feature-item"><div className="feature-icon">📊</div><span>Терең аналитика</span></div>
            <div className="feature-item"><div className="feature-icon">⚡</div><span>Ақылды статистика</span></div>
          </div>
        </div>
      </div>

      {/* ҚҰПИЯ СӨЗДІ ҚАЛПЫНА КЕЛТІРУ МОДАЛЬДЫ ТЕРЕЗЕСІ */}
      {showForgotModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '400px', border: '1px solid var(--border)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', position: 'relative' }}>
            
            <button onClick={() => setShowForgotModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            
            {forgotStatus === 'success' ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ width: '60px', height: '60px', background: 'var(--success-light)', color: 'var(--success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1rem' }}>✓</div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Хат жіберілді!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  <b>{forgotEmail}</b> мекенжайына құпия сөзді қалпына келтіру сілтемесі жіберілді. Поштаңызды тексеріңіз.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Құпия сөзді ұмыттыңыз ба?</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Тіркелген электрондық поштаңызды жазыңыз. Біз сізге құпия сөзді өзгерту сілтемесін жібереміз.
                </p>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Электрондық пошта</label>
                  <input 
                    type="email" 
                    placeholder="you@example.com" 
                    value={forgotEmail} 
                    onChange={(e) => setForgotEmail(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '12px', marginTop: '1rem', border: 'none', fontWeight: 600, cursor: 'pointer' }} disabled={forgotStatus === 'loading'}>
                  {forgotStatus === 'loading' ? 'Жіберілуде...' : 'Қалпына келтіру'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;