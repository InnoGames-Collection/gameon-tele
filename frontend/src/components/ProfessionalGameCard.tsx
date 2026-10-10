import React from 'react';
import { GameDefinition } from '../types';
import { Play, Star } from 'lucide-react';
import { OriginalGameArtwork } from './OriginalGameArtwork';

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
 * 
 * Premium Clean Two-Zone Game Card Architecture:
 * 
 * ZONE 1: Promotional Image Container (.game-card-image)
 * - Fixed 16:9 aspect ratio across all cards
 * - Un-obscured promotional artwork (NO title/rating/description/PLAY overlays)
 * - Smooth top rounded corners matching card radius
 * 
 * ZONE 2: Clean White Information Container (.game-card-info)
 * - Pure white background (#FFFFFF) with subtle border & soft elevation
 * - Dark navy game title (#111827, 17-18px, bold/extrabold)
 * - Compact gold rating pill (★ 4.90 / ★ 4.99)
 * - Green status badge (UNLOCKED / FREE in #16A34A, or COINS)
 * - Readable gray description (#64748B, 13px)
 * - Signature GameON Tele green PLAY button (#8BCB3D) with white icon & text
 * - Guaranteed identical fixed height across all cards for pixel-perfect alignment
 */
export const ProfessionalGameCard: React.FC<ProfessionalGameCardProps> = ({
  game,
  onPlay,
  onClickDetails,
  layout = 'carousel',
  hasActiveAccess = false,
  className = '',
}) => {
  const isFreeDirectGame = game.id === 'candy-blast' || game.id === 'world-legends';
  const isCoinGame = !isFreeDirectGame && (game.accessType === 'COIN' || (!game.isFree && Boolean(game.requiresCoins)));
  const isSubscriptionGame = !isFreeDirectGame && game.accessType === 'SUBSCRIPTION';
  const coinCost = isFreeDirectGame ? 0 : (game.coinCost || 10);

  const handleCardClick = () => {
    if (onClickDetails) {
      onClickDetails(game);
    } else {
      onPlay(game);
    }
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay(game);
  };

  // Format rating to standard 2-decimal display (e.g. 4.90, 4.99)
  const formattedRating = Number(game.rating || 4.99).toFixed(2);

  // Status configuration: All games are 100% free per specification
  const statusText = 'FREE';
  const statusColor = 'text-[#7048E8] font-extrabold';

  return (
    <div
      id={`game-card-${game.id}`}
      onClick={handleCardClick}
      className={`game-card group relative rounded-[20px] bg-white border border-[#E7DFF3] hover:border-[#7048E8]/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer flex flex-col select-none ${
        layout === 'carousel'
          ? 'w-[290px] xs:w-[310px] sm:w-[330px] shrink-0 snap-start'
          : 'w-full'
      } ${className}`}
    >
      {/* =========================================================================
          ZONE 1: CLEAN PROMOTIONAL IMAGE CONTAINER (HERO)
          - 16:9 fixed aspect ratio
          - Unaltered, approved promotional key art
          - Zero overlay obstructions
         ========================================================================= */}
      <div className="game-card-image relative w-full aspect-[16/9] overflow-hidden bg-[#F1ECFF] shrink-0">
        <OriginalGameArtwork 
          gameId={game.id} 
          alt={`${game.title} promotional key art`}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105" 
        />
      </div>

      {/* =========================================================================
          ZONE 2: CLEAN WHITE INFORMATION PANEL (BELOW ARTWORK)
          - Pure white background (#FFFFFF)
          - Uniform fixed height (124px) ensuring all cards align identically
          - Deep plum title, gold rating, purple status, muted description, purple PLAY
         ========================================================================= */}
      <div className="game-card-info flex flex-col justify-between p-3.5 sm:p-4 bg-white h-[124px] shrink-0 border-t border-[#E7DFF3]/80">
        
        {/* ROW 1: GAME TITLE (DEEP PLUM) & RATING BADGE (GOLD ACCENT) */}
        <div className="flex items-start justify-between gap-2.5 min-w-0">
          <h3 
            title={game.title}
            className="text-[17px] sm:text-[18px] font-extrabold text-[#38205F] tracking-tight leading-tight line-clamp-1 flex-1 min-w-0"
          >
            {game.title}
          </h3>
          
          {/* Compact Gold Rating Pill */}
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F1ECFF] text-[#38205F] text-xs font-bold shrink-0 border border-[#E7DFF3] shadow-2xs mt-0.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span className="font-bold text-[#38205F] text-[12px]">{formattedRating}</span>
          </div>
        </div>

        {/* ROW 2: STATUS (PURPLE), DESCRIPTION (MUTED TEXT) & PURPLE PLAY BUTTON */}
        <div className="flex items-center justify-between gap-3 min-w-0">
          <div className="min-w-0 flex-1 pr-1 flex flex-col justify-center">
            <span className={`text-[11px] uppercase tracking-wider leading-none mb-1 ${statusColor}`}>
              {statusText}
            </span>
            <p 
              title={game.tagline || game.description}
              className="text-[13px] text-[#827695] font-medium leading-tight line-clamp-1"
            >
              {game.tagline || game.description}
            </p>
          </div>

          {/* Signature GameSwiper Purple PLAY Action */}
          <button
            type="button"
            onClick={handlePlayClick}
            aria-label={`Play ${game.title}`}
            className="shrink-0 h-[42px] px-4 sm:px-4.5 rounded-xl sm:rounded-2xl bg-[#7048E8] hover:bg-[#5f3dc4] active:scale-95 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm shadow-[#7048E8]/30 transition-all cursor-pointer border border-[#7048E8]"
          >
            <Play className="w-3.5 h-3.5 fill-current text-white" />
            <span className="tracking-wider">PLAY</span>
          </button>
        </div>
      </div>
    </div>
  );
};
