import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '../src/constants/theme';
import { useApp } from '../src/context/AppContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings, resetDemo, clearAll, usageLogs, userProducts, routineItems, reflections } = useApp();
  const [resetting, setResetting] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleResetDemo = () => {
    Alert.alert(
      'Reset Demo Data',
      'This will restore all demo products, routines, and usage history. Your custom notes will be cleared. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Demo',
          style: 'destructive',
          onPress: async () => {
            setResetting(true);
            await resetDemo();
            setResetting(false);
            Alert.alert('Done', 'Demo data has been restored.');
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your products, routines, logs, and reflections. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: async () => {
            setClearing(true);
            await clearAll();
            setClearing(false);
            Alert.alert('Cleared', 'All data has been removed.');
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile / App Info */}
        <View style={styles.appCard}>
          <View style={styles.appLogoContainer}>
            <Text style={styles.appLogo}>MM</Text>
          </View>
          <View>
            <Text style={styles.appName}>MM Ritual</Text>
            <Text style={styles.appTagline}>Your products. Your routine. Your journey.</Text>
            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>🛠️ Demo Mode</Text>
            </View>
          </View>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsCard}>
          <StatItem label="Products" value={userProducts.filter(p => p.status !== 'removed').length} />
          <View style={styles.statDivider} />
          <StatItem label="Activities" value={routineItems.filter(r => r.isActive).length} />
          <View style={styles.statDivider} />
          <StatItem label="Logs" value={usageLogs.length} />
          <View style={styles.statDivider} />
          <StatItem label="Notes" value={reflections.length} />
        </View>

        {/* Notifications */}
        <SectionLabel label="Notifications" />
        <View style={styles.settingGroup}>
          <SettingRow
            label="Morning reminder"
            desc="Remind me about my morning routine"
            value={settings.notifications?.morningEnabled ?? true}
            onToggle={(v) => updateSettings({ notifications: { morningEnabled: v, eveningEnabled: settings.notifications?.eveningEnabled ?? true, rescueEnabled: settings.notifications?.rescueEnabled ?? true } })}
          />
          <SettingRow
            label="Evening reminder"
            desc="Remind me about my evening routine"
            value={settings.notifications?.eveningEnabled ?? true}
            onToggle={(v) => updateSettings({ notifications: { morningEnabled: settings.notifications?.morningEnabled ?? true, eveningEnabled: v, rescueEnabled: settings.notifications?.rescueEnabled ?? true } })}
          />
          <SettingRow
            label="Routine Rescue alerts"
            desc="Alert me when I've missed activities"
            value={settings.notifications?.rescueEnabled ?? true}
            onToggle={(v) => updateSettings({ notifications: { morningEnabled: settings.notifications?.morningEnabled ?? true, eveningEnabled: settings.notifications?.eveningEnabled ?? true, rescueEnabled: v } })}
          />
        </View>

        {/* Preferences */}
        <SectionLabel label="Preferences" />
        <View style={styles.settingGroup}>
          <SettingRow
            label="Usage reminders"
            desc="Show weekly usage tips in the app"
            value={settings.showTips ?? true}
            onToggle={(v) => updateSettings({ showTips: v })}
          />
          <SettingRow
            label="Streak tracking"
            desc="Show consistency streaks and momentum"
            value={settings.showStreak ?? true}
            onToggle={(v) => updateSettings({ showStreak: v })}
          />
        </View>

        {/* Demo & Data */}
        <SectionLabel label="Demo & Data" />
        <View style={styles.settingGroup}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleResetDemo}
            disabled={resetting}
          >
            <View style={styles.actionRowLeft}>
              <Text style={styles.actionRowEmoji}>🔄</Text>
              <View>
                <Text style={styles.actionRowLabel}>Reset Demo Data</Text>
                <Text style={styles.actionRowDesc}>Restore default demo products and routines</Text>
              </View>
            </View>
            <Text style={styles.actionRowArrow}>{resetting ? '...' : '›'}</Text>
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleClearAll}
            disabled={clearing}
          >
            <View style={styles.actionRowLeft}>
              <Text style={styles.actionRowEmoji}>🗑️</Text>
              <View>
                <Text style={[styles.actionRowLabel, { color: Colors.error }]}>Clear All Data</Text>
                <Text style={styles.actionRowDesc}>Permanently delete everything and start fresh</Text>
              </View>
            </View>
            <Text style={styles.actionRowArrow}>{clearing ? '...' : '›'}</Text>
          </TouchableOpacity>
        </View>

        {/* Important Disclaimers */}
        <SectionLabel label="About This App" />
        <View style={styles.disclaimerSection}>
          <DisclaimerBlock
            emoji="🛠️"
            title="Demo Mode"
            text="MM Ritual is currently running in demo mode. All products, routines, and usage data are sample content for demonstration purposes only."
          />
          <DisclaimerBlock
            emoji="⚕️"
            title="Not Medical Advice"
            text="MM Ritual is a personal care companion app. It does not provide medical advice, diagnose conditions, or guarantee any health outcomes. Always consult a qualified healthcare professional for medical concerns."
          />
          <DisclaimerBlock
            emoji="📋"
            title="Product Instructions"
            text="Usage instructions shown in the app are sample content only. Always follow the official instructions on your physical product label."
          />
          <DisclaimerBlock
            emoji="📊"
            title="Progress Tracking"
            text="Charts and consistency scores track your routine activity only. They do not indicate medical or treatment outcomes."
          />
        </View>

        {/* Legal */}
        <View style={styles.legalRow}>
          <Text style={styles.legalText}>Man Matters · MM Ritual · v1.0.0</Text>
          <Text style={styles.legalText}>© 2024 Man Matters. Demo build.</Text>
          <Text style={styles.legalText}>For support, visit manmatters.com</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <Text style={styles.sectionLabel}>{label}</Text>
  );
}

