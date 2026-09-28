import React from 'react';

export interface GameOnTeleLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark'; // 'light' = dark text for white bg, 'dark' = white text for dark bg
}

export const GameOnTeleLogo: React.FC<GameOnTeleLogoProps> = ({
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

  const textColor = variant === 'dark' ? '#FFFFFF' : '#17202A';

  return (
    <div className={`inline-flex items-center select-none shrink-0 ${className}`}>
      <svg
        height={height}
        viewBox="0 0 315 68"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 aspect-[315/68] drop-shadow-xs"
        aria-label="GameOn Tele Official Logo"
      >
        {/* ICON EMBLEM: Rounded square with Gamepad symbol */}
        <rect x="4" y="4" width="60" height="60" rx="16" fill="#1688C9" />
        {/* Glow corner accent */}
        <path d="M 4 20 C 4 11.16 11.16 4 20 4 L 40 4 C 18 10 10 24 4 44 Z" fill="white" opacity="0.18" />
        {/* Plus / D-pad symbol in Vibrant Lime */}
        <rect x="28" y="16" width="12" height="36" rx="4" fill="#8BCB3D" />
        <rect x="16" y="28" width="36" height="12" rx="4" fill="#8BCB3D" />
        {/* Center dot in emblem */}
        <circle cx="34" cy="34" r="3.5" fill="#FFFFFF" />

        {/* TEXT BRANDING: "GameOn" + "Tele" */}
        <text
          x="76"
          y="46"
          fill={textColor}
          fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="36"
          letterSpacing="-0.03em"
        >
          GameOn
        </text>

        {/* "Tele" in brand blue */}
        <text
          x="224"
          y="46"
          fill="#1688C9"
          fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="36"
          letterSpacing="-0.03em"
        >
          Tele
        </text>

        {/* Accent dot in vibrant lime */}
        <circle cx="304" cy="44" r="4.5" fill="#8BCB3D" />
      </svg>
    </div>
  );
};
