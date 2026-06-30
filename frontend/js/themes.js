// ════════════════════════════════════════════════════════════
//  THEMES
// ════════════════════════════════════════════════════════════
export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme === 'matrix' ? '' : theme;
  document.querySelectorAll('.theme-dot').forEach(d => {
    d.classList.toggle('active', d.dataset.theme === theme);
  });
  try { localStorage.setItem('theme', theme); } catch(e) {}
}

export function initThemeSwitcher() {
  document.querySelectorAll('.theme-dot').forEach(dot => {
    dot.addEventListener('click', () => applyTheme(dot.dataset.theme));
  });

  let savedTheme = 'matrix';
  try { savedTheme = localStorage.getItem('theme') || 'matrix'; } catch(e) {}
  applyTheme(savedTheme);
}
