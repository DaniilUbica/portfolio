import { initThemeSwitcher } from './themes.js';
initThemeSwitcher();

const TOKEN_KEY = 'admin_session_token';

const $ = id => document.getElementById(id);

// ── AUTH ──────────────────────────────────────────────────────────────────

async function login(password) {
  const res = await fetch('/admin/auth', {
    method: 'POST',
    headers: { 'X-Admin-Password': password },
  });
  if (!res.ok) throw new Error('invalid password');
  const { token } = await res.json();
  sessionStorage.setItem(TOKEN_KEY, token);
  return token;
}

function getToken() {
  return sessionStorage.getItem(TOKEN_KEY) || '';
}

function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
  showLogin();
}

// ── API ───────────────────────────────────────────────────────────────────

async function apiGet(path) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Token': getToken(),
    },
    body: JSON.stringify(body),
  });
  if (res.status === 401) { logout(); throw new Error('session expired'); }
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}`);
  return res.json();
}

async function uploadCV(file) {
  const form = new FormData();
  form.append('cv', file);
  const res = await fetch('/api/admin/cv', {
    method: 'POST',
    headers: { 'X-Session-Token': getToken() },
    body: form,
  });
  if (res.status === 401) { logout(); throw new Error('session expired'); }
  if (!res.ok) throw new Error(`upload failed → ${res.status}`);
  return res.json();
}

// ── VIEWS ─────────────────────────────────────────────────────────────────

function showLogin() {
  $('admin-login').style.display = 'flex';
  $('admin-editor').style.display = 'none';
  $('admin-status').textContent = '// not authenticated';
}

function showEditor() {
  $('admin-login').style.display = 'none';
  $('admin-editor').style.display = 'block';
  $('admin-status').textContent = '// authenticated';
}

// ── EXPERIENCE ────────────────────────────────────────────────────────────

function renderExperience(list) {
  const container = $('f-experience-list');
  container.innerHTML = '';
  (list || []).forEach((e, i) => addExpRow(e, i));
}

function addExpRow(e = {}, i = Date.now()) {
  const container = $('f-experience-list');
  const row = document.createElement('div');
  row.className = 'exp-row';
  row.dataset.idx = i;
  row.innerHTML = `
    <input class="adm-input" placeholder="func"  value="${esc(e.func  || '')}" data-key="func"  />
    <input class="adm-input" placeholder="file"  value="${esc(e.file  || '')}" data-key="file"  />
    <input class="adm-input" placeholder="args"  value="${esc(e.args  || '')}" data-key="args"  />
    <input class="adm-input" placeholder="date"  value="${esc(e.date  || '')}" data-key="date"  />
    <button class="exp-remove" title="remove">[x]</button>
  `;
  row.querySelector('.exp-remove').addEventListener('click', () => row.remove());
  container.appendChild(row);
}

function collectExperience() {
  return Array.from($('f-experience-list').querySelectorAll('.exp-row')).map(row => {
    const obj = {};
    row.querySelectorAll('[data-key]').forEach(el => { obj[el.dataset.key] = el.value.trim(); });
    return obj;
  });
}

function esc(str) {
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── LOAD CONTENT ──────────────────────────────────────────────────────────

async function loadContent() {
  const data = await apiGet('/api/content');

  $('f-name').value     = data.name     || '';
  $('f-job').value      = data.job      || '';
  $('f-location').value = data.location || '';

  $('f-about').value = (data.about || []).join('\n');

  renderExperience(data.experience || []);

  $('f-skills').value  = JSON.stringify(data.skills  || [], null, 2);
  $('f-socials').value = JSON.stringify(data.socials || [], null, 2);
}

// ── SAVE ──────────────────────────────────────────────────────────────────

async function save() {
  const skillsEl  = $('f-skills');
  const socialsEl = $('f-socials');
  $('skills-error').textContent = '';

  let skills, socials;
  try { skills  = JSON.parse(skillsEl.value);  } catch { $('skills-error').textContent = 'invalid json in skills';  return; }
  try { socials = JSON.parse(socialsEl.value); } catch { $('skills-error').textContent = 'invalid json in socials'; return; }

  const payload = {
    name:       $('f-name').value.trim(),
    job:        $('f-job').value.trim(),
    location:   $('f-location').value.trim(),
    about:      $('f-about').value.split('\n').map(s => s.trimEnd()).filter(Boolean),
    experience: collectExperience(),
    skills,
    socials,
  };

  const msg = $('save-msg');
  msg.className = 'adm-msg';
  msg.textContent = '> saving...';

  try {
    await apiPost('/api/admin/save', payload);
    await apiPost('/api/content/reload', {});
    msg.textContent = '> saved and reloaded';
  } catch (e) {
    msg.className = 'adm-msg error';
    msg.textContent = `> error: ${e.message}`;
  }
}

// ── INIT ──────────────────────────────────────────────────────────────────

$('login-btn').addEventListener('click', async () => {
  const pwd = $('login-password').value;
  $('login-error').textContent = '';
  try {
    await login(pwd);
    showEditor();
    await loadContent();
  } catch {
    $('login-error').textContent = '> access denied';
  }
});

$('login-password').addEventListener('keydown', e => {
  if (e.key === 'Enter') $('login-btn').click();
});

$('exp-add-btn').addEventListener('click', () => addExpRow());

$('save-btn').addEventListener('click', save);

$('f-cv-file').addEventListener('change', e => {
  const file = e.target.files[0];
  $('f-cv-name').value = file ? file.name : '';
  $('cv-upload-btn').disabled = !file;
});

$('cv-upload-btn').addEventListener('click', async () => {
  const file = $('f-cv-file').files[0];
  if (!file) return;
  const msg = $('cv-msg');
  msg.className = 'adm-msg';
  msg.textContent = '> uploading...';
  try {
    await uploadCV(file);
    msg.textContent = '> cv uploaded successfully';
  } catch (e) {
    msg.className = 'adm-msg error';
    msg.textContent = `> error: ${e.message}`;
  }
});

// auto-login if token exists
if (getToken()) {
  showEditor();
  loadContent().catch(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    showLogin();
  });
} else {
  showLogin();
}
