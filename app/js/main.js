// Leonida Platinum Atlas — UI wiring. Data (app/data/trophies.json) is
// fetched after the shell paints, so the first load stays small.
import { loadState, saveState, seedState, emptyState, exportJson, parseImport } from './store.js';
import { UNSETTLED, isEarned, displayName, displayDesc, matches, nextUp } from './filters.js';
import { PHASES, phaseProgress, watchOrder } from './roadmap.js';

const $ = (s) => document.querySelector(s);
let trophies = [];
let state = loadState();
let selectedId = 2;

// Screenshot / deep-link routing: ?view=roadmap|watch|tracker, ?spoiler=1
const params = new URLSearchParams(location.search);
if (params.get('spoiler') === '1') state.spoiler = true;

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function earnedCount() { return trophies.filter((t) => isEarned(state, t)).length; }

function renderStats() {
  const n = earnedCount();
  $('#stat-earned').textContent = n + '/55';
  $('#stat-remaining').textContent = String(55 - n);
  $('#stat-watch').textContent = String(trophies.filter((t) => t.watch && !isEarned(state, t)).length) + ' left';
  const pct = Math.round((n / 55) * 100);
  $('#stat-pct').textContent = pct + '% to platinum';
  $('#stat-bar').style.width = pct + '%';
}

function currentFilters() {
  return { q: $('#q').value.trim(), kind: $('#f-kind').value, grade: $('#f-grade').value, status: $('#f-status').value };
}

function renderList() {
  const f = currentFilters();
  const rows = trophies.filter((t) => matches(state, t, f));
  $('#list-count').textContent = 'Showing ' + rows.length + ' of 55 trophies';
  $('#trophy-list').innerHTML = rows.map((t) => {
    const earned = isEarned(state, t);
    const count = t.target ? (state.counts[t.id] || 0) : null;
    return '<li><button type="button" class="trophy-row' + (earned ? ' is-earned' : '') + (t.id === selectedId ? ' is-selected' : '') + '" data-select="' + t.id + '">' +
      '<span class="dot ' + t.grade + '"></span>' +
      '<span class="tmain"><span class="tname">' + esc(displayName(state, t, state.spoiler)) + '</span>' +
      '<span class="tdesc" style="display:block">' + esc(displayDesc(state, t, state.spoiler)) + '</span></span>' +
      (t.watch ? '<span class="badge watch">WATCH</span>' : '') +
      (UNSETTLED.has(t.name) ? '<span class="badge unsettled">trigger 未定死</span>' : '') +
      '<span class="tmeta">' + t.grade + ' · P' + t.stage + (count !== null ? ' · ' + count + '/' + t.target : '') + '</span>' +
      '<span class="check" data-toggle="' + t.id + '" title="Toggle earned">' + (earned ? '✓' : '') + '</span>' +
      '</button></li>';
  }).join('');
}

