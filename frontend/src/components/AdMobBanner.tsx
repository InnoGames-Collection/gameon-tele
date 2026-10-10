/**
 * Google AdMob Banner Placement Component
 * Midnight Navy Theme
 */

import React from 'react';
import { ExternalLink } from 'lucide-react';

interface AdMobBannerProps {
  placementId?: string;
  className?: string;
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({
  placementId = 'teleplay_home_footer_banner',
  className = '',
}) => {
  return (
    <div
      id={`admob-banner-${placementId}`}
      className={`w-full max-w-4xl mx-auto my-3 rounded-xl bg-[#102C40] border border-[#244558] p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-[#F5FAFC] ${className}`}
    >
      {/* Sponsor Branding */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="w-10 h-10 rounded-xl bg-[#15374A] border border-[#244558] flex items-center justify-center text-[#00BFA6] font-black text-xs shrink-0 shadow-sm">
          ET
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-[#15374A] border border-[#244558] text-[9px] font-mono font-bold text-[#A9C0CE] uppercase tracking-wider">
              Ad • EthioTelecom 5G
            </span>
            <span className="text-[10px] text-[#63F5C8] font-bold">Ultra Broadband</span>
          </div>
          <p className="text-xs text-[#A9C0CE] font-medium line-clamp-1 mt-0.5">
            Upgrade your SIM to 5G today at any EthioTelecom regional point of service.
          </p>
        </div>
      </div>

      {/* AdMob Non-Deceptive CTA */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <span className="text-[10px] text-[#A9C0CE] font-mono hidden md:inline">Google AdMob Placement</span>
        <a
          href="https://www.ethiotelecom.et"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-lg bg-[#15374A] hover:bg-[#244558] text-[#35D9F2] font-bold text-xs border border-[#244558] transition-colors flex items-center gap-1 shadow-xs"
        >
          <span>Learn More</span>
          <ExternalLink className="w-3 h-3 text-[#35D9F2]" />
        </a>
      </div>
    </div>
  );
};
