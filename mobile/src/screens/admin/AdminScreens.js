import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Platform, TextInput, ActivityIndicator, Alert, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getAdminActivity, getHospitals, createHospital, deleteHospital,
  getChatbotResponses, createChatbotResponse, deleteChatbotResponse,
  deleteGuide, getAdminUsers, setUserActive, getAdminHotlines, createHotline, updateHotline, deleteHotline,
  getSystemSettings, updateSystemSetting,
} from '../../api/adminApi';

// ── Refined Reusable Header ──
const Header = ({ title, onBack }) => (
  <SafeAreaView style={hStyles.bar} edges={['top']}>
    <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
    {Platform.OS === 'android' && <View style={{ height: StatusBar.currentHeight || 0 }} />}
    <TouchableOpacity onPress={onBack} style={hStyles.back} activeOpacity={0.8}>
      <Ionicons name="chevron-back" size={20} color="#fff" />
    </TouchableOpacity>
    <Text style={hStyles.title}>{title}</Text>
    <View style={{ width: 36 }} />
  </SafeAreaView>
);

const hStyles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', paddingBottom: 14, paddingHorizontal: 12 },
  back: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  title: { flex: 1, textAlign: 'center', color: '#fff', fontSize: 16, fontWeight: '800' },
});

// ── Refined Card Component with Icon and Badges ──
const Card = ({ icon, iconColor, iconBg, title, subtitle, right }) => (
  <View style={gStyles.card}>
    {icon && (
      <View style={[gStyles.iconBox, { backgroundColor: iconBg || '#f1f5f9' }]}>
        <Ionicons name={icon} size={18} color={iconColor || '#475569'} />
      </View>
    )}
    <View style={{ flex: 1, marginRight: 8 }}>
      <Text style={gStyles.cardTitle} numberOfLines={1}>{title}</Text>
      {subtitle ? <Text style={gStyles.cardSub} numberOfLines={2}>{subtitle}</Text> : null}
    </View>
    {right}
  </View>
);

const gStyles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0', elevation: 1 },
  iconBox: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardTitle: { fontSize: 13.5, fontWeight: '800', color: '#1a1a2e' },
  cardSub: { fontSize: 11.5, color: '#64748b', marginTop: 2, lineHeight: 16 },
});

