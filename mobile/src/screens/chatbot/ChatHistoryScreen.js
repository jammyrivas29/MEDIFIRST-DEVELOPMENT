import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Modal, SafeAreaView, StatusBar, Platform, Alert, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { runPickHistory } from './chatActions';

// Animated bottom sheet: static faded overlay + smooth slide-up sheet
function BottomSheet({ visible, onClose, children }) {
  const slide = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (visible) {
      slide.setValue(1);
      Animated.timing(slide, { toValue: 0, duration: 220, useNativeDriver: true }).start();
    }
  }, [visible, slide]);

  if (!visible) return null;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <Animated.View
          style={[s.sheet, { transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [0, 400] }) }] }]}
        >
          {children}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const HISTORY_KEY = '@medifirst_chat_history_v1';
const MAX_HISTORY = 30;

async function loadHistory() {
  try { const raw = await AsyncStorage.getItem(HISTORY_KEY); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
}
async function saveHistory(conversations) {
  try { await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(conversations.slice(0, MAX_HISTORY))); } catch {}
}

export default function ChatHistoryScreen() {
  const navigation = useNavigation();
  const [conversations, setConversations] = useState([]);
  const [menuTargetId, setMenuTargetId] = useState(null);
  const [renameTargetId, setRenameTargetId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const load = useCallback(async () => { setConversations(await loadHistory()); }, []);
  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); return () => {}; }, [load]));

  const persist = (next) => { setConversations(next); saveHistory(next); };

  const pinConversation = (id) => {
    setMenuTargetId(null);
    setConversations((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c));
      const sorted = [...next].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.updatedAt - a.updatedAt);
      saveHistory(sorted);
      return sorted;
    });
  };

  const submitRename = () => {
    const name = renameValue.trim();
    if (!name || !renameTargetId) { setRenameTargetId(null); return; }
    setConversations((prev) => {
      const next = prev.map((c) => (c.id === renameTargetId ? { ...c, title: name, titleLocked: true, updatedAt: Date.now() } : c));
      saveHistory(next);
      return next;
    });
    setRenameTargetId(null);
    setRenameValue('');
  };

  const cancelRename = () => { setRenameTargetId(null); setRenameValue(''); };

  const deleteConversation = (id) => {
    setMenuTargetId(null);
    const target = conversations.find((c) => c.id === id);
    const title = target?.title || 'New chat';
    Alert.alert(
      'Delete chat?',
      `This will delete "${title}".`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setConversations((prev) => {
              const next = prev.filter((c) => c.id !== id);
              saveHistory(next);
              return next;
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  const startRename = (id) => {
    setMenuTargetId(null);
    const convo = conversations.find((c) => c.id === id);
    setRenameTargetId(id);
    setRenameValue(convo?.title || '');
  };

  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#e74c3c' }}>
        <View>
          {Platform.OS === 'android' && <View style={{ height: StatusBar.currentHeight || 0 }} />}
          <View style={s.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.iconBtn}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Chat History</Text>
            <View style={{ width: 34 }} />
          </View>
        </View>
      </SafeAreaView>

      <FlatList
        data={conversations}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <View style={s.itemRow}>
            <TouchableOpacity
              style={s.itemLeft}
              onPress={async () => {
                runPickHistory(item.id);
                // Pop back past the Menu to return directly to the chat screen
                if (navigation.canGoBack()) {
                  try { navigation.pop(2); } catch (_) { navigation.goBack(); }
                }
              }}
              activeOpacity={0.8}
            >
              <Ionicons name={item.pinned ? 'pin' : 'chatbubble-ellipses-outline'} size={18} color={item.pinned ? '#e74c3c' : '#888'} />
              <View style={s.itemTextWrap}>
                <Text style={s.itemTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={s.itemTime}>{new Date(item.updatedAt).toLocaleString()}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMenuTargetId(item.id)} style={s.iconBtnDark}>
              <Ionicons name="ellipsis-vertical" size={20} color="#555" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={s.empty}>No past conversations yet.</Text>}
        contentContainerStyle={{ padding: 12 }}
      />

      {/* 3-dot menu bottom-sheet (static overlay + smooth slide-up) */}
      {menuTargetId && (() => {
        const item = conversations.find((c) => c.id === menuTargetId);
        if (!item) return null;
        return (
          <BottomSheet visible onClose={() => setMenuTargetId(null)}>
            <TouchableOpacity style={s.menuItem} onPress={() => pinConversation(item.id)}>
              <Ionicons name={item.pinned ? 'pin-outline' : 'pin'} size={20} color="#333" />
              <Text style={s.menuText}>{item.pinned ? 'Unpin' : 'Pin'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.menuItem} onPress={() => startRename(item.id)}>
              <Ionicons name="pencil-outline" size={20} color="#333" />
              <Text style={s.menuText}>Rename</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.menuItem} onPress={() => deleteConversation(item.id)}>
              <Ionicons name="trash-outline" size={20} color="#c0392b" />
              <Text style={[s.menuText, { color: '#c0392b' }]}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.menuItem, s.menuCancel]} onPress={() => setMenuTargetId(null)}>
              <Text style={s.menuCancelText}>Cancel</Text>
            </TouchableOpacity>
          </BottomSheet>
        );
      })()}

      {/* Rename sheet */}
      <BottomSheet visible={!!renameTargetId} onClose={cancelRename}>
        <View style={s.renameBox}>
          <Text style={s.renameTitle}>Rename chat</Text>
          <TextInput
            style={s.renameInput}
            value={renameValue}
            onChangeText={setRenameValue}
            placeholder="Chat name"
            placeholderTextColor="#999"
            autoFocus
            onSubmitEditing={submitRename}
          />
          <View style={s.renameActions}>
            <TouchableOpacity onPress={cancelRename} style={s.renameBtn}><Text style={s.renameBtnText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity onPress={submitRename} style={[s.renameBtn, s.renameBtnPrimary]}><Text style={[s.renameBtnText, s.renameBtnPrimaryText]}>Save</Text></TouchableOpacity>
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#e74c3c', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  iconBtn: { padding: 6 },
  iconBtnDark: { padding: 6 },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, elevation: 1 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  itemTextWrap: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '600', color: '#222' },
  itemTime: { fontSize: 12, color: '#999', marginTop: 2 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 14 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 8, paddingBottom: 28 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  menuText: { fontSize: 16, color: '#333', fontWeight: '600' },
  menuCancel: { marginTop: 6, borderTopWidth: 1, borderTopColor: '#eee', alignItems: 'center' },
  menuCancelText: { fontSize: 16, color: '#888', fontWeight: '700', paddingVertical: 12 },
  renameBox: { backgroundColor: '#fff', padding: 20 },
  renameTitle: { fontSize: 17, fontWeight: '700', color: '#222', marginBottom: 12 },
  renameInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: '#222' },
  renameActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
  renameBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10 },
  renameBtnText: { fontSize: 15, color: '#666', fontWeight: '600' },
  renameBtnPrimary: { backgroundColor: '#e74c3c' },
  renameBtnPrimaryText: { color: '#fff' },
});
