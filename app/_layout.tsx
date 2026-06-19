import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../context/AuthContext';
import { AuthModal } from '../components/modals/AuthModal';

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
          </Stack>
          <AuthModal />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
