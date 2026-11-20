// The six roadmap phases, keyed to the `stage` field of the official list.
export const PHASES = [
  { stage: 1, name: 'Phase 1 — Story spine', desc: 'Play the chapters in order and let the story trophies fall out. Start stranger strands as they open, keep chapter-break saves, and learn the partner switch — later trophies build on it.' },
  { stage: 2, name: 'Phase 2 — Strangers before the finale', desc: 'Close every named-character strand before the story finale. This is the safe order the watch list exists for: five strand finals and Bret\u2019s hunt all sit here.' },
  { stage: 3, name: 'Phase 3 — Explore Leonida', desc: 'The exploration pass: all areas, meditation spots, WAiNK locations, vehicles and properties. Strange events are passengers of this pass, not destinations.' },
  { stage: 4, name: 'Phase 4 — Skills, races & challenges', desc: 'Stunts, range golds, drone races, races won and the challenge board. Repeatable content — failures here can be progress, not just retries.' },
  { stage: 5, name: 'Phase 5 — Heists, money & long counters', desc: 'Robberies, laundering, spending and the big tracked counters. Batch them with free-roam routes so the 100k / 250k counters finish together.' },
  { stage: 6, name: 'Phase 6 — The platinum lap', desc: '100% completion and the platinum itself. If Vice Got a Price! is the only grey left, one of the other 54 is still unearned — filter by Remaining to find it.' },
];

export function phaseProgress(trophies, state, stage) {
  const inPhase = trophies.filter((t) => t.stage === stage);
  const done = inPhase.filter((t) => state.earned[t.id]).length;
  return { total: inPhase.length, done, pct: inPhase.length ? Math.round((done / inPhase.length) * 100) : 0, trophies: inPhase };
}

// Safe order for the watch list: earliest phase first, then official order.
export function watchOrder(trophies) {
  return trophies.filter((t) => t.watch).sort((a, b) => a.stage - b.stage || a.id - b.id);
}
