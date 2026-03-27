// ===== QUIZ.JS - Quiz Taking Logic =====

var currentQuiz = null;
var currentQuestionIndex = 0;
var userAnswers = [];
var timerInterval = null;
var timeRemaining = 0;

document.addEventListener('DOMContentLoaded', function() {
  var currentUser = checkAuth(true);
  if (!currentUser) return;
  
  updateNavbar(currentUser);
  initQuiz();
});

function initQuiz() {
  try {
    var urlParams = new URLSearchParams(window.location.search);
    var quizId = urlParams.get('id');
    
    if (!quizId) {
      showToast('Тест табылмады!', 'error');
      setTimeout(function() { window.location.href = 'dashboard.html'; }, 1500);
      return;
    }
    
    showLoading('Тест жүктелуде...');
    
    setTimeout(function() {
      currentQuiz = db.getQuizById(quizId);
      
      if (!currentQuiz) {
        hideLoading();
        showToast('Тест табылмады!', 'error');
        setTimeout(function() { window.location.href = '404.html'; }, 1500);
        return;
      }
      
      userAnswers = [];
      for (var i = 0; i < currentQuiz.questions.length; i++) {
        userAnswers.push(-1);
      }
      
      document.getElementById('quizTitle').textContent = currentQuiz.title;
      
      timeRemaining = currentQuiz.timeLimit;
      startTimer();
      showQuestion(0);
      
      hideLoading();
      showToast('"' + currentQuiz.title + '" тесті басталды! Сәттілік!', 'info');
    }, 500);
    
  } catch (error) {
    hideLoading();
    showToast('Қате орын алды: ' + error.message, 'error');
  }
}

function startTimer() {
  updateTimerDisplay();
  
  timerInterval = setInterval(function() {
    timeRemaining--;
    updateTimerDisplay();
    
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      showToast('Уақыт аяқталды!', 'warning');
      submitQuiz();
    }
  }, 1000);
}

function updateTimerDisplay() {
  var minutes = Math.floor(timeRemaining / 60);
  var seconds = timeRemaining % 60;
  var display = (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  
  var timerElement = document.getElementById('timerDisplay');
  var timerContainer = document.getElementById('quizTimer');
  
  timerElement.textContent = display;
  
  timerContainer.classList.remove('warning', 'danger');
  if (timeRemaining <= 60) {
    timerContainer.classList.add('danger');
  } else if (timeRemaining <= 120) {
    timerContainer.classList.add('warning');
  }
}

function showQuestion(index) {
  currentQuestionIndex = index;
  var question = currentQuiz.questions[index];
  var total = currentQuiz.questions.length;
  var letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  
  var progressPercent = Math.round(((index + 1) / total) * 100);
  document.getElementById('progressText').textContent = 'Сұрақ ' + (index + 1) + ' / ' + total;
  document.getElementById('progressPercent').textContent = progressPercent + '%';
  document.getElementById('progressFill').style.width = progressPercent + '%';
  
  var optionsHtml = '';
  for (var i = 0; i < question.options.length; i++) {
    var selectedClass = (userAnswers[index] === i) ? 'selected' : '';
    optionsHtml +=
      '<div class="option-item ' + selectedClass + '" onclick="selectOption(' + i + ')">' +
        '<div class="option-letter">' + letters[i] + '</div>' +
        '<div class="option-text">' + question.options[i] + '</div>' +
      '</div>';
  }
  
  var container = document.getElementById('questionContainer');
  container.innerHTML =
    '<div class="question-card">' +
      '<div class="question-number">Сұрақ ' + (index + 1) + ' / ' + total + '</div>' +
      '<div class="question-text">' + question.question + '</div>' +
      '<div class="options-list">' + optionsHtml + '</div>' +
    '</div>';
  
  updateNavButtons();
}

function selectOption(optionIndex) {
  userAnswers[currentQuestionIndex] = optionIndex;
  
  var options = document.querySelectorAll('.option-item');
  for (var i = 0; i < options.length; i++) {
    if (i === optionIndex) {
      options[i].classList.add('selected');
    } else {
      options[i].classList.remove('selected');
    }
  }
}

function nextQuestion() {
  if (userAnswers[currentQuestionIndex] === -1) {
    showToast('Жауапты таңдаңыз!', 'warning');
    return;
  }
  
  if (currentQuestionIndex < currentQuiz.questions.length - 1) {
    showQuestion(currentQuestionIndex + 1);
  }
}

function prevQuestion() {
  if (currentQuestionIndex > 0) {
    showQuestion(currentQuestionIndex - 1);
  }
}

function updateNavButtons() {
  var total = currentQuiz.questions.length;
  var btnPrev = document.getElementById('btnPrev');
  var btnNext = document.getElementById('btnNext');
  var btnFinish = document.getElementById('btnFinish');
  
  btnPrev.disabled = (currentQuestionIndex === 0);
  
  if (currentQuestionIndex === total - 1) {
    btnNext.classList.add('hidden');
    btnFinish.classList.remove('hidden');
  } else {
    btnNext.classList.remove('hidden');
    btnFinish.classList.add('hidden');
  }
}

function finishQuiz() {
  var unanswered = 0;
  for (var i = 0; i < userAnswers.length; i++) {
    if (userAnswers[i] === -1) unanswered++;
  }
  
  var confirmText = document.getElementById('confirmText');
  
  if (unanswered > 0) {
    confirmText.textContent = unanswered + ' сұраққа жауап берілмеді. Тестті аяқтағыңыз келе ме?';
  } else {
    confirmText.textContent = 'Барлық сұрақтарға жауап берілді. Тестті аяқтағыңыз келе ме?';
  }
  
  document.getElementById('confirmModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('confirmModal').classList.add('hidden');
}

function submitQuiz() {
  clearInterval(timerInterval);
  closeModal();
  showLoading('Нәтижелер есептелуде...');
  
  setTimeout(function() {
    try {
      var currentUser = db.getCurrentUser();
      var questions = currentQuiz.questions;
      var correctCount = 0;
      
      var answersDetail = [];
      for (var i = 0; i < questions.length; i++) {
        var isCorrect = (userAnswers[i] === questions[i].correctAnswer);
        if (isCorrect) correctCount++;
        
        answersDetail.push({
          questionId: questions[i].id,
          question: questions[i].question,
          userAnswer: userAnswers[i],
          correctAnswer: questions[i].correctAnswer,
          isCorrect: isCorrect,
          options: questions[i].options
        });
      }
      
      var score = Math.round((correctCount / questions.length) * 100);
      var timeSpent = currentQuiz.timeLimit - timeRemaining;
      
      var result = db.saveResult({
        userId: currentUser.id,
        username: currentUser.username,
        quizId: currentQuiz.id,
        quizTitle: currentQuiz.title,
        score: score,
        correctCount: correctCount,
        totalQuestions: questions.length,
        timeSpent: timeSpent,
        answers: answersDetail
      });
      
      hideLoading();
      window.location.href = 'results.html?id=' + result.id;
      
    } catch (error) {
      hideLoading();
      showToast('Қате орын алды: ' + error.message, 'error');
    }
  }, 1000);
}

window.addEventListener('beforeunload', function(event) {
  if (currentQuiz && timerInterval) {
    event.preventDefault();
    event.returnValue = 'Тест аяқталмаған! Шығасыз ба?';
  }
});