import { CONFIG } from './api.js';
import { toHex } from './utils.js';

export function renderReposFromConfig() {
  const repos = CONFIG.repos || [];
  renderRepos(repos);
}

function renderRepos(repos) {
  const container = document.getElementById('repos-container');
  if (!repos.length) {
    container.innerHTML = '<div class="loading-line" style="padding:12px;">> no public repositories found</div>';
    return;
  }

  let html = `<div style="padding:6px 12px;color:var(--comment);font-size:11px;border-bottom:1px solid var(--border)">
    &gt; ${repos.length} objects loaded — HEAP segment 0x00003000
  </div>`;

  repos.forEach((repo, i) => {
    const addr = toHex(0x00003000 + i * 0x80);
    const stars = repo.stargazerCount ? `★ ${repo.stargazerCount}` : '★ 0';
    const lang  = repo.primaryLanguage?.name || '??';
    const desc  = repo.description || 'no description';

    const topicNodes = repo.repositoryTopics?.nodes ?? [];
    const topics = topicNodes.length
      ? `<div class="topic-bar-wrap">${topicNodes.map(n => `<span class="topic-chip">${n.topic.name}</span>`).join('')}</div>`
      : '';

    const langs = repo.languages?.nodes?.slice(0, 4)
      .map(l => `<span class="lang-chip" style="border-color:${l.color}">${l.name}</span>`)
      .join('') || `<span class="lang-chip">${lang}</span>`;

    const descBytes = Array.from(desc.slice(0, 16)).map(c =>
      c.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase()
    ).join(' ');
    const descAscii = Array.from(desc.slice(0, 16)).map(c => {
      const code = c.charCodeAt(0);
      return (code >= 32 && code < 127) ? c : '.';
    }).join('');

    html += `
      <div class="repo-block" id="repo-${i}">
        <div class="repo-header" onclick="toggleRepo(${i})">
          <span class="repo-addr">${addr}</span>
          <span class="repo-name">${repo.name}</span>
          <span class="repo-lang">${lang}</span>
          <span class="repo-stars">${stars}</span>
          <span class="repo-toggle" id="toggle-${i}">[+]</span>
        </div>
        <div class="repo-detail" id="detail-${i}">
          <div class="repo-detail-hex" style="margin-top:8px;">
            <span class="daddr">${addr}+00</span>
            &nbsp;<span class="dbytes">${descBytes}</span>
            &nbsp;<span class="dascii">|${descAscii}|</span>
          </div>
          <div style="margin-top:8px;color:var(--green-dim);font-size:12px;">${desc}</div>
          <div class="lang-bar-wrap">${langs}</div>
          ${topics}
          <a class="repo-link" href="${repo.url}" target="_blank" rel="noopener">
            &gt; open github.com/${CONFIG.github}/${repo.name}
          </a>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

export function toggleRepo(i) {
  const detail = document.getElementById(`detail-${i}`);
  const toggle = document.getElementById(`toggle-${i}`);
  const open   = detail.classList.toggle('open');
  toggle.textContent = open ? '[-]' : '[+]';
}
