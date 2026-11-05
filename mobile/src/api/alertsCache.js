import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPublicNotifications } from './adminApi';

const ALERTS_CACHE_KEY = 'medifirst_public_alerts_cache_v1';

// Load alerts: try the API first, and always keep a local cache so the
// Alerts screen + badge keep working with no internet.
export const loadAlertsWithCache = async () => {
  // 1. Show cached alerts immediately (offline-safe)
  let cached = [];
  try {
    const raw = await AsyncStorage.getItem(ALERTS_CACHE_KEY);
    if (raw) cached = JSON.parse(raw) || [];
  } catch (_) {}

  // 2. Try to refresh from the API
  try {
    const d = await getPublicNotifications();
    const list = Array.isArray(d) ? d : (d.notifications || []);
    await AsyncStorage.setItem(ALERTS_CACHE_KEY, JSON.stringify(list));
    return { list, fromCache: false };
  } catch (_) {
    // Offline / API failed → return the cached list
    return { list: cached, fromCache: true };
  }
};
