import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, StatusBar, Platform, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useProfile } from './ProfileContext';

const TABS = [
  { key: 'Medical',  label: 'Medical',   sub: 'Blood type, allergies & conditions', icon: 'medical', color: '#e74c3c', bg: '#fdecea' },
  { key: 'Contacts', label: 'Contacts',  sub: 'Your saved emergency contacts',      icon: 'people',  color: '#2980b9', bg: '#e8f4fb' },
  { key: 'History',  label: 'History',   sub: 'Your emergency call log',            icon: 'time',    color: '#8e44ad', bg: '#f5eef8' },
  { key: 'Settings', label: 'Settings',  sub: 'Account, privacy & app info',        icon: 'cog',     color: '#16a085', bg: '#e8f8f5' },
];

function ProfileMenu() {
  const navigation = useNavigation();
  const { user, profile, loading, callHistory, profileImage, handleLogout, pickPhoto, isDownloaded, downloading, downloadProgress, handleDownload } = useProfile();
  const initials    = ((user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')).toUpperCase();
  const allergyList = profile?.medicalProfile?.allergies || [];
  const condList    = profile?.medicalProfile?.medicalConditions || [];
  const recCount    = Math.max(0, 5 - (allergyList.length ? 1 : 0) - (condList.length ? 1 : 0));

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
          <View style={s.avatarWrap}>
            {profileImage
              ? <Image source={{ uri: profileImage }} style={s.avatarImg} />
              : <View style={s.avatarFallback}><Text style={s.avatarInitials}>{initials}</Text></View>
            }
          </View>

          <View style={s.hdrMeta}>
            <Text style={s.hdrName} numberOfLines={1}>{user?.firstName} {user?.lastName}</Text>
            <Text style={s.hdrEmail} numberOfLines={1}>{user?.email}</Text>
            <View style={s.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={9} color="#fff" />
              <Text style={s.verifiedText}>Verified Member</Text>
            </View>
          </View>

          <View style={s.hdrActions}>
            <TouchableOpacity style={[s.hdrIconBtn, s.hdrSignOutBtn]} onPress={handleLogout} activeOpacity={0.85}>
              <Ionicons name="log-out-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.privacyStrip}>
          <View style={s.privacyDot} />
          <Text style={s.privacyText}>Your medical data is private and encrypted</Text>
        </View>
      </SafeAreaView>

      {/* ══ STATS ══ */}
      <View style={s.statsRow}>
        {[
          { n: callHistory.length,  label: 'Calls',      icon: 'call',         color: '#8e44ad', bg: '#f5eef8' },
          { n: recCount,            label: 'Tips',       icon: 'bulb',         color: '#f39c12', bg: '#fef9e7' },
          { n: allergyList.length,  label: 'Allergies',  icon: 'alert-circle', color: '#e74c3c', bg: '#fdecea' },
          { n: condList.length,     label: 'Conditions', icon: 'fitness',      color: '#2980b9', bg: '#e8f4fb' },
        ].map((item, i, arr) => (
          <React.Fragment key={item.label}>
            <View style={s.statCell}>
              <View style={[s.statIconBox, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={14} color={item.color} />
              </View>
              <Text style={[s.statNum, { color: item.color }]}>{item.n}</Text>
              <Text style={s.statLabel}>{item.label}</Text>
            </View>
            {i < arr.length - 1 && <View style={s.statDivider} />}
          </React.Fragment>
        ))}
      </View>

      {/* ══ SECTION CARD (Quick Access, matches GuestHomeScreen) ══ */}
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
                <Ionicons name="chevron-forward" size={16} color="#ddd" />
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        {/* ══ DOWNLOAD GUIDES CARD ══ */}
        <TouchableOpacity style={s.downloadCard} onPress={handleDownload} disabled={downloading} activeOpacity={0.82}>
          <View style={[s.downloadIcon, { backgroundColor: isDownloaded ? '#27ae60' : '#8e44ad' }]}>
            {downloading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name={isDownloaded ? 'checkmark-circle' : 'download'} size={22} color="#fff" />}
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
  root:        { flex: 1, backgroundColor: '#f0f2f5' },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40 },
  loadingText: { marginTop: 10, color: '#999', fontSize: 14 },
  header:       { backgroundColor: '#e74c3c', elevation: 6, shadowColor: '#c0392b', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 8 },
  hdrContent:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 3, gap: 10 },
  avatarWrap:     { position: 'relative' },
  avatarImg:      { width: 52, height: 52, borderRadius: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  avatarFallback: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.22)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', justifyContent: 'center', alignItems: 'center' },
  avatarInitials: { fontSize: 18, fontWeight: '900', color: '#fff' },
  cameraPin:      { position: 'absolute', bottom: -3, right: -3, width: 16, height: 16, borderRadius: 8, backgroundColor: '#27ae60', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#e74c3c' },
  hdrMeta:       { flex: 1 },
  hdrName:       { fontSize: 17, fontWeight: '900', color: '#fff', marginBottom: 2 },
  hdrEmail:      { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 5, fontStyle: 'italic' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 4, paddingVertical: 3, borderRadius: 20 },
  verifiedText:  { color: '#fff', fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
  hdrActions:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hdrIconBtn:    { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  hdrSignOutBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  privacyStrip:  { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(0,0,0,0.12)', paddingHorizontal: 16, paddingVertical: 8 },
  privacyDot:    { width: 7, height: 7, borderRadius: 4, backgroundColor: '#2ecc71' },
  privacyText:   { fontSize: 13, color: 'rgba(255,255,255,0.88)', fontWeight: '500', flex: 1 },
  statsRow:    { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 14, marginTop: 8, borderRadius: 18, paddingVertical: 10, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 },
  statCell:    { flex: 1, alignItems: 'center', gap: 3 },
  statIconBox: { width: 30, height: 30, borderRadius: 9, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  statNum:     { fontSize: 17, fontWeight: '900' },
  statLabel:   { fontSize: 9, color: '#aaa', fontWeight: '600' },
  statDivider: { width: 1, height: 28, backgroundColor: '#f0f0f0' },
  scroll:    { flex: 1 },
  scrollPad: { padding: 14, paddingTop: 18 },
  tabBarCard:   { marginTop: 4, marginBottom: 16, backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, borderWidth: 1, borderColor: '#f0f0f0' },
  cardHeaderStrip: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#fef5f5', paddingHorizontal: 16, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#fce8e8' },
  cardHeaderText:  { fontSize: 11, color: '#c0392b', fontWeight: '700', letterSpacing: 0.4 },
  cardRow:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 13 },
  cardDivider:     { height: 1, backgroundColor: '#f3f4f6', marginHorizontal: 16 },
  rowIcon:         { width: 44, height: 44, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  rowText:         { flex: 1 },
  rowTitle:        { fontSize: 14, fontWeight: '800', color: '#1a1a2e' },
  rowSub:          { fontSize: 11, color: '#999', marginTop: 2 },
  downloadCard:         { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: '#fff', borderRadius: 18, padding: 16, marginTop: 14, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, borderWidth: 1, borderColor: '#f0f0f0' },
  downloadIcon:         { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  downloadTitle:        { fontSize: 15, fontWeight: '800', color: '#1a1a2e', marginBottom: 2 },
  downloadSub:          { fontSize: 12, color: '#999' },
  downloadProgressWrap: { height: 6, backgroundColor: '#f0e6fc', borderRadius: 4, marginTop: 6, overflow: 'hidden' },
  downloadProgressFill: { height: 6, backgroundColor: '#8e44ad', borderRadius: 4 },
  downloadBadge:        { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  downloadBadgeText:    { fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },
});
