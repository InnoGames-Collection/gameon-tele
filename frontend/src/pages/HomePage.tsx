/**
 * GameSwiper - Premium Midnight-Navy & Deep-Teal Gaming Portal Home
 * 
 * Visual Architecture:
 * 1. Compact Brand & User Status Bar (Sticky header integration)
 * 2. Premium Featured Gaming Hero Banner:
 *    - Wide 2.25:1 to 2.35:1 aspect ratio
 *    - Dominant high-resolution WebP game artwork
 *    - Subtle midnight navy gradient behind typography
 *    - Mint/Teal "PLAY NOW" primary CTA
 *    - Gold star rating detail
 *    - Smooth touch-swipe navigation & idle auto-rotation
 * 3. Quick Play / Continue Playing (Real played games only, omitted if empty)
 * 4. Explore Games (Curated real catalog with 16:9 premium game cards)
 * 5. Quick Category Filter Strip & "Browse All Games" navigation
 */

import React from 'react';
import { GameDefinition, UserProfile } from '../types';
import { GameCatalog } from '../services/gameCatalog';
import { EntitlementService } from '../services/entitlementService';
import { catalogGameToDefinition } from '../games/registry';
import { getGameArtworkUrl } from '../services/gameArtwork';
import { FeaturedHeroCarousel } from '../components/FeaturedHeroCarousel';
import { 
  Play, 
  ChevronRight, 
  Flame, 
  Trophy, 
  History,
  Star,
  Gamepad2,
  Sparkles
} from 'lucide-react';

interface HomePageProps {
  games?: GameDefinition[];
  profile: UserProfile;
  onLaunchGame: (game: GameDefinition) => void;
  onOpenDetails?: (game: GameDefinition) => void;
  onNavigateToGames?: (category?: string) => void;
  onOpenBuyCoins?: () => void;
  activeEntitlements?: Record<string, boolean>;
}