// ════════════════════════════════════════════════════════════════════════════
// 1. INCIDENT & CONCERN REPORTS
// ════════════════════════════════════════════════════════════════════════════
export function AdminReports({ navigation, route }) {
  const reports = route.params?.reports || [];
  return (
    <View style={scr.root}>
      <Header title="Incident & Concern Reports" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={scr.pad}>
        {reports.length === 0 ? (
          <Text style={scr.empty}>No reports submitted yet.</Text>
        ) : (
          reports.map((r, i) => (
            <Card
              key={r._id || i}
              icon="document-text"
              iconColor="#8e44ad"
              iconBg="#f5eef8"
              title={r.subject || r.type || 'Report'}
              subtitle={`${r.type || 'General'} · ${r.message || ''}`}
              right={
                <View style={[scr.badge, { backgroundColor: r.status === 'new' ? '#fdecea' : '#e9f7ef' }]}>
                  <Text style={[scr.badgeTxt, { color: r.status === 'new' ? '#e74c3c' : '#27ae60' }]}>
                    {r.status || 'new'}
                  </Text>
                </View>
              }
            />
          ))
        )}
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
        {feedback.length === 0 ? (
          <Text style={scr.empty}>No user concerns submitted yet.</Text>
        ) : (
          feedback.map((r, i) => (
            <Card
              key={r._id || i}
              icon="chatbox-ellipses"
              iconColor="#f39c12"
              iconBg="#fef9e7"
              title={r.subject || 'Feedback'}
              subtitle={r.message || ''}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2. FIRST-AID USAGE REPORTS
// ════════════════════════════════════════════════════════════════════════════
export function AdminUsage({ navigation, route }) {
  const guides = route.params?.guides || [];
  const sorted = [...guides].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
  return (
    <View style={scr.root}>
      <Header title="First-Aid Usage Analytics" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={scr.pad}>
        {sorted.length === 0 ? (
          <Text style={scr.empty}>No usage data available.</Text>
        ) : (
          sorted.map((g, i) => (
            <Card
              key={g._id || i}
              icon="bar-chart"
              iconColor="#2980b9"
              iconBg="#e8f4fb"
              title={g.title}
              subtitle={`Category: ${g.category}`}
              right={<Text style={scr.views}>{g.viewCount || 0} views</Text>}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3. MANAGE FIRST-AID CONTENT
// ════════════════════════════════════════════════════════════════════════════
export function AdminContent({ navigation, route }) {
  const [guides, setGuides] = React.useState(route.params?.guides || []);
  const remove = (g) =>
    Alert.alert('Delete Guide', `Delete "${g.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteGuide(g._id);
            setGuides((p) => p.filter((x) => x._id !== g._id));
          } catch {
            Alert.alert('Error', 'Delete failed.');
          }
        },
      },
    ]);

  return (
    <View style={scr.root}>
      <Header title="First-Aid Content Management" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={scr.pad}>
        <Text style={scr.note}>Tap the trash icon to delete outdated or incorrect guides.</Text>
        {guides.length === 0 ? (
          <Text style={scr.empty}>No guides found.</Text>
        ) : (
          guides.map((g, i) => (
            <Card
              key={g._id || i}
              icon="book"
              iconColor="#c0392b"
              iconBg="#fdecea"
              title={g.title}
              subtitle={`Category: ${g.category} · Severity: ${g.severity || 'General'}`}
              right={
                <TouchableOpacity style={scr.delBtn} onPress={() => remove(g)}>
                  <Ionicons name="trash-outline" size={16} color="#e74c3c" />
                </TouchableOpacity>
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4. EMERGENCY ACTIVITY LOGS
// ════════════════════════════════════════════════════════════════════════════
export function AdminActivity({ navigation }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const d = await getAdminActivity();
      setLogs(d.logs || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View style={scr.root}>
        <Header title="Emergency Activity Logs" onBack={() => navigation.goBack()} />
        <View style={scr.center}><ActivityIndicator color="#e74c3c" /></View>
      </View>
    );
  }

  return (
    <View style={scr.root}>
      <Header title="Emergency Activity Logs" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={scr.pad}>
        {logs.length === 0 ? (
          <Text style={scr.empty}>No activity logged yet.</Text>
        ) : (
          logs.map((l, i) => (
            <Card
              key={l._id || i}
              icon="pulse"
              iconColor="#16a085"
              iconBg="#e8f8f5"
              title={l.description || l.action || 'Emergency Event'}
              subtitle={`${l.category || 'System'} · ${l.createdAt ? new Date(l.createdAt).toLocaleString() : ''}`}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 5. HOSPITAL LOCATOR DATA
// ════════════════════════════════════════════════════════════════════════════
export function AdminHospitals({ navigation }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await getHospitals();
      setList(d.hospitals || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!name.trim()) return Alert.alert('Missing Field', 'Hospital name is required.');
    try {
      setSaving(true);
      await createHospital({ name: name.trim(), city: city.trim(), phone: phone.trim(), type: 'hospital', emergencyRoom: true });
      setName(''); setCity(''); setPhone('');
      await load();
    } catch {
      Alert.alert('Error', 'Could not add hospital.');
    } finally {
      setSaving(false);
    }
  };

  const remove = (h) =>
    Alert.alert('Delete Hospital', `Delete "${h.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteHospital(h._id);
            setList((p) => p.filter((x) => x._id !== h._id));
          } catch {
            Alert.alert('Error', 'Delete failed.');
          }
        },
      },
    ]);

  if (loading) {
    return (
      <View style={scr.root}>
        <Header title="Hospital Locator Data" onBack={() => navigation.goBack()} />
        <View style={scr.center}><ActivityIndicator color="#e74c3c" /></View>
      </View>
    );
  }

  return (
    <View style={scr.root}>
      <Header title="Hospital Locator Data" onBack={() => navigation.goBack()} />
      <View style={scr.formBox}>
        <Text style={scr.formTitle}>Add New Emergency Facility</Text>
        <TextInput style={scr.input} placeholder="Hospital Name" placeholderTextColor="#94a3b8" value={name} onChangeText={setName} />
        <TextInput style={scr.input} placeholder="City / Location" placeholderTextColor="#94a3b8" value={city} onChangeText={setCity} />
        <TextInput style={scr.input} placeholder="Phone Number" placeholderTextColor="#94a3b8" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TouchableOpacity style={scr.addBtn} onPress={add} disabled={saving} activeOpacity={0.85}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={scr.addBtnTxt}>Save Hospital</Text>}
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={scr.pad}>
        {list.length === 0 ? (
          <Text style={scr.empty}>No hospitals in the directory yet.</Text>
        ) : (
          list.map((h, i) => (
            <Card
              key={h._id || i}
              icon="medical"
              iconColor="#27ae60"
              iconBg="#e9f7ef"
              title={h.name}
              subtitle={`${h.city || 'Cebu'} · ${h.phone || 'No phone listed'}`}
              right={
                <TouchableOpacity style={scr.delBtn} onPress={() => remove(h)}>
                  <Ionicons name="trash-outline" size={16} color="#e74c3c" />
                </TouchableOpacity>
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 6. AI CHATBOT RESPONSES
// ════════════════════════════════════════════════════════════════════════════
export function AdminChatbot({ navigation }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [intent, setIntent] = useState('');
  const [answer, setAnswer] = useState('');
  const [keywords, setKeywords] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await getChatbotResponses();
      setList(d.responses || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!intent.trim() || !answer.trim()) return Alert.alert('Missing Fields', 'Intent and answer are required.');
    try {
      setSaving(true);
      await createChatbotResponse({
        intent: intent.trim(),
        answer: answer.trim(),
        keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
      });
      setIntent(''); setAnswer(''); setKeywords('');
      await load();
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not add response.');
    } finally {
      setSaving(false);
    }
  };

  const remove = (c) =>
    Alert.alert('Delete Response', `Delete intent "${c.intent}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteChatbotResponse(c._id);
            setList((p) => p.filter((x) => x._id !== c._id));
          } catch {
            Alert.alert('Error', 'Delete failed.');
          }
        },
      },
    ]);

  if (loading) {
    return (
      <View style={scr.root}>
        <Header title="AI Chatbot Responses" onBack={() => navigation.goBack()} />
        <View style={scr.center}><ActivityIndicator color="#e74c3c" /></View>
      </View>
    );
  }

  return (
    <View style={scr.root}>
      <Header title="AI Chatbot Knowledge Base" onBack={() => navigation.goBack()} />
      <View style={scr.formBox}>
        <Text style={scr.formTitle}>Add Keyword-Triggered Response</Text>
        <TextInput style={scr.input} placeholder="Intent (e.g. cpr_steps)" placeholderTextColor="#94a3b8" value={intent} onChangeText={setIntent} autoCapitalize="none" />
        <TextInput style={scr.input} placeholder="Keywords (comma separated)" placeholderTextColor="#94a3b8" value={keywords} onChangeText={setKeywords} autoCapitalize="none" />
        <TextInput style={[scr.input, { height: 75 }]} placeholder="Automated Answer text..." placeholderTextColor="#94a3b8" value={answer} onChangeText={setAnswer} multiline />
        <TouchableOpacity style={scr.addBtn} onPress={add} disabled={saving} activeOpacity={0.85}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={scr.addBtnTxt}>Save Response</Text>}
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={scr.pad}>
        {list.length === 0 ? (
          <Text style={scr.empty}>No chatbot responses configured yet.</Text>
        ) : (
          list.map((c, i) => (
            <Card
              key={c._id || i}
              icon="chatbubbles"
              iconColor="#d35400"
              iconBg="#fdf2e9"
              title={c.intent}
              subtitle={c.answer || ''}
              right={
                <TouchableOpacity style={scr.delBtn} onPress={() => remove(c)}>
                  <Ionicons name="trash-outline" size={16} color="#e74c3c" />
                </TouchableOpacity>
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 7. USER MANAGEMENT
// ════════════════════════════════════════════════════════════════════════════
export function AdminUsers({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const d = await getAdminUsers();
      setUsers(d.users || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = (u) =>
    Alert.alert(u.isActive ? 'Deactivate User' : 'Activate User', `${u.firstName || ''} ${u.lastName || ''}`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: u.isActive ? 'Deactivate' : 'Activate',
        style: 'destructive',
        onPress: async () => {
          try {
            await setUserActive(u._id, !u.isActive);
            setUsers((p) => p.map((x) => (x._id === u._id ? { ...x, isActive: !u.isActive } : x)));
          } catch {
            Alert.alert('Error', 'Could not update user status.');
          }
        },
      },
    ]);

  if (loading) {
    return (
      <View style={scr.root}>
        <Header title="User Management" onBack={() => navigation.goBack()} />
        <View style={scr.center}><ActivityIndicator color="#e74c3c" /></View>
      </View>
    );
  }

  return (
    <View style={scr.root}>
      <Header title="User Account Management" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={scr.pad}>
        <Text style={scr.note}>Total Registered Accounts: {users.length}</Text>
        {users.length === 0 ? (
          <Text style={scr.empty}>No users found.</Text>
        ) : (
          users.map((u, i) => (
            <Card
              key={u._id || i}
              icon="person"
              iconColor="#8e44ad"
              iconBg="#f5eef8"
              title={`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email}
              subtitle={`${u.email} · Role: ${u.role || 'user'}`}
              right={
                <TouchableOpacity
                  style={[scr.toggleBtn, u.isActive ? scr.toggleOn : scr.toggleOff]}
                  onPress={() => toggle(u)}
                  activeOpacity={0.8}
                >
                  <Text style={scr.toggleTxt}>{u.isActive ? 'Active' : 'Inactive'}</Text>
                </TouchableOpacity>
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 8. EMERGENCY HOTLINES
// ════════════════════════════════════════════════════════════════════════════
export function AdminHotlines({ navigation }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await getAdminHotlines();
      setList(d.hotlines || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!name.trim() || !number.trim()) return Alert.alert('Missing Fields', 'Name and number required.');
    try {
      setSaving(true);
      await createHotline({ name: name.trim(), number: number.trim(), description: description.trim() });
      setName(''); setNumber(''); setDescription('');
      await load();
    } catch {
      Alert.alert('Error', 'Could not add hotline.');
    } finally {
      setSaving(false);
    }
  };

  const remove = (h) =>
    Alert.alert('Delete Hotline', `Delete "${h.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteHotline(h._id);
            setList((p) => p.filter((x) => x._id !== h._id));
          } catch {
            Alert.alert('Error', 'Delete failed.');
          }
        },
      },
    ]);

  const toggle = (h) =>
    Alert.alert('Toggle Status', h.name, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Save',
        onPress: async () => {
          try {
            await updateHotline(h._id, { isActive: !h.isActive });
            setList((p) => p.map((x) => (x._id === h._id ? { ...x, isActive: !h.isActive } : x)));
          } catch {
            Alert.alert('Error', 'Could not update status.');
          }
        },
      },
    ]);

  if (loading) {
    return (
      <View style={scr.root}>
        <Header title="Emergency Hotlines" onBack={() => navigation.goBack()} />
        <View style={scr.center}><ActivityIndicator color="#e74c3c" /></View>
      </View>
    );
  }

  return (
    <View style={scr.root}>
      <Header title="Emergency Hotlines" onBack={() => navigation.goBack()} />
      <View style={scr.formBox}>
        <Text style={scr.formTitle}>Add One-Tap Emergency Hotline</Text>
        <TextInput style={scr.input} placeholder="Name (e.g. Red Cross Cebu)" placeholderTextColor="#94a3b8" value={name} onChangeText={setName} />
        <TextInput style={scr.input} placeholder="Number (e.g. 143 or 911)" placeholderTextColor="#94a3b8" value={number} onChangeText={setNumber} keyboardType="phone-pad" />
        <TextInput style={scr.input} placeholder="Description (optional)" placeholderTextColor="#94a3b8" value={description} onChangeText={setDescription} />
        <TouchableOpacity style={scr.addBtn} onPress={add} disabled={saving} activeOpacity={0.85}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={scr.addBtnTxt}>Save Hotline</Text>}
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={scr.pad}>
        {list.length === 0 ? (
          <Text style={scr.empty}>No hotlines configured yet.</Text>
        ) : (
          list.map((h, i) => (
            <Card
              key={h._id || i}
              icon="call"
              iconColor="#e74c3c"
              iconBg="#fdecea"
              title={h.name}
              subtitle={`${h.number}${h.description ? ` · ${h.description}` : ''}`}
              right={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <TouchableOpacity
                    style={[scr.toggleBtn, h.isActive ? scr.toggleOn : scr.toggleOff]}
                    onPress={() => toggle(h)}
                    activeOpacity={0.8}
                  >
                    <Text style={scr.toggleTxt}>{h.isActive ? 'Active' : 'Off'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={scr.delBtn} onPress={() => remove(h)}>
                    <Ionicons name="trash-outline" size={16} color="#e74c3c" />
                  </TouchableOpacity>
                </View>
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 9. SYSTEM SETTINGS
// ════════════════════════════════════════════════════════════════════════════
export function AdminSettings({ navigation }) {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const d = await getSystemSettings();
      setSettings(d.settings || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = (sItem) =>
    Alert.alert('Toggle Setting', sItem.settingKey, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Save',
        onPress: async () => {
          try {
            await updateSystemSetting(sItem.settingKey, { isEnabled: !sItem.isEnabled });
            setSettings((p) => p.map((x) => (x.settingKey === sItem.settingKey ? { ...x, isEnabled: !sItem.isEnabled } : x)));
          } catch {
            Alert.alert('Error', 'Could not update setting.');
          }
        },
      },
    ]);

  if (loading) {
    return (
      <View style={scr.root}>
        <Header title="System Settings" onBack={() => navigation.goBack()} />
        <View style={scr.center}><ActivityIndicator color="#e74c3c" /></View>
      </View>
    );
  }

  return (
    <View style={scr.root}>
      <Header title="Global System Configurations" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={scr.pad}>
        <Text style={scr.note}>Global parameters managed by system administrators</Text>
        {settings.length === 0 ? (
          <Text style={scr.empty}>No system settings defined yet.</Text>
        ) : (
          settings.map((sItem, i) => (
            <Card
              key={sItem._id || i}
              icon="settings"
              iconColor="#34495e"
              iconBg="#ebedef"
              title={sItem.settingKey}
              subtitle={`${sItem.description || 'Configuration parameter'}${sItem.value !== undefined && sItem.value !== null ? ` · Value: ${JSON.stringify(sItem.value)}` : ''}`}
              right={
                <TouchableOpacity
                  style={[scr.toggleBtn, sItem.isEnabled ? scr.toggleOn : scr.toggleOff]}
                  onPress={() => toggle(sItem)}
                  activeOpacity={0.8}
                >
                  <Text style={scr.toggleTxt}>{sItem.isEnabled ? 'Enabled' : 'Disabled'}</Text>
                </TouchableOpacity>
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const scr = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f4f6f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pad: { padding: 14 },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 40, fontSize: 13.5, fontStyle: 'italic' },
  note: { fontSize: 11.5, color: '#64748b', marginBottom: 12, marginLeft: 2, fontWeight: '600' },
  
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeTxt: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.3 },
  views: { fontSize: 12.5, fontWeight: '900', color: '#2980b9' },
  
  delBtn: { width: 34, height: 34, borderRadius: 9, backgroundColor: '#fdecea', justifyContent: 'center', alignItems: 'center' },
  
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  toggleOn: { backgroundColor: '#27ae60' },
  toggleOff: { backgroundColor: '#cbd5e1' },
  toggleTxt: { color: '#fff', fontSize: 11, fontWeight: '800' },
  
  formBox: { backgroundColor: '#fff', borderRadius: 16, padding: 16, margin: 14, borderWidth: 1, borderColor: '#e2e8f0', elevation: 1 },
  formTitle: { fontSize: 13.5, fontWeight: '800', color: '#1a1a2e', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13.5, color: '#1e293b', backgroundColor: '#f8fafc', marginBottom: 10, textAlignVertical: 'top' },
  addBtn: { backgroundColor: '#0f172a', borderRadius: 10, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  addBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 13.5 },
});