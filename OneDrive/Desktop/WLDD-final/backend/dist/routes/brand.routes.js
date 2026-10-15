"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const campaign_model_1 = require("../models/campaign.model");
const redis_config_1 = require("../config/redis.config");
const router = (0, express_1.Router)();
const CAMPAIGNS_CACHE_KEY = 'campaigns:live';
/**
 * @route   POST /api/brand/campaigns
 * @desc    Create new campaign & invalidate Redis cache
 */
router.post('/campaigns', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const { name, platform, totalBudget, milestones } = req.body;
        const newCampaign = await campaign_model_1.Campaign.create({
            brandId: req.user?.id,
            name,
            platform,
            totalBudget,
            budgetSpent: 0,
            milestones
        });
        // Invalidate Redis cache so creators immediately see the new campaign
        await redis_config_1.redisClient.del(CAMPAIGNS_CACHE_KEY);
        res.status(201).json(newCampaign);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Create Campaign (Brands only)
router.post('/campaigns', auth_middleware_1.verifyToken, (0, auth_middleware_1.requireRole)('brand'), async (req, res) => {
    try {
        const { name, platform, totalBudget, milestones } = req.body;
        if (!name || !platform || totalBudget === undefined || !milestones) {
            res.status(400).json({ error: 'Missing required campaign fields.' });
            return;
        }
        const campaign = await campaign_model_1.Campaign.create({
            brandId: req.user?.id,
            name,
            platform,
            totalBudget,
            budgetSpent: 0,
            milestones
        });
        res.status(201).json({ message: 'Campaign created successfully', campaign });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// View brand's campaigns (Budget spent vs remaining)
router.get('/campaigns', auth_middleware_1.verifyToken, (0, auth_middleware_1.requireRole)('brand'), async (req, res) => {
    try {
        const campaigns = await campaign_model_1.Campaign.find({ brandId: req.user?.id });
        const formatted = campaigns.map(c => ({
            id: c._id,
            name: c.name,
            platform: c.platform,
            totalBudget: c.totalBudget,
            budgetSpent: c.budgetSpent,
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
exports.default = router;
//# sourceMappingURL=brand.routes.js.map