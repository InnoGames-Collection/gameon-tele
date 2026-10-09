/**
 * Mobile-First Bottom Navigation Bar for GameOn Tele
 * Clean 3-Tab Architecture: HOME, GAMES, PROFILE
 * (Tournament and tournament-related leaderboard tabs removed per specification)
 * - Equal-width tab containers (grid grid-cols-3), zero horizontal overflow
 * - Comfortable vertical height (h-16)
 * - Clear icon + label
 * - Selected tab: compact green (#8BCB3D) rounded rectangle/pill background with white icon and bold text
 * - Unselected tabs: neutral dark/black icon and text (#17202A)
 * - Navigation background: clean white (#FFFFFF) with subtle top border
 */

import React from 'react';
import { NavigationTab } from '../types';
import { Home, Gamepad2, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  labels?: {
    home?: string;
    games?: string;
    profile?: string;
  };
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, labels }) => {
  const tabs: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: labels?.home || 'HOME', icon: Home },
    { id: 'games', label: labels?.games || 'GAMES', icon: Gamepad2 },
    { id: 'profile', label: labels?.profile || 'PROFILE', icon: User },
  ];

  return (
    <nav 
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-md select-none h-16"
    >
      <div className="max-w-md md:max-w-xl mx-auto h-full px-2 grid grid-cols-3 items-center gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`bottom-nav-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-150 cursor-pointer w-full ${
                isSelected
                  ? 'bg-[#8BCB3D] text-white shadow-xs font-black'
                  : 'bg-transparent text-[#17202A] hover:text-[#1688C9] hover:bg-slate-50 font-bold'
              }`}
            >
              <Icon 
                className={`w-5 h-5 shrink-0 ${
                  isSelected ? 'text-white stroke-[2.5]' : 'text-[#17202A] stroke-2'
                }`} 
              />
              <span 
                className={`text-[9px] sm:text-[10px] uppercase tracking-tight text-center truncate w-full mt-0.5 leading-none ${
                  isSelected ? 'font-black text-white' : 'font-extrabold text-[#17202A]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
