/**
 * GameSwiper - Game-Specific Leaderboard Engine
 * Provides independent, game-specific rankings and scores.
 */

import { UserProfile } from '../types';
import { GameCatalog, CatalogGame } from './gameCatalog';

export interface GameLeaderboardEntry {
  rank: number;
  playerMasked: string;
  playerName: string;
  score: number;
  isCurrentUser?: boolean;
}

export interface GameLeaderboardResult {
  game: CatalogGame;
  entries: GameLeaderboardEntry[];
  userRank: number;
  userScore: number;
  totalParticipants: number;
}

export const maskPhone = (phone?: string): string => {
  const digits = (phone || '0911428890').replace(/\D/g, '');
  if (digits.length >= 9) {
    const start = digits.slice(0, 3);
    const end = digits.slice(-3);
    return `${start}*****${end}`;
  }
  return '091*****890';
};

export interface UserGameStats {
  matchesPlayed: number;
  bestScore: number;
  bestLevel: number;
  totalPlaytimeSeconds: number;
  lastPlayedTimestamp: number;
}

const serverLeaderboardCache: Record<string, GameLeaderboardEntry[]> = {};

export const GameLeaderboardService = {
  getGamesWithLeaderboards(): CatalogGame[] {
    return GameCatalog.getAll().filter((g) => g.leaderboardEnabled);
  },

  getUserStats(gameId: string, profile?: UserProfile): UserGameStats {
    let localSaved: Partial<UserGameStats> = {};
    try {
      const raw = localStorage.getItem(`gameswiper_stats_${gameId}`);
      if (raw) localSaved = JSON.parse(raw);
    } catch {}

    const profileScore = profile?.highScores?.[gameId] || 0;
    const bestScore = Math.max(localSaved.bestScore || 0, profileScore);
    const matchesPlayed = Math.max(localSaved.matchesPlayed || (bestScore > 0 ? 1 : 0), 0);
    const bestLevel = Math.max(localSaved.bestLevel || 1, 1);
    const totalPlaytimeSeconds = localSaved.totalPlaytimeSeconds || (matchesPlayed * 90);
    const lastPlayedTimestamp = localSaved.lastPlayedTimestamp || Date.now();

    return {
      matchesPlayed,
      bestScore,
      bestLevel,
      totalPlaytimeSeconds,
      lastPlayedTimestamp,
    };
  },

  recordScore(gameId: string, score: number, _playerName?: string, level?: number): { isNewBest: boolean; bestScore: number } {
    if (typeof window === 'undefined') return { isNewBest: false, bestScore: score };
    try {
      const currentStats = this.getUserStats(gameId);
      const isNewBest = score > currentStats.bestScore;
      const updatedBest = Math.max(currentStats.bestScore, score);
      const updatedLevel = Math.max(currentStats.bestLevel, level || 1);
      
      const newStats: UserGameStats = {
        matchesPlayed: currentStats.matchesPlayed + 1,
        bestScore: updatedBest,
        bestLevel: updatedLevel,
        totalPlaytimeSeconds: currentStats.totalPlaytimeSeconds + 60,
        lastPlayedTimestamp: Date.now(),
      };
      localStorage.setItem(`gameswiper_stats_${gameId}`, JSON.stringify(newStats));
      localStorage.setItem(`gameswiper_lb_${gameId}`, updatedBest.toString());

      return { isNewBest, bestScore: updatedBest };
    } catch {
      return { isNewBest: false, bestScore: score };
    }
  },

  async fetchServerLeaderboard(gameId: string): Promise<GameLeaderboardEntry[]> {
    try {
      const res = await fetch(`/api/scores/${gameId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.scores && Array.isArray(data.scores)) {
          const entries: GameLeaderboardEntry[] = data.scores.map((s: any, idx: number) => ({
            rank: idx + 1,
            playerMasked: s.masked_msisdn || maskPhone(s.player_msisdn),
            playerName: `Player ${idx + 1}`,
            score: s.high_score,
            isCurrentUser: false,
          }));
          serverLeaderboardCache[gameId] = entries;
          return entries;
        }
      }
    } catch {
      // Ignore background fetch error
    }
    return serverLeaderboardCache[gameId] || [];
  },

  getLeaderboardForGame(gameId: string, profile?: UserProfile): GameLeaderboardResult | null {
    const game = GameCatalog.getById(gameId);
    if (!game || !game.leaderboardEnabled) {
      return null;
    }

    // Trigger async fetch to keep cache warm
    if (!serverLeaderboardCache[gameId]) {
      this.fetchServerLeaderboard(gameId);
    }

    const stats = this.getUserStats(gameId, profile);
    const userScore = stats.bestScore;

    const entries: GameLeaderboardEntry[] = (serverLeaderboardCache[gameId] || []).map((e) => ({
      ...e,
      isCurrentUser: profile?.phoneNumber && e.playerMasked === maskPhone(profile.phoneNumber),
    }));

    // If user has a score and not yet in list, place user appropriately
    const existingIndex = entries.findIndex((e) => e.isCurrentUser);
    if (existingIndex < 0 && userScore > 0) {
      entries.push({
        rank: entries.length + 1,
        playerMasked: maskPhone(profile?.phoneNumber),
        playerName: profile?.displayName || 'You',
        score: userScore,
        isCurrentUser: true,
      });
      entries.sort((a, b) => b.score - a.score);
      entries.forEach((e, i) => {
        e.rank = i + 1;
      });
    }

    const userEntry = entries.find((e) => e.isCurrentUser);
    const userRank = userEntry ? userEntry.rank : (userScore > 0 ? 1 : 1);

    return {
      game,
      entries: entries.slice(0, 10),
      userRank,
      userScore,
      totalParticipants: Math.max(entries.length, userScore > 0 ? 1 : 0),
    };
  },
};
