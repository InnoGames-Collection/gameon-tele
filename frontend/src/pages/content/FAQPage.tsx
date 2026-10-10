/**
 * FAQ Page Component for TelePlus
 * 
 * Features:
 * - Standard expandable/collapsible accordion design
 * - Each FAQ question appears as a separate row/item
 * - Left: Question text; Right: Dynamic '+' (collapsed) or '−' (expanded) icon
 * - Entire FAQ row is clickable
 * - Smooth expansion/collapse
 * - All 27 questions from the official source of truth document
 */

import React, { useState } from 'react';
import { HelpCircle, ArrowLeft, Plus, Minus, Search } from 'lucide-react';
import { TELEPLUS_FAQ_ITEMS, FAQItem } from '../../data/teleplusContent';

interface FAQPageProps {
  onBack?: () => void;
  showHeader?: boolean;
}

export const FAQPage: React.FC<FAQPageProps> = ({ onBack, showHeader = true }) => {
  // Set of opened question IDs (allows multiple open or accordion toggle)
  const [openItemIds, setOpenItemIds] = useState<Record<string, boolean>>({
    'faq-1': true, // Open first item by default for quick preview
  });
  const [searchQuery, setSearchQuery] = useState('');

  const toggleItem = (id: string) => {
    setOpenItemIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allOpen: Record<string, boolean> = {};
    TELEPLUS_FAQ_ITEMS.forEach((item) => {
      allOpen[item.id] = true;
    });
    setOpenItemIds(allOpen);
  };

  const collapseAll = () => {
    setOpenItemIds({});
  };

  const filteredItems = TELEPLUS_FAQ_ITEMS.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-[#45365F] pb-24 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. Header with Back Button */}
      {showHeader && (
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#7048E8] to-[#38205F] text-white p-3.5 rounded-2xl shadow-xs mb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                id="faq-back-btn"
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
              <HelpCircle className="w-5 h-5 text-[#C6F36B] shrink-0" />
              <h1 className="text-base font-black tracking-tight">FAQ</h1>
            </div>
          </div>
        </div>
      )}

      {/* 2. Quick Search & Controls */}
      <div className="space-y-2.5 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#827695]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or topics..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFF8EE]/40 border border-[#E7DFF3] text-xs font-medium text-[#38205F] placeholder:text-[#827695] focus:outline-none focus:border-[#7048E8]"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#827695] px-1">
          <span>Click any question to view answer</span>
          <div className="flex items-center gap-3">
            <button
              onClick={expandAll}
              className="text-[#7048E8] hover:underline font-bold cursor-pointer"
            >
              Expand All
            </button>
            <span>•</span>
            <button
              onClick={collapseAll}
              className="text-[#827695] hover:underline font-bold cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* 3. Accordion List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-[#FFF8EE] rounded-2xl border border-[#E7DFF3] text-[#827695] text-xs">
            No questions matched your search query.
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const isOpen = !!openItemIds[item.id];
            return (
              <div
                key={item.id}
                id={`faq-item-${item.id}`}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-white border-[#7048E8]/40 shadow-xs'
                    : 'bg-white border-[#E7DFF3] hover:border-[#7048E8]/30 shadow-2xs'
                }`}
              >
                {/* Accordion Row Header */}
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer select-none group"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <span className="text-[10px] font-black font-mono text-[#7048E8] mt-0.5 shrink-0 px-1.5 py-0.5 rounded bg-[#F1ECFF]">
                      Q{index + 1}
                    </span>
                    <span
                      className={`text-xs sm:text-sm font-black leading-snug transition-colors ${
                        isOpen ? 'text-[#7048E8]' : 'text-[#38205F] group-hover:text-[#7048E8]'
                      }`}
                    >
                      {item.question}
                    </span>
                  </div>

                  {/* Dynamic + / − Toggle Icon */}
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isOpen
                        ? 'bg-[#7048E8] text-white'
                        : 'bg-[#F1ECFF] text-[#7048E8] group-hover:bg-[#E7DFF3]'
                    }`}
                  >
                    {isOpen ? (
                      <Minus className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    )}
                  </div>
                </button>

                {/* Expanded Answer Content */}
                {isOpen && (
                  <div className="px-4 pb-4 pt-2 border-t border-[#E7DFF3] bg-[#FFF8EE]/40 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="text-xs text-[#45365F] leading-relaxed whitespace-pre-line pl-7">
                      {item.answer}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
