export interface AppNotificationSettings {
  morningEnabled: boolean;
  eveningEnabled: boolean;
  rescueEnabled: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  reminderMorning: boolean;
  reminderEvening: boolean;
  reminderTime: string; // "HH:MM"
  selectedCategories: string[];
  onboardingCompleted: boolean;
  isDemoMode: boolean;
  userName?: string;
  notifications?: AppNotificationSettings;
  showTips?: boolean;
  showStreak?: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  reminderMorning: true,
  reminderEvening: true,
  reminderTime: '08:00',
  selectedCategories: [],
  onboardingCompleted: false,
  isDemoMode: false,
  notifications: {
    morningEnabled: true,
    eveningEnabled: true,
    rescueEnabled: true,
  },
  showTips: true,
  showStreak: true,
};

export interface OnboardingState {
  step: number;
  selectedCategories: string[];
  completed: boolean;
}
