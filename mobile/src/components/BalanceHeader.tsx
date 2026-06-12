import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing } from '../theme/tokens';

interface Props {
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPct: number;
  dayChange: number;
  dayChangePct: number;
}

export function BalanceHeader({ totalValue, totalGainLoss, totalGainLossPct, dayChange, dayChangePct }: Props) {
  const isPositive = totalGainLoss >= 0;
  const isDayPositive = dayChange >= 0;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Portfolio Value</Text>
      <Text style={styles.balance}>${totalValue.toFixed(2)}</Text>
      <View style={styles.changeRow}>
        <View style={[styles.changePill, isPositive ? styles.pillPositive : styles.pillNegative]}>
          <Text style={[styles.changePillText, { color: isPositive ? colors.positive : colors.negative }]}>
            {isPositive ? '+' : ''}{totalGainLossPct.toFixed(1)}%
          </Text>
        </View>
        <Text style={styles.changeAbs}>
          {isPositive ? '+' : ''}${Math.abs(totalGainLoss).toFixed(2)} all time
        </Text>
      </View>
      <Text style={[styles.dayChange, { color: isDayPositive ? colors.positive : colors.negative }]}>
        {isDayPositive ? '+' : ''}{dayChange.toFixed(2)} ({isDayPositive ? '+' : ''}{dayChangePct.toFixed(2)}%) today
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  label: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  balance: {
    ...typography.heroBalance,
    marginBottom: spacing.sm,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  changePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 100,
  },
  pillPositive: {
    backgroundColor: colors.positiveMuted,
  },
  pillNegative: {
    backgroundColor: colors.negativeMuted,
  },
  changePillText: {
    ...typography.priceChange,
    fontSize: 13,
  },
  changeAbs: {
    ...typography.caption,
  },
  dayChange: {
    ...typography.caption,
  },
});
