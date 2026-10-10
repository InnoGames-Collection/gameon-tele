/**
 * TelePlus - Official EthioTelecom Gaming Portal
 * Main Application Orchestrator
 */

import React, { useState, useEffect } from 'react';
import { usePortalState } from './hooks/usePortalState';
import { GameRegistry } from './games/registry';
import { GameDefinition } from './types';
import { EntitlementService } from './services/entitlementService';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { NotificationToast } from './components/NotificationToast';
import { GameSwiperLogo } from './components/GameOnTeleLogo';

// Modals
import { GameLauncherModal } from './components/GameLauncherModal';
import { GameAccessModal } from './components/GameAccessModal';
import { CoinTopupModal } from './components/CoinTopupModal';
import { GameDetailsModal } from './components/GameDetailsModal';
import { TermsAndPrivacyModal } from './components/TermsAndPrivacyModal';
import { MainMenuDrawer, MainMenuSection } from './components/MainMenuDrawer';

// Pages
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { GamesPage } from './pages/GamesPage';
import { ProfilePage } from './pages/ProfilePage';
import { GamesContentPage } from './pages/content/GamesContentPage';
import { FAQPage } from './pages/content/FAQPage';
import { HelpSupportPage } from './pages/content/HelpSupportPage';
import { SubscriptionPage } from './pages/content/SubscriptionPage';
import { PricingPage } from './pages/content/PricingPage';
import { TermsPage } from './pages/content/TermsPage';
import { PrivacyPage } from './pages/content/PrivacyPage';

