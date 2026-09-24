import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, RefreshControl, ActivityIndicator, Alert, StatusBar, Platform, SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { logout } from '../../store/authSlice';
import {
  getAdminStats, getAdminUsers, getAdminReports,
  createNotification, deleteNotification, getAdminNotifications,
  getAllGuidesAdmin, deleteGuide,
  getAdminHotlines, getSystemSettings,
} from '../../api/adminApi';

const SECTION = ({ icon, title, subtitle, onPress, badge }) => (
  <TouchableOpacity style={s.menuRow} onPress={onPress} activeOpacity={0.8}>
    <View style={[s.menuIcon, { backgroundColor: badge || '#e74c3c' }]}>
      <Ionicons name={icon} size={20} color="#fff" />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={s.menuTitle}>{title}</Text>
      {subtitle ? <Text style={s.menuSub}>{subtitle}</Text> : null}
    </View>
    <Ionicons name="chevron-forward" size={18} color="#bbb" />
  </TouchableOpacity>
);

export default function AdminHomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [guides, setGuides] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [hotlines, setHotlines] = useState([]);
  const [settings, setSettings] = useState([]);

  // Notification sender state
  const [showNotif, setShowNotif] = useState(false);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [notifType, setNotifType] = useState('emergency');
  const [sending, setSending] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [st, us, rp, gd, bc, hl, ss] = await Promise.allSettled([
        getAdminStats(), getAdminUsers(), getAdminReports(), getAllGuidesAdmin(), getAdminNotifications(),
        getAdminHotlines(), getSystemSettings(),
      ]);
      if (st.status === 'fulfilled') setStats(st.value?.data || null);
      if (us.status === 'fulfilled') setUsers(us.value?.users || []);
      if (rp.status === 'fulfilled') setReports(rp.value?.reports || []);
      if (gd.status === 'fulfilled') setGuides(gd.value?.guides || []);
      if (bc.status === 'fulfilled') setBroadcasts(bc.value?.notifications || []);
      if (hl.status === 'fulfilled') setHotlines(hl.value?.hotlines || []);
      if (ss.status === 'fulfilled') setSettings(ss.value?.settings || []);
    } catch (e) {
      // individual failures handled above; ignore aggregate
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const onRefresh = () => { setRefreshing(true); loadAll(); };

  const sendNotification = async () => {
    if (!notifTitle.trim() || !notifMsg.trim()) {
      return Alert.alert('Missing Fields', 'Title and message are required.');
    }
    try {
      setSending(true);
      await createNotification({ title: notifTitle.trim(), message: notifMsg.trim(), type: notifType });
      Alert.alert('Sent', 'Emergency alert broadcast to all users.');
      setNotifTitle(''); setNotifMsg(''); setShowNotif(false);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to send notification.');
    } finally { setSending(false); }
  };

  const handleDeleteGuide = (g) => {
    Alert.alert('Delete Guide', `Delete "${g.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try { await deleteGuide(g._id); setGuides((prev) => prev.filter((x) => x._id !== g._id)); }
          catch (e) { Alert.alert('Error', 'Could not delete guide.'); }
        },
      },
    ]);
  };

  const handleLogout = () => Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign Out', style: 'destructive', onPress: () => dispatch(logout()) },
  ]);

  const handleDeleteBroadcast = (n) => {
    Alert.alert('Delete Broadcast', `Permanently delete "${n.title}"? Users will no longer see it.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteNotification(n._id);
            setBroadcasts((prev) => prev.filter((x) => x._id !== n._id));
          } catch (e) {
            Alert.alert('Error', 'Could not delete broadcast.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={s.loadingText}>Loading admin panel…</Text>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      {/* Header */}
      <SafeAreaView style={s.header} edges={['top']}>
        {Platform.OS === 'android' && <View style={{ height: StatusBar.currentHeight || 0 }} />}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={s.avatar}>
              <Ionicons name="shield" size={22} color="#fff" />
            </View>
            <View>
              <Text style={s.hdrName}>Admin Panel</Text>
              <Text style={s.hdrEmail}>{user?.email || 'admin@medifirst.app'}</Text>
            </View>
          </View>
          <TouchableOpacity style={s.signOut} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={s.scrollPad}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        {/* ── Analytics & summary ── */}
        <Text style={s.groupLabel}>ANALYTICS & SUMMARY</Text>
        <View style={s.statRow}>
          <View style={[s.statCard, { borderColor: '#e74c3c' }]}>
            <Text style={s.statNum}>{stats?.totalUsers ?? '—'}</Text>
            <Text style={s.statLbl}>Users</Text>
          </View>
          <View style={[s.statCard, { borderColor: '#2980b9' }]}>
            <Text style={s.statNum}>{stats?.totalAdmins ?? '—'}</Text>
            <Text style={s.statLbl}>Admins</Text>
          </View>
          <View style={[s.statCard, { borderColor: '#27ae60' }]}>
            <Text style={s.statNum}>{stats?.totalGuides ?? '—'}</Text>
            <Text style={s.statLbl}>Guides</Text>
          </View>
          <View style={[s.statCard, { borderColor: '#8e44ad' }]}>
            <Text style={s.statNum}>{reports.length}</Text>
            <Text style={s.statLbl}>Reports</Text>
          </View>
        </View>

        {/* ── Your requested management features ── */}
        <Text style={s.groupLabel}>MANAGEMENT</Text>

        <SECTION
          icon="megaphone" title="Manage Emergency Alerts"
          subtitle="Broadcast push notifications to all users"
          badge="#e74c3c"
          onPress={() => setShowNotif(true)}
        />

        {/* ── Sent broadcasts list (admin can delete) ── */}
        <View style={s.bcWrap}>
          <View style={s.bcHead}>
            <Text style={s.bcHeadTitle}>Sent Broadcasts</Text>
            <Text style={s.bcHeadCount}>{broadcasts.length}</Text>
          </View>
          {broadcasts.length === 0 ? (
            <Text style={s.bcEmpty}>No broadcasts sent yet.</Text>
          ) : (
            broadcasts.map((n) => (
              <View key={n._id} style={s.bcItem}>
                <View style={s.bcItemBody}>
                  <Text style={s.bcItemTitle} numberOfLines={1}>{n.title}</Text>
                  <Text style={s.bcItemMsg} numberOfLines={2}>{n.message}</Text>
                </View>
                <TouchableOpacity style={s.bcDelBtn} onPress={() => handleDeleteBroadcast(n)} activeOpacity={0.8}>
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
        <SECTION
          icon="document-text" title="View Incident Reports"
          subtitle={`${reports.length} user-submitted report(s)`}
          badge="#8e44ad"
          onPress={() => navigation.navigate('AdminReports', { reports })}
        />
        <SECTION
          icon="bar-chart" title="First-Aid Usage Reports"
          subtitle="Per-guide view counts"
          badge="#2980b9"
          onPress={() => navigation.navigate('AdminUsage', { guides })}
        />
        <SECTION
          icon="people" title="Monitor Emergency Activity Logs"
          subtitle="Live emergency event stream"
          badge="#16a085"
          onPress={() => navigation.navigate('AdminActivity')}
        />
        <SECTION
          icon="book" title="Manage First-Aid Content"
          subtitle={`${guides.length} guides · add / edit / delete`}
          badge="#c0392b"
          onPress={() => navigation.navigate('AdminContent', { guides })}
        />
        <SECTION
          icon="medical" title="Manage Hospital Locator Data"
          subtitle="Curate hospitals & emergency facilities"
          badge="#27ae60"
          onPress={() => navigation.navigate('AdminHospitals')}
        />
        <SECTION
          icon="chatbubbles" title="Manage AI Chatbot Responses"
          subtitle="Tune first-aid answers & knowledge"
          badge="#d35400"
          onPress={() => navigation.navigate('AdminChatbot')}
        />
        <SECTION
          icon="alert-circle" title="Manage User Concerns & Reports"
          subtitle="Respond to user feedback"
          badge="#f39c12"
          onPress={() => navigation.navigate('AdminConcerns', { reports })}
        />
        <SECTION
          icon="people" title="User Management"
          subtitle={`${users.length} registered user(s)`}
          badge="#8e44ad"
          onPress={() => navigation.navigate('AdminUsers')}
        />
        <SECTION
          icon="call" title="Emergency Hotlines"
          subtitle={`${hotlines.length} hotline(s) · used by One-Tap Call`}
          badge="#e74c3c"
          onPress={() => navigation.navigate('AdminHotlines')}
        />
        <SECTION
          icon="settings" title="System Settings"
          subtitle={`${settings.length} setting(s)`}
          badge="#34495e"
          onPress={() => navigation.navigate('AdminSettings')}
        />

        <Text style={s.versionNote}>MediFirst Admin Console · v1.0.0</Text>
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* ── Notification composer sheet ── */}
      {showNotif && (
        <View style={s.sheetBackdrop}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>Broadcast Emergency Alert</Text>
            <View style={s.typeRow}>
              {['emergency', 'info', 'update', 'alert'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[s.typeChip, notifType === t && s.typeChipOn]}
                  onPress={() => setNotifType(t)}
                >
                  <Text style={[s.typeChipTxt, notifType === t && { color: '#fff' }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={s.input} placeholder="Alert title" value={notifTitle} onChangeText={setNotifTitle} />
            <TextInput style={[s.input, { height: 80 }]} placeholder="Message" value={notifMsg} onChangeText={setNotifMsg} multiline />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity style={[s.sheetBtn, { backgroundColor: '#ccc' }]} onPress={() => setShowNotif(false)}>
                <Text style={s.sheetBtnTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.sheetBtn, { backgroundColor: '#e74c3c' }]} onPress={sendNotification} disabled={sending}>
                {sending ? <ActivityIndicator color="#fff" /> : <Text style={s.sheetBtnTxt}>Send Alert</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#f5f6f8' },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#999' },

  header:     { backgroundColor: '#1a1a2e', paddingBottom: 16, paddingHorizontal: 16 },
  avatar:     { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  hdrName:    { fontSize: 17, fontWeight: '900', color: '#fff' },
  hdrEmail:   { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  signOut:    { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },

  scrollPad:   { padding: 14 },
  groupLabel: { fontSize: 10, fontWeight: '800', color: '#bbb', letterSpacing: 1.5, marginVertical: 12, marginTop: 4 },

  statRow:   { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1.5, elevation: 2 },
  statNum:  { fontSize: 22, fontWeight: '900', color: '#1a1a2e' },
  statLbl:  { fontSize: 10, color: '#999', marginTop: 4, fontWeight: '600' },

  menuRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 2 },
  menuIcon:   { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuTitle:  { fontSize: 14, fontWeight: '800', color: '#1a1a2e' },
  menuSub:    { fontSize: 11, color: '#999', marginTop: 2 },

  versionNote: { textAlign: 'center', color: '#ccc', fontSize: 11, marginTop: 18 },

  // sheet
  sheetBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  sheet:         { backgroundColor: '#fff', borderRadius: 18, padding: 18 },
  sheetTitle:    { fontSize: 16, fontWeight: '800', color: '#1a1a2e', marginBottom: 12 },
  typeRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  typeChip:      { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#e74c3c', backgroundColor: '#fff' },
  typeChipOn:    { backgroundColor: '#e74c3c' },
  typeChipTxt:   { fontSize: 12, fontWeight: '700', color: '#e74c3c' },
  input:         { borderWidth: 1.5, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#333', backgroundColor: '#fafafa', marginBottom: 10, textAlignVertical: 'top' },
  sheetBtn:      { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sheetBtnTxt:   { color: '#fff', fontWeight: '800', fontSize: 14 },

  // broadcasts list
  bcWrap:       { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 2 },
  bcHead:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  bcHeadTitle:  { fontSize: 13, fontWeight: '800', color: '#1a1a2e' },
  bcHeadCount:  { fontSize: 12, fontWeight: '800', color: '#fff', backgroundColor: '#e74c3c', paddingHorizontal: 9, paddingVertical: 2, borderRadius: 10 },
  bcEmpty:      { fontSize: 12, color: '#999', fontStyle: 'italic', paddingVertical: 6 },
  bcItem:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 10, padding: 10, marginBottom: 8 },
  bcItemBody:   { flex: 1, marginRight: 10 },
  bcItemTitle:  { fontSize: 13, fontWeight: '700', color: '#1a1a2e' },
  bcItemMsg:    { fontSize: 11, color: '#777', marginTop: 2, lineHeight: 15 },
  bcDelBtn:     { width: 36, height: 36, borderRadius: 10, backgroundColor: '#c0392b', justifyContent: 'center', alignItems: 'center' },
});
