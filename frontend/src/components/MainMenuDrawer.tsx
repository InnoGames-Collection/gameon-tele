/**
 * GameOn Tele Official Application Menu
 * 
 * Strict Requirement:
 * The menu must contain ONLY these 5 items in this exact order:
 * 1. Language (English, አማርኛ, Afaan Oromoo - functional and visually identifiable)
 * 2. Sound (Sound ON / Sound OFF - functional toggle, visually obvious, persisted)
 * 3. FAQ (opens FAQ section)
 * 4. Help & Support (opens Help & Support section)
 * ---------------- (visual separator)
 * 5. Log Out (clears authenticated session, returns to login page, preserves all progress)
 */

import React, { useState } from 'react';
import { 
  Globe,
  Volume2, 
  VolumeX, 
  HelpCircle, 
  Headphones, 
  LogOut, 
  X, 
  ChevronRight,
  Check
} from 'lucide-react';
import { GameOnTeleLogo } from './GameOnTeleLogo';
import { LanguageCode } from '../types';

export type MainMenuSection = 
  | 'faq'
  | 'help_support'
  | 'games'
  | 'subscription'
  | 'pricing'
  | 'terms'
  | 'privacy';

export interface MainMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onOpenFAQ: () => void;
  onOpenHelpSupport: () => void;
  onSignOut: () => void;
  onSelectSection?: (section: MainMenuSection) => void;
  side?: 'left' | 'right';
  isAuthenticated?: boolean;
}

