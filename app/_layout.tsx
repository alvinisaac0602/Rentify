import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources/auth state
SplashScreen.preventAutoHideAsync().catch(() => {});

const BG = '#F8FAFC'; // matches Colors.bg — pre-fill before JS theme loads

function RootLayoutContent() {
  const { theme } = useTheme();

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} backgroundColor="transparent" translucent />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: BG },
          animation: 'fade',
          animationDuration: 180,
        }}
      >
        <Stack.Screen name="onboarding" options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
        <Stack.Screen name="property/[id]" options={{ animation: 'slide_from_right', animationDuration: 250 }} />
        <Stack.Screen name="messages/[id]" options={{ animation: 'slide_from_right', animationDuration: 250 }} />
        <Stack.Screen name="landlord/dashboard" options={{ animation: 'slide_from_right', animationDuration: 250 }} />
        <Stack.Screen name="landlord/add-property" options={{ animation: 'slide_from_right', animationDuration: 250 }} />
        <Stack.Screen name="screens/auth" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="screens/notifications" options={{ animation: 'slide_from_right', animationDuration: 250 }} />
        <Stack.Screen name="screens/filters" options={{ animation: 'slide_from_bottom', animationDuration: 220 }} />
        <Stack.Screen name="screens/legal" options={{ animation: 'slide_from_right', animationDuration: 250 }} />
        <Stack.Screen name="screens/welcome" options={{ animation: 'fade', presentation: 'modal' }} />
        <Stack.Screen name="screens/saved-confirm" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="screens/viewing-request" options={{ animation: 'slide_from_right', animationDuration: 250 }} />
        <Stack.Screen name="screens/booking" options={{ animation: 'slide_from_right', animationDuration: 250 }} />
        <Stack.Screen name="screens/fraud-warning" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="screens/booking-success" options={{ animation: 'fade' }} />
        <Stack.Screen name="screens/movers" options={{ animation: 'slide_from_right', animationDuration: 250 }} />
        <Stack.Screen name="screens/my-viewings" options={{ animation: 'slide_from_right', animationDuration: 250 }} />
        <Stack.Screen name="screens/furniture-shop" options={{ animation: 'slide_from_right', animationDuration: 250 }} />
        <Stack.Screen name="screens/furniture-detail" options={{ animation: 'slide_from_right', animationDuration: 250 }} />
        <Stack.Screen name="screens/furniture-cart" options={{ animation: 'slide_from_right', animationDuration: 250 }} />
        <Stack.Screen name="screens/furniture-receipt" options={{ animation: 'slide_from_right', animationDuration: 250 }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: BG }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <RootLayoutContent />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
