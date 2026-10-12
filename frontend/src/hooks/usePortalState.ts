/**
 * Central State Hook for GameSwiper Ethiopia
 * Orchestrates user profile, backend session synchronization, game launching,
 * subscriptions, modal visibility, and multi-language dictionary.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  NavigationTab, 
  UserProfile, 
  LanguageCode, 
  GameDefinition, 
  ToastMessage, 
  InterstitialAdState,
  GameSessionResult,
  SubscriptionPlan,
} from '../types';
import { StorageService } from '../services/storageService';
import { TRANSLATIONS } from '../utils/translations';
import { GameBridgeService } from '../services/gameBridge';
import { SubscriptionService } from '../services/subscriptionService';
import { AuthService } from '../services/authService';

export function usePortalState() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [profile, setProfile] = useState<UserProfile>(() => StorageService.getProfile());
  const [language, setLanguage] = useState<LanguageCode>(() => StorageService.getLanguage());
  
  // Modals state
  const [activeGameToLaunch, setActiveGameToLaunch] = useState<GameDefinition | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [lastGameSessionResult, setLastGameSessionResult] = useState<GameSessionResult | null>(null);

  // Legal & Privacy modal
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy' | 'datasafety' | 'delete_account'>('terms');

  // Interstitial Ad state
  const [interstitialAdState, setInterstitialAdState] = useState<InterstitialAdState>({
    isOpen: false,
    adId: '',
    brand: '',
    durationSeconds: 3,
    onAdClosed: () => {},
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Settings
  const [audioEnabled, setAudioEnabled] = useState<boolean>(() => StorageService.getAudioEnabled());
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => StorageService.getHapticsEnabled());
  const [notifsEnabled, setNotifsEnabled] = useState<boolean>(() => StorageService.getNotificationsEnabled());
  const [lowDataMode, setLowDataMode] = useState<boolean>(() => StorageService.getLowDataMode());

  // Language dictionary helper
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const showToast = useCallback((type: ToastMessage['type'], title: string, description?: string) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Synchronize authenticated session from backend PostgreSQL on mount
  useEffect(() => {
    AuthService.checkSession().then((syncedProfile) => {
      if (syncedProfile) {
        setProfile(syncedProfile);
      }
    }).catch((err) => {
      console.warn('Backend session verification skipped:', err);
    });
  }, []);

  // Change Language
  const changeLanguage = useCallback((newLang: LanguageCode) => {
    setLanguage(newLang);
    StorageService.saveLanguage(newLang);
  }, []);

  // Toggle Preferences
  const toggleAudio = useCallback(() => {
    setAudioEnabled((prev) => {
      const next = !prev;
      StorageService.saveAudioEnabled(next);
      return next;
    });
  }, []);

  const toggleHaptics = useCallback(() => {
    setHapticsEnabled((prev) => {
      const next = !prev;
      StorageService.saveHapticsEnabled(next);
      return next;
    });
  }, []);

  const toggleNotifs = useCallback(() => {
    setNotifsEnabled((prev) => {
      const next = !prev;
      StorageService.saveNotificationsEnabled(next);
      return next;
    });
  }, []);

  const toggleLowDataMode = useCallback(() => {
    setLowDataMode((prev) => {
      const next = !prev;
      StorageService.saveLowDataMode(next);
      return next;
    });
  }, []);

  // Open Legal Modals
  const openLegalModal = useCallback((tab: 'terms' | 'privacy' | 'datasafety' | 'delete_account' = 'terms') => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  }, []);

  // Launch Game Handler
  const launchGame = useCallback((game: GameDefinition) => {
    setActiveGameToLaunch(game);
    setLastGameSessionResult(null);
  }, []);

  // Submit Game Results
  const handleGameFinished = useCallback((finalScore: number, durationSeconds: number) => {
    if (!activeGameToLaunch) return;

    const { result, updatedProfile } = GameBridgeService.submitScore(
      activeGameToLaunch.id,
      finalScore,
      durationSeconds,
      profile
    );

    setProfile(updatedProfile);
    setLastGameSessionResult(result);
  }, [activeGameToLaunch, profile]);

  // Close Game Runner
  const closeGameLauncher = useCallback(() => {
    setActiveGameToLaunch(null);
    setLastGameSessionResult(null);
  }, []);

  // Subscribe to Daily Plan
  const handleSubscribe = useCallback(async (plan: SubscriptionPlan) => {
    const res = SubscriptionService.subscribe(plan);
    if (res.success && res.updatedProfile) {
      setProfile(res.updatedProfile);
      setIsSubscriptionModalOpen(false);
      showToast('success', 'Plan Activated', res.message);
    } else {
      showToast('error', 'Subscription Failed', res.message);
    }
  }, [showToast]);

  // Reset Demo State
  const resetDemoState = useCallback(() => {
    const reset = StorageService.resetDemoState();
    setProfile(reset);
    showToast('info', 'Demo Data Reset', 'Restored initial sample EthioTelecom user state.');
  }, [showToast]);

  // Wipe Account Data Completely
  const wipeAccountData = useCallback(() => {
    const freshGuest = StorageService.wipeAllData();
    setProfile(freshGuest);
    showToast('info', 'Account Erased', 'All local credentials and match histories wiped.');
  }, [showToast]);

  // Sign out
  const signOut = useCallback(() => {
    const guest = AuthService.signOut();
    setProfile(guest);
  }, []);

  return {
    activeTab,
    setActiveTab,
    profile,
    setProfile,
    language,
    changeLanguage,
    t,
    // Modals & Games
    activeGameToLaunch,
    launchGame,
    closeGameLauncher,
    handleGameFinished,
    lastGameSessionResult,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isSubscriptionModalOpen,
    setIsSubscriptionModalOpen,
    interstitialAdState,
    setInterstitialAdState,
    isLegalModalOpen,
    setIsLegalModalOpen,
    legalModalTab,
    openLegalModal,
    // Actions
    handleSubscribe,
    resetDemoState,
    wipeAccountData,
    signOut,
    // Settings & Toasts
    audioEnabled,
    toggleAudio,
    hapticsEnabled,
    toggleHaptics,
    notifsEnabled,
    toggleNotifs,
    lowDataMode,
    toggleLowDataMode,
    toasts,
    showToast,
    dismissToast,
  };
}
