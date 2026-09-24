import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Platform, TextInput, ActivityIndicator, Alert, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import {
  getAdminActivity, getHospitals, createHospital, updateHospital, deleteHospital,
  getChatbotResponses, createChatbotResponse, updateChatbotResponse, deleteChatbotResponse,
  deleteGuide, getAdminUsers, setUserActive, getAdminHotlines, createHotline, updateHotline, deleteHotline,
  getSystemSettings, updateSystemSetting,
} from '../../api/adminApi';

// ── Reusable header ──
const Header = ({ title, onBack }) => (
  <SafeAreaView style={hStyles.bar} edges={['top']}>
    <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
    {Platform.OS === 'android' && <View style={{ height: StatusBar.currentHeight || 0 }} />}
    <TouchableOpacity onPress={onBack} style={hStyles.back}>
      <Ionicons name="chevron-back" size={22} color="#fff" />
    </TouchableOpacity>
    <Text style={hStyles.title}>{title}</Text>
    <View style={{ width: 36 }} />
  </SafeAreaView>
);
const hStyles = StyleSheet.create({
  bar:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a2e', paddingBottom: 14, paddingHorizontal: 8 },
  back:   { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },
  title:  { flex: 1, textAlign: 'center', color: '#fff', fontSize: 16, fontWeight: '800' },
});

const Card = ({ title, subtitle, right }) => (
  <View style={gStyles.card}>
    <View style={{ flex: 1 }}>
      <Text style={gStyles.cardTitle}>{title}</Text>
      {subtitle ? <Text style={gStyles.cardSub}>{subtitle}</Text> : null}
    </View>
    {right}
  </View>
);
const gStyles = StyleSheet.create({
  card:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 2 },
  cardTitle:{ fontSize: 14, fontWeight: '800', color: '#1a1a2e' },
  cardSub:  { fontSize: 11, color: '#999', marginTop: 3 },
});

// ════════════════════════════════════════════════════════════════════════════
// 1. VIEW INCIDENT / USER CONCERNS & REPORTS (backed by /admin/reports)
// ════════════════════════════════════════════════════════════════════════════
export function AdminReports({ navigation, route }) {
  const reports = route.params?.reports || [];
  return (
    <View style={scr.root}>
      <Header title="Incident & Concern Reports" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={scr.pad}>
        {reports.length === 0
          ? <Text style={scr.empty}>No reports submitted yet.</Text>
          : reports.map((r, i) => (
            <Card
              key={r._id || i}
              title={r.subject || r.type || 'Report'}
              subtitle={`${r.type || ''} · ${r.message || ''}`.slice(0, 90)}
              right={<View style={[scr.badge, { backgroundColor: r.status === 'new' ? '#e74c3c' : '#27ae60' }]}><Text style={scr.badgeTxt}>{r.status || 'new'}</Text></View>}
            />
          ))
        }
      </ScrollView>
    </View>
  );
}

