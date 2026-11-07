import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme';
import { useApp } from '../../src/context/AppContext';
import {
  computeWeekStats,
  computeWeeklyConsistency,
  computeOverallConsistency,
  lastNDays,
  computeDayStats,
  generateId,
  formatRelativeTime,
} from '../../src/lib/analytics/analytics';
import { Reflection } from '../../src/types/routine';
import { DEMO_PRODUCTS } from '../../src/data/demo-products';
import { SectionHeader, EmptyState } from '../../src/components/common/UIComponents';

const MOODS: { key: Reflection['mood']; emoji: string; label: string }[] = [
  { key: 'great', emoji: '🤩', label: 'Great' },
  { key: 'good', emoji: '😊', label: 'Good' },
  { key: 'neutral', emoji: '😐', label: 'Neutral' },
  { key: 'challenging', emoji: '😤', label: 'Challenging' },
];

export default function JourneyScreen() {
  const { routineItems, usageLogs, reflections, addReflection, removeReflection } = useApp();
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [selectedMood, setSelectedMood] = useState<Reflection['mood']>('good');
  const [savingReflection, setSavingReflection] = useState(false);

  const weekStats = useMemo(() => computeWeekStats(routineItems, usageLogs), [routineItems, usageLogs]);
  const weeklyConsistency = useMemo(() => computeWeeklyConsistency(routineItems, usageLogs), [routineItems, usageLogs]);
  const overallConsistency = useMemo(() => computeOverallConsistency(routineItems, usageLogs, 30), [routineItems, usageLogs]);
  const weekConsistency = useMemo(() => computeOverallConsistency(routineItems, usageLogs, 7), [routineItems, usageLogs]);

  const totalCompleted = useMemo(() => {
    return usageLogs.filter((l) => l.status === 'completed').length;
  }, [usageLogs]);
  const totalSkipped = useMemo(() => {
    return usageLogs.filter((l) => l.status === 'skipped').length;
  }, [usageLogs]);

  const last30Days = useMemo(() => lastNDays(30).map((date) =>
    computeDayStats(date, routineItems, usageLogs)
  ), [routineItems, usageLogs]);

  const handleSaveReflection = async () => {
    if (!reflectionText.trim()) return;
    setSavingReflection(true);
    await addReflection({
      id: generateId('ref'),
      date: new Date().toISOString(),
      content: reflectionText.trim(),
      mood: selectedMood,
    });
    setSavingReflection(false);
    setReflectionText('');
    setShowReflectionModal(false);
  };

  const handleDeleteReflection = (id: string) => {
    Alert.alert('Delete Note', 'Remove this reflection note?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeReflection(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Journey</Text>
          <Text style={styles.headerSub}>Your personal care progress</Text>
        </View>

        {/* Summary Stats */}
        <View style={styles.statsGrid}>
          <StatCard label="7-Day Consistency" value={`${weekConsistency}%`} emoji="📅" accent />
          <StatCard label="30-Day Consistency" value={`${overallConsistency}%`} emoji="📆" />
          <StatCard label="Activities Done" value={`${totalCompleted}`} emoji="✅" />
          <StatCard label="Activities Skipped" value={`${totalSkipped}`} emoji="⏭️" />
        </View>

        {/* Week Chart */}
        <View style={styles.section}>
          <SectionHeader title="This Week" />
          <View style={styles.barChart}>
            {weekStats.map((stat) => {
              const pct = stat.scheduled > 0 ? (stat.completed / stat.scheduled) : 0;
              const isToday = stat.date === new Date().toISOString().split('T')[0];
              return (
                <View key={stat.date} style={styles.barCol}>
                  <Text style={styles.barPct}>{stat.scheduled > 0 ? `${Math.round(pct * 100)}%` : ''}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${pct * 100}%`,
                          backgroundColor: isToday ? Colors.accent : pct === 1 ? Colors.success : pct > 0 ? Colors.warning : Colors.border,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barDay, isToday && { color: Colors.accent, fontWeight: Typography.fontWeight.bold }]}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(stat.date).getDay()]}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Monthly Heatmap */}
        <View style={styles.section}>
          <SectionHeader title="Last 30 Days" />
          <View style={styles.heatmap}>
            {last30Days.map((stat) => {
              const pct = stat.scheduled > 0 ? stat.completed / stat.scheduled : -1;
              return (
                <View
                  key={stat.date}
                  style={[
                    styles.heatCell,
                    {
                      backgroundColor:
                        pct === -1
                          ? Colors.border
                          : pct === 1
                          ? Colors.accent
                          : pct > 0
                          ? Colors.accentMuted
                          : Colors.accentLight,
                      opacity: pct === -1 ? 0.3 : 1,
                    },
                  ]}
                />
              );
            })}
          </View>
          <View style={styles.heatLegend}>
            <View style={[styles.heatLegendDot, { backgroundColor: Colors.border }]} />
            <Text style={styles.heatLegendText}>None</Text>
            <View style={[styles.heatLegendDot, { backgroundColor: Colors.accentLight }]} />
            <Text style={styles.heatLegendText}>Partial</Text>
            <View style={[styles.heatLegendDot, { backgroundColor: Colors.accent }]} />
            <Text style={styles.heatLegendText}>Complete</Text>
          </View>
        </View>

        {/* Weekly Consistency Trend */}
        <View style={styles.section}>
          <SectionHeader title="Weekly Trend (4 Weeks)" />
          <View style={styles.trendRow}>
            {weeklyConsistency.map((week) => (
              <View key={week.weekLabel} style={styles.trendItem}>
                <View style={styles.trendBarTrack}>
                  <View
                    style={[
                      styles.trendBarFill,
                      { height: `${week.rate}%`, backgroundColor: Colors.accent },
                    ]}
                  />
                </View>
                <Text style={styles.trendPct}>{week.rate}%</Text>
                <Text style={styles.trendLabel}>{week.weekLabel}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            📊 These charts track your routine activity. They do not reflect medical outcomes or guaranteed results.
          </Text>
        </View>

        {/* Reflections */}
        <View style={styles.section}>
          <SectionHeader
            title="My Reflections"
            action={{ label: '+ Add Note', onPress: () => setShowReflectionModal(true) }}
          />
          {reflections.length === 0 ? (
            <EmptyState
              emoji="📝"
              title="No notes yet"
              subtitle="Record observations and thoughts about your personal care routine."
              action={{ label: 'Add First Note', onPress: () => setShowReflectionModal(true) }}
            />
          ) : (
            <View style={styles.reflectionList}>
              {reflections.map((r) => {
                const moodObj = MOODS.find((m) => m.key === r.mood);
                const relatedProduct = r.relatedProductId
                  ? DEMO_PRODUCTS.find((p) => p.id === r.relatedProductId)
                  : null;
                return (
                  <View key={r.id} style={styles.reflectionCard}>
                    <View style={styles.reflectionHeader}>
                      <Text style={styles.reflectionMood}>{moodObj?.emoji ?? '📝'}</Text>
                      <View style={styles.reflectionMeta}>
                        <Text style={styles.reflectionDate}>{formatRelativeTime(r.date)}</Text>
                        {relatedProduct && (
                          <Text style={styles.reflectionProduct}>re: {relatedProduct.name}</Text>
                        )}
                      </View>
                      <TouchableOpacity onPress={() => handleDeleteReflection(r.id)}>
                        <Text style={styles.deleteReflection}>✕</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.reflectionContent}>{r.content}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Reflection Modal */}
      <Modal
        visible={showReflectionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReflectionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Add a Reflection</Text>
            <Text style={styles.modalSub}>
              Record any observations about your routine or personal care experience.
            </Text>

            <Text style={styles.moodLabel}>How's it going?</Text>
            <View style={styles.moodRow}>
              {MOODS.map((m) => (
                <TouchableOpacity
                  key={m.key}
                  style={[
                    styles.moodBtn,
                    selectedMood === m.key && styles.moodBtnSelected,
                  ]}
                  onPress={() => setSelectedMood(m.key)}
                >
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
                  <Text style={[styles.moodBtnLabel, selectedMood === m.key && { color: Colors.accent }]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reflectionInput}
              placeholder="What would you like to note? (e.g. consistency, observations, reminders)"
              placeholderTextColor={Colors.textMuted}
              value={reflectionText}
              onChangeText={setReflectionText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.saveBtn, !reflectionText.trim() && { opacity: 0.5 }]}
                onPress={handleSaveReflection}
                disabled={!reflectionText.trim() || savingReflection}
              >
                <Text style={styles.saveBtnText}>Save Note</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setShowReflectionModal(false);
                  setReflectionText('');
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function StatCard({ label, value, emoji, accent }: {
  label: string; value: string; emoji: string; accent?: boolean;
}) {
  return (
    <View style={[styles.statCard, accent && styles.statCardAccent]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValue, accent && { color: Colors.accent }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: Spacing[10] },

  header: { paddingHorizontal: Spacing[5], paddingTop: Spacing[5], paddingBottom: Spacing[4] },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    letterSpacing: -0.4,
  },
  headerSub: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, marginTop: 4 },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing[5],
    gap: Spacing[3],
    marginBottom: Spacing[5],
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    alignItems: 'center',
    gap: 4,
  },
  statCardAccent: { backgroundColor: Colors.accentLight, borderColor: Colors.accent },
  statEmoji: { fontSize: 24 },
  statValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  statLabel: { fontSize: Typography.fontSize.xs, color: Colors.textSecondary, textAlign: 'center' },

  section: { paddingHorizontal: Spacing[5], marginBottom: Spacing[6] },

  barChart: {
    flexDirection: 'row',
    height: 120,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    gap: Spacing[2],
    alignItems: 'flex-end',
  },
  barCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barPct: { fontSize: 9, color: Colors.textMuted, marginBottom: 4 },
  barTrack: { width: '70%', height: '75%', backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 4 },
  barDay: { fontSize: Typography.fontSize.xs, color: Colors.textSecondary, marginTop: 4 },

  heatmap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
  },
  heatCell: { width: 20, height: 20, borderRadius: 4 },
  heatLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing[2],
    justifyContent: 'flex-end',
  },
  heatLegendDot: { width: 12, height: 12, borderRadius: 3 },
  heatLegendText: { fontSize: Typography.fontSize.xs, color: Colors.textSecondary },

  trendRow: {
    flexDirection: 'row',
    height: 100,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    gap: Spacing[4],
    alignItems: 'flex-end',
  },
  trendItem: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  trendBarTrack: { width: '50%', height: '65%', backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' },
  trendBarFill: { width: '100%', borderRadius: 4 },
  trendPct: { fontSize: 10, color: Colors.textSecondary, marginTop: 4 },
  trendLabel: { fontSize: Typography.fontSize.xs, color: Colors.textSecondary, fontWeight: Typography.fontWeight.medium },

  disclaimer: {
    marginHorizontal: Spacing[5],
    marginBottom: Spacing[5],
    backgroundColor: Colors.infoLight,
    borderRadius: Radius.md,
    padding: Spacing[3],
  },
  disclaimerText: { fontSize: Typography.fontSize.xs, color: Colors.info, lineHeight: 18 },

  reflectionList: { gap: Spacing[3] },
  reflectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
  },
  reflectionHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing[3], gap: Spacing[2] },
  reflectionMood: { fontSize: 24 },
  reflectionMeta: { flex: 1 },
  reflectionDate: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, fontWeight: Typography.fontWeight.medium },
  reflectionProduct: { fontSize: Typography.fontSize.xs, color: Colors.accent, marginTop: 2 },
  deleteReflection: { fontSize: 16, color: Colors.textMuted, padding: 4 },
  reflectionContent: { fontSize: Typography.fontSize.base, color: Colors.text, lineHeight: 22 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing[6],
    paddingBottom: Spacing[10],
  },
  modalTitle: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold, color: Colors.text, marginBottom: 8 },
  modalSub: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, marginBottom: Spacing[4], lineHeight: 20 },

  moodLabel: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semibold, color: Colors.text, marginBottom: Spacing[2] },
  moodRow: { flexDirection: 'row', gap: Spacing[2], marginBottom: Spacing[4] },
  moodBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing[2],
    gap: 4,
  },
  moodBtnSelected: { borderColor: Colors.accent, backgroundColor: Colors.accentLight },
  moodEmoji: { fontSize: 22 },
  moodBtnLabel: { fontSize: 10, color: Colors.textSecondary, fontWeight: Typography.fontWeight.medium },

  reflectionInput: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[3],
    fontSize: Typography.fontSize.base,
    color: Colors.text,
    minHeight: 100,
    marginBottom: Spacing[4],
  },
  modalActions: { gap: Spacing[3] },
  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: Colors.white, fontWeight: Typography.fontWeight.semibold, fontSize: Typography.fontSize.base },
  cancelBtn: {
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelBtnText: { color: Colors.text, fontWeight: Typography.fontWeight.medium },
});
