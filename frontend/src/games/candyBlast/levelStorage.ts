/**
 * Candy Blast - Level Progression Storage Manager
 * Tracks unlocked levels (1 to 40), star ratings (1-3 stars), and best scores per level.
 */

import { PlayerProgress, LevelRecord } from './types';

const STORAGE_KEY = 'teleplay_candy_blast_campaign_v2';

const DEFAULT_PROGRESS: PlayerProgress = {
  unlockedLevel: 1,
  records: {},
};

export function loadPlayerProgress(): PlayerProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as PlayerProgress;
    if (!parsed || typeof parsed.unlockedLevel !== 'number') {
      return DEFAULT_PROGRESS;
    }
    return {
      unlockedLevel: Math.max(1, Math.min(40, parsed.unlockedLevel)),
      records: parsed.records || {},
    };
  } catch (err) {
    console.warn('[CandyBlast] Failed to load level progression:', err);
    return DEFAULT_PROGRESS;
  }
}

export function savePlayerProgress(progress: PlayerProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.warn('[CandyBlast] Failed to save level progression:', err);
  }
}

export function recordLevelCompletion(
  levelNum: number,
  score: number,
  stars: number
): { progress: PlayerProgress; isNewUnlock: boolean; isNewBest: boolean } {
  const current = loadPlayerProgress();
  const prevRecord = current.records[levelNum];
  
  const isNewBest = !prevRecord || score > prevRecord.highScore;
  const bestStars = Math.max(stars, prevRecord?.stars || 0);
  const bestScore = Math.max(score, prevRecord?.highScore || 0);

  const updatedRecord: LevelRecord = {
    stars: bestStars,
    highScore: bestScore,
    completed: true,
  };

  const nextLevel = Math.min(40, Math.max(current.unlockedLevel, levelNum + 1));
  const isNewUnlock = nextLevel > current.unlockedLevel;

  const newProgress: PlayerProgress = {
    unlockedLevel: nextLevel,
    records: {
      ...current.records,
      [levelNum]: updatedRecord,
    },
  };

  savePlayerProgress(newProgress);
  return { progress: newProgress, isNewUnlock, isNewBest };
}

export function getTotalStarsEarned(progress: PlayerProgress): number {
  return Object.values(progress.records).reduce((sum, r) => sum + (r.stars || 0), 0);
}

export function getTotalCampaignScore(progress: PlayerProgress): number {
  return Object.values(progress.records).reduce((sum, r) => sum + (r.highScore || 0), 0);
}

export function getCompletedLevelsCount(progress: PlayerProgress): number {
  return Object.values(progress.records).filter((r) => r.completed).length;
}

export function resetPlayerProgress(): PlayerProgress {
  const reset: PlayerProgress = {
    unlockedLevel: 1,
    records: {},
  };
  savePlayerProgress(reset);
  return reset;
}

/**
 * Mask MSISDN according to specifications:
 * First 5 digits + '*****' + Last 2 digits
 * e.g. 251911598830 -> 25191*****30
 */
export function formatMsisdnMasked(rawPhone?: string): string {
  if (!rawPhone) return '091*****890';
  if (rawPhone.includes('*')) return rawPhone;
  let clean = rawPhone.replace(/\D/g, '');
  if (clean.startsWith('09') && clean.length === 10) {
    clean = '251' + clean.slice(1);
  } else if (!clean.startsWith('251') && clean.length >= 9) {
    clean = '251' + clean.slice(-9);
  } else if (!clean) {
    clean = '251911428890';
  }

  if (clean.length >= 7) {
    const first5 = clean.slice(0, 5);
    const last2 = clean.slice(-2);
    return `${first5}*****${last2}`;
  }
  return '091*****890';
}

export interface CandyLeaderboardEntry {
  rank: number;
  msisdnMasked: string;
  score: number;
  level: number;
  stars: number;
  isPlayer: boolean;
}

export function getCandyLeaderboard(
  playerMsisdn: string,
  playerScore: number,
  playerLevel: number,
  playerStars: number,
  serverEntries: { playerMasked: string; score: number }[] = []
): { list: CandyLeaderboardEntry[]; userRank: number; userEntry: CandyLeaderboardEntry } {
  const playerMasked = formatMsisdnMasked(playerMsisdn);
  const playerEntry: CandyLeaderboardEntry = {
    rank: 0,
    msisdnMasked: playerMasked,
    score: playerScore,
    level: playerLevel,
    stars: playerStars,
    isPlayer: true,
  };

  const allEntries: CandyLeaderboardEntry[] = serverEntries
    .filter((e) => e.playerMasked !== playerMasked)
    .map((p, idx) => ({
      rank: 0,
      msisdnMasked: p.playerMasked,
      score: p.score,
      level: Math.max(1, 40 - idx * 2),
      stars: Math.max(1, 120 - idx * 6),
      isPlayer: false,
    }));

  if (playerScore > 0 || allEntries.length === 0) {
    allEntries.push(playerEntry);
  }

  // Sort descending by score, tiebreak by level
  allEntries.sort((a, b) => b.score - a.score || b.level - a.level);

  let userRank = 1;
  allEntries.forEach((entry, idx) => {
    entry.rank = idx + 1;
    if (entry.isPlayer) {
      userRank = entry.rank;
    }
  });

  return {
    list: allEntries,
    userRank,
    userEntry: playerEntry,
  };
}
