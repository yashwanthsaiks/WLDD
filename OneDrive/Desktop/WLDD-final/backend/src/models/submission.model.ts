import { Schema, model, Document, Types } from 'mongoose';

export interface ISubmission extends Document {
  campaignId: Types.ObjectId;
  creatorId: Types.ObjectId;
  postLink: string;
  views: number;
  currentPayout: number;
  flagged: boolean;
  createdAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>({
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  postLink: { type: String, required: true },
  views: { type: Number, default: 0, min: 0 },
  currentPayout: { type: Number, default: 0, min: 0 },
  flagged: { type: Boolean, default: false }
}, { timestamps: true });

export const Submission = model<ISubmission>('Submission', SubmissionSchema);