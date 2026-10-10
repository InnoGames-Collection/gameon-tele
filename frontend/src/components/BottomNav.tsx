/**
 * Mobile-First Bottom Navigation Bar for GameSwiper
 * Strict 3-Tab Architecture: Home | Game | Profile
 * - Equal-width tab containers (grid grid-cols-3), zero horizontal overflow
 * - Comfortable vertical height (h-16) + safe-area support
 * - Selected tab: Primary Purple (#7048E8) rounded pill background with white icon and bold text
 * - Unselected tabs: Deep Plum / Body text (#45365F) with Soft Lavender hover, zero black
 * - Navigation background: clean white (#FFFFFF) with subtle border (#E7DFF3)
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
    { id: 'home', label: labels?.home || 'Home', icon: Home },
    { id: 'games', label: labels?.games || 'Game', icon: Gamepad2 },
    { id: 'profile', label: labels?.profile || 'Profile', icon: User },
  ];

  return (
    <nav 
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E7DFF3] shadow-md select-none h-16 safe-area-bottom"
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
                  ? 'bg-[#7048E8] text-white shadow-xs font-black'
                  : 'bg-transparent text-[#45365F] hover:text-[#7048E8] hover:bg-[#F1ECFF] font-bold'
              }`}
            >
              <Icon 
                className={`w-5 h-5 shrink-0 ${
                  isSelected ? 'text-white stroke-[2.5]' : 'text-[#45365F] stroke-2'
                }`} 
              />
              <span 
                className={`text-[10px] sm:text-[11px] font-extrabold uppercase tracking-tight text-center truncate w-full mt-0.5 leading-none ${
                  isSelected ? 'font-black text-white' : 'text-[#45365F]'
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
