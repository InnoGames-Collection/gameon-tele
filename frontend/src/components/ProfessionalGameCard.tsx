import React from 'react';
import { GameDefinition } from '../types';
import { Play } from 'lucide-react';
import { getGameArtworkUrl } from '../services/gameArtwork';

export interface ProfessionalGameCardProps {
  game: GameDefinition;
  onPlay: (game: GameDefinition) => void;
  onClickDetails?: (game: GameDefinition) => void;
  layout?: 'carousel' | 'grid';
  hasActiveAccess?: boolean;
  className?: string;
}

/**
 * ProfessionalGameCard
 * Premium Image-First Gaming Tile for GameSwiper:
 * - 16:9 Prominent high-definition WebP game artwork
 * - Midnight navy & deep teal elevated surface (#102C40, #15374A)
 * - Concise, legible title (#F5FAFC) and category (#A9C0CE)
 * - Whole card is an accessible game-launch target
 * - Clean play affordance icon
 * - Zero clutter: no paragraphs, ratings, or competing badges
 */
export const ProfessionalGameCard: React.FC<ProfessionalGameCardProps> = ({
  game,
  onPlay,
  layout = 'grid',
  className = '',
}) => {
  const artworkUrl = game.bannerUrl || getGameArtworkUrl(game.id) || game.thumbnailUrl;

  return (
    <div
      id={`game-card-${game.id}`}
      onClick={() => onPlay(game)}
      className={`game-card group relative rounded-2xl bg-[#102C40] hover:bg-[#15374A] border border-[#244558] hover:border-[#00BFA6]/60 shadow-[0_4px_16px_rgba(7,24,39,0.35)] overflow-hidden cursor-pointer flex flex-col select-none active:scale-98 transition-all duration-200 ${
        layout === 'carousel'
          ? 'w-[200px] sm:w-[220px] shrink-0 snap-start'
          : 'w-full'
      } ${className}`}
    >
      {/* 1. DOMINANT GAME ARTWORK (16:9 Aspect Ratio) */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#0B2234] shrink-0">
        <img
          src={artworkUrl}
          alt={game.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Minimal Category Chip on Top-Left */}
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#071827]/80 backdrop-blur-xs text-[#35D9F2] text-[9px] font-bold uppercase tracking-wider border border-[#244558]/50">
          {game.category}
        </span>

        {/* Play Action Hover Indicator */}
        <div className="absolute inset-0 bg-[#071827]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div className="w-9 h-9 rounded-full bg-[#00BFA6] text-[#071827] flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-4 h-4 fill-[#071827] ml-0.5" />
          </div>
        </div>
      </div>

      {/* 2. COMPACT IMAGE-FIRST FOOTER */}
      <div className="p-2.5 sm:p-3 bg-[#102C40] group-hover:bg-[#15374A] flex items-center justify-between gap-2 border-t border-[#244558]/70 transition-colors">
        <div className="min-w-0 flex-1">
          <h3 
            title={game.title}
            className="text-xs sm:text-sm font-black text-[#F5FAFC] tracking-tight leading-tight truncate group-hover:text-[#35D9F2] transition-colors"
          >
            {game.title}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-[#A9C0CE] font-semibold truncate capitalize mt-0.5">
            {game.genre || game.category}
          </p>
        </div>

        {/* Consistent Play Affordance Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPlay(game);
          }}
          aria-label={`Play ${game.title}`}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#15374A] group-hover:bg-[#00BFA6] group-hover:text-[#071827] border border-[#244558] text-[#00BFA6] flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-2xs active:scale-95"
          title={`Play ${game.title}`}
        >
          <Play className="w-3.5 h-3.5 fill-current ml-0.2" />
        </button>
      </div>
    </div>
  );
};
