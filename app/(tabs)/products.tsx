import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme';
import { useApp } from '../../src/context/AppContext';
import { DEMO_PRODUCTS, PRODUCT_CATALOGUE_CATEGORIES } from '../../src/data/demo-products';
import { generateId } from '../../src/lib/analytics/analytics';
import { UserProduct } from '../../src/types/product';
import { SectionHeader, Badge, EmptyState } from '../../src/components/common/UIComponents';

export default function ProductsScreen() {
  const router = useRouter();
  const { userProducts, addProduct, removeProduct } = useApp();
  const [activeTab, setActiveTab] = useState<'my' | 'catalogue'>('my');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const myProductDetails = useMemo(() =>
    userProducts
      .filter((up) => up.status !== 'removed')
      .map((up) => ({
        userProduct: up,
        product: DEMO_PRODUCTS.find((p) => p.id === up.productId),
      }))
      .filter((x) => x.product),
    [userProducts]
  );

  const filteredCatalogue = useMemo(() => {
    return DEMO_PRODUCTS.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [search, selectedCategory]);

  const isInMyProducts = (productId: string) =>
    userProducts.some((up) => up.productId === productId && up.status !== 'removed');

  const handleAdd = async (productId: string) => {
    if (isInMyProducts(productId)) {
      Alert.alert('Already Added', 'This product is already in your collection.');
      return;
    }
    const up: UserProduct = {
      id: generateId('up'),
      productId,
      addedAt: new Date().toISOString(),
      status: 'active',
    };
    await addProduct(up);
    Alert.alert('Added! 🎉', 'Product added to your collection.');
  };

  const handleRemove = (userProductId: string, productName: string) => {
    Alert.alert(
      'Remove Product',
      `Remove "${productName}" from your collection?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeProduct(userProductId),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>YOUR COLLECTION</Text>
          <Text style={styles.headerTitle}>My Products</Text>
          <Text style={styles.headerSub}>Thoughtfully chosen for your routine.</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="bag-handle-outline" size={22} color={Colors.accent} />
        </View>
      </View>

      <View style={styles.collectionSummary}>
        <View style={styles.summaryIcon}>
          <Ionicons name="sparkles-outline" size={22} color={Colors.accent} />
        </View>
        <View style={styles.summaryCopy}>
          <Text style={styles.summaryTitle}>{myProductDetails.length} products in your collection</Text>
          <Text style={styles.summaryText}>Build a routine that works for you.</Text>
        </View>
        <Text style={styles.summaryArrow}>→</Text>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my' && styles.tabActive]}
          onPress={() => setActiveTab('my')}
        >
          <Ionicons name="grid-outline" size={17} color={activeTab === 'my' ? Colors.accent : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'my' && styles.tabTextActive]}>
            My Collection ({myProductDetails.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'catalogue' && styles.tabActive]}
          onPress={() => setActiveTab('catalogue')}
        >
          <Ionicons name="storefront-outline" size={17} color={activeTab === 'catalogue' ? Colors.accent : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'catalogue' && styles.tabTextActive]}>
            Catalogue
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'my' && (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {myProductDetails.length === 0 ? (
            <EmptyState
              emoji="📦"
              title="No products yet"
              subtitle="Browse the catalogue to add products to your collection."
              action={{ label: 'Browse Catalogue', onPress: () => setActiveTab('catalogue') }}
            />
          ) : (
            <View style={styles.grid}>
              {myProductDetails.map(({ userProduct, product }) =>
                product ? (
                  <ProductCard
                    key={userProduct.id}
                    name={product.name}
                    category={product.category}
                    image={product.image}
                    badge={product.badge}
                    isDemo={product.isDemo}
                    addedDate={userProduct.addedAt}
                    inCollection
                    onPress={() => router.push(`/product/${product.id}`)}
                    onRemove={() => handleRemove(userProduct.id, product.name)}
                  />
                ) : null
              )}
            </View>
          )}
        </ScrollView>
      )}

      {activeTab === 'catalogue' && (
        <>
          {/* Search */}
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search products..."
                placeholderTextColor={Colors.textMuted}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Text style={styles.clearBtn}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.categorySection}>
            <Text style={styles.categoryHeading}>Browse by category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.catScroll}
              contentContainerStyle={styles.catScrollContent}
            >
              {PRODUCT_CATALOGUE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.catChip,
                    selectedCategory === cat.id && styles.catChipActive,
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text style={styles.catEmoji}>{cat.emoji}</Text>
                  <Text
                    style={[
                      styles.catLabel,
                      selectedCategory === cat.id && styles.catLabelActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <ScrollView
            style={styles.catalogueScroll}
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            {filteredCatalogue.length === 0 ? (
              <EmptyState
                emoji="🔍"
                title="No products found"
                subtitle="Try a different search or category filter."
              />
            ) : (
              <View style={styles.grid}>
                {filteredCatalogue.map((product) => (
                  <ProductCard
                    key={product.id}
                    name={product.name}
                    category={product.category}
                    image={product.image}
                    badge={product.badge}
                    isDemo={product.isDemo}
                    inCollection={isInMyProducts(product.id)}
                    onPress={() => router.push(`/product/${product.id}`)}
                    onAdd={() => handleAdd(product.id)}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

function ProductCard({
  name,
  category,
  image,
  badge,
  isDemo,
  addedDate,
  inCollection,
  onPress,
  onAdd,
  onRemove,
}: {
  name: string;
  category: string;
  image: string;
  badge?: string;
  isDemo?: boolean;
  addedDate?: string;
  inCollection?: boolean;
  onPress: () => void;
  onAdd?: () => void;
  onRemove?: () => void;
}) {
  const categoryEmojis: Record<string, string> = {
    haircare: '💆',
    skincare: '🧴',
    beard: '🧔',
    supplements: '💊',
    grooming: '✂️',
  };

  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: image }} style={styles.productImage} />
      {badge && (
        <View style={styles.productBadge}>
          <Text style={styles.productBadgeText}>{badge}</Text>
        </View>
      )}
      {isDemo && (
        <View style={styles.demoBadge}>
          <Text style={styles.demoBadgeText}>Demo</Text>
        </View>
      )}
      <View style={styles.productInfo}>
        <View style={styles.productCatRow}>
          <Text style={styles.productCatEmoji}>{categoryEmojis[category] ?? '📦'}</Text>
          <Text style={styles.productCat}>{category}</Text>
        </View>
        <Text style={styles.productName} numberOfLines={2}>
          {name}
        </Text>
        {addedDate && (
          <Text style={styles.addedDate}>
            Added {new Date(addedDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
          </Text>
        )}
        {inCollection ? (
          <View style={styles.inCollectionRow}>
            <View style={styles.inCollectionBadge}>
              <Text style={styles.inCollectionText}>✓ In Collection</Text>
            </View>
            {onRemove && (
              <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
                <Text style={styles.removeBtnText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : onAdd ? (
          <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentLight,
  },
  collectionSummary: {
    marginHorizontal: Spacing[5],
    marginBottom: Spacing[4],
    padding: Spacing[4],
    borderRadius: Radius.xl,
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: '#DDEBE2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing[3],
  },
  summaryCopy: { flex: 1 },
  summaryTitle: { color: Colors.white, fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.bold },
  summaryText: { color: '#CFE2D6', fontSize: Typography.fontSize.xs, marginTop: 4 },
  summaryArrow: { color: Colors.white, fontSize: 22, marginLeft: Spacing[2] },

  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[5],
    marginBottom: Spacing[4],
    gap: Spacing[2],
  },
  tab: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: { backgroundColor: Colors.accentLight, borderColor: Colors.accent },
  tabText: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, fontWeight: Typography.fontWeight.medium },
  tabTextActive: { color: Colors.accent, fontWeight: Typography.fontWeight.semibold },

  searchRow: { paddingHorizontal: Spacing[5], marginBottom: Spacing[4] },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
    paddingVertical: 10,
    gap: Spacing[2],
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: Typography.fontSize.base, color: Colors.text },
  clearBtn: { fontSize: 16, color: Colors.textSecondary },

  categorySection: { marginBottom: Spacing[4] },
  categoryHeading: {
    paddingHorizontal: Spacing[5],
    marginBottom: Spacing[2],
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  catScroll: { height: 42 },
  catScrollContent: { paddingHorizontal: Spacing[5], gap: 8, alignItems: 'center' },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catChipActive: { backgroundColor: Colors.accentLight, borderColor: Colors.accent },
  catEmoji: { fontSize: 14 },
  catLabel: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 18,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  catLabelActive: { color: Colors.accent },

  catalogueScroll: { flex: 1 },
  scroll: { paddingHorizontal: Spacing[5], paddingBottom: Spacing[4] },
  grid: { gap: Spacing[3] },

  productCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  productImage: { width: '100%', height: 150, backgroundColor: Colors.border },
  productBadge: {
    position: 'absolute',
    top: Spacing[2],
    right: Spacing[2],
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  productBadgeText: { color: Colors.white, fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.semibold },
  demoBadge: {
    position: 'absolute',
    top: Spacing[2],
    left: Spacing[2],
    backgroundColor: Colors.infoLight,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  demoBadgeText: { color: Colors.info, fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.semibold },
  productInfo: { padding: Spacing[4], minHeight: 144 },
  productCatRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  productCatEmoji: { fontSize: 12 },
  productCat: { fontSize: Typography.fontSize.xs, color: Colors.textSecondary, textTransform: 'capitalize' },
  productName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing[2],
    lineHeight: 21,
    minHeight: 42,
  },
  addedDate: { fontSize: Typography.fontSize.xs, color: Colors.textMuted, marginBottom: Spacing[2] },

  inCollectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inCollectionBadge: {
    backgroundColor: Colors.successLight,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  inCollectionText: { fontSize: Typography.fontSize.xs, color: Colors.success, fontWeight: Typography.fontWeight.semibold },
  removeBtn: { paddingHorizontal: 10, paddingVertical: 4 },
  removeBtnText: { fontSize: Typography.fontSize.xs, color: Colors.error },

  addBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addBtnText: { color: Colors.white, fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semibold },
});
