// filters.js — kind, grade, status and search filtering, plus the spoiler rule.
// Kinds come straight from each trophy's data: story, missable (the watch list), collectibles,
// activities, platinum. The official list contains no online trophies — no description mentions
// online or multiplayer play — so the Online filter honestly reports that instead of inventing
// entries; the partner trophies are played with the in-game partner, not online.

export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable watch',
  collectibles: 'Collectibles',
  activities: 'Activities',
  platinum: 'Platinum',
  online: 'Online',
};

export function trophyMatchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'online') return trophy.kinds.includes('online');
  return trophy.kinds.includes(kind);
}

export function isSpoilerHidden(trophy, progress) {
  // Spoiler protection hides the name and description of story trophies until they are earned.
  return Boolean(progress.spoiler) && trophy.kinds.includes('story') && !progress.earned[trophy.id];
}

export function displayName(trophy, progress) {
  return isSpoilerHidden(trophy, progress) ? 'Hidden story trophy' : trophy.name;
}

export function displayDescription(trophy, progress) {
  return isSpoilerHidden(trophy, progress)
    ? 'Spoiler protection is on: this story trophy reveals itself once you earn it.'
    : trophy.description;
}

export function filterTrophies(trophies, progress, filters) {
  const query = filters.query.trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (!trophyMatchesKind(trophy, filters.kind)) return false;
    if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
    if (filters.status === 'earned' && !progress.earned[trophy.id]) return false;
    if (filters.status === 'remaining' && progress.earned[trophy.id]) return false;
    if (query) {
      const hidden = isSpoilerHidden(trophy, progress);
      const haystack = hidden
        ? 'hidden story trophy'
        : `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export function countByKind(trophies, kind) {
  return trophies.filter((trophy) => trophyMatchesKind(trophy, kind)).length;
}
