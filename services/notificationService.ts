import { Platform } from 'react-native';
import { saveUserPushToken } from './firebaseServices';

/**
 * Returns true when running inside Expo Go (where remote push notifications
 * are NOT supported on SDK 53+). We check both the legacy `appOwnership`
 * flag and the SDK 53+ `executionEnvironment === 'storeClient'` value.
 *
 * IMPORTANT: We must NOT call require('expo-notifications') at all in Expo Go
 * because the module auto-registers a push token listener as a side-effect on
 * import, which produces a visible ERROR log in SDK 53+.
 */
function isExpoGo(): boolean {
  try {
    const Constants = require('expo-constants').default;
    // SDK 53+: executionEnvironment === 'storeClient' means Expo Go
    if (Constants?.executionEnvironment === 'storeClient') return true;
    // Legacy check (SDK < 53)
    if (Constants?.appOwnership === 'expo') return true;
  } catch (_) {
    // expo-constants not available — assume production/dev build
  }
  return false;
}

export async function registerForPushNotificationsAsync(userId?: string): Promise<string | null> {
  // Push notifications are not supported on web
  if (Platform.OS === 'web') return null;

  // ── Expo Go guard ─────────────────────────────────────────────────────────
  // Return early with a dummy token. Do NOT touch expo-notifications here.
  if (isExpoGo()) {
    const dummyToken = `expo-go-dummy-${userId ?? 'guest'}`;
    if (userId) {
      try {
        await saveUserPushToken(userId, dummyToken);
      } catch (_) {
        // Non-fatal — Firestore may not be ready yet
      }
    }
    console.log(
      '[Notifications] Expo Go detected — remote push is not supported on SDK 53+. ' +
      'Using dummy token. Switch to a Development Build for real push notifications.'
    );
    return dummyToken;
  }

  // ── Production / Development Build ────────────────────────────────────────
  try {
    // expo-notifications is only safe to import outside Expo Go
    const Notifications = require('expo-notifications');
    const Constants = require('expo-constants').default;

    // Show notifications while the app is foregrounded
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Notifications] Permission denied — no push token registered.');
      return null;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId || undefined,
    });
    const token: string = tokenData.data;

    if (userId && token) {
      await saveUserPushToken(userId, token);
    }

    return token;
  } catch (error) {
    console.log('[Notifications] Failed to register for push notifications:', error);
    return null;
  }
}
