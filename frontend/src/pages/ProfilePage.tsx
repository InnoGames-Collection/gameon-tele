/**
 * GameON Tele - Customer Profile & Account Page
 * 
 * Compliant with GameON Tele guidelines:
 * - NO customer login screen: User is pre-authenticated by telebirr SuperApp
 * - telebirr Identity: MSISDN, telebirr balance, GameON coin balance
 * - In-app Coin Topup & All-Access Subscription Management
 * - Game History & Personal High Scores
 * - Clean, responsive UI with zero shortcode dependencies
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  UserProfile, 
  GameDefinition, 
  EnergyTransaction, 
  ClaimableReward,
  LanguageCode 
} from '../types';
import { 
  User, 
  Phone, 
  Tag, 
  Gamepad2, 
  Trophy, 
  Gift, 
  Crown, 
  CreditCard, 
  Headphones, 
  HelpCircle, 
  Settings as SettingsIcon, 
  Info, 
  FileText, 
  ShieldCheck, 
  ArrowLeft, 
  ChevronRight, 
  Sparkles, 
  Volume2, 
  VolumeX,
  LogOut
} from 'lucide-react';
import { GamesContentPage } from './content/GamesContentPage';
import { PricingPage } from './content/PricingPage';
import { FAQPage } from './content/FAQPage';
import { HelpSupportPage } from './content/HelpSupportPage';
import { SubscriptionPage } from './content/SubscriptionPage';
import { TermsPage } from './content/TermsPage';
import { PrivacyPage } from './content/PrivacyPage';
import { EntitlementService } from '../services/entitlementService';
import { GameCatalog } from '../services/gameCatalog';
import { catalogGameToDefinition } from '../games/registry';

export type ProfileSubView =
  | null
  | 'games'
  | 'pricing'
  | 'my_games'
  | 'my_scores'
  | 'my_rewards'
  | 'my_rank'
  | 'subscriptions'
  | 'help_support'
  | 'faq'
  | 'settings'
  | 'about'
  | 'terms'
  | 'privacy';

interface ProfilePageProps {
  profile: UserProfile;
  games: GameDefinition[];
  energyTransactions?: EnergyTransaction[];
  claimableRewards?: ClaimableReward[];
  language?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
  onOpenEnergyModal?: () => void;
  onOpenSubscriptionModal?: () => void;
  onOpenAuthModal?: () => void;
  onPlayGame: (game: GameDefinition) => void;
  onClaimReward?: (rewardId: string) => void;
  audioEnabled?: boolean;
  onToggleAudio?: () => void;
  onSignOut?: () => void;
  onOpenBuyCoins?: () => void;
  onProfileUpdate?: (updated: UserProfile) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  games,
  language = 'en',
  onLanguageChange,
  onPlayGame,
  onOpenBuyCoins,
  onProfileUpdate,
  audioEnabled,
  onToggleAudio,
  onSignOut,
}) => {
  const [subView, setSubView] = useState<ProfileSubView>(null);
  const [localSound, setLocalSound] = useState(true);
  const isSoundOn = audioEnabled !== undefined ? audioEnabled : localSound;
  const toggleSound = onToggleAudio || (() => setLocalSound((prev) => !prev));

  // Popstate listener for mobile browser back navigation
  useEffect(() => {
    const handlePopState = () => {
      if (subView !== null) {
        setSubView(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [subView]);

  const openSubView = (view: ProfileSubView) => {
    window.history.pushState({ profileSubView: view }, '');
    setSubView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToMain = () => {
    setSubView(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const phone = profile.phoneNumber || '0911234890';
  const maskedMsisdn = `${phone.slice(0, 3)}*****${phone.slice(-3)}`;

  // Real highest valid competitive game score from existing system
  const bestScore = useMemo(() => {
    const scores = Object.values(profile.highScores || {}) as number[];
    return scores.length > 0 ? Math.max(...scores) : 0;
  }, [profile]);

  // Active catalog games (16 standard games in exact order)
  const activeCatalogGames = useMemo(() => {
    return GameCatalog.getAll().map(catalogGameToDefinition);
  }, []);

  // Sync latest verified scores from backend
  useEffect(() => {
    if (profile.phoneNumber) {
      fetch(`/api/scores/player/${profile.phoneNumber}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.scores && onProfileUpdate) {
            onProfileUpdate({
              ...profile,
              highScores: {
                ...(profile.highScores || {}),
                ...data.scores,
              },
            });
          }
        })
        .catch((err) => console.warn('[ProfilePage] Failed to fetch server scores:', err));
    }
  }, [profile.phoneNumber]);

  // Played or unlocked games
  const recentlyPlayedIds = EntitlementService.getRecentlyPlayedIds();
  const myGamesList = GameCatalog.getRecentlyPlayed(recentlyPlayedIds).map(catalogGameToDefinition);

  // Active subscriptions count
  const activeSubsCount = EntitlementService.getActiveSubscriptionsList().length;

  // Subview rendering
  if (subView === 'subscriptions') {
    return (
      <SubscriptionPage
        onBack={handleBackToMain}
        profile={profile}
        onProfileUpdate={onProfileUpdate}
      />
    );
  }

  if (subView === 'pricing') {
    return (
      <PricingPage
        onBack={handleBackToMain}
      />
    );
  }

  if (subView === 'games') {
    return (
      <GamesContentPage
        onBack={handleBackToMain}
        onPlayGame={onPlayGame}
      />
    );
  }

  if (subView === 'terms') {
    return <TermsPage onBack={handleBackToMain} />;
  }

  if (subView === 'privacy') {
    return <PrivacyPage onBack={handleBackToMain} />;
  }

  if (subView === 'faq') {
    return <FAQPage onBack={handleBackToMain} />;
  }

  if (subView === 'help_support') {
    return <HelpSupportPage onBack={handleBackToMain} />;
  }

  if (subView === 'my_games') {
    const allAvailableGames = activeCatalogGames;

    return (
      <div className="min-h-screen bg-[#FFF8EE]/50 text-[#38205F] pb-24 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none space-y-4">
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#7048E8] to-[#38205F] text-white p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            <button
              id="my-games-back-btn"
              onClick={handleBackToMain}
              className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
              title="Go Back"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span className="sr-only">Go Back</span>
            </button>
            <h1 className="text-base font-black tracking-tight">My Games</h1>
          </div>
          <span className="text-xs font-bold text-[#F1ECFF]">
            {allAvailableGames.length} Games
          </span>
        </div>

        <div className="space-y-2.5">
          {allAvailableGames.map((g) => {
            const personalHighScore = profile.highScores?.[g.id] ?? 0;
            return (
              <div
                key={g.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E7DFF3] hover:border-[#7048E8] transition-all shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={g.thumbnailUrl || g.bannerUrl}
                    alt={g.title}
                    className="w-12 h-12 rounded-xl object-cover bg-[#F1ECFF] shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-[#38205F] truncate">{g.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-[#827695] capitalize">{g.category}</span>
                      <span className="text-[10px] text-[#E7DFF3]">•</span>
                      <span className="text-[11px] font-extrabold text-[#7048E8]">
                        Best: {personalHighScore > 0 ? `${personalHighScore.toLocaleString()} pts` : 'No score yet'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onPlayGame(g)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#7048E8] hover:bg-[#5f3dc4] active:scale-95 text-white text-xs font-black shrink-0 transition-transform cursor-pointer shadow-xs"
                >
                  Play
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (subView === 'my_scores') {
    return (
      <div className="min-h-screen bg-[#FFF8EE]/50 text-[#38205F] pb-24 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none space-y-4">
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#7048E8] to-[#38205F] text-white p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            <button
              id="my-scores-back-btn"
              onClick={handleBackToMain}
              className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
              title="Go Back"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span className="sr-only">Go Back</span>
            </button>
            <h1 className="text-base font-black tracking-tight">Personal Best Scores</h1>
          </div>
          <span className="text-xs font-bold text-[#F1ECFF]">
            {activeCatalogGames.length} Games
          </span>
        </div>

        <div className="rounded-2xl border border-[#E7DFF3] overflow-hidden bg-white shadow-2xs divide-y divide-[#E7DFF3]/60">
          {activeCatalogGames.map((g) => {
            const score = profile.highScores?.[g.id] ?? 0;
            return (
              <div key={g.id} className="p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-[#38205F]">
                    {g.title}
                  </div>
                  <div className="text-[10px] text-[#827695] capitalize">
                    {g.category}
                  </div>
                </div>
                <div className="text-sm font-black text-[#7048E8] font-mono">
                  {score > 0 ? `${score.toLocaleString()} pts` : 'No score yet'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN PROFILE VIEW (Clean GameSwiper Gaming Portal Design)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#FFF8EE]/50 text-[#38205F] pb-24 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 space-y-4 select-none">
      
      {/* 1. TOP: Authenticated Account Card */}
      <div 
        id="profile-account-card"
        className="rounded-3xl bg-gradient-to-r from-[#7048E8] to-[#38205F] text-white p-4.5 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center shadow-xs shrink-0 border border-white/20">
              <User className="w-6 h-6 text-white stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-[#C6F36B] text-[#38205F] text-[9px] font-black uppercase tracking-wider">
                  VERIFIED ACCOUNT
                </span>
              </div>
              <div className="text-base font-black font-mono tracking-wider text-white mt-0.5">
                {maskedMsisdn}
              </div>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-white/15 text-white text-[11px] font-bold border border-white/20">
            Daily Player
          </div>
        </div>
      </div>

      {/* 2. STATS: BEST SCORE SUMMARY CARD */}
      <div 
        id="profile-stat-best-score"
        onClick={() => openSubView('my_scores')}
        className="bg-white rounded-2xl p-4 border border-[#E7DFF3] shadow-2xs hover:border-[#7048E8]/50 transition-all cursor-pointer flex items-center justify-between"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#F1ECFF] border border-[#E7DFF3] flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-[#7048E8]" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-[#827695] tracking-wider uppercase block">
              Top Personal Best
            </span>
            <div className="text-xl sm:text-2xl font-black text-[#38205F] font-mono flex items-baseline gap-1 mt-0.5">
              <span>{bestScore > 0 ? bestScore.toLocaleString() : 'No score yet'}</span>
              {bestScore > 0 && <span className="text-xs font-bold text-[#827695] font-sans">pts</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#7048E8]">
          <span>View Scores</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* 3. PERSONAL BEST SCORES UNDER EACH GAME */}
      <div className="bg-white rounded-3xl p-4.5 border border-[#E7DFF3] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#7048E8]" />
            <h3 className="text-sm font-black text-[#38205F] tracking-tight">
              Personal Best Scores
            </h3>
          </div>
          <span className="text-[11px] font-bold text-[#827695]">
            {activeCatalogGames.length} Games
          </span>
        </div>

        <div className="divide-y divide-[#E7DFF3]/60">
          {activeCatalogGames.map((g) => {
            const personalHighScore = profile.highScores?.[g.id] ?? 0;
            return (
              <div key={g.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={g.thumbnailUrl || g.bannerUrl}
                    alt={g.title}
                    className="w-10 h-10 rounded-xl object-cover bg-[#F1ECFF] shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-black text-[#38205F] truncate">
                      {g.title}
                    </h4>
                    <p className="text-[11px] font-semibold text-[#827695]">
                      Personal Best:{' '}
                      {personalHighScore > 0 ? (
                        <span className="font-extrabold text-[#7048E8] font-mono">
                          {personalHighScore.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-[#827695]/70">No score yet</span>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onPlayGame(g)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#7048E8] hover:bg-[#5f3dc4] active:scale-95 text-white text-xs font-black shrink-0 transition-transform cursor-pointer shadow-xs"
                >
                  Play
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. PROFILE MENU ITEMS */}
      <div className="bg-white rounded-2xl border border-[#E7DFF3] shadow-2xs overflow-hidden divide-y divide-[#E7DFF3]/60">
        {[
          { id: 'subscriptions', label: 'Subscription', icon: CreditCard },
          { id: 'pricing', label: 'Pricing', icon: Tag },
          { id: 'my_games', label: 'My Games', icon: Gamepad2 },
          { id: 'my_scores', label: 'My High Scores', icon: Trophy },
          { id: 'faq', label: 'FAQ', icon: HelpCircle },
          { id: 'help_support', label: 'Help & Support', icon: Headphones },
          { id: 'terms', label: 'Terms & Conditions', icon: FileText },
          { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              id={`profile-menu-item-${item.id}`}
              onClick={() => openSubView(item.id as ProfileSubView)}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F1ECFF]/40 transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#F1ECFF] text-[#7048E8] flex items-center justify-center group-hover:bg-[#7048E8] group-hover:text-white transition-colors">
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-xs sm:text-sm font-black text-[#38205F] group-hover:text-[#7048E8] transition-colors">
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-[#827695] group-hover:text-[#7048E8] transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Sound & Preference Settings */}
      <div className="p-3.5 rounded-2xl bg-white border border-[#E7DFF3] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {isSoundOn ? (
            <Volume2 className="w-4 h-4 text-[#7048E8]" />
          ) : (
            <VolumeX className="w-4 h-4 text-[#827695]" />
          )}
          <span className="text-xs font-bold text-[#38205F]">Game Sound Effects</span>
        </div>
        <button
          onClick={toggleSound}
          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
            isSoundOn ? 'bg-[#7048E8]' : 'bg-slate-200'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
              isSoundOn ? 'left-6' : 'left-1'
            }`}
          />
        </button>
      </div>

      {/* Log Out Action */}
      {onSignOut && (
        <button
          id="profile-logout-btn"
          type="button"
          onClick={onSignOut}
          className="w-full py-3.5 rounded-2xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100/80 text-rose-700 font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
        >
          <LogOut className="w-4 h-4 stroke-[2.2]" />
          <span>Log Out</span>
        </button>
      )}

      {/* GameSwiper Info */}
      <div className="text-center pt-2 text-[10px] text-[#827695] font-bold space-y-0.5">
        <div>GameSwiper Gaming Edition</div>
        <div>Official Gaming Portal</div>
      </div>

    </div>
  );
};
