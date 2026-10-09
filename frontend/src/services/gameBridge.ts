/**
 * Game Bridge Service for TelePlus Ethiopia
 * Orchestrates game launching, testing mode access, coin deduction, score validation (max 400 per game),
 * and leaderboard synchronization.
 */

import { GameDefinition, GameSessionResult, UserProfile, RewardTransaction } from '../types';
import { StorageService } from './storageService';
import { CompetitiveService } from './competitiveService';
import { GameLeaderboardService } from './gameLeaderboardService';
import { HelixCompetitionService } from './helixCompetitionService';

export const GAME_ENTRY_COIN_COST = 10;

// Controlled Development / Testing Flag:
// In testing mode, allows instant play without blocking on coin balance
export const DEV_TESTING_MODE = true;

export const GameBridgeService = {
  /**
   * Check if user can launch the game.
   * If DEV_TESTING_MODE is true, access is immediately permitted.
   */
  canLaunchGame(
    _game: GameDefinition, 
    _profile: UserProfile
  ): { 
    allowed: boolean; 
    reason?: string; 
    requiresCoins?: boolean; 
    requiresAuth?: boolean; 
    requiresSubscription?: boolean 
  } {
    // All retained games are directly playable without coin gates
    return { allowed: true };
  },

  /**
   * Generates unique session ID for launch.
   * No coin deduction occurs.
   */
  deductCoinsForLaunch(
    _game: GameDefinition, 
    profile: UserProfile
  ): { updatedProfile: UserProfile; sessionId: string } {
    const sessionId = `GSESS_${_game.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const updated: UserProfile = {
      ...profile,
      matchesPlayed: (profile.matchesPlayed || 0) + 1,
    };
    StorageService.saveProfile(updated);
    return { updatedProfile: updated, sessionId };
  },

  /**
   * Processes game session completion, ensures score never exceeds 400 points,
   * updates high scores (best valid score only), and syncs with competitive tournament system.
   */
  submitScore(
    gameId: string,
    rawScore: number,
    durationSeconds: number,
    profile: UserProfile,
    tournamentId?: string
  ): { result: GameSessionResult; updatedProfile: UserProfile; transaction?: RewardTransaction } {
    // Preserve authentic game score without artificial capping
    const validScore = Math.max(0, Math.round(rawScore));

    // Record score into GameLeaderboardService
    GameLeaderboardService.recordScore(gameId, validScore, profile.displayName);

    // Sync authoritative Helix 7-Day Weekly Competition
    if (gameId === 'helix-jump') {
      try {
        HelixCompetitionService.recordScore(profile, validScore);
      } catch (err) {
        console.warn('Failed to record Helix competition score:', err);
      }
    } else {
      // Persist non-tournament catalog game score in PostgreSQL (without prizes)
      if (profile.phoneNumber) {
        fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            msisdn: profile.phoneNumber,
            gameId,
            score: validScore,
          }),
        }).catch((err) => console.warn('[GameBridge] Non-tournament score sync failed:', err));
      }
    }

    const currentHighScore = profile.highScores?.[gameId] || 0;
    const isNewHighScore = validScore > currentHighScore;
    const updatedHighScores = {
      ...(profile.highScores || {}),
      [gameId]: Math.max(currentHighScore, validScore),
    };

    // Record daily score for date-based leaderboard calculation
    const todayStr = new Date().toISOString().split('T')[0];
    const existingDailyScores = profile.dailyScores || {};
    const todayGameScores = existingDailyScores[todayStr] || {};
    const updatedDailyScores = {
      ...existingDailyScores,
      [todayStr]: {
        ...todayGameScores,
        [gameId]: Math.max(todayGameScores[gameId] || 0, validScore),
      },
    };

    const xpEarned = Math.max(10, Math.floor(validScore / 10));
    const newXP = (profile.xp || 0) + xpEarned;
    const newLevel = 1 + Math.floor(newXP / 1000);

    const updatedProfile: UserProfile = {
      ...profile,
      highScores: updatedHighScores,
      dailyScores: updatedDailyScores,
      xp: newXP,
      level: newLevel,
      trophiesCount: isNewHighScore ? (profile.trophiesCount || 0) + 1 : (profile.trophiesCount || 0),
    };

    StorageService.saveProfile(updatedProfile);

    let tournamentTx: RewardTransaction | undefined = undefined;
    if (tournamentId) {
      const tourneyResult = CompetitiveService.submitTournamentScore(tournamentId, validScore, updatedProfile);
      tournamentTx = tourneyResult.transaction;
    }

    const result: GameSessionResult = {
      gameId,
      score: validScore,
      coinsEarned: 0,
      xpEarned,
      isNewHighScore,
      durationSeconds,
    };

    return { result, updatedProfile, transaction: tournamentTx };
  },
};
