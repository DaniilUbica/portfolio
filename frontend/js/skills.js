import { CONFIG } from './config.js';
import { toHex } from './utils.js';

// ════════════════════════════════════════════════════════════
//  SKILLS SEGMENT — list view + parallel threads / call stacks
// ════════════════════════════════════════════════════════════
export function renderSkillsList() {
  const table = document.getElementById('skills-list-table');
  table.innerHTML = CONFIG.skillThreads.map((t, ti) => {
    const addr = toHex(0x00002000 + ti * 0x100, 4);
    const items = t.frames.map(f => f.name).join(' <span>/</span> ');
    return `
      <tr>
        <td class="sl-addr">0x${addr}</td>
        <td class="sl-name">${t.name}</td>
        <td class="sl-items">${items}</td>
      </tr>
    `;
  }).join('');
}

export function initSkillsViewToggle() {
  const buttons = document.querySelectorAll('.svt-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const view = btn.dataset.view;
      document.getElementById('skills-view-list').style.display    = view === 'list' ? '' : 'none';
      document.getElementById('skills-view-threads').style.display = view === 'threads' ? '' : 'none';
      if (view === 'threads') layoutThreadsTree();
    });
  });
}

export function renderSkillThreads() {
  const container = document.getElementById('skills-threads');
  container.innerHTML = CONFIG.skillThreads.map((t, ti) => {
    const tid = toHex(0x00002000 + ti * 0x100, 4);
    const frames = t.frames.map((f, fi) => `
      <div class="tframe">
        <span class="tf-idx">#${fi}</span>
        <span class="tf-name">${f.name}</span>
        <span class="tf-lvl">${f.lvl}</span>
      </div>
    `).join('');
    return `
      <div class="thread-block" data-thread="${t.id}">
        <div class="thread-header">
          <span class="thread-dot" style="animation-delay:${(ti * 0.2).toFixed(1)}s"></span>
          <span class="thread-id">tid=0x${tid}</span>
          <span class="thread-name">${t.name}</span>
          <span class="thread-state">${t.state}</span>
        </div>
        <div class="thread-frames">${frames}</div>
      </div>
    `;
  }).join('');

  layoutThreadsTree();
  window.addEventListener('resize', layoutThreadsTree);
}

// Parallel-Stacks style layout: one root thread, others branch off it in
// columns by depth. Each column is a vertical stack of non-overlapping
// blocks, so a parent→child line never has to cross another block.
export function layoutThreadsTree() {
  const outer = document.getElementById('skills-outer');
  const wrap  = document.getElementById('skills-threads');
  if (!outer || !wrap) return;

  const byId = {};
  CONFIG.skillThreads.forEach(t => { byId[t.id] = t; });

  // depth = distance from a root (a thread with no joins, or whose join
  // target isn't in this dataset)
  const depthCache = {};
  function depthOf(id, seen) {
    if (depthCache[id] !== undefined) return depthCache[id];
    seen = seen || new Set();
    if (seen.has(id)) return 0; // guard against cycles
    seen.add(id);
    const t = byId[id];
    const parent = t.joins && t.joins[0];
    const d = (parent && byId[parent]) ? depthOf(parent, seen) + 1 : 0;
    depthCache[id] = d;
    return d;
  }

  const rowsOfThreads = [];
  CONFIG.skillThreads.forEach(t => {
    const d = depthOf(t.id);
    (rowsOfThreads[d] = rowsOfThreads[d] || []).push(t);
  });

  const blockW   = 250;
  const colGapX  = 24;
  const rowGapY  = 70;
  const sidePad  = 10;
  const wrapWidth = Math.max(outer.clientWidth - sidePad * 2, blockW);

  // wrap rows that would overflow the container width onto extra lines
  const lines = [];
  rowsOfThreads.forEach(row => {
    let line = [];
    let lineW = 0;
    row.forEach(t => {
      const w = blockW + (line.length ? colGapX : 0);
      if (lineW + w > wrapWidth && line.length) {
        lines.push(line);
        line = [];
        lineW = 0;
      }
      line.push(t);
      lineW += blockW + (line.length > 1 ? colGapX : 0);
    });
    if (line.length) lines.push(line);
  });

  const positions = {};
  let y = sidePad;
  let maxRowWidth = 0;
  lines.forEach(line => {
    const rowWidth = line.length * blockW + (line.length - 1) * colGapX;
    maxRowWidth = Math.max(maxRowWidth, rowWidth);
    let x = (wrapWidth - rowWidth) / 2;
    let rowH = 0;
    line.forEach(t => {
      positions[t.id] = { x, y };
      const el = wrap.querySelector(`[data-thread="${t.id}"]`);
      rowH = Math.max(rowH, el ? el.offsetHeight : 150);
      x += blockW + colGapX;
    });
    y += rowH + rowGapY;
  });

  CONFIG.skillThreads.forEach(t => {
    const el = wrap.querySelector(`[data-thread="${t.id}"]`);
    const p = positions[t.id];
    if (!el || !p) return;
    el.style.left = p.x + 'px';
    el.style.top  = p.y + 'px';
  });

  wrap.style.width  = wrapWidth + 'px';
  wrap.style.height = (y - rowGapY + sidePad) + 'px';

  drawThreadLinks();
}

function drawThreadLinks() {
  const outer = document.getElementById('skills-outer');
  const svg   = document.getElementById('skills-links');
  if (!outer || !svg) return;

  const outerRect = outer.getBoundingClientRect();
  svg.setAttribute('width', outerRect.width);
  svg.setAttribute('height', outerRect.height);

  const blocks = {};
  outer.querySelectorAll('.thread-block').forEach(el => {
    blocks[el.dataset.thread] = el;
  });

  // point on rect border where the line toward (tx,ty) exits the box
  function edgePoint(rect, cx, cy, tx, ty) {
    const dx = tx - cx, dy = ty - cy;
    if (dx === 0 && dy === 0) return { x: cx, y: cy };
    const hw = rect.width / 2, hh = rect.height / 2;
    const scale = Math.min(hw / Math.abs(dx || 1e-6), hh / Math.abs(dy || 1e-6));
    return { x: cx + dx * scale, y: cy + dy * scale };
  }

  let paths = '';
  CONFIG.skillThreads.forEach(t => {
    (t.joins || []).forEach(joinId => {
      const a = blocks[t.id];
      const b = blocks[joinId];
      if (!a || !b) return;
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();

      const acx = ra.left + ra.width / 2 - outerRect.left;
      const acy = ra.top  + ra.height / 2 - outerRect.top;
      const bcx = rb.left + rb.width / 2 - outerRect.left;
      const bcy = rb.top  + rb.height / 2 - outerRect.top;

      const p1 = edgePoint(ra, acx, acy, bcx, bcy);
      const p2 = edgePoint(rb, bcx, bcy, acx, acy);
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      paths += `<path d="M ${p1.x} ${p1.y} C ${midX} ${p1.y}, ${midX} ${p2.y}, ${p2.x} ${p2.y}" />`;
    });
  });
  svg.innerHTML = paths;
}
