// store.js — saved progress for the Leonida Platinum Atlas.
// One localStorage record holds everything the tracker remembers: which trophies are earned,
// the running count for every trophy PlayStation tracks a target for, the player's own notes,
// and the spoiler-protection setting. Export turns that record into a JSON file; import reads
// one back. Nothing here touches the network.

export const STORAGE_KEY = 'leonida-platinum-atlas-v1';

export function emptyProgress() {
  return { earned: {}, counts: {}, notes: {}, spoiler: false };
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw);
    return {
      earned: parsed.earned ?? {},
      counts: parsed.counts ?? {},
      notes: parsed.notes ?? {},
      spoiler: Boolean(parsed.spoiler),
    };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage can be unavailable (private mode, quota); the tracker keeps working in memory.
  }
}

export function isEarned(progress, trophyId) {
  return Boolean(progress.earned[trophyId]);
}

export function setEarned(progress, trophyId, earned) {
  if (earned) progress.earned[trophyId] = true;
  else delete progress.earned[trophyId];
  saveProgress(progress);
}

export function getCount(progress, trophy) {
  return Number(progress.counts[trophy.id] ?? 0);
}

export function setCount(progress, trophy, value) {
  const clean = Math.max(0, Math.floor(Number(value) || 0));
  progress.counts[trophy.id] = trophy.target ? Math.min(clean, trophy.target) : clean;
  if (trophy.target && progress.counts[trophy.id] >= trophy.target) progress.earned[trophy.id] = true;
  saveProgress(progress);
}

export function getNote(progress, trophyId) {
  return progress.notes[trophyId] ?? '';
}

export function setNote(progress, trophyId, text) {
  progress.notes[trophyId] = text;
  saveProgress(progress);
}

// A fixed, honest sample: 13 of 55 earned with several counters part-way, so a first-time
// visitor (and the maker's screenshots) can see the tracker doing its job. It is the player's
// own button to press; it never applies itself silently.
export function showcaseProgress() {
  return {
    earned: {
      2: true, 3: true, 4: true, 5: true, 8: true, 9: true, 10: true,
      16: true, 20: true, 21: true, 35: false, 44: true, 46: true, 11: true,
    },
    counts: { 15: 96, 17: 28, 25: 3, 28: 7, 31: 37, 42: 19, 48: 132, 52: 82000, 53: 34000, 35: 61 },
    notes: { 17: 'Two ranges left at silver — revisit with accuracy first, speed second.' },
    spoiler: false,
  };
}

export function earnedCount(progress, trophies) {
  return trophies.filter((trophy) => isEarned(progress, trophy.id)).length;
}

export function exportProgress(progress) {
  const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'leonida-platinum-atlas-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

export function parseImportedProgress(text) {
  const parsed = JSON.parse(text);
  if (typeof parsed !== 'object' || parsed === null) throw new Error('not a progress file');
  return {
    earned: parsed.earned ?? {},
    counts: parsed.counts ?? {},
    notes: parsed.notes ?? {},
    spoiler: Boolean(parsed.spoiler),
  };
}
