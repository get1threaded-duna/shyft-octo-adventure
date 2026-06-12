import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radii } from '../theme/tokens';
import { Position } from '../data/mock';

interface Props {
  position: Position;
  portfolioPct: number;
  onPress: (position: Position) => void;
}

export function AssetRow({ position, portfolioPct, onPress }: Props) {
  const isGain = position.gainLossPct >= 0;

  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(position);
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {/* Logo placeholder */}
      <View style={[styles.logo, { backgroundColor: position.logoColor + '22' }]}>
        <Text style={[styles.logoText, { color: position.logoColor }]}>
          {position.ticker.slice(0, 2)}
        </Text>
      </View>

      {/* Name + ticker */}
      <View style={styles.nameCol}>
        <Text style={styles.name} numberOfLines={1}>{position.name}</Text>
        <Text style={styles.ticker}>{position.ticker}</Text>
      </View>

      {/* Value + change */}
      <View style={styles.valueCol}>
        <Text style={styles.value}>${position.value.toFixed(2)}</Text>
        <View style={[styles.changePill, isGain ? styles.pillGain : styles.pillLoss]}>
          <Text style={[styles.changeText, { color: isGain ? colors.positive : colors.negative }]}>
            {isGain ? '+' : ''}{position.gainLossPct.toFixed(2)}%
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    height: spacing.assetRowHeight,
    gap: spacing.md,
  },
  pressed: {
    backgroundColor: colors.surface2,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: radii.avatar,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: {
    fontSize: 14,
    fontWeight: '700',
  },
  nameCol: {
    flex: 1,
    gap: 3,
  },
  name: {
    ...typography.assetName,
  },
  ticker: {
    ...typography.assetTicker,
  },
  valueCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  value: {
    ...typography.price,
  },
  changePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  pillGain: { backgroundColor: colors.positiveMuted },
  pillLoss: { backgroundColor: colors.negativeMuted },
  changeText: {
    ...typography.priceChange,
    fontSize: 12,
  },
});
