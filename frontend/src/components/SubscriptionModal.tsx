/**
 * EthioTelecom Airtime Subscription Management Modal
 * 
 * Strict Plans:
 * - DAILY: 5 ETB -> SMS '1' to 7198
 * - WEEKLY: 15 ETB -> SMS '2' to 7198
 * - MONTHLY: 35 ETB -> SMS '3' to 7198
 */

import React, { useState } from 'react';
import { UserProfile, SubscriptionPlan } from '../types';
import { SUBSCRIPTION_PLANS, PlanDetails } from '../services/subscriptionService';
import { 
  X, 
  MessageSquare, 
  Check, 
  ShieldCheck, 
  Copy, 
  CheckCheck,
  Send,
  Sparkles,
  Coins
} from 'lucide-react';

interface SubscriptionModalProps {
  profile: UserProfile;
  onClose: () => void;
  onSubscribe: (plan: SubscriptionPlan) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  profile,
  onClose,
  onSubscribe,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlan>(
    profile.subscription?.plan && profile.subscription.plan !== 'free'
      ? profile.subscription.plan
      : 'weekly'
  );

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [smsTriggered, setSmsTriggered] = useState<boolean>(false);

  const currentPlan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[1];

  const handleOpenSmsComposer = (recipient: string, body: string, planId: SubscriptionPlan) => {
    setSmsTriggered(true);
    onSubscribe(planId);
    
    try {
      const smsUri = `sms:${recipient}?body=${encodeURIComponent(body)}`;
      window.location.href = smsUri;
    } catch (e) {
      console.warn('SMS link dispatch fallback', e);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#071827]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto select-none">
      <div 
        id="subscription-modal"
        className="w-full max-w-lg bg-[#102C40] rounded-3xl border border-[#244558] shadow-2xl p-5 sm:p-6 relative my-6 text-[#F5FAFC] font-['Plus_Jakarta_Sans',sans-serif]"
      >
        {/* Close Button */}
        <button
          id="close-subscription-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#15374A] text-[#A9C0CE] hover:text-[#F5FAFC] border border-[#244558] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#15374A] border border-[#244558] text-[#00BFA6] mx-auto mb-2.5 flex items-center justify-center shadow-md">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#F5FAFC] tracking-tight">
            EthioTelecom Gaming Pass
          </h3>
          <p className="text-xs text-[#A9C0CE] max-w-sm mx-auto mt-0.5">
            Billed via Airtime SMS to <strong className="text-[#35D9F2] font-bold">7198</strong>.
          </p>
        </div>

        <div className="space-y-4">
          {/* Active Subscription Banner if user is active */}
          {profile.subscription?.isActive && (
            <div className="p-3 rounded-2xl bg-[#15374A] border border-[#244558] text-[#F5FAFC] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#63F5C8]" />
                <div>
                  <span className="font-bold text-[#A9C0CE]">Current Plan: </span>
                  <span className="uppercase font-black text-[#63F5C8]">
                    {profile.subscription.plan} PASS
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#63F5C8] text-[#071827] text-[10px] font-black">
                ACTIVE
              </span>
            </div>
          )}

          {/* Initial Coins Benefit Callout */}
          <div className="p-3 bg-[#15374A] rounded-2xl border border-[#244558] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F7C85B]/20 border border-[#F7C85B]/30 text-[#F7C85B] flex items-center justify-center font-black shrink-0 shadow-sm">
              <Coins className="w-5 h-5 fill-[#F7C85B]" />
            </div>
            <div>
              <div className="text-xs font-black text-[#F5FAFC]">
                +25 Welcome Coins Included
              </div>
              <div className="text-[11px] text-[#A9C0CE]">
                One-time 25 bonus coins granted immediately upon subscription confirmation.
              </div>
            </div>
          </div>

          {/* Exactly 3 Subscription Plans: DAILY (5 ETB), WEEKLY (15 ETB), MONTHLY (35 ETB) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {SUBSCRIPTION_PLANS.map((plan: PlanDetails) => {
              const isSelected = selectedPlanId === plan.id;

              return (
                <div
                  key={plan.id}
                  id={`plan-card-${plan.id}`}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`relative rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#15374A] border-[#00BFA6] ring-2 ring-[#00BFA6]/40 shadow-sm'
                      : 'bg-[#0B2234] border-[#244558] hover:border-[#35D9F2]/40'
                  }`}
                >
                  {plan.recommended && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.2 rounded-full bg-[#F7C85B] text-[#071827] text-[9px] font-black uppercase tracking-wider shadow-sm">
                      Recommended
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-black text-[#F5FAFC] uppercase">{plan.title}</h4>
                      <span className="text-[10px] font-bold text-[#35D9F2] font-mono">
                        SMS {plan.smsBody}
                      </span>
                    </div>

                    <div className="text-xl font-black text-[#F5FAFC] font-mono leading-tight">
                      {plan.priceETB} <span className="text-xs font-sans text-[#35D9F2] font-bold">ETB</span>
                    </div>
                    <div className="text-[10px] text-[#A9C0CE] font-semibold mb-2">
                      {plan.id === 'daily' ? 'Per Day' : plan.id === 'weekly' ? 'Per Week' : 'Per Month'}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#244558] space-y-1">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-1 text-[10px] text-[#A9C0CE] leading-snug">
                        <Check className="w-3 h-3 text-[#63F5C8] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* SMS Instruction Callout */}
          <div className="p-3.5 bg-[#0B2234] rounded-2xl border border-[#244558] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F5FAFC]">
                SMS Activation ({currentPlan.title}):
              </span>
              <span className="text-[11px] font-mono font-bold text-[#35D9F2]">
                Airtime: {currentPlan.priceETB} ETB
              </span>
            </div>

            <div className="flex items-center gap-2 bg-[#102C40] p-2.5 rounded-xl border border-[#244558] text-xs font-mono">
              <div className="flex-1">
                <span className="text-[#A9C0CE]">Recipient: </span>
                <strong className="text-[#F5FAFC] font-bold">7198</strong>
                <span className="mx-2 text-[#244558]">|</span>
                <span className="text-[#A9C0CE]">Message: </span>
                <strong className="text-[#35D9F2] text-base font-black">{currentPlan.smsBody}</strong>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(currentPlan.smsBody, 'body')}
                className="px-2.5 py-1 rounded-lg bg-[#15374A] hover:bg-[#244558] text-[10px] font-bold text-[#A9C0CE] hover:text-[#F5FAFC] flex items-center gap-1 transition-colors cursor-pointer border border-[#244558]"
              >
                {copiedCode === 'body' ? (
                  <>
                    <CheckCheck className="w-3 h-3 text-[#63F5C8]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            id="subscribe-open-sms-btn"
            onClick={() => handleOpenSmsComposer('7198', currentPlan.smsBody, currentPlan.id)}
            className="w-full py-3.5 rounded-2xl bg-[#00BFA6] hover:bg-[#63F5C8] text-[#071827] font-black text-sm active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>SEND SMS '{currentPlan.smsBody}' TO 7198 ({currentPlan.priceETB} ETB)</span>
          </button>

          {smsTriggered && (
            <div className="p-3 bg-[#15374A] rounded-2xl border border-[#63F5C8]/40 text-[#F5FAFC] text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-[#63F5C8] shrink-0" />
              <span>
                SMS Composer opened. Tap <strong>Send</strong> on your phone to confirm subscription and receive +25 coins.
              </span>
            </div>
          )}
        </div>

        {/* Regulatory & Safety Footer */}
        <div className="mt-4 pt-3 border-t border-[#244558] text-center text-[11px] text-[#A9C0CE] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00BFA6]" />
          <span>Official EthioTelecom VAS Service • Shortcode 7198 • Airtime Billed</span>
        </div>
      </div>
    </div>
  );
};
