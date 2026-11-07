import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../src/constants/theme';
import { useApp } from '../../src/context/AppContext';
import { DEMO_PRODUCTS } from '../../src/data/demo-products';
import {
  getTodayItems,
  computeDayStats,
  generateId,
  todayString,
  computeWeekStats,
  dayLabel,
} from '../../src/lib/analytics/analytics';
import { DayOfWeek, SkipReason } from '../../src/types/routine';
import { SectionHeader, EmptyState } from '../../src/components/common/UIComponents';

const DAYS: { key: DayOfWeek; short: string }[] = [
  { key: 'mon', short: 'M' },
  { key: 'tue', short: 'T' },
  { key: 'wed', short: 'W' },
  { key: 'thu', short: 'T' },
  { key: 'fri', short: 'F' },
  { key: 'sat', short: 'S' },
  { key: 'sun', short: 'S' },
];

const SKIP_REASONS: { key: SkipReason; label: string; emoji: string }[] = [
  { key: 'forgot', label: 'Forgot', emoji: '🤔' },
  { key: 'busy', label: 'Busy schedule', emoji: '⏱️' },
  { key: 'travelling', label: 'Travelling', emoji: '✈️' },
  { key: 'product_unavailable', label: 'Product unavailable', emoji: '📦' },
  { key: 'other', label: 'Other', emoji: '💬' },
];

