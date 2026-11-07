import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme';
import { useApp } from '../../src/context/AppContext';
import { DEMO_PRODUCTS } from '../../src/data/demo-products';
import {
  generateId,
  todayString,
  lastNDays,
  dayKey,
} from '../../src/lib/analytics/analytics';

type RescueStrategy = 'reschedule' | 'combine' | 'skip_acknowledged';

const STRATEGIES: {
  key: RescueStrategy;
  title: string;
  desc: string;
  emoji: string;
}[] = [
  {
    key: 'reschedule',
    title: 'Reschedule for later today',
    desc: 'Mark as pending and remind yourself to do it later today.',
    emoji: '⏰',
  },
  {
    key: 'combine',
    title: 'Combine with evening routine',
    desc: 'Add this to your next routine window today.',
    emoji: '🌙',
  },
  {
    key: 'skip_acknowledged',
    title: 'Acknowledge the miss',
    desc: 'Log it as an intentional skip and move on without guilt.',
    emoji: '✅',
  },
];

export default function RoutineRescueScreen() {
  const router = useRouter();
  const { routineItems, usageLogs, logActivity } = useApp();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [strategy, setStrategy] = useState<RescueStrategy>('reschedule');
  const [step, setStep] = useState<'select' | 'strategy' | 'done'>('select');
  const [saving, setSaving] = useState(false);

  const today = todayString();

  // Collect skipped/pending items from today and past 2 days
  const missedItems = useMemo(() => {
    const days = lastNDays(3);
    const result: Array<{
      item: (typeof routineItems)[0];
      date: string;
      status: 'skipped' | 'pending';
    }> = [];

    days.forEach((date) => {
      const stats = getTodayItemsForDate(date, routineItems, usageLogs);
      stats.forEach(({ item, logStatus }) => {
        if (logStatus === 'skipped') {
          result.push({ item, date, status: 'skipped' });
        } else if (logStatus === 'pending' && date < today) {
          result.push({ item, date, status: 'pending' });
        }
      });
    });

    return result;
  }, [routineItems, usageLogs, today]);

  const toggleItem = (key: string) => {
    setSelectedItems((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleRescue = async () => {
    if (selectedItems.length === 0) return;
    setSaving(true);

    for (const key of selectedItems) {
      const [itemId, date] = key.split('::');
      const item = routineItems.find((r) => r.id === itemId);
      if (!item) continue;

      if (strategy === 'skip_acknowledged') {
        // Log as acknowledged skip on the original date
        const existing = usageLogs.find(
          (l) => l.routineItemId === itemId && l.date === date
        );
        if (!existing) {
          await logActivity({
            id: generateId('log'),
            routineItemId: itemId,
            productId: item.productId,
            date,
            status: 'skipped',
            skippedReason: 'other',
          });
        }
      } else if (strategy === 'reschedule' || strategy === 'combine') {
        // Create a "completed" log for today (acknowledging they'll do it today)
        await logActivity({
          id: generateId('log'),
          routineItemId: itemId,
          productId: item.productId,
          date: today,
          status: 'completed',
          completedAt: new Date().toISOString(),
        });
      }
    }

    setSaving(false);
    setStep('done');
  };

  if (step === 'done') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.doneScreen}>
          <Text style={styles.doneEmoji}>🌱</Text>
          <Text style={styles.doneTitle}>Routine Rescued!</Text>
          <Text style={styles.doneSub}>
            Great — your routine is back on track. Consistency builds over time, not in a single day.
          </Text>
          <View style={styles.doneTip}>
            <Text style={styles.doneTipText}>
              💡 Tip: Missing occasionally is normal. What matters is getting back on track. You're doing great.
            </Text>
          </View>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Back to My Routine</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (step === 'select' ? router.back() : setStep('select'))}>
          <Text style={styles.backBtn}>{step === 'select' ? '✕ Close' : '← Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Routine Rescue</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introEmoji}>🔄</Text>
          <View style={styles.introContent}>
            <Text style={styles.introTitle}>Get back on track</Text>
            <Text style={styles.introDesc}>
              Routine Rescue helps you recover missed activities without losing momentum. No judgment, just progress.
            </Text>
          </View>
        </View>

        {step === 'select' && (
          <>
            <Text style={styles.sectionTitle}>Missed or skipped activities</Text>
            <Text style={styles.sectionDesc}>
              Select the activities you'd like to rescue from the past 3 days.
            </Text>

            {missedItems.length === 0 ? (
              <View style={styles.allClearCard}>
                <Text style={styles.allClearEmoji}>🎉</Text>
                <Text style={styles.allClearTitle}>All caught up!</Text>
                <Text style={styles.allClearDesc}>
                  No missed or skipped activities in the past 3 days. Keep it up!
                </Text>
              </View>
            ) : (
              <View style={styles.missedList}>
                {missedItems.map(({ item, date, status }) => {
                  const product = DEMO_PRODUCTS.find((p) => p.id === item.productId);
                  if (!product) return null;
                  const key = `${item.id}::${date}`;
                  const isSelected = selectedItems.includes(key);
                  const dateLabel =
                    date === today
                      ? 'Today'
                      : date === lastNDays(2)[0]
                      ? '2 days ago'
                      : 'Yesterday';

                  return (
                    <TouchableOpacity
                      key={key}
                      style={[styles.missedItem, isSelected && styles.missedItemSelected]}
                      onPress={() => toggleItem(key)}
                      activeOpacity={0.85}
                    >
                      <Image source={{ uri: product.image }} style={styles.missedImage} />
                      <View style={styles.missedContent}>
                        <Text style={styles.missedProductName} numberOfLines={2}>
                          {product.name}
                        </Text>
                        <View style={styles.missedMeta}>
                          <View style={[
                            styles.statusDot,
                            { backgroundColor: status === 'skipped' ? Colors.warning : Colors.textMuted }
                          ]} />
                          <Text style={styles.missedDate}>
                            {status === 'skipped' ? 'Skipped' : 'Missed'} · {dateLabel}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                        {isSelected && <Text style={styles.checkboxMark}>✓</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </>
        )}

        {step === 'strategy' && (
          <>
            <Text style={styles.sectionTitle}>Choose a recovery plan</Text>
            <Text style={styles.sectionDesc}>
              How would you like to handle {selectedItems.length} selected{' '}
              {selectedItems.length === 1 ? 'activity' : 'activities'}?
            </Text>

            <View style={styles.strategyList}>
              {STRATEGIES.map((s) => (
                <TouchableOpacity
                  key={s.key}
                  style={[
                    styles.strategyCard,
                    strategy === s.key && styles.strategyCardSelected,
                  ]}
                  onPress={() => setStrategy(s.key)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.strategyEmoji}>{s.emoji}</Text>
                  <View style={styles.strategyContent}>
                    <Text style={[styles.strategyTitle, strategy === s.key && { color: Colors.accent }]}>
                      {s.title}
                    </Text>
                    <Text style={styles.strategyDesc}>{s.desc}</Text>
                  </View>
                  {strategy === s.key && (
                    <View style={styles.strategyCheck}>
                      <Text style={styles.strategyCheckText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.note}>
              <Text style={styles.noteText}>
                📋 Routine Rescue updates your log but does not change your product's official usage instructions. Always follow your product label.
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Footer */}
      {missedItems.length > 0 && (
        <View style={styles.footer}>
          {step === 'select' ? (
            <TouchableOpacity
              style={[styles.nextBtn, selectedItems.length === 0 && styles.nextBtnDisabled]}
              disabled={selectedItems.length === 0}
              onPress={() => setStep('strategy')}
            >
              <Text style={styles.nextBtnText}>
                Continue ({selectedItems.length} selected)
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.nextBtn, saving && styles.nextBtnDisabled]}
              disabled={saving}
              onPress={handleRescue}
            >
              <Text style={styles.nextBtnText}>{saving ? 'Saving...' : 'Apply Recovery Plan'}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

// Helper to get items with status for a specific date
function getTodayItemsForDate(
  date: string,
  routineItems: any[],
  usageLogs: any[]
) {
  const dk = dayKey(date);
  const eligible = routineItems.filter(
    (item: any) => item.isActive && item.eligibleDays.includes(dk)
  );
  return eligible.map((item: any) => {
    const log = usageLogs.find(
      (l: any) => l.routineItemId === item.id && l.date === date
    );
    return {
      item,
      logStatus: (log?.status ?? 'pending') as 'completed' | 'skipped' | 'pending',
    };
  });
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
  },
  backBtn: { fontSize: Typography.fontSize.base, color: Colors.accent },
  headerTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semibold, color: Colors.text },

  scroll: { paddingHorizontal: Spacing[5], paddingBottom: Spacing[10] },

  introCard: {
    flexDirection: 'row',
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.accent,
    padding: Spacing[4],
    gap: Spacing[3],
    marginBottom: Spacing[5],
    alignItems: 'flex-start',
  },
  introEmoji: { fontSize: 32 },
  introContent: { flex: 1 },
  introTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold, color: Colors.accent, marginBottom: 4 },
  introDesc: { fontSize: Typography.fontSize.sm, color: Colors.accentMuted, lineHeight: 20 },

  sectionTitle: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold, color: Colors.text, marginBottom: 6 },
  sectionDesc: { fontSize: Typography.fontSize.base, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing[4] },

  allClearCard: {
    backgroundColor: Colors.successLight,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.success,
    padding: Spacing[6],
    alignItems: 'center',
    gap: Spacing[3],
  },
  allClearEmoji: { fontSize: 48 },
  allClearTitle: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold, color: Colors.success },
  allClearDesc: { fontSize: Typography.fontSize.base, color: Colors.text, textAlign: 'center', lineHeight: 22 },

  missedList: { gap: Spacing[3] },
  missedItem: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[3],
    gap: Spacing[3],
    alignItems: 'center',
  },
  missedItemSelected: { borderColor: Colors.accent, backgroundColor: Colors.accentLight },
  missedImage: { width: 56, height: 56, borderRadius: Radius.md, backgroundColor: Colors.border },
  missedContent: { flex: 1 },
  missedProductName: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semibold, color: Colors.text, marginBottom: 4 },
  missedMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  missedDate: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: { borderColor: Colors.accent, backgroundColor: Colors.accent },
  checkboxMark: { color: Colors.white, fontSize: 14, fontWeight: Typography.fontWeight.bold },

  strategyList: { gap: Spacing[3], marginBottom: Spacing[4] },
  strategyCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    gap: Spacing[3],
    alignItems: 'center',
  },
  strategyCardSelected: { borderColor: Colors.accent, backgroundColor: Colors.accentLight },
  strategyEmoji: { fontSize: 28 },
  strategyContent: { flex: 1 },
  strategyTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semibold, color: Colors.text, marginBottom: 4 },
  strategyDesc: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  strategyCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  strategyCheckText: { color: Colors.white, fontSize: 14, fontWeight: Typography.fontWeight.bold },

  note: {
    backgroundColor: Colors.infoLight,
    borderRadius: Radius.md,
    padding: Spacing[3],
  },
  noteText: { fontSize: Typography.fontSize.xs, color: Colors.info, lineHeight: 18 },

  footer: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[8],
    paddingTop: Spacing[3],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  nextBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: Colors.white, fontWeight: Typography.fontWeight.bold, fontSize: Typography.fontSize.base },

  doneScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing[8] },
  doneEmoji: { fontSize: 72, marginBottom: Spacing[5] },
  doneTitle: { fontSize: Typography.fontSize['3xl'], fontWeight: Typography.fontWeight.bold, color: Colors.text, textAlign: 'center', marginBottom: Spacing[3] },
  doneSub: { fontSize: Typography.fontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: Spacing[5] },
  doneTip: { backgroundColor: Colors.accentLight, borderRadius: Radius.md, padding: Spacing[4], marginBottom: Spacing[8] },
  doneTipText: { fontSize: Typography.fontSize.sm, color: Colors.accentMuted, lineHeight: 20, textAlign: 'center' },
  doneBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: 16,
    paddingHorizontal: 48,
  },
  doneBtnText: { color: Colors.white, fontWeight: Typography.fontWeight.bold, fontSize: Typography.fontSize.base },
});
