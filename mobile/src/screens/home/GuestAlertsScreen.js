import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Platform, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { setUnread, loadSeenIds, loadDismissedIds, computeUnread, markAllSeen, markOneSeen } from '../../store/notifSlice';
import { getPublicNotifications } from '../../api/adminApi';

// Same icon/color mapping as the logged-in NotificationsScreen so alerts read identically
const ALERT_TYPE_META = {
  emergency: { icon: 'warning',             color: '#e74c3c', bg: '#fdecea', label: 'EMERGENCY'   },
  alert:     { icon: 'megaphone',           color: '#e67e22', bg: '#fef5ec', label: 'ADMIN ALERT' },
  update:    { icon: 'refresh-circle',      color: '#2980b9', bg: '#eaf2fd', label: 'SYSTEM UPDATE' },
  info:      { icon: 'information-circle',  color: '#27ae60', bg: '#e8f8f5', label: 'INFO'        },
};

const formatAlertTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now  = new Date();
  const mins = Math.floor((now - date) / (1000 * 60));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export default function GuestAlertsScreen({ navigation }) {
  const dispatch = useDispatch();
  const [alerts,       setAlerts]       = useState([]);
  const [alertFilter,  setAlertFilter]  = useState('All');
  const [seenAlertIds, setSeenAlertIds] = useState([]);
  const [loading,      setLoading]      = useState(true);

  const loadAlerts = useCallback(async () => {
    try {
      const d = await getPublicNotifications();
      const list = Array.isArray(d) ? d : (d.notifications || []);
      setAlerts(list);
      const [seen, dismissed] = await Promise.all([loadSeenIds(), loadDismissedIds()]);
      setSeenAlertIds(seen);
      const visible = list.filter((n) => !dismissed.includes(n._id));
      dispatch(setUnread(computeUnread(visible, seen)));
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => { loadAlerts(); }, [loadAlerts]);
  useFocusEffect(useCallback(() => { loadAlerts(); return () => {}; }, [loadAlerts]));

  const unreadAlerts = alerts.filter(a => !seenAlertIds.includes(a._id)).length;

  const gFilteredAlerts = useMemo(() => {
    let base = alerts;
    if (alertFilter === 'Emergency') return base.filter(i => i.type === 'emergency');
    if (alertFilter === 'Alerts')    return base.filter(i => i.type === 'alert');
    if (alertFilter === 'Updates')   return base.filter(i => i.type === 'update' || i.type === 'info');
    return base;
  }, [alerts, alertFilter]);

  const markAlertsSeen = async () => {
    try {
      await markAllSeen(alerts);
      setSeenAlertIds(alerts.map(a => a._id));
      dispatch(setUnread(0));
    } catch (_) {}
  };

  const markOneAlertSeen = async (id) => {
    await markOneSeen(id);
    setSeenAlertIds(prev => [...new Set([...prev, id])]);
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      {/* ── Header (red, welcome row + filter pills) ── */}
      <SafeAreaView edges={['top']} style={s.safeArea}>
        <View style={s.header}>
          <View style={s.welcomeRow}>
            <View style={s.welcomeIconWrap}>
              <Ionicons name="notifications" size={22} color="#fff" />
              {unreadAlerts > 0 && <View style={s.activeDot} />}
            </View>
            <View style={s.welcomeInfo}>
              <Text style={s.welcomeTitle}>Alerts &amp; Notifications</Text>
              <Text style={s.welcomeSub}>Official broadcasts from MediFirst Admin</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.closeBtn} activeOpacity={0.8}>
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={s.pillsRow}>
            {['All', 'Emergency', 'Alerts', 'Updates'].map((p, i, arr) => {
              const isActive = alertFilter === p;
              return (
                <React.Fragment key={p}>
                  <TouchableOpacity style={[s.pill, isActive && s.pillActive]} onPress={() => setAlertFilter(p)} activeOpacity={0.8}>
                    <Text style={[s.pillText, isActive && s.pillTextActive]}>{p}</Text>
                  </TouchableOpacity>
                  {i < arr.length - 1 && <View style={s.pillDivider} />}
                </React.Fragment>
              );
            })}
          </View>
        </View>
      </SafeAreaView>

      {/* ── White rounded card container ── */}
      <View style={s.cardContainer}>
        <View style={s.listHeader}>
          <View style={s.adminPill}>
            <Ionicons name="shield-checkmark" size={12} color="#27ae60" />
            <Text style={s.adminPillTxt}>OFFICIAL ADMIN CHANNEL</Text>
          </View>
          {!loading && alerts.length > 0 && (
            <TouchableOpacity onPress={markAlertsSeen} style={s.markReadBtn} activeOpacity={0.7}>
              <Ionicons name="checkmark-done" size={14} color="#e74c3c" />
              <Text style={s.markReadTxt}>Mark read</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={s.loadingBox}>
              <ActivityIndicator size="large" color="#e74c3c" />
              <Text style={s.loadingText}>Loading alerts…</Text>
            </View>
          ) : gFilteredAlerts.length === 0 ? (
            <View style={s.emptyBox}>
              <View style={s.emptyIconCircle}>
                <Ionicons name="notifications-off-outline" size={36} color="#bbb" />
              </View>
              <Text style={s.emptyText}>No {alertFilter !== 'All' ? alertFilter.toLowerCase() : ''} broadcasts</Text>
              <Text style={s.emptySub}>
                {alertFilter === 'All'
                  ? 'All official broadcasts, alerts, and emergency announcements sent by the MediFirst Admin team will appear here.'
                  : `No recent announcements found under the "${alertFilter}" category.`}
              </Text>
            </View>
          ) : (
            gFilteredAlerts.map((n, i) => {
              const m = ALERT_TYPE_META[n.type] || ALERT_TYPE_META.info;
              const isUnread = !seenAlertIds.includes(n._id);
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
                      <View style={s.titleWrap}>
                        {isUnread && <View style={s.newDot} />}
                        <Text style={s.title} numberOfLines={1}>{n.title}</Text>
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
                      <Text style={s.time}>{formatAlertTime(n.createdAt)}</Text>
                    </View>
                    {isUnread && (
                      <View style={s.cardActions}>
                        <TouchableOpacity style={[s.actionBtn, s.markReadAction]} onPress={() => markOneAlertSeen(n._id)} activeOpacity={0.8}>
                          <Ionicons name="checkmark-done" size={14} color="#e74c3c" />
                          <Text style={s.markReadActionTxt}>Mark read</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}
          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f6f8' },
  safeArea: { backgroundColor: '#e74c3c' },
  header: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 55,
  },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  welcomeRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  welcomeIconWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginRight: 12, position: 'relative' },
  activeDot:       { position: 'absolute', top: 1, right: 1, width: 10, height: 10, borderRadius: 5, backgroundColor: '#2ecc71', borderWidth: 2, borderColor: '#e74c3c' },
  welcomeInfo:     { flex: 1 },
  welcomeTitle:    { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 1 },
  welcomeSub:      { fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 0, fontStyle: 'italic' },
  pillsRow:       { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingVertical: 4, paddingHorizontal: 3, alignItems: 'center' },
  pill:           { flex: 1, alignItems: 'center', paddingVertical: 5, borderRadius: 7 },
  pillActive:     { backgroundColor: '#fff' },
  pillText:       { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  pillTextActive: { color: '#e74c3c', fontWeight: '800' },
  pillDivider:    { width: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.25)' },
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
  markReadBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8 },
  markReadTxt: { fontSize: 12, color: '#e74c3c', fontWeight: '700' },
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
  titleWrap: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  title: { fontSize: 14, fontWeight: '800', flex: 1, marginRight: 8, color: '#1a1a2e' },
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
  emptyBox: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 20 },
  loadingBox: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  loadingText: { color: '#888', fontSize: 13, marginTop: 12, fontWeight: '600' },
  emptyIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#f0f4f8', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  emptyText: { textAlign: 'center', color: '#1a1a2e', fontSize: 15, fontWeight: '800' },
  emptySub: { textAlign: 'center', color: '#718096', marginTop: 4, fontSize: 12, lineHeight: 17 },
});
