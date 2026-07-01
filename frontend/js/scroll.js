import { toHex } from './utils.js';

export function initScrollAddr() {
  window.addEventListener('scroll', updateScrollAddr, { passive: true });
}

function updateScrollAddr() {
  const pct  = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  const addr = Math.floor(pct * 0x0000FFFF);
  document.getElementById('scroll-addr').textContent = '0x' + toHex(addr);
}
