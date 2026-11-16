import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SEEN_KEY = 'medifirst_seen_alert_ids';
const GUEST_SEEN_KEY = 'medifirst_guest_seen_alert_ids';

const initialState = {
  unread: 0,
};

const notifSlice = createSlice({
  name: 'notif',
  initialState,
  reducers: {
    setUnread(state, action) {
      state.unread = action.payload;
    },
    clearUnread(state) {
      state.unread = 0;
    },
  },
});

export const { setUnread, clearUnread } = notifSlice.actions;

// ── helpers (persist seen IDs in AsyncStorage so badge survives reload) ──
const DISMISSED_KEY = 'medifirst_dismissed_alert_ids';

export const loadSeenIds = async () => {
  try {
    const raw = await AsyncStorage.getItem(SEEN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const loadGuestSeenIds = async () => {
  try {
    const raw = await AsyncStorage.getItem(GUEST_SEEN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const loadDismissedIds = async () => {
  try {
    const raw = await AsyncStorage.getItem(DISMISSED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const computeUnread = (items, seenIds) => {
  const seen = new Set(seenIds);
  return items.filter((n) => !seen.has(n._id)).length;
};

export const markAllSeen = async (items) => {
  try {
    const ids = items.map((n) => n._id);
    await AsyncStorage.setItem(SEEN_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
};

export const markGuestAllSeen = async (items) => {
  try {
    const ids = items.map((n) => n._id);
    await AsyncStorage.setItem(GUEST_SEEN_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
};

export const markOneSeen = async (id) => {
  try {
    const ids = await loadSeenIds();
    if (!ids.includes(id)) {
      ids.push(id);
      await AsyncStorage.setItem(SEEN_KEY, JSON.stringify(ids));
    }
  } catch {
    // ignore
  }
};

export const markGuestOneSeen = async (id) => {
  try {
    const ids = await loadGuestSeenIds();
    if (!ids.includes(id)) {
      ids.push(id);
      await AsyncStorage.setItem(GUEST_SEEN_KEY, JSON.stringify(ids));
    }
  } catch {
    // ignore
  }
};

export const markOneDismissed = async (id) => {
  try {
    const ids = await loadDismissedIds();
    if (!ids.includes(id)) {
      ids.push(id);
      await AsyncStorage.setItem(DISMISSED_KEY, JSON.stringify(ids));
    }
  } catch {
    // ignore
  }
};

export default notifSlice.reducer;
