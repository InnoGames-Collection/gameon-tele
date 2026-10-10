/**
 * GameSwiper - Premium Midnight-Navy & Deep-Teal Gaming Portal
 * Inspired directly by high-end commercial mobile gaming platforms.
 * 
 * Visual Architecture:
 * 1. Hero Promo Card: Flagship 3D game key art with Mint/Teal "Start Playing" action
 * 2. User Wallet / Balance Card: Gold coins counter with Teal "+ Add Coins" action
 * 3. Daily Bonus Promo Card: Gold gift badge with "Claim Now" reward action
 * 4. Conditional "Jump Back In": History cards with gold trophy score indicator
 * 5. Featured / Trending Games: 16:9 cards on #102C40 surface with #244558 borders
 * 6. Category Quick-Browse Strip: Deep teal pills with cyan active states
 * 7. "Why GameSwiper?" Platform Trust Badges (Fast & Secure, 24/7, Exciting Rewards, Trusted)
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
  Gamepad2,
  Coins,
  Gift,
  Zap,
  ShieldCheck,
  Plus
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
  onOpenBuyCoins,
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

  const coinsBalance = profile.coinsBalance ?? 1250;

  return (
    <div className="min-h-screen bg-[#071827] text-[#F5FAFC] pb-24 select-none font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-md md:max-w-xl lg:max-w-3xl mx-auto space-y-5 pt-3 px-3.5 sm:px-4">
        
        {/* =========================================================================
            1. FEATURED HERO PROMO CARD
            ========================================================================= */}
        {featuredGame && (
          <section id="home-featured-hero-card" className="w-full">
            <div className="relative rounded-3xl overflow-hidden bg-[#102C40] text-white shadow-xl border border-[#244558]">
              
              {/* Visual Key-Art */}
              <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden bg-[#0B2234]">
                <OriginalGameArtwork 
                  gameId={featuredGame.id} 
                  className="w-full h-full object-cover" 
                  alt={featuredGame.title}
                />
                
                {/* Ambient Multi-Stop Gradient Overlays for readable text */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#071827] via-[#071827]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#071827]/80 via-transparent to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00BFA6] text-[#071827] text-[10px] font-black uppercase tracking-wider shadow-xs">
                      <Sparkles className="w-3 h-3 text-[#071827]" />
                      <span>FEATURED HERO</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#0B2234]/80 backdrop-blur-md text-[#35D9F2] text-[10px] font-bold uppercase tracking-wider border border-[#244558]">
                      {featuredGame.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0B2234]/80 backdrop-blur-md text-[#F7C85B] text-xs font-bold border border-[#244558]">
                    <Star className="w-3.5 h-3.5 fill-[#F7C85B]" />
                    <span>{featuredGame.rating || '4.9'}</span>
                  </div>
                </div>

                {/* Bottom Overlay Info & Title */}
                <div className="absolute bottom-3 left-4 right-4 z-10">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#F5FAFC] leading-tight tracking-tight drop-shadow-md">
                    {featuredGame.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#A9C0CE] line-clamp-1 max-w-md mt-0.5 font-medium">
                    {featuredGame.tagline || featuredGame.description}
                  </p>
                </div>
              </div>

              {/* Action Bar Container below banner */}
              <div className="p-3.5 sm:p-4 bg-[#0B2234] border-t border-[#244558] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#15374A] text-[#63F5C8] text-[11px] font-extrabold border border-[#244558]">
                    100% Free
                  </span>
                  <span className="text-[11px] text-[#A9C0CE] hidden xs:inline font-medium">
                    Instant 3D Play
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  {onOpenDetails && (
                    <button
                      type="button"
                      id="hero-details-btn"
                      onClick={() => onOpenDetails(featuredGame)}
                      className="px-3.5 py-2.5 rounded-2xl bg-[#15374A] hover:bg-[#102C40] active:scale-95 text-[#A9C0CE] hover:text-[#F5FAFC] font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-[#244558]"
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
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#00BFA6] to-[#63F5C8] hover:from-[#63F5C8] hover:to-[#00BFA6] active:scale-95 text-[#071827] font-black text-xs uppercase tracking-wide transition-all shadow-md shadow-[#00BFA6]/20 flex items-center gap-2 cursor-pointer border border-[#00BFA6]"
                  >
                    <Play className="w-4 h-4 fill-[#071827] text-[#071827]" />
                    <span>PLAY NOW</span>
                  </button>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* =========================================================================
            2. USER WALLET / BALANCE CARD (Reference Screen 1)
            ========================================================================= */}
        <div 
          id="home-balance-card"
          className="rounded-2xl bg-[#102C40] border border-[#244558] p-3.5 sm:p-4 flex items-center justify-between shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0B2234] border border-[#244558] flex items-center justify-center shrink-0">
              <Coins className="w-6 h-6 text-[#F7C85B]" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold text-[#A9C0CE] uppercase tracking-wider block">
                Your Balance
              </span>
              <div className="text-lg sm:text-xl font-black text-[#F5FAFC] font-mono leading-tight mt-0.5">
                {coinsBalance.toLocaleString()} <span className="text-xs font-sans text-[#F7C85B] font-bold">Coins</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenBuyCoins}
            className="px-3.5 py-2 rounded-xl bg-[#15374A] hover:bg-[#00BFA6] hover:text-[#071827] text-[#00BFA6] border border-[#00BFA6]/40 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Coins</span>
          </button>
        </div>

        {/* =========================================================================
            3. DAILY BONUS PROMO CARD (Reference Screen 1)
            ========================================================================= */}
        <div 
          id="home-daily-bonus-card"
          className="rounded-2xl bg-gradient-to-r from-[#102C40] via-[#15374A] to-[#102C40] border border-[#244558] p-3.5 sm:p-4 flex items-center justify-between shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0B2234] border border-[#244558] flex items-center justify-center shrink-0 text-[#F7C85B]">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#F5FAFC] leading-tight">
                Daily Bonus
              </h3>
              <p className="text-[11px] text-[#A9C0CE] font-medium mt-0.5">
                Login today and get free reward coins!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenBuyCoins}
            className="px-3.5 py-2 rounded-xl bg-[#F7C85B] hover:bg-[#eab308] text-[#071827] text-xs font-black transition-all cursor-pointer flex items-center gap-1 shadow-xs active:scale-95 shrink-0"
          >
            <span>Claim Now</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* =========================================================================
            4. CONDITIONAL "CONTINUE PLAYING" / "JUMP BACK IN" ROW
            ========================================================================= */}
        {recentlyPlayedGames.length > 0 && (
          <section id="home-continue-playing" className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#15374A] border border-[#244558] text-[#35D9F2] flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <h2 className="text-base font-black text-[#F5FAFC] tracking-tight">
                  Jump Back In
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

                return (
                  <div
                    key={game.id}
                    id={`recent-game-${game.id}`}
                    onClick={() => onLaunchGame(game)}
                    className="group flex items-center gap-3 p-2.5 rounded-2xl bg-[#102C40] hover:bg-[#15374A] border border-[#244558] hover:border-[#00BFA6]/60 transition-all cursor-pointer shrink-0 snap-start select-none w-64 sm:w-72 shadow-md"
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#0B2234] shrink-0 border border-[#244558]">
                      <OriginalGameArtwork gameId={game.id} className="w-full h-full object-cover" />
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
            5. FEATURED / TRENDING GAMES (TOUCH-FRIENDLY HORIZONTAL CAROUSEL)
            ========================================================================= */}
        <section id="home-discovery-trending" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#15374A] border border-[#244558] text-[#FF796C] flex items-center justify-center">
                <Flame className="w-4 h-4 fill-current" />
              </div>
              <h2 className="text-base font-black text-[#F5FAFC] tracking-tight">
                Featured Games
              </h2>
            </div>

            {onNavigateToGames && (
              <button
                type="button"
                onClick={() => onNavigateToGames('All Games')}
                className="text-xs font-bold text-[#35D9F2] hover:text-[#63F5C8] flex items-center gap-0.5 cursor-pointer transition-colors"
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
                className="group w-52 sm:w-60 rounded-2xl bg-[#102C40] border border-[#244558] hover:border-[#00BFA6]/60 shadow-md overflow-hidden transition-all duration-200 cursor-pointer shrink-0 snap-start flex flex-col"
              >
                {/* 16:9 Proportion Key-Art */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#0B2234]">
                  <OriginalGameArtwork gameId={game.id} className="w-full h-full object-cover" />
                  
                  {/* Category Pill Tag */}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#0B2234]/85 backdrop-blur-xs text-[#35D9F2] text-[9px] font-bold uppercase tracking-wider border border-[#244558]">
                    {game.category}
                  </span>

                  {/* Play Action Hover Indicator */}
                  <div className="absolute inset-0 bg-[#071827]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-[#00BFA6] text-[#071827] flex items-center justify-center shadow-md transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-5 h-5 fill-[#071827] ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Card Content Footer */}
                <div className="p-3 flex items-center justify-between gap-2 flex-1">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-black text-[#F5FAFC] truncate group-hover:text-[#35D9F2] transition-colors">
                      {game.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#A9C0CE] mt-0.5">
                      <Star className="w-3 h-3 text-[#F7C85B] fill-[#F7C85B]" />
                      <span className="font-bold text-[#F5FAFC]">{game.rating || '4.8'}</span>
                      <span>•</span>
                      <span className="text-[#63F5C8] font-bold">Free</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLaunchGame(game);
                    }}
                    className="w-7 h-7 rounded-xl bg-[#15374A] border border-[#244558] text-[#00BFA6] group-hover:bg-[#00BFA6] group-hover:text-[#071827] flex items-center justify-center transition-colors shrink-0 shadow-2xs"
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
            6. QUICK CATEGORY PILLS STRIP
            ========================================================================= */}
        <section id="home-category-strip" className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-[#00BFA6]" />
              <h2 className="text-xs font-black uppercase text-[#A9C0CE] tracking-wider">
                Explore Categories
              </h2>
            </div>
            {onNavigateToGames && (
              <button
                type="button"
                onClick={() => onNavigateToGames('All Games')}
                className="text-xs font-bold text-[#35D9F2] hover:underline"
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
                className="px-3.5 py-1.5 rounded-xl bg-[#102C40] hover:bg-[#15374A] text-[#A9C0CE] hover:text-[#35D9F2] font-bold text-xs shrink-0 snap-start transition-all cursor-pointer active:scale-95 border border-[#244558]"
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* =========================================================================
            7. "WHY GAMESWIPER?" PLATFORM TRUST PILLARS (Reference Screen 1)
            ========================================================================= */}
        <section id="home-trust-pillars" className="space-y-2.5 pt-1">
          <h2 className="text-xs font-black uppercase text-[#A9C0CE] tracking-wider">
            Why GameSwiper?
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { icon: Zap, label: 'Fast & Secure', desc: 'Instant 3D Play', color: '#35D9F2' },
              { icon: ShieldCheck, label: '24/7 Access', desc: 'Zero Lag Portal', color: '#63F5C8' },
              { icon: Gift, label: 'Exciting Rewards', desc: 'Daily Tokens & Badges', color: '#F7C85B' },
              { icon: Star, label: 'Trusted Platform', desc: 'Official EthioTelecom', color: '#00BFA6' },
            ].map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div 
                  key={pillar.label}
                  className="p-3 rounded-2xl bg-[#102C40] border border-[#244558] flex flex-col items-start gap-2 shadow-sm"
                >
                  <div 
                    className="w-8 h-8 rounded-xl bg-[#15374A] border border-[#244558] flex items-center justify-center shrink-0"
                    style={{ color: pillar.color }}
                  >
                    <Icon className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#F5FAFC] leading-tight">
                      {pillar.label}
                    </h4>
                    <p className="text-[10px] text-[#A9C0CE] font-medium mt-0.5">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            8. FOOTER INFO
            ========================================================================= */}
        <div className="pt-4 pb-2 text-center text-[11px] text-[#A9C0CE] font-medium border-t border-[#244558]">
          GameSwiper • Official EthioTelecom Gaming Portal
        </div>

      </div>
    </div>
  );
};
