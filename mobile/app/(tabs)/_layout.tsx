import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../src/theme/tokens';

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  if (focused) {
    return (
      <View style={tabStyles.activeCircle}>
        <Text style={tabStyles.activeIcon}>{icon}</Text>
      </View>
    );
  }
  return <Text style={tabStyles.icon}>{icon}</Text>;
}

const tabStyles = StyleSheet.create({
  activeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.tabBarActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIcon: { fontSize: 20 },
  icon: { fontSize: 22, opacity: 0.55 },
});

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 83,
          paddingBottom: 24,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="⌂" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="markets"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="◎" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={addStyles.circle}>
              <Text style={addStyles.plus}>+</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="☰" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="▣" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const addStyles = StyleSheet.create({
  circle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  plus: { fontSize: 28, color: '#fff', lineHeight: 32 },
});
