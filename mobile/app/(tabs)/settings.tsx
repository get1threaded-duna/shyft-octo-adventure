import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { colors, typography, spacing, radii } from '../../src/theme/tokens';

function SettingsRow({ label, value, onPress }: { label: string; value?: string; onPress?: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
      onPress={onPress}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PORTFOLIO</Text>
          <View style={styles.card}>
            <SettingsRow label="Currency" value="USD" />
            <View style={styles.divider} />
            <SettingsRow label="Data source" value="Yahoo Finance" />
            <View style={styles.divider} />
            <SettingsRow label="Refresh interval" value="On open" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ABOUT</Text>
          <View style={styles.card}>
            <SettingsRow label="Version" value="0.1.0" />
            <View style={styles.divider} />
            <SettingsRow label="Disclaimer" onPress={() => {}} />
          </View>
        </View>

        <Text style={styles.disclaimer}>
          Educational analysis, not investment advice. You make the decisions.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.screen, gap: spacing.xl, paddingTop: spacing.xl },
  title: { ...typography.screenTitle, marginBottom: spacing.sm },
  section: { gap: spacing.sm },
  sectionLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    letterSpacing: 0.8,
    paddingLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface1,
    borderRadius: radii.card,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.card,
    paddingVertical: spacing.md,
    minHeight: 48,
    gap: spacing.sm,
  },
  rowLabel: { ...typography.body, flex: 1 },
  rowValue: { ...typography.body, color: colors.textSecondary },
  chevron: { color: colors.textTertiary, fontSize: 18 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginLeft: spacing.card,
  },
  disclaimer: { ...typography.caption, textAlign: 'center', paddingVertical: spacing.lg },
});
