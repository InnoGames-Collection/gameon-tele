/**
 * EMOJI IQ — Persistent Tournament Leaderboard & Player Stats Service
 * Completely independent from Emoji Fun.
 */

import { TournamentLeaderboardEntry, EmojiIqPlayerStats } from './types';

import { GameLeaderboardService } from '../../services/gameLeaderboardService';

const STORAGE_KEY_STATS = 'emoji_iq_player_stats_v1';
const STORAGE_KEY_LEADERBOARD = 'emoji_iq_tournament_leaderboard_v1';

export const DEFAULT_PLAYER_STATS: EmojiIqPlayerStats = {
  totalTournamentScore: 0,
  currentLevel: 1,
  unlockedLevel: 1,
  totalQuestionsAnswered: 0,
  totalCorrect: 0,
  perfectCount: 0,
  bestCombo: 0,
  hintsUsed: 0,
  coins: 50,
  availableHints: 3,
  lives: 3,
  starsByLevel: {},
  highScoreByLevel: {},
};

export class EmojiIqLeaderboardService {
  public static loadPlayerStats(): EmojiIqPlayerStats {
    try {
      const data = localStorage.getItem(STORAGE_KEY_STATS);
      if (data) {
        return { ...DEFAULT_PLAYER_STATS, ...JSON.parse(data) };
      }
    } catch {
      // Fallback
    }
    return { ...DEFAULT_PLAYER_STATS };
  }

  public static savePlayerStats(stats: EmojiIqPlayerStats) {
    try {
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
    } catch {
      // Fallback
    }
  }

  public static getLeaderboard(playerName: string = 'You', playerStats?: EmojiIqPlayerStats): {
    entries: TournamentLeaderboardEntry[];
    userRank: number;
    userScore: number;
    nextPlayerScore: number | null;
    pointsToNextRank: number;
  } {
    const stats = playerStats || this.loadPlayerStats();
    const userScore = stats.totalTournamentScore;
    const userLevel = stats.unlockedLevel;
    const userBestCombo = stats.bestCombo;
    const userAccuracy =
      stats.totalQuestionsAnswered > 0
        ? Math.round((stats.totalCorrect / stats.totalQuestionsAnswered) * 100)
        : 100;

    const serverResult = GameLeaderboardService.getLeaderboardForGame('emoji-iq');
    const competitors: Omit<TournamentLeaderboardEntry, 'rank'>[] = (serverResult?.entries || []).map((e, idx) => ({
      id: `iq_p${idx + 1}`,
      name: e.playerMasked,
      avatarEmoji: idx === 0 ? '🧠' : idx === 1 ? '👑' : idx === 2 ? '⚡' : '🎮',
      score: e.score,
      level: Math.max(1, 35 - idx * 2),
      bestCombo: Math.max(5, 15 - idx),
      accuracy: Math.max(80, 98 - idx * 2),
    }));

    const playerEntry: Omit<TournamentLeaderboardEntry, 'rank'> = {
      id: 'current_user_iq',
      name: `${playerName} (You)`,
      avatarEmoji: '😎',
      score: userScore,
      level: userLevel,
      bestCombo: userBestCombo,
      accuracy: userAccuracy,
      isCurrentUser: true,
    };

    const combinedList = [...competitors];
    if (userScore > 0 || combinedList.length === 0) {
      combinedList.push(playerEntry);
    }
    const allEntries = combinedList.sort((a, b) => b.score - a.score);

    const ranked: TournamentLeaderboardEntry[] = allEntries.map((e, index) => ({
      ...e,
      rank: index + 1,
    }));

    const userIndex = ranked.findIndex((r) => r.isCurrentUser);
    const userRank = userIndex >= 0 ? userIndex + 1 : ranked.length;

    let nextPlayerScore: number | null = null;
    let pointsToNextRank = 0;

    if (userIndex > 0) {
      nextPlayerScore = ranked[userIndex - 1].score;
      pointsToNextRank = Math.max(10, nextPlayerScore - userScore + 10);
    }

    return {
      entries: ranked,
      userRank,
      userScore,
      nextPlayerScore,
      pointsToNextRank,
    };
  }

  public static recordLevelCompletion(
    level: number,
    levelScore: number,
    accuracy: number,
    levelBestCombo: number,
    rewardCoins: number,
    perfectAnswers: number = 0
  ): EmojiIqPlayerStats {
    const stats = this.loadPlayerStats();

    // 1. Accumulate total tournament score
    stats.totalTournamentScore += levelScore;

    // 2. High score for level
    const prevBest = stats.highScoreByLevel[level] || 0;
    if (levelScore > prevBest) {
      stats.highScoreByLevel[level] = levelScore;
    }

    // 3. Stars calculation based on accuracy
    let stars = 1;
    if (accuracy >= 90) stars = 3;
    else if (accuracy >= 70) stars = 2;

    const prevStars = stats.starsByLevel[level] || 0;
    if (stars > prevStars) {
      stats.starsByLevel[level] = stars;
    }

    // 4. Unlock next level (up to 40)
    if (level >= stats.unlockedLevel && level < 40) {
      stats.unlockedLevel = level + 1;
    }

    // 5. Update best combo
    if (levelBestCombo > stats.bestCombo) {
      stats.bestCombo = levelBestCombo;
    }

    // 6. Reward coins
    stats.coins += rewardCoins;

    // 7. Perfect answers
    stats.perfectCount += perfectAnswers;

    // 8. Restore lives to 3 for next level
    stats.lives = 3;

    this.savePlayerStats(stats);
    return stats;
  }

  public static useHint(): boolean {
    const stats = this.loadPlayerStats();
    if (stats.availableHints <= 0) return false;
    stats.availableHints -= 1;
    stats.hintsUsed += 1;
    this.savePlayerStats(stats);
    return true;
  }

  public static buyHints(count: number, cost: number): boolean {
    const stats = this.loadPlayerStats();
    if (stats.coins < cost) return false;
    stats.coins -= cost;
    stats.availableHints += count;
    this.savePlayerStats(stats);
    return true;
  }

  public static buyLives(count: number, cost: number): boolean {
    const stats = this.loadPlayerStats();
    if (stats.coins < cost) return false;
    stats.coins -= cost;
    stats.lives = Math.min(3, stats.lives + count);
    this.savePlayerStats(stats);
    return true;
  }

  public static restoreLivesForCoins(cost: number = 30): boolean {
    const stats = this.loadPlayerStats();
    if (stats.coins < cost) return false;
    stats.coins -= cost;
    stats.lives = 3;
    this.savePlayerStats(stats);
    return true;
  }
}
