export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  reminderMorning: boolean;
  reminderEvening: boolean;
  reminderTime: string; // "HH:MM"
  selectedCategories: string[];
  onboardingCompleted: boolean;
  isDemoMode: boolean;
  userName?: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  reminderMorning: true,
  reminderEvening: true,
  reminderTime: '08:00',
  selectedCategories: [],
  onboardingCompleted: false,
  isDemoMode: false,
};

export interface OnboardingState {
  step: number;
  selectedCategories: string[];
  completed: boolean;
}
