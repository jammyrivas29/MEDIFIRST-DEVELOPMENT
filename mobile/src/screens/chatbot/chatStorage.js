import AsyncStorage from '@react-native-async-storage/async-storage';

export const LEGACY_HISTORY_KEY = '@medifirst_chat_history_v1';
export const MAX_HISTORY = 30;

/**
 * Returns a unique storage key for chat history based on the user ID/email or guest mode.
 */
export function getUserChatKey(user, isGuest) {
  if (isGuest || !user) return '@medifirst_chat_history_v1_guest';
  const uid = user.id || user._id || (user.email ? user.email.toLowerCase().trim() : null);
  return uid ? `@medifirst_chat_history_v1_${uid}` : '@medifirst_chat_history_v1_guest';
}

/**
 * Returns a unique storage key for tracking the last opened/active conversation.
 */
export function getUserLastActiveKey(user, isGuest) {
  if (isGuest || !user) return '@medifirst_chat_last_active_v1_guest';
  const uid = user.id || user._id || (user.email ? user.email.toLowerCase().trim() : null);
  return uid ? `@medifirst_chat_last_active_v1_${uid}` : '@medifirst_chat_last_active_v1_guest';
}

/**
 * Initializes a clean, empty chat history for a newly registered account.
 */
export async function initNewUserChatHistory(user) {
  try {
    const key = getUserChatKey(user, false);
    const lastActiveKey = getUserLastActiveKey(user, false);
    await AsyncStorage.setItem(key, JSON.stringify([]));
    await AsyncStorage.removeItem(lastActiveKey);
  } catch (e) {
    console.warn('Failed to init new user chat history:', e);
  }
}

/**
 * Loads conversation history for the current user.
 * - New accounts or accounts with no history start with an empty list [].
 * - For older existing accounts that existed prior to user-scoped keys,
 *   migrates legacy conversation history into their scoped key once.
 */
export async function loadUserHistory(user, isGuest) {
  try {
    const key = getUserChatKey(user, isGuest);
    const raw = await AsyncStorage.getItem(key);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }

    // If no scoped history exists yet:
    // Only migrate legacy history if not guest and not a newly created test account
    const email = user?.email ? user.email.toLowerCase().trim() : '';
    const isNewTestAcc = email === 'jammytot@gmail.com';

    if (!isGuest && user && !isNewTestAcc) {
      const legacyRaw = await AsyncStorage.getItem(LEGACY_HISTORY_KEY);
      if (legacyRaw) {
        try {
          const parsed = JSON.parse(legacyRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            await AsyncStorage.setItem(key, legacyRaw);
            await AsyncStorage.removeItem(LEGACY_HISTORY_KEY);
            return parsed;
          }
        } catch (_) {}
      }
    }

    // Default to empty for new accounts
    await AsyncStorage.setItem(key, JSON.stringify([]));
    return [];
  } catch (e) {
    console.warn('Failed to load user history:', e);
    return [];
  }
}

/**
 * Saves conversations to the user's scoped storage.
 */
export async function saveUserHistory(user, isGuest, conversations) {
  try {
    const key = getUserChatKey(user, isGuest);
    const sliced = (conversations || []).slice(0, MAX_HISTORY);
    await AsyncStorage.setItem(key, JSON.stringify(sliced));
  } catch (e) {
    console.warn('Failed to save user history:', e);
  }
}

/**
 * Retrieves the ID of the last opened conversation for this user.
 */
export async function getLastActiveConvoId(user, isGuest) {
  try {
    const key = getUserLastActiveKey(user, isGuest);
    return await AsyncStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

/**
 * Persists the ID of the last opened conversation for this user.
 */
export async function setLastActiveConvoId(user, isGuest, convoId) {
  try {
    const key = getUserLastActiveKey(user, isGuest);
    if (convoId) {
      await AsyncStorage.setItem(key, String(convoId));
    } else {
      await AsyncStorage.removeItem(key);
    }
  } catch (e) {
    console.warn('Failed to set last active convo ID:', e);
  }
}
