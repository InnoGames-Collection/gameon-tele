/**
 * TelePlus Subscription Service
 * Manages the single official Daily Subscription (2 Birr/day) via SMS shortcode 7198.
 */

import { SubscriptionPlan, UserProfile } from '../types';
import { StorageService } from './storageService';

export interface PlanDetails {
  id: SubscriptionPlan;
  title: string;
  name: string;
  priceETB: number;
  durationLabel: string;
  durationDays: number;
  smsRecipient: string;
  smsShortcode: string;
  smsBody: string;
  unsubscribeBody: string;
  features: string[];
  badge?: string;
  recommended?: boolean;
}

export const getSmsUrl = (smsRecipient: string, smsBody: string): string => {
  return `sms:${smsRecipient}?body=${encodeURIComponent(smsBody)}`;
};

export const SUBSCRIPTION_PLANS: PlanDetails[] = [
  {
    id: 'daily',
    title: 'Daily Subscription',
    name: 'Daily Subscription',
    priceETB: 2,
    durationLabel: '24 Hours (2 Birr/day)',
    durationDays: 1,
    smsRecipient: '7198',
    smsShortcode: '7198',
    smsBody: 'OK',
    unsubscribeBody: 'STOP',
    badge: 'Official',
    features: [
      'Unlimited match plays across all games',
      'All games 100% free with unlimited play',
      'Billed via SMS shortcode 7198 (2 Birr/day)',
    ],
  },
];

export const SubscriptionService = {
  getPlans(): PlanDetails[] {
    return SUBSCRIPTION_PLANS;
  },

  getPlanById(id: string): PlanDetails | undefined {
    return SUBSCRIPTION_PLANS.find((p) => p.id === id) || SUBSCRIPTION_PLANS[0];
  },

  getSmsSubscriptionUrl(planId?: SubscriptionPlan): string {
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId) || SUBSCRIPTION_PLANS[0];
    return getSmsUrl(plan.smsRecipient, plan.smsBody);
  },

  subscribe(planId: SubscriptionPlan, profile?: UserProfile): { success: boolean; message: string; updatedProfile?: UserProfile } {
    const current = profile || StorageService.getProfile();
    const durationMs = 24 * 60 * 60 * 1000;

    const updatedProfile: UserProfile = {
      ...current,
      subscription: {
        plan: 'daily',
        isActive: true,
        expiresAt: Date.now() + durationMs,
        autoRenew: true,
      },
    };

    StorageService.saveProfile(updatedProfile);

    return {
      success: true,
      message: 'Subscribed to Daily Plan (2 Birr/day)! Send OK to 7198.',
      updatedProfile,
    };
  },
};
