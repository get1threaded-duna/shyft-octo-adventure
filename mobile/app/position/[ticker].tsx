import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { mockPositions } from '../../src/data/mock';
import { colors, typography, spacing, radii } from '../../src/theme/tokens';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';

const TIME_RANGES = ['1D', '1W', '1M', '3M', '1Y', 'All'];

const TOTAL_PORTFOLIO_VALUE = 57.46;

export default function PositionDetail() {
  const { ticker } = useLocalSearchParams<{ ticker: string }>();
  const position = mockPositions.find((p) => p.ticker === ticker);
  const [range, setRange] = useState('1M');
  const [loadingBrief, setLoadingBrief] = useState(false);

  if (!position) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={typography.body}>Position not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isGain = position.gainLossPct >= 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={[styles.logo, { backgroundColor: position.logoColor + '22' }]}>
            <Text style={[styles.logoText, { color: position.logoColor }]}>
              {position.ticker.slice(0, 2)}
            </Text>
          </View>
          <Text style={styles.name}>{position.name}</Text>
          <Text style={styles.price}>${position.currentPrice.toFixed(2)}</Text>
          <View style={[styles.changePill, isGain ? styles.gainPill : styles.lossPill]}>
            <Text style={[styles.changeText, { color: isGain ? colors.positive : colors.negative }]}>
              {isGain ? '+' : ''}{position.gainLossPct.toFixed(2)}% all time
            </Text>
          </View>
        </View>

        {/* Chart placeholder */}
        <Card style={styles.chartCard} padding={false}>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>Chart · {range}</Text>
          </View>
          <View style={styles.segmentedControl}>
            {TIME_RANGES.map((r) => (
              <Pressable
                key={r}
                onPress={() => setRange(r)}
                style={[styles.rangeButton, range === r && styles.rangeButtonActive]}
              >
                <Text style={[styles.rangeText, range === r && styles.rangeTextActive]}>{r}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Stats grid */}
        <Card>
          <View style={styles.statsGrid}>
            <StatCell label="Shares" value={position.shares.toFixed(5)} />
            <StatCell label="Avg Cost" value={`$${position.avgCost.toFixed(2)}`} />
            <StatCell label="Total Value" value={`$${position.value.toFixed(2)}`} />
            <StatCell
              label="Gain / Loss"
              value={`${isGain ? '+' : ''}$${Math.abs(position.gainLoss).toFixed(2)}`}
              color={isGain ? colors.positive : colors.negative}
            />
            <StatCell label="Sector" value={position.sector} />
            <StatCell
              label="Portfolio %"
              value={`${((position.value / TOTAL_PORTFOLIO_VALUE) * 100).toFixed(1)}%`}
            />
          </View>
        </Card>

        {/* Analysis Brief */}
        <View style={styles.section}>
          <Button
            label={loadingBrief ? 'Generating…' : 'Analysis Brief'}
            loading={loadingBrief}
            onPress={() => setLoadingBrief(true)}
            variant="primary"
            style={styles.analysisButton}
          />
          <Text style={styles.briefDisclaimer}>
            Educational analysis, not investment advice. You make the decisions.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={statStyles.cell}>
      <Text style={statStyles.label}>{label}</Text>
      <Text style={[statStyles.value, color ? { color } : {}]}>{value}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  cell: { width: '50%', paddingVertical: spacing.sm, gap: 3 },
  label: { ...typography.caption },
  value: { ...typography.assetName },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 48, gap: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.screen,
    gap: spacing.sm,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 20, fontWeight: '700' },
  name: { ...typography.body, color: colors.textSecondary },
  price: { ...typography.heroBalance, fontSize: 36 },
  changePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  gainPill: { backgroundColor: colors.positiveMuted },
  lossPill: { backgroundColor: colors.negativeMuted },
  changeText: { ...typography.priceChange },
  chartCard: { marginHorizontal: spacing.screen },
  chartPlaceholder: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  chartPlaceholderText: { ...typography.caption, color: colors.textTertiary },
  segmentedControl: {
    flexDirection: 'row',
    padding: spacing.sm,
    gap: 4,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  rangeButtonActive: { backgroundColor: colors.surface2 },
  rangeText: { ...typography.caption, color: colors.textSecondary },
  rangeTextActive: { color: colors.textPrimary, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  section: { paddingHorizontal: spacing.screen, gap: spacing.sm },
  analysisButton: { marginHorizontal: 0 },
  briefDisclaimer: {
    ...typography.caption,
    textAlign: 'center',
    color: colors.textTertiary,
  },
});