export function AdminConcerns({ navigation, route }) {
  const reports = route.params?.reports || [];
  const feedback = reports.filter((r) => (r.type || 'feedback') === 'feedback');
  return (
    <View style={scr.root}>
      <Header title="User Concerns & Feedback" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={scr.pad}>
        {feedback.length === 0
          ? <Text style={scr.empty}>No user concerns submitted yet.</Text>
          : feedback.map((r, i) => (
            <Card key={r._id || i} title={r.subject || 'Feedback'} subtitle={(r.message || '').slice(0, 100)} />
          ))
        }
      </ScrollView>
    </View>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2. FIRST-AID USAGE REPORTS (backed by guide viewCount)
// ════════════════════════════════════════════════════════════════════════════
export function AdminUsage({ navigation, route }) {
  const guides = route.params?.guides || [];
  const sorted = [...guides].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
  return (
    <View style={scr.root}>
      <Header title="First-Aid Usage" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={scr.pad}>
        {sorted.length === 0
          ? <Text style={scr.empty}>No usage data available.</Text>
          : sorted.map((g, i) => (
            <Card key={g._id || i} title={g.title} subtitle={`Category: ${g.category}`} right={<Text style={scr.views}>{g.viewCount || 0} views</Text>} />
          ))
        }
      </ScrollView>
    </View>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3. MANAGE FIRST-AID CONTENT (backed by /first-aid GET; delete supported)
// ════════════════════════════════════════════════════════════════════════════
export function AdminContent({ navigation, route }) {
  const [guides, setGuides] = React.useState(route.params?.guides || []);
  const remove = (g) => Alert.alert('Delete Guide', `Delete "${g.title}"?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => {
      try { await deleteGuide(g._id); setGuides((p) => p.filter((x) => x._id !== g._id)); }
      catch { Alert.alert('Error', 'Delete failed.'); }
    } },
  ]);
  return (
    <View style={scr.root}>
      <Header title="First-Aid Content" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={scr.pad}>
        <Text style={scr.note}>Add / edit requires backend endpoints (create/update). Delete is supported.</Text>
        {guides.length === 0
          ? <Text style={scr.empty}>No guides found.</Text>
          : guides.map((g, i) => (
            <Card
              key={g._id || i}
              title={g.title}
              subtitle={`${g.category} · ${g.severity || ''}`}
              right={<TouchableOpacity style={scr.delBtn} onPress={() => remove(g)}><Ionicons name="trash-outline" size={18} color="#e74c3c" /></TouchableOpacity>}
            />
          ))
        }
      </ScrollView>
    </View>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4. EMERGENCY ACTIVITY LOGS (LIVE: /admin/activity)
// ════════════════════════════════════════════════════════════════════════════
export function AdminActivity({ navigation }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try { const d = await getAdminActivity(); setLogs(d.logs || []); }
    catch { /* ignore */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  if (loading) return (<View style={scr.root}><Header title="Emergency Activity Logs" onBack={() => navigation.goBack()} /><View style={scr.center}><ActivityIndicator color="#e74c3c" /></View></View>);
  return (
    <View style={scr.root}>
      <Header title="Emergency Activity Logs" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={scr.pad}>
        {logs.length === 0
          ? <Text style={scr.empty}>No activity logged yet.</Text>
          : logs.map((l, i) => (
            <Card key={l._id || i} title={l.description || l.action} subtitle={`${l.category} · ${new Date(l.createdAt).toLocaleString()}`} />
          ))
        }
      </ScrollView>
    </View>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 5. HOSPITAL LOCATOR DATA (LIVE: /hospitals)
// ════════════════════════════════════════════════════════════════════════════
export function AdminHospitals({ navigation }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { const d = await getHospitals(); setList(d.hospitals || []); }
    catch { /* ignore */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!name.trim()) return Alert.alert('Missing', 'Hospital name required.');
    try {
      setSaving(true);
      await createHospital({ name: name.trim(), city: city.trim(), phone: phone.trim(), type: 'hospital', emergencyRoom: true });
      setName(''); setCity(''); setPhone('');
      await load();
    } catch { Alert.alert('Error', 'Could not add hospital.'); } finally { setSaving(false); }
  };
  const remove = (h) => Alert.alert('Delete', `Delete "${h.name}"?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => { try { await deleteHospital(h._id); setList((p) => p.filter((x) => x._id !== h._id)); } catch { Alert.alert('Error'); } } },
  ]);

  if (loading) return (<View style={scr.root}><Header title="Hospital Data" onBack={() => navigation.goBack()} /><View style={scr.center}><ActivityIndicator color="#e74c3c" /></View></View>);
  return (
    <View style={scr.root}>
      <Header title="Hospital Locator Data" onBack={() => navigation.goBack()} />
      <View style={scr.formBox}>
        <Text style={scr.note}>Add a hospital / emergency facility</Text>
        <TextInput style={scr.input} placeholder="Name" value={name} onChangeText={setName} />
        <TextInput style={scr.input} placeholder="City" value={city} onChangeText={setCity} />
        <TextInput style={scr.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TouchableOpacity style={scr.addBtn} onPress={add} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={scr.addBtnTxt}>Add Hospital</Text>}
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={scr.pad}>
        {list.length === 0
          ? <Text style={scr.empty}>No hospitals in the directory yet.</Text>
          : list.map((h, i) => (
            <Card key={h._id || i} title={h.name} subtitle={`${h.city || ''} · ${h.phone || 'no phone'}`}
              right={<TouchableOpacity style={scr.delBtn} onPress={() => remove(h)}><Ionicons name="trash-outline" size={18} color="#e74c3c" /></TouchableOpacity>} />
          ))
        }
      </ScrollView>
    </View>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 6. AI CHATBOT RESPONSES (LIVE: /chatbot/admin)
// ════════════════════════════════════════════════════════════════════════════
export function AdminChatbot({ navigation }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [intent, setIntent] = useState('');
  const [answer, setAnswer] = useState('');
  const [keywords, setKeywords] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { const d = await getChatbotResponses(); setList(d.responses || []); }
    catch { /* ignore */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!intent.trim() || !answer.trim()) return Alert.alert('Missing', 'Intent and answer required.');
    try {
      setSaving(true);
      await createChatbotResponse({ intent: intent.trim(), answer: answer.trim(), keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean) });
      setIntent(''); setAnswer(''); setKeywords('');
      await load();
    } catch (e) { Alert.alert('Error', e?.response?.data?.message || 'Could not add response.'); } finally { setSaving(false); }
  };
  const remove = (c) => Alert.alert('Delete', `Delete intent "${c.intent}"?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => { try { await deleteChatbotResponse(c._id); setList((p) => p.filter((x) => x._id !== c._id)); } catch { Alert.alert('Error'); } } },
  ]);

  if (loading) return (<View style={scr.root}><Header title="AI Chatbot Responses" onBack={() => navigation.goBack()} /><View style={scr.center}><ActivityIndicator color="#e74c3c" /></View></View>);
  return (
    <View style={scr.root}>
      <Header title="AI Chatbot Responses" onBack={() => navigation.goBack()} />
      <View style={scr.formBox}>
        <Text style={scr.note}>Add a first-aid response (keyword-triggered)</Text>
        <TextInput style={scr.input} placeholder="Intent (e.g. cpr)" value={intent} onChangeText={setIntent} autoCapitalize="none" />
        <TextInput style={scr.input} placeholder="Keywords (comma separated)" value={keywords} onChangeText={setKeywords} autoCapitalize="none" />
        <TextInput style={[scr.input, { height: 70 }]} placeholder="Answer" value={answer} onChangeText={setAnswer} multiline />
        <TouchableOpacity style={scr.addBtn} onPress={add} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={scr.addBtnTxt}>Add Response</Text>}
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={scr.pad}>
        {list.length === 0
          ? <Text style={scr.empty}>No chatbot responses configured yet.</Text>
          : list.map((c, i) => (
            <Card key={c._id || i} title={c.intent} subtitle={(c.answer || '').slice(0, 70)}
              right={<TouchableOpacity style={scr.delBtn} onPress={() => remove(c)}><Ionicons name="trash-outline" size={18} color="#e74c3c" /></TouchableOpacity>} />
          ))
        }
      </ScrollView>
    </View>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 7. USER MANAGEMENT (LIVE: /admin/users)
// ════════════════════════════════════════════════════════════════════════════
export function AdminUsers({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try { const d = await getAdminUsers(); setUsers(d.users || []); } catch { /* ignore */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const toggle = (u) => Alert.alert(u.isActive ? 'Deactivate User' : 'Activate User', `${u.firstName} ${u.lastName}`, [
    { text: 'Cancel', style: 'cancel' },
    { text: u.isActive ? 'Deactivate' : 'Activate', style: 'destructive', onPress: async () => {
      try { await setUserActive(u._id, !u.isActive); setUsers((p) => p.map((x) => x._id === u._id ? { ...x, isActive: !u.isActive } : x)); }
      catch { Alert.alert('Error', 'Could not update user.'); }
    } },
  ]);

  if (loading) return (<View style={scr.root}><Header title="User Management" onBack={() => navigation.goBack()} /><View style={scr.center}><ActivityIndicator color="#e74c3c" /></View></View>);
  return (
    <View style={scr.root}>
      <Header title="User Management" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={scr.pad}>
        <Text style={scr.note}>{users.length} registered user(s)</Text>
        {users.length === 0
          ? <Text style={scr.empty}>No users found.</Text>
          : users.map((u, i) => (
            <Card
              key={u._id || i}
              title={`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email}
              subtitle={`${u.email || ''}${u.role ? ` · ${u.role}` : ''} · joined ${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}`}
              right={
                <TouchableOpacity style={[scr.toggleBtn, u.isActive ? scr.toggleOn : scr.toggleOff]} onPress={() => toggle(u)}>
                  <Text style={scr.toggleTxt}>{u.isActive ? 'Active' : 'Inactive'}</Text>
                </TouchableOpacity>
              }
            />
          ))}
      </ScrollView>
    </View>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 8. EMERGENCY HOTLINES (LIVE: /admin/hotlines)
