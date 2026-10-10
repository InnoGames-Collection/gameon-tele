/**
 * GameSwiper - Redesigned Mobile-First Home Portal
 * 
 * Hierarchy:
 * 1. Single Featured Hero Game Card (Flagship 3D Helix Jump with Play Now & Info)
 * 2. Conditional "Continue Playing" / "Jump Back In" Row (when history exists)
 * 3. Curated Discovery Row (Trending Games / Top Picks with 16:9 Touch-Snap Cards)
 * 4. Category Pills & Catalog Quick Jump
 */

import React from 'react';
import { GameDefinition, UserProfile } from '../types';
import { GameCatalog } from '../services/gameCatalog';
import { EntitlementService } from '../services/entitlementService';
import { catalogGameToDefinition, GameRegistry } from '../games/registry';
import { OriginalGameArtwork } from '../components/OriginalGameArtwork';
import { 
  Sparkles, 
  Play, 
  Info, 
  ChevronRight, 
  Flame, 
  Trophy, 
  History,
  Star,
  Gamepad2
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
  // 1. Featured Flagship Game (Helix Jump or First Featured Game)
  const featuredGame = GameRegistry.getGameById('helix-jump') || 
    (GameCatalog.getFeatured().length > 0 ? catalogGameToDefinition(GameCatalog.getFeatured()[0]) : null);

  // 2. Curated Trending Discovery Games
  const trendingCatalog = GameCatalog.getFeatured();
  const trendingGames: GameDefinition[] = trendingCatalog
    .map(catalogGameToDefinition)
    .filter((g) => g.id !== featuredGame?.id);

  // 3. Conditional "Continue Playing" Games
  const recentlyPlayedIds = EntitlementService.getRecentlyPlayedIds();
  const recentlyPlayedGames: GameDefinition[] = GameCatalog.getRecentlyPlayed(recentlyPlayedIds)
    .map(catalogGameToDefinition);

  // 4. Quick Category Browse Pills
  const availableCategories = GameCatalog.getCategoriesWithGames().filter((c) => c !== 'All Games');

  return (
    <div className="min-h-screen bg-white text-[#45365F] pb-24 select-none font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-md md:max-w-xl lg:max-w-3xl mx-auto space-y-6 pt-3 px-3.5 sm:px-4">
        
        {/* =========================================================================
            1. FEATURED HERO GAME (SINGLE FEATURED CARD)
            ========================================================================= */}
        {featuredGame && (
          <section id="home-featured-hero-card" className="w-full">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#38205F] to-[#7048E8] text-white shadow-md border border-[#E7DFF3]">
              
              {/* Visual Key-Art (Aspect 16:9 on mobile, beautiful composition) */}
              <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden">
                <OriginalGameArtwork 
                  gameId={featuredGame.id} 
                  className="w-full h-full object-cover" 
                  alt={featuredGame.title}
                />
                
                {/* Ambient Multi-Stop Gradient Overlays for readable text */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#38205F] via-[#38205F]/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#38205F]/70 via-transparent to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C6F36B] text-[#38205F] text-[10px] font-black uppercase tracking-wider shadow-xs">
                      <Sparkles className="w-3 h-3 text-[#38205F]" />
                      <span>FEATURED HERO</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/10">
                      {featuredGame.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#38205F]/60 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/10">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{featuredGame.rating || '4.9'}</span>
                  </div>
                </div>

                {/* Bottom Overlay Info & Title */}
                <div className="absolute bottom-3 left-4 right-4 z-10">
                  <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-sm">
                    {featuredGame.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#F1ECFF] line-clamp-1 max-w-md mt-0.5 font-medium">
                    {featuredGame.tagline || featuredGame.description}
                  </p>
                </div>
              </div>

              {/* Action Bar Container below banner */}
              <div className="p-4 bg-[#38205F] border-t border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-[#F1ECFF]/15 text-[#C6F36B] text-[11px] font-bold">
                    100% Free
                  </span>
                  <span className="text-[11px] text-[#F1ECFF]/80 hidden xs:inline font-medium">
                    Instant 3D Play
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  {onOpenDetails && (
                    <button
                      type="button"
                      id="hero-details-btn"
                      onClick={() => onOpenDetails(featuredGame)}
                      className="px-3.5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      title="View Details"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">Details</span>
                    </button>
                  )}

                  <button
                    type="button"
                    id="hero-play-now-btn"
                    onClick={() => onLaunchGame(featuredGame)}
                    className="px-6 py-2.5 rounded-2xl bg-[#C6F36B] hover:bg-[#bbf058] active:scale-95 text-[#38205F] font-black text-xs uppercase tracking-wide transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-[#38205F]" />
                    <span>PLAY NOW</span>
                  </button>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* =========================================================================
            2. CONDITIONAL "CONTINUE PLAYING" / "JUMP BACK IN" ROW
            Only rendered if the player has existing session history.
            ========================================================================= */}
        {recentlyPlayedGames.length > 0 && (
          <section id="home-continue-playing" className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#F1ECFF] text-[#7048E8] flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <h2 className="text-base font-black text-[#38205F] tracking-tight">
                  Jump Back In
                </h2>
              </div>
              <span className="text-[11px] font-bold text-[#827695]">
                {recentlyPlayedGames.length} Recent
              </span>
            </div>

            <div 
              className="flex gap-3 overflow-x-auto scrollbar-none pb-1 snap-x snap-mandatory"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {recentlyPlayedGames.map((game) => {
                const bestScore = profile.highScores?.[game.id] || 0;

                return (
                  <div
                    key={game.id}
                    id={`recent-game-${game.id}`}
                    onClick={() => onLaunchGame(game)}
                    className="group flex items-center gap-3 p-2.5 rounded-2xl bg-white hover:bg-[#F1ECFF]/30 border border-[#E7DFF3] transition-all cursor-pointer shrink-0 snap-start select-none w-64 sm:w-72 shadow-xs"
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#38205F] shrink-0 border border-[#E7DFF3]">
                      <OriginalGameArtwork gameId={game.id} className="w-full h-full object-cover" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h4 className="text-xs font-black text-[#38205F] truncate group-hover:text-[#7048E8] transition-colors">
                        {game.title}
                      </h4>
                      <p className="text-[10px] text-[#827695] font-semibold truncate capitalize">
                        {game.category}
                      </p>
                      {bestScore > 0 && (
                        <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#7048E8]">
                          <Trophy className="w-3 h-3 text-amber-500" />
                          <span>Best: {bestScore.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-[#7048E8] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* =========================================================================
            3. CURATED DISCOVERY ROW (TOUCH-FRIENDLY HORIZONTAL CAROUSEL)
            16:9 cards, scroll snap, real games from catalog.
            ========================================================================= */}
        <section id="home-discovery-trending" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#FFF8EE] text-[#FF6B6B] flex items-center justify-center border border-[#E7DFF3]">
                <Flame className="w-4 h-4 fill-current" />
              </div>
              <h2 className="text-base font-black text-[#38205F] tracking-tight">
                Trending Games
              </h2>
            </div>

            {onNavigateToGames && (
              <button
                type="button"
                onClick={() => onNavigateToGames('All Games')}
                className="text-xs font-bold text-[#7048E8] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div 
            className="flex gap-3.5 overflow-x-auto scrollbar-none pb-2 snap-x snap-mandatory"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {trendingGames.map((game) => (
              <div
                key={game.id}
                id={`trending-card-${game.id}`}
                onClick={() => onLaunchGame(game)}
                className="group w-52 sm:w-60 rounded-2xl bg-white border border-[#E7DFF3] hover:border-[#7048E8]/50 shadow-xs overflow-hidden transition-all duration-200 cursor-pointer shrink-0 snap-start flex flex-col"
              >
                {/* 16:9 Proportion Key-Art */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#38205F]">
                  <OriginalGameArtwork gameId={game.id} className="w-full h-full object-cover" />
                  
                  {/* Category Pill Tag */}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#38205F]/80 backdrop-blur-xs text-white text-[9px] font-bold uppercase tracking-wider">
                    {game.category}
                  </span>

                  {/* Play Action Hover Indicator */}
                  <div className="absolute inset-0 bg-[#7048E8]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-[#C6F36B] text-[#38205F] flex items-center justify-center shadow-md transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-5 h-5 fill-[#38205F] ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Card Content Footer */}
                <div className="p-3 flex items-center justify-between gap-2 flex-1">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-black text-[#38205F] truncate group-hover:text-[#7048E8] transition-colors">
                      {game.title}
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] text-[#827695] mt-0.5">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>{game.rating || '4.8'}</span>
                      <span>•</span>
                      <span>Free</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLaunchGame(game);
                    }}
                    className="w-7 h-7 rounded-xl bg-[#F1ECFF] text-[#7048E8] group-hover:bg-[#7048E8] group-hover:text-white flex items-center justify-center transition-colors shrink-0 shadow-2xs"
                    title={`Play ${game.title}`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            4. QUICK CATEGORY PILLS STRIP
            ========================================================================= */}
        <section id="home-category-strip" className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-[#7048E8]" />
              <h2 className="text-xs font-black uppercase text-[#827695] tracking-wider">
                Explore Categories
              </h2>
            </div>
            {onNavigateToGames && (
              <button
                type="button"
                onClick={() => onNavigateToGames('All Games')}
                className="text-xs font-bold text-[#7048E8] hover:underline"
              >
                All Games
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
                className="px-3.5 py-1.5 rounded-xl bg-[#F1ECFF] hover:bg-[#E7DFF3] text-[#38205F] font-bold text-xs shrink-0 snap-start transition-all cursor-pointer active:scale-95 border border-[#E7DFF3]"
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* =========================================================================
            5. FOOTER INFO
            ========================================================================= */}
        <div className="pt-4 pb-2 text-center text-[11px] text-[#827695] font-medium border-t border-[#E7DFF3]/60">
          GameSwiper • Official EthioTelecom Gaming
        </div>

      </div>
    </div>
  );
};
