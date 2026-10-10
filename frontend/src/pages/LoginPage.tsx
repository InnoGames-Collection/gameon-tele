/**
 * TelePlus Official Login Screen
 * Redesigned with Midnight-Navy Surfaces and Deep-Teal Panels
 * 
 * Layout Hierarchy:
 * TOP HEADER [ GAMESWIPER LOGO ]              [ ☰ ]
 * ↓
 * BRANDING & PROMOTIONAL AREA (Official WebP Banner)
 * ↓
 * LOGIN CARD
 *   ↓
 *   PHONE NUMBER
 *   ↓
 *   OTP + GET CODE
 *   ↓
 *   SIGN IN
 * ↓
 * SUBSCRIBE (Button placed below the login card)
 * ↓
 * SUPPORTING INFORMATION
 * 
 * Background: MIDNIGHT NAVY (#071827)
 */

import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { AuthService } from '../services/authService';
import { 
  Menu, 
  Phone, 
  KeyRound, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck,
  MessageSquare,
  Copy,
  Check,
  X,
  Send,
  AlertTriangle
} from 'lucide-react';
import { GameSwiperLogo } from '../components/GameOnTeleLogo';

interface LoginPageProps {
  onLoginSuccess: (profile: UserProfile) => void;
  onOpenMenu?: () => void;
  showToast?: (type: 'success' | 'info' | 'warning' | 'error', title: string, desc?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onOpenMenu,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authInfo, setAuthInfo] = useState<string | null>(null);

  // SMS composer fallback modal state
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [copiedSms, setCopiedSms] = useState(false);

  // Timer countdown for resending code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleGetCode = async () => {
    setAuthError(null);
    setAuthInfo(null);
    if (!phoneNumber || phoneNumber.trim().length < 9) {
      setAuthError('Please enter a valid EthioTelecom mobile number.');
      return;
    }

    setIsRequestingOtp(true);
    const res = await AuthService.requestOtp(phoneNumber);
    setIsRequestingOtp(false);

    if (res.success) {
      setOtpSent(true);
      setCountdown(60);
      setAuthInfo(res.message || 'Verification code sent via SMS.');
    } else {
      setAuthError(res.message || 'Failed to send verification code. Please try again.');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthInfo(null);
    if (otpCode.trim().length !== 6) {
      setAuthError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    const res = await AuthService.verifyOtp(phoneNumber, otpCode.trim());
    setIsVerifying(false);

    if (res.success && res.profile) {
      onLoginSuccess(res.profile);
    } else {
      setAuthError(res.message || 'Verification failed. Please check your code.');
    }
  };

  const handleSubscribe = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const separator = isIOS ? '&' : '?';
    const smsUrl = `sms:7198${separator}body=OK`;

    try {
      const link = document.createElement('a');
      link.href = smsUrl;
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.warn('[Subscribe] Direct SMS deep-link error:', err);
    }

    setIsSmsModalOpen(true);
  };

  const handleCopySmsDetails = () => {
    navigator.clipboard.writeText('OK');
    setCopiedSms(true);
    setTimeout(() => setCopiedSms(false), 2500);
  };

  const isSignInDisabled = isVerifying || otpCode.trim().length !== 6;

