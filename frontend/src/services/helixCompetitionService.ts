/**
 * TelePlus - Helix 7-Day Weekly Competition Service
 * 
 * Manages the authoritative 7-day weekly competition for Helix:
 * - Operates in continuous 7-day cycles (Day 1 to Day 7)
 * - 100% Server Authoritative with GCP PostgreSQL 16 & Valkey 8 persistence
 * - Single-use cryptographic run sessions & physics telemetry verification
 * - Real-time leaderboard synchronization
 * - Privacy protection: strictly masked MSISDNs (e.g. 091*****890)
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

export interface TelemetryPoint {
  floor: number;
  action: 'bounce' | 'drop_through' | 'danger_smash';
  combo?: number;
  t: number;
  sector?: number;
  angle?: number;
}

export const HELIX_PRIZE_RULES: CompetitionPrize[] = [
  { rank: 1, label: '1st Place', reward: '20,000 ETB Cash Prize' },
  { rank: 2, label: '2nd Place', reward: '10,000 ETB Cash Prize' },
  { rank: 3, label: '3rd Place', reward: '5,000 ETB Cash Prize' },
  { rank: 4, label: '4th - 8th Place', reward: '1,000 ETB Cash Prize' },
];

const STORAGE_KEYS = {
  HELIX_COMPETITION: 'teleplus_helix_competition_v2',
  USER_COMPETITION_DATA: 'teleplus_user_helix_comp_v2',
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const EPOCH_MS = new Date('2026-09-21T00:00:00.000Z').getTime();

const API_BASE_URL = typeof window !== 'undefined' && (window as any).__API_BASE__
  ? (window as any).__API_BASE__
  : '';

export const HelixCompetitionService = {
  /**
   * Helper to normalize Ethiopian phone numbers
   */
  normalizeMsisdn(phoneNumber?: string): string {
    const clean = (phoneNumber || '0911428890').replace(/\D/g, '');
    if (clean.startsWith('251')) return clean;
    if (clean.startsWith('09')) return '251' + clean.slice(1);
    if (clean.startsWith('9')) return '251' + clean;
    if (clean.startsWith('07')) return '251' + clean.slice(1);
    if (clean.startsWith('7')) return '251' + clean;
    return '251' + clean;
  },

  /**
   * Strict middle masking format (e.g. 091*****890)
   */
  maskMsisdn(phoneNumber?: string): string {
    const norm = this.normalizeMsisdn(phoneNumber);
    if (norm.length >= 9) {
      const prefix = norm.startsWith('251') ? '0' + norm.substring(3, 5) : norm.substring(0, 3);
      const suffix = norm.slice(-3);
      return `${prefix}*****${suffix}`;
    }
    return '091*****890';
  },

  /**
   * Starts a server-authoritative tournament run session.
   * Obtains a single-use cryptographically bound run token and deterministic tower seed.
   */
  async startRunSession(phoneNumber: string): Promise<{
    runToken: string;
    towerSeed: string;
    competitionId: string;
    startedAt: number;
  }> {
    const msisdn = this.normalizeMsisdn(phoneNumber);
    try {
      const res = await fetch(`${API_BASE_URL}/api/helix/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ msisdn }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to start session (${res.status})`);
      }

      const data = await res.json();
      return data.session;
    } catch (e: any) {
      console.warn('[HelixCompetitionService] API session start failed, falling back to local session:', e.message);
      // Fallback local session for offline play
      return {
        runToken: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        towerSeed: `seed_${Date.now()}`,
        competitionId: this.getCurrentPeriod().competitionId,
        startedAt: Date.now(),
      };
    }
  },

  /**
   * Submits finished run telemetry to server for authoritative anti-cheat verification.
   */
  async submitAuthoritativeRun(params: {
    phoneNumber: string;
    runToken: string;
    floorsCleared: number;
    finalScore: number;
    durationSeconds: number;
    telemetry: TelemetryPoint[];
  }): Promise<{ verified: boolean; score: number; rank?: number; cycleDay?: number; fraudReason?: string }> {
    const msisdn = this.normalizeMsisdn(params.phoneNumber);
    try {
      const res = await fetch(`${API_BASE_URL}/api/helix/run/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          msisdn,
          runToken: params.runToken,
          floorsCleared: params.floorsCleared,
          finalScore: params.finalScore,
          durationSeconds: params.durationSeconds,
          telemetry: params.telemetry,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (err: any) {
      console.warn('[HelixCompetitionService] Telemetry submission failed:', err.message);
      return {
        verified: false,
        score: params.finalScore,
        fraudReason: err.message,
      };
    }
  },

  /**
   * Fetches the authoritative 7-day leaderboard from backend (Valkey 8 sorted set).
   */
  async fetchRemoteLeaderboard(profile?: UserProfile): Promise<HelixLeaderboardEntry[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/helix/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        if (data.leaderboard && Array.isArray(data.leaderboard)) {
          const maskedUserPhone = profile?.phoneNumber ? this.maskMsisdn(profile.phoneNumber) : null;
          return data.leaderboard.map((item: any, idx: number) => ({
            rank: item.rank || idx + 1,
            playerId: `player_${idx + 1}`,
            maskedMsisdn: item.maskedMsisdn || item.masked_msisdn,
            sevenDayScore: item.score || item.seven_day_score || 0,
            dailyScores: {},
            lastUpdated: new Date().toISOString(),
            isCurrentUser: Boolean(
              maskedUserPhone && (item.maskedMsisdn === maskedUserPhone || item.masked_msisdn === maskedUserPhone)
            ),
          }));
        }
      }
    } catch (e) {
      console.warn('[HelixCompetitionService] Failed to load remote leaderboard, reading local:', e);
    }

    return this.getLeaderboard(profile);
  },

  /**
   * Fetches active cycle metadata, dynamic prize pool and top contenders from PostgreSQL.
   */
  async fetchCurrentCompetition(profile?: UserProfile): Promise<{
    cycle: any;
    prizeConfig: { total_pool_etb: number; prize_map: Record<string, number> };
    leaderboard: HelixLeaderboardEntry[];
  } | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/competition/current`);
      if (res.ok) {
        const data = await res.json();
        const maskedUserPhone = profile?.phoneNumber ? this.maskMsisdn(profile.phoneNumber) : null;
        const mappedLb: HelixLeaderboardEntry[] = (data.leaderboard || []).map((item: any, idx: number) => ({
          rank: item.rank || idx + 1,
          playerId: `player_${idx + 1}`,
          maskedMsisdn: item.masked_msisdn || item.maskedMsisdn,
          sevenDayScore: item.seven_day_score || item.score || 0,
          dailyScores: {},
          lastUpdated: new Date().toISOString(),
          isCurrentUser: Boolean(
            maskedUserPhone && (item.masked_msisdn === maskedUserPhone || item.maskedMsisdn === maskedUserPhone)
          ),
        }));
        return {
          cycle: data.cycle,
          prizeConfig: data.prizeConfig || {
            total_pool_etb: 40000,
            prize_map: { '1': 20000, '2': 10000, '3': 5000, '4': 1000, '5': 1000, '6': 1000, '7': 1000, '8': 1000 },
          },
          leaderboard: mappedLb,
        };
      }
    } catch (e) {
      console.warn('[HelixCompetitionService] Failed to load remote competition:', e);
    }
    return null;
  },

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

    const competitionId = `helix_cycle_w${cycleNumber + 1}`;

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
   * Local storage fallback
   */
  getStorage(): any {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.HELIX_COMPETITION);
      if (raw) return JSON.parse(raw);
    } catch {}

    const period = this.getCurrentPeriod();
    return {
      activeCompetitionId: period.competitionId,
      completedCompetitions: {},
      leaderboardByCompetition: { [period.competitionId]: [] },
    };
  },

  saveStorage(storage: any): void {
    try {
      localStorage.setItem(STORAGE_KEYS.HELIX_COMPETITION, JSON.stringify(storage));
    } catch (e) {
      console.warn('[HelixCompetitionService] Failed to save storage:', e);
    }
  },

  /**
   * Get user scores from active period
   */
  getUserScores(profile: UserProfile): { dailyScore: number; sevenDayScore: number; rank: number } {
    const period = this.getCurrentPeriod();
    const storage = this.getStorage();
    const competitionLeaderboard: HelixLeaderboardEntry[] = storage.leaderboardByCompetition[period.competitionId] || [];

    const todayStr = new Date().toISOString().split('T')[0];
    const maskedPhone = this.maskMsisdn(profile.phoneNumber);
    const userEntry = competitionLeaderboard.find(
      (entry) => entry.playerId === profile.id || (profile.phoneNumber && entry.maskedMsisdn === maskedPhone)
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
   * Local recording with automatic background sync
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

    let leaderboard: HelixLeaderboardEntry[] = storage.leaderboardByCompetition[period.competitionId] || [];
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

    leaderboard.sort((a, b) => b.sevenDayScore - a.sevenDayScore);
    leaderboard.forEach((entry, idx) => {
      entry.rank = idx + 1;
      if (entry.playerId === profile.id || entry.maskedMsisdn === maskedPhone) {
        entry.isCurrentUser = true;
      }
    });

    storage.leaderboardByCompetition[period.competitionId] = leaderboard;
    this.saveStorage(storage);

    const currentUserRank = leaderboard.find((e) => e.isCurrentUser)?.rank || 1;

    const updatedProfile: UserProfile = {
      ...profile,
      highScores: {
        ...(profile.highScores || {}),
        'helix-jump': Math.max(profile.highScores?.['helix-jump'] || 0, validScore),
      },
      dailyScores: {
        ...(profile.dailyScores || {}),
        [todayStr]: {
          ...(profile.dailyScores?.[todayStr] || {}),
          'helix-jump': newDailyScore,
        },
      },
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
   * Get cached leaderboard entries
   */
  getLeaderboard(profile?: UserProfile): HelixLeaderboardEntry[] {
    const period = this.getCurrentPeriod();
    const storage = this.getStorage();
    const entries: HelixLeaderboardEntry[] = storage.leaderboardByCompetition[period.competitionId] || [];
    const maskedUserPhone = profile?.phoneNumber ? this.maskMsisdn(profile.phoneNumber) : null;

    return entries.map((e) => ({
      ...e,
      isCurrentUser: Boolean(
        (profile && e.playerId === profile.id) || (maskedUserPhone && e.maskedMsisdn === maskedUserPhone)
      ),
    }));
  },
};
