"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const campaign_model_1 = require("../models/campaign.model");
const submission_model_1 = require("../models/submission.model");
const redis_config_1 = require("../config/redis.config");
const router = (0, express_1.Router)();
const CAMPAIGNS_CACHE_KEY = 'campaigns:live';
/**
 * @route   GET /api/creator/campaigns
 * @desc    Fetch active campaigns with Redis caching
 */
router.get('/campaigns', async (req, res) => {
    try {
        // 1. Check Redis Cache
        const cachedCampaigns = await redis_config_1.redisClient.get(CAMPAIGNS_CACHE_KEY);
        if (cachedCampaigns) {
            res.json(JSON.parse(cachedCampaigns));
            return;
        }
        // 2. Fetch from MongoDB if cache miss
        const campaigns = await campaign_model_1.Campaign.find({ remainingBudget: { $gt: 0 } }).sort({ createdAt: -1 });
        // 3. Save to Redis with 10-minute expiration (600 seconds)
        await redis_config_1.redisClient.setEx(CAMPAIGNS_CACHE_KEY, 600, JSON.stringify(campaigns));
        res.json(campaigns);
    }
    catch (err) {
        res.status(500).json({ error: err.message || 'Error fetching campaigns' });
    }
});
/**
 * @route GET /api/creator/campaigns
 * @desc List all live campaigns available for creators to browse and join
 */
router.get('/campaigns', auth_middleware_1.verifyToken, (0, auth_middleware_1.requireRole)('creator'), async (req, res) => {
    try {
        const campaigns = await campaign_model_1.Campaign.find({});
        const formatted = campaigns.map(c => ({
            id: c._id,
            name: c.name,
            platform: c.platform,
            totalBudget: c.totalBudget,
            remainingBudget: c.totalBudget - c.budgetSpent,
            milestones: c.milestones,
            createdAt: c.createdAt
        }));
        res.json(formatted);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
/**
 * @route POST /api/creator/submissions
 * @desc Submit a post link to join/contribute to a specific campaign
 */
router.post('/submissions', auth_middleware_1.verifyToken, (0, auth_middleware_1.requireRole)('creator'), async (req, res) => {
    try {
        const { campaignId, postLink } = req.body;
        if (!campaignId || !postLink) {
            res.status(400).json({ error: 'Campaign ID and post link are required.' });
            return;
        }
        // Verify campaign exists
        const campaign = await campaign_model_1.Campaign.findById(campaignId);
        if (!campaign) {
            res.status(404).json({ error: 'Campaign not found.' });
            return;
        }
        // Create the submission linking the creator and the campaign
        const submission = await submission_model_1.Submission.create({
            campaignId,
            creatorId: req.user?.id,
            postLink,
            views: 0,
            currentPayout: 0,
            flagged: false
        });
        res.status(201).json({
            message: 'Successfully joined campaign and submitted post!',
            submission
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
/**
 * @route GET /api/creator/earnings
 * @desc View creator's total earnings across all their submissions
 */
router.get('/earnings', auth_middleware_1.verifyToken, (0, auth_middleware_1.requireRole)('creator'), async (req, res) => {
    try {
        const submissions = await submission_model_1.Submission.find({ creatorId: req.user?.id }).populate('campaignId', 'name platform totalBudget');
        const totalEarnings = submissions.reduce((sum, s) => sum + s.currentPayout, 0);
        res.json({
            totalEarnings,
            submissionsCount: submissions.length,
            submissions
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=creator.routes.js.map