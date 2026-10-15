import { Router, Request, Response } from 'express';
import { Submission } from '../models/submission.model';
import { Campaign } from '../models/campaign.model';
import { calculatePayout, calculateIncrementalPayout } from '../services/payout.service';
import { AuthRequest, authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   GET /api/brand/submissions OR /api/submissions/brand
 * @desc    Fetch all creator submissions for campaigns owned by the logged-in brand
 * @access  Private (Brand Role Only)
 */
router.get(['/submissions', '/brand'], authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'brand') {
      res.status(403).json({ error: 'Access denied. Brand account required.' });
      return;
    }

    // 1. Find all campaigns created by this brand
    const brandCampaigns = await Campaign.find({ brandId: req.user.id }).select('_id');
    const campaignIds = brandCampaigns.map((camp) => camp._id);

    // 2. Fetch submissions linked to those campaigns and populate creator & campaign details
    const submissions = await Submission.find({ campaignId: { $in: campaignIds } })
      .populate('creatorId', 'name email contactDetails')
      .populate('campaignId', 'name platform')
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch brand submissions.' });
  }
});

/**
 * @route   PATCH /api/submissions/:id/views OR /api/brand/:id/views
 * @desc    Update view count for a submission and calculate milestone payouts
 * @access  Public / Internal Automation
 */
router.patch('/:id/views', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { views } = req.body;

    if (views === undefined || views < 0) {
      res.status(400).json({ error: 'Valid view count is required.' });
      return;
    }

    const submission = await Submission.findById(id);
    if (!submission) {
      res.status(404).json({ error: 'Submission not found.' });
      return;
    }

    const campaign = await Campaign.findById(submission.campaignId);
    if (!campaign) {
      res.status(404).json({ error: 'Associated campaign not found.' });
      return;
    }

    // Flag if views spike unusually fast (e.g., > 100,000 views added in single update)
    const viewDifference = views - submission.views;
    if (viewDifference > 100000) {
      submission.flagged = true;
    }

    // Calculate potential new payout based on milestone ladder
    const { eligiblePayout: newPotentialPayout } = calculatePayout(views, campaign.milestones);
    const incrementalPayout = calculateIncrementalPayout(submission.currentPayout, newPotentialPayout);

    // Check if campaign remaining budget can cover the incremental payout
    const remainingBudget = campaign.totalBudget - campaign.budgetSpent;
    let actualPayoutToAdd = incrementalPayout;

    if (incrementalPayout > remainingBudget) {
      // Budget runs out mid-payout: cap payout to remaining budget
      actualPayoutToAdd = remainingBudget;
    }

    if (actualPayoutToAdd > 0) {
      campaign.budgetSpent += actualPayoutToAdd;
      submission.currentPayout += actualPayoutToAdd;
      await campaign.save();
    }

    submission.views = views;
    await submission.save();

    res.json({
      message: 'Views updated successfully',
      submissionId: submission._id,
      currentViews: submission.views,
      currentPayout: submission.currentPayout,
      flagged: submission.flagged,
      budgetSpent: campaign.budgetSpent,
      remainingBudget: campaign.totalBudget - campaign.budgetSpent
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;