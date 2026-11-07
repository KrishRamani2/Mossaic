import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme';

const GUIDE_ARTICLES = [
  {
    id: 'g1',
    category: 'haircare',
    title: 'Understanding Hair Fall: Common Causes',
    emoji: '💆',
    readTime: '3 min',
    content: `Hair fall can result from many factors including stress, nutrition, hormones and genetics. Understanding the root cause helps choose the right products and routine.\n\nCommon causes include:\n• Nutritional deficiencies (Iron, Biotin, Vitamin D)\n• Hormonal changes (DHT sensitivity)\n• Stress and poor sleep\n• Harsh products or over-styling\n\nNote: This is general educational information, not medical advice. Consult a dermatologist for personalized guidance.`,
    tags: ['hair fall', 'causes', 'basics'],
    isDemo: true,
  },
  {
    id: 'g2',
    category: 'haircare',
    title: 'How to Use a Hair Serum Correctly',
    emoji: '💧',
    readTime: '2 min',
    content: `Hair serums work best when applied to the right area in the right amount.\n\nGeneral guidelines (always follow your product's specific instructions):\n• Apply to towel-dried, damp hair — not soaking wet\n• Focus on mid-lengths and ends, not roots\n• Use the amount directed by your product\n• Do not rinse unless specified\n\n⚠️ Always follow the instructions on your specific product. These are general guidelines only.`,
    tags: ['serum', 'application', 'haircare'],
    isDemo: true,
  },
  {
    id: 'g3',
    category: 'skincare',
    title: 'Building a Simple Skincare Routine',
    emoji: '🧴',
    readTime: '4 min',
    content: `A simple skincare routine doesn't need to be complicated. Start with the essentials.\n\nMorning basics:\n1. Cleanser\n2. Moisturiser\n3. Sunscreen (SPF 30 or higher)\n\nEvening basics:\n1. Cleanser\n2. Treatment (serums, retinoids — as directed by your product)\n3. Moisturiser\n\nIntroduce one new product at a time and monitor how your skin responds.\n\n📌 Note: This is a general framework. Product-specific instructions always take priority.`,
    tags: ['skincare', 'routine', 'basics'],
    isDemo: true,
  },
  {
    id: 'g4',
    category: 'skincare',
    title: 'What is Niacinamide and How Does It Work?',
    emoji: '🔬',
    readTime: '3 min',
    content: `Niacinamide (Vitamin B3) is a water-soluble vitamin widely used in skincare.\n\nCommon uses include:\n• Minimizing the appearance of pores\n• Improving uneven skin tone\n• Helping control excess oil\n• Supporting skin barrier function\n\nIt is generally considered well-tolerated for most skin types. Typical concentrations range from 2% to 10%.\n\n⚠️ If you experience irritation, reduce frequency or consult a dermatologist. This information is educational — not a substitute for medical advice.`,
    tags: ['niacinamide', 'ingredients', 'skincare'],
    isDemo: true,
  },
  {
    id: 'g5',
    category: 'beard',
    title: 'Beard Care: A Starter Guide',
    emoji: '🧔',
    readTime: '3 min',
    content: `A groomed beard requires consistent care. Here are the fundamentals.\n\nBasic beard care:\n1. Cleanse — Use a dedicated beard wash 2–3 times per week\n2. Condition — Apply beard oil or balm to soften and nourish\n3. Comb/Brush — Detangle and style daily\n4. Trim — Maintain shape regularly\n\nBeard oil is typically applied to the skin beneath the beard, not just the hair.\n\n📌 Follow your specific product instructions for best results.`,
    tags: ['beard', 'grooming', 'basics'],
    isDemo: true,
  },
  {
    id: 'g6',
    category: 'supplements',
    title: 'Understanding Hair Supplements',
    emoji: '💊',
    readTime: '3 min',
    content: `Hair supplements typically contain vitamins and minerals that support hair health.\n\nCommon ingredients include:\n• Biotin — involved in keratin production\n• Zinc — supports scalp health\n• Vitamin D — plays a role in hair follicle cycling\n• Iron — required for nutrient delivery to follicles\n\nSupplements work best when there is an underlying deficiency. They are not a substitute for medical treatment.\n\n⚠️ Always consult a doctor before starting supplements, especially if you have existing medical conditions or take other medications.`,
    tags: ['supplements', 'vitamins', 'hair'],
    isDemo: true,
  },
  {
    id: 'g7',
    category: 'general',
    title: 'Ingredient Glossary: Common Actives',
    emoji: '📖',
    readTime: '5 min',
    content: `A quick reference for common skincare and haircare ingredients.\n\n• Salicylic Acid — A BHA that helps unclog pores and exfoliate\n• Hyaluronic Acid — A humectant that draws moisture to the skin\n• Retinol — A Vitamin A derivative; use as directed, avoid if pregnant\n• Argan Oil — A lightweight oil for hair and skin conditioning\n• Saw Palmetto — A plant extract studied for DHT-related hair concerns\n• Zinc PCA — Helps regulate sebum production\n\n⚠️ This is a general educational glossary. For product-specific guidance, follow your product instructions and consult professionals.`,
    tags: ['ingredients', 'actives', 'glossary'],
    isDemo: true,
  },
  {
    id: 'g8',
    category: 'general',
    title: 'When to See a Dermatologist',
    emoji: '👨‍⚕️',
    readTime: '2 min',
    content: `Self-managed routines are great for general maintenance. However, some concerns need professional evaluation.\n\nConsider seeing a dermatologist if:\n• Hair fall is sudden, severe or patchy\n• Skin reactions (redness, burning, swelling) occur after product use\n• Acne is persistent or cystic\n• You notice unusual changes in skin or scalp\n• You are pregnant or nursing and want to change your routine\n\nMM Ritual helps you manage your routine. It does not diagnose or treat medical conditions.`,
    tags: ['safety', 'medical', 'important'],
    isDemo: true,
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'haircare', label: 'Haircare', emoji: '💆' },
  { id: 'skincare', label: 'Skincare', emoji: '🧴' },
  { id: 'beard', label: 'Beard', emoji: '🧔' },
  { id: 'supplements', label: 'Supplements', emoji: '💊' },
  { id: 'general', label: 'General', emoji: '📖' },
];

