import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Linking, Image,
  Platform, SafeAreaView, StatusBar,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { logout } from '../../store/authSlice';

const CATEGORIES = [
  { id: 'cpr',         title: 'CPR',        icon: 'heart',       color: '#e74c3c', description: 'Cardiopulmonary Resuscitation' },
  { id: 'choking',     title: 'Choking',    icon: 'warning',     color: '#e67e22', description: 'Heimlich Maneuver' },
  { id: 'burns',       title: 'Burns',      icon: 'flame',       color: '#f39c12', description: 'Burn Treatment & Care' },
  { id: 'bleeding',    title: 'Bleeding',   icon: 'bandage',     color: '#c0392b', description: 'Stop Severe Bleeding' },
  { id: 'fractures',   title: 'Fractures',  icon: 'body',        color: '#8e44ad', description: 'Broken Bone Care' },
  { id: 'seizure',     title: 'Seizure',   icon: 'pulse',       color: '#2980b9', description: 'Seizure Response' },
  { id: 'stroke',      title: 'Stroke',     icon: 'medkit',      color: '#d35400', description: 'Stroke Emergency Care' },
  { id: 'heat_stroke', title: 'Heat Stroke',icon: 'thermometer', color: '#f39c12', description: 'Heat-Related Emergency' },
];

const QUICK_TOOLS = [
  { title: 'Nearby Hospitals',  sub: 'Find emergency care near you', icon: 'location', color: '#27ae60', bg: '#e9f7ef', action: 'hospital' },
  { title: 'Emergency Contacts', sub: 'Your saved emergency contacts', icon: 'people',   color: '#2980b9', bg: '#e8f4fb', action: 'emergency' },
  { title: 'Medical Profile',    sub: 'Blood type, allergies & more',  icon: 'person',   color: '#8e44ad', bg: '#f5eef8', action: 'profile' },
  { title: 'Video Instructions', sub: 'Watch how-to first aid videos', icon: 'play-circle', color: '#16a085', bg: '#eefaf8', action: 'videos' },
];

const FIRST_AID_FACTS = [
  { fact: 'CPR can double or triple survival chances after cardiac arrest.',             icon: 'heart',       color: '#e74c3c' },
  { fact: 'The Heimlich maneuver removes blockages in over 80% of choking cases.',       icon: 'warning',     color: '#e67e22' },
  { fact: 'Running cool water on a burn for 20 minutes significantly reduces damage.',   icon: 'flame',       color: '#f39c12' },
  { fact: 'Applying firm pressure for 10 minutes stops most external bleeding.',         icon: 'bandage',     color: '#c0392b' },
  { fact: 'Most seizures stop on their own within 1-3 minutes without intervention.',    icon: 'pulse',       color: '#2980b9' },
  { fact: 'Heat stroke is a medical emergency that requires immediate treatment.',        icon: 'thermometer', color: '#f39c12' },
  { fact: 'Stroke is the 5th leading cause of death and a major cause of disability.',   icon: 'medkit',      color: '#d35400' },
  { fact: 'Fractures can be open (bone protrudes) or closed (bone stays under skin).',   icon: 'body',        color: '#8e44ad' },
  { fact: 'Only 46% of cardiac arrest victims outside hospitals receive bystander CPR.', icon: 'people',      color: '#16a085' },
];


