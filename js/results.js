document.addEventListener('DOMContentLoaded', function() {
  var currentUser = checkAuth(true);
  if (!currentUser) return;
  updateNavbar(currentUser);

  var urlParams = new URLSearchParams(window.location.search);
  var resultId = urlParams.get('id');

  if (resultId) {
    showSingleResult(resultId);
  } else {
    showAllResults(currentUser);
  }
});

function showSingleResult(resultId) {
  showLoading('Нәтижелер жүктелуде...');

  setTimeout(function() {
    try {
      var result = db.getResultById(resultId);

      if (!result) {
        hideLoading();
        showToast('Нәтиже табылмады!', 'error');
        setTimeout(function() { window.location.href = 'dashboard.html'; }, 1500);
        return;
      }

      var container = document.getElementById('resultContent');
      var scoreClass = getScoreClass(result.score);
      var message = getScoreMessage(result.score);
      var timeFormatted = formatTime(result.timeSpent);
      var letters = ['A', 'B', 'C', 'D', 'E', 'F'];
      var dateFormatted = formatDate(result.date);

      var answersHtml = '';
      for (var i = 0; i < result.answers.length; i++) {
        var answer = result.answers[i];
        var statusText = answer.isCorrect
          ? '<span style="color:var(--success);margin-left:8px;font-weight:600;">Дұрыс</span>'
          : '<span style="color:var(--danger);margin-left:8px;font-weight:600;">Қате</span>';

        var optionsHtml = '';
        for (var j = 0; j < answer.options.length; j++) {
          var className = '';
          var suffix = '';
          if (j === answer.correctAnswer) {
            className = 'correct';
            suffix = '<span style="margin-left:auto;color:var(--success);font-weight:600;font-size:0.75rem;">Дұрыс жауап</span>';
          } else if (j === answer.userAnswer && !answer.isCorrect) {
            className = 'incorrect';
            suffix = '<span style="margin-left:auto;color:var(--danger);font-weight:600;font-size:0.75rem;">Сіздің жауап</span>';
          }

          optionsHtml +=
            '<div class="option-item ' + className + '" style="cursor:default;">' +
              '<div class="option-letter">' + letters[j] + '</div>' +
              '<div class="option-text">' + answer.options[j] + '</div>' +
              suffix +
            '</div>';
        }

        answersHtml +=
          '<div class="question-card" style="margin-bottom:0.75rem;">' +
            '<div class="question-number">СҰРАҚ ' + (i + 1) + ' ' + statusText + '</div>' +
            '<div class="question-text">' + answer.question + '</div>' +
            '<div class="options-list">' + optionsHtml + '</div>' +
          '</div>';
      }

      container.innerHTML =
        '<div class="result-card" id="printArea">' +
          '<div class="result-score ' + scoreClass + '">' + result.score + '%</div>' +
          '<div class="result-text">' + message + '</div>' +
          '<div class="result-details">' +
            '<div class="result-detail-item">' +
              '<div class="detail-number" style="color:var(--success);">' + result.correctCount + '</div>' +
              '<div class="detail-label">Дұрыс</div>' +
            '</div>' +
            '<div class="result-detail-item">' +
              '<div class="detail-number" style="color:var(--danger);">' + (result.totalQuestions - result.correctCount) + '</div>' +
              '<div class="detail-label">Қате</div>' +
            '</div>' +
            '<div class="result-detail-item">' +
              '<div class="detail-number" style="color:var(--primary);">' + result.totalQuestions + '</div>' +
              '<div class="detail-label">Барлығы</div>' +
            '</div>' +
            '<div class="result-detail-item">' +
              '<div class="detail-number" style="color:var(--warning);">' + timeFormatted + '</div>' +
              '<div class="detail-label">Уақыт</div>' +
            '</div>' +
          '</div>' +
          '<div class="result-meta" style="font-size:0.75rem;color:var(--text-muted);margin-bottom:1.5rem;">' +
            'Тест: ' + result.quizTitle + ' | Күні: ' + dateFormatted + ' | Пайдаланушы: ' + result.username +
          '</div>' +
          '<div class="result-actions">' +
            '<a href="dashboard.html" class="btn btn-outline">Басты бет</a>' +
            '<a href="quiz.html?id=' + result.quizId + '" class="btn btn-primary">Қайта тапсыру</a>' +
            '<button class="btn btn-success" onclick="printResult()">Баспаға шығару</button>' +
          '</div>' +
        '</div>' +
        '<div class="section-title">Жауаптарды қарау</div>' +
        answersHtml;

      hideLoading();
    } catch (error) {
      hideLoading();
      showToast('Қате: ' + error.message, 'error');
    }
  }, 500);
}

