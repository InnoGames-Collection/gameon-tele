/**
 * GameOn Tele - Official Leaderboard Page
 * 
 * Strict Requirement:
 * The MAIN LEADERBOARD tab shows ONLY:
 * HELIX DAILY CHALLENGE 7-DAY LEADERBOARD
 * 
 * Displays ONLY:
 * RANK | MASKED MSISDN | 7-DAY SCORE
 */

import React, { useMemo } from 'react';
import { UserProfile, GameDefinition } from '../types';
import { HelixCompetitionService, HELIX_PRIZE_RULES } from '../services/helixCompetitionService';
import { GameRegistry } from '../games/registry';
import { Trophy, Play, Flame } from 'lucide-react';

interface LeaderboardPageProps {
  profile: UserProfile;
  games?: GameDefinition[];
  onPlayGame?: (game: GameDefinition) => void;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({
  profile,
  onPlayGame,
}) => {
  const helixPeriod = useMemo(() => {
    return HelixCompetitionService.getCurrentPeriod();
  }, []);

  const helixUserScores = useMemo(() => {
    return HelixCompetitionService.getUserScores(profile);
  }, [profile]);

  const [remoteEntries, setRemoteEntries] = React.useState<any[]>([]);

  React.useEffect(() => {
    let isMounted = true;
    HelixCompetitionService.fetchCurrentCompetition(profile).then((data) => {
      if (data && data.leaderboard && data.leaderboard.length > 0 && isMounted) {
        setRemoteEntries(data.leaderboard);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [profile]);

  const helixLeaderboard = useMemo(() => {
    if (remoteEntries.length > 0) return remoteEntries;
    return HelixCompetitionService.getLeaderboard(profile);
  }, [remoteEntries, profile]);

  const maskedUserPhone = useMemo(() => {
    return HelixCompetitionService.maskMsisdn(profile.phoneNumber);
  }, [profile.phoneNumber]);

  const handlePlayHelix = () => {
    const helix = GameRegistry.getGameById('helix-jump');
    if (helix && onPlayGame) {
      onPlayGame(helix);
    }
  };

  return (
    <div className="min-h-screen bg-[#071827] text-[#F5FAFC] pb-24 select-none">
      <div className="max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 sm:px-4 pt-3 space-y-4">
        
        {/* =========================================================================
            HEADER BANNER: HELIX DAILY CHALLENGE 7-DAY COMPETITION
           ========================================================================= */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[#0B2234] text-[#F5FAFC] shadow-sm border border-[#244558] relative overflow-hidden space-y-3">
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00BFA6] text-[#071827] text-[10px] font-black uppercase tracking-wider shadow-xs">
                <Flame className="w-3 h-3 fill-current" />
                <span>DAILY CHALLENGE</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#F5FAFC] tracking-tight">
                Helix 7-Day Leaderboard
              </h1>
              <p className="text-xs text-[#A9C0CE] font-medium">
                Rolling 7-day tournament ranking by Total 7-Day Score.
              </p>
            </div>

            <button
              type="button"
              id="leaderboard-play-helix-btn"
              onClick={handlePlayHelix}
              className="px-4 py-2.5 rounded-2xl bg-[#00BFA6] hover:bg-[#63F5C8] active:scale-95 text-[#071827] font-black text-xs transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>PLAY NOW</span>
            </button>
          </div>

          {/* User's Current Status Strip */}
          <div className="relative z-10 grid grid-cols-2 gap-2 pt-1 border-t border-[#244558]">
            <div className="bg-[#102C40] border border-[#244558] rounded-xl p-2.5 text-center">
              <span className="text-[10px] uppercase font-bold text-[#A9C0CE] block">Your Rank</span>
              <strong className="text-base font-black text-[#F5FAFC] font-mono">
                {helixUserScores.rank > 0 ? `#${helixUserScores.rank}` : '-'}
              </strong>
            </div>
            <div className="bg-[#102C40] border border-[#244558] rounded-xl p-2.5 text-center">
              <span className="text-[10px] uppercase font-bold text-[#A9C0CE] block">Your 7-Day Score</span>
              <strong className="text-base font-black text-[#63F5C8] font-mono">
                {helixUserScores.sevenDayScore.toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="absolute -right-6 -bottom-8 w-28 h-28 bg-[#00BFA6]/15 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* =========================================================================
            PRIZE RULES STRIP (Official configured distribution)
           ========================================================================= */}
        <div className="p-3 rounded-2xl bg-[#102C40] border border-[#244558] space-y-1.5">
          <div className="text-[11px] font-black uppercase text-[#F7C85B] flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-[#F7C85B]" />
            <span>7-Day Championship Rewards</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            {HELIX_PRIZE_RULES.map((p) => (
              <div key={p.rank} className="p-2 rounded-xl bg-[#15374A] border border-[#244558] shadow-2xs">
                <span className="text-[10px] font-extrabold text-[#A9C0CE] block">{p.label}</span>
                <span className="text-xs font-black text-[#F7C85B]">{p.reward}</span>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            MAIN LEADERBOARD TABLE
            Display ONLY:
            RANK | MASKED MSISDN | 7-DAY SCORE
           ========================================================================= */}
        <div className="bg-[#102C40] rounded-3xl border border-[#244558] shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 px-4 py-3 bg-[#0B2234] border-b border-[#244558] text-[11px] font-black uppercase tracking-wider text-[#A9C0CE]">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-6 text-left">Masked MSISDN</div>
            <div className="col-span-4 text-right">7-Day Score</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-[#244558]">
            {helixLeaderboard.map((entry) => {
              const isUser = entry.isCurrentUser || entry.maskedMsisdn === maskedUserPhone;
              const isTop1 = entry.rank === 1;
              const isTop2 = entry.rank === 2;
              const isTop3 = entry.rank === 3;

              return (
                <div
                  key={entry.playerId}
                  className={`grid grid-cols-12 px-4 py-3.5 items-center transition-colors ${
                    isUser
                      ? 'bg-[#15374A] border-l-4 border-l-[#00BFA6]'
                      : 'hover:bg-[#15374A]/50'
                  }`}
                >
                  {/* 1. Rank */}
                  <div className="col-span-2 flex items-center justify-center">
                    {isTop1 ? (
                      <div className="w-7 h-7 rounded-full bg-[#F7C85B] text-[#071827] font-black text-xs flex items-center justify-center shadow-xs">
                        1
                      </div>
                    ) : isTop2 ? (
                      <div className="w-7 h-7 rounded-full bg-[#35D9F2] text-[#071827] font-black text-xs flex items-center justify-center shadow-xs">
                        2
                      </div>
                    ) : isTop3 ? (
                      <div className="w-7 h-7 rounded-full bg-[#15374A] border border-[#244558] text-[#F7C85B] font-black text-xs flex items-center justify-center shadow-xs">
                        3
                      </div>
                    ) : (
                      <span className="font-mono font-bold text-xs text-[#A9C0CE]">
                        {entry.rank}
                      </span>
                    )}
                  </div>

                  {/* 2. Masked MSISDN */}
                  <div className="col-span-6 flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#F5FAFC] tracking-wider">
                      {entry.maskedMsisdn}
                    </span>
                    {isUser && (
                      <span className="px-1.5 py-0.5 rounded-md bg-[#00BFA6] text-[#071827] text-[9px] font-black uppercase">
                        YOU
                      </span>
                    )}
                  </div>

                  {/* 3. 7-Day Score */}
                  <div className="col-span-4 text-right">
                    <span className="font-mono font-black text-sm text-[#63F5C8]">
                      {entry.sevenDayScore.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-[#A9C0CE] ml-1">pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center pt-2 text-[11px] text-[#A9C0CE] font-medium">
          Official GameSwiper 7-Day Leaderboard • Cycle #{helixPeriod.cycleNumber}
        </div>

      </div>
    </div>
  );
};
