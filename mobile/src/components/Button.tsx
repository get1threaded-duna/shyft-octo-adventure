import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radii } from '../theme/tokens';

type Variant = 'primary' | 'secondary' | 'pill' | 'ghost';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', loading, disabled, style }: Props) {
  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.primary} size="small" />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label` as keyof typeof styles]]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.button,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface2,
  },
  pill: {
    backgroundColor: colors.surface2,
    borderRadius: radii.pill,
    minHeight: 40,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.4 },
  label: {
    ...typography.body,
    fontWeight: '600',
  },
  primaryLabel: { color: '#fff' },
  secondaryLabel: { color: colors.textPrimary },
  pillLabel: { color: colors.textPrimary, fontSize: 14 },
  ghostLabel: { color: colors.primary },
});
