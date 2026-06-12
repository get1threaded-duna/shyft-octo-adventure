import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radii } from '../theme/tokens';

interface ActionButton {
  label: string;
  icon: string;
  onPress: () => void;
  disabled?: boolean;
}

interface Props {
  actions: ActionButton[];
}

export function ActionButtons({ actions }: Props) {
  return (
    <View style={styles.row}>
      {actions.map((action) => (
        <Pressable
          key={action.label}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            action.onPress();
          }}
          disabled={action.disabled}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.pressed,
            action.disabled && styles.disabled,
          ]}
        >
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>{action.icon}</Text>
          </View>
          <Text style={styles.label}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screen,
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.4 },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radii.button,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  label: {
    ...typography.caption,
    color: colors.textPrimary,
  },
});
