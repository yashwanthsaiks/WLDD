import { Router, Request, Response } from 'express';
import { verifyToken, requireRole, AuthRequest } from '../middlewares/auth.middleware';
import { Campaign } from '../models/campaign.model';
import { Submission } from '../models/submission.model';
import { redisClient } from '../config/redis.config';

const router = Router();
const CAMPAIGNS_CACHE_KEY = 'campaigns:live';


/**
 * @route   GET /api/creator/campaigns
 * @desc    Fetch active campaigns with Redis caching
 */
router.get('/campaigns', async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Check Redis Cache
    const cachedCampaigns = await redisClient.get(CAMPAIGNS_CACHE_KEY);
    if (cachedCampaigns) {
      res.json(JSON.parse(cachedCampaigns));
      return;
    }

    // 2. Fetch from MongoDB if cache miss
    const campaigns = await Campaign.find({ remainingBudget: { $gt: 0 } }).sort({ createdAt: -1 });

    // 3. Save to Redis with 10-minute expiration (600 seconds)
    await redisClient.setEx(CAMPAIGNS_CACHE_KEY, 600, JSON.stringify(campaigns));

    res.json(campaigns);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching campaigns' });
  }
});

/**
 * @route GET /api/creator/campaigns
 * @desc List all live campaigns available for creators to browse and join
 */
router.get('/campaigns', verifyToken, requireRole('creator'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const campaigns = await Campaign.find({});
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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/creator/submissions
 * @desc Submit a post link to join/contribute to a specific campaign
 */
router.post('/submissions', verifyToken, requireRole('creator'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { campaignId, postLink } = req.body;
    if (!campaignId || !postLink) {
      res.status(400).json({ error: 'Campaign ID and post link are required.' });
      return;
    }

    // Verify campaign exists
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found.' });
      return;
    }

    // Create the submission linking the creator and the campaign
    const submission = await Submission.create({
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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/creator/earnings
 * @desc View creator's total earnings across all their submissions
 */
router.get('/earnings', verifyToken, requireRole('creator'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const submissions = await Submission.find({ creatorId: req.user?.id }).populate('campaignId', 'name platform totalBudget');
    const totalEarnings = submissions.reduce((sum, s) => sum + s.currentPayout, 0);

    res.json({ 
      totalEarnings, 
      submissionsCount: submissions.length,
      submissions 
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;