/**
 * GameSwiper Official Post-Login Application Header
 * 
 * Strict Layout Rules:
 * - Three-line menu button at TOP LEFT
 * - GameSwiper branding in center / next to menu
 * - Clean white background (#FFFFFF) with subtle lavender border
 */

import React from 'react';
import { Menu } from 'lucide-react';
import { GameSwiperLogo } from './GameOnTeleLogo';

interface HeaderProps {
  onOpenMenu?: () => void;
  profile?: any;
  onOpenBuyCoins?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMenu,
  profile,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B2234]/95 backdrop-blur-md border-b border-[#244558] shadow-[0_4px_16px_rgba(7,24,39,0.5)] select-none">
      <div className="max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2 h-14">
        
        {/* 1. TOP LEFT: Hamburger Menu Button & Brand Header */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenMenu && (
            <button
              id="header-main-menu-btn"
              type="button"
              onClick={onOpenMenu}
              aria-label="Open GameSwiper Menu"
              className="w-9 h-9 rounded-xl border border-[#244558] bg-[#102C40] text-[#A9C0CE] hover:text-[#35D9F2] hover:bg-[#15374A] active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-xs"
              title="Menu"
            >
              <Menu className="w-4.5 h-4.5 stroke-[2.2]" />
            </button>
          )}

          {/* GameSwiper Brand Header */}
          <div 
            id="header-brand"
            className="flex items-center cursor-pointer transition-transform active:scale-98"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            title="GameSwiper"
          >
            <GameSwiperLogo size="sm" />
          </div>
        </div>

        {/* 2. TOP RIGHT: Compact User Profile Status Indicator */}
        {profile && (
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#102C40] border border-[#244558] text-xs font-bold text-[#F5FAFC] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#63F5C8] shadow-[0_0_6px_#63F5C8] shrink-0" />
              <span className="truncate max-w-[85px] xs:max-w-[120px] font-mono text-[11px] font-semibold text-[#A9C0CE]">
                {profile.phoneNumber ? profile.phoneNumber.replace(/^\+?251/, '') : 'VIP Player'}
              </span>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
