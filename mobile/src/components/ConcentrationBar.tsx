import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radii } from '../theme/tokens';

interface Segment {
  ticker: string;
  pct: number;
  color: string;
}

interface Props {
  segments: Segment[];
}

const SEGMENT_COLORS = ['#0052FF', '#9B59B6', '#05B169', '#F0B429', '#F42E2E'];

export function ConcentrationBar({ segments }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {segments.map((seg, i) => (
          <View
            key={seg.ticker}
            style={[
              styles.segment,
              {
                flex: seg.pct,
                backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
                borderRadius: i === 0 ? radii.pill : i === segments.length - 1 ? radii.pill : 0,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.legend}>
        {segments.map((seg, i) => (
          <View key={seg.ticker} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }]} />
            <Text style={styles.legendText}>{seg.ticker} {seg.pct.toFixed(0)}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screen,
    gap: spacing.sm,
  },
  bar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: radii.pill,
    overflow: 'hidden',
    gap: 2,
  },
  segment: {
    height: 8,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
