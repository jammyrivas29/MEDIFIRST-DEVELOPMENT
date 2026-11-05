import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, StatusBar, Platform, RefreshControl,
  ActivityIndicator, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { getUserNotifications } from '../../api/adminApi';
import { setUnread, clearUnread, loadSeenIds, computeUnread, markAllSeen, markOneSeen, markOneDismissed, loadDismissedIds } from '../../store/notifSlice';

const TYPE_META = {
  emergency: { icon: 'warning', color: '#e74c3c', bg: '#fdecea', label: 'EMERGENCY' },
  alert:     { icon: 'megaphone', color: '#e67e22', bg: '#fef5ec', label: 'ADMIN ALERT' },
  update:    { icon: 'refresh-circle', color: '#2980b9', bg: '#eaf2fd', label: 'SYSTEM UPDATE' },
  info:      { icon: 'information-circle', color: '#27ae60', bg: '#e8f8f5', label: 'INFO' },
};

export default function NotificationsScreen() {
  const { isGuest } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [seenIds, setSeenIds] = useState([]);
  const [dismissedIds, setDismissedIds] = useState([]);

  // Load latest admin broadcasts
  const load = useCallback(async () => {
    try {
      const d = await getUserNotifications();
      const list = d.notifications || [];
      setItems(list);
      const [seen, dismissed] = await Promise.all([loadSeenIds(), loadDismissedIds()]);
      setSeenIds(seen);
      setDismissedIds(dismissed);
      const visible = list.filter((n) => !dismissed.includes(n._id));
      const unread = computeUnread(visible, seen);
      dispatch(setUnread(unread));
      if (unread === 0) await markAllSeen(visible);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dispatch]);

  const markSeen = useCallback(async () => {
    const list = items.length ? items : (await getUserNotifications().then(d => d.notifications || []));
    await markAllSeen(list);
    const ids = list.map((n) => n._id);
    setSeenIds(ids);
    dispatch(clearUnread());
  }, [dispatch, items]);

  // Mark a single broadcast as read
  const handleMarkRead = useCallback(async (id) => {
    await markOneSeen(id);
    const next = [...new Set([...seenIds, id])];
    setSeenIds(next);
    const visible = items.filter((n) => !dismissedIds.includes(n._id));
    dispatch(setUnread(computeUnread(visible, next)));
  }, [dispatch, seenIds, items, dismissedIds]);

  useEffect(() => {
    if (!isGuest) load();
  }, [load, isGuest]);

  useEffect(() => {
    if (!isGuest) {
      const t = setTimeout(() => markSeen(), 600);
      return () => clearTimeout(t);
    }
  }, [markSeen, isGuest, items.length]);

  // Filter list based on selected header tab
  const filteredItems = useMemo(() => {
    let base = items.filter((n) => !dismissedIds.includes(n._id));
    if (activeFilter === 'Emergency') return base.filter(i => i.type === 'emergency');
    if (activeFilter === 'Alerts') return base.filter(i => i.type === 'alert');
    if (activeFilter === 'Updates') return base.filter(i => i.type === 'update' || i.type === 'info');
    return base;
  }, [items, activeFilter, dismissedIds]);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMins = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInMins < 1440) return `${Math.floor(diffInMins / 60)}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (isGuest) {
    return (
      <View style={s.root}>
        <StatusBar barStyle="light-content" backgroundColor="#e74c3c" />
        <Header activeFilter={activeFilter} setActiveFilter={setActiveFilter} totalCount={0} />
        <View style={s.center}>
          <Ionicons name="lock-closed-outline" size={48} color="#ccc" />
          <Text style={s.empty}>Sign in to view admin broadcasts.</Text>
          <Text style={s.emptySub}>Guest accounts cannot receive real-time admin emergency broadcasts.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#e74c3c" />
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#e74c3c" />}
      >
        {/* ══════════════════════════════════════════
            HEADER CARD
        ══════════════════════════════════════════ */}
        <Header 
          activeFilter={activeFilter} 
          setActiveFilter={setActiveFilter} 
          totalCount={items.length} 
        />

        {/* ══════════════════════════════════════════
            NOTIFICATION LIST CARD
        ══════════════════════════════════════════ */}
        <View style={s.cardContainer}>
          
          {/* List Metadata Header */}
          <View style={s.listHeader}>
            <View style={s.adminPill}>
              <Ionicons name="shield-checkmark" size={12} color="#27ae60" />
              <Text style={s.adminPillTxt}>OFFICIAL ADMIN CHANNEL</Text>
            </View>
            </View>

          {loading ? (
            <View style={s.centerLoader}>
              <ActivityIndicator color="#e74c3c" size="large" />
              <Text style={s.loadingTxt}>Syncing with MediFirst Admin Channel...</Text>
            </View>
          ) : filteredItems.length === 0 ? (
            <View style={s.emptyBox}>
              <View style={s.emptyIconCircle}>
                <Ionicons name="notifications-off-outline" size={36} color="#bbb" />
              </View>
              <Text style={s.empty}>No {activeFilter !== 'All' ? activeFilter.toLowerCase() : ''} broadcasts</Text>
              <Text style={s.emptySub}>
                {activeFilter === 'All' 
                  ? 'All official broadcasts, alerts, and emergency announcements sent by the MediFirst Admin team will appear here.'
                  : `No recent announcements found under the "${activeFilter}" category.`}
              </Text>
            </View>
          ) : (
            filteredItems.map((n, i) => {
              const m = TYPE_META[n.type] || TYPE_META.info;
              const isUnread = !seenIds.includes(n._id);
              return (
                <View
                  key={n._id || i}
                  style={[s.notifCard, isUnread && { borderLeftWidth: 4, borderLeftColor: m.color, backgroundColor: m.bg }]}
                >
                  <View style={[s.iconBox, { backgroundColor: m.bg }]}>
                    <Ionicons name={m.icon} size={22} color={m.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={s.cardTopRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                        {isUnread && <View style={s.newDot} />}
                        <Text style={[s.title, { color: '#1a1a2e' }]} numberOfLines={1}>{n.title}</Text>
                      </View>
                      <View style={[s.tag, { backgroundColor: m.bg }]}>
                        <Text style={[s.tagTxt, { color: m.color }]}>{m.label}</Text>
                      </View>
                    </View>
                    <Text style={s.msg}>{n.message}</Text>
                    <View style={s.cardBottomRow}>
                      <View style={s.adminBadgeRow}>
                        <Ionicons name="shield-checkmark-sharp" size={11} color="#e74c3c" />
                        <Text style={s.adminSenderTxt}>MediFirst Admin</Text>
                      </View>
                      <Text style={s.dotSep}>•</Text>
                      <Text style={s.time}>{formatTime(n.createdAt)}</Text>
                    </View>

                    {/* NEW badge (if unread) */}
                    <View style={s.cardActions}>
                      {isUnread && (
                        <View style={s.newBadge}>
                          <Text style={s.newBadgeTxt}>NEW</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

/* ══════════════════════════════════════════
    MATCHED COMPACT HEADER
══════════════════════════════════════════ */
const Header = ({ activeFilter, setActiveFilter, totalCount }) => {
  const categories = ['All', 'Emergency', 'Alerts', 'Updates'];

  return (
    <View style={s.header}>
      <View style={s.welcomeRow}>
        <View style={s.welcomeIconWrap}>
          <Ionicons name="notifications" size={22} color="#fff" />
          {totalCount > 0 && <View style={s.activeDot} />}
        </View>
        
        <View style={s.welcomeInfo}>
          <Text style={s.welcomeTitle}>Alerts & Notifications</Text>
          <Text style={s.welcomeSub}>Official broadcasts from MediFirst Admin</Text>
        </View>
      </View>

      {/* Compact Category Filter Pills */}
      <View style={s.pillsRow}>
        {categories.map((p, i, arr) => {
          const isActive = activeFilter === p;
          return (
            <React.Fragment key={p}>
              <TouchableOpacity 
                style={[s.pill, isActive && s.pillActive]} 
                onPress={() => setActiveFilter(p)}
                activeOpacity={0.8}
              >
                <Text style={[s.pillText, isActive && s.pillTextActive]}>{p}</Text>
              </TouchableOpacity>
              {i < arr.length - 1 && <View style={s.pillDivider} />}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f6f8' },
  scroll: { flexGrow: 1, backgroundColor: '#f5f6f8' },

  // ══════ HEADER (Matches UserHomeScreen proportions) ══════
  header: {
    backgroundColor: '#e74c3c',
    paddingTop: Platform.OS === 'ios' ? 52 : (StatusBar.currentHeight || 0) + 12,
    paddingHorizontal: 16,
    paddingBottom: 14, // Compact bottom padding
  },

  welcomeRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  welcomeIconWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginRight: 12, position: 'relative' },
  activeDot:       { position: 'absolute', top: 1, right: 1, width: 10, height: 10, borderRadius: 5, backgroundColor: '#2ecc71', borderWidth: 2, borderColor: '#e74c3c' },
  welcomeInfo:     { flex: 1 },
  welcomeTitle:    { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 1 },
  welcomeSub:      { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 0, fontStyle: 'italic' },

  pillsRow:       { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingVertical: 4, paddingHorizontal: 3, alignItems: 'center' },
  pill:           { flex: 1, alignItems: 'center', paddingVertical: 5, borderRadius: 7 },
  pillActive:     { backgroundColor: '#fff' },
  pillText:       { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  pillTextActive: { color: '#e74c3c', fontWeight: '800' },
  pillDivider:    { width: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.25)' },

  // ══════ CARD CONTAINER ══════
  cardContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 18,
    flex: 1,
    minHeight: 450,
  },

  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  adminPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#eafaf1', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  adminPillTxt: { fontSize: 10, fontWeight: '800', color: '#27ae60', letterSpacing: 0.3 },
  newBadge: { backgroundColor: '#e74c3c', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  newBadgeTxt: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },

  // ══════ NOTIFICATION CARDS ══════
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#edf2f7',
    overflow: 'hidden',
  },
  newDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e74c3c', marginRight: 6 },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  title: { fontSize: 14, fontWeight: '800', flex: 1, marginRight: 8 },
  msg: { fontSize: 13, color: '#4a5568', lineHeight: 18, marginBottom: 6 },
  cardBottomRow: { flexDirection: 'row', alignItems: 'center' },
  adminBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  adminSenderTxt: { fontSize: 11, fontWeight: '700', color: '#e74c3c' },
  dotSep: { marginHorizontal: 6, color: '#ccc', fontSize: 12 },
  time: { fontSize: 11, color: '#a0aec0', fontWeight: '500' },

  cardActions: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  markReadAction: { backgroundColor: '#fdecea', borderWidth: 1, borderColor: '#f5c6c0' },
  markReadActionTxt: { fontSize: 12, fontWeight: '700', color: '#e74c3c' },

  tag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  tagTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },

  // ══════ STATES ══════
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, marginTop: 40 },
  centerLoader: { paddingVertical: 40, alignItems: 'center', gap: 10 },
  loadingTxt: { fontSize: 13, color: '#888', fontWeight: '500' },
  
  emptyBox: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 20 },
  emptyIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#f0f4f8', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  empty: { textAlign: 'center', color: '#1a1a2e', fontSize: 15, fontWeight: '800' },
  emptySub: { textAlign: 'center', color: '#718096', marginTop: 4, fontSize: 12, lineHeight: 17 },
});