import { CONFIG } from './config.js';
import { toHex } from './utils.js';

// ════════════════════════════════════════════════════════════
//  ABOUT SEGMENT
// ════════════════════════════════════════════════════════════
export function renderAbout() {
  const decoded = document.getElementById('about-decoded-lines');
  decoded.innerHTML = CONFIG.bio.map((line, i) => `
    <div class="about-decoded-line">
      <span class="adl-addr">${toHex(0x00001000 + i * 0x40, 4)}</span>
      <span class="adl-text">${line}</span>
    </div>
  `).join('');
}
