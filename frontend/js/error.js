import { toHex } from './utils.js';
import { initThemeSwitcher } from './themes.js';

const ERRORS = {
  404: {
    trap: 'SIGNAL TRAPPED — SIGSEGV',
    title: 'Segmentation fault: page not found',
    desc: 'The requested address does not map to any known segment of this site. The page may have been moved, renamed, or never existed.',
    signal: 'SIGSEGV',
    fault: 'page_not_found()',
  },
  415: {
    trap: 'SIGNAL TRAPPED — SIGBUS',
    title: 'Access denied',
    desc: 'This endpoint is internal and cannot be accessed directly from a browser.',
    signal: 'SIGBUS',
    fault: 'check_permissions()',
  },
  500: {
    trap: 'SIGNAL TRAPPED — SIGABRT',
    title: 'Internal server error',
    desc: 'The backend aborted while building this response. This is logged — try again shortly, or come back later if it persists.',
    signal: 'SIGABRT',
    fault: 'handle_request()',
  },
  503: {
    trap: 'SIGNAL TRAPPED — SIGSTOP',
    title: 'Service unavailable',
    desc: 'The server is temporarily unable to handle requests — likely under maintenance or overloaded. Retry in a moment.',
    signal: 'SIGSTOP',
    fault: 'accept_connection()',
  },
  default: {
    trap: 'SIGNAL TRAPPED — SIGILL',
    title: 'Unknown error',
    desc: 'Something went wrong and the exact cause wasn\'t recognized by this page. Check the status code or try returning to the index.',
    signal: 'SIGILL',
    fault: 'unknown_fault()',
  },
};

function getErrorCode() {
  const params = new URLSearchParams(window.location.search);
  const code = parseInt(params.get('code'), 10);
  return Number.isFinite(code) ? code : 404;
}

function renderError() {
  const code = getErrorCode();
  const info = ERRORS[code] || ERRORS.default;
  const faultAddr = toHex(Math.floor(Math.random() * 0xffffffff));

  document.getElementById('error-trap').textContent = info.trap;
  document.getElementById('error-code').textContent = code;
  document.getElementById('error-title').textContent = info.title;
  document.getElementById('error-desc').textContent = info.desc;
  document.getElementById('error-addr').textContent = '0x' + faultAddr;
  document.getElementById('error-footer-size').textContent = `sizeof(fault) = 0x${code.toString(16).toUpperCase()} bytes`;
  document.title = `${code} // Daniil Ubica`;

  document.getElementById('error-registers').innerHTML = `
    <div class="error-reg"><span class="reg-key">RIP</span><span class="reg-val">0x${faultAddr}</span></div>
    <div class="error-reg"><span class="reg-key">STATUS</span><span class="reg-val">${code}</span></div>
    <div class="error-reg"><span class="reg-key">SIGNAL</span><span class="reg-val">${info.signal}</span></div>
    <div class="error-reg reg-wide"><span class="reg-key">PATH</span><span class="reg-val">${window.location.pathname || '/'}</span></div>
  `;

  document.getElementById('error-frames').innerHTML = `
    <div class="error-frame">
      <span class="ef-idx">#0</span><span class="ef-addr">0x${toHex(0x00000000)}</span><span class="ef-func">main()</span>
    </div>
    <div class="error-frame">
      <span class="ef-idx">#1</span><span class="ef-addr">0x${toHex(0x00001000)}</span><span class="ef-func">router::dispatch()</span>
    </div>
    <div class="error-frame ef-fault">
      <span class="ef-idx">#2</span><span class="ef-addr">0x${faultAddr}</span><span class="ef-func">${info.fault}</span>
    </div>
  `;
}

document.getElementById('error-retry')?.addEventListener('click', () => window.location.reload());

initThemeSwitcher();
renderError();
