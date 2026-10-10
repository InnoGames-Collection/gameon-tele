/**
 * Privacy Policy Page Component for TelePlus
 * 
 * Verbatim data and compliance text based on Document Section 14.24 and TelePlus privacy practices.
 */

import React from 'react';
import { ShieldCheck, ArrowLeft, Lock, Smartphone, Database, CheckCircle2 } from 'lucide-react';
import { TELEPLUS_PRIVACY_POLICY } from '../../data/teleplusContent';

interface PrivacyPageProps {
  onBack?: () => void;
  showHeader?: boolean;
}

const SECTION_ICONS = [Database, Smartphone, ShieldCheck, Lock, CheckCircle2];

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack, showHeader = true }) => {
  return (
    <div className="min-h-screen bg-[#071827] text-[#F5FAFC] pb-24 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. Header with Back Button */}
      {showHeader && (
        <div className="flex items-center justify-between gap-3 bg-[#0B2234] border border-[#244558] text-[#F5FAFC] p-3.5 rounded-2xl shadow-xs mb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                id="privacy-back-btn"
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
              <ShieldCheck className="w-5 h-5 text-[#00BFA6] shrink-0" />
              <h1 className="text-base font-black tracking-tight">Privacy Policy</h1>
            </div>
          </div>
        </div>
      )}

      {/* 2. Overview Card */}
      <div className="p-4 rounded-2xl bg-[#102C40] border border-[#244558] text-xs text-[#A9C0CE] leading-relaxed mb-4 space-y-1">
        <h2 className="font-black text-[#F5FAFC] text-sm">{TELEPLUS_PRIVACY_POLICY.title}</h2>
        <p>{TELEPLUS_PRIVACY_POLICY.summary}</p>
      </div>

      {/* 3. Sections */}
      <div className="space-y-3">
        {TELEPLUS_PRIVACY_POLICY.sections.map((section, idx) => {
          const SectionIcon = SECTION_ICONS[idx % SECTION_ICONS.length] || Lock;
          return (
            <div
              key={idx}
              className="bg-[#102C40] rounded-2xl p-4 border border-[#244558] shadow-xs space-y-2"
            >
              <div className="flex items-center gap-2">
                <SectionIcon className="w-4 h-4 text-[#35D9F2] shrink-0" />
                <h3 className="text-xs sm:text-sm font-black text-[#F5FAFC]">{section.title}</h3>
              </div>

              <div className="space-y-1.5 text-xs text-[#A9C0CE] leading-relaxed pl-1">
                {section.paragraphs.map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}

                {section.bulletPoints && (
                  <ul className="list-disc list-inside space-y-1 text-[#A9C0CE] pl-2">
                    {section.bulletPoints.map((bp, bIdx) => (
                      <li key={bIdx}>{bp}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
