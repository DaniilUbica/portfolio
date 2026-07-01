import { CONFIG } from './api.js';
import { toHex } from './utils.js';

export function renderContact() {
  const container = document.getElementById('contact-list');
  container.innerHTML = CONFIG.contact.map((c, i) => {
    const addr = toHex(0x0000FF00 + i * 0x10);
    return `
      <div class="contact-row">
        <span class="contact-addr">${addr}</span>
        <span class="contact-key">${c.key}:</span>
        <span class="contact-val"><a href="${c.href}" target="_blank" rel="noopener">${c.val}</a></span>
      </div>
    `;
  }).join('');
}
