/**
 * GameSwiper Storage Service
 * Handles client-side persistent storage for player session, settings, and preferences.
 */

import { UserProfile, LanguageCode } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'gameswiper_profile_v1',
  LANGUAGE: 'gameswiper_language_v1',
  AUDIO_ENABLED: 'gameswiper_audio_v1',
  HAPTICS_ENABLED: 'gameswiper_haptics_v1',
  NOTIFS_ENABLED: 'gameswiper_notifs_v1',
  LOW_DATA_MODE: 'gameswiper_low_data_v1',
};

export const INITIAL_GUEST_PROFILE: UserProfile = {
  id: '',
  phoneNumber: '',
  displayName: 'Player',
  avatarId: 'avatar_runner',
  isRegistered: false,
  telebirrLinked: false,
  telebirrBalance: 0,
  coins: 0,
  xp: 0,
  level: 1,
  energy: 0,
  maxEnergy: 0,
  lastEnergyRefillTimestamp: 0,
  subscription: {
    plan: 'daily',
    isActive: false,
    autoRenew: false,
  },
  streak: {
    current: 0,
    lastClaimedDate: '',
    hasClaimedToday: false,
  },
  highScores: {},
  achievements: [],
  matchesPlayed: 0,
  trophiesCount: 0,
};

export const StorageService = {
  getProfile(): UserProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!stored) {
        return { ...INITIAL_GUEST_PROFILE };
      }
      const parsed: UserProfile = JSON.parse(stored);
      return parsed;
    } catch {
      return { ...INITIAL_GUEST_PROFILE };
    }
  },

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('[StorageService] Failed to save profile to localStorage:', e);
    }
  },

  clearSession(): UserProfile {
    const unauthenticated: UserProfile = {
      ...INITIAL_GUEST_PROFILE,
    };
    this.saveProfile(unauthenticated);
    return unauthenticated;
  },

  recalculateEnergy(profile: UserProfile): UserProfile {
    return profile;
  },

  getLanguage(): LanguageCode {
    try {
      return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as LanguageCode) || 'en';
    } catch {
      return 'en';
    }
  },

  saveLanguage(lang: LanguageCode): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    } catch (e) {
      console.warn('[StorageService] Failed to save language:', e);
    }
  },

  getAudioEnabled(): boolean {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.AUDIO_ENABLED);
      return val !== null ? val === 'true' : true;
    } catch {
      return true;
    }
  },

  saveAudioEnabled(enabled: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIO_ENABLED, String(enabled));
    } catch (e) {
      console.warn('[StorageService] Failed to save audio setting:', e);
    }
  },

  getHapticsEnabled(): boolean {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.HAPTICS_ENABLED);
      return val !== null ? val === 'true' : true;
    } catch {
      return true;
    }
  },

  saveHapticsEnabled(enabled: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.HAPTICS_ENABLED, String(enabled));
    } catch (e) {
      console.warn('[StorageService] Failed to save haptics setting:', e);
    }
  },

  getNotificationsEnabled(): boolean {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.NOTIFS_ENABLED);
      return val !== null ? val === 'true' : false;
    } catch {
      return false;
    }
  },

  saveNotificationsEnabled(enabled: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFS_ENABLED, String(enabled));
    } catch (e) {
      console.warn('[StorageService] Failed to save notifications setting:', e);
    }
  },

  getLowDataMode(): boolean {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.LOW_DATA_MODE);
      return val !== null ? val === 'true' : false;
    } catch {
      return false;
    }
  },

  saveLowDataMode(enabled: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LOW_DATA_MODE, String(enabled));
    } catch (e) {
      console.warn('[StorageService] Failed to save low data setting:', e);
    }
  },

  getEnergyTransactions(): any[] {
    return [];
  },

  recordEnergyTransaction(_tx: any): void {},

  wipeAllData(): UserProfile {
    try {
      localStorage.clear();
      sessionStorage.clear();
      const guest = { ...INITIAL_GUEST_PROFILE };
      this.saveProfile(guest);
      return guest;
    } catch {
      return { ...INITIAL_GUEST_PROFILE };
    }
  },

  resetDemoState(): UserProfile {
    return this.wipeAllData();
  },
};
