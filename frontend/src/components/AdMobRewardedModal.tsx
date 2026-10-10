/**
 * Google AdMob Rewarded Video Modal Component
 * Midnight Navy Theme
 */

import React, { useState, useEffect } from 'react';
import { RewardedAdState } from '../types';
import { 
  X, 
  Tv, 
  Coins, 
  Sparkles, 
  CheckCircle2, 
  Volume2, 
  VolumeX
} from 'lucide-react';

interface AdMobRewardedModalProps {
  adState: RewardedAdState;
  onClose: () => void;
}

export const AdMobRewardedModal: React.FC<AdMobRewardedModalProps> = ({
  adState,
  onClose,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(adState.durationSeconds || 5);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      setIsCompleted(true);
      adState.onRewardClaimed();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, adState]);

  const progressPercent = Math.min(
    100,
    ((adState.durationSeconds - secondsRemaining) / adState.durationSeconds) * 100
  );

  return (
    <div
      id="admob-rewarded-modal"
      className="fixed inset-0 z-50 bg-[#071827]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none"
    >
      <div className="w-full max-w-md bg-[#102C40] text-[#F5FAFC] rounded-2xl border border-[#244558] shadow-2xl overflow-hidden relative flex flex-col">
        {/* Top Header Bar */}
        <div className="px-4 py-3 bg-[#0B2234] border-b border-[#244558] text-[#F5FAFC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#15374A] border border-[#244558] text-[#A9C0CE] text-[10px] font-mono font-black uppercase tracking-wider">
              Rewarded Ad
            </span>
            <span className="text-xs font-bold text-[#F5FAFC] truncate max-w-[160px]">
              {adState.brand || 'EthioTelecom Sponsor'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg bg-[#15374A] text-[#A9C0CE] hover:text-[#F5FAFC] border border-[#244558] cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {isCompleted ? (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-[#00BFA6] text-[#071827] hover:bg-[#63F5C8] font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <span className="text-xs font-mono font-black text-[#F7C85B] px-2 py-1 bg-[#15374A] rounded-lg border border-[#244558]">
                Reward in {secondsRemaining}s
              </span>
            )}
          </div>
        </div>

        {/* Reward Contract Notice Banner */}
        <div className="bg-[#15374A] px-4 py-2 border-b border-[#244558] flex items-center justify-between text-xs font-black">
          <div className="flex items-center gap-1.5 text-[#F7C85B]">
            <Sparkles className="w-4 h-4 text-[#F7C85B]" />
            <span>Guaranteed Reward:</span>
          </div>
          <span className="text-[#63F5C8] font-mono font-extrabold flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 fill-current text-[#F7C85B]" /> +{adState.rewardAmount || 20} Coins
          </span>
        </div>

        {/* Video Canvas Container */}
        <div className="relative aspect-video bg-[#071827] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-[#15374A] border border-[#244558] flex items-center justify-center text-[#00BFA6] shadow-md mb-2">
            <Tv className="w-8 h-8" />
          </div>

          <h3 className="text-base font-black text-[#F5FAFC] mb-1">
            {adState.brand || 'TeleBirr SuperApp'}
          </h3>
          <p className="text-xs text-[#A9C0CE] max-w-xs">
            Send money to anyone across Ethiopia with 0% service charge using your verified phone number.
          </p>

          {/* Progress bar at bottom of video */}
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-[#0B2234]">
            <div
              className="h-full bg-[#00BFA6] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Completion Action Bar */}
        <div className="p-4 bg-[#0B2234] border-t border-[#244558]">
          {isCompleted ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs font-black text-[#63F5C8]">
                <CheckCircle2 className="w-5 h-5" />
                <span>Reward unlocked & credited to your account!</span>
              </div>
              <button
                id="claim-rewarded-ad-close-btn"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-[#00BFA6] hover:bg-[#63F5C8] text-[#071827] font-black text-sm active:scale-95 transition-all shadow-sm uppercase tracking-wider cursor-pointer"
              >
                Collect & Return to Game
              </button>
            </div>
          ) : (
            <div className="text-center text-xs text-[#A9C0CE] font-medium">
              Please watch the full sponsor message ({secondsRemaining}s remaining) to receive your reward.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
