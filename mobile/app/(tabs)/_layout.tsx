import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../../src/theme/tokens';

function TabIcon({ label, focused, icon }: { label: string; focused: boolean; icon: string }) {
  return (
    <View style={tabStyles.item}>
      <Text style={[tabStyles.icon, focused && tabStyles.focused]}>{icon}</Text>
      <Text style={[tabStyles.label, focused ? tabStyles.labelFocused : tabStyles.labelDim]}>
        {label}
      </Text>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  item: { alignItems: 'center', gap: 2 },
  icon: { fontSize: 22, opacity: 0.5 },
  focused: { opacity: 1 },
  label: { ...typography.tabLabel },
  labelFocused: { color: colors.primary },
  labelDim: { color: colors.textSecondary },
});

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 83,
          paddingBottom: 24,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Portfolio" icon="📊" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="markets"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Markets" icon="📈" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 52, height: 52, borderRadius: 26,
              backgroundColor: colors.primary,
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 8,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
            }}>
              <Text style={{ fontSize: 26, color: '#fff', lineHeight: 30 }}>+</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Journal" icon="📓" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Settings" icon="⚙️" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
