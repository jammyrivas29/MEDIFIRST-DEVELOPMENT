import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useProfile, SectionHeader } from './ProfileContext';
import PrivacyModal from './ProfileModals/PrivacyModal';
import AboutModal from './ProfileModals/AboutModal';
import EditAccountModal from './ProfileModals/EditAccountModal';
import FeedbackModal from './ProfileModals/FeedbackModal';
import { useState } from 'react';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { isGuest, user, pickPhoto, handleLogout, fetchProfile, setShowPrivacy, setShowFeedback, setShowAbout, setShowEdit } = useProfile();
  const [showPrivacy, setP] = useState(false);
  const [showAbout, setA] = useState(false);
  const [showEdit, setE] = useState(false);
  const [showFeedback, setF] = useState(false);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#e74c3c' }}>
        {Platform.OS === 'android' && <View style={{ height: StatusBar.currentHeight || 0 }} />}
        <SectionHeader title="Settings" icon="cog" onBack={() => navigation.goBack()} />
      </SafeAreaView>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false}>
        <Text style={s.groupLabel}>ACCOUNT</Text>
        {isGuest && (
          <View style={[s.guestNote, { marginBottom: 10 }]}>
            <Ionicons name="information-circle-outline" size={14} color="#e67e22" />
            <Text style={s.guestNoteTxt}>Sign in to manage your account, photo and medical profile.</Text>
          </View>
        )}
        <View style={s.menuCard}>
          {[
            { icon: 'person', bg: '#fdecea', color: '#e74c3c', title: 'Edit Account', sub: 'Update name, email and phone', onPress: () => setE(true), guest: false },
            { icon: 'camera', bg: '#e8f4fb', color: '#2980b9', title: 'Change Profile Photo', sub: 'Take a photo or choose from gallery', onPress: pickPhoto, guest: false },
          ].filter(row => !isGuest || row.guest).map((row, i, arr) => (
            <React.Fragment key={row.title}>
              {i > 0 && <View style={s.menuDivider} />}
              <TouchableOpacity style={s.menuRow} onPress={row.onPress} activeOpacity={0.75}>
                <View style={[s.menuIconBox, { backgroundColor: row.bg }]}>
                  <Ionicons name={row.icon} size={18} color={row.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.menuTitle}>{row.title}</Text>
                  <Text style={s.menuSub}>{row.sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color="#ddd" />
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        <Text style={s.groupLabel}>APP INFO</Text>
        <View style={s.menuCard}>
          {[
            { icon: 'chatbox-ellipses', bg: '#eaf2fd', color: '#2980b9', title: 'Send Feedback', sub: 'Report a concern or suggestion', onPress: () => setF(true) },
            { icon: 'mail', bg: '#fef9e7', color: '#f39c12', title: 'Contact Support', sub: 'medifirst.help@gmail.com', onPress: () => Linking.openURL('mailto:medifirst.help@gmail.com') },
            { icon: 'shield-checkmark', bg: '#f5eef8', color: '#8e44ad', title: 'Privacy Policy', sub: 'How we handle your data', onPress: () => setP(true) },
            { icon: 'information-circle', bg: '#e8f8f5', color: '#16a085', title: 'About MediFirst', sub: 'Features, version and mission', onPress: () => setA(true) },
          ].map((row, i) => (
            <React.Fragment key={row.title}>
              {i > 0 && <View style={s.menuDivider} />}
              <TouchableOpacity style={s.menuRow} onPress={row.onPress} activeOpacity={0.75}>
                <View style={[s.menuIconBox, { backgroundColor: row.bg }]}>
                  <Ionicons name={row.icon} size={18} color={row.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.menuTitle}>{row.title}</Text>
                  <Text style={s.menuSub}>{row.sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color="#ddd" />
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        <Text style={s.groupLabel}>SESSION</Text>
        <View style={s.menuCard}>
          <TouchableOpacity style={s.menuRow} onPress={handleLogout} activeOpacity={0.75}>
            <View style={[s.menuIconBox, { backgroundColor: '#fdecea' }]}>
              <Ionicons name="log-out-outline" size={18} color="#e74c3c" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.menuTitle, { color: '#e74c3c' }]}>Sign Out</Text>
              <Text style={s.menuSub}>You can sign back in anytime</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={s.versionNote}>MediFirst v1.0.0 — Made with care for your safety</Text>
        <View style={{ height: 40 }} />
      </ScrollView>

      <PrivacyModal visible={showPrivacy} onClose={() => setP(false)} />
      <AboutModal visible={showAbout} onClose={() => setA(false)} />
      <EditAccountModal visible={showEdit} onClose={() => setE(false)} user={user} onSaved={fetchProfile} />
      <FeedbackModal visible={showFeedback} onClose={() => setF(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: '#f0f2f5' },
  scroll:       { flex: 1 },
  scrollPad:    { padding: 14, paddingTop: 16 },
  groupLabel:   { fontSize: 10, fontWeight: '800', color: '#bbb', letterSpacing: 1.5, marginBottom: 10, marginTop: 8, paddingHorizontal: 2 },
  guestNote:    { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fef9e7', padding: 12, borderRadius: 12 },
  guestNoteTxt: { flex: 1, fontSize: 12, color: '#856404' },
  menuCard:     { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
  menuRow:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, gap: 14 },
  menuDivider:  { height: 1, backgroundColor: '#f5f5f5', marginHorizontal: 16 },
  menuIconBox:  { width: 44, height: 44, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  menuTitle:    { fontSize: 14, fontWeight: '700', color: '#1a1a2e', marginBottom: 2 },
  menuSub:      { fontSize: 11, color: '#999' },
  versionNote:  { fontSize: 11, color: '#ccc', textAlign: 'center', marginTop: 8 },
});
