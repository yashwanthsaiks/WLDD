"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Campaign = void 0;
const mongoose_1 = require("mongoose");
const MilestoneSchema = new mongoose_1.Schema({
    views: { type: Number, required: true, min: 0 },
    payout: { type: Number, required: true, min: 0 }
}, { _id: false });
const CampaignSchema = new mongoose_1.Schema({
    brandId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    platform: { type: String, enum: ['Instagram', 'YouTube'], required: true },
    totalBudget: { type: Number, required: true, min: 0 },
    budgetSpent: { type: Number, default: 0, min: 0 },
    milestones: { type: [MilestoneSchema], required: true }
}, { timestamps: true });
exports.Campaign = (0, mongoose_1.model)('Campaign', CampaignSchema);
//# sourceMappingURL=campaign.model.js.map