export default function RoutineScreen() {
  const router = useRouter();
  const { routineItems, usageLogs, routines, logActivity, upsertRoutine } = useApp();
  const [skipModal, setSkipModal] = useState<{ itemId: string; productId: string } | null>(null);
  const [selectedSkipReason, setSelectedSkipReason] = useState<SkipReason | null>(null);

  const today = todayString();
  const todayItems = useMemo(() => getTodayItems(routineItems, usageLogs), [routineItems, usageLogs]);
  const todayStats = useMemo(() => computeDayStats(today, routineItems, usageLogs), [today, routineItems, usageLogs]);
  const weekStats = useMemo(() => computeWeekStats(routineItems, usageLogs), [routineItems, usageLogs]);

  const handleComplete = async (itemId: string, productId: string) => {
    await logActivity({
      id: generateId('log'),
      routineItemId: itemId,
      productId,
      date: today,
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
  };

  const handleSkipConfirm = async () => {
    if (!skipModal || !selectedSkipReason) return;
    await logActivity({
      id: generateId('log'),
      routineItemId: skipModal.itemId,
      productId: skipModal.productId,
      date: today,
      status: 'skipped',
      skippedReason: selectedSkipReason,
    });
    setSkipModal(null);
    setSelectedSkipReason(null);
  };

  const handlePauseRoutine = (routineId: string, isActive: boolean) => {
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) return;
    upsertRoutine({ ...routine, isActive: !isActive });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>YOUR DAILY FLOW</Text>
            <Text style={styles.headerTitle}>My Routine</Text>
            <Text style={styles.headerSub}>A little consistency goes a long way.</Text>
          </View>
          <TouchableOpacity
            style={styles.addRoutineBtn}
            onPress={() => router.push('/routine/builder')}
          >
            <Ionicons name="add" size={20} color={Colors.white} />
            <Text style={styles.addRoutineBtnText}>Activity</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.todayCard}>
          <View style={styles.todayCopy}>
            <Text style={styles.todayEyebrow}>TODAY&apos;S FOCUS</Text>
            <Text style={styles.todayTitle}>
              {todayStats.completed === todayStats.scheduled && todayStats.scheduled > 0
                ? 'Routine complete.'
                : 'Stay in your rhythm.'}
            </Text>
            <Text style={styles.todaySub}>
              {todayStats.scheduled > 0
                ? `${todayStats.completed} of ${todayStats.scheduled} activities completed`
                : 'No activities scheduled yet'}
            </Text>
          </View>
          <View style={styles.todayIcon}>
            <Ionicons name="checkmark-done-outline" size={28} color={Colors.accent} />
          </View>
        </View>

        {/* Week Mini Calendar */}
        <View style={styles.weekCalendar}>
          {weekStats.map((stat) => {
            const isToday = stat.date === today;
            const pct = stat.scheduled > 0 ? stat.completed / stat.scheduled : 0;
            return (
              <View key={stat.date} style={[styles.dayCell, isToday && styles.dayCellToday]}>
                <Text style={[styles.dayName, isToday && styles.dayNameToday]}>
                  {dayLabel(stat.date)}
                </Text>
                <View style={[styles.dayRing, isToday && styles.dayRingToday]}>
                  <Text style={[styles.dayNum, isToday && styles.dayNumToday]}>
                    {new Date(stat.date).getDate()}
                  </Text>
                </View>
                {stat.scheduled > 0 ? (
                  <View style={styles.dayDot}>
                    <View
                      style={[
                        styles.dayDotFill,
                        {
                          backgroundColor:
                            pct === 1
                              ? Colors.success
                              : pct > 0
                              ? Colors.warning
                              : Colors.border,
                        },
                      ]}
                    />
                  </View>
                ) : (
                  <View style={styles.dayDot} />
                )}
              </View>
            );
          })}
        </View>

        {/* Today's Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Today&apos;s progress</Text>
            <Text style={styles.progressValue}>{todayStats.completed}/{todayStats.scheduled}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${todayStats.scheduled > 0
                    ? (todayStats.completed / todayStats.scheduled) * 100
                    : 0}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Routine Rescue Banner */}
        {todayStats.skipped > 0 && (
          <TouchableOpacity
            style={styles.rescueBanner}
            onPress={() => router.push('/routine/rescue')}
            activeOpacity={0.9}
          >
            <Text style={styles.rescueEmoji}>🔄</Text>
            <Text style={styles.rescueText}>
              {todayStats.skipped} skipped today — Routine Rescue is available
            </Text>
            <Text style={styles.rescueArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* Today's Routine Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <View>
              <Text style={styles.sectionTitle}>Today&apos;s Activities</Text>
              <Text style={styles.sectionSub}>Your scheduled care, all in one place</Text>
            </View>
            <View style={styles.sectionIcon}><Ionicons name="sunny-outline" size={18} color={Colors.accent} /></View>
          </View>
          {todayItems.length === 0 ? (
            <EmptyState
              emoji="☀️"
              title="No activities scheduled today"
              subtitle="Add products to your routine using the builder."
              action={{ label: 'Build Routine', onPress: () => router.push('/routine/builder') }}
            />
          ) : (
            <View style={styles.itemList}>
              {todayItems.map(({ item, logStatus }) => {
                const product = DEMO_PRODUCTS.find((p) => p.id === item.productId);
                if (!product) return null;
                return (
                  <View key={item.id} style={styles.routineItem}>
                    <Image source={{ uri: product.image }} style={styles.itemImage} />
                    <View style={styles.itemContent}>
                      <Text style={styles.itemName} numberOfLines={1}>{product.name}</Text>
                      <Text style={styles.itemFreq}>{product.frequency}</Text>
                      <Text style={styles.itemTime}>
                        {item.preferredTime === 'morning' ? '☀️' : '🌙'} {item.preferredTime}
                      </Text>
                    </View>
                    <View style={styles.itemActions}>
                      {logStatus === 'pending' ? (
                        <>
                          <TouchableOpacity
                            style={styles.doneBtn}
                            onPress={() => handleComplete(item.id, item.productId)}
                          >
                            <Text style={styles.doneBtnText}>✓</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.skipBtn}
                            onPress={() => setSkipModal({ itemId: item.id, productId: item.productId })}
                          >
                            <Text style={styles.skipBtnText}>Skip</Text>
                          </TouchableOpacity>
                        </>
                      ) : logStatus === 'completed' ? (
                        <View style={styles.completedBadge}>
                          <Text style={styles.completedText}>✓ Done</Text>
                        </View>
                      ) : (
                        <View style={styles.skippedBadge}>
                          <Text style={styles.skippedText}>Skipped</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* My Routines */}
        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <View>
              <Text style={styles.sectionTitle}>My Routines</Text>
              <Text style={styles.sectionSub}>Manage your active plans</Text>
            </View>
            <View style={styles.sectionIcon}><Ionicons name="layers-outline" size={18} color={Colors.accent} /></View>
          </View>
          {routines.length === 0 ? (
            <EmptyState
              emoji="📋"
              title="No routines yet"
              subtitle="Create a routine from your products."
              action={{ label: 'Create Routine', onPress: () => router.push('/routine/builder') }}
            />
          ) : (
            <View style={styles.routineList}>
              {routines.map((routine) => {
                const items = routineItems.filter((ri) => ri.routineId === routine.id);
                return (
                  <View key={routine.id} style={styles.routineCard}>
                    <View style={styles.routineCardLeft}>
                      <Text style={styles.routineName}>{routine.name}</Text>
                      <Text style={styles.routineItemCount}>
                        {items.length} activity{items.length !== 1 ? 'ies' : ''}
                      </Text>
                    </View>
                    <View style={styles.routineCardRight}>
                      <TouchableOpacity
                        style={[
                          styles.pauseBtn,
                          !routine.isActive && styles.pauseBtnInactive,
                        ]}
                        onPress={() => handlePauseRoutine(routine.id, routine.isActive)}
                      >
                        <Text style={styles.pauseBtnText}>
                          {routine.isActive ? 'Pause' : 'Resume'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Skip Reason Modal */}
      <Modal
        visible={!!skipModal}
        transparent
        animationType="slide"
        onRequestClose={() => setSkipModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Why are you skipping?</Text>
            <Text style={styles.modalSub}>
              This is optional. We'll never judge you for missing a day.
            </Text>
            <View style={styles.reasonList}>
              {SKIP_REASONS.map((r) => (
                <TouchableOpacity
                  key={r.key}
                  style={[
                    styles.reasonItem,
                    selectedSkipReason === r.key && styles.reasonItemSelected,
                  ]}
                  onPress={() => setSelectedSkipReason(r.key)}
                >
                  <Text style={styles.reasonEmoji}>{r.emoji}</Text>
                  <Text
                    style={[
                      styles.reasonLabel,
                      selectedSkipReason === r.key && { color: Colors.accent },
                    ]}
                  >
                    {r.label}
                  </Text>
                  {selectedSkipReason === r.key && (
                    <View style={styles.reasonCheck}>
                      <Text style={styles.reasonCheckText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalSkipAnyway}
                onPress={handleSkipConfirm}
              >
                <Text style={styles.modalSkipAnywayText}>Skip Activity</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => {
                  setSkipModal(null);
                  setSelectedSkipReason(null);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: Spacing[4] },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[4],
  },
  eyebrow: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1.2,
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    letterSpacing: -0.4,
  },
  headerSub: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  addRoutineBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    paddingHorizontal: 13,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addRoutineBtnText: {
    color: Colors.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  todayCard: {
    marginHorizontal: Spacing[5],
    marginBottom: Spacing[4],
    borderRadius: Radius.xl,
    padding: Spacing[5],
    backgroundColor: Colors.accentLight,
    borderWidth: 1,
    borderColor: '#D5E6DA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  todayCopy: { flex: 1, paddingRight: Spacing[3] },
  todayEyebrow: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
    marginBottom: 6,
  },
  todayTitle: { color: Colors.text, fontSize: 21, fontWeight: Typography.fontWeight.bold },
  todaySub: { color: Colors.textSecondary, fontSize: Typography.fontSize.xs, marginTop: 6 },
  todayIcon: {
    width: 58,
    height: 58,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  weekCalendar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    marginBottom: Spacing[4],
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing[5],
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing[3],
  },
  dayCell: { alignItems: 'center', flex: 1 },
  dayCellToday: {},
  dayName: { fontSize: Typography.fontSize.xs, color: Colors.textMuted, marginBottom: 4 },
  dayNameToday: { color: Colors.accent, fontWeight: Typography.fontWeight.semibold },
  dayRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dayRingToday: { backgroundColor: Colors.accent },
  dayNum: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.medium, color: Colors.text },
  dayNumToday: { color: Colors.white },
  dayDot: { width: 6, height: 6, alignItems: 'center', justifyContent: 'center' },
  dayDotFill: { width: 6, height: 6, borderRadius: 3 },

  progressSection: {
    paddingHorizontal: Spacing[5],
    marginBottom: Spacing[4],
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 },
  progressTitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 0,
  },
  progressValue: { color: Colors.accent, fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.bold },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
  },

  rescueBanner: {
    marginHorizontal: Spacing[5],
    marginBottom: Spacing[4],
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[3],
    gap: Spacing[2],
  },
  rescueEmoji: { fontSize: 20 },
  rescueText: { flex: 1, fontSize: Typography.fontSize.sm, color: Colors.accent, fontWeight: Typography.fontWeight.medium },
  rescueArrow: { color: Colors.accent, fontSize: 18 },

  section: { paddingHorizontal: Spacing[5], marginBottom: Spacing[5] },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing[3],
  },
  sectionTitle: { color: Colors.text, fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold },
  sectionSub: { color: Colors.textSecondary, fontSize: Typography.fontSize.xs, marginTop: 3 },
  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemList: { gap: Spacing[3] },

  routineItem: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[3],
    gap: Spacing[3],
    alignItems: 'center',
  },
  itemImage: { width: 60, height: 60, borderRadius: Radius.lg, backgroundColor: Colors.border },
  itemContent: { flex: 1 },
  itemName: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semibold, color: Colors.text },
  itemFreq: { fontSize: Typography.fontSize.xs, color: Colors.textSecondary, marginBottom: 2 },
  itemTime: { fontSize: Typography.fontSize.xs, color: Colors.textSecondary },
  itemActions: { gap: 6, alignItems: 'flex-end' },

  doneBtn: {
    backgroundColor: Colors.accent,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: { color: Colors.white, fontSize: 18, fontWeight: Typography.fontWeight.bold },
  skipBtn: {
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  skipBtnText: { fontSize: Typography.fontSize.xs, color: Colors.warning, fontWeight: Typography.fontWeight.medium },
  completedBadge: { backgroundColor: Colors.successLight, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  completedText: { fontSize: Typography.fontSize.xs, color: Colors.success, fontWeight: Typography.fontWeight.semibold },
  skippedBadge: { backgroundColor: Colors.warningLight, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  skippedText: { fontSize: Typography.fontSize.xs, color: Colors.warning, fontWeight: Typography.fontWeight.semibold },

  routineList: { gap: Spacing[3] },
  routineCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routineCardLeft: { flex: 1 },
  routineName: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semibold, color: Colors.text },
  routineItemCount: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  routineCardRight: {},
  pauseBtn: {
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pauseBtnInactive: { backgroundColor: Colors.accentLight },
  pauseBtnText: { fontSize: Typography.fontSize.sm, color: Colors.warning, fontWeight: Typography.fontWeight.medium },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing[6],
    paddingBottom: Spacing[10],
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: 8,
  },
  modalSub: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing[5],
    lineHeight: 20,
  },
  reasonList: { gap: Spacing[2], marginBottom: Spacing[5] },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[3],
    gap: Spacing[3],
  },
  reasonItemSelected: { borderColor: Colors.accent, backgroundColor: Colors.accentLight },
  reasonEmoji: { fontSize: 22 },
  reasonLabel: { flex: 1, fontSize: Typography.fontSize.base, color: Colors.text, fontWeight: Typography.fontWeight.medium },
  reasonCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonCheckText: { color: Colors.white, fontSize: 12, fontWeight: Typography.fontWeight.bold },
  modalActions: { gap: Spacing[3] },
  modalSkipAnyway: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalSkipAnywayText: { color: Colors.white, fontWeight: Typography.fontWeight.semibold, fontSize: Typography.fontSize.base },
  modalCancel: {
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCancelText: { color: Colors.text, fontWeight: Typography.fontWeight.medium, fontSize: Typography.fontSize.base },
});
