/**
 * Reward Audit Log Modal
 * Displays confirmed server-side reward transaction records,
 * idempotency audit hashes, MSISDN identifiers, timestamps, and disbursement status.
 */

import React from 'react';
import { RewardTransaction } from '../types';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  FileText
} from 'lucide-react';

interface RewardAuditModalProps {
  transactions: RewardTransaction[];
  onClose: () => void;
}

export const RewardAuditModal: React.FC<RewardAuditModalProps> = ({
  transactions,
  onClose,
}) => {
  return (
    <div
      id="reward-audit-modal"
      className="fixed inset-0 z-50 bg-[#071827]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto select-none"
    >
      <div className="w-full max-w-2xl bg-[#102C40] rounded-2xl border border-[#244558] shadow-2xl p-5 sm:p-6 relative my-6 max-h-[90vh] flex flex-col text-[#F5FAFC]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#15374A] text-[#A9C0CE] hover:text-[#F5FAFC] border border-[#244558] transition-colors z-10 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-[#00BFA6]" />
            <h3 className="text-lg sm:text-xl font-black text-[#F5FAFC]">
              Reward Audit & Transaction Log
            </h3>
          </div>
          <p className="text-xs text-[#A9C0CE]">
            Idempotent server-verified disbursement ledger. Real rewards are only issued upon verified server-side validation.
          </p>
        </div>

        {/* Notice Badge */}
        <div className="p-3 rounded-xl bg-[#0B2234] border border-[#244558] text-[11px] text-[#A9C0CE] mb-4 flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-[#35D9F2] shrink-0" />
          <span>
            <strong className="text-[#F5FAFC]">Server-Authoritative Payout Engine:</strong> All prize distributions use deterministic idempotency keys to prevent duplicate payout transactions.
          </span>
        </div>

        {/* Transaction Records List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {transactions.length === 0 ? (
            <div className="p-8 text-center bg-[#0B2234] rounded-xl border border-[#244558] text-[#A9C0CE] text-xs">
              <FileText className="w-8 h-8 text-[#A9C0CE] mx-auto mb-2 opacity-50" />
              No prize transactions logged yet. Play in live tournaments to qualify for verified distributions!
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3.5 rounded-xl bg-[#0B2234] border border-[#244558] hover:border-[#35D9F2]/40 transition-colors space-y-2 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#244558] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[#15374A] border border-[#244558] text-[#63F5C8] text-xs font-mono font-black flex items-center justify-center">
                      #{tx.rank}
                    </span>
                    <span className="text-xs font-extrabold text-[#F5FAFC]">
                      {tx.gameTitle}
                    </span>
                    <span className="text-[10px] text-[#A9C0CE] font-mono">
                      (Score: {tx.score.toLocaleString()})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        tx.status === 'DISBURSED' || tx.status === 'CONFIRMED'
                          ? 'bg-[#63F5C8]/20 text-[#63F5C8] border border-[#63F5C8]/30'
                          : 'bg-[#F7C85B]/20 text-[#F7C85B] border border-[#F7C85B]/30'
                      }`}
                    >
                      {tx.status}
                    </span>
                    <span className="text-[10px] text-[#A9C0CE] font-mono">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#A9C0CE]">Recipient Identifier: </span>
                    <span className="text-[#F5FAFC] font-mono font-bold">{tx.msisdnMasked}</span>
                  </div>
                  <div>
                    <span className="text-[#A9C0CE]">Allocated Reward: </span>
                    <span className="text-[#F7C85B] font-bold">{tx.reward}</span>
                  </div>
                </div>

                {/* Audit Hashes */}
                <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-[9px] text-[#A9C0CE] font-mono bg-[#15374A] p-2 rounded-lg border border-[#244558]">
                  <div className="truncate max-w-[280px]">
                    <span className="text-[#A9C0CE]">IDEMP:</span> {tx.idempotencyKey}
                  </div>
                  <div className="flex items-center gap-1 text-[#F5FAFC]">
                    <ShieldCheck className="w-3 h-3 text-[#00BFA6]" />
                    <span>AUDIT HASH: {tx.auditHash}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-[#244558] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#15374A] hover:bg-[#244558] text-[#F5FAFC] border border-[#244558] font-bold text-xs transition-colors cursor-pointer"
          >
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  );
};
