/**
 * GameSwiper - Premium Gaming Hero Banner Carousel
 * Wide 2.25:1 to 2.35:1 aspect ratio, full-color dominant game artwork,
 * subtle midnight navy gradients for contrast, mint/teal CTA, gold rating,
 * smooth touch swiping with auto-rotation pause.
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameDefinition } from '../types';
import { getGameArtworkUrl } from '../services/gameArtwork';
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
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance banner every 5.5 seconds if multiple games exist and not paused
  useEffect(() => {
    if (featuredGames.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredGames.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [featuredGames.length, isPaused]);

  if (!featuredGames || featuredGames.length === 0) return null;

  const currentGame = featuredGames[currentIndex] || featuredGames[0];
  const bannerSrc = currentGame.bannerUrl || getGameArtworkUrl(currentGame.id) || currentGame.thumbnailUrl;

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? featuredGames.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredGames.length);
  };

  // Touch Swipe Handlers for Mobile Portrait
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (diff > 45) {
        nextSlide();
      } else if (diff < -45) {
        prevSlide();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;

    // Resume auto-rotation after 4 seconds of idle
    pauseTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 4000);
  };

  return (
    <section 
      id="home-featured-hero"
      aria-label="Featured Game Banner"
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0B2234] border border-[#244558] text-[#F5FAFC] shadow-[0_8px_24px_rgba(7,24,39,0.55)] select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 2.25:1 to 2.35:1 Responsive Aspect Ratio Banner Container */}
      <div 
        className="relative w-full aspect-[2.25/1] sm:aspect-[2.35/1] min-h-[170px] sm:min-h-[220px] md:min-h-[270px] overflow-hidden cursor-pointer"
        onClick={() => onPlayGame(currentGame)}
      >
        {/* Dominant Vivid High-Res Game Artwork */}
        <img
          key={currentGame.id}
          src={bannerSrc}
          alt={currentGame.title}
          className="w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-102"
          loading="eager"
        />

        {/* Subtle Midnight Navy Gradients - placed only behind text/CTAs to preserve central artwork */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#071827] via-[#071827]/55 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071827]/85 via-[#071827]/30 to-transparent pointer-events-none" />

        {/* Top Badges (Category & Gold Star Rating) */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 right-3 sm:right-4 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full bg-[#00BFA6] text-[#071827] text-[10px] font-black uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3 h-3 text-[#071827]" />
              <span>FEATURED</span>
            </span>
            <span className="px-2.5 py-0.5 sm:py-1 rounded-full bg-[#071827]/75 backdrop-blur-md text-[#35D9F2] text-[10px] font-bold uppercase tracking-wider border border-[#244558]">
              {currentGame.category}
            </span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full bg-[#071827]/75 backdrop-blur-md text-[#F7C85B] text-xs font-bold border border-[#244558]">
            <Star className="w-3.5 h-3.5 fill-[#F7C85B]" />
            <span>{currentGame.rating || '4.9'}</span>
          </div>
        </div>

        {/* Bottom Game Details & Primary Mint/Teal Action CTA */}
        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 right-3 sm:right-4 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-2.5">
          <div className="space-y-0.5 sm:space-y-1 max-w-xs sm:max-w-md">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-[#F5FAFC] leading-tight tracking-tight drop-shadow-md">
              {currentGame.title}
            </h1>
            <p className="text-[11px] sm:text-xs md:text-sm text-[#A9C0CE] line-clamp-1 font-medium drop-shadow-xs">
              {currentGame.tagline || currentGame.description}
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {onClickDetails && (
              <button
                type="button"
                id="hero-details-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onClickDetails(currentGame);
                }}
                className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#15374A]/80 hover:bg-[#102C40] active:scale-95 text-[#A9C0CE] hover:text-[#F5FAFC] font-bold text-xs backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer border border-[#244558]"
                title="View Details"
              >
                <Info className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Details</span>
              </button>
            )}

            <button
              type="button"
              id="hero-play-now-btn"
              onClick={(e) => {
                e.stopPropagation();
                onPlayGame(currentGame);
              }}
              className="px-4.5 sm:px-6 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#00BFA6] to-[#63F5C8] hover:from-[#63F5C8] hover:to-[#00BFA6] active:scale-95 text-[#071827] font-black text-xs sm:text-sm uppercase tracking-wide transition-all shadow-md shadow-[#00BFA6]/25 flex items-center gap-1.5 sm:gap-2 cursor-pointer border border-[#00BFA6]"
              title={`Play ${currentGame.title}`}
            >
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#071827] text-[#071827]" />
              <span>PLAY NOW</span>
            </button>
          </div>
        </div>

        {/* Prev / Next Chevrons (Desktop & Hover Interaction) */}
        {featuredGames.length > 1 && (
          <div className="absolute inset-y-0 left-2 right-2 flex items-center justify-between pointer-events-none z-20 opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              className="w-8 h-8 rounded-full bg-[#071827]/80 hover:bg-[#071827] border border-[#244558] text-[#F5FAFC] flex items-center justify-center transition-all pointer-events-auto cursor-pointer shadow-md active:scale-95"
              aria-label="Previous featured game"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              className="w-8 h-8 rounded-full bg-[#071827]/80 hover:bg-[#071827] border border-[#244558] text-[#F5FAFC] flex items-center justify-center transition-all pointer-events-auto cursor-pointer shadow-md active:scale-95"
              aria-label="Next featured game"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Restrained Floating Pagination Dots */}
        {featuredGames.length > 1 && (
          <div className="absolute top-3 sm:top-4 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#071827]/70 backdrop-blur-md border border-[#244558]/60 pointer-events-auto">
            {featuredGames.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx ? 'w-4 bg-[#00BFA6]' : 'w-1.5 bg-[#244558] hover:bg-[#A9C0CE]'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

