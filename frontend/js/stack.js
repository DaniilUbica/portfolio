import { CONFIG } from './config.js';
import { toHex } from './utils.js';

// ════════════════════════════════════════════════════════════
//  STACK SEGMENT
// ════════════════════════════════════════════════════════════
export function renderStack() {
  const container = document.getElementById('stack-frames');
  container.innerHTML = CONFIG.experience.map((e, i) => {
    const addr = toHex(0x00004000 + i * 0x100);
    return `
      <div class="stack-frame">
        <div class="sf-addr">#${i} &nbsp; 0x${addr}</div>
        <div class="sf-func">${e.func}</div>
        <div class="sf-file">at ${e.file} &nbsp; <span style="color:var(--addr)">${e.date}</span></div>
        <div class="sf-args">(${e.args})</div>
      </div>
    `;
  }).join('');
}
