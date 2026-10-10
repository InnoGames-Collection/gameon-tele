/**
 * Tournament Details & Registration Modal
 */

import React from 'react';
import { Tournament, GameDefinition } from '../types';
import { 
  X, 
  Trophy, 
  Users, 
  Gift, 
  Flame, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { formatCurrencyETB } from '../utils/formatters';

interface TournamentModalProps {
  tournament: Tournament;
  game?: GameDefinition;
  onClose: () => void;
  onEnterTournament: (game: GameDefinition, tourneyId: string) => void;
}

export const TournamentModal: React.FC<TournamentModalProps> = ({
  tournament,
  game,
  onClose,
  onEnterTournament,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#071827]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto select-none">
      <div className="w-full max-w-lg bg-[#102C40] rounded-2xl border border-[#244558] shadow-2xl p-6 relative my-6 text-[#F5FAFC]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-[#15374A] text-[#A9C0CE] hover:text-[#F5FAFC] border border-[#244558] z-10 shadow-sm transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tournament Hero Banner */}
        <div className="relative h-40 rounded-xl overflow-hidden mb-4 bg-[#0B2234] border border-[#244558]">
          <img
            src={tournament.bannerImage}
            alt={tournament.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#102C40] via-[#102C40]/30 to-transparent" />

          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full bg-[#00BFA6] text-[#071827] text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Flame className="w-3 h-3 fill-current" /> Active Cup
            </span>
          </div>

          <div className="absolute bottom-3 left-3 right-3">
            <div className="text-[11px] text-[#A9C0CE] font-medium">Sponsor: {tournament.sponsor}</div>
            <h3 className="text-lg font-black text-[#F5FAFC] leading-tight">
              {tournament.title}
            </h3>
          </div>
        </div>

        {/* Prize Pool Highlight Block */}
        <div className="bg-[#0B2234] rounded-xl p-4 border border-[#244558] mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#15374A] border border-[#244558] flex items-center justify-center text-[#F7C85B]">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] text-[#A9C0CE] font-bold uppercase tracking-wider">
                Total Prize Pool
              </div>
              <div className="text-xl font-black text-[#F7C85B] font-mono leading-none">
                {formatCurrencyETB(tournament.prizePoolETB)}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-[#A9C0CE] font-semibold uppercase">Participants</div>
            <div className="text-sm font-bold text-[#35D9F2] font-mono flex items-center gap-1 justify-end">
              <Users className="w-3.5 h-3.5" />
              <span>{tournament.participantsCount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Prize Breakdown Ladder */}
        <div className="mb-5">
          <div className="text-xs font-bold text-[#F5FAFC] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-[#35D9F2]" /> Prize Ladder
          </div>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {tournament.prizes.map((p, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-[#0B2234] border border-[#244558] flex items-center justify-between text-xs"
              >
                <span className="font-bold text-[#63F5C8]">{p.rank}</span>
                <span className="text-[#F5FAFC] font-medium text-right text-[11px]">{p.reward}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Enter Tournament Button */}
        {game ? (
          <button
            onClick={() => {
              onClose();
              onEnterTournament(game, tournament.id);
            }}
            className="w-full py-3.5 rounded-xl bg-[#00BFA6] hover:bg-[#63F5C8] text-[#071827] font-black text-sm active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
          >
            <span>ENTER CUP (FREE ENTRY)</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#15374A] hover:bg-[#244558] text-[#F5FAFC] font-bold text-xs border border-[#244558] cursor-pointer"
          >
            Close
          </button>
        )}

        <div className="mt-3 text-center text-[11px] text-[#A9C0CE] flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#63F5C8]" />
          <span>Scores are recorded on the official EthioTelecom Championship Leaderboard.</span>
        </div>
      </div>
    </div>
  );
};
