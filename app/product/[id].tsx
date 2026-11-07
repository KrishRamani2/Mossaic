import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow, CategoryMeta } from '../../src/constants/theme';
import { DEMO_PRODUCTS } from '../../src/data/demo-products';
import { useApp } from '../../src/context/AppContext';
import { generateId } from '../../src/lib/analytics/analytics';
import { UserProduct } from '../../src/types/product';

export default function ProductPassportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { userProducts, addProduct, removeProduct, routineItems } = useApp();

  const product = DEMO_PRODUCTS.find((p) => p.id === id);
  if (!product) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Product not found.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const userProduct = userProducts.find((up) => up.productId === product.id && up.status !== 'removed');
  const inRoutine = routineItems.some((ri) => ri.productId === product.id && ri.isActive);
  const catMeta = CategoryMeta[product.category] ?? { label: product.category, emoji: '📦', color: Colors.accent };

  const handleAddToCollection = async () => {
    if (userProduct) {
      Alert.alert('Already in Collection', 'This product is already in your collection.');
      return;
    }
    const up: UserProduct = {
      id: generateId('up'),
      productId: product.id,
      addedAt: new Date().toISOString(),
      status: 'active',
    };
    await addProduct(up);
    Alert.alert('Added! 🎉', `${product.name} added to your collection.`);
  };

  const handleRemoveFromCollection = () => {
    if (!userProduct) return;
    Alert.alert(
      'Remove Product',
      `Remove "${product.name}" from your collection?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeProduct(userProduct.id) },
      ]
    );
  };

  const handleAddToRoutine = () => {
    router.push({ pathname: '/routine/builder', params: { productId: product.id } });
  };

  const handleOpenSource = () => {
    if (product.sourceUrl) {
      Linking.openURL(product.sourceUrl);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Back + header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          {product.isDemo && (
            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>Demo Content</Text>
            </View>
          )}
        </View>

        {/* Product Image */}
        <Image source={{ uri: product.image }} style={styles.productImage} />

        {/* Passport Card */}
        <View style={styles.passportCard}>
          {/* Identity */}
          <View style={styles.identitySection}>
            <View style={styles.categoryRow}>
              <Text style={styles.categoryEmoji}>{catMeta.emoji}</Text>
              <Text style={[styles.categoryLabel, { color: catMeta.color }]}>{catMeta.label}</Text>
              {product.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{product.badge}</Text>
                </View>
              )}
            </View>
            <Text style={styles.productName}>{product.name}</Text>
            {product.size && <Text style={styles.productSize}>{product.size}</Text>}
          </View>

          {/* Passport Stamp */}
          <View style={styles.passportStamp}>
            <View style={styles.stampBorder}>
              <Text style={styles.stampTitle}>Digital Product Passport</Text>
              <Text style={styles.stampSub}>MM Ritual — Man Matters</Text>
              {product.qrCodeId && (
                <Text style={styles.stampQr}>ID: {product.qrCodeId}</Text>
              )}
            </View>
          </View>

          {/* Description */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionLabel}>About this product</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          <View style={styles.divider} />

          {/* Usage Instructions */}
          <View style={styles.infoSection}>
            <View style={styles.sectionLabelRow}>
              <Text style={styles.sectionLabel}>Usage Instructions</Text>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>📋 From product label</Text>
              </View>
            </View>
            <View style={styles.instructionBox}>
              <Text style={styles.instructionText}>{product.usageInstructions}</Text>
            </View>
          </View>

          {/* Frequency */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionLabel}>Recommended Frequency</Text>
            <View style={styles.frequencyBox}>
              <Text style={styles.frequencyEmoji}>📅</Text>
              <Text style={styles.frequencyText}>{product.frequency}</Text>
            </View>
            <Text style={styles.frequencyNote}>
              Set your routine within this frequency range. Do not exceed the recommended usage.
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Ingredients */}
          {product.ingredients && product.ingredients.length > 0 && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionLabel}>Key Ingredients</Text>
              <View style={styles.ingredientList}>
                {product.ingredients.map((ing) => (
                  <View key={ing} style={styles.ingredientChip}>
                    <Text style={styles.ingredientText}>{ing}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Benefits */}
          {product.benefits && product.benefits.length > 0 && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionLabel}>Claimed Benefits</Text>
              {product.benefits.map((b) => (
                <View key={b} style={styles.benefitRow}>
                  <Text style={styles.benefitDot}>•</Text>
                  <Text style={styles.benefitText}>{b}</Text>
                </View>
              ))}
              <Text style={styles.benefitDisclaimer}>
                Benefits listed are from product labelling. Individual results vary.
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* Precautions */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionLabel}>Precautions</Text>
            <View style={styles.precautionBox}>
              <Text style={styles.precautionEmoji}>⚠️</Text>
              <Text style={styles.precautionText}>{product.precautions}</Text>
            </View>
          </View>

          {/* Verification */}
          <View style={styles.verificationRow}>
            <Text style={styles.verificationLabel}>Information Source</Text>
            <TouchableOpacity onPress={handleOpenSource}>
              <Text style={styles.verificationLink}>{product.sourceUrl}</Text>
            </TouchableOpacity>
            <Text style={styles.verificationDate}>
              Data reference: {product.verificationDate}
            </Text>
          </View>
        </View>

        {/* Important Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ This Product Passport shows sample demo content. Always read the official label on your actual product and follow the instructions provided by the manufacturer. MM Ritual does not provide medical advice.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {!userProduct ? (
            <TouchableOpacity style={styles.primaryBtn} onPress={handleAddToCollection}>
              <Text style={styles.primaryBtnText}>+ Add to My Collection</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.collectionRow}>
              <View style={styles.inCollectionBadge}>
                <Text style={styles.inCollectionText}>✓ In Your Collection</Text>
              </View>
              <TouchableOpacity onPress={handleRemoveFromCollection} style={styles.removeBtn}>
                <Text style={styles.removeBtnText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}

          {userProduct && !inRoutine && (
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleAddToRoutine}>
              <Text style={styles.secondaryBtnText}>☀️ Add to My Routine</Text>
            </TouchableOpacity>
          )}
          {inRoutine && (
            <View style={styles.inRoutineBadge}>
              <Text style={styles.inRoutineText}>☀️ Already in your routine</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: Spacing[10] },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: Typography.fontSize.lg, color: Colors.textSecondary },
  backLink: { color: Colors.accent, marginTop: 12, fontSize: Typography.fontSize.base },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[2],
  },
  backBtn: {},
  backBtnText: { fontSize: Typography.fontSize.base, color: Colors.accent, fontWeight: Typography.fontWeight.medium },
  demoBadge: {
    backgroundColor: Colors.infoLight,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  demoBadgeText: { fontSize: Typography.fontSize.xs, color: Colors.info, fontWeight: Typography.fontWeight.semibold },

  productImage: {
    width: '100%',
    height: 260,
    backgroundColor: Colors.border,
  },

  passportCard: {
    margin: Spacing[5],
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.md,
  },

  identitySection: { padding: Spacing[5], paddingBottom: Spacing[3] },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: Spacing[2] },
  categoryEmoji: { fontSize: 16 },
  categoryLabel: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semibold, textTransform: 'capitalize' },
  badge: { backgroundColor: Colors.accentLight, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: Typography.fontSize.xs, color: Colors.accent, fontWeight: Typography.fontWeight.semibold },
  productName: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  productSize: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary },

  passportStamp: {
    marginHorizontal: Spacing[5],
    marginBottom: Spacing[4],
  },
  stampBorder: {
    borderWidth: 2,
    borderColor: Colors.accent,
    borderRadius: Radius.md,
    borderStyle: 'dashed',
    padding: Spacing[3],
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
  },
  stampTitle: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.bold, color: Colors.accent, letterSpacing: 0.5, textTransform: 'uppercase' },
  stampSub: { fontSize: Typography.fontSize.xs, color: Colors.accentMuted, marginTop: 2 },
  stampQr: { fontSize: Typography.fontSize.xs, color: Colors.textMuted, marginTop: 4, fontFamily: 'monospace' },

  infoSection: { paddingHorizontal: Spacing[5], paddingBottom: Spacing[4] },
  sectionLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing[2],
  },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing[2] },
  verifiedBadge: { backgroundColor: Colors.successLight, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  verifiedText: { fontSize: Typography.fontSize.xs, color: Colors.success },

  description: { fontSize: Typography.fontSize.base, color: Colors.text, lineHeight: 24 },

  instructionBox: {
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.md,
    padding: Spacing[4],
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  instructionText: { fontSize: Typography.fontSize.base, color: Colors.text, lineHeight: 24 },

  frequencyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.md,
    padding: Spacing[3],
    marginBottom: Spacing[2],
  },
  frequencyEmoji: { fontSize: 22 },
  frequencyText: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semibold, color: Colors.text, flex: 1 },
  frequencyNote: { fontSize: Typography.fontSize.xs, color: Colors.textMuted, lineHeight: 18 },

  ingredientList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ingredientChip: {
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  ingredientText: { fontSize: Typography.fontSize.xs, color: Colors.text },

  benefitRow: { flexDirection: 'row', gap: Spacing[2], marginBottom: 6 },
  benefitDot: { color: Colors.accent, fontWeight: Typography.fontWeight.bold, fontSize: Typography.fontSize.base },
  benefitText: { fontSize: Typography.fontSize.base, color: Colors.text, flex: 1, lineHeight: 22 },
  benefitDisclaimer: { fontSize: Typography.fontSize.xs, color: Colors.textMuted, marginTop: Spacing[2], lineHeight: 18 },

  precautionBox: {
    flexDirection: 'row',
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.md,
    padding: Spacing[4],
    gap: Spacing[3],
    alignItems: 'flex-start',
  },
  precautionEmoji: { fontSize: 20, marginTop: 2 },
  precautionText: { fontSize: Typography.fontSize.sm, color: Colors.text, flex: 1, lineHeight: 22 },

  verificationRow: {
    backgroundColor: Colors.background,
    padding: Spacing[4],
    gap: 6,
  },
  verificationLabel: { fontSize: Typography.fontSize.xs, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  verificationLink: { fontSize: Typography.fontSize.sm, color: Colors.accent, textDecorationLine: 'underline' },
  verificationDate: { fontSize: Typography.fontSize.xs, color: Colors.textMuted },

  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing[5], marginVertical: Spacing[2] },

  disclaimer: {
    marginHorizontal: Spacing[5],
    marginBottom: Spacing[4],
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.md,
    padding: Spacing[4],
  },
  disclaimerText: { fontSize: Typography.fontSize.xs, color: Colors.warning, lineHeight: 18 },

  actions: { paddingHorizontal: Spacing[5], gap: Spacing[3] },
  primaryBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    ...Shadow.sm,
  },
  primaryBtnText: { color: Colors.white, fontWeight: Typography.fontWeight.bold, fontSize: Typography.fontSize.base },
  secondaryBtn: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryBtnText: { color: Colors.text, fontWeight: Typography.fontWeight.semibold, fontSize: Typography.fontSize.base },

  collectionRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  inCollectionBadge: {
    flex: 1,
    backgroundColor: Colors.successLight,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  inCollectionText: { color: Colors.success, fontWeight: Typography.fontWeight.semibold },
  removeBtn: {
    backgroundColor: Colors.errorLight,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  removeBtnText: { color: Colors.error, fontWeight: Typography.fontWeight.medium },

  inRoutineBadge: {
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  inRoutineText: { color: Colors.accent, fontWeight: Typography.fontWeight.semibold },
});