function SettingRow({
  label,
  desc,
  value,
  onToggle,
}: {
  label: string;
  desc: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingRowLeft}>
        <Text style={styles.settingRowLabel}>{label}</Text>
        <Text style={styles.settingRowDesc}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.border, true: Colors.accentMuted }}
        thumbColor={value ? Colors.accent : Colors.textMuted}
      />
    </View>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function DisclaimerBlock({
  emoji,
  title,
  text,
}: {
  emoji: string;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.disclaimerBlock}>
      <View style={styles.disclaimerHeader}>
        <Text style={styles.disclaimerEmoji}>{emoji}</Text>
        <Text style={styles.disclaimerTitle}>{title}</Text>
      </View>
      <Text style={styles.disclaimerText}>{text}</Text>
    </View>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { fontSize: Typography.fontSize.base, color: Colors.accent },
  headerTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semibold, color: Colors.text },

  scroll: { paddingBottom: Spacing[16] },

  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
    padding: Spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  appLogoContainer: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appLogo: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold, color: Colors.white, letterSpacing: 1 },
  appName: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold, color: Colors.text },
  appTagline: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  demoBadge: {
    backgroundColor: Colors.infoLight,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  demoBadgeText: { fontSize: Typography.fontSize.xs, color: Colors.info, fontWeight: Typography.fontWeight.semibold },

  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    padding: Spacing[4],
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: Typography.fontSize['2xl'], fontWeight: Typography.fontWeight.bold, color: Colors.accent },
  statLabel: { fontSize: Typography.fontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.border },

  sectionLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[2],
  },

  settingGroup: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  settingRowLeft: { flex: 1, paddingRight: Spacing[4] },
  settingRowLabel: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.medium, color: Colors.text },
  settingRowDesc: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, marginTop: 2 },

  settingDivider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: Spacing[5] },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
  },
  actionRowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], flex: 1 },
  actionRowEmoji: { fontSize: 24 },
  actionRowLabel: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.medium, color: Colors.text },
  actionRowDesc: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  actionRowArrow: { fontSize: 22, color: Colors.textMuted },

  disclaimerSection: {
    marginHorizontal: Spacing[5],
    gap: Spacing[3],
    marginBottom: Spacing[5],
  },
  disclaimerBlock: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
  },
  disclaimerHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: Spacing[2] },
  disclaimerEmoji: { fontSize: 18 },
  disclaimerTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semibold, color: Colors.text },
  disclaimerText: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, lineHeight: 20 },

  legalRow: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[8],
    gap: 4,
    alignItems: 'center',
  },
  legalText: { fontSize: Typography.fontSize.xs, color: Colors.textMuted, textAlign: 'center' },
});
