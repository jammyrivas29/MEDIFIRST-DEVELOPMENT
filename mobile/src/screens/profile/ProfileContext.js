import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { logout } from '../../store/authSlice';
import api from '../../api/axiosConfig';

const BLOOD_TYPES    = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'];
const URGENCY_COLORS = { critical: '#e74c3c', high: '#e67e22', medium: '#2980b9', low: '#27ae60' };

const getRecommendations = (profile) => {
  const recs = [];
  const bt         = profile?.medicalProfile?.bloodType;
  const allergies  = profile?.medicalProfile?.allergies || [];
  const conditions = profile?.medicalProfile?.medicalConditions || [];
  if (!bt || bt === 'Unknown') recs.push({ icon: 'water', color: '#e74c3c', title: 'Know Your Blood Type', desc: 'Knowing your blood type is critical in emergencies.', urgency: 'high' });
  if (allergies.length === 0) recs.push({ icon: 'alert-circle', color: '#e67e22', title: 'Document Allergies', desc: 'Recording allergies ensures emergency responders provide safe treatment.', urgency: 'medium' });
  if (conditions.some(c => c.toLowerCase().includes('diabetes'))) recs.push({ icon: 'fitness', color: '#2980b9', title: 'Diabetes First Aid Kit', desc: 'Keep glucose tablets, glucagon, and your medical ID accessible.', urgency: 'high' });
  if (conditions.some(c => c.toLowerCase().includes('hypertension') || c.toLowerCase().includes('blood pressure'))) recs.push({ icon: 'heart', color: '#e74c3c', title: 'Hypertension Awareness', desc: 'Learn to recognize hypertensive crisis: severe headache, chest pain, blurred vision.', urgency: 'high' });
  if (conditions.some(c => c.toLowerCase().includes('asthma'))) recs.push({ icon: 'medical', color: '#8e44ad', title: 'Asthma Action Plan', desc: 'Always carry your inhaler. Learn triggers and have a written action plan.', urgency: 'high' });
  if (conditions.some(c => c.toLowerCase().includes('heart'))) recs.push({ icon: 'pulse', color: '#e74c3c', title: 'Cardiac Emergency Prep', desc: 'Inform household members of your condition. Keep nitroglycerin accessible.', urgency: 'high' });
  if (allergies.some(a => ['peanut','bee','shellfish'].some(k => a.toLowerCase().includes(k)))) recs.push({ icon: 'warning', color: '#c0392b', title: 'Carry an EpiPen', desc: 'Severe allergies can cause anaphylaxis. Always have an epinephrine auto-injector.', urgency: 'critical' });
  recs.push({ icon: 'people', color: '#27ae60', title: 'Add Emergency Contacts', desc: 'Ensure at least 2 to 3 emergency contacts are saved for responders.', urgency: 'medium' });
  recs.push({ icon: 'book', color: '#2980b9', title: 'Learn CPR', desc: 'CPR is the most important life-saving skill. Take a certified course.', urgency: 'medium' });
  return recs.slice(0, 5);
};

// ── Context ──
const ProfileCtx = createContext(null);
export const useProfile = () => useContext(ProfileCtx);

