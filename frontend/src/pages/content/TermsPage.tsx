/**
 * Terms & Conditions Page Component for GameON Tele
 */

import React from 'react';
import { FileText, ArrowLeft, ShieldCheck } from 'lucide-react';

interface TermSection {
  number: string;
  title: string;
  paragraphs: string[];
  bulletPoints?: string[];
}

const GOPLAY_TERMS: TermSection[] = [
  {
    number: '1.0',
    title: 'GameSwiper Service Description',
    paragraphs: [
      'GameSwiper is an official interactive mobile gaming Value-Added Service (VAS) operated in partnership with EthioTelecom.',
      'GameSwiper provides instant, unlimited mobile access to skill-based games with zero downloads required and 100% free gameplay across all titles.',
    ],
  },
  {
    number: '2.0',
    title: 'Subscription & SMS Service Shortcode 7198',
    paragraphs: [
      'Subscribers activate the service by sending SMS "OK" to shortcode 7198 from an active EthioTelecom mobile line, or via official online authorization.',
      'The service subscription fee is 2 ETB per day, charged directly via standard mobile airtime deduction. All games remain 100% free to play with unlimited retries and no pay-per-play barriers.',
    ],
  },
  {
    number: '3.0',
    title: 'Cancellation & Service Management',
    paragraphs: [
      'Subscribers may cancel their subscription at any time without penalty by sending SMS "STOP" to shortcode 7198.',
      'Upon cancellation, service access continues until the end of the current paid billing cycle. Subscribers may reactivate at any time by sending "OK" to 7198.',
    ],
  },
  {
    number: '4.0',
    title: 'Free Catalog & Gameplay Access',
    paragraphs: [
      'All titles in the GameSwiper catalog are free to play. There are no coin deductions, no paywalls, and no hidden micro-transactions.',
      'Players can enjoy full arcade, puzzle, sports, board, and racing titles as many times as desired.',
    ],
  },
  {
    number: '5.0',
    title: 'Fair Play & Anti-Cheating Policy',
    paragraphs: [
      'All games are skill-based. Players must achieve scores solely through legitimate manual gameplay on mobile browsers.',
      'Any use of automated scripts, bots, modified client software, network tampering, or fraudulent score submissions is strictly prohibited and will result in immediate account restriction.',
    ],
  },
  {
    number: '6.0',
    title: 'Privacy & MSISDN Protection',
    paragraphs: [
      'GameSwiper strictly protects subscriber privacy. Phone numbers (MSISDNs) are kept confidential and protected in strict compliance with telecommunications regulations and Ethiopian data protection laws.',
      'Personal data collected is limited strictly to subscriber authentication, session management, and service delivery.',
    ],
  },
  {
    number: '7.0',
    title: 'Disputes & Customer Support',
    paragraphs: [
      'For customer assistance, billing questions, or technical support, subscribers can consult the Help & Support section or reach out via EthioTelecom customer care.',
      'GameSwiper reserves the right to perform routine maintenance, optimize performance, and deliver updates to ensure uninterrupted quality.',
    ],
  },
  {
    number: '8.0',
    title: 'Acceptance of Terms',
    paragraphs: [
      'By accessing GameSwiper or subscribing via shortcode 7198, the subscriber acknowledges and agrees to be bound by these Terms & Conditions.',
    ],
  },
];

interface TermsPageProps {
  onBack?: () => void;
  showHeader?: boolean;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack, showHeader = true }) => {
  return (
    <div className="min-h-screen bg-white text-[#45365F] pb-24 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. Header with Back Button */}
      {showHeader && (
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#7048E8] to-[#38205F] text-white p-3.5 rounded-2xl shadow-xs mb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                id="terms-back-btn"
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
              <FileText className="w-5 h-5 text-[#C6F36B] shrink-0" />
              <h1 className="text-base font-black tracking-tight">Terms & Conditions</h1>
            </div>
          </div>
        </div>
      )}

      {/* 2. Top Summary Card */}
      <div className="p-3.5 rounded-2xl bg-[#FFF8EE] border border-[#E7DFF3] text-xs text-[#45365F] leading-relaxed mb-4">
        <p className="font-bold text-[#38205F]">
          Official GameSwiper Gaming Terms & Conditions
        </p>
        <p className="text-[11px] text-[#827695] mt-1">
          Governing EthioTelecom VAS Shortcode 7198 subscription, fair play, and subscriber data protection.
        </p>
      </div>

      {/* 3. Terms Sections */}
      <div className="space-y-3">
        {GOPLAY_TERMS.map((section) => (
          <div
            key={section.number}
            id={`term-section-${section.number.replace('.', '-')}`}
            className="bg-white rounded-2xl p-4 border border-[#E7DFF3] shadow-xs space-y-2"
          >
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#F1ECFF] text-[#7048E8] font-mono font-black text-xs">
                {section.number}
              </span>
              <h2 className="text-xs sm:text-sm font-black text-[#38205F]">{section.title}</h2>
            </div>

            <div className="space-y-1.5 text-xs text-[#45365F] leading-relaxed pl-1">
              {section.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}

              {section.bulletPoints && section.bulletPoints.length > 0 && (
                <ul className="list-disc list-inside space-y-1 text-[#45365F] pl-2">
                  {section.bulletPoints.map((bp, bIdx) => (
                    <li key={bIdx}>{bp}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-[#827695] font-bold">
        <ShieldCheck className="w-3.5 h-3.5 text-[#7048E8]" />
        <span>GameSwiper Official Service Terms • EthioTelecom 7198</span>
      </div>
    </div>
  );
};