export default function App() {
  const {
    activeTab,
    setActiveTab,
    profile,
    setProfile,
    language,
    changeLanguage,
    t,
    // Game Launcher State
    activeGameToLaunch,
    launchGame,
    closeGameLauncher,
    handleGameFinished,
    lastGameSessionResult,
    // Modals
    isLegalModalOpen,
    setIsLegalModalOpen,
    legalModalTab,
    openLegalModal,
    // Actions
    resetDemoState,
    wipeAccountData,
    signOut,
    // Settings & Toasts
    audioEnabled,
    toggleAudio,
    toasts,
    showToast,
    dismissToast,
  } = usePortalState();

  const [isAppLaunching, setIsAppLaunching] = useState(true);
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const [contentView, setContentView] = useState<MainMenuSection | null>(null);

  // Game Access & Modals State
  const [pendingAccessGame, setPendingAccessGame] = useState<GameDefinition | null>(null);
  const [isCoinTopupOpen, setIsCoinTopupOpen] = useState(false);
  const [selectedGameForDetails, setSelectedGameForDetails] = useState<GameDefinition | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All Games');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLaunching(false);
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  // Handle browser back button when a content page is open
  useEffect(() => {
    const handlePopState = () => {
      if (contentView !== null) {
        setContentView(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [contentView]);

  const navigateToContentSection = (section: MainMenuSection) => {
    window.history.pushState({ contentView: section }, '');
    setContentView(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromContent = () => {
    setContentView(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const allGames = GameRegistry.getAllGames();

  // Active access map for all games
  const activeEntitlements = allGames.reduce((acc, g) => {
    acc[g.id] = EntitlementService.checkAccess(g.id, profile).hasAccess;
    return acc;
  }, {} as Record<string, boolean>);

  const handlePlayGame = (game: GameDefinition) => {
    const accessCheck = EntitlementService.checkAccess(game.id, profile);
    if (accessCheck.hasAccess) {
      EntitlementService.recordGamePlayed(game.id);
      launchGame(game);
    } else {
      setPendingAccessGame(game);
    }
  };

  const handleAccessGranted = (updatedProfile: typeof profile, gameToPlay: GameDefinition) => {
    setProfile(updatedProfile);
    setPendingAccessGame(null);
    EntitlementService.recordGamePlayed(gameToPlay.id);
    launchGame(gameToPlay);
  };

  // Splash Screen
  if (isAppLaunching) {
    return (
      <div className="fixed inset-0 z-50 bg-[#071827] text-[#F5FAFC] flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-200">
        <div className="p-3.5 mb-4 flex items-center justify-center">
          <GameSwiperLogo size="lg" />
        </div>
        <p className="text-xs text-[#A9C0CE] mt-1 font-bold tracking-wide uppercase">Gaming Portal</p>
        <div className="mt-6 flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00BFA6] animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2.5 h-2.5 rounded-full bg-[#63F5C8] animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2.5 h-2.5 rounded-full bg-[#35D9F2] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  // ============================================================
  // UNREGISTERED / NOT SIGNED IN STATE: RENDER LOGIN PAGE
  // ============================================================
  if (!profile.isRegistered) {
    return (
      <div className="min-h-screen bg-[#071827] text-[#F5FAFC] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
        {/* If FAQ or Help & Support is navigated to from Login Page */}
        {contentView === 'faq' && (
          <div className="py-2">
            <FAQPage onBack={handleBackFromContent} showHeader={true} />
          </div>
        )}

        {contentView === 'help_support' && (
          <div className="py-2">
            <HelpSupportPage onBack={handleBackFromContent} showHeader={true} />
          </div>
        )}

        {contentView === null && (
          <LoginPage
            onLoginSuccess={(updatedProfile) => {
              setProfile(updatedProfile);
            }}
            onOpenMenu={() => setIsMainMenuOpen(true)}
            showToast={showToast}
          />
        )}

        {/* Login Page Menu (Top Right button origin) - Strictly 5 items */}
        <MainMenuDrawer
          isOpen={isMainMenuOpen}
          onClose={() => setIsMainMenuOpen(false)}
          language={language}
          onLanguageChange={changeLanguage}
          audioEnabled={audioEnabled}
          onToggleAudio={toggleAudio}
          onOpenFAQ={() => navigateToContentSection('faq')}
          onOpenHelpSupport={() => navigateToContentSection('help_support')}
          onSignOut={() => {
            signOut();
          }}
          side="right"
          isAuthenticated={false}
        />

        <NotificationToast toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  // ============================================================
  // POST-LOGIN AUTHENTICATED APPLICATION
  // ============================================================
  return (
    <div className="min-h-screen bg-[#071827] text-[#F5FAFC] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#00BFA6] selection:text-[#071827]">
      
      {/* 1. Global Post-Login Header: Menu on TOP LEFT, TelePlus branding */}
      <Header
        profile={profile}
        onOpenBuyCoins={() => setIsCoinTopupOpen(true)}
        onOpenMenu={() => setIsMainMenuOpen(true)}
      />

      {/* 2. Main Dynamic Content Area */}
      <main className="flex-1 w-full">
        {/* Content Pages from Main Menu */}
        {contentView === 'games' && (
          <div className="py-2">
            <GamesContentPage
              games={allGames}
              profile={profile}
              onLaunchGame={handlePlayGame}
              onBack={handleBackFromContent}
              showHeader={true}
            />
          </div>
        )}

        {contentView === 'faq' && (
          <div className="py-2">
            <FAQPage
              onBack={handleBackFromContent}
              showHeader={true}
            />
          </div>
        )}

        {contentView === 'help_support' && (
          <div className="py-2">
            <HelpSupportPage
              onBack={handleBackFromContent}
              showHeader={true}
            />
          </div>
        )}

        {contentView === 'subscription' && (
          <div className="py-2">
            <SubscriptionPage
              onBack={handleBackFromContent}
              showHeader={true}
              profile={profile}
              onProfileUpdate={setProfile}
            />
          </div>
        )}

        {contentView === 'pricing' && (
          <div className="py-2">
            <PricingPage
              onBack={handleBackFromContent}
              showHeader={true}
              onBuyCoins={() => setIsCoinTopupOpen(true)}
            />
          </div>
        )}

        {contentView === 'terms' && (
          <div className="py-2">
            <TermsPage
              onBack={handleBackFromContent}
              showHeader={true}
            />
          </div>
        )}

        {contentView === 'privacy' && (
          <div className="py-2">
            <PrivacyPage
              onBack={handleBackFromContent}
              showHeader={true}
            />
          </div>
        )}

        {/* Tab Views (Active when no top-level content view is open) */}
        {contentView === null && (
          <>
            {activeTab === 'home' && (
              <HomePage
                games={allGames}
                profile={profile}
                onLaunchGame={handlePlayGame}
                onOpenDetails={(g) => setSelectedGameForDetails(g)}
                onOpenBuyCoins={() => setIsCoinTopupOpen(true)}
                onNavigateToGames={(category) => {
                  setSelectedCategoryFilter(category || 'All Games');
                  setActiveTab('games');
                }}
                activeEntitlements={activeEntitlements}
              />
            )}

            {activeTab === 'games' && (
              <GamesPage
                games={allGames}
                profile={profile}
                onLaunchGame={handlePlayGame}
                initialCategory={selectedCategoryFilter}
                activeEntitlements={activeEntitlements}
              />
            )}

            {activeTab === 'profile' && (
              <ProfilePage
                profile={profile}
                games={allGames}
                language={language}
                onLanguageChange={changeLanguage}
                onPlayGame={handlePlayGame}
                onOpenBuyCoins={() => setIsCoinTopupOpen(true)}
                onProfileUpdate={setProfile}
                audioEnabled={audioEnabled}
                onToggleAudio={toggleAudio}
                onSignOut={() => {
                  signOut();
                }}
              />
            )}
          </>
        )}
      </main>

      {/* 3. Post-Login Main Menu Drawer (Slide from left matching TOP LEFT button) */}
      <MainMenuDrawer
        isOpen={isMainMenuOpen}
        onClose={() => setIsMainMenuOpen(false)}
        language={language}
        onLanguageChange={changeLanguage}
        audioEnabled={audioEnabled}
        onToggleAudio={toggleAudio}
        onOpenFAQ={() => navigateToContentSection('faq')}
        onOpenHelpSupport={() => navigateToContentSection('help_support')}
        onSignOut={() => {
          signOut();
        }}
        side="left"
        isAuthenticated={true}
      />

      {/* 4. Mobile-First Bottom Navigation Bar (3 Tabs: Home, Games, Profile) */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        labels={{
          home: 'HOME',
          games: 'GAME',
          profile: 'PROFILE',
        }}
      />

      {/* 5. Game Access & Entitlement Modal */}
      {pendingAccessGame && (
        <GameAccessModal
          game={pendingAccessGame}
          profile={profile}
          isOpen={Boolean(pendingAccessGame)}
          onClose={() => setPendingAccessGame(null)}
          onAccessGranted={handleAccessGranted}
          onOpenTopup={() => setIsCoinTopupOpen(true)}
        />
      )}

      {/* 6. Coin Topup Modal */}
      <CoinTopupModal
        isOpen={isCoinTopupOpen}
        onClose={() => setIsCoinTopupOpen(false)}
        profile={profile}
        onProfileUpdate={setProfile}
      />

      {/* 7. Game Details Modal */}
      {selectedGameForDetails && (
        <GameDetailsModal
          game={selectedGameForDetails}
          isOpen={Boolean(selectedGameForDetails)}
          onClose={() => setSelectedGameForDetails(null)}
          onPlayGame={handlePlayGame}
          hasActiveAccess={Boolean(activeEntitlements[selectedGameForDetails.id])}
        />
      )}

      {/* 8. Fullscreen Game Launcher / Active Game Session Modal */}
      {activeGameToLaunch && (
        <GameLauncherModal
          game={activeGameToLaunch}
          profile={profile}
          lastResult={lastGameSessionResult}
          onClose={closeGameLauncher}
          onGameOver={handleGameFinished}
          onPlayAgain={() => {
            const currentGame = activeGameToLaunch;
            closeGameLauncher();
            setTimeout(() => handlePlayGame(currentGame), 100);
          }}
          isAudioEnabled={audioEnabled}
        />
      )}

      {/* 9. Legal, Terms & Privacy Modal */}
      {isLegalModalOpen && (
        <TermsAndPrivacyModal
          initialTab={legalModalTab}
          onClose={() => setIsLegalModalOpen(false)}
          onConfirmDeleteAccount={wipeAccountData}
        />
      )}

      {/* 10. Floating Toast Notifications */}
      <NotificationToast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
