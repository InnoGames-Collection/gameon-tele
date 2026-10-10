/**
 * GameOn Tele - Subscription Page
 * 
 * Strict Final Requirement:
 * - Brand: GameOn Tele
 * - ONLY ONE SUBSCRIPTION: Daily (2 Birr/day)
 * - Tapping Subscribe opens device SMS composer to 7198 with message OK
 */

import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { 
  CreditCard, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Send,
  MessageSquare,
  Copy,
  Check
} from 'lucide-react';

interface SubscriptionPageProps {
  onBack?: () => void;
  showHeader?: boolean;
  profile?: UserProfile;
  onProfileUpdate?: (updated: UserProfile) => void;
}

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({
  onBack,
  showHeader = true,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSmsPromptVisible, setIsSmsPromptVisible] = useState(false);

  const handleSubscribe = () => {
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
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
      console.warn('[Subscribe] SMS link dispatch error:', err);
    }

    setIsSmsPromptVisible(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText('OK');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#071827] text-[#F5FAFC] pb-24 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. Header with Back Button */}
      {showHeader && (
        <div className="flex items-center justify-between gap-3 bg-[#0B2234] border border-[#244558] text-[#F5FAFC] p-3.5 rounded-2xl shadow-xs mb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                id="subscription-back-btn"
                onClick={onBack}
                className="w-8 h-8 rounded-xl bg-[#15374A] hover:bg-[#244558] flex items-center justify-center text-[#F5FAFC] border border-[#244558] transition-colors cursor-pointer shrink-0"
                title="Go Back"
                aria-label="Go Back"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span className="sr-only">Go Back</span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#00BFA6] shrink-0" />
              <h1 className="text-base font-black tracking-tight">Subscription</h1>
            </div>
          </div>
        </div>
      )}

      {/* Brand & Service Header */}
      <div className="text-center py-2 mb-3">
        <h2 className="text-xl font-black text-[#F5FAFC] tracking-tight">
          GameSwiper
        </h2>
        <p className="text-xs text-[#A9C0CE] font-medium mt-0.5">
          Official Gaming Subscription Service
        </p>
      </div>

      {/* THE ONLY SUBSCRIPTION PLAN: DAILY (2 Birr/day) */}
      <div className="p-5 rounded-3xl border border-[#00BFA6]/50 bg-[#102C40] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#00BFA6] text-[#071827] text-[10px] font-black uppercase tracking-wider">
              OFFICIAL PLAN
            </span>
            <h3 className="text-xl font-black text-[#F5FAFC] mt-2 tracking-tight">
              Daily
            </h3>
            <p className="text-xs text-[#A9C0CE] font-medium">
              24 hours full game access
            </p>
          </div>

          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-black text-[#63F5C8] font-mono leading-tight">
              2 <span className="text-sm font-sans text-[#A9C0CE] font-bold">Birr/day</span>
            </div>
            <div className="text-[10px] text-[#A9C0CE] font-semibold uppercase tracking-wider">
              Auto-renewing
            </div>
          </div>
        </div>

        <div className="border-t border-[#244558] pt-3 space-y-2 text-xs text-[#A9C0CE]">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#63F5C8] shrink-0" />
            <span>Unlimited instant access to all skill-based games</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#63F5C8] shrink-0" />
            <span>All games 100% free with unlimited play</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#63F5C8] shrink-0" />
            <span>SMS-based activation: Send <strong className="text-[#F5FAFC]">OK</strong> to <strong className="text-[#35D9F2]">7198</strong></span>
          </div>
        </div>

        {/* PRIMARY SUBSCRIBE ACTION BUTTON */}
        <button
          id="subscribe-btn"
          type="button"
          onClick={handleSubscribe}
          className="w-full py-3.5 rounded-2xl bg-[#00BFA6] hover:bg-[#63F5C8] text-[#071827] font-black text-sm tracking-wide shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          <Send className="w-4 h-4" />
          <span>Subscribe (2 Birr/day)</span>
        </button>
      </div>

      {/* SMS Guidance / Composer Opened Confirmation */}
      {isSmsPromptVisible && (
        <div className="mt-4 p-4 rounded-2xl bg-[#0B2234] border border-[#244558] text-xs text-[#A9C0CE] space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-black text-sm text-[#35D9F2]">
            <MessageSquare className="w-4 h-4" />
            <span>SMS Composer Prepared</span>
          </div>
          <p className="text-[#A9C0CE] leading-relaxed">
            Your messaging app was triggered. Please tap <strong className="text-[#F5FAFC]">Send</strong> in your SMS app to confirm your subscription:
          </p>
          <div className="grid grid-cols-2 gap-2 text-center font-mono">
            <div className="p-2 rounded-xl bg-[#102C40] border border-[#244558] shadow-2xs">
              <span className="text-[10px] text-[#A9C0CE] block font-sans uppercase font-bold">Recipient</span>
              <strong className="text-sm font-black text-[#35D9F2]">7198</strong>
            </div>
            <div className="p-2 rounded-xl bg-[#102C40] border border-[#244558] shadow-2xs">
              <span className="text-[10px] text-[#A9C0CE] block font-sans uppercase font-bold">Message</span>
              <strong className="text-sm font-black text-[#071827] bg-[#63F5C8] px-2 py-0.5 rounded-md inline-block">OK</strong>
            </div>
          </div>
          <div className="pt-1 flex gap-2">
            <a
              href="sms:7198?body=OK"
              className="flex-1 py-2 rounded-xl bg-[#00BFA6] hover:bg-[#63F5C8] text-[#071827] text-center font-black text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Open SMS App (7198)</span>
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-2 rounded-xl bg-[#15374A] border border-[#244558] hover:bg-[#244558] text-[#F5FAFC] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-[#63F5C8]" /> : <Copy className="w-3.5 h-3.5 text-[#A9C0CE]" />}
              <span>{copiedCode ? 'Copied' : 'Copy OK'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Safety & Compliance Notice */}
      <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-[#A9C0CE] font-bold">
        <ShieldCheck className="w-3.5 h-3.5 text-[#00BFA6]" />
        <span>GameSwiper • 2 Birr/day • Send OK to 7198</span>
      </div>
    </div>
  );
};
