/**
 * GameSwiper - Game Access & Entitlement Modal
 * Authoritative subscriber access gate for skill-based games.
 */

import React from 'react';
import { CatalogGame } from '../services/gameCatalog';
import { UserProfile } from '../types';
import { GameEntitlement } from '../services/entitlementService';
import { 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  Play,
  Send
} from 'lucide-react';

interface GameAccessModalProps {
  game: CatalogGame | null;
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onAuthorizedPlay?: (game: CatalogGame, entitlement?: GameEntitlement) => void;
  onAccessGranted?: (profile: UserProfile, game: any) => void;
  onProfileUpdate?: (updated: UserProfile) => void;
}

export const GameAccessModal: React.FC<GameAccessModalProps> = ({
  game,
  profile,
  isOpen,
  onClose,
  onAuthorizedPlay,
  onAccessGranted,
}) => {
  if (!isOpen || !game) return null;

  const handleLaunch = () => {
    if (onAccessGranted) {
      onAccessGranted(profile, game);
    } else if (onAuthorizedPlay) {
      onAuthorizedPlay(game);
    }
    onClose();
  };

  const handleSubscribeSms = () => {
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const separator = isIOS ? '&' : '?';
    window.location.href = `sms:7198${separator}body=OK`;
  };

  const isSubscribed = Boolean(profile.subscription?.isActive);

  // If user is already subscribed or game is free, launch immediately
  if (isSubscribed || game.isFree || game.accessType === 'FREE' || !game.requiresCoins) {
    handleLaunch();
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#071827]/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 select-none">
      <div 
        className="w-full max-w-md bg-[#102C40] rounded-t-3xl sm:rounded-3xl border border-[#244558] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Artwork Banner */}
        <div className="relative h-44 w-full bg-[#0B2234] shrink-0 overflow-hidden">
          <img 
            src={game.banner || game.thumbnail} 
            alt={game.gameName}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#102C40] via-[#102C40]/40 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#071827]/80 hover:bg-[#071827] text-[#F5FAFC] flex items-center justify-center transition-colors cursor-pointer z-10 border border-[#244558]"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-[#00BFA6] text-[#071827] text-[10px] font-black uppercase tracking-wider">
              {game.category}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#15374A] text-[#F7C85B] text-[9.5px] font-bold border border-[#244558]">
              ★ {game.rating}
            </span>
          </div>

          {/* Title & Tagline */}
          <div className="absolute bottom-3 left-4 right-4 text-[#F5FAFC]">
            <h3 className="text-xl font-black leading-tight drop-shadow-sm">
              {game.gameName}
            </h3>
            <p className="text-xs text-[#A9C0CE] line-clamp-1 mt-0.5">
              {game.tagline}
            </p>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          <div className="p-4 rounded-2xl bg-[#0B2234] border border-[#244558] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#63F5C8] uppercase tracking-wider">
                DAILY PASS
              </span>
              <span className="text-xs font-bold text-[#A9C0CE]">
                2 Birr/day
              </span>
            </div>
            <p className="text-xs text-[#A9C0CE] leading-relaxed">
              Unlock unlimited instant access to all skill-based games with no interruptions.
            </p>
            <div className="space-y-1.5 text-xs text-[#A9C0CE]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#63F5C8] shrink-0" />
                <span>Unlimited plays across all games</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#63F5C8] shrink-0" />
                <span>Personal high scores & leaderboard ranking</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubscribeSms}
            className="w-full py-3.5 rounded-2xl bg-[#00BFA6] hover:bg-[#63F5C8] text-[#071827] font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98"
          >
            <Send className="w-4 h-4" />
            <span>Subscribe via SMS (Send OK to 7198)</span>
          </button>

          <button
            type="button"
            onClick={handleLaunch}
            className="w-full py-2.5 rounded-xl bg-[#15374A] hover:bg-[#244558] text-[#A9C0CE] font-bold text-xs uppercase transition-colors cursor-pointer text-center"
          >
            Play Now
          </button>
        </div>
      </div>
    </div>
  );
};
