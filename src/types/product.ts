export type ProductCategory =
  | 'haircare'
  | 'skincare'
  | 'beard'
  | 'supplements'
  | 'grooming';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  image: string; // URL or local asset key
  description: string;
  usageInstructions: string;
  frequency: string;
  precautions: string;
  sourceUrl: string;
  verificationDate: string;
  qrCodeId?: string;
  isDemo: boolean;
  ingredients?: string[];
  benefits?: string[];
  size?: string;
  badge?: string; // e.g. "Best Seller", "New"
}

export interface UserProduct {
  id: string;
  productId: string;
  addedAt: string; // ISO date
  status: 'active' | 'paused' | 'removed';
  notes?: string;
}
