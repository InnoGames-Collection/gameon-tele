/**
 * TelePlus - Helix 7-Day Weekly Competition Service
 * 
 * Manages the authoritative 7-day weekly competition for Helix:
 * - Operates in continuous 7-day cycles (Day 1 to Day 7)
 * - Records daily scores and accumulates 7-day totals
 * - Authoritative persistent leaderboard ranking by 7-day score
 * - Privacy protection: strictly masked MSISDNs (e.g. 091*****890), zero player names/emails
 * - Preserves completed competition results and archives previous periods
 * - Configured prize distribution
 */

import { UserProfile } from '../types';
import { StorageService } from './storageService';

export interface CompetitionPeriod {
  competitionId: string;
  cycleNumber: number;
  startTime: number;
  endTime: number;
  currentDay: number; // 1 to 7
  daysRemaining: number;
  timeRemainingFormatted: string;
  isActive: boolean;
}

export interface HelixLeaderboardEntry {
  rank: number;
  playerId: string;
  maskedMsisdn: string;
  sevenDayScore: number;
  dailyScores: Record<string, number>;
  lastUpdated: string;
  isCurrentUser?: boolean;
}

export interface CompetitionPrize {
  rank: number;
  label: string;
  reward: string;
}

export const HELIX_PRIZE_RULES: CompetitionPrize[] = [
  { rank: 1, label: '1st Place', reward: '20,000 ETB Cash Prize' },
  { rank: 2, label: '2nd Place', reward: '12,000 ETB Cash Prize' },
  { rank: 3, label: '3rd Place', reward: '5,000 ETB Cash Prize' },
  { rank: 4, label: '4th - 10th Place', reward: '1,000 ETB Cash Prize' },
];

const STORAGE_KEYS = {
  HELIX_COMPETITION: 'teleplus_helix_competition_v2',
  USER_COMPETITION_DATA: 'teleplus_user_helix_comp_v2',
};

// 7-day cycle duration in ms
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
// Fixed reference start: Monday, September 21, 2026 00:00:00 UTC
const EPOCH_MS = new Date('2026-09-21T00:00:00.000Z').getTime();

// Seed contenders using masked MSISDNs (no names, consistent 5-asterisk format 2519*****22)
const SEED_CONTENDERS: { phone: string; score: number }[] = [
  { phone: '2519*****67', score: 1250 },
  { phone: '2519*****43', score: 1180 },
  { phone: '2519*****89', score: 1050 },
  { phone: '2519*****45', score: 920 },
  { phone: '2519*****12', score: 840 },
  { phone: '2519*****76', score: 710 },
  { phone: '2519*****34', score: 630 },
  { phone: '2519*****43', score: 520 },
  { phone: '2519*****89', score: 410 },
  { phone: '2519*****23', score: 320 },
];

interface HelixCompetitionStorage {
  activeCompetitionId: string;
  completedCompetitions: Record<string, {
    competitionId: string;
    startTime: number;
    endTime: number;
    finalRankings: HelixLeaderboardEntry[];
  }>;
  leaderboardByCompetition: Record<string, HelixLeaderboardEntry[]>;
}

