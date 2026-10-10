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

  const textColor = '#F5FAFC';
  const accentColor = '#00BFA6';

  return (
    <div className={`inline-flex items-center select-none shrink-0 ${className}`}>
      <svg
        height={height}
        viewBox="0 0 345 68"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 aspect-[345/68] drop-shadow-sm"
        aria-label="GameSwiper Official Logo"
      >
        {/* ICON EMBLEM: Deep Teal Rounded Square with Gold Crown & Gaming Symbol */}
        <rect x="4" y="4" width="60" height="60" rx="16" fill="#15374A" stroke="#244558" strokeWidth="2" />
        
        {/* Gold Crown Accent */}
        <path 
          d="M18 42L22 24L30 32L34 20L38 32L46 24L50 42H18Z" 
          fill="#F7C85B" 
        />
        {/* Crown base band */}
        <rect x="18" y="42" width="32" height="4" rx="2" fill="#F7C85B" />
        {/* Crown jewels */}
        <circle cx="22" cy="22" r="2" fill="#63F5C8" />
        <circle cx="34" cy="18" r="2.5" fill="#35D9F2" />
        <circle cx="46" cy="22" r="2" fill="#63F5C8" />

        {/* TEXT BRANDING: "Game" + "Swiper" */}
        <text
          x="76"
          y="40"
          fill={textColor}
          fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="32"
          letterSpacing="-0.03em"
        >
          Game
        </text>

        {/* "Swiper" in Primary Teal #00BFA6 */}
        <text
          x="172"
          y="40"
          fill={accentColor}
          fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="32"
          letterSpacing="-0.03em"
        >
          Swiper
        </text>

        {/* Accent dot in Mint #63F5C8 */}
        <circle cx="300" cy="38" r="4.5" fill="#63F5C8" />

        {/* Sub-tagline: PLAY • WIN • ENJOY in Secondary Text #A9C0CE */}
        <text
          x="77"
          y="56"
          fill="#A9C0CE"
          fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          fontWeight="700"
          fontSize="10"
          letterSpacing="0.15em"
        >
          PLAY • WIN • ENJOY
        </text>
      </svg>
    </div>
  );
};

export const GameOnTeleLogo = GameSwiperLogo;
