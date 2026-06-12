import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: boolean;
}

export function Card({ children, style, padding = true }: Props) {
  return (
    <View style={[styles.card, padding && styles.padded, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface1,
    borderRadius: radii.card,
    marginHorizontal: spacing.screen,
  },
  padded: {
    padding: spacing.card,
  },
});
