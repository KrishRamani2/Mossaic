// Design Tokens for MM Ritual
// Brand: Man Matters — Premium, Minimal, Modern Personal Care

export const Colors = {
  // Core Palette
  background: '#FAFAF8',
  surface: '#FFFFFF',
  surfaceAlt: '#F4F4F2',
  text: '#171717',
  textSecondary: '#737373',
  textMuted: '#A3A3A3',
  border: '#E8EAE7',
  borderLight: '#F0F1EF',

  // Accent
  accent: '#245B45',
  accentLight: '#EDF4EF',
  accentMuted: '#3D7A5F',
  accentDark: '#1A4433',

  // Status
  success: '#22c55e',
  successLight: '#dcfce7',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  error: '#ef4444',
  errorLight: '#fee2e2',
  info: '#3b82f6',
  infoLight: '#dbeafe',

  // Dark Mode
  dark: {
    background: '#0F0F0E',
    surface: '#1A1A18',
    surfaceAlt: '#242422',
    text: '#F5F5F3',
    textSecondary: '#A3A3A1',
    textMuted: '#737371',
    border: '#2E2E2C',
    borderLight: '#252523',
  },

  // Category colors
  haircare: '#245B45',
  skincare: '#5B4524',
  beard: '#24455B',
  supplements: '#5B2445',
  grooming: '#455B24',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const Typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 34,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const CategoryMeta: Record<string, { label: string; emoji: string; color: string }> = {
  haircare: { label: 'Haircare', emoji: '💆', color: Colors.haircare },
  skincare: { label: 'Skincare', emoji: '🧴', color: Colors.skincare },
  beard: { label: 'Beard Care', emoji: '🧔', color: Colors.beard },
  supplements: { label: 'Supplements', emoji: '💊', color: Colors.supplements },
  grooming: { label: 'Grooming', emoji: '✂️', color: Colors.grooming },
};

export const TimeOfDayMeta: Record<string, { label: string; icon: string; color: string }> = {
  morning: { label: 'Morning', icon: '☀️', color: '#f59e0b' },
  afternoon: { label: 'Afternoon', icon: '🌤️', color: '#f97316' },
  evening: { label: 'Evening', icon: '🌙', color: '#6366f1' },
  anytime: { label: 'Anytime', icon: '⏰', color: '#245B45' },
};
