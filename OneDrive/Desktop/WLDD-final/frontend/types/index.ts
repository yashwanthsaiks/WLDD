export type UserRole = 'creator' | 'brand';

export interface AuthFormData {
  role: UserRole;
  email: string;
  password: string;
  name: string;
  contactDetails?: string;    // Creator specific
  brandMotive?: string;       // Brand specific
  marketValue?: string;       // Brand specific
}

export interface Milestone {
  views: number;
  payout: number;
}

export interface Campaign {
  _id: string;
  name: string;
  platform: 'Instagram' | 'YouTube';
  totalBudget: number;
  remainingBudget: number;
  milestones: Milestone[];
  brandId: string;
}