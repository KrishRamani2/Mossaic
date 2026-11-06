export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';
export type LogStatus = 'completed' | 'skipped' | 'pending';
export type SkipReason =
  | 'forgot'
  | 'busy'
  | 'travelling'
  | 'product_unavailable'
  | 'other';

export interface Routine {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  isActive: boolean;
  isDemo?: boolean;
}

export interface RoutineItem {
  id: string;
  routineId: string;
  productId: string;
  preferredTime: TimeOfDay;
  eligibleDays: DayOfWeek[];
  isActive: boolean;
  notes?: string;
  order?: number;
}

export interface UsageLog {
  id: string;
  routineItemId: string;
  productId: string;
  date: string; // ISO date YYYY-MM-DD
  status: LogStatus;
  skippedReason?: SkipReason;
  skippedNote?: string;
  completedAt?: string; // ISO datetime
}

export interface Reflection {
  id: string;
  date: string; // ISO datetime
  content: string;
  relatedProductId?: string;
  mood?: 'great' | 'good' | 'neutral' | 'challenging';
}
