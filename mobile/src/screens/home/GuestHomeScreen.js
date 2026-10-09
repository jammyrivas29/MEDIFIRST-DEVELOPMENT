import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Animated, Linking, Image,
  Platform, ActivityIndicator, SafeAreaView, StatusBar, Modal,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout, setAuthInitialRoute } from '../../store/authSlice';

const GUIDES_DOWNLOAD_KEY   = 'medifirst_guides_downloaded';
const FIRST_LAUNCH_KEY      = 'medifirst_first_launch_done';
const TOTAL_GUIDES          = 9;

const LOCKED_FEATURES = [
  { icon: 'chatbubbles', color: '#16a085', bg: '#e8f8f5', label: 'MediFirst AI',       sub: 'Smart AI first-aid assistant' },
  { icon: 'people',      color: '#2980b9', bg: '#e8f4fb', label: 'Emergency Contacts', sub: 'Your saved emergency contacts' },
  { icon: 'person',      color: '#8e44ad', bg: '#f5eef8', label: 'Medical Profile',    sub: 'Blood type, allergies & more' },
  { icon: 'send',        color: '#e67e22', bg: '#fef5ec', label: 'Send Location SMS',  sub: 'GPS location to contacts' },
  { icon: 'time',        color: '#c0392b', bg: '#fdecea', label: 'Call History',       sub: 'Your emergency call log' },
];

const MEMBER_PERKS = [
  { icon: 'people',   color: '#2980b9', bg: '#e8f4fb', label: 'Emergency\nContacts' },
  { icon: 'person',   color: '#8e44ad', bg: '#f5eef8', label: 'Medical\nProfile' },
  { icon: 'send',     color: '#e67e22', bg: '#fef5ec', label: 'Location\nSMS' },
  { icon: 'time',     color: '#c0392b', bg: '#fdecea', label: 'Call\nHistory' },
  { icon: 'heart',    color: '#e74c3c', bg: '#fdecea', label: 'Health\nTips' },
  { icon: 'chatbubbles', color: '#16a085', bg: '#e8f8f5', label: 'MediFirst\nAI' },
];

const GUIDE_PREVIEWS = [
  { id: 'local_cpr',        icon: 'heart',       color: '#e74c3c', label: 'CPR'          },
  { id: 'local_choking',    icon: 'warning',     color: '#e67e22', label: 'Choking'      },
  { id: 'local_burns',      icon: 'flame',       color: '#f39c12', label: 'Burns'        },
  { id: 'local_bleeding',   icon: 'bandage',     color: '#c0392b', label: 'Bleeding'     },
  { id: 'local_fractures',  icon: 'body',        color: '#8e44ad', label: 'Fractures'    },
  { id: 'local_seizure',    icon: 'pulse',       color: '#2980b9', label: 'Seizure'      },
  { id: 'local_stroke',     icon: 'medkit',      color: '#d35400', label: 'Stroke'       },
  { id: 'local_heatstroke', icon: 'thermometer', color: '#f39c12', label: 'Heat Stroke'  },
  { id: 'local_poison',     icon: 'skull',       color: '#27ae60', label: 'Poisoning'    },
];

