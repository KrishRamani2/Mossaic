import { Product } from '../types/product';

export const DEMO_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'Anti-Hair Fall Shampoo',
    category: 'haircare',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80',
    description:
      'A gentle, DHT-blocking shampoo designed to reduce hair fall and nourish the scalp. This is sample demo content.',
    usageInstructions:
      'Apply to wet hair, massage gently into scalp for 2–3 minutes, then rinse thoroughly. For best results, use consistently as directed.',
    frequency: '3–4 times per week',
    precautions:
      'Avoid contact with eyes. If irritation occurs, discontinue use. For external use only. Keep out of reach of children.',
    sourceUrl: 'https://manmatters.com',
    verificationDate: '2024-01-01',
    qrCodeId: 'QR-001',
    isDemo: true,
    ingredients: ['Saw Palmetto Extract', 'Biotin', 'Keratin', 'Argan Oil'],
    benefits: ['Reduces hair fall', 'Nourishes scalp', 'Strengthens roots'],
    size: '200 ml',
    badge: 'Best Seller',
  },
  {
    id: 'prod-002',
    name: 'Minoxidil 5% Solution',
    category: 'haircare',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80',
    description:
      'A clinically recognized topical solution for hair regrowth. This is sample demo content — always follow physician guidance.',
    usageInstructions:
      'Apply 1 ml to the affected area of the scalp twice daily using the dropper. Do not exceed the recommended dose.',
    frequency: 'Twice daily (morning and evening)',
    precautions:
      'For external use only. Do not use if pregnant or breastfeeding without medical advice. Consult a doctor before use. May cause initial shedding.',
    sourceUrl: 'https://manmatters.com',
    verificationDate: '2024-01-01',
    qrCodeId: 'QR-002',
    isDemo: true,
    benefits: ['Clinically recognized', 'Promotes hair regrowth'],
    size: '60 ml',
    badge: 'Doctor Backed',
  },
  {
    id: 'prod-003',
    name: 'Vitamin D3 + K2 Supplement',
    category: 'supplements',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80',
    description:
      'A daily supplement combining Vitamin D3 and K2 for bone health and immune support. This is sample demo content.',
    usageInstructions:
      'Take one tablet daily with a meal, or as directed by your healthcare provider.',
    frequency: 'Once daily',
    precautions:
      'Do not exceed the recommended dose. Consult a doctor if you are on medication. Keep out of reach of children.',
    sourceUrl: 'https://manmatters.com',
    verificationDate: '2024-01-01',
    qrCodeId: 'QR-003',
    isDemo: true,
    ingredients: ['Vitamin D3 (2000 IU)', 'Vitamin K2 (75 mcg)'],
    benefits: ['Supports bone health', 'Boosts immunity'],
    size: '60 tablets',
    badge: 'New',
  },
  {
    id: 'prod-004',
    name: 'Niacinamide Face Serum',
    category: 'skincare',
    image: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400&q=80',
    description:
      'A lightweight serum with 10% niacinamide to minimize pores and even skin tone. This is sample demo content.',
    usageInstructions:
      'Apply 3–4 drops to clean face morning and evening. Follow with a moisturizer.',
    frequency: 'Twice daily',
    precautions:
      'Avoid use around the eyes. Patch test before first use. If irritation occurs, reduce frequency.',
    sourceUrl: 'https://manmatters.com',
    verificationDate: '2024-01-01',
    qrCodeId: 'QR-004',
    isDemo: true,
    ingredients: ['Niacinamide 10%', 'Zinc PCA', 'Hyaluronic Acid'],
    benefits: ['Minimizes pores', 'Evens skin tone', 'Controls oil'],
    size: '30 ml',
  },
  {
    id: 'prod-005',
    name: 'Beard Growth Oil',
    category: 'beard',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80',
    description:
      'A nourishing oil blend to soften beard hair and support healthy growth. This is sample demo content.',
    usageInstructions:
      'Apply 4–5 drops to beard and massage into skin below. Use after cleansing.',
    frequency: 'Once daily, preferably at night',
    precautions:
      'For external use only. Avoid contact with eyes. Conduct a patch test before first use.',
    sourceUrl: 'https://manmatters.com',
    verificationDate: '2024-01-01',
    qrCodeId: 'QR-005',
    isDemo: true,
    ingredients: ['Jojoba Oil', 'Argan Oil', 'Vitamin E', 'Peppermint Extract'],
    benefits: ['Softens beard', 'Nourishes skin', 'Promotes healthy growth'],
    size: '30 ml',
  },
  {
    id: 'prod-006',
    name: 'SPF 50 Daily Moisturiser',
    category: 'skincare',
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&q=80',
    description:
      'A lightweight, non-greasy moisturiser with SPF 50 for daily sun protection. This is sample demo content.',
    usageInstructions:
      'Apply generously to face and exposed areas 15 minutes before sun exposure. Reapply every 2 hours when outdoors.',
    frequency: 'Daily (every morning)',
    precautions:
      'For external use only. Avoid contact with eyes. Keep out of reach of children.',
    sourceUrl: 'https://manmatters.com',
    verificationDate: '2024-01-01',
    qrCodeId: 'QR-006',
    isDemo: true,
    benefits: ['SPF 50 protection', 'Hydrates skin', 'Non-greasy finish'],
    size: '50 ml',
    badge: 'Essential',
  },
  {
    id: 'prod-007',
    name: 'Biotin Hair Gummies',
    category: 'supplements',
    image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=400&q=80',
    description:
      'Tasty daily gummies with Biotin and Zinc to support hair and nail health from within. This is sample demo content.',
    usageInstructions:
      'Chew 2 gummies daily, preferably with a meal.',
    frequency: 'Twice daily (2 gummies)',
    precautions:
      'Do not exceed 2 gummies per day. Not a substitute for a balanced diet. Keep out of reach of children.',
    sourceUrl: 'https://manmatters.com',
    verificationDate: '2024-01-01',
    qrCodeId: 'QR-007',
    isDemo: true,
    ingredients: ['Biotin 10,000 mcg', 'Zinc', 'Folic Acid', 'Vitamin C'],
    benefits: ['Supports hair health', 'Strengthens nails', 'Tasty format'],
    size: '30 gummies',
  },
  {
    id: 'prod-008',
    name: 'Salicylic Acid Face Wash',
    category: 'skincare',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80',
    description:
      'A gentle exfoliating face wash with 2% salicylic acid for acne-prone skin. This is sample demo content.',
    usageInstructions:
      'Wet face, apply a small amount, massage gently for 60 seconds and rinse. Use morning and evening.',
    frequency: 'Twice daily',
    precautions:
      'Avoid use around eyes. Start with once daily if skin is sensitive. Use sunscreen during the day.',
    sourceUrl: 'https://manmatters.com',
    verificationDate: '2024-01-01',
    qrCodeId: 'QR-008',
    isDemo: true,
    ingredients: ['Salicylic Acid 2%', 'Aloe Vera', 'Green Tea Extract'],
    benefits: ['Unclogs pores', 'Reduces acne', 'Gentle daily cleansing'],
    size: '100 ml',
  },
];

export const PRODUCT_CATALOGUE_CATEGORIES = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'haircare', label: 'Haircare', emoji: '💆' },
  { id: 'skincare', label: 'Skincare', emoji: '🧴' },
  { id: 'beard', label: 'Beard', emoji: '🧔' },
  { id: 'supplements', label: 'Supplements', emoji: '💊' },
  { id: 'grooming', label: 'Grooming', emoji: '✂️' },
];
