import { Stack } from 'expo-router';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000' } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="position/[ticker]"
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
            headerBackTitleVisible: false,
            headerTitle: '',
          }}
        />
      </Stack>
    </View>
  );
}
