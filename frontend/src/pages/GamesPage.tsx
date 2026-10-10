/**
 * GameSwiper - Official Games Catalog Page
 * 
 * Strict Layout & Design Specifications:
 * 1. Mobile Game Grid: Exactly TWO columns side by side per row (grid-cols-2).
 * 2. Mandatory Catalog: All 16 requested games in the exact order:
 *    1. Helix (helix-jump)
 *    2. Memory (memory-match)
 *    3. Color Quick (color-rush)
 *    4. Emoji (emoji-iq)
 *    5. Water Sort (royal-water-sort)
 *    6. Pop Balloon (pop-balloon)
 *    7. Knife Hit (knife-madness)
 *    8. Sorting Ball (sorting-balls)
 *    9. Block Puzzle (puzzle-block)
 *    10. Soccer Hit (soccer-shooter)
 *    11. Button Soccer (button-soccer)
 *    12. Motor Race (moto-race)
 *    13. Solitaire (solitaire)
 *    14. Emoji Sort (emoji-sorting-ball)
 *    15. Dama (dama)
 *    16. Soccer Ping Pong (soccer-ping-pong)
 * 3. Pop Color and Fruit Ninja strictly excluded.
 * 4. Image-First Game Cards: 16:9 dominant art, elevated #102C40 surface, readable title, clean play target.
 * 5. Compact, wide featured banner with real game artwork.
 */

import React, { useState, useMemo } from 'react';
import { GameDefinition, UserProfile } from '../types';
import { GameCatalog } from '../services/gameCatalog';
import { catalogGameToDefinition, GameRegistry } from '../games/registry';
import { GameCard } from '../components/GameCard';
import { Search, Sparkles, Filter, X, Play } from 'lucide-react';
import { getGameArtworkUrl } from '../services/gameArtwork';

interface GamesPageProps {
  games: GameDefinition[];
  profile: UserProfile;
  onLaunchGame: (game: GameDefinition) => void;
  initialCategory?: string;
  activeEntitlements?: Record<string, boolean>;
}

export const GamesPage: React.FC<GamesPageProps> = ({
  onLaunchGame,
  initialCategory = 'All Games',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Categories with active games (plus 'All Games')
  const categories = useMemo(() => {
    return GameCatalog.getCategoriesWithGames();
  }, []);

  // 2. Filter games by category and search query while strictly preserving the 16-game order
  const filteredGames = useMemo(() => {
    let result = GameCatalog.getAll();

    if (selectedCategory !== 'All Games') {
      result = result.filter(
        (g) => g.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.gameName.toLowerCase().includes(q) ||
          g.titleAmharic.includes(searchQuery) ||
          g.category.toLowerCase().includes(q) ||
          g.tagline.toLowerCase().includes(q) ||
          g.genre.toLowerCase().includes(q)
      );
    }

    return result.map(catalogGameToDefinition);
  }, [selectedCategory, searchQuery]);

  // Flagship game for top promo banner
  const featuredFlagship = GameRegistry.getGameById('helix-jump') || filteredGames[0];
  const featuredBannerArt = featuredFlagship ? (featuredFlagship.bannerUrl || getGameArtworkUrl(featuredFlagship.id)) : '';

  return (
    <div className="min-h-screen bg-[#071827] text-[#F5FAFC] pb-24 select-none font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 sm:px-4 pt-3 space-y-4">
        
        {/* =========================================================================
            1. COMPACT FEATURED PROMO BANNER (REAL ARTWORK, ACCESSIBLE HEIGHT)
            ========================================================================= */}
        {featuredFlagship && (
          <div 
            id="games-catalog-hero"
            className="rounded-2xl sm:rounded-3xl bg-[#0B2234] border border-[#244558] shadow-lg relative overflow-hidden h-32 sm:h-36 md:h-40 flex items-center justify-between"
          >
            {/* Real Game Artwork on Right with Fade Overlay */}
            <div className="absolute right-0 top-0 bottom-0 w-3/5 sm:w-1/2 overflow-hidden pointer-events-none">
              <img
                src={featuredBannerArt}
                alt={featuredFlagship.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B2234] via-[#0B2234]/60 to-transparent" />
            </div>

            {/* Banner Text & Action */}
            <div className="relative z-10 p-3.5 sm:p-5 space-y-1 sm:space-y-1.5 max-w-[65%] sm:max-w-[60%]">
              <div className="flex items-center gap-1.5 text-[#35D9F2] text-[10px] sm:text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>16 PREMIER GAMES</span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-[#F5FAFC] leading-tight drop-shadow-sm">
                Instant Game Catalog
              </h2>
              <p className="text-[11px] sm:text-xs text-[#A9C0CE] font-medium line-clamp-1">
                Zero download arcade & 3D gaming.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  id="catalog-play-featured-btn"
                  onClick={() => onLaunchGame(featuredFlagship)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00BFA6] to-[#63F5C8] hover:from-[#63F5C8] hover:to-[#00BFA6] active:scale-95 text-[#071827] text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer border border-[#00BFA6]"
                >
                  <Play className="w-3 h-3 fill-[#071827] text-[#071827]" />
                  <span>Play {featuredFlagship.title}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            2. SEARCH BAR & FILTER ROW
            ========================================================================= */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#35D9F2] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 16 games, categories..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-[#102C40] hover:bg-[#15374A] focus:bg-[#102C40] text-[#F5FAFC] text-xs sm:text-sm font-bold border border-[#244558] focus:border-[#00BFA6] focus:ring-1 focus:ring-[#00BFA6]/40 outline-none transition-all placeholder:text-[#A9C0CE]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#15374A] hover:bg-[#244558] text-[#A9C0CE] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setSelectedCategory('All Games')}
            aria-label="Filter"
            className="w-10 h-10 rounded-2xl bg-[#102C40] border border-[#244558] text-[#35D9F2] hover:bg-[#15374A] hover:text-[#63F5C8] flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-xs active:scale-95"
            title="Filter Categories"
          >
            <Filter className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* =========================================================================
            3. CATEGORY FILTER PILLS
            ========================================================================= */}
        <div 
          className="flex gap-2 overflow-x-auto scrollbar-none pb-1 snap-x snap-mandatory"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs shrink-0 snap-start transition-all cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-[#00BFA6] text-[#071827] shadow-sm font-black'
                    : 'bg-[#102C40] hover:bg-[#15374A] text-[#A9C0CE] hover:text-[#35D9F2] border border-[#244558]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* =========================================================================
            4. MOBILE GAME GRID: STRICTLY EXACTLY TWO COLUMNS SIDE BY SIDE
            ========================================================================= */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase text-[#A9C0CE] tracking-wider">
              {selectedCategory} ({filteredGames.length})
            </span>
          </div>

          {filteredGames.length > 0 ? (
            /* 
             * STRICT TWO-COLUMN MOBILE GRID:
             * 'grid-cols-2' is enforced on all mobile viewports.
             * Tablets and desktop adapt to 'sm:grid-cols-3' and 'lg:grid-cols-4'.
             */
            <div 
              id="games-catalog-grid"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
            >
              {filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onPlay={onLaunchGame}
                  layout="grid"
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-[#102C40] rounded-2xl border border-[#244558] space-y-3 shadow-md">
              <p className="text-sm font-bold text-[#F5FAFC]">
                No games found matching "{searchQuery}"
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Games');
                }}
                className="px-4 py-2 rounded-xl bg-[#00BFA6] hover:bg-[#63F5C8] text-[#071827] text-xs font-black cursor-pointer transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
