import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { Colors, Typography, Radius, Shadow, Spacing } from '../../constants/theme';

// ─── Typography Components ────────────────────────────────────────────────────

interface TextProps {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
  color?: string;
  numberOfLines?: number;
}

export const H1 = ({ children, style, color }: TextProps) => (
  <Text style={[styles.h1, color ? { color } : undefined, style]}>{children}</Text>
);

export const H2 = ({ children, style, color }: TextProps) => (
  <Text style={[styles.h2, color ? { color } : undefined, style]}>{children}</Text>
);

export const H3 = ({ children, style, color }: TextProps) => (
  <Text style={[styles.h3, color ? { color } : undefined, style]}>{children}</Text>
);

export const BodyText = ({ children, style, color, numberOfLines }: TextProps) => (
  <Text numberOfLines={numberOfLines} style={[styles.body, color ? { color } : undefined, style]}>
    {children}
  </Text>
);

export const Caption = ({ children, style, color }: TextProps) => (
  <Text style={[styles.caption, color ? { color } : undefined, style]}>{children}</Text>
);

export const Label = ({ children, style, color }: TextProps) => (
  <Text style={[styles.label, color ? { color } : undefined, style]}>{children}</Text>
);

// ─── Card ────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
  shadow?: boolean;
}

export const Card = ({ children, style, onPress, shadow = false }: CardProps) => {
  const cardStyle = [styles.card, shadow ? Shadow.md : undefined, style];
  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={cardStyle}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={cardStyle}>{children}</View>;
};

// ─── Button ──────────────────────────────────────────────────────────────────

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export const Button = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  icon,
  style,
  fullWidth,
}: ButtonProps) => {
  const btnStyle = [
    styles.btn,
    styles[`btn_${variant}`],
    styles[`btn_${size}`],
    fullWidth && { width: '100%' as any },
    (disabled || loading) && styles.btn_disabled,
    style,
  ];
  const textStyle = [styles.btnText, styles[`btnText_${variant}`], styles[`btnText_${size}`]];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={btnStyle}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? Colors.white : Colors.accent}
        />
      ) : (
        <View style={styles.btnInner}>
          {icon && <View style={styles.btnIcon}>{icon}</View>}
          <Text style={textStyle}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ─── Chip / Tag ───────────────────────────────────────────────────────────────

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
  size?: 'sm' | 'md';
}

export const Chip = ({ label, selected, onPress, color, size = 'md' }: ChipProps) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    disabled={!onPress}
    style={[
      styles.chip,
      size === 'sm' && styles.chip_sm,
      selected
        ? { backgroundColor: color ?? Colors.accent, borderColor: color ?? Colors.accent }
        : { backgroundColor: Colors.surface, borderColor: Colors.border },
    ]}
  >
    <Text
      style={[
        styles.chipText,
        size === 'sm' && styles.chipText_sm,
        { color: selected ? Colors.white : Colors.textSecondary },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

// ─── Badge ────────────────────────────────────────────────────────────────────

interface BadgeProps {
  label: string;
  color?: string;
  bgColor?: string;
}

export const Badge = ({ label, color = Colors.accent, bgColor = Colors.accentLight }: BadgeProps) => (
  <View style={[styles.badge, { backgroundColor: bgColor }]}>
    <Text style={[styles.badgeText, { color }]}>{label}</Text>
  </View>
);

// ─── Divider ─────────────────────────────────────────────────────────────────

export const Divider = ({ style }: { style?: ViewStyle }) => (
  <View style={[styles.divider, style]} />
);

// ─── Empty State ─────────────────────────────────────────────────────────────

interface EmptyStateProps {
  emoji?: string;
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
}

export const EmptyState = ({ emoji, title, subtitle, action }: EmptyStateProps) => (
  <View style={styles.emptyState}>
    {emoji && <Text style={styles.emptyEmoji}>{emoji}</Text>}
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
    {action && (
      <TouchableOpacity onPress={action.onPress} style={styles.emptyAction}>
        <Text style={styles.emptyActionText}>{action.label}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── Status Dot ──────────────────────────────────────────────────────────────

export const StatusDot = ({ status }: { status: 'completed' | 'skipped' | 'pending' }) => {
  const color =
    status === 'completed'
      ? Colors.success
      : status === 'skipped'
      ? Colors.warning
      : Colors.border;
  return <View style={[styles.dot, { backgroundColor: color }]} />;
};

// ─── Section Header ───────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  action?: { label: string; onPress: () => void };
}

export const SectionHeader = ({ title, action }: SectionHeaderProps) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {action && (
      <TouchableOpacity onPress={action.onPress}>
        <Text style={styles.sectionAction}>{action.label}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Typography
  h1: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  body: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text,
    lineHeight: 22,
  },
  caption: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  label: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
  },

  // Button
  btn: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  btn_primary: {
    backgroundColor: Colors.accent,
    borderWidth: 0,
  },
  btn_secondary: {
    backgroundColor: Colors.accentLight,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  btn_ghost: {
    backgroundColor: Colors.transparent,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btn_danger: {
    backgroundColor: Colors.errorLight,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  btn_sm: { paddingHorizontal: 14, paddingVertical: 8, minHeight: 36 },
  btn_md: { paddingHorizontal: 20, paddingVertical: 12, minHeight: 44 },
  btn_lg: { paddingHorizontal: 28, paddingVertical: 16, minHeight: 54 },
  btn_disabled: { opacity: 0.5 },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnIcon: { marginRight: 2 },
  btnText: { fontWeight: Typography.fontWeight.semibold },
  btnText_primary: { color: Colors.white },
  btnText_secondary: { color: Colors.accent },
  btnText_ghost: { color: Colors.text },
  btnText_danger: { color: Colors.error },
  btnText_sm: { fontSize: Typography.fontSize.sm },
  btnText_md: { fontSize: Typography.fontSize.base },
  btnText_lg: { fontSize: Typography.fontSize.md },

  // Chip
  chip: {
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chip_sm: { paddingHorizontal: 10, paddingVertical: 4 },
  chipText: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.medium },
  chipText_sm: { fontSize: Typography.fontSize.xs },

  // Badge
  badge: {
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.semibold },

  // Divider
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing[4] },

  // Empty State
  emptyState: { alignItems: 'center', paddingVertical: Spacing[12], paddingHorizontal: Spacing[6] },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing[3] },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing[2],
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing[5],
  },
  emptyAction: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: Radius.md,
  },
  emptyActionText: {
    color: Colors.white,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.base,
  },

  // Status Dot
  dot: { width: 8, height: 8, borderRadius: 4 },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing[3],
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  sectionAction: {
    fontSize: Typography.fontSize.sm,
    color: Colors.accent,
    fontWeight: Typography.fontWeight.medium,
  },
});
