import React from 'react';

export interface GameSwiperLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark'; // 'light' = dark text for white bg, 'dark' = white text for dark bg
}

export type GameOnTeleLogoProps = GameSwiperLogoProps;

export const GameSwiperLogo: React.FC<GameSwiperLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'light',
}) => {
  // Height sizing: xs=20, sm=26, md=32, lg=42, xl=54
  const height =
    size === 'xs' ? 20 :
    size === 'sm' ? 26 :
    size === 'lg' ? 42 :
    size === 'xl' ? 54 :
    32;

  const textColor = variant === 'dark' ? '#FFFFFF' : '#38205F';
  const accentColor = variant === 'dark' ? '#C6F36B' : '#7048E8';

  return (
    <div className={`inline-flex items-center select-none shrink-0 ${className}`}>
      <svg
        height={height}
        viewBox="0 0 345 68"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 aspect-[345/68] drop-shadow-xs"
        aria-label="GameSwiper Official Logo"
      >
        {/* ICON EMBLEM: Rounded square with Gaming Swipe Symbol in Primary Purple */}
        <rect x="4" y="4" width="60" height="60" rx="16" fill="#7048E8" />
        {/* Glow corner accent */}
        <path d="M 4 20 C 4 11.16 11.16 4 20 4 L 40 4 C 18 10 10 24 4 44 Z" fill="white" opacity="0.22" />
        {/* Plus / D-pad in Lime #C6F36B */}
        <rect x="28" y="16" width="12" height="36" rx="4" fill="#C6F36B" />
        <rect x="16" y="28" width="36" height="12" rx="4" fill="#C6F36B" />
        {/* Center Swipe Spark in Coral #FF6B6B */}
        <circle cx="34" cy="34" r="4" fill="#FF6B6B" />

        {/* TEXT BRANDING: "Game" + "Swiper" */}
        <text
          x="76"
          y="46"
          fill={textColor}
          fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="36"
          letterSpacing="-0.03em"
        >
          Game
        </text>

        {/* "Swiper" in brand Primary Purple */}
        <text
          x="185"
          y="46"
          fill={accentColor}
          fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="36"
          letterSpacing="-0.03em"
        >
          Swiper
        </text>

        {/* Accent dot in vibrant lime */}
        <circle cx="328" cy="44" r="4.5" fill="#C6F36B" />
      </svg>
    </div>
  );
};

export const GameOnTeleLogo = GameSwiperLogo;