function renderDetail() {
  const t = trophies.find((x) => x.id === selectedId) || trophies[0];
  if (!t) return;
  const earned = isEarned(state, t);
  const unsettled = UNSETTLED.has(t.name);
  const count = state.counts[t.id] || 0;
  const pct = t.target ? Math.min(100, Math.round((count / t.target) * 100)) : 0;
  $('#detail').innerHTML =
    '<h2>' + esc(displayName(state, t, state.spoiler)) + '</h2>' +
    '<p class="desc">“' + esc(displayDesc(state, t, state.spoiler)) + '”</p>' +
    '<div class="chips">' +
    '<span class="chip">Grade <b>' + t.grade + '</b></span>' +
    '<span class="chip">Type <b>' + esc(t.kinds.join(' + ')) + '</b></span>' +
    '<span class="chip">Phase <b>' + t.stage + ' of 6</b></span>' +
    '<span class="chip">Missable <b>' + (t.watch ? 'Watch — not proven missable' : 'Not flagged') + '</b></span>' +
    '<span class="chip">Online <b>not required</b></span>' +
    '<span class="chip">Status <b>' + (earned ? 'Earned ✓' : 'Remaining') + '</b></span></div>' +
    (unsettled ? '<div class="unsettled-box"><strong>Trigger not yet pinned down （未定死）.</strong> Neither Exophase nor PSNProfiles fixes the exact trigger for this trophy, so this card gives only the description-supported reading below — no invented steps.</div>' : '') +
    (t.watch ? '<div class="unsettled-box" style="border-color:var(--accent);background:#2c2410"><strong>Watch item.</strong> ' + esc(t.watch) + '</div>' : '') +
    '<button type="button" id="d-toggle">' + (earned ? 'Mark as not earned' : 'Mark as earned ✓') + '</button>' +
    (t.target ? '<h3>Progress counter</h3><div class="counter">' +
      '<button type="button" id="c-minus">−</button>' +
      '<input type="number" id="c-input" min="0" value="' + count + '" aria-label="Current count">' +
      '<button type="button" id="c-plus">+</button>' +
      '<span>of ' + t.target + ' ' + esc(t.targetLabel) + '</span>' +
      '<span class="bar" style="display:block"><span class="bar-fill" style="display:block;height:100%;width:' + pct + '%"></span></span>' +
      '<span class="hint">' + pct + '% — reaching ' + t.target + ' lights this trophy automatically</span></div>' : '') +
    '<h3>Unlock steps</h3><ol>' + t.steps.map((s) => '<li>' + esc(s) + '</li>').join('') + '</ol>' +
    '<h3>Guide</h3><p>' + esc(t.guide) + '</p>' +
    '<h3>Sources</h3><p class="sources">' + esc(t.sources) + ' Guide text is original to this atlas.</p>' +
    '<h3>Your notes</h3><textarea id="d-note" placeholder="Your own route notes for this trophy — saved offline with your progress.">' + esc(state.notes[t.id] || '') + '</textarea>';

  $('#d-toggle').addEventListener('click', () => { setEarned(t, !isEarned(state, t)); });
  const note = $('#d-note');
  note.addEventListener('input', () => { state.notes[t.id] = note.value; saveState(state); });
  if (t.target) {
    const apply = (v) => {
      const n = Math.max(0, Math.floor(Number(v) || 0));
      state.counts[t.id] = n;
      if (n >= t.target) state.earned[t.id] = true; else if (state.earned[t.id] && n < t.target) delete state.earned[t.id];
      saveState(state); renderAll();
    };
    $('#c-plus').addEventListener('click', () => apply(count + 1));
    $('#c-minus').addEventListener('click', () => apply(count - 1));
    $('#c-input').addEventListener('change', (e) => apply(e.target.value));
  }
}

function setEarned(t, on) {
  if (on) state.earned[t.id] = true; else delete state.earned[t.id];
  if (on && t.target) state.counts[t.id] = Math.max(state.counts[t.id] || 0, t.target);
  saveState(state); renderAll();
}

function renderNextUp() {
  $('#nextup-list').innerHTML = nextUp(trophies, state, 5).map(({ t, why }) =>
    '<li><strong>' + esc(displayName(state, t, state.spoiler)) + '</strong> (' + t.grade + ')' +
    '<span class="why">' + esc(why) + '</span></li>').join('');
}

function renderRoadmap() {
  $('#roadmap-list').innerHTML = PHASES.map((p) => {
    const pr = phaseProgress(trophies, state, p.stage);
    return '<div class="phase"><div class="phase-head"><h3>' + esc(p.name) + '</h3>' +
      '<span class="tmeta">' + pr.done + '/' + pr.total + ' earned · ' + pr.pct + '%</span></div>' +
      '<p class="pdesc">' + esc(p.desc) + '</p>' +
      '<div class="bar"><div class="bar-fill" style="width:' + pr.pct + '%"></div></div>' +
      '<div class="chiprow">' + pr.trophies.map((t) =>
        '<span class="tchip' + (isEarned(state, t) ? ' done' : '') + '">' + esc(displayName(state, t, state.spoiler)) + '</span>').join('') +
      '</div></div>';
  }).join('');
}

