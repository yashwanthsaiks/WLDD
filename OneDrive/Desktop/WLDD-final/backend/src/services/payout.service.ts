import { IMilestone } from '../models/campaign.model';

export interface PayoutCalculationResult {
  eligiblePayout: number;
  highestMilestoneViews: number;
}

/**
 * Calculates the highest payout earned based on current view count and milestone ladder.
 */
export function calculatePayout(views: number, milestones: IMilestone[]): PayoutCalculationResult {
  if (!milestones || milestones.length === 0) {
    return { eligiblePayout: 0, highestMilestoneViews: 0 };
  }

  // Sort milestones ascending by views
  const sorted = [...milestones].sort((a, b) => a.views - b.views);

  let eligiblePayout = 0;
  let highestMilestoneViews = 0;

  for (const m of sorted) {
    if (views >= m.views) {
      eligiblePayout = m.payout;
      highestMilestoneViews = m.views;
    } else {
      break;
    }
  }

  return { eligiblePayout, highestMilestoneViews };
}

/**
 * Calculates incremental payout to prevent double-paying for already achieved milestones.
 */
export function calculateIncrementalPayout(currentPayout: number, newPotentialPayout: number): number {
  if (newPotentialPayout > currentPayout) {
    return newPotentialPayout - currentPayout;
  }
  return 0;
}