export function ProfileProvider({ children }) {
  const dispatch = useDispatch();
  const { user, isGuest } = useSelector((state) => state.auth);
  const userId   = user?._id || user?.id || 'guest';

  const [profile, setProfile]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [editing, setEditing]           = useState(false);
  const [bloodType, setBloodType]       = useState('Unknown');
  const [allergies, setAllergies]       = useState('');
  const [conditions, setConditions]     = useState('');
  const [saving, setSaving]             = useState(false);
  const [callHistory, setCallHistory]   = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [showPrivacy, setShowPrivacy]   = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAbout, setShowAbout]       = useState(false);
  const [showEdit, setShowEdit]         = useState(false);

  const [isDownloaded,     setIsDownloaded]     = useState(false);
  const [downloading,      setDownloading]      = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const GUIDES_DOWNLOAD_KEY = 'medifirst_guides_downloaded';
  const TOTAL_GUIDES        = 9;

  const CALL_KEY  = `medifirst_call_history_${userId}`;
  const PHOTO_KEY = `medifirst_profile_image_${userId}`;

  const fetchProfile = async () => {
    try {
      const res = await api.get('/user/profile');
      setProfile(res.data.user);
      setBloodType(res.data.user.medicalProfile?.bloodType || 'Unknown');
      setAllergies((res.data.user.medicalProfile?.allergies || []).join(', '));
      setConditions((res.data.user.medicalProfile?.medicalConditions || []).join(', '));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  const loadCalls = async () => {
    try { const r = await AsyncStorage.getItem(CALL_KEY); if (r) setCallHistory(JSON.parse(r)); } catch (_) {}
  };
  const loadPhoto = async () => {
    try { const s = await AsyncStorage.getItem(PHOTO_KEY); if (s) setProfileImage(s); } catch (_) {}
  };

  useEffect(() => { fetchProfile(); loadPhoto(); checkDownloaded(); }, []);
  useFocusEffect(useCallback(() => { loadCalls(); }, [userId]));

  const checkDownloaded = async () => {
    try { const v = await AsyncStorage.getItem(GUIDES_DOWNLOAD_KEY); if (v === 'true') setIsDownloaded(true); } catch (_) {}
  };

  const handleDownload = async () => {
    if (isDownloaded) {
      Alert.alert('Already Downloaded', `All ${TOTAL_GUIDES} guides are saved on your device and work without internet.`, [
        { text: 'Remove Download', style: 'destructive', onPress: confirmRemove },
        { text: 'OK', style: 'cancel' },
      ]);
      return;
    }
    setDownloading(true);
    setDownloadProgress(0);
    try {
      for (let i = 1; i <= TOTAL_GUIDES; i++) {
        await new Promise(r => setTimeout(r, 200));
        setDownloadProgress(i);
      }
      await AsyncStorage.setItem(GUIDES_DOWNLOAD_KEY, 'true');
      setIsDownloaded(true);
      Alert.alert('All Guides Saved!', `${TOTAL_GUIDES} first-aid guides are now on your device. They will load instantly even without internet or an account.`);
    } catch (_) {
      Alert.alert('Error', 'Could not save guides. Please try again.');
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  };
  const confirmRemove = async () => {
    try { await AsyncStorage.removeItem(GUIDES_DOWNLOAD_KEY); setIsDownloaded(false); } catch (_) {}
  };

  const showPhotoOptions = () => Alert.alert('Select Photo', 'Choose source', [
    { text: 'Take Photo', onPress: openCamera },
    { text: 'Choose from Gallery', onPress: openGallery },
    { text: 'Cancel', style: 'cancel' },
  ]);
  const confirmRemovePhoto = () => Alert.alert('Remove Photo', 'Remove your profile photo?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Remove', style: 'destructive', onPress: removePhoto },
  ]);
  const pickPhoto = () => {
    if (profileImage) Alert.alert('Profile Photo', 'What would you like to do?', [
      { text: 'Change Photo', onPress: showPhotoOptions },
      { text: 'Remove Photo', style: 'destructive', onPress: confirmRemovePhoto },
      { text: 'Cancel', style: 'cancel' },
    ]);
    else showPhotoOptions();
  };
  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Denied', 'Camera access is required.'); return; }
    const r = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1,1], quality: 0.7 });
    if (!r.canceled) savePhoto(r.assets[0].uri);
  };
  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Denied', 'Gallery access is required.'); return; }
    const r = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1,1], quality: 0.7 });
    if (!r.canceled) savePhoto(r.assets[0].uri);
  };
  const savePhoto   = async (uri) => { setProfileImage(uri); try { await AsyncStorage.setItem(PHOTO_KEY, uri); } catch (_) {} };
  const removePhoto = async ()    => { setProfileImage(null); try { await AsyncStorage.removeItem(PHOTO_KEY); } catch (_) {} };

  const logCall = async (number, label) => {
    const entry   = { number, label, timestamp: new Date().toISOString(), id: Date.now().toString() };
    const updated = [entry, ...callHistory].slice(0, 50);
    setCallHistory(updated);
    try { await AsyncStorage.setItem(CALL_KEY, JSON.stringify(updated)); } catch (_) {}
    Linking.openURL('tel:' + number);
  };
  const clearCalls = () => Alert.alert('Clear History', 'Remove all call history?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Clear', style: 'destructive', onPress: async () => { setCallHistory([]); await AsyncStorage.removeItem(CALL_KEY); } },
  ]);
  const saveMedical = async () => {
    try {
      setSaving(true);
      await api.put('/user/medical-profile', {
        bloodType,
        allergies:         allergies.split(',').map(a => a.trim()).filter(Boolean),
        medicalConditions: conditions.split(',').map(c => c.trim()).filter(Boolean),
      });
      await fetchProfile(); setEditing(false);
      Alert.alert('Saved', 'Medical profile updated successfully.');
    } catch { Alert.alert('Error', 'Failed to update profile.'); }
    finally { setSaving(false); }
  };
  const handleLogout = () => Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign Out', style: 'destructive', onPress: () => dispatch(logout()) },
  ]);
  const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

  const value = {
    user, isGuest, profile, loading, editing, setEditing,
    bloodType, setBloodType, allergies, setAllergies, conditions, setConditions,
    saving, callHistory, profileImage, pickPhoto, logCall, clearCalls,
    saveMedical, handleLogout, fmtDate, fetchProfile,
    setShowPrivacy, setShowFeedback, setShowAbout, setShowEdit,
    isDownloaded, downloading, downloadProgress, handleDownload,
  };

  return <ProfileCtx.Provider value={value}>{children}</ProfileCtx.Provider>;
}

// ── Shared header used by each section screen (matches GuidesListScreen) ──
export function SectionHeader({ title, icon, onBack }) {
  return (
    <View>
      <View style={hS.header}>
        <View style={hS.headerIcon}><Ionicons name={icon} size={20} color="#fff" /></View>
        <View style={{ flex: 1 }}>
          <Text style={hS.headerTitle}>{title}</Text>
        </View>
        <TouchableOpacity onPress={onBack} style={hS.headerCloseBtn} activeOpacity={0.85}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const hS = StyleSheet.create({
  header:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e74c3c', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  headerIcon:     { width: 44, height: 44, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle:    { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerCloseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
});