const SOURCES = [
  { category: '🫀 CPR & Cardiac Arrest', color: '#e74c3c', items: [{ title: 'WikiHow — How to Perform CPR on an Adult, Child, Baby', url: 'https://www.wikihow.com/Perform-CPR' }] },
  { category: '😮‍💨 Choking', color: '#e67e22', items: [{ title: 'WikiHow — How to Help a Choking Victim', url: 'https://www.wikihow.com/Help-a-Choking-Victim' }] },
  { category: '🔥 Burns & Wounds', color: '#f39c12', items: [{ title: 'WikiHow — How to Treat a Burn', url: 'https://www.wikihow.com/Treat-a-Burn' }] },
  { category: '🩹 Bleeding & Wounds', color: '#c0392b', items: [{ title: 'WikiHow — How to Stop a Cut from Bleeding', url: 'https://www.wikihow.com/Stop-Bleeding' }] },
  { category: '🦴 Fractures & Broken Bones', color: '#8e44ad', items: [{ title: 'WikiHow — How to Treat a Broken Foot', url: 'https://www.wikihow.com/Treat-a-Foot-Fracture' }] },
  { category: '⚡ Seizures', color: '#2980b9', items: [{ title: 'WikiHow — How to Help Someone Having a Seizure', url: 'https://www.wikihow.com/Stop-a-Seizure' }] },
  { category: '🧠 Stroke', color: '#d35400', items: [{ title: 'WikiHow — How to Recognize a Stroke', url: 'https://www.wikihow.com/Identify-if-Someone-Had-a-Stroke' }] },
  { category: '🌡️ Heat Stroke', color: '#f39c12', items: [{ title: 'WikiHow — How to Treat Heat Stroke', url: 'https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/extreme-heat-safety/heat-check.html' }] },
  { category: '☠️ Poisoning', color: '#27ae60', items: [{ title: 'WikiHow — How to Treat Poisoning', url: 'https://www.wikihow.com/Treat-Poisoning' }] },
  { category: '🏥 Hospital & Emergency Locator', color: '#27ae60', items: [{ title: 'OpenStreetMap — Overpass API', url: 'https://overpass-api.de' }, { title: 'OpenStreetMap Foundation', url: 'https://www.openstreetmap.org' }] },
  { category: '🤖 AI Assistant', color: '#16a085', items: [{ title: 'Groq AI — LLaMA 3.3 Model', url: 'https://console.groq.com' }, { title: 'Meta LLaMA 3 — Open Source LLM', url: 'https://ai.meta.com/llama/' }] },
  { category: '📱 App Technology', color: '#34495e', items: [{ title: 'React Native — Mobile Framework', url: 'https://reactnative.dev' }, { title: 'Expo — Development Platform', url: 'https://expo.dev' }, { title: 'Node.js + MongoDB — Backend', url: 'https://nodejs.org' }] },
];

