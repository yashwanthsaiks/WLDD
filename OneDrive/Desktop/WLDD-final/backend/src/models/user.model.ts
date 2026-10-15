import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: 'brand' | 'creator';
  name: string; // Creator name or Brand name
  // Creator specific fields
  contactDetails?: string;
  // Brand specific fields
  brandMotive?: string;
  marketValue?: string;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['brand', 'creator'], required: true },
  name: { type: String, required: true },
  // Optional/conditional fields based on role
  contactDetails: { type: String },
  brandMotive: { type: String },
  marketValue: { type: String }
}, { timestamps: true });

export const User = model<IUser>('User', UserSchema);