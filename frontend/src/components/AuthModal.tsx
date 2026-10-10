/**
 * EthioTelecom Authentication Modal (Phase 2 Specification)
 * Matches the exact professional EthioTelecom gaming login screen layout:
 * - WHITE background
 * - Bold gear Settings icon
 * - Promotional banner
 * - Compact white Sign In card
 * - Fields: Phone Number, OTP / 6-digit code, GET CODE, SIGN IN (disabled until 6 digits entered)
 * - Secondary Action: Subscribe button (WHITE bg, GREEN border, GREEN text)
 * - NO "Register Here", NO "VIP", NO "Energy"
 */

import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { AuthService } from '../services/authService';
import { 
  X, 
  Phone, 
  KeyRound, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Settings as SettingsIcon
} from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
  onOpenSubscribe?: () => void;
  showToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, desc?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  onClose, 
  onSuccess, 
  onOpenSubscribe,
  showToast 
}) => {
  const [phoneNumber, setPhoneNumber] = useState('0911428890');
  const [otpCode, setOtpCode] = useState('');
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [demoCodeHint, setDemoCodeHint] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleGetCode = async () => {
    if (!phoneNumber || phoneNumber.trim().length < 9) {
      showToast('error', 'Invalid Phone', 'Please enter a valid EthioTelecom mobile number.');
      return;
    }

    setIsRequestingOtp(true);
    const res = await AuthService.requestOtp(phoneNumber);
    setIsRequestingOtp(false);

    if (res.success) {
      setOtpSent(true);
      setDemoCodeHint(res.demoOtp || '123456');
      setCountdown(60);
      showToast('info', 'Verification Code Sent', res.message);
    } else {
      showToast('error', 'Request Failed', res.message);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim().length !== 6) {
      showToast('warning', 'Invalid OTP', 'Please enter the complete 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    const res = await AuthService.verifyOtp(phoneNumber, otpCode.trim());
    setIsVerifying(false);

    if (res.success && res.profile) {
      showToast('success', 'Logged In', res.message);
      onSuccess(res.profile);
      onClose();
    } else {
      showToast('error', 'Authentication Failed', res.message);
    }
  };

  const isSignInDisabled = isVerifying || otpCode.trim().length !== 6;

  return (
    <div className="fixed inset-0 z-50 bg-[#071827]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-[#102C40] text-[#F5FAFC] rounded-3xl border border-[#244558] shadow-2xl p-5 sm:p-6 relative my-6 font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#15374A] border border-[#244558] text-[#A9C0CE] hover:text-[#F5FAFC] hover:bg-[#244558] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-xl bg-[#15374A] border border-[#244558] text-[#00BFA6] flex items-center justify-center font-black text-xs">
            ET
          </div>
          <div>
            <span className="font-black text-sm text-[#F5FAFC]">GameSwiper</span>
            <span className="text-[9px] ml-1.5 px-1.5 py-0.5 rounded bg-[#63F5C8]/20 text-[#63F5C8] font-black uppercase border border-[#63F5C8]/30">
              Ethiopia
            </span>
          </div>
        </div>

        {/* Promotional Banner */}
        <div className="relative rounded-2xl overflow-hidden border border-[#244558] mb-4 bg-[#0B2234] aspect-[3/1] w-full shadow-sm">
          <img
            src="/banners/login-banner.webp"
            alt="GameSwiper Play and Win Big - Up to 50,000 ETB Grand Prize"
            className="w-full h-full object-cover block rounded-2xl"
            loading="eager"
          />
        </div>

        {/* Sign In Card */}
        <form onSubmit={handleSignIn} className="space-y-3.5">
          <div className="space-y-1">
            <h2 className="text-base font-black text-[#F5FAFC]">Sign In</h2>
            <p className="text-[11px] text-[#A9C0CE]">
              Enter your EthioTelecom phone number to continue.
            </p>
          </div>

          {/* Phone Field */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-[#A9C0CE] uppercase tracking-wider">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[#A9C0CE] font-bold text-xs">
                <Phone className="w-3.5 h-3.5 text-[#00BFA6]" />
                <span>+251</span>
              </div>
              <input
                type="tel"
                value={phoneNumber.replace(/^\+251\s?/, '')}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="91 123 4567"
                required
                className="w-full pl-16 pr-3 py-2.5 bg-[#0B2234] border border-[#244558] rounded-xl text-[#F5FAFC] font-mono text-sm font-semibold focus:border-[#00BFA6] focus:bg-[#0B2234] focus:outline-none placeholder:text-[#A9C0CE]/50"
              />
            </div>
          </div>

          {/* OTP Field with GET CODE */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-bold text-[#A9C0CE] uppercase tracking-wider">
                OTP / 6-Digit Code
              </label>
              {otpSent && countdown > 0 && (
                <span className="text-[10px] text-[#A9C0CE] font-mono">
                  {countdown}s
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A9C0CE]" />
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="6-digit code"
                  className="w-full pl-8 pr-2 py-2.5 bg-[#0B2234] border border-[#244558] rounded-xl text-[#F5FAFC] font-mono text-sm font-bold tracking-widest text-center focus:border-[#00BFA6] focus:bg-[#0B2234] focus:outline-none placeholder:text-[#A9C0CE]/50"
                />
              </div>

              <button
                type="button"
                onClick={handleGetCode}
                disabled={isRequestingOtp || countdown > 0}
                className="px-3.5 py-2.5 bg-[#15374A] hover:bg-[#00BFA6] hover:text-[#071827] disabled:bg-[#0B2234] disabled:text-[#A9C0CE]/40 text-[#00BFA6] border border-[#00BFA6]/40 font-extrabold text-xs rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                {isRequestingOtp ? '...' : countdown > 0 ? `${countdown}s` : 'GET CODE'}
              </button>
            </div>

            {demoCodeHint && (
              <div className="p-2 rounded-lg bg-[#0B2234] border border-[#244558] text-[#63F5C8] text-[11px] font-semibold flex items-center justify-between">
                <span>Code: <strong>{demoCodeHint}</strong></span>
                <button
                  type="button"
                  onClick={() => setOtpCode(demoCodeHint)}
                  className="text-[#63F5C8] underline text-[10px] font-black cursor-pointer"
                >
                  Auto-Fill
                </button>
              </div>
            )}
          </div>

          {/* SIGN IN */}
          <button
            type="submit"
            disabled={isSignInDisabled}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00BFA6] to-[#63F5C8] hover:from-[#63F5C8] hover:to-[#00BFA6] disabled:from-[#15374A] disabled:to-[#15374A] disabled:text-[#A9C0CE]/40 text-[#071827] font-black text-xs active:scale-[0.98] transition-all shadow-md shadow-[#00BFA6]/20 flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer border border-[#00BFA6]"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>{isVerifying ? 'VERIFYING...' : 'SIGN IN'}</span>
          </button>

          {/* Secondary Action: Subscribe Button */}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenSubscribe) onOpenSubscribe();
            }}
            className="w-full py-2.5 rounded-xl bg-[#F7C85B] hover:bg-[#eab308] text-[#071827] font-black text-xs active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer border border-[#F7C85B]"
          >
            <span>SUBSCRIBE TO GAMING PASS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-[#244558] flex items-center justify-center gap-1.5 text-[10px] text-[#A9C0CE]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00BFA6]" />
          <span>Secured by EthioTelecom Mobile ID Gateway</span>
        </div>
      </div>
    </div>
  );
};
