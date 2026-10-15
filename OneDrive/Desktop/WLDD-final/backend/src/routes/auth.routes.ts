import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production';

// Signup
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, email, password, name, contactDetails, brandMotive, marketValue } = req.body;

    if (!email || !password || !role || !name) {
      res.status(400).json({ error: 'Missing required fields: email, password, role, and name are mandatory.' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Email is already registered.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Build user object dynamically based on role
    const userData: any = {
      email,
      passwordHash,
      role,
      name
    };

    if (role === 'creator') {
      userData.contactDetails = contactDetails || '';
    } else if (role === 'brand') {
      userData.brandMotive = brandMotive || '';
      userData.marketValue = marketValue || '';
    }

    const user = await User.create(userData);
    
    res.status(201).json({ 
      message: 'User registered successfully', 
      userId: user._id, 
      role: user.role,
      name: user.name 
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Login (unchanged)
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, role: user.role, name: user.name, userId: user._id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;