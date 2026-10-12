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
    const normalizedId = gameId.replace(/_/g, '-');
    try {
      const res = await fetch(`/api/scores/${normalizedId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.scores && Array.isArray(data.scores)) {
          const entries: GameLeaderboardEntry[] = data.scores.map((s: any, idx: number) => {
            const masked = s.masked_msisdn || maskPhone(s.player_msisdn);
            return {
              rank: idx + 1,
              playerMasked: masked,
              playerName: masked,
              score: s.high_score,
              isCurrentUser: false,
            };
          });
          serverLeaderboardCache[normalizedId] = entries;
          serverLeaderboardCache[gameId] = entries;
          return entries;
        }
      }
    } catch {
      // Ignore background fetch error
    }
    return serverLeaderboardCache[normalizedId] || serverLeaderboardCache[gameId] || [];
  },

  getLeaderboardForGame(gameId: string, profile?: UserProfile): GameLeaderboardResult | null {
    const normalizedId = gameId.replace(/_/g, '-');
    const game = GameCatalog.getById(normalizedId) || GameCatalog.getById(gameId);

    // Trigger async fetch to keep cache warm
    if (!serverLeaderboardCache[normalizedId] && !serverLeaderboardCache[gameId]) {
      this.fetchServerLeaderboard(normalizedId);
    }

    const stats = this.getUserStats(normalizedId, profile);
    const userScore = stats.bestScore;

    const cachedList = serverLeaderboardCache[normalizedId] || serverLeaderboardCache[gameId] || [];
    const entries: GameLeaderboardEntry[] = cachedList.map((e) => ({
      ...e,
      isCurrentUser: Boolean(profile?.phoneNumber && e.playerMasked === maskPhone(profile.phoneNumber)),
    }));

    // If user has a score and not yet in list, place user appropriately
    const existingIndex = entries.findIndex((e) => e.isCurrentUser);
    if (existingIndex < 0 && userScore > 0) {
      const userMasked = maskPhone(profile?.phoneNumber);
      entries.push({
        rank: entries.length + 1,
        playerMasked: userMasked,
        playerName: userMasked,
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

    const effectiveGame: CatalogGame = game || {
      gameId: normalizedId,
      gameName: normalizedId,
      titleAmharic: normalizedId,
      category: 'Arcade',
      genre: 'Arcade',
      tagline: '',
      description: '',
      thumbnail: '',
      banner: '',
      accessType: 'FREE',
      isFeatured: false,
      isActive: true,
      isNew: false,
      isFree: true,
      requiresCoins: false,
      coinCost: 0,
      leaderboardEnabled: true,
      sortOrder: 99,
      rating: 4.9,
      playsCount: 1000,
      instructions: [],
      controlsDescription: '',
      primaryColor: '#00BFA6',
      secondaryColor: '#102C40',
    };

    return {
      game: effectiveGame,
      entries: entries.slice(0, 10),
      userRank,
      userScore,
      totalParticipants: entries.length,
    };
  },
};
