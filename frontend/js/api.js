export const CONFIG = {};

function mapData(data) {
  const socials = data.socials ?? [];
  const github  = (socials.find(s => s.name === 'github')?.value ?? '').replace('github.com/', '');

  CONFIG.name         = data.name       ?? '';
  CONFIG.role         = data.job        ?? '';
  CONFIG.location     = data.location   ?? '';
  CONFIG.github       = github;
  CONFIG.bio          = data.about      ?? [];
  CONFIG.skillThreads = data.skills     ?? [];
  CONFIG.experience   = data.experience ?? [];
  CONFIG.contact      = socials.map(s => ({ key: s.name, val: s.value, href: s.ref }));
  CONFIG.repos        = [];
}

export async function loadPortfolioData() {
  const res = await fetch('/api/content');
  if (!res.ok) throw new Error(`/api/content returned HTTP ${res.status}`);
  mapData(await res.json());
}

export async function loadRepos() {
  const res = await fetch('/api/repos');
  if (!res.ok) throw new Error(`/api/repos returned HTTP ${res.status}`);
  CONFIG.repos = await res.json();
}
