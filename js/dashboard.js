document.addEventListener('DOMContentLoaded', function() {
  var currentUser = checkAuth(true);
  if (!currentUser) return;
  updateNavbar(currentUser);
  loadWelcomeBanner(currentUser);
  loadStats(currentUser);
  loadCategoryTags();
  loadQuizzes('all');
  loadSidebarResults(currentUser);
  loadProgressChart(currentUser);
});

function loadWelcomeBanner(user) {
  var stats = db.getUserStats(user.id);
  var hour = new Date().getHours();
  var greeting = 'Қош келдіңіз';
  if (hour < 12) greeting = 'Қайырлы таң';
  else if (hour < 18) greeting = 'Қайырлы күн';
  else greeting = 'Қайырлы кеш';

  var banner = document.getElementById('welcomeBanner');
  banner.innerHTML =
    '<div class="welcome-text">' +
      '<h1>' + greeting + ', ' + user.username + '!</h1>' +
      '<p>Тест таңдап, білімді тексеріңіз. Сәттілік!</p>' +
    '</div>' +
    '<div class="welcome-stats">' +
      '<div class="welcome-stat">' +
        '<span class="ws-number">' + stats.totalTests + '</span>' +
        '<span class="ws-label">Тапсырылған</span>' +
      '</div>' +
      '<div class="welcome-stat">' +
        '<span class="ws-number">' + stats.averageScore + '%</span>' +
        '<span class="ws-label">Орташа балл</span>' +
      '</div>' +
      '<div class="welcome-stat">' +
        '<span class="ws-number">' + stats.bestScore + '%</span>' +
        '<span class="ws-label">Рекорд</span>' +
      '</div>' +
    '</div>';
}

function loadStats(user) {
  var stats = db.getUserStats(user.id);
  var g = document.getElementById('statsGrid');
  g.innerHTML =
    '<div class="stat-card"><div class="stat-icon blue">T</div><div class="stat-info"><h3>' + stats.totalQuizzes + '</h3><p>Барлық тесттер</p></div><div class="stat-bar stat-bar-blue"></div></div>' +
    '<div class="stat-card"><div class="stat-icon green">+</div><div class="stat-info"><h3>' + stats.totalTests + '</h3><p>Тапсырылған</p></div><div class="stat-bar stat-bar-green"></div></div>' +
    '<div class="stat-card"><div class="stat-icon orange">%</div><div class="stat-info"><h3>' + stats.averageScore + '%</h3><p>Орташа балл</p></div><div class="stat-bar stat-bar-orange"></div></div>' +
    '<div class="stat-card"><div class="stat-icon red">!</div><div class="stat-info"><h3>' + stats.bestScore + '%</h3><p>Ең жоғары балл</p></div><div class="stat-bar stat-bar-red"></div></div>';
}

function loadCategoryTags() {
  var tags = document.getElementById('categoryTags');
  tags.innerHTML =
    '<span class="category-tag active" onclick="filterQuizzes(this,\'all\')">Барлығы</span>' +
    '<span class="category-tag" onclick="filterQuizzes(this,\'Web\')">Web</span>' +
    '<span class="category-tag" onclick="filterQuizzes(this,\'Programming\')">Программалау</span>' +
    '<span class="category-tag" onclick="filterQuizzes(this,\'Networks\')">Желілер</span>' +
    '<span class="category-tag" onclick="filterQuizzes(this,\'Security\')">Қауіпсіздік</span>';
}

function filterQuizzes(element, category) {
  var allTags = document.querySelectorAll('.category-tag');
  for (var i = 0; i < allTags.length; i++) {
    allTags[i].classList.remove('active');
  }
  element.classList.add('active');
  loadQuizzes(category);
}

function loadQuizzes(category) {
  var quizzes = db.getQuizzes();
  var filtered = [];
  if (category === 'all') {
    filtered = quizzes;
  } else {
    for (var i = 0; i < quizzes.length; i++) {
      if (quizzes[i].category === category) filtered.push(quizzes[i]);
    }
  }

  document.getElementById('quizCount').textContent = filtered.length + ' тест';
  var grid = document.getElementById('quizGrid');

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty-state"><h3>Тесттер табылмады</h3><p>Басқа категорияны таңдап көріңіз</p></div>';
    return;
  }

  var html = '';
  for (var j = 0; j < filtered.length; j++) {
    var q = filtered[j];
    html +=
      '<div class="quiz-card">' +
        '<div class="card-banner ' + q.bannerClass + '">' +
          '<span>' + q.icon + '</span>' +
          '<div class="card-difficulty">' + q.difficulty + '</div>' +
        '</div>' +
        '<div class="card-body">' +
          '<h3>' + q.title + '</h3>' +
          '<p>' + q.description + '</p>' +
          '<div class="card-meta">' +
            '<span>' + q.questionsCount + ' сұрақ</span>' +
            '<span>' + Math.floor(q.timeLimit / 60) + ' мин</span>' +
            '<span>' + q.category + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="card-footer">' +
          '<a href="quiz.html?id=' + q.id + '" class="btn btn-primary btn-block">Тестті бастау</a>' +
        '</div>' +
      '</div>';
  }
  grid.innerHTML = html;
}

function loadSidebarResults(user) {
  var results = db.getResultsByUserId(user.id);
  var container = document.getElementById('sidebarResults');

  if (results.length === 0) {
    container.innerHTML = '<div class="sidebar-empty">Әлі тест тапсырмадыңыз</div>';
    return;
  }

  results.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
  var recent = results.slice(0, 4);
  var html = '';

  for (var i = 0; i < recent.length; i++) {
    var r = recent[i];
    var badgeClass = 'score-good';
    if (r.score >= 90) badgeClass = 'score-excellent';
    else if (r.score >= 70) badgeClass = 'score-good';
    else if (r.score >= 50) badgeClass = 'score-average';
    else badgeClass = 'score-poor';

    html +=
      '<div class="sidebar-item">' +
        '<span class="si-title">' + r.quizTitle + '</span>' +
        '<span class="si-score ' + badgeClass + '">' + r.score + '%</span>' +
      '</div>';
  }
  container.innerHTML = html;
}

// Прогресс графигі — CSS-пен жасалған қарапайым бар чарт
function loadProgressChart(user) {
  var results = db.getResultsByUserId(user.id);
  var container = document.getElementById('progressChart');

  if (results.length === 0) {
    container.innerHTML = '<div class="sidebar-empty">Деректер жоқ</div>';
    return;
  }

  // Соңғы 5 нәтиже
  results.sort(function(a, b) { return new Date(a.date) - new Date(b.date); });
  var last = results.slice(-5);

  var html = '<div class="chart-bars">';
  for (var i = 0; i < last.length; i++) {
    var r = last[i];
    var barColor = 'var(--primary)';
    if (r.score >= 90) barColor = 'var(--success)';
    else if (r.score >= 70) barColor = 'var(--primary)';
    else if (r.score >= 50) barColor = 'var(--warning)';
    else barColor = 'var(--danger)';

    html +=
      '<div class="chart-bar-item">' +
        '<div class="chart-bar-track">' +
          '<div class="chart-bar-fill" style="height:' + r.score + '%;background:' + barColor + ';"></div>' +
        '</div>' +
        '<div class="chart-bar-label">' + r.score + '%</div>' +
      '</div>';
  }
  html += '</div>';
  container.innerHTML = html;
}