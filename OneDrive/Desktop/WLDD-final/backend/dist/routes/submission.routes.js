"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const submission_model_1 = require("../models/submission.model");
const campaign_model_1 = require("../models/campaign.model");
const payout_service_1 = require("../services/payout.service");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/brand/submissions OR /api/submissions/brand
 * @desc    Fetch all creator submissions for campaigns owned by the logged-in brand
 * @access  Private (Brand Role Only)
 */
router.get(['/submissions', '/brand'], auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        if (req.user?.role !== 'brand') {
            res.status(403).json({ error: 'Access denied. Brand account required.' });
            return;
        }
        // 1. Find all campaigns created by this brand
        const brandCampaigns = await campaign_model_1.Campaign.find({ brandId: req.user.id }).select('_id');
        const campaignIds = brandCampaigns.map((camp) => camp._id);
        // 2. Fetch submissions linked to those campaigns and populate creator & campaign details
        const submissions = await submission_model_1.Submission.find({ campaignId: { $in: campaignIds } })
            .populate('creatorId', 'name email contactDetails')
            .populate('campaignId', 'name platform')
            .sort({ createdAt: -1 });
        res.json(submissions);
    }
    catch (err) {
        res.status(500).json({ error: err.message || 'Failed to fetch brand submissions.' });
    }
});
/**
 * @route   PATCH /api/submissions/:id/views OR /api/brand/:id/views
 * @desc    Update view count for a submission and calculate milestone payouts
 * @access  Public / Internal Automation
 */
router.patch('/:id/views', async (req, res) => {
    try {
        const { id } = req.params;
        const { views } = req.body;
        if (views === undefined || views < 0) {
            res.status(400).json({ error: 'Valid view count is required.' });
            return;
        }
        const submission = await submission_model_1.Submission.findById(id);
        if (!submission) {
            res.status(404).json({ error: 'Submission not found.' });
            return;
        }
        const campaign = await campaign_model_1.Campaign.findById(submission.campaignId);
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
        const { eligiblePayout: newPotentialPayout } = (0, payout_service_1.calculatePayout)(views, campaign.milestones);
        const incrementalPayout = (0, payout_service_1.calculateIncrementalPayout)(submission.currentPayout, newPotentialPayout);
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
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=submission.routes.js.map