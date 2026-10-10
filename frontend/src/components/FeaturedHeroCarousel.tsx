/**
 * GameON Tele - Top Featured Hero Banner Carousel
 * Features large attractive banners, game titles, category tags, rating,
 * and high-contrast Play & Details action buttons.
 */

import React, { useState, useEffect } from 'react';
import { GameDefinition } from '../types';
import { Play, Info, Star, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface FeaturedHeroCarouselProps {
  featuredGames: GameDefinition[];
  onPlayGame: (game: GameDefinition) => void;
  onClickDetails?: (game: GameDefinition) => void;
  activeEntitlements?: Record<string, boolean>;
}

export const FeaturedHeroCarousel: React.FC<FeaturedHeroCarouselProps> = ({
  featuredGames,
  onPlayGame,
  onClickDetails,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance banner every 6 seconds if multiple games exist
  useEffect(() => {
    if (featuredGames.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredGames.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredGames.length]);

  if (!featuredGames || featuredGames.length === 0) return null;

  const currentGame = featuredGames[currentIndex] || featuredGames[0];

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? featuredGames.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredGames.length);
  };

  return (
    <div 
      id="home-featured-hero"
      className="relative w-full rounded-3xl overflow-hidden bg-[#0B2234] border border-[#244558] text-[#F5FAFC] shadow-md select-none"
    >
      {/* Background Artwork Banner */}
      <div className="relative h-56 sm:h-64 md:h-72 w-full overflow-hidden">
        <img
          src={currentGame.bannerUrl || currentGame.thumbnailUrl}
          alt={currentGame.title}
          className="w-full h-full object-cover opacity-80 transition-all duration-700 ease-out"
        />

        {/* Ambient Multi-Stop Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B2234] via-[#0B2234]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B2234]/80 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#00BFA6] text-[#071827] text-[10px] font-black uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3 h-3" />
              <span>FEATURED</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#102C40]/80 border border-[#244558] backdrop-blur-xs text-[#F5FAFC] text-[10px] font-bold uppercase tracking-wider">
              {currentGame.category}
            </span>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#102C40]/80 border border-[#244558] backdrop-blur-xs text-[#F7C85B] text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{currentGame.rating}</span>
          </div>
        </div>

        {/* Bottom Game Details & Action CTAs */}
        <div className="absolute bottom-4 left-4 right-4 z-10 space-y-2">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#F5FAFC] leading-tight drop-shadow-sm">
              {currentGame.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#A9C0CE] line-clamp-1 max-w-md mt-0.5">
              {currentGame.tagline || currentGame.description}
            </p>
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            {/* Play Button */}
            <button
              onClick={() => onPlayGame(currentGame)}
              className="py-2.5 px-5 rounded-xl font-black text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95 bg-[#00BFA6] hover:bg-[#63F5C8] text-[#071827] shadow-[#00BFA6]/20"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play (Free)</span>
            </button>

            {/* Details Button */}
            {onClickDetails && (
              <button
                onClick={() => onClickDetails(currentGame)}
                className="py-2.5 px-4 rounded-xl bg-[#15374A] hover:bg-[#244558] text-[#F5FAFC] border border-[#244558] font-bold text-xs sm:text-sm backdrop-blur-xs transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Info className="w-4 h-4" />
                <span>Details</span>
              </button>
            )}
          </div>
        </div>

        {/* Prev / Next Slide Chevrons */}
        {featuredGames.length > 1 && (
          <div className="absolute inset-y-0 left-2 right-2 flex items-center justify-between pointer-events-none z-20">
            <button
              onClick={prevSlide}
              className="w-8 h-8 rounded-full bg-[#071827]/70 hover:bg-[#071827] border border-[#244558] text-[#F5FAFC] flex items-center justify-center transition-colors pointer-events-auto cursor-pointer"
              aria-label="Previous featured game"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              className="w-8 h-8 rounded-full bg-[#071827]/70 hover:bg-[#071827] border border-[#244558] text-[#F5FAFC] flex items-center justify-center transition-colors pointer-events-auto cursor-pointer"
              aria-label="Next featured game"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Pagination Dots */}
      {featuredGames.length > 1 && (
        <div className="py-2 bg-[#0B2234] border-t border-[#244558] flex items-center justify-center gap-1.5">
          {featuredGames.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                currentIndex === idx ? 'w-5 bg-[#00BFA6]' : 'w-1.5 bg-[#244558]'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