export default function UserHomeScreen({ navigation }) {
  const dispatch  = useDispatch();
  const { user }  = useSelector((state) => state.auth);
  const firstName = user?.firstName || null;
  const [locating,    setLocating]    = useState(false);

  const handleToolPress = (action) => {
    switch (action) {
      case 'hospital':  navigation.navigate('Hospital'); break;
      case 'emergency': navigation.navigate('Emergency'); break;
      case 'profile':   navigation.navigate('Profile'); break;
      case 'guides':    navigation.navigate('Guides', { screen: 'GuidesList' }); break;
      case 'videos':    navigation.navigate('Videos'); break;
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  const handleCall911 = () => {
    Alert.alert(' Call 911', 'Do you want to call emergency services?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call Now', style: 'destructive', onPress: () => Linking.openURL('tel:911') },
    ]);
  };

  const shareLocation = async () => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission Denied', 'Location permission is required.'); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = loc.coords;
      const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
      const message  = `EMERGENCY! I need help!\nMy location: ${mapsLink}`;
      const smsUrl   = `sms:?body=${encodeURIComponent(message)}`;
      const canOpen  = await Linking.canOpenURL(smsUrl);
      if (canOpen) { await Linking.openURL(smsUrl); Alert.alert('Success', 'SMS app opened with your location!'); }
      else Alert.alert('Location Retrieved', `Your location:\n${mapsLink}`);
    } catch { Alert.alert('Error', 'Could not get location.'); }
    finally { setLocating(false); }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>

        {/* ══ HEADER ══ */}
        <SafeAreaView style={styles.appHeader}>
          <View style={styles.hdrInner}>
            <View style={styles.hdrBrand}>
              <View style={styles.hdrLogoWrap}>
                <Image source={require('../../../assets/logo2.png')} style={styles.hdrLogoImg} resizeMode="contain" />
                <View style={styles.hdrPulseDot}><Ionicons name="pulse" size={7} color="#fff" /></View>
              </View>
              <View>
                <Text style={styles.hdrTitle}>MediFirst</Text>
                <Text style={styles.hdrSub}>First Aid Assistant</Text>
              </View>
            </View>
            <View style={styles.hdrActions}>
              <TouchableOpacity style={styles.hdrIconBtn} onPress={() => navigation.navigate('Sources')} activeOpacity={0.85}>
                <Ionicons name="information-circle-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.hdrStrip}>
            <Ionicons name="shield-checkmark" size={13} color="rgba(255,255,255,0.85)" />
            <Text style={styles.hdrStripText}>Welcome back, {firstName}! Stay safe today.</Text>
          </View>
        </SafeAreaView>

        <View style={styles.sectionHeader}><Text style={styles.sectionLabel}>EMERGENCY</Text>
        <Text style={styles.sectionTitle}>Quick Response</Text></View>
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyCardHeader}><Ionicons name="warning" size={15} color="#e74c3c" /><Text style={styles.emergencyCardHeaderText}>Tap below in case of emergency</Text></View>
          <TouchableOpacity style={styles.emergencyRow} onPress={handleCall911} activeOpacity={0.82}>
            <View style={styles.emergencyRowIcon911}><Ionicons name="call" size={22} color="#fff" /></View>
            <View style={styles.emergencyRowText}><Text style={styles.emergencyRowTitle}>Call 911</Text><Text style={styles.emergencyRowSub}>Ambulance · Fire · Police</Text></View>
            <View style={[styles.emergencyBadge, { backgroundColor: '#fdecea' }]}><Text style={styles.emergencyBadgeText}>CALL</Text></View>
          </TouchableOpacity>
          <View style={styles.emergencyDivider} />
          <TouchableOpacity style={styles.emergencyRow} onPress={shareLocation} disabled={locating} activeOpacity={0.82}>
            <View style={styles.emergencyRowIconSMS}><Ionicons name={locating ? 'hourglass-outline' : 'location'} size={22} color="#fff" /></View>
            <View style={styles.emergencyRowText}><Text style={styles.emergencyRowTitle}>{locating ? 'Locating…' : 'Send My Location'}</Text><Text style={styles.emergencyRowSub}>SMS your GPS to emergency contact</Text></View>
            <View style={[styles.emergencyBadge, { backgroundColor: '#e9f7ef' }]}><Text style={styles.emergencyBadgeText}>SMS</Text></View>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}><Text style={styles.sectionLabel}>QUICK ACCESS</Text><Text style={styles.sectionTitle}>Your Tools</Text></View>
        <View style={styles.toolsGrid}>
          {QUICK_TOOLS.map((tool) => (
            <TouchableOpacity key={tool.title} style={styles.toolCard} onPress={() => handleToolPress(tool.action)} activeOpacity={0.8}>
              <View style={[styles.toolIcon, { backgroundColor: tool.bg }]}><Ionicons name={tool.icon} size={22} color={tool.color} /></View>
              <Text style={styles.toolTitle}>{tool.title}</Text>
              <Text style={styles.toolSub}>{tool.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}><Text style={styles.sectionLabel}>FIRST AID GUIDES</Text><Text style={styles.sectionTitle}>Choose a Topic</Text></View>
        <View style={styles.grid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.card} onPress={() => navigation.navigate('Guides', { screen: 'GuidesList', params: { category: cat.id } })} activeOpacity={0.78}>
              <View style={[styles.cardIconWrap, { backgroundColor: cat.color + '18' }]}><Ionicons name={cat.icon} size={24} color={cat.color} /></View>
              <Text style={styles.cardTitle}>{cat.title}</Text>
              <Text style={styles.cardDesc}>{cat.description}</Text>
              <View style={[styles.cardAccent, { backgroundColor: cat.color }]} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}><Text style={styles.sectionLabel}>DID YOU KNOW?</Text><Text style={styles.sectionTitle}>First Aid Facts</Text></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.factsScroll}>
          {FIRST_AID_FACTS.map((item, idx) => (
            <View key={idx} style={styles.factCard}>
              <View style={[styles.factIcon, { backgroundColor: item.color + '18' }]}><Ionicons name={item.icon} size={20} color={item.color} /></View>
              <Text style={styles.factText}>{item.fact}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}><Ionicons name="bulb" size={16} color="#f39c12" /><Text style={styles.tipTitle}>Quick Tip</Text></View>
          <Text style={styles.tipText}>In any emergency, always <Text style={{ fontWeight: '700', color: '#c0392b' }}>call 911 first</Text> before attempting first aid.</Text>
        </View>
      </ScrollView>

      {/* ══ FLOATING CHAT BUBBLE ══ */}
      <TouchableOpacity style={styles.floatingBtn} onPress={() => navigation.navigate('Chatbot')} activeOpacity={0.85}>
        <Ionicons name="chatbubbles" size={26} color="#fff" />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#f5f6f8' },
  contentContainer: { paddingBottom: 16 },

  appHeader:     { backgroundColor: '#e74c3c', elevation: 6, shadowColor: '#c0392b', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 10, paddingTop: 35, paddingBottom: 0 },
  hdrInner:      { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 30, paddingBottom: 1 },
  hdrBrand:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hdrLogoWrap:   { position: 'relative' },
  hdrLogoImg:    { width: 50, height: 50, borderRadius: 12 },
  hdrPulseDot:   { position: 'absolute', bottom: -1, right: 3, width: 12, height: 12, borderRadius: 6, backgroundColor: '#27ae60', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#e74c3c' },
  hdrTitle:      { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: 0.5, lineHeight: 20 },
  hdrSub:        { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 0, fontStyle: 'italic' },
  hdrActions:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hdrIconBtn:    { width: 40, height: 40, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  hdrStrip:      { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(0,0,0,0.12)', paddingHorizontal: 16, paddingVertical: 8 },
  hdrStripText:  { fontSize: 13, color: 'rgba(255,255,255,0.88)', fontWeight: '500', flex: 1 },

  sectionHeader: { paddingHorizontal: 16, marginTop: 10, marginBottom: 12 },
  sectionLabel:  { fontSize: 11, fontWeight: '700', color: '#c0392b', letterSpacing: 1.5, marginBottom: 6 },
  sectionTitle:  { fontSize: 20, fontWeight: '800', color: '#1a1a2e' },

  toolsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, justifyContent: 'space-between', gap: 12 },
  toolCard:  { width: '47%', backgroundColor: '#fff', borderRadius: 13, padding: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
  toolIcon:  { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  toolTitle: { fontSize: 13, fontWeight: '700', color: '#1a1a2e', marginBottom: 3 },
  toolSub:   { fontSize: 11, color: '#888', lineHeight: 15 },

  emergencyCard:           { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.09, shadowRadius: 8, borderWidth: 1, borderColor: '#f0f0f0' },
  emergencyCardHeader:     { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#fef5f5', paddingHorizontal: 16, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#fce8e8' },
  emergencyCardHeaderText: { fontSize: 11, color: '#c0392b', fontWeight: '700', letterSpacing: 0.4 },
  emergencyRow:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, gap: 14 },
  emergencyDivider:        { height: 1, backgroundColor: '#f3f4f6', marginHorizontal: 16 },
  emergencyRowIcon911:     { width: 46, height: 46, borderRadius: 13, backgroundColor: '#e74c3c', justifyContent: 'center', alignItems: 'center' },
  emergencyRowIconSMS:     { width: 46, height: 46, borderRadius: 13, backgroundColor: '#27ae60', justifyContent: 'center', alignItems: 'center' },
  emergencyRowText:        { flex: 1 },
  emergencyRowTitle:       { fontSize: 15, fontWeight: '800', color: '#1a1a2e' },
  emergencyRowSub:         { fontSize: 11, color: '#999', marginTop: 2 },
  emergencyBadge:          { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  emergencyBadgeText:      { fontSize: 11, fontWeight: '800', color: '#555', letterSpacing: 0.5 },

  grid:         { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, justifyContent: 'space-between', marginTop: 4 },
  card:         { width: '48%', backgroundColor: '#fff', borderRadius: 13, padding: 15, overflow: 'hidden', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardIconWrap: { width: 46, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 9 },
  cardTitle:    { fontSize: 14, fontWeight: '800', color: '#1a1a2e', marginBottom: 3 },
  cardDesc:     { fontSize: 11, color: '#888', lineHeight: 15 },
  cardAccent:   { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3 },

  factsScroll: { paddingHorizontal: 16, gap: 12 },
  factCard:    { width: 190, backgroundColor: '#fff', borderRadius: 13, padding: 14, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  factIcon:    { width: 40, height: 40, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginBottom: 9 },
  factText:    { fontSize: 12, color: '#444', lineHeight: 18 },

  tipCard:   { margin: 16, marginTop: 20, backgroundColor: '#fffbf0', borderRadius: 13, padding: 15, borderLeftWidth: 4, borderLeftColor: '#f39c12' },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 7 },
  tipTitle:  { fontSize: 14, fontWeight: '700', color: '#856404' },
  tipText:   { fontSize: 13, color: '#856404', lineHeight: 19 },

  floatingBtn: {
    position: 'absolute', bottom: 35, right: 20,
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: '#e74c3c',
    justifyContent: 'center', alignItems: 'center',
    elevation: 8, shadowColor: '#c0392b',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8,
  },
});