  return (
    <div className="min-h-screen bg-[#071827] text-[#F5FAFC] flex flex-col justify-between p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif] select-none">
      
      {/* ============================================================
          1. TOP HEADER: [ GAMESWIPER LOGO ]                   [ ☰ ]
          Clean mobile header. Menu button at TOP RIGHT.
          ============================================================ */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between py-2.5">
        <div className="flex items-center">
          <GameSwiperLogo size="sm" />
        </div>

        {onOpenMenu && (
          <button
            id="login-main-menu-btn"
            type="button"
            onClick={onOpenMenu}
            aria-label="Open GameSwiper Menu"
            className="w-10 h-10 rounded-xl border border-[#244558] bg-[#102C40] text-[#A9C0CE] hover:text-[#35D9F2] hover:bg-[#15374A] active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-xs"
            title="Menu"
          >
            <Menu className="w-5 h-5 stroke-[2.2]" />
          </button>
        )}
      </header>

      {/* ============================================================
          MAIN BODY CONTAINER
          ============================================================ */}
      <div className="w-full max-w-md mx-auto my-auto space-y-4 py-2">
        
        {/* ============================================================
            2. BRANDING & PROMOTIONAL AREA
            Official GameSwiper Promotional Banner
            ============================================================ */}
        <div 
          id="login-promo-banner"
          className="relative rounded-3xl overflow-hidden border border-[#244558] shadow-lg bg-[#0B2234] aspect-[3/1] w-full"
        >
          <img
            src="/banners/login-banner.webp"
            alt="GameSwiper Play and Win Big - Up to 50,000 ETB Grand Prize"
            className="w-full h-full object-cover block rounded-3xl"
            loading="eager"
          />
        </div>

        {/* ============================================================
            3. LOGIN CARD
            Deep Teal, rounded, clean, professionally spaced, subtle border.
            ============================================================ */}
        <div 
          id="login-signin-card"
          className="bg-[#102C40] rounded-3xl p-5 sm:p-6 border border-[#244558] shadow-xl space-y-4"
        >
          <div className="space-y-1">
            <h2 className="text-lg font-black text-[#F5FAFC] tracking-tight">Sign In</h2>
            <p className="text-xs text-[#A9C0CE] font-medium">
              Enter your EthioTelecom phone number to access your account.
            </p>
          </div>

          {/* Inline Error & Info states */}
          {authError && (
            <div className="p-3 rounded-2xl bg-[#FF796C]/10 border border-[#FF796C]/30 text-[#FF796C] text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {authInfo && (
            <div className="p-3 rounded-2xl bg-[#00BFA6]/10 border border-[#00BFA6]/30 text-[#00BFA6] text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{authInfo}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-3.5">
            {/* Phone Number Field */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#A9C0CE] uppercase tracking-wider">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[#A9C0CE] font-bold text-xs">
                  <Phone className="w-4 h-4 text-[#00BFA6]" />
                  <span>+251</span>
                </div>
                <input
                  id="login-phone-input"
                  type="tel"
                  value={phoneNumber.replace(/^\+251\s?/, '')}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="91 123 4567"
                  required
                  className="w-full pl-20 pr-4 py-3 bg-[#0B2234] border border-[#244558] rounded-2xl text-[#F5FAFC] font-mono text-sm font-semibold focus:border-[#00BFA6] focus:outline-none focus:ring-1 focus:ring-[#00BFA6] transition-colors placeholder:text-[#A9C0CE]/50"
                />
              </div>
            </div>

            {/* OTP / Verification Code Field with functional GET CODE action */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-[#A9C0CE] uppercase tracking-wider">
                  OTP / 6-Digit Code
                </label>
                {otpSent && countdown > 0 && (
                  <span className="text-[10px] text-[#A9C0CE] font-mono font-bold">
                    Resend in {countdown}s
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9C0CE]" />
                  <input
                    id="login-otp-input"
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="6-digit code (Demo: 123456)"
                    className="w-full pl-10 pr-3 py-3 bg-[#0B2234] border border-[#244558] rounded-2xl text-[#F5FAFC] font-mono text-sm font-bold tracking-widest focus:border-[#00BFA6] focus:outline-none focus:ring-1 focus:ring-[#00BFA6] transition-colors text-center placeholder:text-[#A9C0CE]/50"
                  />
                </div>

                <button
                  id="login-get-code-btn"
                  type="button"
                  onClick={handleGetCode}
                  disabled={isRequestingOtp || countdown > 0}
                  className="px-4 py-3 bg-[#15374A] hover:bg-[#00BFA6] hover:text-[#071827] disabled:bg-[#0B2234] disabled:text-[#A9C0CE]/40 text-[#00BFA6] border border-[#00BFA6]/40 font-extrabold text-xs rounded-2xl transition-all shrink-0 active:scale-95 cursor-pointer shadow-xs"
                >
                  {isRequestingOtp ? 'Sending...' : countdown > 0 ? `${countdown}s` : 'Get code'}
                </button>
              </div>
            </div>

            {/* Primary Action: SIGN IN */}
            <button
              id="login-signin-submit-btn"
              type="submit"
              disabled={isSignInDisabled}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00BFA6] to-[#63F5C8] hover:from-[#63F5C8] hover:to-[#00BFA6] disabled:from-[#15374A] disabled:to-[#15374A] disabled:text-[#A9C0CE]/40 disabled:border-[#244558] text-[#071827] font-black text-sm active:scale-[0.98] transition-all shadow-md shadow-[#00BFA6]/20 flex items-center justify-center gap-2 cursor-pointer border border-[#00BFA6]"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>{isVerifying ? 'Verifying...' : 'Sign in'}</span>
            </button>
          </form>
        </div>

        {/* ============================================================
            4. SUBSCRIBE BUTTON (Placed BELOW the login card)
            Wording must be EXACTLY: Subscribe
            Tapping opens device SMS composer to recipient 7198, body OK
            ============================================================ */}
        <div className="pt-1">
          <button
            id="login-subscribe-btn"
            type="button"
            onClick={handleSubscribe}
            className="w-full py-3.5 rounded-2xl bg-[#F7C85B] hover:bg-[#eab308] active:scale-[0.98] text-[#071827] font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-[#F7C85B]"
          >
            <span>Subscribe</span>
          </button>
        </div>

        {/* ============================================================
            5. SUPPORTING INFORMATION
            ============================================================ */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#A9C0CE] pt-1">
          <ShieldCheck className="w-4 h-4 text-[#00BFA6]" />
          <span>Secured via EthioTelecom Mobile ID Gateway</span>
        </div>
      </div>

      {/* BOTTOM FOOTER */}
      <footer className="w-full max-w-md mx-auto text-center py-2 text-[11px] text-[#A9C0CE] font-medium">
        <span>Official GameSwiper Service • Shortcode 7198 • EthioTelecom</span>
      </footer>

      {/* ============================================================
          SMS COMPOSER / FALLBACK MODAL
          ============================================================ */}
      {isSmsModalOpen && (
        <div 
          id="sms-subscribe-modal"
          className="fixed inset-0 z-50 bg-[#071827]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsSmsModalOpen(false)}
        >
          <div 
            className="w-full max-w-sm bg-[#102C40] rounded-3xl p-5 shadow-2xl space-y-4 border border-[#244558] animate-in zoom-in-95 duration-150 text-left select-none text-[#F5FAFC]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#15374A] border border-[#244558] text-[#00BFA6] flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#F5FAFC] leading-tight">
                    Subscribe via SMS
                  </h3>
                  <p className="text-[11px] text-[#A9C0CE] font-medium">
                    EthioTelecom GameSwiper Gaming Service
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSmsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-[#15374A] hover:bg-[#244558] flex items-center justify-center text-[#A9C0CE] hover:text-[#F5FAFC] transition-colors cursor-pointer border border-[#244558]"
                title="Close"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Instruction description */}
            <div className="p-3.5 rounded-2xl bg-[#0B2234] border border-[#244558] space-y-2 text-xs text-[#F5FAFC]">
              <p className="font-semibold leading-relaxed text-[#A9C0CE]">
                Your device SMS composer has been prepared with:
              </p>
              <div className="grid grid-cols-2 gap-2 text-center pt-1 font-mono">
                <div className="p-2 rounded-xl bg-[#102C40] border border-[#244558] shadow-2xs">
                  <span className="text-[10px] text-[#A9C0CE] block font-sans uppercase font-bold">Recipient</span>
                  <strong className="text-sm font-black text-[#00BFA6]">7198</strong>
                </div>
                <div className="p-2 rounded-xl bg-[#102C40] border border-[#244558] shadow-2xs">
                  <span className="text-[10px] text-[#A9C0CE] block font-sans uppercase font-bold">Message</span>
                  <strong className="text-sm font-black text-[#071827] bg-[#63F5C8] px-2 py-0.5 rounded-md inline-block">OK</strong>
                </div>
              </div>
              <p className="text-[11px] text-[#A9C0CE] pt-1 leading-normal">
                Please review and tap Send in your SMS app to confirm your GameSwiper subscription.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <a
                href="sms:7198?body=OK"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#00BFA6] to-[#63F5C8] text-[#071827] font-black text-xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Open SMS Composer (7198)</span>
              </a>

              <button
                type="button"
                onClick={handleCopySmsDetails}
                className="w-full py-2.5 rounded-2xl bg-[#15374A] border border-[#244558] hover:bg-[#102C40] text-[#F5FAFC] font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedSms ? <Check className="w-3.5 h-3.5 text-[#63F5C8]" /> : <Copy className="w-3.5 h-3.5 text-[#A9C0CE]" />}
                <span>{copiedSms ? 'Copied message "OK"' : 'Copy "OK" to clipboard'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
