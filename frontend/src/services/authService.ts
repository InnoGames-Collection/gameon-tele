/**
 * Ethio Telecom Authentication Service
 * Strictly authenticates via Fastify backend API, SMS OTP, and MSISDN verification.
 * Zero tolerance for hardcoded passwords, fake OTPs, or mock user identities.
 */

import { UserProfile } from '../types';
import { StorageService } from './storageService';

export interface AuthResponse {
  success: boolean;
  message: string;
  profile?: UserProfile;
}

export const AuthService = {
  /**
   * Request 6-digit OTP code via Ethio Telecom SMS gateway
   */
  async requestOtp(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    const cleaned = phoneNumber.replace(/\D/g, '');
    const isEthio =
      cleaned.startsWith('2519') ||
      cleaned.startsWith('2517') ||
      cleaned.startsWith('09') ||
      cleaned.startsWith('07') ||
      cleaned.length === 9 ||
      cleaned.length === 10 ||
      cleaned.length === 12;

    if (!isEthio) {
      return {
        success: false,
        message: 'Please enter a valid Ethio Telecom phone number starting with 09 or 07.',
      };
    }

    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        return {
          success: true,
          message: data.message || `Verification code sent to ${phoneNumber}.`,
        };
      }

      return {
        success: false,
        message: data.error || 'Failed to dispatch verification code. Please retry.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: 'Network error connecting to Ethio Telecom authentication gateway.',
      };
    }
  },

  /**
   * Verify 6-digit OTP against backend database and log in
   */
  async verifyOtp(phoneNumber: string, otp: string): Promise<AuthResponse> {
    const trimmedOtp = otp.trim();

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otpCode: trimmedOtp }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.error || 'Invalid or expired verification code.',
        };
      }

      if (data.token) {
        sessionStorage.setItem('gameon_player_token', data.token);
      }

      const backendProfile = data.profile;
      const current = StorageService.getProfile();

      let normalizedPhone = phoneNumber.replace(/\D/g, '');
      if (normalizedPhone.startsWith('251')) {
        normalizedPhone = '0' + normalizedPhone.slice(3);
      }
      if (!normalizedPhone.startsWith('0') && (normalizedPhone.startsWith('9') || normalizedPhone.startsWith('7'))) {
        normalizedPhone = '0' + normalizedPhone;
      }

      const updated: UserProfile = {
        ...current,
        phoneNumber: normalizedPhone,
        isRegistered: true,
        telebirrLinked: true,
        coins: backendProfile?.coins ?? current.coins,
        subscription: {
          ...current.subscription,
          isActive: Boolean(backendProfile?.isSubscribed),
        },
      };

      StorageService.saveProfile(updated);

      return {
        success: true,
        message: 'Successfully authenticated with Ethio Telecom.',
        profile: updated,
      };
    } catch (err: any) {
      return {
        success: false,
        message: 'Network error connecting to verification gateway: ' + err.message,
      };
    }
  },

  /**
   * Sign out and clear authenticated session
   */
  signOut(): UserProfile {
    sessionStorage.removeItem('gameon_player_token');
    return StorageService.clearSession();
  },
};
