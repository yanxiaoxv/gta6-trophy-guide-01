// main.js — boots the Leonida Platinum Atlas and renders every view from app/data/trophies.json.
// Views: the tracker (checklist + guide pane), the platinum roadmap, the missables watch and
// the Next Up planner. All state lives in store.js; all filtering in filters.js; the roadmap
// and planner logic in roadmap.js. This file is wiring and rendering only.

import {
  emptyProgress, loadProgress, saveProgress, isEarned, setEarned, getCount, setCount,
  getNote, setNote, showcaseProgress, earnedCount, exportProgress, parseImportedProgress,
} from './store.js';
import { KIND_LABELS, filterTrophies, displayName, displayDescription, countByKind } from './filters.js';
import { ROADMAP_STAGES, stageProgress, nextUp } from './roadmap.js';

const state = {
  trophies: [],
  progress: loadProgress(),
  filters: { kind: 'all', grade: 'all', status: 'all', query: '' },
  selectedId: null,
  view: 'tracker',
};

const els = {};

function grabElements() {
  for (const id of [
    'earned-count', 'earned-percent', 'progress-bar', 'missable-count', 'trophy-list',
    'result-count', 'detail-pane', 'search', 'grade-filter', 'status-filter', 'spoiler-toggle',
    'kind-chips', 'roadmap-stages', 'missable-cards', 'next-up-list', 'counter-summary',
    'export-button', 'import-input', 'showcase-button', 'reset-button',
  ]) els[id] = document.getElementById(id);
}

async function loadTrophyData() {
  const response = await fetch('data/trophies.json');
  const data = await response.json();
  state.trophies = Array.isArray(data) ? data : data.trophies;
}

function gradeBadge(trophy) {
  return `<span class="badge grade-${trophy.grade}">${trophy.grade}</span>`;
}

function kindTags(trophy) {
  return trophy.kinds.map((kind) => `<span class="tag">${KIND_LABELS[kind] ?? kind}</span>`).join(' ');
}

function counterText(trophy) {
  if (!trophy.target) return '';
  const count = getCount(state.progress, trophy);
  return `<span class="counter-chip">${count} / ${trophy.target} ${trophy.targetLabel}</span>`;
}

function renderHeaderStats() {
  const earned = earnedCount(state.progress, state.trophies);
  const total = state.trophies.length;
  els['earned-count'].textContent = `${earned} of ${total}`;
  const percent = total ? Math.round((earned / total) * 100) : 0;
  els['earned-percent'].textContent = `${percent}%`;
  els['progress-bar'].style.width = `${percent}%`;
  els['missable-count'].textContent = String(state.trophies.filter((t) => t.missable).length);
}

function renderTrophyList() {
  const visible = filterTrophies(state.trophies, state.progress, state.filters);
  if (state.filters.kind === 'online') {
    els['result-count'].textContent =
      'Online trophies: none. No trophy on the official list mentions online or multiplayer play — the partner trophies are played with the in-game partner. Showing 0 of 55.';
    els['trophy-list'].innerHTML = '';
    return;
  }
  els['result-count'].textContent = `Showing ${visible.length} of ${state.trophies.length} trophies`;
  els['trophy-list'].innerHTML = visible.map((trophy) => {
    const earned = isEarned(state.progress, trophy.id);
    const selected = state.selectedId === trophy.id ? ' is-selected' : '';
    const watch = trophy.missable ? '<span class="watch-flag">WATCH</span>' : '';
    return `<li class="trophy-row${selected}" data-id="${trophy.id}">
      <label class="earn-box"><input type="checkbox" data-earn="${trophy.id}" ${earned ? 'checked' : ''} aria-label="Mark earned"></label>
      <button type="button" class="row-main" data-open="${trophy.id}">
        <span class="row-top"><span class="row-name">${displayName(trophy, state.progress)}</span>${watch}${gradeBadge(trophy)}</span>
        <span class="row-desc">${displayDescription(trophy, state.progress)}</span>
        <span class="row-meta">${kindTags(trophy)} ${counterText(trophy)}</span>
      </button>
    </li>`;
  }).join('');
}

