/**
 * GameOn Tele - Official Pricing Page
 * 
 * Strict Requirement:
 * - Brand: GameOn Tele
 * - Daily subscription: 2 Birr/day
 * - Subscription shortcode: 9595
 * - SMS: Send OK to 9595
 * - Zero references to Weekly pricing, Monthly pricing, Coins, Coin packages, Top Up, Tele Plus, GoPlay, or old shortcodes.
 */

import React from 'react';
import { 
  ArrowLeft, 
  Tag, 
  ShieldCheck,
  Send,
  MessageSquare,
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
    window.location.href = `sms:9595${separator}body=OK`;
  };

  return (
    <div className="min-h-screen bg-white text-[#17202A] pb-24 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none">
      {/* Header with Back Button */}
      {showHeader && (
        <div className="flex items-center justify-between gap-3 bg-[#1688C9] text-white p-3.5 rounded-2xl shadow-xs mb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                id="pricing-back-btn"
                onClick={onBack}
                className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
                title="Go Back"
                aria-label="Go Back"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span className="sr-only">Go Back</span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-lime-300 shrink-0" />
              <h1 className="text-base font-black tracking-tight">Pricing</h1>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Brand & Plan Header */}
        <div className="text-center py-2">
          <h2 className="text-2xl font-black text-[#17202A] tracking-tight">
            GameOn Tele
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Transparent, straightforward pricing
          </p>
        </div>

        {/* Pricing Card */}
        <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
          <div className="flex items-baseline justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="px-2.5 py-0.5 rounded-md bg-[#8BCB3D] text-white text-[10px] font-black uppercase tracking-wider">
                DAILY SUBSCRIPTION
              </span>
              <h3 className="text-lg font-black text-[#17202A] mt-1.5">
                Full Game Access
              </h3>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-[#1688C9] font-mono">
                2 Birr/day
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">
                Billed daily
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#8BCB3D] shrink-0" />
              <span>Unlimited access to all skill-based games without coin limits</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#8BCB3D] shrink-0" />
              <span>Participate in rolling tournaments and daily championships</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#8BCB3D] shrink-0" />
              <span>Official leaderboards with full ranking visibility</span>
            </div>
          </div>

          {/* SMS Activation Details Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-xs font-black text-slate-900 uppercase tracking-wide">
              How to Subscribe
            </div>
            <div className="grid grid-cols-2 gap-2 text-center font-mono">
              <div className="p-2 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">Shortcode</span>
                <strong className="text-sm font-black text-[#1688C9]">9595</strong>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">SMS Message</span>
                <strong className="text-sm font-black text-[#8BCB3D]">OK</strong>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 text-center pt-0.5">
              Send <strong>OK</strong> to <strong>9595</strong> from your mobile device.
            </p>
          </div>

          {/* Button to open SMS */}
          <button
            type="button"
            onClick={handleOpenSms}
            className="w-full py-3 rounded-2xl bg-[#8BCB3D] hover:bg-[#7cb934] text-white font-black text-xs transition-transform active:scale-98 shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send OK to 9595</span>
          </button>
        </div>

        {/* Regulatory Footer */}
        <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#8BCB3D]" />
          <span>GameOn Tele • Official EthioTelecom VAS Service • Shortcode 9595</span>
        </div>
      </div>
    </div>
  );
};
