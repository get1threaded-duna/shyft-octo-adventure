import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, SafeAreaView, Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { BalanceHeader } from '../../src/components/BalanceHeader';
import { ActionButtons } from '../../src/components/ActionButtons';
import { AssetRow } from '../../src/components/AssetRow';
import { SectionHeader } from '../../src/components/SectionHeader';
import { ConcentrationBar } from '../../src/components/ConcentrationBar';
import { mockPositions, mockPortfolio, Position } from '../../src/data/mock';
import { colors, spacing, typography, radii } from '../../src/theme/tokens';

export default function PortfolioScreen() {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  function handlePositionPress(position: Position) {
    router.push(`/position/${position.ticker}`);
  }

  const totalValue = mockPositions.reduce((s, p) => s + p.value, 0);
  const concentrationSegments = mockPositions.map((p) => ({
    ticker: p.ticker,
    pct: (p.value / totalValue) * 100,
    color: p.logoColor,
  }));

  const topConcentration = concentrationSegments[0];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top nav: account avatar + name left, icons right */}
      <View style={styles.topNav}>
        <Pressable style={styles.accountRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>J</Text>
          </View>
          <Text style={styles.accountName}>My Portfolio</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        <View style={styles.navIcons}>
          <Pressable style={styles.navIcon}><Text style={styles.navIconText}>⌕</Text></Pressable>
          <Pressable style={styles.navIcon}><Text style={styles.navIconText}>⌗</Text></Pressable>
          <Pressable style={styles.navIcon}><Text style={styles.navIconText}>🔔</Text></Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.textSecondary}
          />
        }
      >
        <BalanceHeader
          totalValue={mockPortfolio.totalValue}
          totalGainLoss={mockPortfolio.totalGainLoss}
          totalGainLossPct={mockPortfolio.totalGainLossPct}
          dayChange={mockPortfolio.dayChange}
          dayChangePct={mockPortfolio.dayChangePct}
        />

        <View style={styles.dividerLine} />

        <View style={styles.section}>
          <ActionButtons
            actions={[
              { label: 'Add', icon: '📸', onPress: () => router.push('/add') },
              { label: 'Refresh', icon: '↻', onPress: onRefresh },
              { label: 'Analysis', icon: '🧠', onPress: () => {} },
              { label: 'Export', icon: '↗', onPress: () => {} },
            ]}
          />
        </View>

        {topConcentration && topConcentration.pct >= 50 && (
          <View style={[styles.section, styles.alertCard]}>
            <Text style={styles.alertTitle}>⚠ {topConcentration.pct.toFixed(0)}% in {topConcentration.ticker}</Text>
            <Text style={styles.alertBody}>High concentration — tap position for context.</Text>
          </View>
        )}

        <View style={styles.sectionBlock}>
          <SectionHeader title="Allocation" />
          <ConcentrationBar segments={concentrationSegments} />
        </View>

        <View style={styles.sectionBlock}>
          <SectionHeader
            title="Positions"
            action={{ label: 'Manage', onPress: () => {} }}
          />
          <View style={styles.listCard}>
            {mockPositions.map((position, i) => (
              <React.Fragment key={position.id}>
                <AssetRow
                  position={position}
                  portfolioPct={(position.value / totalValue) * 100}
                  onPress={handlePositionPress}
                />
                {i < mockPositions.length - 1 && <View style={styles.rowDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.sm,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  accountName: { ...typography.body, fontWeight: '600' },
  chevron: { color: colors.textSecondary, fontSize: 18, marginLeft: -4 },
  navIcons: { flexDirection: 'row', gap: spacing.lg },
  navIcon: { padding: 2 },
  navIconText: { fontSize: 20, color: colors.textPrimary },
  scroll: { flex: 1 },
  content: { paddingBottom: 40 },
  dividerLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginTop: spacing.sm,
  },
  section: { marginTop: spacing.xl },
  sectionBlock: { marginTop: spacing.xl, gap: spacing.sm },
  listCard: {
    backgroundColor: colors.surface1,
    borderRadius: radii.card,
    marginHorizontal: spacing.screen,
    overflow: 'hidden',
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginLeft: spacing.screen + 44 + spacing.md,
  },
  alertCard: {
    backgroundColor: colors.warningMuted,
    marginHorizontal: spacing.screen,
    borderRadius: radii.card,
    padding: spacing.card,
    gap: 4,
  },
  alertTitle: { fontSize: 14, fontWeight: '600', color: colors.warning },
  alertBody: { fontSize: 13, color: colors.textSecondary },
});
