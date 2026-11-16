import React from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  ScrollView, SafeAreaView, StatusBar, Platform, Image, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useProfile } from './ProfileContext';

const TABS = [
  { key: 'Medical',  label: 'Medical',   sub: 'Blood type, allergies & conditions', icon: 'person', color: '#8e44ad', bg: '#f5eef8' },
  { key: 'Contacts', label: 'Contacts',  sub: 'Your saved emergency contacts',      icon: 'people',  color: '#2980b9', bg: '#e8f4fb' },
  { key: 'History',  label: 'History',   sub: 'Your emergency call log',            icon: 'time',    color: '#e74c3c', bg: '#fdecea' },
  { key: 'Settings', label: 'Settings',  sub: 'Account, privacy & app info',        icon: 'cog',     color: '#16a085', bg: '#e8f8f5' },
];

function ProfileMenu() {
  const navigation = useNavigation();
  const { 
    user, profile, loading, profileImage, 
    handleLogout, pickPhoto, isDownloaded, downloading, downloadProgress, handleDownload 
  } = useProfile();
  
  const initials = ((user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')).toUpperCase();

  if (loading) {
    return (
      <View style={[s.root, s.center]}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={s.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* ══ HEADER ══ */}
      <SafeAreaView style={s.header} edges={['top']}>
        {Platform.OS === 'android' && <View style={{ height: StatusBar.currentHeight || 0 }} />}
        <View style={s.hdrContent}>
          
          {/* Interactive Avatar with Photo Picker */}
          <TouchableOpacity style={s.avatarWrap} onPress={pickPhoto} activeOpacity={0.9}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={s.avatarImg} />
            ) : (
              <View style={s.avatarFallback}>
                <Text style={s.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View style={s.cameraPin}>
              <Ionicons name="camera" size={9} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={s.hdrMeta}>
            <Text style={s.hdrName} numberOfLines={1}>{user?.firstName} {user?.lastName}</Text>
            <Text style={s.hdrEmail} numberOfLines={1}>{user?.email}</Text>
            <View style={s.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={10} color="#fff" />
              <Text style={s.verifiedText}>Verified Member</Text>
            </View>
          </View>

          <View style={s.hdrActions}>
            <TouchableOpacity style={[s.hdrIconBtn, s.hdrSignOutBtn]} onPress={handleLogout} activeOpacity={0.85}>
              <Ionicons name="log-out-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.privacyStrip}>
          <View style={s.privacyDot} />
          <Text style={s.privacyText}>Your medical data is private and encrypted</Text>
        </View>
      </SafeAreaView>

      {/* ══ SECTION CARDS ══ */}
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false}>
        <View style={s.tabBarCard}>
          <View style={s.cardHeaderStrip}>
            <Ionicons name="grid-outline" size={13} color="#c0392b" />
            <Text style={s.cardHeaderText}>Your Profile Sections</Text>
          </View>
          {TABS.map((tab, i) => (
            <React.Fragment key={tab.key}>
              {i > 0 && <View style={s.cardDivider} />}
              <TouchableOpacity
                style={s.cardRow}
                onPress={() => navigation.navigate(tab.key)}
                activeOpacity={0.82}
              >
                <View style={[s.rowIcon, { backgroundColor: tab.bg }]}>
                  <Ionicons name={tab.icon} size={20} color={tab.color} />
                </View>
                <View style={s.rowText}>
                  <Text style={s.rowTitle}>{tab.label}</Text>
                  <Text style={s.rowSub}>{tab.sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        {/* ══ DOWNLOAD GUIDES CARD ══ */}
        <TouchableOpacity style={s.downloadCard} onPress={handleDownload} disabled={downloading} activeOpacity={0.82}>
          <View style={[s.downloadIcon, { backgroundColor: isDownloaded ? '#27ae60' : '#8e44ad' }]}>
            {downloading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name={isDownloaded ? 'checkmark-circle' : 'download'} size={22} color="#fff" />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.downloadTitle}>
              {downloading ? `Saving guides… ${downloadProgress}/9` : isDownloaded ? 'Guides Downloaded' : 'Download Guides'}
            </Text>
            {downloading ? (
              <View style={s.downloadProgressWrap}>
                <View style={[s.downloadProgressFill, { width: `${(downloadProgress / 9) * 100}%` }]} />
              </View>
            ) : (
              <Text style={s.downloadSub}>
                {isDownloaded ? '9 guides saved — works offline' : 'Save all 9 guides for offline use'}
              </Text>
            )}
          </View>
          {!downloading && (
            <View style={[s.downloadBadge, { backgroundColor: isDownloaded ? '#e9f7ef' : '#f5eef8' }]}>
              <Text style={[s.downloadBadgeText, { color: isDownloaded ? '#27ae60' : '#8e44ad' }]}>
                {isDownloaded ? 'SAVED' : 'FREE'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

export default function ProfileScreen() {
  return <ProfileMenu />;
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#f4f6f8' },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40 },
  loadingText: { marginTop: 10, color: '#999', fontSize: 14 },
  
  header:      { backgroundColor: '#e74c3c', elevation: 6, shadowColor: '#c0392b', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 8 },
  hdrContent:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 30, paddingBottom: 12, gap: 12 },
  
  avatarWrap:    { position: 'relative' },
  avatarImg:     { width: 54, height: 54, borderRadius: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)' },
  avatarFallback: { width: 54, height: 54, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.22)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', justifyContent: 'center', alignItems: 'center' },
  avatarInitials: { fontSize: 18, fontWeight: '900', color: '#fff' },
  cameraPin:     { position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: '#27ae60', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#e74c3c' },
  
  hdrMeta:       { flex: 1 },
  hdrName:       { fontSize: 17, fontWeight: '900', color: '#fff', marginBottom: 2 },
  hdrEmail:      { fontSize: 12.5, color: 'rgba(255,255,255,0.78)', marginBottom: 5, fontStyle: 'italic' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 20 },
  verifiedText:  { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  
  hdrActions:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hdrIconBtn:    { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  hdrSignOutBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  
  privacyStrip:  { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(0,0,0,0.12)', paddingHorizontal: 16, paddingVertical: 8 },
  privacyDot:    { width: 7, height: 7, borderRadius: 4, backgroundColor: '#2ecc71' },
  privacyText:   { fontSize: 12.5, color: 'rgba(255,255,255,0.9)', fontWeight: '500', flex: 1 },
  
  scroll:        { flex: 1 },
  scrollPad:     { padding: 14, paddingTop: 16 },
  
  tabBarCard:    { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, borderWidth: 1, borderColor: '#f0f0f0' },
  cardHeaderStrip: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#fef5f5', paddingHorizontal: 16, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#fce8e8' },
  cardHeaderText:  { fontSize: 11, color: '#c0392b', fontWeight: '700', letterSpacing: 0.4 },
  cardRow:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 13 },
  cardDivider:     { height: 1, backgroundColor: '#f3f4f6', marginHorizontal: 16 },
  rowIcon:         { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  rowText:         { flex: 1 },
  rowTitle:        { fontSize: 14, fontWeight: '800', color: '#1a1a2e' },
  rowSub:          { fontSize: 11, color: '#888', marginTop: 2 },
  
  downloadCard:          { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: '#fff', borderRadius: 16, padding: 16, marginTop: 14, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, borderWidth: 1, borderColor: '#f0f0f0' },
  downloadIcon:          { width: 44, height: 44, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  downloadTitle:         { fontSize: 14.5, fontWeight: '800', color: '#1a1a2e', marginBottom: 2 },
  downloadSub:           { fontSize: 11.5, color: '#888' },
  downloadProgressWrap: { height: 5, backgroundColor: '#f0e6fc', borderRadius: 3, marginTop: 6, overflow: 'hidden' },
  downloadProgressFill: { height: 5, backgroundColor: '#8e44ad', borderRadius: 3 },
  downloadBadge:         { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  downloadBadgeText:     { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.4 },
});