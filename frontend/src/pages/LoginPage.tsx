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
  Send
} from 'lucide-react';
import { TelePlusLogo } from '../components/TelePlusLogo';

interface LoginPageProps {
  onLoginSuccess: (profile: UserProfile) => void;
  onOpenMenu?: () => void;
  showToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, desc?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onOpenMenu,
  showToast,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('0911428890');
  const [otpCode, setOtpCode] = useState('');
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [demoCodeHint, setDemoCodeHint] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

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
      showToast('warning', 'Invalid Code', 'Please enter the complete 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    const res = await AuthService.verifyOtp(phoneNumber, otpCode.trim());
    setIsVerifying(false);

    if (res.success && res.profile) {
      showToast('success', 'Sign In Successful', res.message);
      onLoginSuccess(res.profile);
    } else {
      showToast('error', 'Sign In Failed', res.message);
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
    showToast('info', 'Copied', 'Message "OK" copied to clipboard. Send to 7198.');
    setTimeout(() => setCopiedSms(false), 2500);
  };

  const isSignInDisabled = isVerifying || otpCode.trim().length !== 6;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif] select-none">
      
      {/* ============================================================
          1. TOP HEADER: [ TELEPLUS LOGO ]                   [ ☰ ]
          Clean mobile header. Menu button at TOP RIGHT.
          ============================================================ */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between py-2.5">
        <div className="flex items-center">
          <TelePlusLogo size="sm" />
        </div>

        {onOpenMenu && (
          <button
            id="login-main-menu-btn"
            type="button"
            onClick={onOpenMenu}
            aria-label="Open TelePlus Menu"
            className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-[#17202A] hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-xs"
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
          className="relative rounded-3xl bg-[#1688C9] text-white p-5 shadow-sm overflow-hidden border border-blue-600/30"
        >
          <div className="relative z-10 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#8BCB3D] text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3 h-3" />
              <span>OFFICIAL ETHIOTELECOM GAMING</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Play All Games 100% Free
            </h1>

            <p className="text-xs text-blue-50 leading-relaxed max-w-xs font-medium">
              Enjoy unlimited instant access to exciting 3D and arcade games with zero ads or limits.
            </p>
          </div>

          <div className="absolute -right-6 -bottom-8 w-28 h-28 bg-[#8BCB3D]/25 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* ============================================================
            3. LOGIN CARD
            White, rounded, clean, professionally spaced, subtle shadow and border.
            ============================================================ */}
        <div 
          id="login-signin-card"
          className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4"
        >
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Sign In</h2>
            <p className="text-xs text-slate-500 font-medium">
              Enter your EthioTelecom phone number to access your account.
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-3.5">
            {/* Phone Number Field */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-500 font-bold text-xs">
                  <Phone className="w-4 h-4 text-[#1688C9]" />
                  <span>+251</span>
                </div>
                <input
                  id="login-phone-input"
                  type="tel"
                  value={phoneNumber.replace(/^\+251\s?/, '')}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="91 123 4567"
                  required
                  className="w-full pl-20 pr-4 py-3 bg-white border border-slate-300 rounded-2xl text-slate-900 font-mono text-sm font-semibold focus:border-[#1688C9] focus:outline-none focus:ring-1 focus:ring-[#1688C9] transition-colors"
                />
              </div>
            </div>

            {/* OTP / Verification Code Field with functional GET CODE action */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  OTP / 6-Digit Code
                </label>
                {otpSent && countdown > 0 && (
                  <span className="text-[10px] text-slate-400 font-mono font-bold">
                    Resend in {countdown}s
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="login-otp-input"
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="6-digit code"
                    className="w-full pl-10 pr-3 py-3 bg-white border border-slate-300 rounded-2xl text-slate-900 font-mono text-sm font-bold tracking-widest focus:border-[#1688C9] focus:outline-none focus:ring-1 focus:ring-[#1688C9] transition-colors text-center"
                  />
                </div>

                <button
                  id="login-get-code-btn"
                  type="button"
                  onClick={handleGetCode}
                  disabled={isRequestingOtp || countdown > 0}
                  className="px-4 py-3 bg-[#1688C9] hover:bg-[#1272a8] disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-xs rounded-2xl transition-colors shrink-0 active:scale-95 cursor-pointer shadow-xs"
                >
                  {isRequestingOtp ? 'Sending...' : countdown > 0 ? `${countdown}s` : 'Get code'}
                </button>
              </div>

              {/* Demo Quick Hint with auto-fill helper */}
              {demoCodeHint && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between">
                  <span>Demo Code: <strong>{demoCodeHint}</strong></span>
                  <button
                    type="button"
                    onClick={() => setOtpCode(demoCodeHint)}
                    className="text-[#8BCB3D] underline text-[11px] font-black hover:text-[#7bb735] cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}
            </div>

            {/* Primary Action: SIGN IN (large enough for mobile, rounded, visible, centered) */}
            <button
              id="login-signin-submit-btn"
              type="submit"
              disabled={isSignInDisabled}
              className="w-full py-3.5 rounded-2xl bg-[#1688C9] hover:bg-[#1272a8] disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-sm active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
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
            className="w-full py-3.5 rounded-2xl bg-[#8BCB3D] hover:bg-[#7cb934] active:scale-[0.98] text-white font-black text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Subscribe</span>
          </button>
        </div>

        {/* ============================================================
            5. SUPPORTING INFORMATION
            ============================================================ */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
          <ShieldCheck className="w-4 h-4 text-[#8BCB3D]" />
          <span>Secured via EthioTelecom Mobile ID Gateway</span>
        </div>
      </div>

      {/* BOTTOM FOOTER */}
      <footer className="w-full max-w-md mx-auto text-center py-2 text-[11px] text-slate-400 font-medium">
        <span>Official Teleplus Service • Shortcode 7198 • EthioTelecom</span>
      </footer>

      {/* ============================================================
          SMS COMPOSER / FALLBACK MODAL
          Customer reviews and presses Send to 7198 with OK.
          ============================================================ */}
      {isSmsModalOpen && (
        <div 
          id="sms-subscribe-modal"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsSmsModalOpen(false)}
        >
          <div 
            className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95 duration-150 text-left select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#8BCB3D] flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    Subscribe via SMS
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    EthioTelecom Teleplus Gaming Service
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSmsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Instruction description */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
              <p className="font-semibold leading-relaxed">
                Your device SMS composer has been prepared with:
              </p>
              <div className="grid grid-cols-2 gap-2 text-center pt-1 font-mono">
                <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">Recipient</span>
                  <strong className="text-sm font-black text-[#1688C9]">7198</strong>
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">Message</span>
                  <strong className="text-sm font-black text-[#8BCB3D]">OK</strong>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 leading-normal">
                Please review and tap Send in your SMS app to confirm your Teleplus subscription.
              </p>
            </div>

            {/* Actions: Re-open SMS composer or Copy info */}
            <div className="space-y-2">
              <a
                href="sms:7198?body=OK"
                className="w-full py-3 rounded-2xl bg-[#8BCB3D] hover:bg-[#7cb934] text-white font-black text-xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Open SMS Composer (7198)</span>
              </a>

              <button
                type="button"
                onClick={handleCopySmsDetails}
                className="w-full py-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedSms ? <Check className="w-3.5 h-3.5 text-[#8BCB3D]" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedSms ? 'Copied message "OK"' : 'Copy "OK" to clipboard'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