function renderDetailPane() {
  const trophy = state.trophies.find((entry) => entry.id === state.selectedId);
  if (!trophy) {
    els['detail-pane'].innerHTML = '<p class="detail-empty">Pick a trophy to read its guide, its sources, its steps and its counter.</p>';
    return;
  }
  const earned = isEarned(state.progress, trophy.id);
  const count = getCount(state.progress, trophy);
  const counterBlock = trophy.target ? `
    <div class="counter-box">
      <span>Progress: <strong>${count} / ${trophy.target}</strong> ${trophy.targetLabel}</span>
      <span class="counter-buttons">
        <button type="button" data-count="-1">−1</button>
        <button type="button" data-count="1">+1</button>
        <button type="button" data-count="10">+10</button>
        <input type="number" id="counter-input" min="0" max="${trophy.target}" value="${count}" aria-label="Set progress count">
      </span>
    </div>` : '';
  const watchBlock = trophy.watch ? `<div class="watch-box"><strong>Missables watch.</strong> ${trophy.watch}</div>` : '';
  els['detail-pane'].innerHTML = `
    <div class="detail-head">
      <h2>${displayName(trophy, state.progress)}</h2>
      ${gradeBadge(trophy)}
    </div>
    <p class="official-desc">“${displayDescription(trophy, state.progress)}” <span class="official-note">— official description, as PlayStation publishes it</span></p>
    <p class="detail-meta">${kindTags(trophy)} <span class="tag tag-stage">Roadmap stage ${trophy.stage} of 6</span></p>
    ${watchBlock}
    ${counterBlock}
    <h3>Guide</h3>
    <p class="guide-text">${trophy.guide}</p>
    <h3>Steps</h3>
    <ol class="steps">${trophy.steps.map((step) => `<li>${step}</li>`).join('')}</ol>
    <h3>Sources</h3>
    <p class="sources-text">${trophy.sources}</p>
    <label class="earn-toggle"><input type="checkbox" id="detail-earned" ${earned ? 'checked' : ''}> Earned</label>
    <label class="notes-label">Your notes
      <textarea id="detail-notes" rows="3" placeholder="Locations you found, gangs covered, what worked…">${getNote(state.progress, trophy.id)}</textarea>
    </label>`;
  els['detail-pane'].querySelector('#detail-earned').addEventListener('change', (event) => {
    setEarned(state.progress, trophy.id, event.target.checked);
    renderAll();
  });
  els['detail-pane'].querySelector('#detail-notes').addEventListener('change', (event) => {
    setNote(state.progress, trophy.id, event.target.value);
  });
  const counterInput = els['detail-pane'].querySelector('#counter-input');
  if (counterInput) {
    counterInput.addEventListener('change', () => {
      setCount(state.progress, trophy, counterInput.value);
      renderAll();
    });
    for (const button of els['detail-pane'].querySelectorAll('[data-count]')) {
      button.addEventListener('click', () => {
        setCount(state.progress, trophy, getCount(state.progress, trophy) + Number(button.dataset.count));
        renderAll();
      });
    }
  }
}

function renderRoadmap() {
  els['roadmap-stages'].innerHTML = ROADMAP_STAGES.map((stage) => {
    const { done, total } = stageProgress(state.trophies, state.progress, stage.stage);
    const chips = state.trophies
      .filter((trophy) => trophy.stage === stage.stage)
      .map((trophy) => `<button type="button" class="stage-chip${isEarned(state.progress, trophy.id) ? ' is-earned' : ''}" data-open="${trophy.id}">${displayName(trophy, state.progress)}</button>`)
      .join(' ');
    return `<article class="stage-card">
      <h3>${stage.title} <span class="stage-progress">${done}/${total} earned</span></h3>
      <p class="stage-goal">${stage.goal}</p>
      <p>${stage.detail}</p>
      <div class="stage-chips">${chips}</div>
    </article>`;
  }).join('');
}

function renderMissables() {
  const watched = state.trophies.filter((trophy) => trophy.missable);
  els['missable-cards'].innerHTML = watched.map((trophy) => `
    <article class="missable-card">
      <div class="detail-head"><h3>${trophy.name}</h3>${gradeBadge(trophy)}</div>
      <p class="official-desc">“${trophy.description}”</p>
      <p>${trophy.watch}</p>
      <button type="button" class="open-guide" data-open="${trophy.id}">Open its guide</button>
    </article>`).join('');
}

function renderPlanner() {
  const picks = nextUp(state.trophies, state.progress, 5);
  els['next-up-list'].innerHTML = picks.map(({ trophy, reason }) => `
    <li class="next-up-item">
      <button type="button" class="row-main" data-open="${trophy.id}">
        <span class="row-top"><span class="row-name">${displayName(trophy, state.progress)}</span>${gradeBadge(trophy)}</span>
        <span class="row-desc">${reason}</span>
      </button>
    </li>`).join('') || '<li>Everything is earned. Platinum time.</li>';
  const underWay = state.trophies.filter((trophy) => trophy.target && getCount(state.progress, trophy) > 0 && !isEarned(state.progress, trophy.id));
  els['counter-summary'].innerHTML = underWay.length
    ? underWay.map((trophy) => `<p class="counter-line"><strong>${trophy.name}</strong> — ${getCount(state.progress, trophy)} / ${trophy.target} ${trophy.targetLabel}</p>`).join('')
    : '<p class="counter-line">No counters started yet. Open any trophy with a target and add your first progress.</p>';
}

