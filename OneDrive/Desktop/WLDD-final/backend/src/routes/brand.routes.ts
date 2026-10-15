import { Router, Response, Request } from 'express';
import { verifyToken, requireRole, AuthRequest, authMiddleware } from '../middlewares/auth.middleware';
import { Campaign } from '../models/campaign.model';
import { redisClient } from '../config/redis.config';

const router = Router();
const CAMPAIGNS_CACHE_KEY = 'campaigns:live';


/**
 * @route   POST /api/brand/campaigns
 * @desc    Create new campaign & invalidate Redis cache
 */

router.post('/campaigns', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, platform, totalBudget, milestones } = req.body;

    const newCampaign = await Campaign.create({
      brandId: req.user?.id,
      name,
      platform,
      totalBudget,
      budgetSpent: 0,
      milestones
    });

    // Invalidate Redis cache so creators immediately see the new campaign
    await redisClient.del(CAMPAIGNS_CACHE_KEY);

    res.status(201).json(newCampaign);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Campaign (Brands only)
router.post('/campaigns', verifyToken, requireRole('brand'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, platform, totalBudget, milestones } = req.body;
    if (!name || !platform || totalBudget === undefined || !milestones) {
      res.status(400).json({ error: 'Missing required campaign fields.' });
      return;
    }

    const campaign = await Campaign.create({
      brandId: req.user?.id,
      name,
      platform,
      totalBudget,
      budgetSpent: 0,
      milestones
    });

    res.status(201).json({ message: 'Campaign created successfully', campaign });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// View brand's campaigns (Budget spent vs remaining)
router.get('/campaigns', verifyToken, requireRole('brand'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const campaigns = await Campaign.find({ brandId: req.user?.id });
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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;