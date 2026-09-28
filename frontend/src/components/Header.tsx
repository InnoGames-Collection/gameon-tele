/**
 * GameOn Tele Official Post-Login Application Header
 * 
 * Strict Layout Rules:
 * - Three-line menu button at TOP LEFT (intentional requirement)
 * - GameOn Tele branding in center / next to menu
 * - Clean white background (#FFFFFF) with subtle shadow and border
 */

import React from 'react';
import { Menu } from 'lucide-react';
import { GameOnTeleLogo } from './GameOnTeleLogo';

interface HeaderProps {
  onOpenMenu?: () => void;
  profile?: any;
  onOpenBuyCoins?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMenu,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] select-none">
      <div className="max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 min-h-[58px]">
        
        {/* 1. TOP LEFT: Three-Line Menu Button & Brand Header */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenMenu && (
            <button
              id="header-main-menu-btn"
              type="button"
              onClick={onOpenMenu}
              aria-label="Open GameOn Tele Menu"
              className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-[#17202A] hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-xs"
              title="Menu"
            >
              <Menu className="w-5 h-5 stroke-[2.2]" />
            </button>
          )}

          {/* GameOn Tele Brand Header */}
          <div 
            id="header-brand"
            className="flex items-center cursor-pointer transition-transform active:scale-98"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            title="GameOn Tele"
          >
            <GameOnTeleLogo size="sm" />
          </div>
        </div>

      </div>
    </header>
  );
};
