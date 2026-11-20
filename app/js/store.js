// Offline progress store: everything lives in localStorage under one key.
// Shape: { earned: {id:true}, counts: {id:number}, notes: {id:string}, spoiler: bool }
export const STORE_KEY = 'leonida-atlas-v1';

// Showcase seed: a believable mid-run save, 13 of 55 earned, so the atlas
// opens the way a real platinum run looks halfway through phase 1-2.
export const SEED_EARNED = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 22, 25];
export const SEED_COUNTS = { 15: 120, 31: 40, 42: 21, 48: 137 };

export function emptyState() {
  return { earned: {}, counts: {}, notes: {}, spoiler: false };
}

export function seedState() {
  const s = emptyState();
  for (const id of SEED_EARNED) s.earned[id] = true;
  Object.assign(s.counts, SEED_COUNTS);
  return s;
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      const s = seedState();
      saveState(s);
      return s;
    }
    const parsed = JSON.parse(raw);
    return { ...emptyState(), ...parsed, earned: parsed.earned || {}, counts: parsed.counts || {}, notes: parsed.notes || {} };
  } catch {
    return seedState();
  }
}

export function saveState(state) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* storage full/blocked: keep running in-memory */ }
}

export function exportJson(state) {
  return JSON.stringify({ app: 'leonida-platinum-atlas', version: 1, exportedAt: new Date().toISOString(), ...state }, null, 2);
}

export function parseImport(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object' || typeof parsed.earned !== 'object') throw new Error('not an atlas progress file');
  return { earned: parsed.earned || {}, counts: parsed.counts || {}, notes: parsed.notes || {}, spoiler: !!parsed.spoiler };
}
