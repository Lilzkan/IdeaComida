import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import BouncyPressable from './BouncyPressable';
import Text from './Text';
import { COLORS } from '@/constants/colors';
import { FONTS, RADIUS, SHADOWS } from '@/constants/theme';

type ButtonVariant = 'primary' | 'soft' | 'ghost' | 'danger';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

const PALETTE: Record<
  ButtonVariant,
  { background: string; border: string; text: string; spinner: string }
> = {
  primary: {
    background: COLORS.primary,
    border: COLORS.primary,
    text: COLORS.textOnPrimary,
    spinner: COLORS.textOnPrimary,
  },
  soft: {
    background: COLORS.surface,
    border: COLORS.surface,
    text: COLORS.textPrimary,
    spinner: COLORS.textPrimary,
  },
  ghost: {
    background: 'transparent',
    border: COLORS.border,
    text: COLORS.textPrimary,
    spinner: COLORS.textPrimary,
  },
  danger: {
    background: COLORS.danger,
    border: COLORS.danger,
    text: COLORS.textOnPrimary,
    spinner: COLORS.textOnPrimary,
  },
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  fullWidth = true,
  size = 'lg',
  style,
  accessibilityLabel,
}: ButtonProps) {
  const palette = PALETTE[variant];
  const isDisabled = disabled || loading;

  return (
    <BouncyPressable
      onPress={onPress}
      disabled={isDisabled}
      haptic
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        styles.base,
        size === 'lg' ? styles.lg : styles.md,
        fullWidth && styles.fullWidth,
        variant === 'primary' && !isDisabled && SHADOWS.button,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={palette.spinner} />
        ) : (
          icon ?? null
        )}
        <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
      </View>
    </BouncyPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lg: { paddingVertical: 16, paddingHorizontal: 20, minHeight: 54 },
  md: { paddingVertical: 12, paddingHorizontal: 16, minHeight: 46 },
  fullWidth: { width: '100%' },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    letterSpacing: 0.2,
  },
});
