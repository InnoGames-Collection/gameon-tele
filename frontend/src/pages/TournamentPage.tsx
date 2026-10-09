/**
 * TelePlus - Official Helix 7-Day Weekly Competition & Tournament Page
 * 
 * Strict Architecture:
 * - Operates in continuous 7-day cycles (Day 1 of 7 to Day 7 of 7)
 * - Single designated competition game: Helix (40-level 3D cylinder drop)
 * - Daily Best Score registration + 7-Day cumulative total score
 * - Real-time countdown timer & cycle indicator
 * - Official TelePlus Cash Prize Structure:
 *   • 1st Place: 20,000 ETB Cash Prize
 *   • 2nd Place: 10,000 ETB Cash Prize
 *   • 3rd Place: 5,000 ETB Cash Prize
 *   • 4th - 8th Place: 1,000 ETB Cash Prize each
 * - Strict Privacy: MSISDNs masked in 091*****890 format, zero player names/emails
 * - Direct instant "PLAY HELIX NOW" CTA launcher
 */

import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, GameDefinition } from '../types';
import { 
  HelixCompetitionService, 
  HELIX_PRIZE_RULES,
  HelixLeaderboardEntry 
} from '../services/helixCompetitionService';
import { GameRegistry } from '../games/registry';
import { 
  Trophy, 
  Clock, 
  Play, 
  Crown, 
  Medal, 
  ShieldCheck, 
  Calendar
} from 'lucide-react';

interface TournamentPageProps {
  profile: UserProfile;
  onPlayGame: (game: GameDefinition) => void;
}