export const HomePage: React.FC<HomePageProps> = ({
  profile,
  onLaunchGame,
  onOpenDetails,
  onNavigateToGames,
}) => {
  // 1. Curated Top Featured Games for the Hero Banner Carousel
  const featuredCatalog = GameCatalog.getFeatured();
  const heroGames: GameDefinition[] = (featuredCatalog.length > 0 
    ? featuredCatalog 
    : GameCatalog.getAll().slice(0, 5)
  ).slice(0, 5).map(catalogGameToDefinition);

  // 2. Curated Explore Games Catalog (excluding the current flagship hero game)
  const currentHeroId = heroGames[0]?.id;
  const exploreGames: GameDefinition[] = GameCatalog.getAll()
    .filter((g) => g.isActive && g.gameId !== currentHeroId)
    .slice(0, 8)
    .map(catalogGameToDefinition);

  // 3. Conditional "Continue Playing" Games (Real user play history only)
  const recentlyPlayedIds = EntitlementService.getRecentlyPlayedIds();
  const recentlyPlayedGames: GameDefinition[] = GameCatalog.getRecentlyPlayed(recentlyPlayedIds)
    .map(catalogGameToDefinition);

  // 4. Quick Category Browse Pills
  const availableCategories = GameCatalog.getCategoriesWithGames().filter((c) => c !== 'All Games');

  return (
    <div className="min-h-screen bg-[#071827] text-[#F5FAFC] pb-24 select-none font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-md md:max-w-xl lg:max-w-3xl mx-auto space-y-6 pt-3 px-3.5 sm:px-4">
        
        {/* =========================================================================
            1. PREMIUM GAMING HERO BANNER (CENTERPIECE)
            ========================================================================= */}
        <section id="home-hero-section" className="w-full">
          <FeaturedHeroCarousel
            featuredGames={heroGames}
            onPlayGame={onLaunchGame}
            onClickDetails={onOpenDetails}
          />
        </section>

        {/* =========================================================================
            2. CONDITIONAL "CONTINUE PLAYING" / "JUMP BACK IN" (REAL DATA ONLY)
            ========================================================================= */}
        {recentlyPlayedGames.length > 0 && (
          <section id="home-continue-playing" className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#15374A] border border-[#244558] text-[#35D9F2] flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <h2 className="text-sm sm:text-base font-black text-[#F5FAFC] tracking-tight">
                  Continue Playing
                </h2>
              </div>
              <span className="text-[11px] font-bold text-[#A9C0CE]">
                {recentlyPlayedGames.length} Recent
              </span>
            </div>

            <div 
              className="flex gap-3 overflow-x-auto scrollbar-none pb-1 snap-x snap-mandatory"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {recentlyPlayedGames.map((game) => {
                const bestScore = profile.highScores?.[game.id] || 0;
                const artworkSrc = game.bannerUrl || getGameArtworkUrl(game.id) || game.thumbnailUrl;

                return (
                  <div
                    key={game.id}
                    id={`recent-game-${game.id}`}
                    onClick={() => onLaunchGame(game)}
                    className="group flex items-center gap-3 p-2.5 rounded-2xl bg-[#102C40] hover:bg-[#15374A] border border-[#244558] hover:border-[#00BFA6]/60 transition-all cursor-pointer shrink-0 snap-start select-none w-64 sm:w-72 shadow-md active:scale-98"
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#0B2234] shrink-0 border border-[#244558]">
                      <img 
                        src={artworkSrc} 
                        alt={game.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        loading="lazy"
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h4 className="text-xs font-black text-[#F5FAFC] truncate group-hover:text-[#35D9F2] transition-colors">
                        {game.title}
                      </h4>
                      <p className="text-[10px] text-[#A9C0CE] font-semibold truncate capitalize">
                        {game.category}
                      </p>
                      {bestScore > 0 && (
                        <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#F7C85B]">
                          <Trophy className="w-3 h-3 text-[#F7C85B]" />
                          <span>Best: {bestScore.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-[#00BFA6] text-[#071827] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      <Play className="w-3.5 h-3.5 fill-[#071827]" />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* =========================================================================
            3. QUICK CATEGORY PILLS (SLIM NAVIGATION STRIP)
            ========================================================================= */}
        {availableCategories.length > 0 && (
          <section id="home-category-strip" className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#A9C0CE] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#00BFA6]" />
                <span>Categories</span>
              </span>
              {onNavigateToGames && (
                <button
                  type="button"
                  onClick={() => onNavigateToGames('All Games')}
                  className="text-xs font-bold text-[#35D9F2] hover:text-[#63F5C8] transition-colors flex items-center gap-0.5 cursor-pointer"
                >
                  <span>All Categories</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div 
              className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5 snap-x snap-mandatory"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onNavigateToGames?.(cat)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#102C40] hover:bg-[#15374A] active:scale-95 text-[#A9C0CE] hover:text-[#35D9F2] font-bold text-xs shrink-0 snap-start transition-all cursor-pointer border border-[#244558]"
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* =========================================================================
            4. EXPLORE GAMES (PREMIUM 16:9 GAME CARDS GRID)
            ========================================================================= */}
        <section id="home-explore-games" className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#15374A] border border-[#244558] text-[#00BFA6] flex items-center justify-center">
                <Gamepad2 className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-black text-[#F5FAFC] tracking-tight">
                Explore Games
              </h2>
            </div>

            {onNavigateToGames && (
              <button
                type="button"
                onClick={() => onNavigateToGames('All Games')}
                className="text-xs font-bold text-[#35D9F2] hover:text-[#63F5C8] flex items-center gap-0.5 cursor-pointer transition-colors"
              >
                <span>View All ({GameCatalog.getAll().length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Responsive 2-column on mobile, 3/4 on larger screens */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {exploreGames.map((game) => {
              const artworkSrc = game.bannerUrl || getGameArtworkUrl(game.id) || game.thumbnailUrl;

              return (
                <div
                  key={game.id}
                  id={`explore-game-${game.id}`}
                  onClick={() => onLaunchGame(game)}
                  className="group relative rounded-2xl bg-[#102C40] hover:bg-[#15374A] border border-[#244558] hover:border-[#00BFA6]/50 shadow-[0_4px_14px_rgba(7,24,39,0.35)] overflow-hidden transition-all duration-200 cursor-pointer flex flex-col active:scale-98"
                >
                  {/* Consistent 16:9 Proportion Key-Art */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#0B2234]">
                    <img 
                      src={artworkSrc} 
                      alt={game.title} 
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Category Pill Tag */}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#071827]/80 backdrop-blur-xs text-[#35D9F2] text-[9px] font-bold uppercase tracking-wider border border-[#244558]/50">
                      {game.category}
                    </span>

                    {/* Gold Star Rating */}
                    <span className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#071827]/80 backdrop-blur-xs text-[#F7C85B] text-[10px] font-bold border border-[#244558]/50">
                      <Star className="w-2.5 h-2.5 fill-[#F7C85B]" />
                      <span>{game.rating || '4.8'}</span>
                    </span>

                    {/* Play Action Hover Indicator */}
                    <div className="absolute inset-0 bg-[#071827]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <div className="w-9 h-9 rounded-full bg-[#00BFA6] text-[#071827] flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-4 h-4 fill-[#071827] ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Card Content Footer */}
                  <div className="p-2.5 sm:p-3 flex items-center justify-between gap-2 flex-1">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs sm:text-sm font-black text-[#F5FAFC] truncate group-hover:text-[#35D9F2] transition-colors leading-tight">
                        {game.title}
                      </h3>
                      <p className="text-[10px] text-[#A9C0CE] font-semibold truncate capitalize mt-0.5">
                        {game.genre || game.category}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLaunchGame(game);
                      }}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#15374A] border border-[#244558] text-[#00BFA6] group-hover:bg-[#00BFA6] group-hover:text-[#071827] flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
                      title={`Play ${game.title}`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Catalog Discovery CTA */}
          {onNavigateToGames && (
            <div className="pt-2 text-center">
              <button
                type="button"
                id="home-view-all-games-btn"
                onClick={() => onNavigateToGames('All Games')}
                className="w-full py-3 rounded-2xl bg-[#102C40] hover:bg-[#15374A] active:scale-98 border border-[#244558] hover:border-[#00BFA6]/50 text-xs sm:text-sm font-black text-[#F5FAFC] hover:text-[#35D9F2] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Gamepad2 className="w-4 h-4 text-[#00BFA6]" />
                <span>Explore All {GameCatalog.getAll().length} Games</span>
                <ChevronRight className="w-4 h-4 text-[#A9C0CE]" />
              </button>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};
