// Filtering, spoiler masking and the Next Up ranking — pure functions of
// (trophies, state, filter values), so the planner and the list never disagree.

export const UNSETTLED = new Set([
  'Challenging Tank',
  'Personal Best',
  'Bad Luck, I Guess',
  'The Truth Is Out There',
]);

export function isStory(t) { return t.kinds.includes('story'); }
export function isEarned(state, t) { return !!state.earned[t.id]; }

// Spoiler shield: an unearned story trophy is masked until it is earned.
export function displayName(state, t, spoiler) {
  if (spoiler && isStory(t) && !isEarned(state, t)) return 'Hidden story trophy';
  return t.name;
}
export function displayDesc(state, t, spoiler) {
  if (spoiler && isStory(t) && !isEarned(state, t)) return 'Hidden — spoiler shield is on.';
  return t.description;
}

export function matches(state, t, f) {
  if (f.grade && t.grade !== f.grade) return false;
  if (f.kind) {
    if (f.kind === 'missable') { if (!t.watch) return false; }
    else if (!t.kinds.includes(f.kind)) return false;
  }
  if (f.status === 'earned' && !isEarned(state, t)) return false;
  if (f.status === 'remaining' && isEarned(state, t)) return false;
  if (f.status === 'watch' && !t.watch) return false;
  if (f.status === 'counting' && !(t.target && (state.counts[t.id] || 0) > 0 && !isEarned(state, t))) return false;
  if (f.q) {
    const hay = (t.name + ' ' + t.description + ' ' + t.kind).toLowerCase();
    if (!hay.includes(f.q.toLowerCase())) return false;
  }
  return true;
}

// Next Up planner: watch first, then earliest phase, then a counter that is
// already moving. Platinum itself is suggested only when it is all that is left.
export function nextUp(trophies, state, n = 5) {
  const scored = [];
  for (const t of trophies) {
    if (isEarned(state, t)) continue;
    if (t.grade === 'platinum') continue;
    let score = 0; const why = [];
    if (t.watch) { score += 100; why.push('on the missables watch — safe order first'); }
    score += (7 - t.stage) * 10; why.push('roadmap phase ' + t.stage);
    const c = state.counts[t.id] || 0;
    if (t.target && c > 0) { score += Math.round(30 * (c / t.target)); why.push('counter already at ' + c + '/' + t.target); }
    scored.push({ t, score, why: why.join(' · ') });
  }
  scored.sort((a, b) => b.score - a.score || a.t.id - b.t.id);
  const picks = scored.slice(0, n);
  if (picks.length < n) {
    const plat = trophies.find((t) => t.grade === 'platinum' && !isEarned(state, t));
    if (plat) picks.push({ t: plat, score: 0, why: 'unlocks when the other 54 are earned' });
  }
  return picks.slice(0, n);
}
