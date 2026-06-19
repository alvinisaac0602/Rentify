import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WELCOME_KEY = '@rentify_welcome_shown';

export function useWelcomeModal() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(WELCOME_KEY).then(value => {
      if (!value) {
        setShouldShow(true);
      }
    });
  }, []);

  const dismiss = async () => {
    setShouldShow(false);
    await AsyncStorage.setItem(WELCOME_KEY, 'true');
  };

  return { shouldShow, dismiss };
}
