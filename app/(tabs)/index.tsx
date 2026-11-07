import React, { useMemo } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Radius, Shadow, Spacing, Typography } from '../../src/constants/theme';
import { useApp } from '../../src/context/AppContext';
import { DEMO_PRODUCTS } from '../../src/data/demo-products';
import {
  computeDayStats,
  computeOverallConsistency,
  computeWeekStats,
  generateId,
  getTodayItems,
  hasRecentSkips,
  todayString,
} from '../../src/lib/analytics/analytics';
import { TimeOfDay } from '../../src/types/routine';
import { UserProduct } from '../../src/types/product';

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 800;
  const {
    routineItems,
    usageLogs,
    userProducts,
    logActivity,
    addProduct,
    settings,
    updateSettings,
  } = useApp();

  const today = todayString();
  const todayItems = useMemo(() => getTodayItems(routineItems, usageLogs), [routineItems, usageLogs]);
  const todayStats = useMemo(
    () => computeDayStats(today, routineItems, usageLogs),
    [today, routineItems, usageLogs]
  );
  const weekStats = useMemo(() => computeWeekStats(routineItems, usageLogs), [routineItems, usageLogs]);
  const weeklyConsistency = useMemo(
    () => computeOverallConsistency(routineItems, usageLogs, 7),
    [routineItems, usageLogs]
  );
  const weeklyCompleted = weekStats.reduce((total, day) => total + day.completed, 0);
  const showRoutineRescue = useMemo(() => hasRecentSkips(usageLogs, 3), [usageLogs]);
  const collection = useMemo(
    () => DEMO_PRODUCTS.filter((product) => userProducts.some(
      (userProduct) => userProduct.productId === product.id && userProduct.status !== 'removed'
    )).concat(
      DEMO_PRODUCTS.filter((product) => !userProducts.some(
        (userProduct) => userProduct.productId === product.id && userProduct.status !== 'removed'
      ))
    ).slice(0, 6),
    [userProducts]
  );

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

  const handleSkip = async (itemId: string, productId: string) => {
    await logActivity({
      id: generateId('log'),
      routineItemId: itemId,
      productId,
      date: today,
      status: 'skipped',
      skippedReason: 'forgot',
    });
  };

  const handleAddProduct = async (productId: string) => {
    const userProduct: UserProduct = {
      id: generateId('up'),
      productId,
      addedAt: new Date().toISOString(),
      status: 'active',
    };
    await addProduct(userProduct);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={[styles.scroll, isDesktop && styles.scrollDesktop]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, isDesktop && styles.contentDesktop]}>
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View style={styles.logoMark}><Text style={styles.logoText}>MM</Text></View>
              <Text style={styles.brandName}>Ritual</Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable
                accessibilityLabel="Toggle theme"
                style={styles.themeToggle}
                onPress={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
              >
                <Text style={styles.themeIcon}>☼</Text>
                <View style={[styles.toggleKnob, settings.theme === 'dark' && styles.toggleKnobDark]} />
              </Pressable>
              <TouchableOpacity
                accessibilityLabel="Open settings"
                style={styles.iconButton}
                onPress={() => router.push('/settings')}
              >
                <Text style={styles.settingsIcon}>⚙</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ImageBackground
            source={require('../../assets/Dashbaord.png')}
            style={styles.hero}
            imageStyle={styles.heroBackground}
            resizeMode="cover"
          >
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>Welcome to your ritual.</Text>
              <Text style={styles.heroSubtitle}>Small steps. Big difference.</Text>
            </View>
          </ImageBackground>

          <View style={[styles.progressCard, isDesktop && styles.progressCardDesktop]}>
            <ProgressMetric icon="✓" value={todayStats.completed} label="Completed Today" />
            <View style={styles.metricDivider} />
            <ProgressMetric icon="▦" value={weeklyCompleted} label="Total This Week" />
            <View style={styles.metricDivider} />
            <View style={styles.metric}>
              <ProgressRing value={weeklyConsistency} />
              <Text style={styles.metricLabel}>Weekly Goal</Text>
            </View>
          </View>

          {showRoutineRescue && (
            <View style={styles.rescueCard}>
              <View style={styles.rescueIcon}><Text style={styles.rescueIconText}>↻</Text></View>
              <View style={styles.rescueCopy}>
                <Text style={styles.rescueTitle}>Missed a few days?</Text>
                <Text style={styles.rescueDesc}>That&apos;s okay. Let&apos;s get back to your routine.</Text>
              </View>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push('/routine/rescue')}
              >
                <Text style={styles.primaryButtonText}>Resume My Routine</Text>
                <Text style={styles.primaryButtonArrow}>→</Text>
              </TouchableOpacity>
            </View>
          )}

          <SectionHeading title="Today&apos;s Routine" action="View All" onPress={() => router.push('/(tabs)/routine')} />
          {todayItems.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No routine scheduled for today.</Text>
              <TouchableOpacity style={styles.outlineButton} onPress={() => router.push('/routine/builder')}>
                <Text style={styles.outlineButtonText}>Build My Routine</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.routineList}>
              {todayItems.slice(0, 4).map(({ item, logStatus }) => {
                const product = DEMO_PRODUCTS.find((candidate) => candidate.id === item.productId);
                if (!product) return null;
                return (
                  <RoutineCard
                    key={item.id}
                    productName={product.name}
                    productImage={product.image}
                    time={item.preferredTime}
                    status={logStatus}
                    onComplete={() => handleComplete(item.id, item.productId)}
                    onSkip={() => handleSkip(item.id, item.productId)}
                    onViewInstructions={() => router.push(`/product/${product.id}`)}
                  />
                );
              })}
            </View>
          )}

          <SectionHeading title="My Products" action="View All" onPress={() => router.push('/(tabs)/products')} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsRow}
          >
            {collection.map((product) => {
              const isAdded = userProducts.some(
                (userProduct) => userProduct.productId === product.id && userProduct.status !== 'removed'
              );
              return (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productCard}
                  onPress={() => router.push(`/product/${product.id}`)}
                  activeOpacity={0.88}
                >
                  <View style={styles.productImageWrap}>
                    <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="cover" />
                    <Text style={styles.moreIcon}>•••</Text>
                  </View>
                  <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                  {isAdded ? (
                    <View style={styles.addedPill}><Text style={styles.addedText}>Added</Text></View>
                  ) : (
                    <TouchableOpacity style={styles.addPill} onPress={() => handleAddProduct(product.id)}>
                      <Text style={styles.addText}>Add +</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <SectionHeading title="Quick Actions" />
          <View style={styles.quickActions}>
            <QuickAction icon="+" label="Add Product" onPress={() => router.push('/(tabs)/products')} />
            <QuickAction icon="▦" label="View My Routine" onPress={() => router.push('/(tabs)/routine')} />
            <QuickAction icon="▥" label="Track Progress" onPress={() => router.push('/(tabs)/journey')} />
            <QuickAction icon="▢" label="Product Guide" onPress={() => router.push('/(tabs)/guide')} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProgressMetric({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <View style={styles.metric}>
      <View style={styles.metricIcon}><Text style={styles.metricIconText}>{icon}</Text></View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function ProgressRing({ value }: { value: number }) {
  return (
    <View style={styles.ring}>
      <View style={styles.ringInner}><Text style={styles.ringValue}>{value}%</Text></View>
    </View>
  );
}

function SectionHeading({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && onPress && (
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.sectionAction}>{action}  →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function RoutineCard({
  productName,
  productImage,
  time,
  status,
  onComplete,
  onSkip,
  onViewInstructions,
}: {
  productName: string;
  productImage: string;
  time: TimeOfDay;
  status: 'completed' | 'skipped' | 'pending';
  onComplete: () => void;
  onSkip: () => void;
  onViewInstructions: () => void;
}) {
  const timeLabel = time.charAt(0).toUpperCase() + time.slice(1);
  return (
    <View style={styles.routineCard}>
      <Image source={{ uri: productImage }} style={styles.routineImage} resizeMode="cover" />
      <View style={styles.routineContent}>
        <Text style={styles.routineName} numberOfLines={1}>{productName}</Text>
        <Text style={styles.routineMeta}>{time === 'evening' ? '☾' : '☀'}  {timeLabel} · 1 task</Text>
        {status === 'pending' ? (
          <View style={styles.routineActions}>
            <TouchableOpacity style={styles.doneButton} onPress={onComplete}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onViewInstructions}>
              <Text style={styles.howToText}>How to use</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.statusPill, status === 'completed' ? styles.completedPill : styles.skippedPill]}>
            <Text style={[styles.statusText, status === 'completed' ? styles.completedText : styles.skippedText]}>
              {status === 'completed' ? '✓ Completed' : '→ Skipped'}
            </Text>
          </View>
        )}
      </View>
      <TouchableOpacity style={styles.routineChevron} onPress={onViewInstructions}>
        <Text style={styles.chevronText}>{status === 'completed' ? '✓' : '›'}</Text>
      </TouchableOpacity>
    </View>
  );
}

function QuickAction({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.82}>
      <Text style={styles.quickActionIcon}>{icon}</Text>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: Spacing[2] },
  scrollDesktop: { alignItems: 'center' },
  content: { width: '100%', maxWidth: 980, paddingHorizontal: Spacing[5] },
  contentDesktop: { paddingHorizontal: Spacing[8] },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing[4],
    paddingBottom: Spacing[3],
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: Colors.white, fontSize: 13, fontWeight: Typography.fontWeight.bold },
  brandName: { color: Colors.text, fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.semibold },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  themeToggle: {
    width: 64,
    height: 34,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#B9CDC1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  themeIcon: { fontSize: 19, color: Colors.accent },
  toggleKnob: { width: 18, height: 18, borderRadius: Radius.full, backgroundColor: '#D6E4DC' },
  toggleKnobDark: { backgroundColor: Colors.accent },
  iconButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  settingsIcon: { color: Colors.accent, fontSize: 26 },
  hero: { minHeight: 208, justifyContent: 'center', overflow: 'hidden', borderRadius: Radius.xl, marginBottom: Spacing[4] },
  heroBackground: { borderRadius: Radius.xl },
  heroCopy: { zIndex: 2, paddingLeft: Spacing[1], maxWidth: '57%' },
  heroTitle: { color: Colors.text, fontSize: 25, lineHeight: 30, fontWeight: Typography.fontWeight.bold, letterSpacing: -0.6 },
  heroSubtitle: { color: Colors.textSecondary, fontSize: Typography.fontSize.base, marginTop: 7 },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing[3],
    marginBottom: Spacing[5],
    ...Shadow.sm,
  },
  progressCardDesktop: { paddingVertical: Spacing[4] },
  metric: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 84 },
  metricDivider: { width: 1, height: 64, backgroundColor: Colors.border },
  metricIcon: { width: 28, height: 28, borderRadius: Radius.full, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  metricIconText: { color: Colors.white, fontSize: 18, fontWeight: Typography.fontWeight.bold },
  metricValue: { color: Colors.text, fontSize: Typography.fontSize['2xl'], fontWeight: Typography.fontWeight.bold },
  metricLabel: { color: Colors.textSecondary, fontSize: Typography.fontSize.xs, marginTop: 2 },
  ring: { width: 70, height: 70, borderRadius: Radius.full, borderWidth: 7, borderColor: '#D9E7DE', borderTopColor: Colors.accent, borderRightColor: Colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 2, transform: [{ rotate: '25deg' }] },
  ringInner: { transform: [{ rotate: '-25deg' }] },
  ringValue: { color: Colors.text, fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold },
  rescueCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], backgroundColor: Colors.accentLight, borderRadius: Radius.xl, padding: Spacing[4], marginBottom: Spacing[6] },
  rescueIcon: { width: 52, height: 52, borderRadius: Radius.full, backgroundColor: '#D6E8DC', alignItems: 'center', justifyContent: 'center' },
  rescueIconText: { color: Colors.accent, fontSize: 33 },
  rescueCopy: { flex: 1 },
  rescueTitle: { color: Colors.text, fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold, marginBottom: 2 },
  rescueDesc: { color: Colors.text, fontSize: Typography.fontSize.sm },
  primaryButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.accent, borderRadius: Radius.full, paddingHorizontal: 18, paddingVertical: 13 },
  primaryButtonText: { color: Colors.white, fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semibold },
  primaryButtonArrow: { color: Colors.white, fontSize: 18 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[3] },
  sectionTitle: { color: Colors.text, fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold, letterSpacing: -0.3 },
  sectionAction: { color: Colors.accent, fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semibold },
  routineList: { gap: Spacing[2], marginBottom: Spacing[6] },
  routineCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, padding: Spacing[2], gap: Spacing[3], minHeight: 88 },
  routineImage: { width: 116, height: 68, borderRadius: Radius.lg, backgroundColor: Colors.surfaceAlt },
  routineContent: { flex: 1, minWidth: 0 },
  routineName: { color: Colors.text, fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semibold },
  routineMeta: { color: Colors.textSecondary, fontSize: Typography.fontSize.sm, marginTop: 5, marginBottom: 7 },
  routineActions: { flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' },
  doneButton: { backgroundColor: Colors.accent, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 6 },
  doneButtonText: { color: Colors.white, fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.semibold },
  skipButton: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.full, paddingHorizontal: 11, paddingVertical: 5 },
  skipButtonText: { color: Colors.textSecondary, fontSize: Typography.fontSize.xs },
  howToText: { color: Colors.accent, fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.semibold },
  routineChevron: { width: 28, alignItems: 'center' },
  chevronText: { color: Colors.accent, fontSize: 26 },
  statusPill: { alignSelf: 'flex-start', borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 5 },
  completedPill: { backgroundColor: Colors.accentLight },
  skippedPill: { backgroundColor: Colors.warningLight },
  statusText: { fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.semibold },
  completedText: { color: Colors.accent },
  skippedText: { color: Colors.warning },
  emptyCard: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.xl, padding: Spacing[6], alignItems: 'center', marginBottom: Spacing[6] },
  emptyTitle: { color: Colors.textSecondary, marginBottom: Spacing[3] },
  outlineButton: { borderWidth: 1, borderColor: Colors.accent, borderRadius: Radius.full, paddingHorizontal: 18, paddingVertical: 10 },
  outlineButtonText: { color: Colors.accent, fontWeight: Typography.fontWeight.semibold },
  productsRow: { gap: Spacing[2], paddingBottom: Spacing[2], marginBottom: Spacing[5] },
  productCard: { width: 148, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.xl, padding: Spacing[2], alignItems: 'center' },
  productImageWrap: { width: '100%', height: 106, borderRadius: Radius.lg, overflow: 'hidden', backgroundColor: Colors.surfaceAlt, position: 'relative' },
  productImage: { width: '100%', height: '100%' },
  moreIcon: { position: 'absolute', right: 7, top: 2, color: Colors.textSecondary, fontWeight: Typography.fontWeight.bold, letterSpacing: 1 },
  productName: { width: '100%', color: Colors.text, fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semibold, textAlign: 'center', marginTop: 7, minHeight: 34 },
  addedPill: { backgroundColor: Colors.accentLight, borderRadius: Radius.full, paddingHorizontal: 13, paddingVertical: 5, marginTop: 5 },
  addedText: { color: Colors.accent, fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.semibold },
  addPill: { borderWidth: 1, borderColor: '#B9CDC1', borderRadius: Radius.full, paddingHorizontal: 13, paddingVertical: 4, marginTop: 5 },
  addText: { color: Colors.accent, fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.semibold },
  quickActions: { flexDirection: 'row', gap: Spacing[2], marginBottom: 0 },
  quickAction: { flex: 1, minHeight: 76, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentLight, borderRadius: Radius.lg, padding: Spacing[2] },
  quickActionIcon: { color: Colors.accent, fontSize: 28, lineHeight: 30, fontWeight: Typography.fontWeight.medium },
  quickActionLabel: { color: Colors.accentDark, fontSize: Typography.fontSize.xs, textAlign: 'center', marginTop: 5 },
});
