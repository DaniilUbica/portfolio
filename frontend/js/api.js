import { CONFIG } from './config.js';

// ════════════════════════════════════════════════════════════
//  API — pulls portfolio data from the backend's REST endpoint and
//  merges it into CONFIG in place, so every module that already
//  imported { CONFIG } sees the update through the same object
//  reference (no need to re-import or pass data around).
// ════════════════════════════════════════════════════════════
const PORTFOLIO_API_URL = '/api/portfolio';

export async function loadPortfolioData() {
  try {
    const res = await fetch(PORTFOLIO_API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    Object.assign(CONFIG, data);
  } catch (e) {
    // backend unreachable — fall back to the bundled CONFIG defaults
    console.warn('[api] failed to load portfolio data, using defaults:', e.message);
  }
}
