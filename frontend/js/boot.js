import { CONFIG } from './api.js';
import { layoutThreadsTree } from './skills.js';

function buildBootLines() {
  return [
    { text: 'BIOS v2.04 — Memory self-test... OK',                  cls: 'boot-ok',   delay: 0   },
    { text: 'Loading kernel modules...',                             cls: '',           delay: 300 },
    { text: `Mapping virtual address space for [${CONFIG.name}]`,   cls: 'boot-addr',  delay: 600 },
    { text: 'Resolving debug symbols... OK',                         cls: 'boot-ok',   delay: 900 },
    { text: 'Segment .header  → 0x00000000  [R--]',                 cls: 'boot-addr',  delay: 1100},
    { text: 'Segment .about   → 0x00001000  [R--]',                 cls: 'boot-addr',  delay: 1250},
    { text: 'Segment .skills  → 0x00002000  [R--]',                 cls: 'boot-addr',  delay: 1400},
    { text: 'Segment .repos   → 0x00003000  [RW-] HEAP',            cls: 'boot-warn',  delay: 1550},
    { text: 'Segment .stack   → 0x00004000  [R--]',                 cls: 'boot-addr',  delay: 1700},
    { text: 'Segment .contact → 0x0000FF00  [R--]',                 cls: 'boot-addr',  delay: 1850},
    { text: `Loading objects for github.com/${CONFIG.github}...`,   cls: 'boot-warn',  delay: 2050},
    { text: 'Memory map ready. Starting portfolio...',               cls: 'boot-ok',   delay: 2350},
  ];
}

export async function runBoot() {
  const bootLines = buildBootLines();
  const container = document.getElementById('boot-lines');
  for (const line of bootLines) {
    await new Promise(r => setTimeout(r, line.delay === 0 ? 0 : line.delay - (bootLines[bootLines.indexOf(line)-1]?.delay ?? 0)));
    const el = document.createElement('div');
    el.className = `boot-line visible ${line.cls}`;
    el.textContent = '> ' + line.text;
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
  }
  await new Promise(r => setTimeout(r, 500));
  const boot = document.getElementById('boot');
  boot.classList.add('hidden');
  document.getElementById('main').style.visibility = 'visible';
  setTimeout(() => { boot.style.display = 'none'; }, 600);
  layoutThreadsTree();
}
