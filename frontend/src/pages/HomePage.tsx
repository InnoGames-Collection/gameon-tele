/**
 * GameOn Tele - Official Customer Home Portal
 * 
 * Strict Structure:
 * - At the VERY TOP before anything else:
 *   1. DAILY SCORE
 *   2. TOTAL 7-DAY SCORE
 *   3. DAILY CHALLENGE
 *   4. HELIX [ PLAY NOW ]
 * - Followed by Featured, Recently Played, and Categories.
 */

import React, { useMemo } from 'react';
import { GameDefinition, UserProfile } from '../types';
import { GameCatalog } from '../services/gameCatalog';
import { EntitlementService } from '../services/entitlementService';
import { catalogGameToDefinition, GameRegistry } from '../games/registry';
import { HelixCompetitionService } from '../services/helixCompetitionService';
import { FeaturedHeroCarousel } from '../components/FeaturedHeroCarousel';
import { RecentlyPlayedSection } from '../components/RecentlyPlayedSection';
import { GameCategorySection } from '../components/GameCategorySection';
import { Sparkles, Play, ChevronRight } from 'lucide-react';

interface HomePageProps {
  games?: GameDefinition[];
  profile: UserProfile;
  onLaunchGame: (game: GameDefinition) => void;
  onOpenDetails?: (game: GameDefinition) => void;
  onNavigateToGames?: (category?: string) => void;
  activeEntitlements?: Record<string, boolean>;
}

export const HomePage: React.FC<HomePageProps> = ({
  profile,
  onLaunchGame,
  onOpenDetails,
  onNavigateToGames,
  activeEntitlements = {},
}) => {
  // Real competition data from HelixCompetitionService
  const helixUserScores = useMemo(() => {
    return HelixCompetitionService.getUserScores(profile);
  }, [profile]);

  const handlePlayHelixChallenge = () => {
    const helix = GameRegistry.getGameById('helix-jump');
    if (helix) {
      onLaunchGame(helix);
    }
  };

  // 1. Featured Games from Catalog
  const featuredCatalog = GameCatalog.getFeatured();
  const featuredGames: GameDefinition[] = featuredCatalog.map(catalogGameToDefinition);

  // 2. Recommended Games
  const recommendedCatalog = GameCatalog.getRecommended();
  const recommendedGames: GameDefinition[] = recommendedCatalog.map(catalogGameToDefinition);

  // 3. Recently Played
  const recentlyPlayedIds = EntitlementService.getRecentlyPlayedIds();
  const recentlyPlayedGames = GameCatalog.getRecentlyPlayed(recentlyPlayedIds).map(catalogGameToDefinition);

  // 4. Categories with games (except "All Games")
  const availableCategories = GameCatalog.getCategoriesWithGames().filter((c) => c !== 'All Games');

  return (
    <div className="min-h-screen bg-white text-[#17202A] pb-24 select-none">
      <div className="max-w-md md:max-w-xl lg:max-w-3xl mx-auto space-y-6 pt-3">
        
        {/* =========================================================================
            VERY TOP OF HOME (Requirements 4, 5, 6, 7, 8):
            1. DAILY SCORE
            2. TOTAL 7-DAY SCORE
            3. DAILY CHALLENGE
            4. HELIX [ PLAY NOW ]
           ========================================================================= */}
        <section id="home-daily-challenge-top" className="px-3.5 sm:px-4 space-y-3">
          {/* Top Score Cards: 1. Daily Score, 2. Total 7-Day Score */}
          <div className="grid grid-cols-2 gap-3">
            {/* 1. Daily Score */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                Daily Score
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#1688C9] font-mono mt-1">
                {helixUserScores.dailyScore.toLocaleString()}
              </div>
            </div>

            {/* 2. Total 7-Day Score */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                Total 7-Day Score
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#8BCB3D] font-mono mt-1">
                {helixUserScores.sevenDayScore.toLocaleString()}
              </div>
            </div>
          </div>

          {/* 3. Daily Challenge -> 4. Helix [ PLAY NOW ] */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#1688C9] text-white shadow-sm border border-blue-600/30 relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#8BCB3D] text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                <Sparkles className="w-3 h-3" />
                <span>DAILY CHALLENGE</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Helix
              </h2>
              <p className="text-xs text-blue-50 font-medium">
                Compete in the rolling 7-day championship and climb the leaderboard!
              </p>
            </div>

            <div className="relative z-10 shrink-0">
              <button
                type="button"
                id="home-play-helix-challenge-btn"
                onClick={handlePlayHelixChallenge}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#8BCB3D] hover:bg-[#7cb934] active:scale-95 text-white font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>PLAY NOW</span>
              </button>
            </div>

            <div className="absolute -right-6 -bottom-8 w-32 h-32 bg-[#8BCB3D]/25 rounded-full blur-xl pointer-events-none" />
          </div>
        </section>

        {/* =========================================================================
            FEATURED HERO CAROUSEL
           ========================================================================= */}
        <div className="px-3.5 sm:px-4">
          <FeaturedHeroCarousel
            featuredGames={featuredGames}
            onPlayGame={onLaunchGame}
            onClickDetails={onOpenDetails}
            activeEntitlements={activeEntitlements}
          />
        </div>

        {/* =========================================================================
            RECENTLY PLAYED (Only rendered if user has played games)
           ========================================================================= */}
        {recentlyPlayedGames.length > 0 && (
          <div className="px-3.5 sm:px-4">
            <RecentlyPlayedSection
              games={recentlyPlayedGames}
              onPlayGame={onLaunchGame}
            />
          </div>
        )}

        {/* =========================================================================
            QUICK CATEGORY PILLS STRIP
           ========================================================================= */}
        <div className="px-3.5 sm:px-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Browse Categories
            </span>
            {onNavigateToGames && (
              <button
                onClick={() => onNavigateToGames('All Games')}
                className="text-xs font-bold text-[#1688C9] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All Games</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div 
            className="flex gap-2 overflow-x-auto scrollbar-none pb-1 snap-x snap-mandatory"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {availableCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onNavigateToGames?.(cat)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#17202A] font-extrabold text-xs shrink-0 snap-start transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* =========================================================================
            RECOMMENDED SECTION
           ========================================================================= */}
        {recommendedGames.length > 0 && (
          <GameCategorySection
            category="Recommended For You"
            games={recommendedGames}
            onPlayGame={onLaunchGame}
            onClickDetails={onOpenDetails}
            activeEntitlements={activeEntitlements}
          />
        )}

        {/* =========================================================================
            CATEGORY HORIZONTAL CAROUSELS
           ========================================================================= */}
        <div className="space-y-6">
          {availableCategories.map((cat) => {
            const catGames = GameCatalog.getByCategory(cat).map(catalogGameToDefinition);
            return (
              <GameCategorySection
                key={cat}
                category={cat}
                games={catGames}
                onPlayGame={onLaunchGame}
                onClickDetails={onOpenDetails}
                activeEntitlements={activeEntitlements}
              />
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-4 pt-2 text-center text-[11px] text-slate-400 font-medium">
          GameOn Tele • Official EthioTelecom Gaming
        </div>

      </div>
    </div>
  );
};
