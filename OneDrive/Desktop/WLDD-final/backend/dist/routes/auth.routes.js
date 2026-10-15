"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production';
// Signup
router.post('/signup', async (req, res) => {
    try {
        const { role, email, password, name, contactDetails, brandMotive, marketValue } = req.body;
        if (!email || !password || !role || !name) {
            res.status(400).json({ error: 'Missing required fields: email, password, role, and name are mandatory.' });
            return;
        }
        const existingUser = await user_model_1.User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: 'Email is already registered.' });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        // Build user object dynamically based on role
        const userData = {
            email,
            passwordHash,
            role,
            name
        };
        if (role === 'creator') {
            userData.contactDetails = contactDetails || '';
        }
        else if (role === 'brand') {
            userData.brandMotive = brandMotive || '';
            userData.marketValue = marketValue || '';
        }
        const user = await user_model_1.User.create(userData);
        res.status(201).json({
            message: 'User registered successfully',
            userId: user._id,
            role: user.role,
            name: user.name
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Login (unchanged)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await user_model_1.User.findOne({ email });
        if (!user) {
            res.status(400).json({ error: 'Invalid email or password.' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            res.status(400).json({ error: 'Invalid email or password.' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, role: user.role, name: user.name, userId: user._id });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map