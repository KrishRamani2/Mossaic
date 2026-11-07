import { UsageLog, RoutineItem, DayOfWeek } from '../../types/routine';

export interface DayStats {
  date: string;
  scheduled: number;
  completed: number;
  skipped: number;
  rate: number; // 0-100
}

export interface WeekStats {
  weekLabel: string;
  rate: number;
  completed: number;
  scheduled: number;
}

/** Get today's date string YYYY-MM-DD */
export function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

/** Get the last N days as YYYY-MM-DD strings */
export function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

/** Day of week label from date string */
export function dayLabel(dateStr: string): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[new Date(dateStr).getDay()];
}

/** Get day name key (mon, tue, …) from date string */
export function dayKey(dateStr: string): DayOfWeek {
  const days: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return days[new Date(dateStr).getDay()];
}

/** Compute stats for a specific date */
export function computeDayStats(
  date: string,
  items: RoutineItem[],
  logs: UsageLog[]
): DayStats {
  const dk = dayKey(date);
  const eligible = items.filter(
    (item) => item.isActive && item.eligibleDays.includes(dk)
  );
  const dayLogs = logs.filter((l) => l.date === date);

  const completed = eligible.filter((item) => {
    const log = dayLogs.find((l) => l.routineItemId === item.id);
    return log?.status === 'completed';
  }).length;

  const skipped = eligible.filter((item) => {
    const log = dayLogs.find((l) => l.routineItemId === item.id);
    return log?.status === 'skipped';
  }).length;

  const scheduled = eligible.length;
  const rate = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;

  return { date, scheduled, completed, skipped, rate };
}

/** Compute stats for the last 7 days */
export function computeWeekStats(
  items: RoutineItem[],
  logs: UsageLog[]
): DayStats[] {
  return lastNDays(7).map((date) => computeDayStats(date, items, logs));
}

/** Compute weekly consistency % over last 4 weeks */
export function computeWeeklyConsistency(
  items: RoutineItem[],
  logs: UsageLog[]
): WeekStats[] {
  const weeks: WeekStats[] = [];
  for (let w = 3; w >= 0; w--) {
    let totalScheduled = 0;
    let totalCompleted = 0;
    const days: string[] = [];
    for (let d = 6; d >= 0; d--) {
      const offset = w * 7 + d;
      const date = new Date();
      date.setDate(date.getDate() - offset);
      days.push(date.toISOString().split('T')[0]);
    }
    days.forEach((date) => {
      const stats = computeDayStats(date, items, logs);
      totalScheduled += stats.scheduled;
      totalCompleted += stats.completed;
    });
    weeks.push({
      weekLabel: `W${4 - w}`,
      scheduled: totalScheduled,
      completed: totalCompleted,
      rate: totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0,
    });
  }
  return weeks;
}

/** Overall consistency for a date range */
export function computeOverallConsistency(
  items: RoutineItem[],
  logs: UsageLog[],
  days: number = 7
): number {
  const stats = lastNDays(days).map((d) => computeDayStats(d, items, logs));
  const total = stats.reduce((a, s) => a + s.scheduled, 0);
  const done = stats.reduce((a, s) => a + s.completed, 0);
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

/** Today's scheduled items with their log status */
export function getTodayItems(
  items: RoutineItem[],
  logs: UsageLog[]
): Array<{ item: RoutineItem; logStatus: 'completed' | 'skipped' | 'pending' }> {
  const today = todayString();
  const dk = dayKey(today);
  const eligible = items
    .filter((item) => item.isActive && item.eligibleDays.includes(dk))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return eligible.map((item) => {
    const log = logs.find((l) => l.routineItemId === item.id && l.date === today);
    return {
      item,
      logStatus: (log?.status ?? 'pending') as 'completed' | 'skipped' | 'pending',
    };
  });
}

/** Check if any items were skipped in the last N days (Routine Rescue trigger) */
export function hasRecentSkips(logs: UsageLog[], days: number = 3): boolean {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return logs.some(
    (l) => l.status === 'skipped' && new Date(l.date) >= cutoff
  );
}

/** Format display date */
export function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/** Format relative time */
export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

/** Generate UUID-like id */
export function generateId(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
