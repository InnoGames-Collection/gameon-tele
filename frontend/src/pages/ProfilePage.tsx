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
import { TournamentService } from '../services/tournamentService';

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
    const maxProfileScore = scores.length > 0 ? Math.max(...scores) : 0;
    const tournamentSummary = TournamentService.getTournamentSummary(profile);
    const tournamentBest = tournamentSummary.currentUserBestScore || 0;
    return Math.max(maxProfileScore, tournamentBest);
  }, [profile]);

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
    const allAvailableGames = games && games.length > 0 ? games : GameCatalog.getAll().map(catalogGameToDefinition);

    return (
      <div className="min-h-screen bg-white text-[#17202A] pb-24 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none space-y-4">
        <div className="flex items-center justify-between gap-3 bg-[#1688C9] text-white p-3.5 rounded-2xl shadow-xs">
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
          <span className="text-xs font-bold text-blue-100">
            {allAvailableGames.length} Games
          </span>
        </div>

        <div className="space-y-2.5">
          {allAvailableGames.map((g) => {
            const personalHighScore = profile.highScores?.[g.id] ?? 0;
            return (
              <div
                key={g.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 hover:border-[#1688C9] transition-all shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={g.thumbnailUrl || g.bannerUrl}
                    alt={g.title}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-900 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-[#17202A] truncate">{g.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-500 capitalize">{g.category}</span>
                      <span className="text-[10px] text-slate-300">•</span>
                      <span className="text-[11px] font-extrabold text-[#1688C9]">
                        Best: {personalHighScore > 0 ? `${personalHighScore.toLocaleString()} pts` : '-'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onPlayGame(g)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#8BCB3D] hover:bg-[#7cb934] active:scale-95 text-white text-xs font-black shrink-0 transition-transform cursor-pointer shadow-xs"
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
    const scoreItems = (() => {
      const allCatalog = GameCatalog.getAll();
      const userScores = profile.highScores || {};
      const scoredIds = Object.keys(userScores);

      if (scoredIds.length > 0) {
        return scoredIds.map((gameId) => {
          const catalogGame = GameCatalog.getById(gameId);
          return {
            id: gameId,
            name: catalogGame?.gameName || gameId,
            category: catalogGame?.category || 'Standard Game',
            score: userScores[gameId] || 0,
          };
        }).sort((a, b) => b.score - a.score);
      }

      return allCatalog.map((g) => ({
        id: g.gameId,
        name: g.gameName,
        category: g.category,
        score: userScores[g.gameId] || 0,
      }));
    })();

    return (
      <div className="min-h-screen bg-white text-[#17202A] pb-24 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none space-y-4">
        <div className="flex items-center justify-between gap-3 bg-[#1688C9] text-white p-3.5 rounded-2xl shadow-xs">
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
            <h1 className="text-base font-black tracking-tight">My Scores</h1>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs divide-y divide-slate-100">
          {scoreItems.map((entry) => (
            <div key={entry.id} className="p-3.5 flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-[#17202A]">
                  {entry.name}
                </div>
                <div className="text-[10px] text-slate-400 capitalize">
                  {entry.category}
                </div>
              </div>
              <div className="text-sm font-black text-[#1688C9] font-mono">
                {entry.score.toLocaleString()} pts
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN PROFILE VIEW (Exactly ONE GameOn Tele Logo in top Header)
  // =========================================================================
  return (
    <div className="min-h-screen bg-white text-[#17202A] pb-24 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 space-y-4 select-none">
      
      {/* 1. TOP: Authenticated Account Card (with User Avatar - exactly ONE visible GameOn Tele logo in top Header) */}
      <div 
        id="profile-account-card"
        className="rounded-3xl bg-[#1688C9] text-white p-4.5 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center shadow-xs shrink-0">
              <User className="w-6 h-6 text-white stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-[#8BCB3D] text-white text-[9px] font-black uppercase tracking-wider">
                  VERIFIED ACCOUNT
                </span>
              </div>
              <div className="text-base font-black font-mono tracking-wider text-white mt-0.5">
                {maskedMsisdn}
              </div>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-white/15 text-white text-[11px] font-bold">
            Daily Player
          </div>
        </div>
      </div>

      {/* 2. STATS: BEST SCORE CARD (Coin system completely removed per final spec) */}
      <div 
        id="profile-stat-best-score"
        onClick={() => openSubView('my_scores')}
        className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-[#1688C9]/50 transition-all cursor-pointer flex items-center justify-between"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-[#1688C9]" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 tracking-wider uppercase block">
              Personal Best Score
            </span>
            <div className="text-xl sm:text-2xl font-black text-[#17202A] font-mono flex items-baseline gap-1 mt-0.5">
              <span>{bestScore.toLocaleString()}</span>
              <span className="text-xs font-bold text-slate-400 font-sans">pts</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1688C9]">
          <span>View Scores</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* 3. PROFILE MENU ITEMS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden divide-y divide-slate-100">
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
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1688C9] flex items-center justify-center group-hover:bg-[#1688C9] group-hover:text-white transition-colors">
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-xs sm:text-sm font-black text-[#17202A] group-hover:text-[#1688C9] transition-colors">
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1688C9] transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Sound & Preference Settings */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {isSoundOn ? (
            <Volume2 className="w-4 h-4 text-[#1688C9]" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
          <span className="text-xs font-bold text-slate-700">Game Sound Effects</span>
        </div>
        <button
          onClick={toggleSound}
          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
            isSoundOn ? 'bg-[#8BCB3D]' : 'bg-slate-300'
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

      {/* GameOn Tele Info */}
      <div className="text-center pt-2 text-[10px] text-slate-400 font-bold space-y-0.5">
        <div>GameOn Tele Gaming Edition</div>
        <div>Official Gaming Portal</div>
      </div>

    </div>
  );
};
