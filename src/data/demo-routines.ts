import { Routine, RoutineItem, UsageLog, Reflection } from '../types/routine';
import { UserProduct } from '../types/product';

const today = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return fmt(d);
};

export const DEMO_ROUTINES: Routine[] = [
  {
    id: 'routine-001',
    name: 'Morning Hair Care',
    description: 'Your daily haircare routine to keep your hair healthy.',
    createdAt: daysAgo(14),
    isActive: true,
    isDemo: true,
  },
  {
    id: 'routine-002',
    name: 'Evening Skin & Beard',
    description: 'Wind down with your evening skin and beard care ritual.',
    createdAt: daysAgo(14),
    isActive: true,
    isDemo: true,
  },
];

export const DEMO_ROUTINE_ITEMS: RoutineItem[] = [
  {
    id: 'item-001',
    routineId: 'routine-001',
    productId: 'prod-001',
    preferredTime: 'morning',
    eligibleDays: ['mon', 'wed', 'fri', 'sat'],
    isActive: true,
    order: 1,
  },
  {
    id: 'item-002',
    routineId: 'routine-001',
    productId: 'prod-002',
    preferredTime: 'morning',
    eligibleDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    isActive: true,
    order: 2,
  },
  {
    id: 'item-003',
    routineId: 'routine-001',
    productId: 'prod-003',
    preferredTime: 'morning',
    eligibleDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    isActive: true,
    order: 3,
  },
  {
    id: 'item-004',
    routineId: 'routine-002',
    productId: 'prod-004',
    preferredTime: 'evening',
    eligibleDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    isActive: true,
    order: 1,
  },
  {
    id: 'item-005',
    routineId: 'routine-002',
    productId: 'prod-005',
    preferredTime: 'evening',
    eligibleDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    isActive: true,
    order: 2,
  },
  {
    id: 'item-006',
    routineId: 'routine-002',
    productId: 'prod-002',
    preferredTime: 'evening',
    eligibleDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    isActive: true,
    order: 3,
  },
];

export const DEMO_USER_PRODUCTS: UserProduct[] = [
  { id: 'up-001', productId: 'prod-001', addedAt: daysAgo(14), status: 'active' },
  { id: 'up-002', productId: 'prod-002', addedAt: daysAgo(14), status: 'active' },
  { id: 'up-003', productId: 'prod-003', addedAt: daysAgo(10), status: 'active' },
  { id: 'up-004', productId: 'prod-004', addedAt: daysAgo(7), status: 'active' },
  { id: 'up-005', productId: 'prod-005', addedAt: daysAgo(7), status: 'active' },
];

// Generate realistic usage logs for the last 14 days
export const DEMO_USAGE_LOGS: UsageLog[] = (() => {
  const logs: UsageLog[] = [];
  const items = DEMO_ROUTINE_ITEMS;
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  let logId = 1;

  for (let i = 13; i >= 1; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = fmt(date);
    const dayName = dayNames[date.getDay()] as any;

    items.forEach((item) => {
      if (!item.eligibleDays.includes(dayName)) return;
      const rand = Math.random();
      let status: 'completed' | 'skipped' | 'pending' = 'completed';
      if (rand < 0.1) status = 'skipped';

      logs.push({
        id: `log-demo-${logId++}`,
        routineItemId: item.id,
        productId: item.productId,
        date: dateStr,
        status,
        skippedReason: status === 'skipped' ? 'busy' : undefined,
        completedAt: status === 'completed' ? date.toISOString() : undefined,
      });
    });
  }
  return logs;
})();

export const DEMO_REFLECTIONS: Reflection[] = [
  {
    id: 'ref-001',
    date: daysAgo(10) + 'T20:00:00.000Z',
    content:
      'Started my routine today. Feeling good about being consistent this week.',
    mood: 'great',
  },
  {
    id: 'ref-002',
    date: daysAgo(7) + 'T20:30:00.000Z',
    content:
      'Added the beard oil to my evening routine. The texture feels lighter than expected.',
    relatedProductId: 'prod-005',
    mood: 'good',
  },
  {
    id: 'ref-003',
    date: daysAgo(3) + 'T21:00:00.000Z',
    content:
      'Missed the morning routine today — busy with work. Got back on track in the evening.',
    mood: 'neutral',
  },
];
