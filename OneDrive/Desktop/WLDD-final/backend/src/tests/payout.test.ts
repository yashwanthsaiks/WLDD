import { calculatePayout, calculateIncrementalPayout } from '../services/payout.service';
import { describe, expect, test } from '@jest/globals';

describe('Meme’d Payout & Budget Logic Unit Tests', () => {
  const sampleMilestones = [
    { views: 10000, payout: 500 },
    { views: 50000, payout: 2000 },
    { views: 100000, payout: 5000 }
  ];

  test('Should return 0 payout if views are below the lowest milestone', () => {
    const result = calculatePayout(4000, sampleMilestones);
    expect(result.eligiblePayout).toBe(0);
    expect(result.highestMilestoneViews).toBe(0);
  });

  test('Should calculate correct payout when crossing the first milestone', () => {
    const result = calculatePayout(15000, sampleMilestones);
    expect(result.eligiblePayout).toBe(500);
    expect(result.highestMilestoneViews).toBe(10000);
  });

  test('Should calculate correct payout when crossing a higher milestone', () => {
    const result = calculatePayout(85000, sampleMilestones);
    expect(result.eligiblePayout).toBe(2000);
    expect(result.highestMilestoneViews).toBe(50000);
  });

  test('Should calculate correct incremental payout avoiding double-pay', () => {
    // Creator was at 500 (10k milestone), now reaches 2000 (50k milestone)
    const incremental = calculateIncrementalPayout(500, 2000);
    expect(incremental).toBe(1500);
  });

  test('Should return 0 incremental payout if payout has not increased', () => {
    const incremental = calculateIncrementalPayout(2000, 2000);
    expect(incremental).toBe(0);
  });

  test('Should handle empty milestone ladders safely', () => {
    const result = calculatePayout(50000, []);
    expect(result.eligiblePayout).toBe(0);
  });
});