import { CONFIG } from './config.js';

// ════════════════════════════════════════════════════════════
//  HERO
// ════════════════════════════════════════════════════════════
export function renderHero() {
  document.getElementById('hero-name').textContent = CONFIG.name;
  document.getElementById('hero-role').textContent = CONFIG.role;
  document.getElementById('hero-meta').innerHTML = `
    <span>${CONFIG.location}</span>
    <a href="https://github.com/${CONFIG.github}" target="_blank" rel="noopener">github.com/${CONFIG.github}</a>
  `;
}
