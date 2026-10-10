/**
 * GameON Tele - Customer Profile & Account Page
 * Redesigned with Midnight-Navy Surfaces and Deep-Teal Panels
 * Inspired directly by modern high-end mobile gaming hubs (Reference Screen 3).
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
  Tag, 
  Gamepad2, 
  Trophy, 
  CreditCard, 
  Headphones, 
  HelpCircle, 
  Settings as SettingsIcon, 
  FileText, 
  ShieldCheck, 
  ArrowLeft, 
  ChevronRight, 
  Sparkles, 
  Volume2, 
  VolumeX,
  LogOut,
  Coins,
  Star,
  CheckCircle2,
  Plus,
  History,
  Gift
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

  const coinsBalance = profile.coinsBalance ?? 1250;

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
      <div className="min-h-screen bg-[#071827] text-[#F5FAFC] pb-24 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none space-y-4 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="flex items-center justify-between gap-3 bg-[#102C40] border border-[#244558] text-white p-3.5 rounded-2xl shadow-md">
          <div className="flex items-center gap-3">
            <button
              id="my-games-back-btn"
              onClick={handleBackToMain}
              className="w-8 h-8 rounded-xl bg-[#15374A] hover:bg-[#244558] flex items-center justify-center text-[#A9C0CE] hover:text-[#35D9F2] transition-colors cursor-pointer border border-[#244558]"
              title="Go Back"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span className="sr-only">Go Back</span>
            </button>
            <h1 className="text-base font-black tracking-tight text-[#F5FAFC]">My Games</h1>
          </div>
          <span className="text-xs font-bold text-[#A9C0CE]">
            {allAvailableGames.length} Games
          </span>
        </div>

        <div className="space-y-2.5">
          {allAvailableGames.map((g) => {
            const personalHighScore = profile.highScores?.[g.id] ?? 0;
            return (
              <div
                key={g.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#102C40] border border-[#244558] hover:border-[#00BFA6]/60 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={g.thumbnailUrl || g.bannerUrl}
                    alt={g.title}
                    className="w-12 h-12 rounded-xl object-cover bg-[#0B2234] shrink-0 border border-[#244558]"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-[#F5FAFC] truncate">{g.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-[#A9C0CE] capitalize">{g.category}</span>
                      <span className="text-[10px] text-[#244558]">•</span>
                      <span className="text-[11px] font-extrabold text-[#F7C85B]">
                        Best: {personalHighScore > 0 ? `${personalHighScore.toLocaleString()} pts` : 'No score yet'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onPlayGame(g)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#00BFA6] hover:bg-[#63F5C8] active:scale-95 text-[#071827] text-xs font-black shrink-0 transition-transform cursor-pointer shadow-xs"
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
      <div className="min-h-screen bg-[#071827] text-[#F5FAFC] pb-24 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none space-y-4 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="flex items-center justify-between gap-3 bg-[#102C40] border border-[#244558] text-white p-3.5 rounded-2xl shadow-md">
          <div className="flex items-center gap-3">
            <button
              id="my-scores-back-btn"
              onClick={handleBackToMain}
              className="w-8 h-8 rounded-xl bg-[#15374A] hover:bg-[#244558] flex items-center justify-center text-[#A9C0CE] hover:text-[#35D9F2] transition-colors cursor-pointer border border-[#244558]"
              title="Go Back"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span className="sr-only">Go Back</span>
            </button>
            <h1 className="text-base font-black tracking-tight text-[#F5FAFC]">Personal Best Scores</h1>
          </div>
          <span className="text-xs font-bold text-[#A9C0CE]">
            {activeCatalogGames.length} Games
          </span>
        </div>

        <div className="rounded-2xl border border-[#244558] overflow-hidden bg-[#102C40] shadow-md divide-y divide-[#244558]">
          {activeCatalogGames.map((g) => {
            const score = profile.highScores?.[g.id] ?? 0;
            return (
              <div key={g.id} className="p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-[#F5FAFC]">
                    {g.title}
                  </div>
                  <div className="text-[10px] text-[#A9C0CE] capitalize">
                    {g.category}
                  </div>
                </div>
                <div className="text-sm font-black text-[#F7C85B] font-mono">
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
  // MAIN PROFILE VIEW (Reference Screen 3)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#071827] text-[#F5FAFC] pb-24 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 space-y-4 select-none font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 1. TOP HEADER WITH SETTINGS COG */}
      <div className="flex items-center justify-between px-1">
        <h1 className="text-lg font-black text-[#F5FAFC] tracking-tight">
          Player Profile
        </h1>
        <button
          onClick={() => openSubView('help_support')}
          className="w-9 h-9 rounded-xl bg-[#102C40] border border-[#244558] flex items-center justify-center text-[#A9C0CE] hover:text-[#35D9F2] transition-colors cursor-pointer shadow-xs"
          title="Account Settings & Support"
        >
          <SettingsIcon className="w-4.5 h-4.5 stroke-[2.2]" />
        </button>
      </div>

      {/* 2. AUTHENTICATED USER HERO CARD (Reference Screen 3) */}
      <div 
        id="profile-account-card"
        className="rounded-3xl bg-[#102C40] border border-[#244558] p-5 shadow-xl relative overflow-hidden space-y-4"
      >
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3.5">
            {/* Glowing Avatar Frame */}
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-[#0B2234] border-2 border-[#00BFA6] text-[#35D9F2] flex items-center justify-center shadow-md shadow-[#00BFA6]/20 shrink-0">
                <User className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#15374A] border border-[#244558] text-[#F7C85B] flex items-center justify-center text-[10px] font-black">
                ★
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-[#F5FAFC] leading-tight">
                  GameMaster
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#63F5C8]/15 border border-[#63F5C8]/30 text-[#63F5C8] text-[9px] font-black uppercase tracking-wider">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>Verified</span>
                </span>
              </div>
              <p className="text-xs font-mono font-bold text-[#A9C0CE] mt-0.5">
                ID: {maskedMsisdn}
              </p>
            </div>
          </div>
        </div>

        {/* User Stats Row: Level | Total Wins | Best Score */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#244558] relative z-10 text-center">
          <div className="p-2 rounded-xl bg-[#0B2234] border border-[#244558]">
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#A9C0CE] uppercase">
              <Star className="w-3 h-3 text-[#F7C85B] fill-[#F7C85B]" />
              <span>Level</span>
            </div>
            <div className="text-sm font-black text-[#F5FAFC] mt-0.5 font-mono">
              12
            </div>
          </div>

          <div className="p-2 rounded-xl bg-[#0B2234] border border-[#244558]">
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#A9C0CE] uppercase">
              <Trophy className="w-3 h-3 text-[#F7C85B]" />
              <span>Best Score</span>
            </div>
            <div className="text-sm font-black text-[#F7C85B] mt-0.5 font-mono">
              {bestScore > 0 ? bestScore.toLocaleString() : '0'}
            </div>
          </div>

          <div className="p-2 rounded-xl bg-[#0B2234] border border-[#244558]">
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#A9C0CE] uppercase">
              <Gamepad2 className="w-3 h-3 text-[#63F5C8]" />
              <span>Games</span>
            </div>
            <div className="text-sm font-black text-[#63F5C8] mt-0.5 font-mono">
              {activeCatalogGames.length}
            </div>
          </div>
        </div>

        {/* Ambient background blur */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-[#00BFA6]/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 3. WALLET / BALANCE CARD (Reference Screen 3) */}
      <div 
        id="profile-wallet-card"
        className="rounded-2xl bg-[#102C40] border border-[#244558] p-4 flex items-center justify-between shadow-md"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#0B2234] border border-[#244558] flex items-center justify-center shrink-0">
            <Coins className="w-6 h-6 text-[#F7C85B]" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-[#A9C0CE] uppercase tracking-wider block">
              My Wallet
            </span>
            <div className="text-xl font-black text-[#F5FAFC] font-mono leading-tight mt-0.5">
              {coinsBalance.toLocaleString()} <span className="text-xs font-sans text-[#F7C85B] font-bold">Coins</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenBuyCoins}
          className="px-3.5 py-2 rounded-xl bg-[#15374A] hover:bg-[#00BFA6] hover:text-[#071827] text-[#00BFA6] border border-[#00BFA6]/40 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Add Coins</span>
        </button>
      </div>

      {/* 4. PROFILE NAVIGATION MENU ITEMS (Reference Screen 3) */}
      <div className="bg-[#102C40] rounded-2xl border border-[#244558] shadow-md overflow-hidden divide-y divide-[#244558]">
        {[
          { id: 'my_games', label: 'Game History', desc: 'View your played games', icon: History, color: '#35D9F2' },
          { id: 'subscriptions', label: 'Subscription & VIP', desc: 'Check active gaming pass', icon: CreditCard, color: '#63F5C8' },
          { id: 'my_scores', label: 'My High Scores', desc: 'Personal best records', icon: Trophy, color: '#F7C85B' },
          { id: 'pricing', label: 'Pricing & Plans', desc: 'Token packages and rates', icon: Tag, color: '#00BFA6' },
          { id: 'faq', label: 'FAQ', desc: 'Frequently asked questions', icon: HelpCircle, color: '#35D9F2' },
          { id: 'help_support', label: 'Help & Support', desc: 'Customer care and assistance', icon: Headphones, color: '#63F5C8' },
          { id: 'terms', label: 'Terms & Conditions', desc: 'Terms of service', icon: FileText, color: '#A9C0CE' },
          { id: 'privacy', label: 'Privacy Policy', desc: 'Data and security standards', icon: ShieldCheck, color: '#A9C0CE' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              id={`profile-menu-item-${item.id}`}
              onClick={() => openSubView(item.id as ProfileSubView)}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#15374A] transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-9 h-9 rounded-xl bg-[#0B2234] border border-[#244558] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                  style={{ color: item.color }}
                >
                  <Icon className="w-4.5 h-4.5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-[#F5FAFC] group-hover:text-[#35D9F2] transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-[10px] text-[#A9C0CE] font-medium">
                    {item.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-[#A9C0CE] group-hover:text-[#35D9F2] group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          );
        })}
      </div>

      {/* 5. BOTTOM PROMO BANNER (Reference Screen 3) */}
      <div 
        id="profile-reward-promo"
        className="rounded-2xl bg-gradient-to-r from-[#102C40] via-[#15374A] to-[#102C40] border border-[#244558] p-4 flex items-center justify-between shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0B2234] border border-[#244558] flex items-center justify-center text-[#F7C85B] shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-[#F5FAFC] leading-tight">
              Play More Games
            </h4>
            <p className="text-[10px] text-[#A9C0CE] font-medium">
              Earn daily rewards & badges!
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => openSubView('games')}
          className="px-3.5 py-1.5 rounded-xl bg-[#F7C85B] hover:bg-[#eab308] text-[#071827] text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 flex items-center gap-1"
        >
          <span>Explore</span>
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* 6. SOUND & PREFERENCE SETTINGS */}
      <div className="p-3.5 rounded-2xl bg-[#102C40] border border-[#244558] flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          {isSoundOn ? (
            <Volume2 className="w-4 h-4 text-[#00BFA6]" />
          ) : (
            <VolumeX className="w-4 h-4 text-[#A9C0CE]" />
          )}
          <span className="text-xs font-bold text-[#F5FAFC]">Game Sound Effects</span>
        </div>
        <button
          onClick={toggleSound}
          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
            isSoundOn ? 'bg-[#00BFA6]' : 'bg-[#15374A] border border-[#244558]'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
              isSoundOn ? 'left-6' : 'left-1'
            }`}
          />
        </button>
      </div>

      {/* 7. LOG OUT ACTION */}
      {onSignOut && (
        <button
          id="profile-logout-btn"
          type="button"
          onClick={onSignOut}
          className="w-full py-3 rounded-2xl border border-[#FF796C]/30 bg-[#FF796C]/10 hover:bg-[#FF796C]/20 text-[#FF796C] font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
        >
          <LogOut className="w-4 h-4 stroke-[2.2]" />
          <span>Log Out</span>
        </button>
      )}

      {/* GameSwiper Info Footer */}
      <div className="text-center pt-2 text-[10px] text-[#A9C0CE] font-bold space-y-0.5">
        <div>GameSwiper Gaming Edition</div>
        <div>Official Gaming Portal</div>
      </div>

    </div>
  );
};
