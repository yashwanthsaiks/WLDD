import { IMilestone } from '../models/campaign.model';
export interface PayoutCalculationResult {
    eligiblePayout: number;
    highestMilestoneViews: number;
}
/**
 * Calculates the highest payout earned based on current view count and milestone ladder.
 */
export declare function calculatePayout(views: number, milestones: IMilestone[]): PayoutCalculationResult;
/**
 * Calculates incremental payout to prevent double-paying for already achieved milestones.
 */
export declare function calculateIncrementalPayout(currentPayout: number, newPotentialPayout: number): number;
//# sourceMappingURL=payout.service.d.ts.map