export default function GuideScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [openArticle, setOpenArticle] = useState<typeof GUIDE_ARTICLES[0] | null>(null);

  const filtered = GUIDE_ARTICLES.filter((a) => {
    const matchesCat = selectedCategory === 'all' || a.category === selectedCategory;
    const matchesSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some((t) => t.includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  if (openArticle) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.articleScroll}>
          <TouchableOpacity onPress={() => setOpenArticle(null)} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.articleHeader}>
            <Text style={styles.articleEmoji}>{openArticle.emoji}</Text>
            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>Demo Content</Text>
            </View>
          </View>
          <Text style={styles.articleTitle}>{openArticle.title}</Text>
          <View style={styles.articleMeta}>
            <Text style={styles.articleCat}>{openArticle.category}</Text>
            <Text style={styles.articleDot}>·</Text>
            <Text style={styles.articleRead}>{openArticle.readTime} read</Text>
          </View>
          <Text style={styles.articleBody}>{openArticle.content}</Text>
          <View style={styles.articleDisclaimer}>
            <Text style={styles.articleDisclaimerText}>
              📌 This content is for general information only. It is not medical advice. Always follow your product's official instructions and consult a qualified healthcare professional for personal guidance.
            </Text>
          </View>
          <View style={styles.articleTags}>
            {openArticle.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Product Guide</Text>
        <Text style={styles.headerSub}>Educational content for your personal care journey</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search articles..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Category Chips */}
      <View style={styles.categorySection}>
        <Text style={styles.categoryHeading}>Browse by category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catScroll}
          contentContainerStyle={styles.catScrollContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catChip, selectedCategory === cat.id && styles.catChipActive]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text style={[styles.catLabel, selectedCategory === cat.id && styles.catLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Disclaimer Banner */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          📌 All content is sample educational information clearly labelled as demo. It does not constitute medical advice.
        </Text>
      </View>

      <ScrollView
        style={styles.articleScrollView}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.articleList}>
          {filtered.map((article) => (
            <TouchableOpacity
              key={article.id}
              style={styles.articleCard}
              onPress={() => setOpenArticle(article)}
              activeOpacity={0.9}
            >
              <Text style={styles.cardEmoji}>{article.emoji}</Text>
              <View style={styles.cardContent}>
                <View style={styles.cardMeta}>
                  <Text style={styles.cardCat}>{article.category}</Text>
                  <Text style={styles.cardDot}>·</Text>
                  <Text style={styles.cardRead}>{article.readTime}</Text>
                </View>
                <Text style={styles.cardTitle}>{article.title}</Text>
                <View style={styles.cardTags}>
                  {article.tags.slice(0, 2).map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <Text style={styles.cardArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing[5], paddingTop: Spacing[5], paddingBottom: Spacing[2] },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    letterSpacing: -0.4,
  },
  headerSub: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, marginTop: 4 },

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

  disclaimer: {
    marginHorizontal: Spacing[5],
    marginBottom: Spacing[3],
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.md,
    padding: Spacing[3],
  },
  disclaimerText: { fontSize: Typography.fontSize.xs, color: Colors.warning, lineHeight: 18 },

  articleScrollView: { flex: 1 },
  scroll: { paddingHorizontal: Spacing[5], paddingBottom: Spacing[10] },
  articleList: { gap: Spacing[3] },

  articleCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  cardEmoji: { fontSize: 30, width: 34, textAlign: 'center' },
  cardContent: { flex: 1, minWidth: 0 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  cardCat: { fontSize: Typography.fontSize.xs, color: Colors.accent, textTransform: 'capitalize', fontWeight: Typography.fontWeight.medium },
  cardDot: { fontSize: Typography.fontSize.xs, color: Colors.textMuted },
  cardRead: { fontSize: Typography.fontSize.xs, color: Colors.textSecondary },
  cardTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semibold, color: Colors.text, lineHeight: 21, marginBottom: 7 },
  cardTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cardArrow: { fontSize: 24, color: Colors.textMuted, paddingTop: 8, width: 18, textAlign: 'right' },
  tag: { backgroundColor: Colors.accentLight, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { fontSize: Typography.fontSize.xs, color: Colors.accent },

  // Article Detail
  articleScroll: { paddingHorizontal: Spacing[5], paddingBottom: Spacing[10] },
  backBtn: { paddingTop: Spacing[4], paddingBottom: Spacing[2] },
  backBtnText: { fontSize: Typography.fontSize.base, color: Colors.accent, fontWeight: Typography.fontWeight.medium },
  articleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing[3] },
  articleEmoji: { fontSize: 48 },
  demoBadge: { backgroundColor: Colors.infoLight, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  demoBadgeText: { fontSize: Typography.fontSize.xs, color: Colors.info, fontWeight: Typography.fontWeight.semibold },
  articleTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    letterSpacing: -0.3,
    marginBottom: Spacing[2],
  },
  articleMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing[5] },
  articleCat: { fontSize: Typography.fontSize.sm, color: Colors.accent, textTransform: 'capitalize', fontWeight: Typography.fontWeight.medium },
  articleDot: { color: Colors.textMuted },
  articleRead: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary },
  articleBody: { fontSize: Typography.fontSize.base, color: Colors.text, lineHeight: 26, marginBottom: Spacing[5] },
  articleDisclaimer: {
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.md,
    padding: Spacing[4],
    marginBottom: Spacing[4],
  },
  articleDisclaimerText: { fontSize: Typography.fontSize.sm, color: Colors.warning, lineHeight: 20 },
  articleTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