export const MainMenuDrawer: React.FC<MainMenuDrawerProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  audioEnabled,
  onToggleAudio,
  onOpenFAQ,
  onOpenHelpSupport,
  onSignOut,
  onSelectSection,
  side = 'right',
  isAuthenticated = true,
}) => {
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  if (!isOpen) return null;

  const languages: { code: LanguageCode; name: string; nativeName: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
    { code: 'om', name: 'Afaan Oromoo', nativeName: 'Afaan Oromoo' },
  ];

  const currentLanguageObj = languages.find((l) => l.code === language) || languages[0];

  const handleFAQClick = () => {
    onOpenFAQ();
    if (onSelectSection) onSelectSection('faq');
    onClose();
  };

  const handleHelpClick = () => {
    onOpenHelpSupport();
    if (onSelectSection) onSelectSection('help_support');
    onClose();
  };

  const handleLogoutClick = () => {
    onClose();
    onSignOut();
  };

  const isSlideFromLeft = side === 'left';

  return (
    <div 
      id="teleplus-main-menu-overlay"
      className={`fixed inset-0 z-50 bg-[#38205F]/60 backdrop-blur-xs flex ${isSlideFromLeft ? 'justify-start' : 'justify-end'} animate-in fade-in duration-150`}
      onClick={onClose}
    >
      <div 
        id="teleplus-main-menu-panel"
        className={`w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between animate-in ${isSlideFromLeft ? 'slide-in-from-left' : 'slide-in-from-right'} duration-200 select-none font-['Plus_Jakarta_Sans',sans-serif]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Drawer Header with Logo & Close Button */}
        <div className="p-4 bg-white border-b border-[#E7DFF3] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <GameOnTeleLogo size="sm" />
          </div>

          <button
            id="main-menu-close-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-[#E7DFF3] bg-white hover:bg-[#F1ECFF] flex items-center justify-center text-[#38205F] transition-colors cursor-pointer"
            title="Close Menu"
            aria-label="Close Menu"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* 5 Menu Items in Exact Required Order */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          
          {/* 1. Language Option */}
          <div className="rounded-2xl border border-[#E7DFF3] bg-white shadow-xs overflow-hidden transition-all">
            <button
              id="menu-item-language-toggle"
              type="button"
              onClick={() => setShowLanguagePicker(!showLanguagePicker)}
              className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-[#F1ECFF]/40 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#F1ECFF] border border-[#E7DFF3] text-[#7048E8] flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-[#38205F] leading-tight">
                    Language
                  </h3>
                  <p className="text-xs text-[#827695] font-semibold mt-0.5">
                    {currentLanguageObj.nativeName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#F1ECFF] text-[#7048E8] border border-[#E7DFF3]">
                  {currentLanguageObj.nativeName}
                </span>
                <ChevronRight className={`w-4 h-4 text-[#827695] transition-transform ${showLanguagePicker ? 'rotate-90' : ''}`} />
              </div>
            </button>

            {/* Language Selection List: English, አማርኛ, Afaan Oromoo */}
            {showLanguagePicker && (
              <div className="border-t border-[#E7DFF3] p-2 bg-[#FFF8EE]/40 space-y-1.5 animate-in slide-in-from-top-1 duration-150">
                {languages.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      id={`menu-lang-option-${lang.code}`}
                      type="button"
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setShowLanguagePicker(false);
                      }}
                      className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#7048E8] text-white font-black shadow-xs'
                          : 'bg-white text-[#45365F] hover:bg-[#F1ECFF] border border-[#E7DFF3] font-bold'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{lang.nativeName}</span>
                        {lang.nativeName !== lang.name && (
                          <span className={`text-[11px] ${isSelected ? 'text-[#F1ECFF]' : 'text-[#827695]'}`}>
                            ({lang.name})
                          </span>
                        )}
                      </div>
                      {isSelected && <Check className="w-4 h-4 stroke-[3] text-white" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Sound Option (Sound ON / Sound OFF toggle) */}
          <div className="rounded-2xl border border-[#E7DFF3] bg-white p-3.5 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                audioEnabled 
                  ? 'bg-[#F1ECFF] border-[#E7DFF3] text-[#7048E8]' 
                  : 'bg-slate-100 border-[#E7DFF3] text-[#827695]'
              }`}>
                {audioEnabled ? (
                  <Volume2 className="w-5 h-5 stroke-[2.2]" />
                ) : (
                  <VolumeX className="w-5 h-5 stroke-[2.2]" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-black text-[#38205F] leading-tight">
                  Sound
                </h3>
                <p className="text-xs font-semibold mt-0.5 text-[#827695]">
                  {audioEnabled ? 'Sound ON' : 'Sound OFF'}
                </p>
              </div>
            </div>

            <button
              id="menu-item-sound-toggle-btn"
              type="button"
              onClick={onToggleAudio}
              aria-label={audioEnabled ? 'Turn Sound OFF' : 'Turn Sound ON'}
              className="flex items-center gap-2 cursor-pointer focus:outline-none"
            >
              <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                audioEnabled ? 'bg-[#C6F36B] text-[#38205F]' : 'bg-slate-200 text-[#827695]'
              }`}>
                {audioEnabled ? 'ON' : 'OFF'}
              </span>
              <div className={`w-12 h-6.5 rounded-full transition-colors relative p-0.5 ${
                audioEnabled ? 'bg-[#7048E8]' : 'bg-slate-300'
              }`}>
                <div className={`w-5.5 h-5.5 rounded-full bg-white shadow-sm transition-transform ${
                  audioEnabled ? 'translate-x-5.5' : 'translate-x-0'
                }`} />
              </div>
            </button>
          </div>

          {/* 3. FAQ Option */}
          <button
            id="menu-item-faq"
            type="button"
            onClick={handleFAQClick}
            className="w-full p-3.5 rounded-2xl border border-[#E7DFF3] bg-white hover:bg-[#F1ECFF]/40 shadow-xs flex items-center justify-between gap-3 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#FFF8EE] border border-[#E7DFF3] text-[#7048E8] flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#38205F] group-hover:text-[#7048E8] transition-colors leading-tight">
                  FAQ
                </h3>
                <p className="text-xs text-[#827695] font-semibold mt-0.5">
                  Frequently Asked Questions
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#827695] group-hover:text-[#7048E8] group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* 4. Help & Support Option */}
          <button
            id="menu-item-help-support"
            type="button"
            onClick={handleHelpClick}
            className="w-full p-3.5 rounded-2xl border border-[#E7DFF3] bg-white hover:bg-[#F1ECFF]/40 shadow-xs flex items-center justify-between gap-3 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#F1ECFF] border border-[#E7DFF3] text-[#7048E8] flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#38205F] group-hover:text-[#7048E8] transition-colors leading-tight">
                  Help & Support
                </h3>
                <p className="text-xs text-[#827695] font-semibold mt-0.5">
                  Customer Care & Assistance
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#827695] group-hover:text-[#7048E8] group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* VISUAL SEPARATOR */}
          <div className="pt-2 pb-1">
            <div className="border-t border-[#E7DFF3]" />
          </div>

          {/* 5. Log Out Option (FINAL item in menu) */}
          <button
            id="menu-item-logout"
            type="button"
            onClick={handleLogoutClick}
            className="w-full p-3.5 rounded-2xl border border-[#FF6B6B]/30 bg-[#FFF5F5] hover:bg-[#ffebeb] shadow-xs flex items-center justify-between gap-3 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#FF6B6B]/30 text-[#FF6B6B] flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#FF6B6B] leading-tight">
                  Log Out
                </h3>
                <p className="text-xs text-[#827695] font-semibold mt-0.5">
                  {isAuthenticated ? 'End session & return to login' : 'Return to sign in'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#FF6B6B] group-hover:translate-x-0.5 transition-all" />
          </button>

        </div>

        {/* Footer info in drawer */}
        <div className="p-4 border-t border-[#E7DFF3] bg-[#FFF8EE]/40 text-center text-[11px] text-[#827695] font-medium">
          GameSwiper • EthioTelecom Official Gaming
        </div>
      </div>
    </div>
  );
};
