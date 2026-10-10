/**
 * GameON Tele - Official Game Catalog Discovery Page
 * Redesigned with Midnight-Navy Surfaces and Deep-Teal Panels
 * Inspired directly by modern high-end mobile gaming hubs.
 */

import React, { useState, useMemo } from 'react';
import { GameDefinition, UserProfile } from '../types';
import { GameCatalog } from '../services/gameCatalog';
import { catalogGameToDefinition } from '../games/registry';
import { GameCard } from '../components/GameCard';
import { GameDetailsModal } from '../components/GameDetailsModal';
import { Search, Sparkles, Filter, X, Gamepad2, ChevronRight } from 'lucide-react';

interface GamesPageProps {
  games: GameDefinition[];
  profile: UserProfile;
  onLaunchGame: (game: GameDefinition) => void;
  initialCategory?: string;
  activeEntitlements?: Record<string, boolean>;
}

export const GamesPage: React.FC<GamesPageProps> = ({
  games,
  profile,
  onLaunchGame,
  initialCategory = 'All Games',
  activeEntitlements = {},
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGameForDetails, setSelectedGameForDetails] = useState<GameDefinition | null>(null);

  // Categories with games (plus 'All Games')
  const categories = useMemo(() => {
    return GameCatalog.getCategoriesWithGames();
  }, []);

  // Filter games by category and search query
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

  return (
    <div className="min-h-screen bg-[#071827] text-[#F5FAFC] pb-24 select-none font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 sm:px-4 pt-3 space-y-4">
        
        {/* Game Details Modal */}
        <GameDetailsModal
          game={selectedGameForDetails}
          isOpen={Boolean(selectedGameForDetails)}
          onClose={() => setSelectedGameForDetails(null)}
          onPlayGame={onLaunchGame}
          hasActiveAccess={selectedGameForDetails ? Boolean(activeEntitlements[selectedGameForDetails.id]) : false}
        />

        {/* 1. TOP PROMO BANNER (Reference Screen 2) */}
        <div 
          id="games-catalog-hero"
          className="rounded-3xl bg-gradient-to-r from-[#102C40] via-[#15374A] to-[#102C40] border border-[#244558] p-4 sm:p-5 shadow-lg flex items-center justify-between gap-3 relative overflow-hidden"
        >
          <div className="space-y-1 z-10">
            <div className="flex items-center gap-1.5 text-[#35D9F2] text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>16+ PREMIER GAMES</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[#F5FAFC] leading-tight">
              Endless Fun, One Platform
            </h2>
            <p className="text-xs text-[#A9C0CE] font-medium max-w-xs">
              Instant 3D and arcade play across all devices with zero ads.
            </p>
            <div className="pt-1.5">
              <button
                type="button"
                onClick={() => setSelectedCategory('All Games')}
                className="px-3.5 py-1.5 rounded-xl bg-[#00BFA6] hover:bg-[#63F5C8] active:scale-95 text-[#071827] text-xs font-black transition-all shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <span>Explore All Games</span>
                <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          <div className="w-20 h-20 rounded-2xl bg-[#0B2234] border border-[#244558] flex items-center justify-center shrink-0 shadow-inner z-10 text-[#00BFA6]">
            <Gamepad2 className="w-10 h-10 stroke-[1.8]" />
          </div>

          {/* Ambient glow decoration */}
          <div className="absolute right-0 bottom-0 w-36 h-36 bg-[#00BFA6]/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* 2. SEARCH BAR & FILTER ROW */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#35D9F2] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games, categories, or tags..."
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
            className="w-10 h-10 rounded-2xl bg-[#102C40] border border-[#244558] text-[#35D9F2] hover:bg-[#15374A] hover:text-[#63F5C8] flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-xs"
            title="Filter Categories"
          >
            <Filter className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* 3. CATEGORY FILTER PILLS (Reference Screen 2) */}
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

        {/* 4. CATALOG GRID */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase text-[#A9C0CE] tracking-wider">
              {selectedCategory} ({filteredGames.length})
            </span>
          </div>

          {filteredGames.length > 0 ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-3.5">
              {filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onPlay={onLaunchGame}
                  onClickDetails={(g) => setSelectedGameForDetails(g)}
                  layout="grid"
                  hasActiveAccess={Boolean(activeEntitlements[game.id])}
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