function renderAll() {
  renderHeaderStats();
  renderTrophyList();
  renderDetailPane();
  renderRoadmap();
  renderMissables();
  renderPlanner();
}

function selectTrophy(trophyId, jumpToTracker = false) {
  state.selectedId = trophyId;
  if (jumpToTracker) switchView('tracker');
  renderAll();
}

function switchView(view) {
  state.view = view;
  for (const name of ['tracker', 'roadmap', 'missables', 'planner']) {
    document.getElementById(`view-${name}`).hidden = name !== view;
    document.getElementById(`tab-${name}`).classList.toggle('is-active', name === view);
  }
}

function wireToolbar() {
  els['search'].addEventListener('input', () => {
    state.filters.query = els['search'].value;
    renderTrophyList();
  });
  els['grade-filter'].addEventListener('change', () => {
    state.filters.grade = els['grade-filter'].value;
    renderTrophyList();
  });
  els['status-filter'].addEventListener('change', () => {
    state.filters.status = els['status-filter'].value;
    renderTrophyList();
  });
  els['spoiler-toggle'].addEventListener('change', () => {
    state.progress.spoiler = els['spoiler-toggle'].checked;
    saveProgress(state.progress);
    renderAll();
  });
  els['kind-chips'].addEventListener('click', (event) => {
    const chip = event.target.closest('[data-kind]');
    if (!chip) return;
    state.filters.kind = chip.dataset.kind;
    for (const other of els['kind-chips'].querySelectorAll('.chip')) other.classList.toggle('is-active', other === chip);
    renderTrophyList();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && document.activeElement !== els['search']) {
      event.preventDefault();
      els['search'].focus();
    }
  });
}

function wireSaveBar() {
  els['export-button'].addEventListener('click', () => exportProgress(state.progress));
  els['showcase-button'].addEventListener('click', () => {
    state.progress = showcaseProgress();
    saveProgress(state.progress);
    els['spoiler-toggle'].checked = state.progress.spoiler;
    renderAll();
  });
  els['reset-button'].addEventListener('click', () => {
    state.progress = emptyProgress();
    saveProgress(state.progress);
    els['spoiler-toggle'].checked = false;
    renderAll();
  });
  els['import-input'].addEventListener('change', async () => {
    const file = els['import-input'].files[0];
    if (!file) return;
    try {
      state.progress = parseImportedProgress(await file.text());
      saveProgress(state.progress);
      els['spoiler-toggle'].checked = state.progress.spoiler;
      renderAll();
    } catch {
      els['result-count'].textContent = 'That file could not be read as an atlas progress file.';
    }
  });
}

function wireGlobalClicks() {
  document.addEventListener('click', (event) => {
    const openButton = event.target.closest('[data-open]');
    if (openButton) {
      selectTrophy(Number(openButton.dataset.open), state.view !== 'tracker');
      return;
    }
    const tab = event.target.closest('[data-view]');
    if (tab) switchView(tab.dataset.view);
  });
  els['trophy-list'].addEventListener('change', (event) => {
    const box = event.target.closest('[data-earn]');
    if (!box) return;
    setEarned(state.progress, Number(box.dataset.earn), box.checked);
    renderAll();
  });
}

// URL options make every view reachable in one load — the same links a player would bookmark,
// and the states the maker's screenshots are taken in:
//   ?seed=showcase  load the sample progress    ?focus=17  open that trophy's guide
//   ?view=roadmap   open a section directly     ?spoiler=1 turn spoiler protection on
function applyUrlOptions() {
  const params = new URLSearchParams(location.search);
  if (params.get('seed') === 'showcase') {
    state.progress = showcaseProgress();
    saveProgress(state.progress);
  }
  if (params.get('spoiler') === '1') {
    state.progress.spoiler = true;
    saveProgress(state.progress);
  }
  els['spoiler-toggle'].checked = state.progress.spoiler;
  const focus = Number(params.get('focus'));
  if (Number.isInteger(focus) && state.trophies.some((trophy) => trophy.id === focus)) state.selectedId = focus;
  else state.selectedId = 17;
  const view = params.get('view');
  if (['tracker', 'roadmap', 'missables', 'planner'].includes(view)) switchView(view);
}

async function bootAtlas() {
  grabElements();
  await loadTrophyData();
  wireToolbar();
  wireSaveBar();
  wireGlobalClicks();
  applyUrlOptions();
  renderAll();
}

bootAtlas();
