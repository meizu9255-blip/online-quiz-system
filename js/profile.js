// ===== PROFILE.JS =====

document.addEventListener('DOMContentLoaded', function() {
  var currentUser = checkAuth(true);
  if (!currentUser) return;
  
  updateNavbar(currentUser);
  loadProfile(currentUser);
  loadRecentResults(currentUser);
});

function loadProfile(user) {
  document.getElementById('profileAvatar').textContent = user.username.charAt(0).toUpperCase();
  document.getElementById('profileName').textContent = user.username;
  document.getElementById('profileEmail').textContent = user.email || '-';
  
  var stats = db.getUserStats(user.id);
  document.getElementById('statTests').textContent = stats.totalTests;
  document.getElementById('statAvg').textContent = stats.averageScore + '%';
  document.getElementById('statBest').textContent = stats.bestScore + '%';
  
  document.getElementById('editUsername').value = user.username;
  document.getElementById('editEmail').value = user.email || '';
}

function updateProfile(event) {
  event.preventDefault();
  
  var currentUser = db.getCurrentUser();
  var username = document.getElementById('editUsername').value.trim();
  var email = document.getElementById('editEmail').value.trim();
  var password = document.getElementById('editPassword').value.trim();
  
  if (!username || username.length < 3) {
    showFieldError('editUsername', 'Кемінде 3 таңба болуы керек');
    return;
  }
  
  if (!email || !isValidEmail(email)) {
    showFieldError('editEmail', 'Дұрыс email енгізіңіз');
    return;
  }
  
  showLoading('Сақталуда...');
  
  setTimeout(function() {
    try {
      var updateData = { username: username, email: email };
      if (password && password.length >= 6) {
        updateData.password = password;
      }
      
      var updatedUser = db.updateUser(currentUser.id, updateData);
      db.setCurrentUser(updatedUser);
      
      hideLoading();
      showToast('Профиль сәтті жаңартылды!', 'success');
      
      setTimeout(function() { location.reload(); }, 1000);
      
    } catch (error) {
      hideLoading();
      showToast(error.message, 'error');
    }
  }, 500);
}

function loadRecentResults(user) {
  var results = db.getResultsByUserId(user.id);
  var container = document.getElementById('recentResults');
  
  if (results.length === 0) {
    container.innerHTML =
      '<div class="empty-state" style="padding:1.5rem;">' +
        '<p>Әлі тест тапсырмадыңыз</p>' +
        '<a href="dashboard.html" class="btn btn-primary" style="margin-top:0.5rem;font-size:0.85rem;">Тест тапсыру</a>' +
      '</div>';
    return;
  }
  
  results.sort(function(a, b) {
    return new Date(b.date) - new Date(a.date);
  });
  
  var recent = results.slice(0, 5);
  var html = '';
  
  for (var i = 0; i < recent.length; i++) {
    var r = recent[i];
    var scoreColor = r.score >= 70 ? 'var(--success)' : (r.score >= 50 ? 'var(--warning)' : 'var(--danger)');
    var date = new Date(r.date);
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    if (day < 10) day = '0' + day;
    if (month < 10) month = '0' + month;
    var dateStr = day + '.' + month + '.' + year;
    
    html +=
      '<div style="display:flex;justify-content:space-between;align-items:center;padding:0.8rem 0;border-bottom:1px solid var(--border);">' +
        '<div>' +
          '<strong>' + r.quizTitle + '</strong>' +
          '<br><small style="color:var(--text-light);">' + dateStr + '</small>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
          '<span style="font-weight:700;color:' + scoreColor + ';">' + r.score + '%</span>' +
          '<a href="results.html?id=' + r.id + '" style="font-size:0.85rem;">Қарау</a>' +
        '</div>' +
      '</div>';
  }
  
  container.innerHTML = html;
}