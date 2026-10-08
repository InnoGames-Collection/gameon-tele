/**
 * Helix Jump Authoritative Tournament Leaderboard Modal
 * Directly connects to Fastify 5 + Valkey 8 + PostgreSQL 16 backend.
 * Renders verified 7-day tournament standings, masked MSISDNs, and prize tiers.
 */

import React, { useState, useEffect } from 'react';
import { X, Trophy, Crown } from 'lucide-react';
import { helixAudio } from '../audioEngine';
import { HelixJumpSaveData } from '../types';
import { HelixCompetitionService, HelixLeaderboardEntry, HELIX_PRIZE_RULES } from '../../../services/helixCompetitionService';

interface LeaderboardModalProps {
  saveData: HelixJumpSaveData;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ saveData, onClose }) => {
  const [tab, setTab] = useState<'7DAY' | 'ALL'>('7DAY');
  const [leaderboard, setLeaderboard] = useState<HelixLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    HelixCompetitionService.fetchRemoteLeaderboard()
      .then((entries) => {
        if (isMounted) {
          setLeaderboard(entries);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLeaderboard(HelixCompetitionService.getLeaderboard());
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const period = HelixCompetitionService.getCurrentPeriod();

  return (
    <div
      id="helix-leaderboard-modal"
      className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-6 border border-white/20 shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider leading-none">
                Weekly Tournament
              </h2>
              <p className="text-[11px] font-bold text-amber-400 mt-1">
                Cycle #{period.cycleNumber} • {period.timeRemainingFormatted}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              helixAudio.playButtonClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prize Pool Banner */}
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-3 mb-3 text-center">
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-300">
            Total Prize Pool: 40,000 ETB Airtime
          </p>
          <p className="text-xs font-bold text-white mt-0.5">
            1st: 20k ETB • 2nd: 12k ETB • 3rd: 5k ETB
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-1 bg-white/5 rounded-2xl mb-3 border border-white/10">
          <button
            onClick={() => {
              helixAudio.playButtonClick();
              setTab('7DAY');
            }}
            className={`py-1.5 text-xs font-black uppercase rounded-xl transition-all cursor-pointer ${
              tab === '7DAY'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            7-Day Live
          </button>
          <button
            onClick={() => {
              helixAudio.playButtonClick();
              setTab('ALL');
            }}
            className={`py-1.5 text-xs font-black uppercase rounded-xl transition-all cursor-pointer ${
              tab === 'ALL'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Stats
          </button>
        </div>

        {/* Rankings List */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs font-bold animate-pulse">
              Loading authoritative standings from server...
            </div>
          ) : tab === '7DAY' ? (
            leaderboard.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-bold">
                No scores recorded for this cycle yet. Be the first to play!
              </div>
            ) : (
              leaderboard.map((entry) => {
                const rank = entry.rank;
                const isTop3 = rank <= 3;
                const isCurrentUser = entry.isCurrentUser;
                const prize = HELIX_PRIZE_RULES.find((p) => p.rank === rank)?.reward || (rank <= 10 ? '1,000 ETB' : undefined);

                return (
                  <div
                    key={entry.maskedMsisdn + rank}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                      isCurrentUser
                        ? 'bg-gradient-to-r from-sky-900/60 to-indigo-900/60 border-sky-400/50 shadow-lg shadow-sky-500/20 ring-1 ring-sky-400'
                        : isTop3
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank Badge */}
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                          rank === 1
                            ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30'
                            : rank === 2
                            ? 'bg-slate-300 text-slate-950'
                            : rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-white/10 text-slate-400'
                        }`}
                      >
                        {rank === 1 ? <Crown className="w-4 h-4 fill-slate-950" /> : rank}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-black text-white leading-tight">
                            {entry.maskedMsisdn}
                          </p>
                          {isCurrentUser && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-sky-400/30 text-sky-300 font-black">
                              YOU
                            </span>
                          )}
                        </div>
                        {prize && (
                          <p className="text-[10px] font-bold text-amber-400 mt-0.5">
                            Prize: {prize}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-black text-white leading-tight">
                        {entry.sevenDayScore.toLocaleString()}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        Points
                      </p>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            <div className="flex flex-col gap-3 py-2">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase">My High Score</p>
                <p className="text-2xl font-black text-white mt-1">{(saveData.bestScore || 0).toLocaleString()}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase">Tower Highest Level</p>
                <p className="text-2xl font-black text-amber-400 mt-1">Level {saveData.highestUnlockedLevel || 1}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase">Total Rounds Played</p>
                <p className="text-2xl font-black text-sky-400 mt-1">{saveData.totalGames || 0}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
