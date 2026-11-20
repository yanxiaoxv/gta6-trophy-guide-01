// roadmap.js — the platinum roadmap and the Next Up planner.
// The six stages are built from the official descriptions only: the chapters and named missions
// they mention, the stranger strands and their named characters, and every tracked count
// (250 stunts, 42 range challenges, 52 areas, 100 locations, $250,000 laundered and the rest).
// Stage order is the advice: story first with saves at chapter breaks, stranger strands closed
// before the finale, one combined exploration pass, activities and counters next, the money
// and mayhem loop after that, and the 100% cleanup last.

export const ROADMAP_STAGES = [
  {
    stage: 1,
    title: 'Stage 1 — Story first pass',
    goal: 'Chapters 1–4, the named missions, and the finale — with a manual save at every chapter break.',
    detail:
      'Play Gone Fishing through Operation Savage Glory in order. Keep chapter-break saves: choices (500 tracked for Actions Speak Louder) and the VCIA departure (Catch Me If You Can, during VCIA Takedown) are the two story-shaped moments that cannot be casually revisited. Start every long counter in passing — stunts, vehicles, areas — while missions are still moving you around the map.',
  },
  {
    stage: 2,
    title: 'Stage 2 — People of Leonida',
    goal: 'Close every stranger strand before the finale: Andy, Kenton, Billy, Randy, Tyrone, and Bret’s hunt.',
    detail:
      'Five trophies are literally “complete the final mission for” a named character, and Strangers & Freaks wants 8 strands in total. Finish whole strands rather than sampling them, and do this stage before the final mission — the official descriptions promise nothing about strands surviving the ending, so this atlas does not gamble on it.',
  },
  {
    stage: 3,
    title: 'Stage 3 — See all of Leonida',
    goal: 'One combined exploration pass: 52 areas, 18 meditation spots, 100 WAiNK locations, 3 card sets, 100 vehicles, 10 Scooter Bros registrations, 8 garages.',
    detail:
      'Every exploration counter follows the same map-wide logic, so tour district by district once and let them grow together. Ocean Beach’s cocktail (In The Beginning…) is a natural first stop. The Truth Is Out There rides along here: strange events are found by coverage, not by a named location no source gives.',
  },
  {
    stage: 4,
    title: 'Stage 4 — Activities & long counters',
    goal: '42 Shooting Range golds, 250 stunts, 14 drone-race locations, 20 different races, 50 challenges, 9 activity types sampled.',
    detail:
      'The grind stage, made bearable by stage 1’s head start. Work the range range-by-range and count golds only. Sample each activity type once for Master of None if any type is still untried, and let challenge completions accumulate across everything else in this stage.',
  },
  {
    stage: 5,
    title: 'Stage 5 — Money, wheels & mayhem',
    goal: '5 bank vaults, an armored truck, 9 gang operations, a stealth jewelry robbery, $250,000 laundered, $100,000 spent, and the partner feats.',
    detail:
      'The robbery loop funds the economy trophies: rob, escape, launder the marked bills, spend the clean money. Stage the partner feats deliberately — lose a 4-star level together for Hot Together, then keep the heat across 3 shops for Retail Therapy. Gunslinger’s 5-in-one Combat Focus and the Ten Pin melee drive-by are repeatable feats: save, attempt, retry.',
  },
  {
    stage: 6,
    title: 'Stage 6 — The 100% cleanup & the platinum',
    goal: 'Attain 100% completion (A Long Road, gold), then let Vice Got a Price! close the list.',
    detail:
      'Use the Remaining filter and the in-game completion counter together to find the last percent. When the other 54 are earned, the platinum unlocks on its own — if it has not, exactly one trophy is still grey, and the tracker will show you which.',
  },
];

export function stageOf(trophy) {
  return ROADMAP_STAGES.find((entry) => entry.stage === trophy.stage) ?? ROADMAP_STAGES[0];
}

export function stageProgress(trophies, progress, stage) {
  const inStage = trophies.filter((trophy) => trophy.stage === stage);
  const done = inStage.filter((trophy) => progress.earned[trophy.id]).length;
  return { done, total: inStage.length };
}

// Next Up ranking, in plain priority order: unearned watch items first (they are the only ones
// time can take away), then trophies from the earliest unfinished stage, with counters already
// under way ahead of untouched ones inside the same stage.
export function nextUp(trophies, progress, limit = 5) {
  const remaining = trophies.filter((trophy) => !progress.earned[trophy.id] && trophy.grade !== 'platinum');
  const scored = remaining.map((trophy) => {
    let score = 100 - trophy.stage * 10;
    if (trophy.missable) score += 100;
    const count = Number(progress.counts[trophy.id] ?? 0);
    if (trophy.target && count > 0) score += 15 + Math.round((count / trophy.target) * 10);
    if (trophy.grade === 'gold') score += 5;
    if (trophy.grade === 'silver') score += 3;
    return { trophy, score };
  });
  scored.sort((a, b) => b.score - a.score || a.trophy.id - b.trophy.id);
  return scored.slice(0, limit).map(({ trophy }) => ({
    trophy,
    reason: nextUpReason(trophy, progress),
  }));
}

export function nextUpReason(trophy, progress) {
  if (trophy.missable) return 'Watch item — do it before the story moves past it.';
  const count = Number(progress.counts[trophy.id] ?? 0);
  if (trophy.target && count > 0) return `Counter under way: ${count} of ${trophy.target} ${trophy.targetLabel}.`;
  if (trophy.target) return `Starts a long counter: 0 of ${trophy.target} ${trophy.targetLabel}.`;
  return `${stageOf(trophy).title.split('—')[1]?.trim() ?? 'Roadmap'} — next in roadmap order.`;
}
