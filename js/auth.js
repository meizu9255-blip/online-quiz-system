// ===== AUTH.JS - Authentication Logic =====

function checkAuth(requireAuth) {
  var currentUser = db.getCurrentUser();
  
  if (requireAuth && !currentUser) {
    window.location.href = 'index.html';
    return null;
  }
  
  if (!requireAuth && currentUser) {
    window.location.href = 'dashboard.html';
    return currentUser;
  }
  
  return currentUser;
}

function updateNavbar(user) {
  var navUserElement = document.getElementById('navUser');
  if (navUserElement && user) {
    var firstLetter = user.username.charAt(0).toUpperCase();
    navUserElement.innerHTML =
      '<div class="avatar">' + firstLetter + '</div>' +
      '<span style="font-weight:600;">' + user.username + '</span>' +
      '<button class="btn-logout" onclick="handleLogout()">Шығу</button>';
  }
}

function handleLogin(event) {
  event.preventDefault();
  
  var username = document.getElementById('username').value.trim();
  var password = document.getElementById('password').value.trim();
  
  var isValid = true;
  
  if (!username) {
    showFieldError('username', 'Пайдаланушы атын енгізіңіз');
    isValid = false;
  } else {
    clearFieldError('username');
  }
  
  if (!password) {
    showFieldError('password', 'Құпия сөзді енгізіңіз');
    isValid = false;
  } else {
    clearFieldError('password');
  }
  
  if (!isValid) return;
  
  showLoading();
  
  setTimeout(function() {
    try {
      var user = db.loginUser(username, password);
      db.setCurrentUser(user);
      hideLoading();
      showToast('Сәтті кірдіңіз!', 'success');
      
      setTimeout(function() {
        window.location.href = 'dashboard.html';
      }, 800);
    } catch (error) {
      hideLoading();
      showToast(error.message, 'error');
    }
  }, 600);
}

function handleRegister(event) {
  event.preventDefault();
  
  var username = document.getElementById('username').value.trim();
  var email = document.getElementById('email').value.trim();
  var password = document.getElementById('password').value.trim();
  var confirmPassword = document.getElementById('confirmPassword').value.trim();
  
  var isValid = true;
  
  if (!username || username.length < 3) {
    showFieldError('username', 'Кемінде 3 таңба болуы керек');
    isValid = false;
  } else {
    clearFieldError('username');
  }
  
  if (!email || !isValidEmail(email)) {
    showFieldError('email', 'Дұрыс email енгізіңіз');
    isValid = false;
  } else {
    clearFieldError('email');
  }
  
  if (!password || password.length < 6) {
    showFieldError('password', 'Кемінде 6 таңба болуы керек');
    isValid = false;
  } else {
    clearFieldError('password');
  }
  
  if (password !== confirmPassword) {
    showFieldError('confirmPassword', 'Құпия сөздер сәйкес келмейді');
    isValid = false;
  } else {
    clearFieldError('confirmPassword');
  }
  
  if (!isValid) return;
  
  showLoading();
  
  setTimeout(function() {
    try {
      var user = db.registerUser(username, email, password);
      db.setCurrentUser(user);
      hideLoading();
      showToast('Сәтті тіркелдіңіз!', 'success');
      
      setTimeout(function() {
        window.location.href = 'dashboard.html';
      }, 800);
    } catch (error) {
      hideLoading();
      showToast(error.message, 'error');
    }
  }, 600);
}

function handleLogout() {
  db.logout();
  showToast('Сәтті шықтыңыз', 'info');
  setTimeout(function() {
    window.location.href = 'index.html';
  }, 500);
}

function isValidEmail(email) {
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showFieldError(fieldId, message) {
  var field = document.getElementById(fieldId);
  var errorElement = field.parentElement.querySelector('.error-message');
  if (field) field.classList.add('error');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }
}

function clearFieldError(fieldId) {
  var field = document.getElementById(fieldId);
  var errorElement = field.parentElement.querySelector('.error-message');
  if (field) field.classList.remove('error');
  if (errorElement) errorElement.classList.remove('show');
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type) {
  if (!type) type = 'info';
  
  var container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.innerHTML =
    '<span>' + message + '</span>' +
    '<button class="toast-close" onclick="this.parentElement.remove()">x</button>';
  
  container.appendChild(toast);

  setTimeout(function() {
    if (toast.parentElement) {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(function() { toast.remove(); }, 300);
    }
  }, 4000);
}

// ===== LOADING OVERLAY =====
function showLoading(text) {
  if (!text) text = 'Жүктелуде...';
  var overlay = document.getElementById('loadingOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML =
      '<div class="spinner"></div>' +
      '<p class="loading-text">' + text + '</p>';
    document.body.appendChild(overlay);
  }
  overlay.classList.remove('hidden');
}

function hideLoading() {
  var overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.add('hidden');
  }
}

// ===== HAMBURGER MENU =====
function toggleMenu() {
  var navLinks = document.getElementById('navLinks');
  if (navLinks) {
    navLinks.classList.toggle('show');
  }
}   