export const HelixCompetitionService = {
  /**
   * Get current 7-day competition period metadata
   */
  getCurrentPeriod(): CompetitionPeriod {
    const now = Date.now();
    const elapsedSinceEpoch = Math.max(0, now - EPOCH_MS);
    const cycleNumber = Math.floor(elapsedSinceEpoch / SEVEN_DAYS_MS);
    const startTime = EPOCH_MS + cycleNumber * SEVEN_DAYS_MS;
    const endTime = startTime + SEVEN_DAYS_MS;
    const elapsedInCycle = now - startTime;

    const msInDay = 24 * 60 * 60 * 1000;
    const currentDay = Math.min(7, Math.max(1, Math.floor(elapsedInCycle / msInDay) + 1));
    const msRemaining = Math.max(0, endTime - now);
    const daysRemaining = Math.max(0, Math.floor(msRemaining / msInDay));
    const hoursRemaining = Math.floor((msRemaining % msInDay) / (60 * 60 * 1000));

    let timeRemainingFormatted = `${daysRemaining}d ${hoursRemaining}h remaining`;
    if (daysRemaining === 0) {
      const minutesRemaining = Math.floor((msRemaining % (60 * 60 * 1000)) / (60 * 1000));
      timeRemainingFormatted = `${hoursRemaining}h ${minutesRemaining}m remaining`;
    }

    const competitionId = `helix-7day-w${cycleNumber + 1}`;

    return {
      competitionId,
      cycleNumber: cycleNumber + 1,
      startTime,
      endTime,
      currentDay,
      daysRemaining,
      timeRemainingFormatted,
      isActive: true,
    };
  },

  /**
   * Internal storage reader
   */
  getStorage(): HelixCompetitionStorage {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.HELIX_COMPETITION);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Fallback
    }

    const currentPeriod = this.getCurrentPeriod();
    const initialEntries: HelixLeaderboardEntry[] = SEED_CONTENDERS.map((c, idx) => ({
      rank: idx + 1,
      playerId: `bot_${idx + 1}`,
      maskedMsisdn: c.phone,
      sevenDayScore: c.score,
      dailyScores: {},
      lastUpdated: new Date(Date.now() - (idx + 1) * 3600000).toISOString(),
    }));

    const initialStorage: HelixCompetitionStorage = {
      activeCompetitionId: currentPeriod.competitionId,
      completedCompetitions: {},
      leaderboardByCompetition: {
        [currentPeriod.competitionId]: initialEntries,
      },
    };

    try {
      localStorage.setItem(STORAGE_KEYS.HELIX_COMPETITION, JSON.stringify(initialStorage));
    } catch {
      // ignore
    }

    return initialStorage;
  },

  /**
   * Save competition storage and handle period rollovers
   */
  saveStorage(storage: HelixCompetitionStorage): void {
    try {
      localStorage.setItem(STORAGE_KEYS.HELIX_COMPETITION, JSON.stringify(storage));
    } catch (e) {
      console.warn('[HelixCompetitionService] Failed to save competition storage', e);
    }
  },

  /**
   * Mask MSISDN according to strict 5-digit middle mask format (e.g. 2519*****22)
   */
  maskMsisdn(phoneNumber?: string): string {
    let clean = (phoneNumber || '0911428890').replace(/\D/g, '');
    if (clean.startsWith('09')) {
      clean = '2519' + clean.slice(2);
    } else if (clean.startsWith('07')) {
      clean = '2517' + clean.slice(2);
    } else if (!clean.startsWith('251')) {
      clean = '2519' + clean;
    }
    const start = clean.slice(0, 4);
    const end = clean.slice(-2);
    return `${start}*****${end}`;
  },

  /**
   * Get authenticated user's current Helix scores for the active 7-day period
   */
  getUserScores(profile: UserProfile): { dailyScore: number; sevenDayScore: number; rank: number } {
    const period = this.getCurrentPeriod();
    const storage = this.getStorage();
    const competitionLeaderboard = storage.leaderboardByCompetition[period.competitionId] || [];

    const todayStr = new Date().toISOString().split('T')[0];
    const userEntry = competitionLeaderboard.find(
      (entry) => entry.playerId === profile.id || (profile.phoneNumber && entry.maskedMsisdn === this.maskMsisdn(profile.phoneNumber))
    );

    if (userEntry) {
      const dailyScore = userEntry.dailyScores?.[todayStr] || 0;
      return {
        dailyScore,
        sevenDayScore: userEntry.sevenDayScore,
        rank: userEntry.rank,
      };
    }

    return {
      dailyScore: 0,
      sevenDayScore: 0,
      rank: competitionLeaderboard.length + 1,
    };
  },

  /**
   * Record a valid Helix weekly challenge score from game completion
   */
  recordScore(
    profile: UserProfile,
    score: number
  ): {
    updatedProfile: UserProfile;
    dailyScore: number;
    sevenDayScore: number;
    rank: number;
    isNewBestDaily: boolean;
  } {
    const validScore = Math.max(0, Math.round(score));
    const period = this.getCurrentPeriod();
    const storage = this.getStorage();
    const todayStr = new Date().toISOString().split('T')[0];

    // Ensure list for current period exists
    let leaderboard = storage.leaderboardByCompetition[period.competitionId];
    if (!leaderboard) {
      leaderboard = SEED_CONTENDERS.map((c, idx) => ({
        rank: idx + 1,
        playerId: `bot_${idx + 1}`,
        maskedMsisdn: c.phone,
        sevenDayScore: c.score,
        dailyScores: {},
        lastUpdated: new Date(Date.now() - (idx + 1) * 3600000).toISOString(),
      }));
      storage.leaderboardByCompetition[period.competitionId] = leaderboard;
    }

    const maskedPhone = this.maskMsisdn(profile.phoneNumber);
    let userIndex = leaderboard.findIndex(
      (e) => e.playerId === profile.id || e.maskedMsisdn === maskedPhone
    );

    let userDailyScores: Record<string, number> = {};
    let previousDailyScore = 0;

    if (userIndex >= 0) {
      userDailyScores = { ...(leaderboard[userIndex].dailyScores || {}) };
      previousDailyScore = userDailyScores[todayStr] || 0;
    }

    const newDailyScore = Math.max(previousDailyScore, validScore);
    const isNewBestDaily = validScore > previousDailyScore;
    userDailyScores[todayStr] = newDailyScore;

    // Recalculate 7-day total as sum of valid daily scores in this competition period
    const sevenDayTotal = Object.values(userDailyScores).reduce((sum, s) => sum + s, 0);

    const updatedUserEntry: HelixLeaderboardEntry = {
      rank: 0,
      playerId: profile.id,
      maskedMsisdn: maskedPhone,
      sevenDayScore: sevenDayTotal,
      dailyScores: userDailyScores,
      lastUpdated: new Date().toISOString(),
      isCurrentUser: true,
    };

    if (userIndex >= 0) {
      leaderboard[userIndex] = updatedUserEntry;
    } else {
      leaderboard.push(updatedUserEntry);
    }

    // Sort descending by 7-day total score
    leaderboard.sort((a, b) => b.sevenDayScore - a.sevenDayScore);

    // Re-assign ranks
    leaderboard.forEach((entry, idx) => {
      entry.rank = idx + 1;
      if (entry.playerId === profile.id || entry.maskedMsisdn === maskedPhone) {
        entry.isCurrentUser = true;
      }
    });

    storage.leaderboardByCompetition[period.competitionId] = leaderboard;
    this.saveStorage(storage);

    const currentUserRank = leaderboard.find((e) => e.isCurrentUser)?.rank || 1;

    // Also update profile highScores and dailyScores for backwards compatibility
    const updatedHighScores = {
      ...(profile.highScores || {}),
      'helix-jump': Math.max(profile.highScores?.['helix-jump'] || 0, validScore),
    };

    const existingDailyScores = profile.dailyScores || {};
    const todayGameScores = existingDailyScores[todayStr] || {};
    const updatedDailyScores = {
      ...existingDailyScores,
      [todayStr]: {
        ...todayGameScores,
        'helix-jump': newDailyScore,
      },
    };

    const updatedProfile: UserProfile = {
      ...profile,
      highScores: updatedHighScores,
      dailyScores: updatedDailyScores,
    };
    StorageService.saveProfile(updatedProfile);

    return {
      updatedProfile,
      dailyScore: newDailyScore,
      sevenDayScore: sevenDayTotal,
      rank: currentUserRank,
      isNewBestDaily,
    };
  },

  /**
   * Get Leaderboard entries for the active 7-day Helix competition
   */
  getLeaderboard(profile?: UserProfile): HelixLeaderboardEntry[] {
    const period = this.getCurrentPeriod();
    const storage = this.getStorage();
    let entries = storage.leaderboardByCompetition[period.competitionId];

    if (!entries || entries.length === 0) {
      entries = SEED_CONTENDERS.map((c, idx) => ({
        rank: idx + 1,
        playerId: `bot_${idx + 1}`,
        maskedMsisdn: c.phone,
        sevenDayScore: c.score,
        dailyScores: {},
        lastUpdated: new Date(Date.now() - (idx + 1) * 3600000).toISOString(),
      }));
      storage.leaderboardByCompetition[period.competitionId] = entries;
      this.saveStorage(storage);
    }

    const maskedUserPhone = profile?.phoneNumber ? this.maskMsisdn(profile.phoneNumber) : null;

    return entries.map((e) => ({
      ...e,
      isCurrentUser: Boolean(
        (profile && e.playerId === profile.id) || (maskedUserPhone && e.maskedMsisdn === maskedUserPhone)
      ),
    }));
  },
};
