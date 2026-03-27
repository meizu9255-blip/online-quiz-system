document.addEventListener('DOMContentLoaded', function() {
  var currentUser = checkAuth(true);
  if (!currentUser) return;
  updateNavbar(currentUser);
  loadLeaderboard();
});

function loadLeaderboard() {
  var users = db.getUsers();
  var allResults = db.getResults();

  // Әр пайдаланушының статистикасын жина
  var userStats = [];

  for (var i = 0; i < users.length; i++) {
    var userId = users[i].id;
    var userResults = [];

    for (var j = 0; j < allResults.length; j++) {
      if (allResults[j].userId === userId) {
        userResults.push(allResults[j]);
      }
    }

    if (userResults.length === 0) continue;

    var totalScore = 0;
    var bestScore = 0;
    for (var k = 0; k < userResults.length; k++) {
      totalScore += userResults[k].score;
      if (userResults[k].score > bestScore) bestScore = userResults[k].score;
    }

    userStats.push({
      username: users[i].username,
      testsCount: userResults.length,
      averageScore: Math.round(totalScore / userResults.length),
      bestScore: bestScore
    });
  }

  // Орташа балл бойынша сұрыптау
  userStats.sort(function(a, b) {
    return b.averageScore - a.averageScore;
  });

  // Топ 3 көрсету
  var topThree = document.getElementById('topThree');
  if (userStats.length >= 1) {
    var topHtml = '<div class="podium">';

    // 2-ші орын (сол жақта)
    if (userStats.length >= 2) {
      topHtml += createPodiumCard(userStats[1], 2, 'silver');
    } else {
      topHtml += '<div class="podium-card podium-empty"></div>';
    }

    // 1-ші орын (ортада)
    topHtml += createPodiumCard(userStats[0], 1, 'gold');

    // 3-ші орын (оң жақта)
    if (userStats.length >= 3) {
      topHtml += createPodiumCard(userStats[2], 3, 'bronze');
    } else {
      topHtml += '<div class="podium-card podium-empty"></div>';
    }

    topHtml += '</div>';
    topThree.innerHTML = topHtml;
  } else {
    topThree.innerHTML = '<div class="empty-state"><h3>Деректер жоқ</h3><p>Әлі ешкім тест тапсырмаған</p></div>';
  }

  // Толық кесте
  var tbody = document.getElementById('leaderboardBody');
  if (userStats.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--text-muted);">Деректер жоқ</td></tr>';
    return;
  }

  var rowsHtml = '';
  for (var m = 0; m < userStats.length; m++) {
    var s = userStats[m];
    var rank = m + 1;
    var rankDisplay = rank;

    if (rank === 1) rankDisplay = '1';
    else if (rank === 2) rankDisplay = '2';
    else if (rank === 3) rankDisplay = '3';

    var badgeClass = 'score-good';
    if (s.averageScore >= 90) badgeClass = 'score-excellent';
    else if (s.averageScore >= 70) badgeClass = 'score-good';
    else if (s.averageScore >= 50) badgeClass = 'score-average';
    else badgeClass = 'score-poor';

    rowsHtml +=
      '<tr' + (rank <= 3 ? ' class="top-row"' : '') + '>' +
        '<td><span class="rank-badge rank-' + rank + '">' + rankDisplay + '</span></td>' +
        '<td>' +
          '<div style="display:flex;align-items:center;gap:8px;">' +
            '<div class="mini-avatar">' + s.username.charAt(0).toUpperCase() + '</div>' +
            '<strong>' + s.username + '</strong>' +
          '</div>' +
        '</td>' +
        '<td>' + s.testsCount + '</td>' +
        '<td><span class="score-badge ' + badgeClass + '">' + s.averageScore + '%</span></td>' +
        '<td><strong>' + s.bestScore + '%</strong></td>' +
      '</tr>';
  }
  tbody.innerHTML = rowsHtml;
}

function createPodiumCard(stat, rank, type) {
  return '<div class="podium-card podium-' + type + '">' +
    '<div class="podium-rank">' + rank + '</div>' +
    '<div class="podium-avatar">' + stat.username.charAt(0).toUpperCase() + '</div>' +
    '<div class="podium-name">' + stat.username + '</div>' +
    '<div class="podium-score">' + stat.averageScore + '%</div>' +
    '<div class="podium-label">Орташа балл</div>' +
    '<div class="podium-tests">' + stat.testsCount + ' тест</div>' +
  '</div>';
}