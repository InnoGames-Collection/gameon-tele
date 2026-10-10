/**
 * TelePlus Official Login Screen
 * Refined to match the structural excellence, proportions, card hierarchy,
 * and polish of the EthioFantasy reference specification.
 * 
 * Layout Hierarchy:
 * TOP HEADER [ TELEPLUS LOGO ]              [ ☰ ]
 * ↓
 * BRANDING & PROMOTIONAL AREA
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
 * Background: PURE WHITE (#FFFFFF)
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
      // Prompt 1 requirement: Successful sign-in updates state silently without a success popup
      onLoginSuccess(res.profile);
    } else {
      // Display genuine errors inline in the form
      setAuthError(res.message || 'Verification failed. Please check your code.');
    }
  };

  // Section 10: Subscribe Function - open device's SMS composer prefilled with Recipient 7198, Message OK
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

    // Always provide the graceful fallback / review dialog
    setIsSmsModalOpen(true);
  };

  const handleCopySmsDetails = () => {
    navigator.clipboard.writeText('OK');
    setCopiedSms(true);
    setTimeout(() => setCopiedSms(false), 2500);
  };

  const isSignInDisabled = isVerifying || otpCode.trim().length !== 6;

  return (
    <div className="min-h-screen bg-white text-[#45365F] flex flex-col justify-between p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif] select-none">
      
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
            className="w-10 h-10 rounded-xl border border-[#E7DFF3] bg-white text-[#38205F] hover:bg-[#F1ECFF] active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-xs"
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
            Clean, rounded card with subtle shadow and border.
            ============================================================ */}
        <div 
          id="login-promo-banner"
          className="relative rounded-3xl bg-gradient-to-br from-[#7048E8] to-[#38205F] text-white p-5 shadow-sm overflow-hidden border border-[#7048E8]/30"
        >
          <div className="relative z-10 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C6F36B] text-[#38205F] text-[10px] font-black uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3 h-3" />
              <span>OFFICIAL ETHIOTELECOM GAMING</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Play All Games 100% Free
            </h1>

            <p className="text-xs text-[#F1ECFF] leading-relaxed max-w-xs font-medium">
              Enjoy unlimited instant access to exciting 3D and arcade games on GameSwiper with zero ads or limits.
            </p>
          </div>

          <div className="absolute -right-6 -bottom-8 w-28 h-28 bg-[#C6F36B]/20 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* ============================================================
            3. LOGIN CARD
            White, rounded, clean, professionally spaced, subtle shadow and border.
            ============================================================ */}
        <div 
          id="login-signin-card"
          className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E7DFF3] shadow-sm space-y-4"
        >
          <div className="space-y-1">
            <h2 className="text-lg font-black text-[#38205F] tracking-tight">Sign In</h2>
            <p className="text-xs text-[#827695] font-medium">
              Enter your EthioTelecom phone number to access your account.
            </p>
          </div>

          {/* Genuine Inline Error & Info states */}
          {authError && (
            <div className="p-3 rounded-2xl bg-[#FFF5F5] border border-[#FF6B6B]/40 text-[#FF6B6B] text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {authInfo && (
            <div className="p-3 rounded-2xl bg-[#F1ECFF] border border-[#7048E8]/30 text-[#7048E8] text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{authInfo}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-3.5">
            {/* Phone Number Field */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#45365F] uppercase tracking-wider">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[#827695] font-bold text-xs">
                  <Phone className="w-4 h-4 text-[#7048E8]" />
                  <span>+251</span>
                </div>
                <input
                  id="login-phone-input"
                  type="tel"
                  value={phoneNumber.replace(/^\+251\s?/, '')}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="91 123 4567"
                  required
                  className="w-full pl-20 pr-4 py-3 bg-white border border-[#E7DFF3] rounded-2xl text-[#38205F] font-mono text-sm font-semibold focus:border-[#7048E8] focus:outline-none focus:ring-1 focus:ring-[#7048E8] transition-colors"
                />
              </div>
            </div>

            {/* OTP / Verification Code Field with functional GET CODE action */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-[#45365F] uppercase tracking-wider">
                  OTP / 6-Digit Code
                </label>
                {otpSent && countdown > 0 && (
                  <span className="text-[10px] text-[#827695] font-mono font-bold">
                    Resend in {countdown}s
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#827695]" />
                  <input
                    id="login-otp-input"
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="6-digit code (Demo: 123456)"
                    className="w-full pl-10 pr-3 py-3 bg-white border border-[#E7DFF3] rounded-2xl text-[#38205F] font-mono text-sm font-bold tracking-widest focus:border-[#7048E8] focus:outline-none focus:ring-1 focus:ring-[#7048E8] transition-colors text-center"
                  />
                </div>

                <button
                  id="login-get-code-btn"
                  type="button"
                  onClick={handleGetCode}
                  disabled={isRequestingOtp || countdown > 0}
                  className="px-4 py-3 bg-[#7048E8] hover:bg-[#5e38d6] disabled:bg-[#F1ECFF] disabled:text-[#827695] text-white font-extrabold text-xs rounded-2xl transition-colors shrink-0 active:scale-95 cursor-pointer shadow-xs"
                >
                  {isRequestingOtp ? 'Sending...' : countdown > 0 ? `${countdown}s` : 'Get code'}
                </button>
              </div>
            </div>

            {/* Primary Action: SIGN IN (large enough for mobile, rounded, visible, centered) */}
            <button
              id="login-signin-submit-btn"
              type="submit"
              disabled={isSignInDisabled}
              className="w-full py-3.5 rounded-2xl bg-[#7048E8] hover:bg-[#5e38d6] disabled:bg-[#F1ECFF] disabled:text-[#827695] text-white font-black text-sm active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
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
            className="w-full py-3.5 rounded-2xl bg-[#C6F36B] hover:bg-[#bbf058] active:scale-[0.98] text-[#38205F] font-black text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Subscribe</span>
          </button>
        </div>

        {/* ============================================================
            5. SUPPORTING INFORMATION
            ============================================================ */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#827695] pt-1">
          <ShieldCheck className="w-4 h-4 text-[#7048E8]" />
          <span>Secured via EthioTelecom Mobile ID Gateway</span>
        </div>
      </div>

      {/* BOTTOM FOOTER */}
      <footer className="w-full max-w-md mx-auto text-center py-2 text-[11px] text-[#827695] font-medium">
        <span>Official GameSwiper Service • Shortcode 7198 • EthioTelecom</span>
      </footer>

      {/* ============================================================
          SMS COMPOSER / FALLBACK MODAL
          Customer reviews and presses Send to 7198 with OK.
          ============================================================ */}
      {isSmsModalOpen && (
        <div 
          id="sms-subscribe-modal"
          className="fixed inset-0 z-50 bg-[#38205F]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsSmsModalOpen(false)}
        >
          <div 
            className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 border border-[#E7DFF3] animate-in zoom-in-95 duration-150 text-left select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#F1ECFF] border border-[#E7DFF3] text-[#7048E8] flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#38205F] leading-tight">
                    Subscribe via SMS
                  </h3>
                  <p className="text-[11px] text-[#827695] font-medium">
                    EthioTelecom GameSwiper Gaming Service
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSmsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-[#F1ECFF] hover:bg-[#E7DFF3] flex items-center justify-center text-[#38205F] transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Instruction description */}
            <div className="p-3.5 rounded-2xl bg-[#FFF8EE] border border-[#E7DFF3] space-y-2 text-xs text-[#45365F]">
              <p className="font-semibold leading-relaxed">
                Your device SMS composer has been prepared with:
              </p>
              <div className="grid grid-cols-2 gap-2 text-center pt-1 font-mono">
                <div className="p-2 rounded-xl bg-white border border-[#E7DFF3] shadow-2xs">
                  <span className="text-[10px] text-[#827695] block font-sans uppercase font-bold">Recipient</span>
                  <strong className="text-sm font-black text-[#7048E8]">7198</strong>
                </div>
                <div className="p-2 rounded-xl bg-white border border-[#E7DFF3] shadow-2xs">
                  <span className="text-[10px] text-[#827695] block font-sans uppercase font-bold">Message</span>
                  <strong className="text-sm font-black text-[#38205F] bg-[#C6F36B] px-2 py-0.5 rounded-md inline-block">OK</strong>
                </div>
              </div>
              <p className="text-[11px] text-[#827695] pt-1 leading-normal">
                Please review and tap Send in your SMS app to confirm your GameSwiper subscription.
              </p>
            </div>

            {/* Actions: Re-open SMS composer or Copy info */}
            <div className="space-y-2">
              <a
                href="sms:7198?body=OK"
                className="w-full py-3 rounded-2xl bg-[#C6F36B] hover:bg-[#bbf058] text-[#38205F] font-black text-xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Open SMS Composer (7198)</span>
              </a>

              <button
                type="button"
                onClick={handleCopySmsDetails}
                className="w-full py-2.5 rounded-2xl bg-white border border-[#E7DFF3] hover:bg-[#F1ECFF] text-[#45365F] font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedSms ? <Check className="w-3.5 h-3.5 text-[#7048E8]" /> : <Copy className="w-3.5 h-3.5 text-[#827695]" />}
                <span>{copiedSms ? 'Copied message "OK"' : 'Copy "OK" to clipboard'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