function InfoModal({ visible, onClose }) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={infoStyles.container}>
        <View style={infoStyles.header}>
          <View style={infoStyles.headerLeft}>
            <View style={infoStyles.headerIcon}><Ionicons name="information-circle" size={22} color="#fff" /></View>
            <View>
              <Text style={infoStyles.headerTitle}>Sources & References</Text>
              <Text style={infoStyles.headerSub}>MediFirst App v1.0.0</Text>
            </View>
          </View>
          <TouchableOpacity style={infoStyles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color="#555" />
          </TouchableOpacity>
        </View>
        <View style={infoStyles.disclaimer}>
          <Ionicons name="warning" size={14} color="#856404" />
          <Text style={infoStyles.disclaimerText}>MediFirst provides general first aid guidance only. Always consult a medical professional for emergencies.</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {SOURCES.map((section) => (
            <View key={section.category} style={infoStyles.section}>
              <View style={infoStyles.sectionHeader}>
                <View style={[infoStyles.sectionDot, { backgroundColor: section.color }]} />
                <Text style={infoStyles.sectionTitle}>{section.category}</Text>
              </View>
              {section.items.map((item, idx) => (
                <TouchableOpacity key={idx} style={infoStyles.sourceRow} onPress={() => Linking.openURL(item.url)} activeOpacity={0.75}>
                  <View style={infoStyles.sourceRowLeft}>
                    <Ionicons name="link" size={13} color={section.color} />
                    <Text style={infoStyles.sourceTitle}>{item.title}</Text>
                  </View>
                  <Ionicons name="open-outline" size={14} color="#ccc" />
                </TouchableOpacity>
              ))}
            </View>
          ))}
          <View style={infoStyles.appInfo}>
            <Text style={infoStyles.appInfoTitle}>MediFirst — First Aid Assistant</Text>
            <Text style={infoStyles.appInfoText}>Version 1.0.0 · Built for emergency preparedness</Text>
            <Text style={infoStyles.appInfoText}>© 2026 MediFirst Team. All rights reserved.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export default function GuestHomeScreen({ navigation }) {
  const dispatch  = useDispatch();
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const [isDownloaded,     setIsDownloaded]     = useState(false);
  const [downloading,      setDownloading]      = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [promptVisible,    setPromptVisible]    = useState(false);
  const [infoVisible,      setInfoVisible]      = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
    initApp();
  }, []);

  const initApp = async () => {
    try {
      const [downloaded, launched] = await Promise.all([
        AsyncStorage.getItem(GUIDES_DOWNLOAD_KEY),
        AsyncStorage.getItem(FIRST_LAUNCH_KEY),
      ]);
      const alreadyDownloaded = downloaded === 'true';
      setIsDownloaded(alreadyDownloaded);
      if (!alreadyDownloaded && launched !== 'true') {
        setTimeout(() => setPromptVisible(true), 600);
      }
    } catch (_) {}
  };

  const dismissPrompt = async () => {
    setPromptVisible(false);
    try { await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'true'); } catch (_) {}
  };

  const handleDownload = async (fromPrompt = false) => {
    if (isDownloaded) {
      Alert.alert(
        ' Already Downloaded',
        `All ${TOTAL_GUIDES} guides are saved on your device and work without internet.`,
        [
          { text: 'Remove Download', style: 'destructive', onPress: confirmRemove },
          { text: 'OK', style: 'cancel' },
        ]
      );
      return;
    }
    if (fromPrompt) setPromptVisible(false);
    setDownloading(true);
    setDownloadProgress(0);
    try {
      for (let i = 1; i <= TOTAL_GUIDES; i++) {
        await new Promise(r => setTimeout(r, 200));
        setDownloadProgress(i);
      }
      await AsyncStorage.setItem(GUIDES_DOWNLOAD_KEY, 'true');
      await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'true');
      setIsDownloaded(true);
      Alert.alert('All Guides Saved!', `${TOTAL_GUIDES} first-aid guides are now on your device.\nThey will load instantly even without internet or an account.`);
    } catch (_) {
      Alert.alert('Error', 'Could not save guides. Please try again.');
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  const confirmRemove = async () => {
    try {
      await AsyncStorage.removeItem(GUIDES_DOWNLOAD_KEY);
      setIsDownloaded(false);
    } catch (_) {}
  };

  const handleCall911 = () => {
    Alert.alert(' Call 911', 'Do you want to call emergency services?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call Now', style: 'destructive', onPress: () => Linking.openURL('tel:911') },
    ]);
  };

  const handleSignUp = () => {
    dispatch(setAuthInitialRoute('Register'));
    dispatch(logout());
  };
  const handleLogIn  = () => { dispatch(setAuthInitialRoute('Login')); dispatch(logout()); };
  const handleLockedFeature = () => {
    Alert.alert(' Sign In Required', 'Create a free account or log in to access this feature.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign In',  onPress: handleLogIn },
      { text: 'Register', onPress: handleSignUp },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      {/* Offline Download Prompt Modal */}
      <Modal visible={promptVisible} transparent animationType="fade" onRequestClose={dismissPrompt}>
        <View style={styles.promptOverlay}>
          <View style={styles.promptCard}>
            <View style={styles.promptIconWrap}>
              <Ionicons name="download" size={32} color="#fff" />
            </View>
            <Text style={styles.promptTitle}>Save Guides for Offline Use</Text>
            <Text style={styles.promptDesc}>
              Download all {TOTAL_GUIDES} first-aid guides to your device so they're available anytime — even without internet or an account.
            </Text>
            <View style={styles.promptChips}>
              {GUIDE_PREVIEWS.map(g => (
                <View key={g.id} style={[styles.promptChip, { backgroundColor: g.color + '15', borderColor: g.color + '40' }]}>
                  <Ionicons name={g.icon} size={11} color={g.color} />
                  <Text style={[styles.promptChipText, { color: g.color }]}>{g.label}</Text>
                </View>
              ))}
            </View>
            <View style={styles.promptInfoRow}>
              <Ionicons name="checkmark-circle" size={14} color="#27ae60" />
              <Text style={styles.promptInfoText}>Free · No account needed · Works offline</Text>
            </View>
            <TouchableOpacity style={styles.promptDownloadBtn} onPress={() => handleDownload(true)} activeOpacity={0.85}>
              <Ionicons name="download" size={18} color="#fff" />
              <Text style={styles.promptDownloadBtnText}>Download Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.promptSkipBtn} onPress={dismissPrompt} activeOpacity={0.7}>
              <Text style={styles.promptSkipText}>Maybe later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
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
              <TouchableOpacity style={styles.hdrIconBtn} onPress={() => setInfoVisible(true)} activeOpacity={0.85}>
                <Ionicons name="information-circle-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.hdrStrip}>
            <Ionicons name="shield-checkmark" size={13} color="rgba(255,255,255,0.85)" />
            <Text style={styles.hdrStripText}>Welcome! Explore free tools below.</Text>
          </View>
        </SafeAreaView>

        {/* Emergency */}
        <Animated.View style={{ opacity: fadeAnim, paddingHorizontal: 16, marginTop: 20, marginBottom: 4 }}>
          <Text style={styles.sectionLabel}>Emergency</Text>
          <Text style={styles.sectionTitle}>Quick Access</Text>
        </Animated.View>
        <Animated.View style={[styles.unifiedCard, { opacity: fadeAnim }]}>
          <View style={styles.cardHeaderStrip}>
            <Ionicons name="warning" size={14} color="#e74c3c" />
            <Text style={styles.cardHeaderText}>Always available — no sign-in needed</Text>
          </View>
          <TouchableOpacity style={styles.cardRow} onPress={handleCall911} activeOpacity={0.82}>
            <View style={[styles.rowIcon, { backgroundColor: '#e74c3c' }]}><Ionicons name="call" size={20} color="#fff" /></View>
            <View style={styles.rowText}><Text style={styles.rowTitle}>Call 911</Text><Text style={styles.rowSub}>Ambulance · Fire · Police</Text></View>
            <View style={[styles.rowBadge, { backgroundColor: '#fdecea' }]}><Text style={styles.rowBadgeText}>CALL</Text></View>
          </TouchableOpacity>
          <View style={styles.cardDivider} />
          <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('Hospital')} activeOpacity={0.82}>
            <View style={[styles.rowIcon, { backgroundColor: '#27ae60' }]}><Ionicons name="location" size={20} color="#fff" /></View>
            <View style={styles.rowText}><Text style={styles.rowTitle}>Nearby Hospitals</Text><Text style={styles.rowSub}>Find emergency care near you</Text></View>
            <View style={[styles.rowBadge, { backgroundColor: '#e9f7ef' }]}><Text style={[styles.rowBadgeText, { color: '#27ae60' }]}>FREE</Text></View>
          </TouchableOpacity>
          <View style={styles.cardDivider} />
          <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('Guides')} activeOpacity={0.82}>
            <View style={[styles.rowIcon, { backgroundColor: '#2980b9' }]}><Ionicons name="medical" size={20} color="#fff" /></View>
            <View style={styles.rowText}><Text style={styles.rowTitle}>First Aid Guides</Text><Text style={styles.rowSub}>CPR, burns, choking & more — offline</Text></View>
            <View style={[styles.rowBadge, { backgroundColor: '#e8f4fb' }]}><Text style={styles.rowBadgeText}>FREE</Text></View>
          </TouchableOpacity>
          <View style={styles.cardDivider} />
          <TouchableOpacity style={styles.cardRow} onPress={() => handleDownload(false)} activeOpacity={0.82} disabled={downloading}>
            <View style={[styles.rowIcon, { backgroundColor: isDownloaded ? '#27ae60' : '#8e44ad' }]}>
              {downloading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name={isDownloaded ? 'checkmark-circle' : 'download'} size={20} color="#fff" />
              }
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>
                {downloading ? `Saving guides… ${downloadProgress}/${TOTAL_GUIDES}` : isDownloaded ? 'Guides Downloaded' : 'Download Guides'}
              </Text>
              {downloading ? (
                <View style={styles.progressBarWrap}>
                  <View style={[styles.progressBarFill, { width: `${(downloadProgress / TOTAL_GUIDES) * 100}%` }]} />
                </View>
              ) : (
                <Text style={styles.rowSub}>
                  {isDownloaded ? `${TOTAL_GUIDES} guides saved — works without internet` : `Save all ${TOTAL_GUIDES} guides for offline use — no account needed`}
                </Text>
              )}
            </View>
            {!downloading && (
              isDownloaded
                ? <View style={[styles.rowBadge, { backgroundColor: '#e9f7ef' }]}><Text style={[styles.rowBadgeText, { color: '#27ae60' }]}>SAVED</Text></View>
                : <View style={[styles.rowBadge, { backgroundColor: '#f5eef8' }]}><Text style={[styles.rowBadgeText, { color: '#8e44ad' }]}>FREE</Text></View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Members Only */}
        <Animated.View style={{ opacity: fadeAnim, paddingHorizontal: 16, marginTop: 24, marginBottom: 12 }}>
          <Text style={styles.sectionLabel}>MEMBERS ONLY</Text>
          <Text style={styles.sectionTitle}>Sign In to Unlock</Text>
        </Animated.View>
        <Animated.View style={[styles.unifiedCard, { opacity: fadeAnim }]}>
          <View style={styles.lockBanner}>
            <Ionicons name="lock-closed" size={13} color="#856404" />
            <Text style={styles.lockBannerText}>These features require a free account</Text>
          </View>
          {LOCKED_FEATURES.map((f, idx) => (
            <React.Fragment key={f.label}>
              <TouchableOpacity style={[styles.cardRow, { opacity: 0.7 }]} onPress={handleLockedFeature} activeOpacity={0.75}>
                <View style={[styles.rowIcon, { backgroundColor: f.bg }]}><Ionicons name={f.icon} size={20} color={f.color} /></View>
                <View style={styles.rowText}><Text style={[styles.rowTitle, { color: '#666' }]}>{f.label}</Text><Text style={styles.rowSub}>{f.sub}</Text></View>
                <Ionicons name="lock-closed" size={15} color="#ddd" />
              </TouchableOpacity>
              {idx < LOCKED_FEATURES.length - 1 && <View style={styles.cardDivider} />}
            </React.Fragment>
          ))}
        </Animated.View>

        {/* Sign up promo */}
        <Animated.View style={{ opacity: fadeAnim, paddingHorizontal: 16, marginTop: 24, marginBottom: 14 }}>
          <Text style={styles.sectionLabel}>WITH A FREE ACCOUNT</Text>
          <Text style={styles.sectionTitle}>Everything You Get</Text>
        </Animated.View>
        <Animated.View style={{ opacity: fadeAnim, paddingHorizontal: 16 }}>
          <View style={styles.perkGrid}>
            {MEMBER_PERKS.map((p) => (
              <View key={p.label} style={styles.perkCard}>
                <View style={[styles.perkIconWrap, { backgroundColor: p.bg }]}><Ionicons name={p.icon} size={24} color={p.color} /></View>
                <Text style={styles.perkLabel}>{p.label}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.registerBtn} onPress={handleSignUp} activeOpacity={0.85}>
            <Ionicons name="person-add" size={18} color="#fff" />
            <Text style={styles.registerBtnText}>Create Free Account</Text>
          </TouchableOpacity>
          <View style={styles.loginBtn}>
            <Text style={styles.loginBtnText}>Already have an account?</Text>
            <TouchableOpacity onPress={handleLogIn} activeOpacity={0.7}>
              <Text style={styles.loginBtnHighlight}> Log In</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={styles.tip}>
          <Ionicons name="information-circle" size={17} color="#f39c12" />
          <Text style={styles.tipText}>In any emergency, <Text style={{ fontWeight: '700' }}>call 911 first</Text> before attempting first aid.</Text>
        </View>
      </ScrollView>

      {/* Info / Sources Modal */}
      <InfoModal visible={infoVisible} onClose={() => setInfoVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#f5f6f8' },
  contentContainer: { paddingBottom: 24 },

  appHeader:    { backgroundColor: '#e74c3c', elevation: 6, shadowColor: '#c0392b', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 10, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0 },
  hdrInner:     { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 12, paddingBottom: 5 },
  hdrBrand:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hdrLogoWrap:  { position: 'relative' },
  hdrLogoImg:   { width: 48, height: 48 },
  hdrPulseDot:  { position: 'absolute', bottom: -1, right: 3, width: 12, height: 12, borderRadius: 6, backgroundColor: '#27ae60', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#e74c3c' },
  hdrTitle:     { fontSize: 17, fontWeight: '900', color: '#fff', letterSpacing: 0.5, lineHeight: 20 },
  hdrSub:       { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 0, fontStyle: 'italic' },
  hdrActions:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hdrIconBtn:   { width: 40, height: 40, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  hdrStrip:     { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(0,0,0,0.12)', paddingHorizontal: 16, paddingVertical: 8 },
  hdrStripText: { fontSize: 13, color: 'rgba(255,255,255,0.88)', fontWeight: '500', flex: 1 },

  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#c0392b', letterSpacing: 1.5, marginBottom: 4 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a2e' },

  unifiedCard:     { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, borderWidth: 1, borderColor: '#f0f0f0' },
  cardHeaderStrip: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#fef5f5', paddingHorizontal: 16, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#fce8e8' },
  cardHeaderText:  { fontSize: 11, color: '#c0392b', fontWeight: '700', letterSpacing: 0.4 },
  cardRow:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 13 },
  cardDivider:     { height: 1, backgroundColor: '#f3f4f6', marginHorizontal: 16 },
  rowIcon:         { width: 44, height: 44, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  rowText:         { flex: 1 },
  rowTitle:        { fontSize: 14, fontWeight: '800', color: '#1a1a2e' },
  rowSub:          { fontSize: 11, color: '#999', marginTop: 2 },
  rowBadge:        { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  rowBadgeText:    { fontSize: 11, fontWeight: '800', color: '#555', letterSpacing: 0.4 },

  progressBarWrap: { height: 4, backgroundColor: '#f0e6fc', borderRadius: 4, marginTop: 6, overflow: 'hidden' },
  progressBarFill: { height: 4, backgroundColor: '#8e44ad', borderRadius: 4 },

  lockBanner:     { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#fef9e7', paddingHorizontal: 16, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#fef0c0' },
  lockBannerText: { fontSize: 11, color: '#856404', fontWeight: '700' },

  perkGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', marginBottom: 18 },
  perkCard:    { width: '30%', backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 8, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 5 },
  perkIconWrap:{ width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 9 },
  perkLabel:   { fontSize: 11, fontWeight: '700', color: '#1a1a2e', textAlign: 'center', lineHeight: 15 },

  registerBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#27ae60', borderRadius: 14, paddingVertical: 15, gap: 9, marginBottom: 10, elevation: 4 },
  registerBtnText:   { fontSize: 15, fontWeight: '800', color: '#fff' },
  loginBtn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 14, paddingVertical: 13, borderWidth: 1.5, borderColor: '#e0e0e0' },
  loginBtnText:      { fontSize: 14, color: '#888' },
  loginBtnHighlight: { fontSize: 14, fontWeight: '700', color: '#3498db' },

  tip:     { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fffbf0', marginHorizontal: 16, marginTop: 16, marginBottom: 0, borderRadius: 12, padding: 14, gap: 10, borderLeftWidth: 4, borderLeftColor: '#f39c12' },
  tipText: { flex: 1, fontSize: 12, color: '#7d6608', lineHeight: 18 },

  promptOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  promptCard:    { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%', alignItems: 'center', elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 16 },
  promptIconWrap:  { width: 68, height: 68, borderRadius: 20, backgroundColor: '#8e44ad', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  promptTitle:     { fontSize: 20, fontWeight: '900', color: '#1a1a2e', textAlign: 'center', marginBottom: 10 },
  promptDesc:      { fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  promptChips:     { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 7, marginBottom: 14 },
  promptChip:      { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  promptChipText:  { fontSize: 11, fontWeight: '700' },
  promptInfoRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  promptInfoText:  { fontSize: 12, color: '#27ae60', fontWeight: '600' },
  promptDownloadBtn:     { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#8e44ad', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, marginBottom: 10, width: '100%', justifyContent: 'center', elevation: 4 },
  promptDownloadBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  promptSkipBtn:         { paddingVertical: 10 },
  promptSkipText:        { fontSize: 13, color: '#aaa', fontWeight: '600' },
});

const infoStyles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f5f6f8' },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#e74c3c', paddingHorizontal: 16, paddingVertical: 14 },
  headerLeft:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon:     { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle:    { fontSize: 17, fontWeight: '800', color: '#fff' },
  headerSub:      { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  closeBtn:       { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center' },
  disclaimer:     { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#fef9e7', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#fef0c0' },
  disclaimerText: { flex: 1, fontSize: 11, color: '#856404', lineHeight: 16 },
  section:        { marginBottom: 18 },
  sectionHeader:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  sectionDot:     { width: 10, height: 10, borderRadius: 5 },
  sectionTitle:   { fontSize: 14, fontWeight: '800', color: '#1a1a2e' },
  sourceRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 6, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  sourceRowLeft:  { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  sourceTitle:    { fontSize: 13, color: '#333', fontWeight: '500', flex: 1 },
  appInfo:        { backgroundColor: '#fff', borderRadius: 13, padding: 16, alignItems: 'center', marginTop: 10 },
  appInfoTitle:   { fontSize: 14, fontWeight: '800', color: '#1a1a2e', marginBottom: 4 },
  appInfoText:    { fontSize: 11, color: '#888', marginTop: 2, textAlign: 'center' },
});