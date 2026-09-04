const STORAGE_KEY = 'rhodes-island-tactical-progress-v2';

export function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return { cleared: new Set(saved.cleared || []), unlocked: new Set(saved.unlocked || ['amiya', 'exusiai', 'hoshiguma']) };
  } catch {
    return { cleared: new Set(), unlocked: new Set(['amiya', 'exusiai', 'hoshiguma']) };
  }
}

export function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ cleared:[...progress.cleared], unlocked:[...progress.unlocked] }));
}

export function rewardForWin(progress, level) {
  progress.cleared.add(level.id);
  if (level.reward) progress.unlocked.add(level.reward);
  saveProgress(progress);
  return level.reward;
}
