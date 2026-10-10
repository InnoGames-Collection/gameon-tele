/**
 * Google AdMob Interstitial Ad Modal Component
 * Midnight Navy Theme
 */

import React, { useState, useEffect } from 'react';
import { InterstitialAdState } from '../types';
import { X, Tv, ExternalLink, ShieldCheck } from 'lucide-react';

interface AdMobInterstitialModalProps {
  adState: InterstitialAdState;
  onClose: () => void;
}

export const AdMobInterstitialModal: React.FC<AdMobInterstitialModalProps> = ({
  adState,
  onClose,
}) => {
  const [canSkipInSeconds, setCanSkipInSeconds] = useState(3);

  useEffect(() => {
    if (canSkipInSeconds <= 0) return;

    const timer = setInterval(() => {
      setCanSkipInSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [canSkipInSeconds]);

  return (
    <div
      id="admob-interstitial-modal"
      className="fixed inset-0 z-50 bg-[#071827]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none"
    >
      <div className="w-full max-w-lg bg-[#102C40] text-[#F5FAFC] rounded-2xl border border-[#244558] shadow-2xl overflow-hidden relative flex flex-col">
        {/* Top Controls */}
        <div className="px-4 py-3 bg-[#0B2234] border-b border-[#244558] text-[#F5FAFC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#15374A] border border-[#244558] text-[#A9C0CE] text-[10px] font-mono font-bold uppercase">
              Ad • Google AdMob
            </span>
            <span className="text-xs font-bold text-[#F5FAFC]">EthioTelecom Sponsor</span>
          </div>

          <div>
            {canSkipInSeconds > 0 ? (
              <span className="text-xs font-mono font-bold text-[#A9C0CE] px-2.5 py-1 bg-[#15374A] rounded-lg border border-[#244558]">
                Skip in {canSkipInSeconds}s
              </span>
            ) : (
              <button
                id="skip-interstitial-ad-btn"
                onClick={onClose}
                className="px-3 py-1 rounded-lg bg-[#00BFA6] hover:bg-[#63F5C8] text-[#071827] font-black text-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Skip Ad</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Sponsor Banner Area */}
        <div className="p-6 sm:p-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#15374A] border border-[#244558] flex items-center justify-center text-[#00BFA6] shadow-sm mb-4">
            <Tv className="w-10 h-10" />
          </div>

          <h3 className="text-xl font-black text-[#F5FAFC] mb-2">
            {adState.brand || 'EthioTelecom TeleCloud & 5G'}
          </h3>
          <p className="text-xs sm:text-sm text-[#A9C0CE] max-w-sm mb-6 leading-relaxed">
            Power your business and digital lifestyle with high-speed 5G network coverage and unlimited fiber connectivity.
          </p>

          <a
            href="https://www.ethiotelecom.et"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl bg-[#00BFA6] hover:bg-[#63F5C8] text-[#071827] font-black text-xs sm:text-sm active:scale-95 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <span>Explore Official Packages</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#0B2234] border-t border-[#244558] text-[11px] text-[#A9C0CE] text-center flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#63F5C8]" />
          <span>EthioTelecom Value Added Services FairPlay Advertising Standard</span>
        </div>
      </div>
    </div>
  );
};