export const TournamentPage: React.FC<TournamentPageProps> = ({
  profile,
  onPlayGame,
}) => {
  // 1. Live Countdown ticker every second
  const [ticker, setTicker] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTicker((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch authoritative Helix competition period & user data
  const competitionPeriod = useMemo(() => {
    return HelixCompetitionService.getCurrentPeriod();
  }, [ticker]);

  const userCompetitionScores = useMemo(() => {
    return HelixCompetitionService.getUserScores(profile);
  }, [profile, ticker]);

  // 3. Live remote competition data & dynamic prize config from PostgreSQL
  const [remoteLeaderboard, setRemoteLeaderboard] = useState<HelixLeaderboardEntry[]>([]);
  const [remotePoolEtb, setRemotePoolEtb] = useState<number>(40000);
  const [remotePrizes, setRemotePrizes] = useState<Record<string, number>>({
    '1': 20000,
    '2': 10000,
    '3': 5000,
    '4': 1000,
    '5': 1000,
    '6': 1000,
    '7': 1000,
    '8': 1000,
  });

  useEffect(() => {
    let isMounted = true;
    HelixCompetitionService.fetchCurrentCompetition(profile).then((data) => {
      if (data && isMounted) {
        if (data.leaderboard && data.leaderboard.length > 0) {
          setRemoteLeaderboard(data.leaderboard);
        }
        if (data.prizeConfig) {
          setRemotePoolEtb(data.prizeConfig.total_pool_etb || 40000);
          if (data.prizeConfig.prize_map) {
            setRemotePrizes(data.prizeConfig.prize_map);
          }
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [profile, ticker]);

  const displayLeaderboard = useMemo(() => {
    if (remoteLeaderboard.length > 0) return remoteLeaderboard;
    return HelixCompetitionService.getLeaderboard(profile);
  }, [remoteLeaderboard, profile]);

  const maskedPhone = useMemo(() => {
    return HelixCompetitionService.maskMsisdn(profile.phoneNumber);
  }, [profile.phoneNumber]);

  // Helix game definition for launching
  const helixGame = useMemo(() => {
    return GameRegistry.getGameById('helix-jump');
  }, []);

  const handleLaunchHelix = () => {
    if (helixGame) {
      onPlayGame(helixGame);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#17202A] pb-24 select-none">
      <div className="max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 sm:px-4 pt-3 space-y-4">
        
        {/* =========================================================================
            1. HELIX 7-DAY COMPETITION HERO BANNER & TIMER
           ========================================================================= */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#1688C9] via-[#0e6fa7] to-[#07476e] text-white p-4.5 sm:p-6 shadow-md overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-44 h-44 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 w-48 h-24 bg-[#8BCB3D]/25 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-3.5">
            {/* Status & Timer Badges */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8BCB3D] text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>7-DAY WEEKLY TOURNAMENT • LIVE</span>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase backdrop-blur-xs">
                  Day {competitionPeriod.currentDay} of 7
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-amber-300 text-[10px] font-black">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>{competitionPeriod.timeRemainingFormatted}</span>
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
                Helix 7-Day Tournament
              </h1>
              <p className="text-xs sm:text-sm text-sky-100 font-medium mt-1 leading-relaxed max-w-xl">
                Compete daily in <strong className="text-white font-extrabold">Helix Jump</strong>. Your official tournament ranking is calculated from your daily best scores across this rolling 7-day cycle.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2.5 border border-white/15">
                <div className="text-[9px] uppercase font-bold text-sky-200">Total Prize Pool</div>
                <div className="text-xs sm:text-base font-black text-amber-300">{remotePoolEtb.toLocaleString()} ETB</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2.5 border border-white/15">
                <div className="text-[9px] uppercase font-bold text-sky-200">Tournament Game</div>
                <div className="text-xs sm:text-base font-black text-white">Helix Jump</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2.5 border border-white/15">
                <div className="text-[9px] uppercase font-bold text-sky-200">Current Period</div>
                <div className="text-xs sm:text-base font-black text-white">Week {competitionPeriod.cycleNumber}</div>
              </div>
            </div>

            {/* Instant Launch CTA */}
            {helixGame && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleLaunchHelix}
                  className="w-full py-3 px-4 rounded-2xl bg-[#8BCB3D] hover:bg-[#7db737] active:scale-[0.99] text-white font-black text-sm uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>PLAY HELIX TOURNAMENT NOW</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            2. PLAYER'S COMPETITION STANDING CARD
           ========================================================================= */}
        <div className="rounded-3xl border border-sky-200 bg-sky-50/70 p-4 sm:p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1688C9] text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
                {userCompetitionScores.sevenDayScore > 0 ? `#${userCompetitionScores.rank}` : '—'}
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span>Your Standing</span>
                  {userCompetitionScores.rank <= 10 && userCompetitionScores.sevenDayScore > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[8px] font-black">
                      TOP 10
                    </span>
                  )}
                </div>
                <div className="text-sm sm:text-base font-black text-[#17202A] tracking-wider font-mono">
                  {maskedPhone}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-500 uppercase">
                7-Day Cumulative Score
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#1688C9] leading-none mt-0.5">
                {userCompetitionScores.sevenDayScore.toLocaleString()} <span className="text-xs font-semibold text-slate-500">pts</span>
              </div>
              <div className="text-[11px] font-extrabold text-[#8BCB3D] mt-1">
                Today: {userCompetitionScores.dailyScore.toLocaleString()} pts
              </div>
            </div>
          </div>

          {/* 7-Day Cycle Progress Indicator */}
          <div className="pt-3 border-t border-sky-200/80">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#1688C9]" />
                <span>Weekly 7-Day Cycle Progress</span>
              </span>
              <span className="text-[#1688C9] font-black">Day {competitionPeriod.currentDay} of 7</span>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
              {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                const isPassed = dayNum < competitionPeriod.currentDay;
                const isToday = dayNum === competitionPeriod.currentDay;
                return (
                  <div
                    key={dayNum}
                    className={`py-1.5 px-1 rounded-xl text-center text-[10px] font-black transition-all ${
                      isToday
                        ? 'bg-[#1688C9] text-white shadow-xs scale-105'
                        : isPassed
                        ? 'bg-[#8BCB3D]/20 text-[#598426] border border-[#8BCB3D]/40'
                        : 'bg-white border border-slate-200 text-slate-400'
                    }`}
                  >
                    <div>D{dayNum}</div>
                    <div className="text-[8px] font-medium opacity-80">
                      {isToday ? 'LIVE' : isPassed ? '✓' : 'UP'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. PRIZE DISTRIBUTION TABLE (Dynamic 40,000 ETB pool)
           ========================================================================= */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Trophy className="w-4 h-4 fill-amber-500 text-amber-600" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-[#17202A]">
                  Weekly Prize Pool Allocation
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">
                  Guaranteed official rewards distributed at the end of Day 7
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black">
              {remotePoolEtb.toLocaleString()} ETB
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200 text-center">
              <div className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                1st Place
              </div>
              <div className="text-xs sm:text-sm font-black text-[#17202A] mt-1">
                {(remotePrizes['1'] || 20000).toLocaleString()} ETB Cash
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                2nd Place
              </div>
              <div className="text-xs sm:text-sm font-black text-[#17202A] mt-1">
                {(remotePrizes['2'] || 10000).toLocaleString()} ETB Cash
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                3rd Place
              </div>
              <div className="text-xs sm:text-sm font-black text-[#17202A] mt-1">
                {(remotePrizes['3'] || 5000).toLocaleString()} ETB Cash
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                4th – 8th Place
              </div>
              <div className="text-xs sm:text-sm font-black text-[#17202A] mt-1">
                {(remotePrizes['4'] || 1000).toLocaleString()} ETB each
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. AUTHORITATIVE 7-DAY HELIX LEADERBOARD
           ========================================================================= */}
        <div className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-xs space-y-0">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Official 7-Day Helix Leaderboard
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-500">
              Ranked by 7-Day Cumulative Score
            </span>
          </div>

          {/* Table Column Headers */}
          <div className="grid grid-cols-12 gap-1 px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-5">Player (Masked)</div>
            <div className="col-span-5 text-right">7-Day Score</div>
          </div>

          {/* Leaderboard Rows */}
          <div className="divide-y divide-slate-100">
            {displayLeaderboard.slice(0, 10).map((entry) => {
              const isFirst = entry.rank === 1;
              const isSecond = entry.rank === 2;
              const isThird = entry.rank === 3;
              const isUser = entry.isCurrentUser;

              return (
                <div
                  key={entry.playerId}
                  className={`grid grid-cols-12 gap-1 px-4 py-3 items-center transition-colors ${
                    isUser
                      ? 'bg-amber-50/80 font-black border-l-4 border-l-amber-500'
                      : isFirst
                      ? 'bg-amber-50/30'
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-2 text-center flex items-center justify-center">
                    {isFirst && <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />}
                    {isSecond && <Medal className="w-5 h-5 text-slate-400 fill-slate-300" />}
                    {isThird && <Medal className="w-5 h-5 text-amber-700 fill-amber-600" />}
                    {!isFirst && !isSecond && !isThird && (
                      <span className="text-xs font-black text-slate-500">#{entry.rank}</span>
                    )}
                  </div>

                  {/* Player Masked MSISDN */}
                  <div className="col-span-5 min-w-0 pr-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-mono font-bold truncate ${isUser ? 'text-amber-800 font-black' : 'text-[#17202A]'}`}>
                        {entry.maskedMsisdn}
                      </span>
                      {isUser && (
                        <span className="px-1.5 py-0.2 rounded-md bg-amber-500 text-white text-[8px] font-black shrink-0">
                          YOU
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 7-Day Cumulative Score */}
                  <div className="col-span-5 text-right">
                    <div className="text-sm font-black text-[#17202A]">
                      {entry.sevenDayScore.toLocaleString()} <span className="text-[10px] text-slate-400 font-medium">pts</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            5. COMPETITION RULES & PRIVACY GUARANTEE
           ========================================================================= */}
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5 text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-1.5 font-black text-[#17202A] text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#8BCB3D]" />
            <span>Official Competition Rules & Privacy</span>
          </div>
          <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
            <li><strong>Continuous 7-Day Cycle:</strong> Each tournament runs for 7 consecutive days starting Monday 00:00 UTC.</li>
            <li><strong>Daily Score Retention:</strong> Only your highest valid score on each calendar day contributes toward your 7-day total score.</li>
            <li><strong>Prize Distribution:</strong> 1st: 20,000 ETB, 2nd: 10,000 ETB, 3rd: 5,000 ETB, 4th–8th: 1,000 ETB each. Distributed via Ethio Telecom Shortcode 7198 / TeleBirr.</li>
            <li><strong>Privacy Protected:</strong> All player mobile numbers are masked in strict 091*****890 format across all public standings.</li>
            <li><strong>Physics Anti-Cheat:</strong> Scores are verified through server physics validation with zero artificial score multipliers.</li>
          </ul>
        </div>

      </div>
    </div>
  );
};