function showAllResults(user) {
  var results = db.getResultsByUserId(user.id);
  var container = document.getElementById('resultContent');

  container.innerHTML =
    '<div class="page-header">' +
      '<h1>Менің нәтижелерім</h1>' +
      '<p>Барлық тапсырылған тесттер тарихы</p>' +
    '</div>';

  if (results.length === 0) {
    container.innerHTML +=
      '<div class="empty-state">' +
        '<h3>Нәтижелер жоқ</h3>' +
        '<p>Сіз әлі тест тапсырмадыңыз</p>' +
        '<a href="dashboard.html" class="btn btn-primary" style="margin-top:1rem;">Тест тапсыру</a>' +
      '</div>';
    return;
  }

  results.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });

  var rowsHtml = '';
  for (var i = 0; i < results.length; i++) {
    var r = results[i];
    rowsHtml +=
      '<tr>' +
        '<td>' + (i + 1) + '</td>' +
        '<td><strong>' + r.quizTitle + '</strong></td>' +
        '<td><span class="score-badge ' + getScoreBadgeClass(r.score) + '">' + r.score + '%</span></td>' +
        '<td>' + r.correctCount + ' / ' + r.totalQuestions + '</td>' +
        '<td>' + formatTime(r.timeSpent) + '</td>' +
        '<td>' + formatDate(r.date) + '</td>' +
        '<td><a href="results.html?id=' + r.id + '" class="btn btn-outline" style="padding:4px 10px;font-size:0.75rem;">Қарау</a></td>' +
      '</tr>';
  }

  container.innerHTML +=
    '<div class="results-table-container">' +
      '<table class="results-table">' +
        '<thead><tr><th>No</th><th>Тест</th><th>Балл</th><th>Дұрыс</th><th>Уақыт</th><th>Күні</th><th>Әрекет</th></tr></thead>' +
        '<tbody>' + rowsHtml + '</tbody>' +
      '</table>' +
    '</div>';
}

// Баспаға шығару
function printResult() {
  window.print();
}

function getScoreClass(score) {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'average';
  return 'poor';
}

function getScoreMessage(score) {
  if (score >= 90) return 'Тамаша нәтиже! Сіз керемет білім көрсеттіңіз!';
  if (score >= 70) return 'Жақсы нәтиже! Білімді жалғастыра беріңіз!';
  if (score >= 50) return 'Орташа нәтиже. Материалды қайта қарап шығыңыз.';
  return 'Нәтиже төмен. Тақырыпты қайта оқып, тағы тырысыңыз!';
}

function getScoreBadgeClass(score) {
  if (score >= 90) return 'score-excellent';
  if (score >= 70) return 'score-good';
  if (score >= 50) return 'score-average';
  return 'score-poor';
}

function formatTime(seconds) {
  var mins = Math.floor(seconds / 60);
  var secs = seconds % 60;
  return mins + ' мин ' + secs + ' сек';
}

function formatDate(dateString) {
  var date = new Date(dateString);
  var d = date.getDate();
  var m = date.getMonth() + 1;
  var y = date.getFullYear();
  var h = date.getHours();
  var min = date.getMinutes();
  if (d < 10) d = '0' + d;
  if (m < 10) m = '0' + m;
  if (h < 10) h = '0' + h;
  if (min < 10) min = '0' + min;
  return d + '.' + m + '.' + y + ' ' + h + ':' + min;
}