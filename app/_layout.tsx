import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="onboarding" options={{ animation: 'none', gestureEnabled: false }} />
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
            <Stack.Screen name="property/[id]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="messages/[id]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="landlord/dashboard" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="landlord/add-property" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="screens/auth" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
            <Stack.Screen name="screens/welcome" options={{ animation: 'fade', presentation: 'modal' }} />
            <Stack.Screen name="screens/saved-confirm" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
            <Stack.Screen name="screens/viewing-request" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="screens/booking" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="screens/fraud-warning" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
            <Stack.Screen name="screens/booking-success" options={{ animation: 'fade' }} />
            <Stack.Screen name="screens/movers" options={{ animation: 'slide_from_right' }} />
          </Stack>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
