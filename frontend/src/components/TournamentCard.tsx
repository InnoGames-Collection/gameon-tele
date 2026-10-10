/**
 * Tournament Card Component for GameSwiper
 * Midnight Navy & Deep Teal Theme
 * Displays Tournament status, schedule, entry requirements, reward pool, and score.
 */

import React from 'react';
import { Tournament, GameDefinition } from '../types';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Clock, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { formatCurrencyETB } from '../utils/formatters';

interface TournamentCardProps {
  tournament: Tournament;
  game?: GameDefinition;
  onEnter: (tournament: Tournament) => void;
  onViewDetails?: (tournament: Tournament) => void;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  onEnter,
}) => {
  const isLive = tournament.status === 'Live';
  const isUpcoming = tournament.status === 'Upcoming';

  const statusBadge = {
    Live: {
      bg: 'bg-[#63F5C8]/20 text-[#63F5C8] border-[#63F5C8]/40',
      dot: 'bg-[#63F5C8] animate-pulse',
      label: 'LIVE NOW',
    },
    Upcoming: {
      bg: 'bg-[#F7C85B]/20 text-[#F7C85B] border-[#F7C85B]/40',
      dot: 'bg-[#F7C85B]',
      label: 'UPCOMING',
    },
    Ended: {
      bg: 'bg-[#15374A] text-[#A9C0CE] border-[#244558]',
      dot: 'bg-[#A9C0CE]',
      label: 'ENDED',
    },
  }[tournament.status];

  return (
    <div
      id={`tournament-card-${tournament.id}`}
      className={`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between bg-[#102C40] ${
        isLive
          ? 'border-[#244558] hover:border-[#00BFA6] shadow-sm hover:shadow-md'
          : isUpcoming
          ? 'border-[#244558] opacity-95'
          : 'border-[#244558] opacity-80'
      }`}
    >
      {/* Top Banner Image with Badges */}
      <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-[#0B2234]">
        <img
          src={tournament.bannerImage}
          alt={tournament.title}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isLive ? 'hover:scale-105' : 'grayscale-[30%]'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#102C40] via-[#102C40]/30 to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border shadow-sm backdrop-blur-md ${statusBadge.bg}`}
          >
            <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
            <span>{statusBadge.label}</span>
          </span>

          <span className="px-2 py-0.5 rounded-md bg-[#00BFA6] text-[#071827] text-[10px] font-extrabold uppercase shadow-sm">
            {tournament.cycle}
          </span>
        </div>

        {/* Sponsor Tag */}
        <div className="absolute top-3 right-3 text-[10px] font-bold text-[#F5FAFC] bg-[#071827]/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-[#244558]">
          {tournament.sponsor}
        </div>

        {/* Game Title Tag */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <div className="text-[10px] font-bold text-[#63F5C8] uppercase tracking-wider drop-shadow">
              {tournament.gameTitle}
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#F5FAFC] leading-tight drop-shadow-md">
              {tournament.title}
            </h3>
          </div>
        </div>
      </div>

      {/* Card Content & Metrics */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-[#102C40]">
        {/* Prize Pool & Entry Fee */}
        <div className="grid grid-cols-2 gap-2 bg-[#0B2234] rounded-xl p-3 border border-[#244558]">
          <div>
            <div className="text-[10px] text-[#A9C0CE] font-bold uppercase tracking-wider flex items-center gap-1">
              <Trophy className="w-3 h-3 text-[#F7C85B]" />
              <span>Prize Pool</span>
            </div>
            <div className="text-sm sm:text-base font-black text-[#F7C85B] font-mono mt-0.5">
              {formatCurrencyETB(tournament.prizePoolETB)}
            </div>
          </div>

          <div className="text-right border-l border-[#244558] pl-2">
            <div className="text-[10px] text-[#A9C0CE] font-semibold uppercase">Entry Requirement</div>
            <div className="text-xs sm:text-sm font-black text-[#63F5C8] font-mono mt-0.5">
              FREE
            </div>
          </div>
        </div>

        {/* Schedule & Requirements Info */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-[#A9C0CE]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#35D9F2]" /> Schedule:
            </span>
            <span className="font-semibold text-[#F5FAFC] font-mono text-[11px]">
              {tournament.startDate} – {tournament.endDate}
            </span>
          </div>

          <div className="flex items-center justify-between text-[#A9C0CE]">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-[#35D9F2]" /> Requirement:
            </span>
            <span className="font-semibold text-[#63F5C8] text-[11px]">
              {tournament.entryRequirement}
            </span>
          </div>

          <div className="flex items-center justify-between text-[#A9C0CE]">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#35D9F2]" /> Contenders:
            </span>
            <span className="font-mono text-[#F5FAFC] font-bold text-[11px]">
              {tournament.participantsCount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Player Standing Highlight */}
        {tournament.playerScore !== undefined && tournament.playerScore > 0 && (
          <div className="bg-[#15374A] border border-[#244558] rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#00BFA6] text-[#071827] font-black text-xs flex items-center justify-center font-mono">
                #{tournament.playerRank || '--'}
              </div>
              <div>
                <div className="text-[9px] text-[#35D9F2] font-black uppercase">Your Standing</div>
                <div className="text-xs font-bold text-[#F5FAFC]">
                  Score: <span className="font-mono text-[#63F5C8]">{tournament.playerScore.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {tournament.hasSubmitted && (
              <span className="text-[10px] font-bold text-[#63F5C8] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Submitted
              </span>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-1">
          {isLive ? (
            <button
              id={`enter-tournament-btn-${tournament.id}`}
              onClick={() => onEnter(tournament)}
              className="w-full py-2.5 rounded-xl bg-[#00BFA6] hover:bg-[#63F5C8] text-[#071827] font-black text-xs sm:text-sm active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
            >
              <span>{tournament.hasSubmitted ? 'PLAY AGAIN / IMPROVE SCORE' : 'ENTER TOURNAMENT'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          ) : isUpcoming ? (
            <button
              disabled
              className="w-full py-2.5 rounded-xl bg-[#15374A] border border-[#244558] text-[#F7C85B] font-black text-xs cursor-not-allowed flex items-center justify-center gap-1.5 uppercase tracking-wider"
            >
              <Clock className="w-4 h-4" />
              <span>OPENS SOON ({tournament.startDate})</span>
            </button>
          ) : (
            <button
              disabled
              className="w-full py-2.5 rounded-xl bg-[#0B2234] border border-[#244558] text-[#A9C0CE] font-bold text-xs cursor-not-allowed flex items-center justify-center gap-1.5 uppercase tracking-wider"
            >
              <AlertCircle className="w-4 h-4" />
              <span>TOURNAMENT CONCLUDED</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
