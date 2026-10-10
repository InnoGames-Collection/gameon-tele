/**
 * GameOn Tele - Official Pricing Page
 * 
 * Strict Requirement:
 * - Brand: GameOn Tele
 * - Daily subscription: 2 Birr/day
 * - Subscription shortcode: 7198
 * - SMS: Send OK to 7198
 */

import React from 'react';
import { 
  ArrowLeft, 
  Tag, 
  ShieldCheck, 
  Send, 
  CheckCircle2 
} from 'lucide-react';

interface PricingPageProps {
  onBack?: () => void;
  showHeader?: boolean;
}

export const PricingPage: React.FC<PricingPageProps> = ({
  onBack,
  showHeader = true,
}) => {
  const handleOpenSms = () => {
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const separator = isIOS ? '&' : '?';
    window.location.href = `sms:7198${separator}body=OK`;
  };

  return (
    <div className="min-h-screen bg-[#071827] text-[#F5FAFC] pb-24 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header with Back Button */}
      {showHeader && (
        <div className="flex items-center justify-between gap-3 bg-[#0B2234] border border-[#244558] text-[#F5FAFC] p-3.5 rounded-2xl shadow-xs mb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                id="pricing-back-btn"
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
              <Tag className="w-5 h-5 text-[#35D9F2] shrink-0" />
              <h1 className="text-base font-black tracking-tight">Pricing</h1>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Brand & Plan Header */}
        <div className="text-center py-2">
          <h2 className="text-2xl font-black text-[#F5FAFC] tracking-tight">
            GameSwiper
          </h2>
          <p className="text-xs text-[#A9C0CE] font-semibold mt-0.5">
            Transparent, straightforward pricing
          </p>
        </div>

        {/* Pricing Card */}
        <div className="p-5 rounded-3xl border border-[#244558] bg-[#102C40] shadow-xs space-y-4">
          <div className="flex items-baseline justify-between border-b border-[#244558] pb-3">
            <div>
              <span className="px-2.5 py-0.5 rounded-md bg-[#00BFA6] text-[#071827] text-[10px] font-black uppercase tracking-wider">
                DAILY SUBSCRIPTION
              </span>
              <h3 className="text-lg font-black text-[#F5FAFC] mt-1.5">
                Full Game Access
              </h3>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-[#63F5C8] font-mono">
                2 Birr/day
              </div>
              <div className="text-[10px] text-[#A9C0CE] font-bold uppercase">
                Billed daily
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs text-[#A9C0CE]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#63F5C8] shrink-0" />
              <span>Unlimited access to all skill-based games without coin limits</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#63F5C8] shrink-0" />
              <span>All games 100% free with unlimited gameplay</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#63F5C8] shrink-0" />
              <span>Personal high scores and record tracking</span>
            </div>
          </div>

          {/* SMS Activation Details Box */}
          <div className="p-3.5 rounded-2xl bg-[#0B2234] border border-[#244558] space-y-2">
            <div className="text-xs font-black text-[#F5FAFC] uppercase tracking-wide">
              How to Subscribe
            </div>
            <div className="grid grid-cols-2 gap-2 text-center font-mono">
              <div className="p-2 rounded-xl bg-[#15374A] border border-[#244558]">
                <span className="text-[10px] text-[#A9C0CE] block font-sans uppercase font-bold">Shortcode</span>
                <strong className="text-sm font-black text-[#35D9F2]">7198</strong>
              </div>
              <div className="p-2 rounded-xl bg-[#15374A] border border-[#244558]">
                <span className="text-[10px] text-[#A9C0CE] block font-sans uppercase font-bold">SMS Message</span>
                <strong className="text-sm font-black text-[#071827] bg-[#63F5C8] px-2 py-0.5 rounded-md inline-block">OK</strong>
              </div>
            </div>
            <p className="text-[11px] text-[#A9C0CE] text-center pt-0.5">
              Send <strong className="text-[#F5FAFC]">OK</strong> to <strong className="text-[#35D9F2]">7198</strong> from your mobile device.
            </p>
          </div>

          {/* Button to open SMS */}
          <button
            type="button"
            onClick={handleOpenSms}
            className="w-full py-3 rounded-2xl bg-[#00BFA6] hover:bg-[#63F5C8] text-[#071827] font-black text-xs transition-transform active:scale-98 shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send OK to 7198</span>
          </button>
        </div>

        {/* Regulatory Footer */}
        <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-[#A9C0CE] font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00BFA6]" />
          <span>GameSwiper • Official EthioTelecom VAS Service • Shortcode 7198</span>
        </div>
      </div>
    </div>
  );
};
