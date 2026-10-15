"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateIncrementalPayout = exports.calculatePayout = void 0;
/**
 * Calculates the highest payout earned based on current view count and milestone ladder.
 */
function calculatePayout(views, milestones) {
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
        }
        else {
            break;
        }
    }
    return { eligiblePayout, highestMilestoneViews };
}
exports.calculatePayout = calculatePayout;
/**
 * Calculates incremental payout to prevent double-paying for already achieved milestones.
 */
function calculateIncrementalPayout(currentPayout, newPotentialPayout) {
    if (newPotentialPayout > currentPayout) {
        return newPotentialPayout - currentPayout;
    }
    return 0;
}
exports.calculateIncrementalPayout = calculateIncrementalPayout;
//# sourceMappingURL=payout.service.js.map