// ════════════════════════════════════════════════════════════════════════════
export function AdminHotlines({ navigation }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { const d = await getAdminHotlines(); setList(d.hotlines || []); } catch { /* ignore */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!name.trim() || !number.trim()) return Alert.alert('Missing', 'Name and number required.');
    try {
      setSaving(true);
      await createHotline({ name: name.trim(), number: number.trim(), description: description.trim() });
      setName(''); setNumber(''); setDescription('');
      await load();
    } catch { Alert.alert('Error', 'Could not add hotline.'); } finally { setSaving(false); }
  };
  const remove = (h) => Alert.alert('Delete', `Delete "${h.name}"?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => { try { await deleteHotline(h._id); setList((p) => p.filter((x) => x._id !== h._id)); } catch { Alert.alert('Error'); } } },
  ]);
  const toggle = (h) => Alert.alert(h.isActive ? 'Deactivate' : 'Activate', h.name, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Save', onPress: async () => { try { await updateHotline(h._id, { isActive: !h.isActive }); setList((p) => p.map((x) => x._id === h._id ? { ...x, isActive: !h.isActive } : x)); } catch { Alert.alert('Error'); } } },
  ]);

  if (loading) return (<View style={scr.root}><Header title="Emergency Hotlines" onBack={() => navigation.goBack()} /><View style={scr.center}><ActivityIndicator color="#e74c3c" /></View></View>);
  return (
    <View style={scr.root}>
      <Header title="Emergency Hotlines" onBack={() => navigation.goBack()} />
      <View style={scr.formBox}>
        <Text style={scr.note}>Add an emergency hotline (used by One-Tap Call)</Text>
        <TextInput style={scr.input} placeholder="Name (e.g. National Emergency)" value={name} onChangeText={setName} />
        <TextInput style={scr.input} placeholder="Number (e.g. 911)" value={number} onChangeText={setNumber} keyboardType="phone-pad" />
        <TextInput style={scr.input} placeholder="Description (optional)" value={description} onChangeText={setDescription} />
        <TouchableOpacity style={scr.addBtn} onPress={add} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={scr.addBtnTxt}>Add Hotline</Text>}
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={scr.pad}>
        {list.length === 0
          ? <Text style={scr.empty}>No hotlines configured yet.</Text>
          : list.map((h, i) => (
            <Card
              key={h._id || i}
              title={h.name}
              subtitle={`${h.number}${h.description ? ` · ${h.description}` : ''}`}
              right={
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity style={[scr.toggleBtn, h.isActive ? scr.toggleOn : scr.toggleOff]} onPress={() => toggle(h)}>
                    <Text style={scr.toggleTxt}>{h.isActive ? 'On' : 'Off'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={scr.delBtn} onPress={() => remove(h)}><Ionicons name="trash-outline" size={18} color="#e74c3c" /></TouchableOpacity>
                </View>
              }
            />
          ))}
      </ScrollView>
    </View>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 9. SYSTEM SETTINGS (LIVE: /admin/settings)
// ════════════════════════════════════════════════════════════════════════════
export function AdminSettings({ navigation }) {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try { const d = await getSystemSettings(); setSettings(d.settings || []); } catch { /* ignore */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const toggle = (s) => Alert.alert(s.isEnabled ? 'Disable' : 'Enable', s.settingKey, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Save', onPress: async () => {
      try { await updateSystemSetting(s.settingKey, { isEnabled: !s.isEnabled }); setSettings((p) => p.map((x) => x.settingKey === s.settingKey ? { ...x, isEnabled: !s.isEnabled } : x)); }
      catch { Alert.alert('Error', 'Could not update setting.'); }
    } },
  ]);

  if (loading) return (<View style={scr.root}><Header title="System Settings" onBack={() => navigation.goBack()} /><View style={scr.center}><ActivityIndicator color="#e74c3c" /></View></View>);
  return (
    <View style={scr.root}>
      <Header title="System Settings" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={scr.pad}>
        <Text style={scr.note}>Global configuration managed by the admin</Text>
        {settings.length === 0
          ? <Text style={scr.empty}>No system settings defined yet.</Text>
          : settings.map((s, i) => (
            <Card
              key={s._id || i}
              title={s.settingKey}
              subtitle={`${s.description || ''}${s.value !== undefined && s.value !== null ? ` · value: ${JSON.stringify(s.value)}` : ''}`}
              right={<TouchableOpacity style={[scr.toggleBtn, s.isEnabled ? scr.toggleOn : scr.toggleOff]} onPress={() => toggle(s)}><Text style={scr.toggleTxt}>{s.isEnabled ? 'On' : 'Off'}</Text></TouchableOpacity>}
            />
          ))}
      </ScrollView>
    </View>
  );
}

const scr = StyleSheet.create({
  root:     { flex: 1, backgroundColor: '#f5f6f8' },
  center:   { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pad:      { padding: 14 },
  empty:    { textAlign: 'center', color: '#bbb', marginTop: 40, fontSize: 14 },
  note:     { fontSize: 11, color: '#999', marginBottom: 10, fontStyle: 'italic' },
  badge:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeTxt: { color: '#fff', fontSize: 10, fontWeight: '800' },
  views:    { fontSize: 12, fontWeight: '800', color: '#2980b9' },
  delBtn:   { width: 36, height: 36, borderRadius: 10, backgroundColor: '#fdecea', justifyContent: 'center', alignItems: 'center' },
  toggleBtn:{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  toggleOn: { backgroundColor: '#27ae60' },
  toggleOff:{ backgroundColor: '#bbb' },
  toggleTxt:{ color: '#fff', fontSize: 11, fontWeight: '800' },
  formBox:  { backgroundColor: '#fff', borderRadius: 14, padding: 14, margin: 14, elevation: 2 },
  input:    { borderWidth: 1.5, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: '#333', backgroundColor: '#fafafa', marginBottom: 10, textAlignVertical: 'top' },
  addBtn:   { backgroundColor: '#1a1a2e', borderRadius: 12, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  addBtnTxt:{ color: '#fff', fontWeight: '800', fontSize: 14 },
});
