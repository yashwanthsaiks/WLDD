import { Schema, model, Document, Types } from 'mongoose';

export interface IMilestone {
  views: number;
  payout: number;
}

export interface ICampaign extends Document {
  brandId: Types.ObjectId;
  name: string;
  platform: 'Instagram' | 'YouTube';
  totalBudget: number;
  budgetSpent: number;
  milestones: IMilestone[];
  createdAt: Date;
}

const MilestoneSchema = new Schema<IMilestone>({
  views: { type: Number, required: true, min: 0 },
  payout: { type: Number, required: true, min: 0 }
}, { _id: false });

const CampaignSchema = new Schema<ICampaign>({
  brandId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  platform: { type: String, enum: ['Instagram', 'YouTube'], required: true },
  totalBudget: { type: Number, required: true, min: 0 },
  budgetSpent: { type: Number, default: 0, min: 0 },
  milestones: { type: [MilestoneSchema], required: true }
}, { timestamps: true });

export const Campaign = model<ICampaign>('Campaign', CampaignSchema);