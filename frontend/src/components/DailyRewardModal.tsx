/**
 * 7-Day Daily Login Streak Reward Modal
 */

import React from 'react';
import { UserProfile } from '../types';
import { DAILY_REWARD_LADDER } from '../services/demoData';
import { 
  X, 
  Flame, 
  Coins, 
  Check, 
  Gift, 
  Sparkles, 
  Lock 
} from 'lucide-react';

interface DailyRewardModalProps {
  profile: UserProfile;
  onClose: () => void;
  onClaim: () => void;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  profile,
  onClose,
  onClaim,
}) => {
  const currentStreakDay = ((profile.streak.current - 1) % 7) + 1;
  const canClaim = !profile.streak.hasClaimedToday;

  return (
    <div className="fixed inset-0 z-50 bg-[#071827]/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-[#102C40] rounded-2xl border border-[#244558] shadow-2xl p-6 relative text-[#F5FAFC]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-[#15374A] text-[#A9C0CE] hover:text-[#F5FAFC] border border-[#244558] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-[#F7C85B]/20 border border-[#F7C85B]/40 mx-auto mb-2.5 flex items-center justify-center text-[#F7C85B]">
            <Flame className="w-8 h-8 fill-current" />
          </div>
          <h3 className="text-xl font-bold text-[#F5FAFC]">Daily Streak Rewards</h3>
          <p className="text-xs text-[#A9C0CE] mt-0.5">
            Log in every day to claim bonus coins and the Day 7 Grand Walia Chest!
          </p>
        </div>

        {/* 7-Day Ladder Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-6">
          {DAILY_REWARD_LADDER.map((item) => {
            const isPast = item.day < currentStreakDay;
            const isCurrent = item.day === currentStreakDay;

            return (
              <div
                key={item.day}
                className={`relative rounded-xl p-2.5 flex flex-col items-center justify-between border text-center transition-all ${
                  isCurrent
                    ? 'bg-[#15374A] border-[#00BFA6] ring-2 ring-[#00BFA6]/40 scale-105 shadow-sm'
                    : isPast
                    ? 'bg-[#0B2234] border-[#244558] opacity-60'
                    : 'bg-[#0B2234] border-[#244558]'
                } ${item.special ? 'sm:col-span-1 col-span-2' : ''}`}
              >
                <span className="text-[10px] font-bold text-[#A9C0CE]">Day {item.day}</span>

                <div className="my-1.5 flex flex-col items-center">
                  {item.special ? (
                    <div className="w-7 h-7 rounded-lg bg-[#F7C85B]/20 text-[#F7C85B] flex items-center justify-center">
                      <Gift className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-[#15374A] flex items-center justify-center text-[#F7C85B]">
                      <Coins className="w-4 h-4" />
                    </div>
                  )}
                  <span className="text-xs font-bold text-[#F5FAFC] font-mono mt-0.5">
                    +{item.coins}
                  </span>
                </div>

                {isPast ? (
                  <div className="w-4 h-4 rounded-full bg-[#63F5C8] text-[#071827] flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : isCurrent ? (
                  <span className="text-[9px] font-bold text-[#63F5C8] uppercase">Today</span>
                ) : (
                  <Lock className="w-3.5 h-3.5 text-[#A9C0CE]" />
                )}
              </div>
            );
          })}
        </div>

        {/* Claim Action */}
        {canClaim ? (
          <button
            onClick={() => {
              onClaim();
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-[#00BFA6] hover:bg-[#63F5C8] text-[#071827] font-extrabold text-sm active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>CLAIM DAY {currentStreakDay} REWARD</span>
          </button>
        ) : (
          <div className="text-center py-2 px-4 rounded-xl bg-[#0B2234] border border-[#244558] text-xs text-[#A9C0CE] font-medium">
            You have already claimed today's reward. Streak continues tomorrow!
          </div>
        )}
      </div>
    </div>
  );
};
