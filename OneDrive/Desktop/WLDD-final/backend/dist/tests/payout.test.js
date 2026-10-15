"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const payout_service_1 = require("../services/payout.service");
const globals_1 = require("@jest/globals");
(0, globals_1.describe)('Meme’d Payout & Budget Logic Unit Tests', () => {
    const sampleMilestones = [
        { views: 10000, payout: 500 },
        { views: 50000, payout: 2000 },
        { views: 100000, payout: 5000 }
    ];
    (0, globals_1.test)('Should return 0 payout if views are below the lowest milestone', () => {
        const result = (0, payout_service_1.calculatePayout)(4000, sampleMilestones);
        (0, globals_1.expect)(result.eligiblePayout).toBe(0);
        (0, globals_1.expect)(result.highestMilestoneViews).toBe(0);
    });
    (0, globals_1.test)('Should calculate correct payout when crossing the first milestone', () => {
        const result = (0, payout_service_1.calculatePayout)(15000, sampleMilestones);
        (0, globals_1.expect)(result.eligiblePayout).toBe(500);
        (0, globals_1.expect)(result.highestMilestoneViews).toBe(10000);
    });
    (0, globals_1.test)('Should calculate correct payout when crossing a higher milestone', () => {
        const result = (0, payout_service_1.calculatePayout)(85000, sampleMilestones);
        (0, globals_1.expect)(result.eligiblePayout).toBe(2000);
        (0, globals_1.expect)(result.highestMilestoneViews).toBe(50000);
    });
    (0, globals_1.test)('Should calculate correct incremental payout avoiding double-pay', () => {
        // Creator was at 500 (10k milestone), now reaches 2000 (50k milestone)
        const incremental = (0, payout_service_1.calculateIncrementalPayout)(500, 2000);
        (0, globals_1.expect)(incremental).toBe(1500);
    });
    (0, globals_1.test)('Should return 0 incremental payout if payout has not increased', () => {
        const incremental = (0, payout_service_1.calculateIncrementalPayout)(2000, 2000);
        (0, globals_1.expect)(incremental).toBe(0);
    });
    (0, globals_1.test)('Should handle empty milestone ladders safely', () => {
        const result = (0, payout_service_1.calculatePayout)(50000, []);
        (0, globals_1.expect)(result.eligiblePayout).toBe(0);
    });
});
//# sourceMappingURL=payout.test.js.map