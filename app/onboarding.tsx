import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadow } from '../src/constants/theme';
import { useApp } from '../src/context/AppContext';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'haircare', label: 'Haircare', emoji: '💆', desc: 'Shampoos, serums, oils & more' },
  { id: 'skincare', label: 'Skincare', emoji: '🧴', desc: 'Cleansers, moisturisers, serums' },
  { id: 'beard', label: 'Beard Grooming', emoji: '🧔', desc: 'Oils, balms, wash & styling' },
  { id: 'supplements', label: 'Supplements', emoji: '💊', desc: 'Vitamins, minerals & wellness' },
  { id: 'grooming', label: 'General Grooming', emoji: '✂️', desc: 'Deodorant, face wash & more' },
];

const TIMES = [
  { id: 'morning', label: 'Morning Person', emoji: '☀️', desc: 'I prefer doing routines in the AM' },
  { id: 'evening', label: 'Evening Person', emoji: '🌙', desc: 'Evening is my wind-down time' },
  { id: 'both', label: 'Both', emoji: '⏰', desc: 'I like morning and evening routines' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { updateSettings } = useApp();
  const [step, setStep] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [preferredTime, setPreferredTime] = useState<string>('');

  const steps = [
    { key: 'welcome' },
    { key: 'categories' },
    { key: 'timing' },
    { key: 'ready' },
  ];

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      await updateSettings({
        onboardingCompleted: true,
        selectedCategories,
      });
      router.replace('/(tabs)');
    }
  };

  const handleSkip = async () => {
    await updateSettings({ onboardingCompleted: true });
    router.replace('/(tabs)');
  };

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoMark}>
            <Text style={styles.logoText}>MM</Text>
          </View>
          <Text style={styles.brandName}>Ritual</Text>
        </View>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Step 0: Welcome */}
        {step === 0 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepEmoji}>👋</Text>
            <Text style={styles.stepTitle}>Welcome to MM Ritual</Text>
            <Text style={styles.stepDesc}>
              Your personal grooming companion. Add your products, build a daily routine, and track your progress — all in one place.
            </Text>
            <View style={styles.welcomeFeatures}>
              {[
                ['📋', 'Digital Product Passport for every product you use'],
                ['☀️', 'Personalized morning and evening routines'],
                ['🔄', 'Routine Rescue — no guilt for missed days'],
                ['📊', 'Visual progress tracking over time'],
              ].map(([emoji, text]) => (
                <View key={text} style={styles.welcomeFeatureRow}>
                  <Text style={styles.welcomeFeatureEmoji}>{emoji}</Text>
                  <Text style={styles.welcomeFeatureText}>{text}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Step 1: Categories */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What are you focused on?</Text>
            <Text style={styles.stepDesc}>
              Select your personal care interests. This helps us show relevant products and information.
            </Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => toggleCategory(cat.id)}
                  style={[
                    styles.categoryCard,
                    selectedCategories.includes(cat.id) && styles.categoryCardSelected,
                  ]}
                  activeOpacity={0.85}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      selectedCategories.includes(cat.id) && { color: Colors.accent },
                    ]}
                  >
                    {cat.label}
                  </Text>
                  <Text style={styles.categoryDesc}>{cat.desc}</Text>
                  {selectedCategories.includes(cat.id) && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.hint}>Select one or more. You can change this later.</Text>
          </View>
        )}

        {/* Step 2: Timing */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>When do you prefer your routine?</Text>
            <Text style={styles.stepDesc}>
              We'll organize your routine schedule around your preference.
            </Text>
            <View style={styles.timeOptions}>
              {TIMES.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setPreferredTime(t.id)}
                  style={[
                    styles.timeCard,
                    preferredTime === t.id && styles.timeCardSelected,
                  ]}
                  activeOpacity={0.85}
                >
                  <Text style={styles.timeEmoji}>{t.emoji}</Text>
                  <View style={styles.timeContent}>
                    <Text
                      style={[
                        styles.timeLabel,
                        preferredTime === t.id && { color: Colors.accent },
                      ]}
                    >
                      {t.label}
                    </Text>
                    <Text style={styles.timeDesc}>{t.desc}</Text>
                  </View>
                  {preferredTime === t.id && (
                    <View style={styles.radioSelected}>
                      <View style={styles.radioDot} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 3: Ready */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepEmoji}>🎉</Text>
            <Text style={styles.stepTitle}>You're all set!</Text>
            <Text style={styles.stepDesc}>
              Your MM Ritual is ready. Start by exploring your product catalogue and building your first routine.
            </Text>
            <View style={styles.readyCard}>
              <Text style={styles.readyCardTitle}>What's next?</Text>
              {[
                '1. Browse the product catalogue',
                '2. Add products to your collection',
                '3. Build your daily routine',
                '4. Track your progress in My Journey',
              ].map((item) => (
                <Text key={item} style={styles.readyStep}>
                  {item}
                </Text>
              ))}
            </View>
            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                ℹ️ MM Ritual tracks your routine activity. It does not provide medical advice or guarantee cosmetic results.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.9}>
          <Text style={styles.nextBtnText}>
            {step === steps.length - 1 ? 'Start My Ritual' : 'Continue'}
          </Text>
        </TouchableOpacity>
        <View style={styles.dots}>
          {steps.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>
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
    paddingTop: Spacing[3],
    paddingBottom: Spacing[2],
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
  },
  brandName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  skipText: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary },

  progressTrack: {
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing[5],
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: 2,
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
  },

  scroll: { paddingHorizontal: Spacing[5], paddingTop: Spacing[6], paddingBottom: Spacing[4] },

  stepContainer: { gap: Spacing[4] },
  stepEmoji: { fontSize: 56, textAlign: 'center', marginBottom: Spacing[2] },
  stepTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    letterSpacing: -0.4,
  },
  stepDesc: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    lineHeight: 24,
  },

  welcomeFeatures: { gap: Spacing[3] },
  welcomeFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  welcomeFeatureEmoji: { fontSize: 22 },
  welcomeFeatureText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    flex: 1,
    lineHeight: 20,
  },

  categoryGrid: { gap: Spacing[3] },
  categoryCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    position: 'relative',
  },
  categoryCardSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentLight,
  },
  categoryEmoji: { fontSize: 28, marginBottom: Spacing[2] },
  categoryLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: 4,
  },
  categoryDesc: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary },
  checkmark: {
    position: 'absolute',
    top: Spacing[3],
    right: Spacing[3],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: { color: Colors.white, fontSize: 12, fontWeight: Typography.fontWeight.bold },
  hint: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing[2],
  },

  timeOptions: { gap: Spacing[3] },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    gap: Spacing[3],
  },
  timeCardSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentLight,
  },
  timeEmoji: { fontSize: 32 },
  timeContent: { flex: 1 },
  timeLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: 4,
  },
  timeDesc: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary },
  radioSelected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.accent },

  readyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[5],
    gap: Spacing[3],
  },
  readyCardTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing[2],
  },
  readyStep: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  disclaimer: {
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.md,
    padding: Spacing[3],
  },
  disclaimerText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.warning,
    lineHeight: 18,
  },

  footer: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[6],
    paddingTop: Spacing[3],
    gap: Spacing[4],
  },
  nextBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    ...Shadow.md,
  },
  nextBtnText: {
    color: Colors.white,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  dotActive: { width: 20, backgroundColor: Colors.accent },
});
