/**
 * Mobile-First Bottom Navigation Bar for GameSwiper
 * Strict 3-Tab Architecture: Home | Game | Profile
 * - Equal-width tab containers (grid grid-cols-3), zero horizontal overflow
 * - Comfortable vertical height (h-16) + safe-area support
 * - Selected tab: Mint green accent (#63F5C8) active icon, label, and indicator line
 * - Unselected tabs: Secondary blue-gray (#A9C0CE)
 * - Navigation background: Deep navy surface (#0B2234) with subtle border (#244558)
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
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B2234]/95 backdrop-blur-md border-t border-[#244558] shadow-[0_-4px_20px_rgba(7,24,39,0.7)] select-none h-16 safe-area-bottom"
    >
      <div className="max-w-md md:max-w-xl mx-auto h-full px-2 grid grid-cols-3 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`bottom-nav-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className="group flex flex-col items-center justify-center py-1.5 px-1 transition-all duration-150 cursor-pointer w-full relative"
            >
              <Icon 
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isSelected ? 'text-[#63F5C8] stroke-[2.5]' : 'text-[#A9C0CE] group-hover:text-[#35D9F2] stroke-2'
                }`} 
              />
              <span 
                className={`text-[11px] uppercase tracking-wide text-center truncate w-full mt-1 leading-none transition-colors ${
                  isSelected ? 'font-black text-[#63F5C8]' : 'font-bold text-[#A9C0CE] group-hover:text-[#35D9F2]'
                }`}
              >
                {tab.label}
              </span>
              
              {/* Subtle mint active indicator bar */}
              <div 
                className={`w-6 h-0.5 rounded-full mt-1 transition-all duration-200 ${
                  isSelected ? 'bg-[#63F5C8] shadow-[0_0_8px_#63F5C8] scale-100 opacity-100' : 'bg-transparent scale-50 opacity-0'
                }`} 
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
};
