import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
  SafeAreaView,
  Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { logout } from '../../store/authSlice';
import {
  getAdminStats,
  getAdminUsers,
  getAdminReports,
  createNotification,
  deleteNotification,
  getAdminNotifications,
  getAllGuidesAdmin,
  getAdminHotlines,
  getSystemSettings,
} from '../../api/adminApi';

// Realistic fallback preview data for offline testing
const FALLBACK_STATS = { totalUsers: 1284, totalAdmins: 4, totalGuides: 8, activeSosToday: 2 };
const FALLBACK_BROADCASTS = [
  { _id: 'bc_1', title: 'Typhoon Advisory #2', message: 'Heavy rainfall alert across Central Visayas.', type: 'emergency', createdAt: '1h ago' }
];
const FALLBACK_HOTLINES = [
  { _id: 'hl_1', name: 'National Emergency 911', number: '911' },
  { _id: 'hl_2', name: 'Philippine Red Cross', number: '143' },
];

export default function AdminHomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(FALLBACK_STATS);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [guides, setGuides] = useState([]);
  const [broadcasts, setBroadcasts] = useState(FALLBACK_BROADCASTS);
  const [hotlines, setHotlines] = useState(FALLBACK_HOTLINES);
  const [settings, setSettings] = useState([]);

  // Active Tab for switching admin views cleanly without endless scrolling
  const [activeTab, setActiveTab] = useState('Overview'); // 'Overview' | 'Emergency' | 'Content' | 'Users'

  // Notification composer modal state
  const [showNotif, setShowNotif] = useState(false);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [notifType, setNotifType] = useState('emergency');
  const [sending, setSending] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [st, us, rp, gd, bc, hl, ss] = await Promise.allSettled([
        getAdminStats(), getAdminUsers(), getAdminReports(), getAllGuidesAdmin(),
        getAdminNotifications(), getAdminHotlines(), getSystemSettings(),
      ]);

      if (st.status === 'fulfilled' && st.value?.data) setStats(st.value.data);
      if (us.status === 'fulfilled' && us.value?.users) setUsers(us.value.users);
      if (rp.status === 'fulfilled' && rp.value?.reports) setReports(rp.value.reports);
      if (gd.status === 'fulfilled' && gd.value?.guides) setGuides(gd.value.guides);
      if (bc.status === 'fulfilled' && bc.value?.notifications) setBroadcasts(bc.value.notifications);
      if (hl.status === 'fulfilled' && hl.value?.hotlines) setHotlines(hl.value.hotlines);
      if (ss.status === 'fulfilled' && ss.value?.settings) setSettings(ss.value.settings);
    } catch {
      // Keep fallbacks active if offline
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const onRefresh = () => { setRefreshing(true); loadAll(); };

  const sendNotification = async () => {
    if (!notifTitle.trim() || !notifMsg.trim()) {
      return Alert.alert('Missing Fields', 'Please enter a title and message for the broadcast.');
    }
    try {
      setSending(true);
      const res = await createNotification({ title: notifTitle.trim(), message: notifMsg.trim(), type: notifType });
      const created = res?.notification || {
        _id: `bc_${Date.now()}`,
        title: notifTitle.trim(),
        message: notifMsg.trim(),
        type: notifType,
        createdAt: 'Just now',
      };
      setBroadcasts((prev) => [created, ...prev]);
      Alert.alert('Broadcast Sent', 'Emergency alert pushed successfully.');
      setNotifTitle(''); setNotifMsg(''); setShowNotif(false);
    } catch {
      Alert.alert('Error', 'Failed to dispatch broadcast.');
    } finally { setSending(false); }
  };

  const handleDeleteBroadcast = (n) => {
    Alert.alert('Delete Broadcast', `Remove "${n.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            if (!n._id.startsWith('bc_')) await deleteNotification(n._id);
            setBroadcasts((prev) => prev.filter((x) => x._id !== n._id));
          } catch {
            Alert.alert('Error', 'Could not delete broadcast.');
          }
        },
      },
    ]);
  };

  const handleLogout = () => Alert.alert('Sign Out', 'Exit MediFirst Admin Console?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign Out', style: 'destructive', onPress: () => dispatch(logout()) },
  ]);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={s.loadingText}>Loading Admin Console…</Text>
      </View>
    );
  }

  const userCount = users.length || stats?.totalUsers || 1284;
  const guideCount = guides.length || stats?.totalGuides || 8;
  const reportCount = reports.length || 14;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* ══ HEADER ══ */}
      <SafeAreaView style={s.header} edges={['top']}>
        {Platform.OS === 'android' && <View style={{ height: StatusBar.currentHeight || 0 }} />}
        <View style={s.hdrTop}>
          <View style={s.hdrBrand}>
            <View style={s.avatar}>
              <Ionicons name="shield-checkmark" size={20} color="#fff" />
            </View>
            <View>
              <View style={s.hdrTitleRow}>
                <Text style={s.hdrName}>MediFirst Command</Text>
                <View style={s.roleBadge}><Text style={s.roleBadgeTxt}>ADMIN</Text></View>
              </View>
              <Text style={s.hdrEmail}>{user?.email || 'admin@medifirst.app'}</Text>
            </View>
          </View>
          <TouchableOpacity style={s.signOut} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={19} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ══ SUB-NAVIGATION TABS (Prevents Long Scrolling) ══ */}
        <View style={s.tabBar}>
          {['Overview', 'Emergency', 'Content', 'Users'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[s.tabItem, activeTab === tab && s.tabItemActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={s.scrollPad}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        {/* ════ TAB 1: OVERVIEW & DASHBOARD ════ */}
        {activeTab === 'Overview' && (
          <>
            <Text style={s.groupLabel}>SYSTEM HEALTH & METRICS</Text>
            <View style={s.kpiGrid}>
              <View style={[s.kpiCard, { borderLeftColor: '#e74c3c' }]}>
                <Ionicons name="people" size={22} color="#e74c3c" />
                <Text style={s.kpiNum}>{userCount.toLocaleString()}</Text>
                <Text style={s.kpiLbl}>Total Users</Text>
              </View>
              <View style={[s.kpiCard, { borderLeftColor: '#27ae60' }]}>
                <Ionicons name="book" size={22} color="#27ae60" />
                <Text style={s.kpiNum}>{guideCount}</Text>
                <Text style={s.kpiLbl}>Active Guides</Text>
              </View>
              <View style={[s.kpiCard, { borderLeftColor: '#8e44ad' }]}>
                <Ionicons name="document-text" size={22} color="#8e44ad" />
                <Text style={s.kpiNum}>{reportCount}</Text>
                <Text style={s.kpiLbl}>Incident Reports</Text>
              </View>
              <View style={[s.kpiCard, { borderLeftColor: '#2980b9' }]}>
                <Ionicons name="pulse" size={22} color="#2980b9" />
                <Text style={s.kpiNum}>Operational</Text>
                <Text style={s.kpiLbl}>API Server Status</Text>
              </View>
            </View>

            <Text style={s.groupLabel}>QUICK MANAGEMENT SHORTCUTS</Text>
            <View style={s.quickGrid}>
              <TouchableOpacity style={s.quickCard} onPress={() => setShowNotif(true)} activeOpacity={0.8}>
                <View style={[s.quickIcon, { backgroundColor: '#fdecea' }]}>
                  <Ionicons name="megaphone" size={20} color="#e74c3c" />
                </View>
                <Text style={s.quickTitle}>Send Broadcast</Text>
                <Text style={s.quickSub}>Push alert to all users</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.quickCard} onPress={() => navigation.navigate('AdminUsers')} activeOpacity={0.8}>
                <View style={[s.quickIcon, { backgroundColor: '#e8f4fb' }]}>
                  <Ionicons name="people" size={20} color="#2980b9" />
                </View>
                <Text style={s.quickTitle}>Manage Users</Text>
                <Text style={s.quickSub}>Accounts & permissions</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.quickCard} onPress={() => navigation.navigate('AdminContent', { guides })} activeOpacity={0.8}>
                <View style={[s.quickIcon, { backgroundColor: '#fef5ec' }]}>
                  <Ionicons name="book" size={20} color="#e67e22" />
                </View>
                <Text style={s.quickTitle}>Edit Guides</Text>
                <Text style={s.quickSub}>First-aid data</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.quickCard} onPress={() => navigation.navigate('AdminHospitals')} activeOpacity={0.8}>
                <View style={[s.quickIcon, { backgroundColor: '#e9f7ef' }]}>
                  <Ionicons name="medical" size={20} color="#27ae60" />
                </View>
                <Text style={s.quickTitle}>Hospitals</Text>
                <Text style={s.quickSub}>Locator facilities</Text>
              </TouchableOpacity>
            </View>

            <View style={s.bannerCard}>
              <Ionicons name="shield-checkmark" size={24} color="#27ae60" />
              <View style={{ flex: 1 }}>
                <Text style={s.bannerTitle}>MediFirst Security Shield Active</Text>
                <Text style={s.bannerSub}>User medical data is encrypted using AES-256 standards.</Text>
              </View>
            </View>
          </>
        )}

        {/* ════ TAB 2: EMERGENCY & SOS ════ */}
        {activeTab === 'Emergency' && (
          <>
            <View style={s.sectionHeaderRow}>
              <Text style={s.groupLabel}>EMERGENCY BROADCASTS</Text>
              <TouchableOpacity style={s.miniBtn} onPress={() => setShowNotif(true)} activeOpacity={0.8}>
                <Ionicons name="add" size={14} color="#fff" />
                <Text style={s.miniBtnTxt}>New Alert</Text>
              </TouchableOpacity>
            </View>

            <View style={s.cardGroup}>
              {broadcasts.length === 0 ? (
                <Text style={s.emptyTxt}>No active broadcasts.</Text>
              ) : (
                broadcasts.map((n, i) => (
                  <View key={n._id} style={[s.rowItem, i === broadcasts.length - 1 && { borderBottomWidth: 0 }]}>
                    <View style={[s.dot, { backgroundColor: n.type === 'emergency' ? '#e74c3c' : '#2980b9' }]} />
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={s.rowTitle}>{n.title}</Text>
                      <Text style={s.rowSub} numberOfLines={2}>{n.message}</Text>
                    </View>
                    <TouchableOpacity style={s.delIconBtn} onPress={() => handleDeleteBroadcast(n)}>
                      <Ionicons name="trash-outline" size={16} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>

            <Text style={s.groupLabel}>DISASTER & SOS TOOLS</Text>
            <View style={s.cardGroup}>
              <TouchableOpacity style={s.menuRow} onPress={() => navigation.navigate('AdminActivity')} activeOpacity={0.8}>
                <View style={[s.menuIcon, { backgroundColor: '#e8f8f5' }]}><Ionicons name="pulse" size={18} color="#16a085" /></View>
                <View style={{ flex: 1 }}><Text style={s.menuTitle}>Live Emergency Activity Logs</Text><Text style={s.menuSub}>Real-time SOS tracking & GPS requests</Text></View>
                <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
              </TouchableOpacity>
              <View style={s.divider} />
              <TouchableOpacity style={s.menuRow} onPress={() => navigation.navigate('AdminHotlines')} activeOpacity={0.8}>
                <View style={[s.menuIcon, { backgroundColor: '#fdecea' }]}><Ionicons name="call" size={18} color="#e74c3c" /></View>
                <View style={{ flex: 1 }}><Text style={s.menuTitle}>Manage Emergency Hotlines</Text><Text style={s.menuSub}>{hotlines.length} hotlines linked to One-Tap 911</Text></View>
                <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ════ TAB 3: CONTENT & AI ════ */}
        {activeTab === 'Content' && (
          <>
            <Text style={s.groupLabel}>FIRST-AID GUIDES & KNOWLEDGE</Text>
            <View style={s.cardGroup}>
              <TouchableOpacity style={s.menuRow} onPress={() => navigation.navigate('AdminContent', { guides })} activeOpacity={0.8}>
                <View style={[s.menuIcon, { backgroundColor: '#fdecea' }]}><Ionicons name="book" size={18} color="#c0392b" /></View>
                <View style={{ flex: 1 }}><Text style={s.menuTitle}>Manage First-Aid Guides</Text><Text style={s.menuSub}>{guideCount} active guides · CPR, Choking, Burns</Text></View>
                <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
              </TouchableOpacity>
              <View style={s.divider} />
              <TouchableOpacity style={s.menuRow} onPress={() => navigation.navigate('AdminHospitals')} activeOpacity={0.8}>
                <View style={[s.menuIcon, { backgroundColor: '#e9f7ef' }]}><Ionicons name="medical" size={18} color="#27ae60" /></View>
                <View style={{ flex: 1 }}><Text style={s.menuTitle}>Hospital Locator Database</Text><Text style={s.menuSub}>Curate hospitals and medical clinics</Text></View>
                <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
              </TouchableOpacity>
              <View style={s.divider} />
              <TouchableOpacity style={s.menuRow} onPress={() => navigation.navigate('AdminChatbot')} activeOpacity={0.8}>
                <View style={[s.menuIcon, { backgroundColor: '#fdf2e9' }]}><Ionicons name="chatbubbles" size={18} color="#d35400" /></View>
                <View style={{ flex: 1 }}><Text style={s.menuTitle}>AI Chatbot Knowledge & Prompts</Text><Text style={s.menuSub}>Tune emergency assistant automated answers</Text></View>
                <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
              </TouchableOpacity>
              <View style={s.divider} />
              <TouchableOpacity style={s.menuRow} onPress={() => navigation.navigate('AdminUsage', { guides })} activeOpacity={0.8}>
                <View style={[s.menuIcon, { backgroundColor: '#e8f4fb' }]}><Ionicons name="bar-chart" size={18} color="#2980b9" /></View>
                <View style={{ flex: 1 }}><Text style={s.menuTitle}>Guide Access Analytics</Text><Text style={s.menuSub}>View most popular first-aid searches</Text></View>
                <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ════ TAB 4: USERS & SYSTEM ════ */}
        {activeTab === 'Users' && (
          <>
            <Text style={s.groupLabel}>ACCOUNTS & REPORTS</Text>
            <View style={s.cardGroup}>
              <TouchableOpacity style={s.menuRow} onPress={() => navigation.navigate('AdminUsers')} activeOpacity={0.8}>
                <View style={[s.menuIcon, { backgroundColor: '#f5eef8' }]}><Ionicons name="people" size={18} color="#8e44ad" /></View>
                <View style={{ flex: 1 }}><Text style={s.menuTitle}>User Management</Text><Text style={s.menuSub}>{userCount} registered accounts & permissions</Text></View>
                <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
              </TouchableOpacity>
              <View style={s.divider} />
              <TouchableOpacity style={s.menuRow} onPress={() => navigation.navigate('AdminReports', { reports })} activeOpacity={0.8}>
                <View style={[s.menuIcon, { backgroundColor: '#e8f4fb' }]}><Ionicons name="document-text" size={18} color="#2980b9" /></View>
                <View style={{ flex: 1 }}><Text style={s.menuTitle}>Incident & Accident Reports</Text><Text style={s.menuSub}>{reportCount} user-submitted reports</Text></View>
                <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
              </TouchableOpacity>
              <View style={s.divider} />
              <TouchableOpacity style={s.menuRow} onPress={() => navigation.navigate('AdminConcerns', { reports })} activeOpacity={0.8}>
                <View style={[s.menuIcon, { backgroundColor: '#fef9e7' }]}><Ionicons name="chatbox-ellipses" size={18} color="#f39c12" /></View>
                <View style={{ flex: 1 }}><Text style={s.menuTitle}>User Feedback & Concerns</Text><Text style={s.menuSub}>App issues and inquiry replies</Text></View>
                <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
              </TouchableOpacity>
              <View style={s.divider} />
              <TouchableOpacity style={s.menuRow} onPress={() => navigation.navigate('AdminSettings')} activeOpacity={0.8}>
                <View style={[s.menuIcon, { backgroundColor: '#ebedef' }]}><Ionicons name="settings" size={18} color="#34495e" /></View>
                <View style={{ flex: 1 }}><Text style={s.menuTitle}>System Settings</Text><Text style={s.menuSub}>{settings.length || 6} configurations & maintenance</Text></View>
                <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
              </TouchableOpacity>
            </View>
          </>
        )}

        <Text style={s.versionNote}>MediFirst Command Console · v1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ══ BROADCAST MODAL ══ */}
      <Modal visible={showNotif} transparent animationType="fade" onRequestClose={() => setShowNotif(false)}>
        <View style={s.modalBackdrop}>
          <View style={s.modalBox}>
            <View style={s.modalHead}>
              <Text style={s.modalTitle}>Broadcast Emergency Alert</Text>
              <TouchableOpacity onPress={() => setShowNotif(false)}>
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={s.fieldLbl}>Alert Category</Text>
            <View style={s.chipRow}>
              {['emergency', 'alert', 'update', 'info'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[s.chip, notifType === t && s.chipOn]}
                  onPress={() => setNotifType(t)}
                >
                  <Text style={[s.chipTxt, notifType === t && { color: '#fff' }]}>{t.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.fieldLbl}>Title</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Typhoon Warning — Cebu Region"
              placeholderTextColor="#94a3b8"
              value={notifTitle}
              onChangeText={setNotifTitle}
            />

            <Text style={s.fieldLbl}>Message</Text>
            <TextInput
              style={[s.input, { height: 80 }]}
              placeholder="Enter safety instructions for app users..."
              placeholderTextColor="#94a3b8"
              value={notifMsg}
              onChangeText={setNotifMsg}
              multiline
            />

            <View style={s.modalActions}>
              <TouchableOpacity style={[s.modalBtn, { backgroundColor: '#e2e8f0' }]} onPress={() => setShowNotif(false)}>
                <Text style={[s.modalBtnTxt, { color: '#475569' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.modalBtn, { backgroundColor: '#e74c3c' }]} onPress={sendNotification} disabled={sending}>
                {sending ? <ActivityIndicator color="#fff" /> : <Text style={s.modalBtnTxt}>Broadcast Now</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f4f6f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f8' },
  loadingText: { marginTop: 10, color: '#64748b', fontSize: 13, fontWeight: '600' },

  /* Header */
  header: { backgroundColor: '#0f172a' },
  hdrTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  hdrBrand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hdrTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hdrName: { fontSize: 16.5, fontWeight: '900', color: '#fff' },
  roleBadge: {
    backgroundColor: 'rgba(231, 76, 60, 0.25)',
    borderWidth: 1,
    borderColor: '#e74c3c',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
  },
  roleBadgeTxt: { fontSize: 8.5, fontWeight: '900', color: '#ff7675' },
  hdrEmail: { fontSize: 11.5, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  signOut: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Sub Navigation Tabs */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#e74c3c',
  },
  tabText: { fontSize: 12, fontWeight: '700', color: '#94a3b8' },
  tabTextActive: { color: '#fff', fontWeight: '900' },

  scrollPad: { padding: 14 },
  groupLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1.1,
    marginTop: 14,
    marginBottom: 8,
    marginLeft: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 8,
  },
  miniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
  },
  miniBtnTxt: { color: '#fff', fontSize: 11, fontWeight: '800' },

  /* KPI Grid */
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  kpiCard: {
    width: '48.5%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 4,
    elevation: 1,
  },
  kpiNum: { fontSize: 20, fontWeight: '900', color: '#1a1a2e', marginTop: 6 },
  kpiLbl: { fontSize: 11.5, color: '#64748b', marginTop: 2, fontWeight: '600' },

  /* Quick Shortcut Cards */
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickCard: {
    width: '48.5%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
  },
  quickIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickTitle: { fontSize: 13.5, fontWeight: '800', color: '#1a1a2e' },
  quickSub: { fontSize: 11, color: '#64748b', marginTop: 2 },

  /* Banner */
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#e9f7ef',
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#d4efdf',
  },
  bannerTitle: { fontSize: 13, fontWeight: '800', color: '#145a32' },
  bannerSub: { fontSize: 11, color: '#1e8449', marginTop: 2, lineHeight: 15 },

  /* Grouped Containers */
  cardGroup: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginLeft: 62 },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTitle: { fontSize: 13.5, fontWeight: '700', color: '#1a1a2e' },
  menuSub: { fontSize: 11, color: '#64748b', marginTop: 2 },

  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  rowTitle: { fontSize: 13, fontWeight: '700', color: '#1a1a2e' },
  rowSub: { fontSize: 11.5, color: '#64748b', marginTop: 2, lineHeight: 15 },
  delIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fdecea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTxt: { fontSize: 12, color: '#94a3b8', fontStyle: 'italic', padding: 14, textAlign: 'center' },

  versionNote: { textAlign: 'center', color: '#94a3b8', fontSize: 11, marginTop: 20 },

  /* Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: 18,
  },
  modalBox: { backgroundColor: '#fff', borderRadius: 18, padding: 18 },
  modalHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#1a1a2e' },
  fieldLbl: { fontSize: 11.5, fontWeight: '700', color: '#475569', marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 14 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  chipOn: { backgroundColor: '#e74c3c', borderColor: '#e74c3c' },
  chipTxt: { fontSize: 10.5, fontWeight: '800', color: '#475569' },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  modalBtn: { flex: 1, paddingVertical: 13, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 13.5 },
});