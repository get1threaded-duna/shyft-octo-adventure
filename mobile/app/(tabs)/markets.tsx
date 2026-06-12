import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors, typography, spacing } from '../../src/theme/tokens';

export default function MarketsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Markets</Text>
        <Text style={styles.sub}>Watchlist & scanner — coming in v0.5</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  title: { ...typography.screenTitle },
  sub: { ...typography.body, color: colors.textSecondary },
});
