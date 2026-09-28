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
      className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex ${isSlideFromLeft ? 'justify-start' : 'justify-end'} animate-in fade-in duration-150`}
      onClick={onClose}
    >
      <div 
        id="teleplus-main-menu-panel"
        className={`w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between animate-in ${isSlideFromLeft ? 'slide-in-from-left' : 'slide-in-from-right'} duration-200 select-none`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Drawer Header with Logo & Close Button */}
        <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <GameOnTeleLogo size="sm" />
          </div>

          <button
            id="main-menu-close-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            title="Close Menu"
            aria-label="Close Menu"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* 5 Menu Items in Exact Required Order:
            1. Language
            2. Sound
            3. FAQ
            4. Help & Support
            ----------------
            5. Log Out
        */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          
          {/* 1. Language Option */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden transition-all">
            <button
              id="menu-item-language-toggle"
              type="button"
              onClick={() => setShowLanguagePicker(!showLanguagePicker)}
              className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-[#1688C9] flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-[#17202A] leading-tight">
                    Language
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    {currentLanguageObj.nativeName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-[#1688C9] border border-blue-200">
                  {currentLanguageObj.nativeName}
                </span>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${showLanguagePicker ? 'rotate-90' : ''}`} />
              </div>
            </button>

            {/* Language Selection List: English, አማርኛ, Afaan Oromoo */}
            {showLanguagePicker && (
              <div className="border-t border-slate-100 p-2 bg-slate-50/70 space-y-1.5 animate-in slide-in-from-top-1 duration-150">
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
                          ? 'bg-[#1688C9] text-white font-black shadow-xs'
                          : 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-200/80 font-bold'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{lang.nativeName}</span>
                        {lang.nativeName !== lang.name && (
                          <span className={`text-[11px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
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
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                audioEnabled 
                  ? 'bg-emerald-50 border-emerald-100 text-[#8BCB3D]' 
                  : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}>
                {audioEnabled ? (
                  <Volume2 className="w-5 h-5 stroke-[2.2]" />
                ) : (
                  <VolumeX className="w-5 h-5 stroke-[2.2]" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-black text-[#17202A] leading-tight">
                  Sound
                </h3>
                <p className="text-xs font-semibold mt-0.5 text-slate-500">
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
                audioEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
              }`}>
                {audioEnabled ? 'ON' : 'OFF'}
              </span>
              <div className={`w-12 h-6.5 rounded-full transition-colors relative p-0.5 ${
                audioEnabled ? 'bg-[#8BCB3D]' : 'bg-slate-300'
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
            className="w-full p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 shadow-2xs flex items-center justify-between gap-3 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#17202A] group-hover:text-[#1688C9] transition-colors leading-tight">
                  FAQ
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Frequently Asked Questions
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1688C9] group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* 4. Help & Support Option */}
          <button
            id="menu-item-help-support"
            type="button"
            onClick={handleHelpClick}
            className="w-full p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 shadow-2xs flex items-center justify-between gap-3 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-[#1688C9] flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#17202A] group-hover:text-[#1688C9] transition-colors leading-tight">
                  Help & Support
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Customer Care & Assistance
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1688C9] group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* VISUAL SEPARATOR */}
          <div className="pt-2 pb-1">
            <div className="border-t border-slate-200" />
          </div>

          {/* 5. Log Out Option (FINAL item in menu) */}
          <button
            id="menu-item-logout"
            type="button"
            onClick={handleLogoutClick}
            className="w-full p-3.5 rounded-2xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 shadow-2xs flex items-center justify-between gap-3 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-rose-700 leading-tight">
                  Log Out
                </h3>
                <p className="text-xs text-rose-500 font-semibold mt-0.5">
                  {isAuthenticated ? 'End session & return to login' : 'Return to sign in'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
          </button>

        </div>

        {/* Footer info in drawer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center text-[11px] text-slate-400 font-medium">
          GameOn Tele • EthioTelecom Official Gaming
        </div>
      </div>
    </div>
  );
};
