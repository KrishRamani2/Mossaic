import React, { useState, useMemo } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme';
import { useApp } from '../../src/context/AppContext';
import { DEMO_PRODUCTS } from '../../src/data/demo-products';
import { generateId } from '../../src/lib/analytics/analytics';
import { DayOfWeek, TimeOfDay } from '../../src/types/routine';

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

const TIMES: { key: TimeOfDay; label: string; emoji: string }[] = [
  { key: 'morning', label: 'Morning', emoji: '☀️' },
  { key: 'afternoon', label: 'Afternoon', emoji: '🌤️' },
  { key: 'evening', label: 'Evening', emoji: '🌙' },
  { key: 'anytime', label: 'Anytime', emoji: '⏰' },
];

export default function RoutineBuilderScreen() {
  const router = useRouter();
  const { productId: initialProductId } = useLocalSearchParams<{ productId?: string }>();
  const { userProducts, routines, upsertRoutine, upsertRoutineItem } = useApp();

  const [step, setStep] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(initialProductId ?? null);
  const [selectedTime, setSelectedTime] = useState<TimeOfDay>('morning');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(['mon', 'tue', 'wed', 'thu', 'fri']);
  const [saving, setSaving] = useState(false);

  const myProductDetails = useMemo(() =>
    userProducts
      .filter((up) => up.status !== 'removed')
      .map((up) => DEMO_PRODUCTS.find((p) => p.id === up.productId))
      .filter(Boolean),
    [userProducts]
  );

  const selectedProduct = DEMO_PRODUCTS.find((p) => p.id === selectedProductId);

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    if (!selectedProductId || selectedDays.length === 0) return;
    setSaving(true);

    // Determine which routine to add to (or create one)
    let targetRoutine = routines.find((r) => r.isActive);
    if (!targetRoutine) {
      targetRoutine = {
        id: generateId('routine'),
        name: `${selectedTime === 'morning' ? 'Morning' : 'Evening'} Routine`,
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      await upsertRoutine(targetRoutine);
    }

    await upsertRoutineItem({
      id: generateId('item'),
      routineId: targetRoutine.id,
      productId: selectedProductId,
      preferredTime: selectedTime,
      eligibleDays: selectedDays,
      isActive: true,
      order: 99,
    });

    setSaving(false);
    Alert.alert('Saved! 🎉', 'Activity added to your routine.', [
      { text: 'Done', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (step === 0 ? router.back() : setStep(step - 1))}>
          <Text style={styles.backBtn}>{step === 0 ? '✕ Close' : '← Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Routine Builder</Text>
        <View style={{ width: 70 }} />
      </View>

      {/* Step Indicators */}
      <View style={styles.stepIndicator}>
        {['Product', 'Schedule', 'Review'].map((s, i) => (
          <View key={s} style={styles.stepItem}>
            <View style={[styles.stepDot, i <= step && styles.stepDotActive]}>
              <Text style={[styles.stepNum, i <= step && styles.stepNumActive]}>{i + 1}</Text>
            </View>
            <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{s}</Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Step 0: Select Product */}
        {step === 0 && (
          <View>
            <Text style={styles.stepTitle}>Select a product</Text>
            <Text style={styles.stepDesc}>Choose from your collection to add to your routine.</Text>
            {myProductDetails.length === 0 ? (
              <View style={styles.emptyCollection}>
                <Text style={styles.emptyEmoji}>📦</Text>
                <Text style={styles.emptyTitle}>No products in your collection yet.</Text>
                <TouchableOpacity
                  style={styles.addProductBtn}
                  onPress={() => { router.back(); }}
                >
                  <Text style={styles.addProductBtnText}>Go to My Products</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.productList}>
                {myProductDetails.map((product) =>
                  product ? (
                    <TouchableOpacity
                      key={product.id}
                      style={[
                        styles.productItem,
                        selectedProductId === product.id && styles.productItemSelected,
                      ]}
                      onPress={() => setSelectedProductId(product.id)}
                      activeOpacity={0.85}
                    >
                      <Image source={{ uri: product.image }} style={styles.productItemImage} />
                      <View style={styles.productItemContent}>
                        <Text style={styles.productItemName} numberOfLines={2}>{product.name}</Text>
                        <Text style={styles.productItemFreq}>{product.frequency}</Text>
                      </View>
                      {selectedProductId === product.id && (
                        <View style={styles.checkCircle}>
                          <Text style={styles.checkText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ) : null
                )}
              </View>
            )}
          </View>
        )}

        {/* Step 1: Schedule */}
        {step === 1 && selectedProduct && (
          <View>
            <Text style={styles.stepTitle}>Set your schedule</Text>
            <Text style={styles.stepDesc}>
              Choose your preferred time and days. Stay within the product's recommended frequency.
            </Text>

            {/* Product frequency reminder */}
            <View style={styles.freqReminder}>
              <Text style={styles.freqReminderLabel}>📅 Recommended frequency</Text>
              <Text style={styles.freqReminderValue}>{selectedProduct.frequency}</Text>
            </View>

            <Text style={styles.subHeading}>Preferred time of day</Text>
            <View style={styles.timeGrid}>
              {TIMES.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.timeBtn, selectedTime === t.key && styles.timeBtnSelected]}
                  onPress={() => setSelectedTime(t.key)}
                >
                  <Text style={styles.timeEmoji}>{t.emoji}</Text>
                  <Text style={[styles.timeLabel, selectedTime === t.key && { color: Colors.accent }]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.subHeading}>Eligible days</Text>
            <View style={styles.daysRow}>
              {DAYS.map((d) => (
                <TouchableOpacity
                  key={d.key}
                  style={[styles.dayBtn, selectedDays.includes(d.key) && styles.dayBtnSelected]}
                  onPress={() => toggleDay(d.key)}
                >
                  <Text style={[styles.dayLabel, selectedDays.includes(d.key) && styles.dayLabelSelected]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.scheduleNote}>
              <Text style={styles.scheduleNoteText}>
                ⚠️ You are setting a personal schedule reminder. This does not change the official usage instructions for your product.
              </Text>
            </View>
          </View>
        )}

        {/* Step 2: Review */}
        {step === 2 && selectedProduct && (
          <View>
            <Text style={styles.stepTitle}>Review your routine</Text>
            <Text style={styles.stepDesc}>Confirm your routine activity before saving.</Text>

            <View style={styles.reviewCard}>
              <Image source={{ uri: selectedProduct.image }} style={styles.reviewImage} />
              <View style={styles.reviewContent}>
                <Text style={styles.reviewProductName}>{selectedProduct.name}</Text>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewRowLabel}>Time:</Text>
                  <Text style={styles.reviewRowValue}>
                    {TIMES.find((t) => t.key === selectedTime)?.emoji} {selectedTime}
                  </Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewRowLabel}>Days:</Text>
                  <Text style={styles.reviewRowValue}>
                    {selectedDays.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}
                  </Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewRowLabel}>Frequency:</Text>
                  <Text style={styles.reviewRowValue}>{selectedProduct.frequency}</Text>
                </View>
              </View>
            </View>

            <View style={styles.reviewInstructions}>
              <Text style={styles.reviewInstructionsLabel}>Usage Instructions</Text>
              <Text style={styles.reviewInstructionsText}>{selectedProduct.usageInstructions}</Text>
            </View>

            <View style={styles.confirmNote}>
              <Text style={styles.confirmNoteText}>
                📋 By saving, you're adding a reminder for this activity. Product instructions remain unchanged.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        {step < 2 ? (
          <TouchableOpacity
            style={[
              styles.nextBtn,
              (step === 0 && !selectedProductId) && styles.nextBtnDisabled,
              (step === 1 && selectedDays.length === 0) && styles.nextBtnDisabled,
            ]}
            disabled={(step === 0 && !selectedProductId) || (step === 1 && selectedDays.length === 0)}
            onPress={() => setStep(step + 1)}
          >
            <Text style={styles.nextBtnText}>Continue</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, saving && styles.nextBtnDisabled]}
            disabled={saving}
            onPress={handleSave}
          >
            <Text style={styles.nextBtnText}>{saving ? 'Saving...' : 'Save to My Routine'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
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

  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing[8],
    paddingBottom: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing[4],
  },
  stepItem: { alignItems: 'center', gap: 4 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: Colors.accent },
  stepNum: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.bold, color: Colors.textSecondary },
  stepNumActive: { color: Colors.white },
  stepLabel: { fontSize: Typography.fontSize.xs, color: Colors.textSecondary },
  stepLabelActive: { color: Colors.accent, fontWeight: Typography.fontWeight.semibold },

  scroll: { paddingHorizontal: Spacing[5], paddingBottom: Spacing[6] },

  stepTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing[2],
  },
  stepDesc: { fontSize: Typography.fontSize.base, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing[5] },

  emptyCollection: { alignItems: 'center', paddingVertical: Spacing[12] },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing[3] },
  emptyTitle: { fontSize: Typography.fontSize.lg, color: Colors.textSecondary, marginBottom: Spacing[5] },
  addProductBtn: { backgroundColor: Colors.accent, borderRadius: Radius.md, paddingHorizontal: 24, paddingVertical: 12 },
  addProductBtnText: { color: Colors.white, fontWeight: Typography.fontWeight.semibold },

  productList: { gap: Spacing[3] },
  productItem: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[3],
    gap: Spacing[3],
    alignItems: 'center',
  },
  productItemSelected: { borderColor: Colors.accent, backgroundColor: Colors.accentLight },
  productItemImage: { width: 60, height: 60, borderRadius: Radius.md, backgroundColor: Colors.border },
  productItemContent: { flex: 1 },
  productItemName: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semibold, color: Colors.text },
  productItemFreq: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { color: Colors.white, fontSize: 14, fontWeight: Typography.fontWeight.bold },

  freqReminder: {
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.md,
    padding: Spacing[3],
    marginBottom: Spacing[5],
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  freqReminderLabel: { fontSize: Typography.fontSize.xs, color: Colors.accentMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  freqReminderValue: { fontSize: Typography.fontSize.base, color: Colors.accent, fontWeight: Typography.fontWeight.semibold },

  subHeading: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semibold, color: Colors.text, marginBottom: Spacing[3] },

  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2], marginBottom: Spacing[5] },
  timeBtn: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[3],
    alignItems: 'center',
    gap: 4,
  },
  timeBtnSelected: { borderColor: Colors.accent, backgroundColor: Colors.accentLight },
  timeEmoji: { fontSize: 24 },
  timeLabel: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, fontWeight: Typography.fontWeight.medium },

  daysRow: { flexDirection: 'row', gap: 6, marginBottom: Spacing[4], flexWrap: 'wrap' },
  dayBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayBtnSelected: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  dayLabel: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, fontWeight: Typography.fontWeight.medium },
  dayLabelSelected: { color: Colors.white, fontWeight: Typography.fontWeight.bold },

  scheduleNote: {
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.md,
    padding: Spacing[3],
  },
  scheduleNoteText: { fontSize: Typography.fontSize.xs, color: Colors.warning, lineHeight: 18 },

  reviewCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    gap: Spacing[3],
    marginBottom: Spacing[4],
  },
  reviewImage: { width: 80, height: 80, borderRadius: Radius.md, backgroundColor: Colors.border },
  reviewContent: { flex: 1, gap: 6 },
  reviewProductName: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold, color: Colors.text, marginBottom: 4 },
  reviewRow: { flexDirection: 'row', gap: 8 },
  reviewRowLabel: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, width: 70 },
  reviewRowValue: { fontSize: Typography.fontSize.sm, color: Colors.text, fontWeight: Typography.fontWeight.medium, flex: 1 },

  reviewInstructions: {
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.md,
    padding: Spacing[4],
    marginBottom: Spacing[4],
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  reviewInstructionsLabel: { fontSize: Typography.fontSize.xs, color: Colors.accentMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  reviewInstructionsText: { fontSize: Typography.fontSize.sm, color: Colors.text, lineHeight: 20 },

  confirmNote: {
    backgroundColor: Colors.infoLight,
    borderRadius: Radius.md,
    padding: Spacing[3],
  },
  confirmNoteText: { fontSize: Typography.fontSize.xs, color: Colors.info, lineHeight: 18 },

  footer: { paddingHorizontal: Spacing[5], paddingBottom: Spacing[8], paddingTop: Spacing[3] },
  nextBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: Colors.white, fontWeight: Typography.fontWeight.bold, fontSize: Typography.fontSize.base },
});
