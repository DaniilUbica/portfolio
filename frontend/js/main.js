import { loadPortfolioData } from './api.js';
import { renderHero } from './hero.js';
import { renderAbout } from './about.js';
import { renderSkillsList, renderSkillThreads, initSkillsViewToggle } from './skills.js';
import { renderReposFromConfig, toggleRepo } from './repos.js';
import { renderStack } from './stack.js';
import { renderContact } from './contact.js';
import { initScrollAddr } from './scroll.js';
import { initThemeSwitcher } from './themes.js';
import { runBoot } from './boot.js';

// repo-header uses an inline onclick="toggleRepo(i)" in the markup,
// so the handler needs to be reachable on window
window.toggleRepo = toggleRepo;

// ════════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════════
async function init() {
  initThemeSwitcher();
  await loadPortfolioData();
  renderHero();
  renderAbout();
  renderSkillsList();
  renderSkillThreads();
  initSkillsViewToggle();
  renderStack();
  renderContact();
  renderReposFromConfig();
  initScrollAddr();
  runBoot();
}

init();
