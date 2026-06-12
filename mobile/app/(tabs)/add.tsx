import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView,
} from 'react-native';
import { colors, typography, spacing, radii } from '../../src/theme/tokens';
import { Button } from '../../src/components/Button';

export default function AddScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Add Positions</Text>
        <Text style={styles.sub}>Upload a brokerage screenshot or enter manually</Text>

        <Pressable style={styles.uploadBox}>
          <Text style={styles.uploadIcon}>📸</Text>
          <Text style={styles.uploadLabel}>Upload Screenshot</Text>
          <Text style={styles.uploadHint}>Cash App, Robinhood, Fidelity, and more</Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLabel}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button label="Enter Manually" onPress={() => {}} variant="secondary" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.screen, gap: spacing.xl, paddingTop: spacing.xxl },
  title: { ...typography.screenTitle },
  sub: { ...typography.body, color: colors.textSecondary },
  uploadBox: {
    backgroundColor: colors.surface1,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.surface3,
    borderStyle: 'dashed',
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  uploadIcon: { fontSize: 40 },
  uploadLabel: { ...typography.sectionHeader },
  uploadHint: { ...typography.caption, textAlign: 'center' },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.surface3 },
  dividerLabel: { ...typography.caption },
});
