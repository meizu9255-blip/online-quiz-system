// Бет HTML жүктелісімен бірден тақырыпты қолдану
// Бұл script body-дан БҰРЫН орындалуы керек
(function() {
  var saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.documentElement.classList.add('dark-mode');
  }
})();

function toggleTheme() {
  var html = document.documentElement;
  var icon = document.getElementById('themeIcon');

  if (html.classList.contains('dark-mode')) {
    html.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
    if (icon) icon.textContent = 'L';
  } else {
    html.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
    if (icon) icon.textContent = 'D';
  }
}

function applyThemeIcon() {
  var icon = document.getElementById('themeIcon');
  if (!icon) return;
  var saved = localStorage.getItem('theme');
  icon.textContent = (saved === 'dark') ? 'D' : 'L';
}