function renderWatch() {
  const items = watchOrder(trophies);
  $('#watch-list').innerHTML = items.map((t, i) =>
    '<li class="watch-card"><h3>' + (i + 1) + '. ' + esc(t.name) + ' <span class="badge">' + t.grade + '</span> <span class="badge">phase ' + t.stage + '</span>' +
    (isEarned(state, t) ? ' <span class="badge" style="color:var(--teal)">earned ✓</span>' : '') + '</h3>' +
    '<p><em>“' + esc(t.description) + '”</em></p><p>' + esc(t.watch) + '</p>' +
    '<p class="order">Safe order #' + (i + 1) + ' of 9 — ' +
    (t.stage <= 2 ? 'finish before the story finale, in roadmap phase ' + t.stage : 'keep chapter-break saves from phase ' + t.stage + ' on; see its guide card') + '</p></li>').join('');
}

function renderAll() { renderStats(); renderList(); renderDetail(); renderNextUp(); renderRoadmap(); renderWatch(); }

function setView(name) {
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('is-active', v.id === 'view-' + name));
  document.querySelectorAll('[data-view-btn]').forEach((b) => b.classList.toggle('is-active', b.dataset.viewBtn === name));
}

function wire() {
  document.querySelectorAll('[data-view-btn]').forEach((b) => b.addEventListener('click', () => setView(b.dataset.viewBtn)));
  for (const id of ['#q', '#f-kind', '#f-grade', '#f-status']) $(id).addEventListener('input', renderList);
  const sp = $('#f-spoiler');
  sp.checked = !!state.spoiler;
  sp.addEventListener('change', () => { state.spoiler = sp.checked; saveState(state); renderAll(); });
  $('#trophy-list').addEventListener('click', (e) => {
    const toggle = e.target.closest('[data-toggle]');
    const row = e.target.closest('[data-select]');
    if (!row) return;
    const t = trophies.find((x) => x.id === Number(row.dataset.select));
    selectedId = t.id;
    if (toggle) setEarned(t, !isEarned(state, t)); else renderAll();
  });
  $('#btn-seed').addEventListener('click', () => { state = seedState(); if (params.get('spoiler') === '1') state.spoiler = true; saveState(state); $('#f-spoiler').checked = !!state.spoiler; renderAll(); });
  $('#btn-reset').addEventListener('click', () => { state = emptyState(); saveState(state); $('#f-spoiler').checked = false; renderAll(); });
  $('#btn-export').addEventListener('click', () => {
    const blob = new Blob([exportJson(state)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'leonida-atlas-progress.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });
  $('#file-import').addEventListener('change', async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try { state = parseImport(await file.text()); saveState(state); $('#f-spoiler').checked = !!state.spoiler; renderAll(); }
    catch { alert('That file is not an atlas progress export.'); }
    e.target.value = '';
  });
  // Deep-linkable filter presets (used by the spoiler screenshot): a
  // remaining-only, spoiler-shielded list makes the masking visible at a
  // glance next to the readable earned detail card.
  const statusParam = params.get('status');
  if (statusParam && ['earned', 'remaining', 'counting', 'watch'].includes(statusParam)) $('#f-status').value = statusParam;
  const kindParam = params.get('kind');
  if (kindParam && ['story', 'activities', 'collectibles', 'platinum', 'missable'].includes(kindParam)) $('#f-kind').value = kindParam;
  const gradeParam = params.get('grade');
  if (gradeParam && ['platinum', 'gold', 'silver', 'bronze'].includes(gradeParam)) $('#f-grade').value = gradeParam;
  const view = params.get('view');
  if (view === 'roadmap' || view === 'watch') setView(view);
}

fetch('data/trophies.json')
  .then((r) => r.json())
  .then((data) => { trophies = data.trophies; wire(); renderAll(); })
  .catch(() => { $('#trophy-list').innerHTML = '<li style="padding:12px">Could not load data/trophies.json — serve the app with node serve.ts.</li>'; });
