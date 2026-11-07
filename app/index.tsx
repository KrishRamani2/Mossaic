import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadow } from '../src/constants/theme';
import { useApp } from '../src/context/AppContext';

const { width } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();
  const { settings, loadDemo } = useApp();

  useEffect(() => {
    if (settings.onboardingCompleted) {
      router.replace('/(tabs)');
    }
  }, [settings.onboardingCompleted]);

  const handleGetStarted = () => {
    router.push('/onboarding');
  };

  const handleExploreDemo = async () => {
    await loadDemo();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
        {/* Header Brand */}
        <View style={styles.brandRow}>
          <View style={styles.logoMark}>
            <Text style={styles.logoText}>MM</Text>
          </View>
          <Text style={styles.brandName}>Ritual</Text>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTagline}>Man Matters</Text>
          <Text style={styles.heroHeadline}>Your products.{'\n'}Your routine.{'\n'}Your journey.</Text>
          <Text style={styles.heroSub}>
            Everything you need to understand and manage your personal care routine, all in one place.
          </Text>
        </View>

        {/* Feature Preview Cards */}
        <View style={styles.features}>
          <FeatureCard
            emoji="📋"
            title="Digital Product Passport"
            desc="Every product you own, with verified usage instructions and complete information."
            accent
          />
          <FeatureCard
            emoji="☀️"
            title="Smart Daily Routine"
            desc="Build a personalized routine from your products and track it every day."
          />
          <FeatureCard
            emoji="🔄"
            title="Routine Rescue"
            desc="Missed a few days? No guilt. Just a gentle nudge to get back on track."
          />
          <FeatureCard
            emoji="📊"
            title="Progress Journal"
            desc="Track your consistency over time and reflect on your personal care journey."
          />
        </View>

        {/* Demo Notice */}
        <View style={styles.demoNotice}>
          <Text style={styles.demoNoticeText}>
            🎯 Demo mode available — no account required. All sample data is clearly labelled.
          </Text>
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity style={styles.primaryCta} onPress={handleGetStarted}>
            <Text style={styles.primaryCtaText}>Get Started</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryCta} onPress={handleExploreDemo}>
            <Text style={styles.secondaryCtaText}>Explore Demo</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          MM Ritual is a personal care companion. It does not provide medical advice.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureCard({
  emoji,
  title,
  desc,
  accent,
}: {
  emoji: string;
  title: string;
  desc: string;
  accent?: boolean;
}) {
  return (
    <View
      style={[
        styles.featureCard,
        accent && { backgroundColor: Colors.accentLight, borderColor: Colors.accent },
      ]}
    >
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing[5], paddingBottom: Spacing[10] },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing[6],
    marginBottom: Spacing[8],
    gap: Spacing[2],
  },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: Colors.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  brandName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    letterSpacing: -0.3,
  },

  hero: { marginBottom: Spacing[8] },
  heroTagline: {
    fontSize: Typography.fontSize.sm,
    color: Colors.accent,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing[2],
  },
  heroHeadline: {
    fontSize: 36,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    letterSpacing: -0.8,
    lineHeight: 42,
    marginBottom: Spacing[4],
  },
  heroSub: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    lineHeight: 26,
  },

  features: { gap: Spacing[3], marginBottom: Spacing[6] },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  featureEmoji: { fontSize: 28, marginTop: 2 },
  featureContent: { flex: 1 },
  featureTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  demoNotice: {
    backgroundColor: Colors.infoLight,
    borderRadius: Radius.md,
    padding: Spacing[3],
    marginBottom: Spacing[6],
  },
  demoNoticeText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.info,
    lineHeight: 20,
  },

  ctaContainer: { gap: Spacing[3], marginBottom: Spacing[6] },
  primaryCta: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    ...Shadow.md,
  },
  primaryCtaText: {
    color: Colors.white,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.3,
  },
  secondaryCta: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryCtaText: {
    color: Colors.text,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },

  footer: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing[4],
  },
});
