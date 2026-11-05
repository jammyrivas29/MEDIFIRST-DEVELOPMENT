import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, TextInput, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useProfile, SectionHeader } from './ProfileContext';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'];

export default function MedicalScreen() {
  const navigation = useNavigation();
  const { profile, isGuest, editing, setEditing, bloodType, setBloodType, allergies, setAllergies, conditions, setConditions, saving, saveMedical } = useProfile();
  const allergyList = profile?.medicalProfile?.allergies || [];
  const condList    = profile?.medicalProfile?.medicalConditions || [];

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#e74c3c' }}>
        {Platform.OS === 'android' && <View style={{ height: StatusBar.currentHeight || 0 }} />}
        <SectionHeader title="Medical Profile" icon="medical" onBack={() => navigation.goBack()} />
      </SafeAreaView>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false}>
        <View style={s.secHeader}>
          <Text style={s.secLabel}>Medical Profile</Text>
          {!isGuest && (
            <TouchableOpacity style={[s.editToggle, editing && s.editToggleOn]} onPress={() => setEditing(!editing)}>
              <Ionicons name={editing ? 'close' : 'create-outline'} size={14} color={editing ? '#fff' : '#666'} />
              <Text style={[s.editToggleTxt, editing && { color: '#fff' }]}>{editing ? 'Cancel' : 'Edit'}</Text>
            </TouchableOpacity>
          )}
        </View>
        {isGuest && (
          <View style={s.guestNote}>
            <Ionicons name="information-circle-outline" size={14} color="#e67e22" />
            <Text style={s.guestNoteTxt}>Sign in to add or edit your medical profile.</Text>
          </View>
        )}

        <View style={s.medicalCard}>
          <View style={s.medicalRow}>
            <View style={[s.medicalRowIcon, { backgroundColor: '#fdecea' }]}>
              <Ionicons name="water" size={20} color="#e74c3c" />
            </View>
            <View style={s.medicalRowBody}>
              <Text style={s.medicalRowTitle}>Blood Type</Text>
              {editing ? (
                <View style={s.bloodGrid}>
                  {BLOOD_TYPES.map(bt => (
                    <TouchableOpacity key={bt} style={[s.btChip, bloodType === bt && s.btChipOn]} onPress={() => setBloodType(bt)}>
                      <Text style={[s.btChipTxt, bloodType === bt && s.btChipTxtOn]}>{bt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={s.medicalRowValue}>
                  {profile?.medicalProfile?.bloodType || '—'}
                  <Text style={s.medicalRowHint}>{(!profile?.medicalProfile?.bloodType || profile.medicalProfile.bloodType === 'Unknown') ? '  Tap Edit to record' : '  On record'}</Text>
                </Text>
              )}
            </View>
          </View>

          <View style={s.medicalDivider} />

          <View style={s.medicalRow}>
            <View style={[s.medicalRowIcon, { backgroundColor: '#fef5ec' }]}>
              <Ionicons name="alert-circle" size={20} color="#e67e22" />
            </View>
            <View style={s.medicalRowBody}>
              <Text style={s.medicalRowTitle}>Allergies</Text>
              {editing
                ? <TextInput style={s.textArea} value={allergies} onChangeText={setAllergies} placeholder="e.g. Nickel, Peanuts" placeholderTextColor="#ccc" multiline />
                : allergyList.length
                  ? <View style={s.tagWrap}>{allergyList.map((a, i) => <View key={i} style={[s.tag, { backgroundColor: '#fef5ec', borderColor: '#fde3c8' }]}><Ionicons name="alert-circle" size={10} color="#e67e22" /><Text style={[s.tagTxt, { color: '#e67e22' }]}>{a}</Text></View>)}</View>
                  : <Text style={s.nilTxt}>No allergies recorded</Text>
              }
            </View>
          </View>

          <View style={s.medicalDivider} />

          <View style={s.medicalRow}>
            <View style={[s.medicalRowIcon, { backgroundColor: '#e8f4fb' }]}>
              <Ionicons name="fitness" size={20} color="#2980b9" />
            </View>
            <View style={s.medicalRowBody}>
              <Text style={s.medicalRowTitle}>Medical Conditions</Text>
              {editing
                ? <TextInput style={s.textArea} value={conditions} onChangeText={setConditions} placeholder="e.g. Diabetes, Infectious Diseases" placeholderTextColor="#ccc" multiline />
                : condList.length
                  ? <View style={s.tagWrap}>{condList.map((c, i) => <View key={i} style={[s.tag, { backgroundColor: '#e8f4fb', borderColor: '#c5dff1' }]}><Ionicons name="fitness" size={10} color="#2980b9" /><Text style={[s.tagTxt, { color: '#2980b9' }]}>{c}</Text></View>)}</View>
                  : <Text style={s.nilTxt}>No conditions recorded</Text>
              }
            </View>
          </View>
        </View>

        {editing && (
          <TouchableOpacity style={s.saveBtn} onPress={saveMedical} disabled={saving} activeOpacity={0.85}>
            {saving ? <ActivityIndicator size="small" color="#fff" /> : <><Ionicons name="checkmark-circle" size={16} color="#fff" /><Text style={s.saveBtnTxt}>Save Medical Profile</Text></>}
          </TouchableOpacity>
        )}

        <View style={s.tipsCard}>
          <View style={s.tipsHeader}>
            <View style={s.tipsHeaderIcon}>
              <Ionicons name="bulb" size={18} color="#f39c12" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.tipsTitle}>Personalized Health Tips</Text>
              <Text style={s.tipsSub}>Based on your medical profile</Text>
            </View>
          </View>

          {allergyList.length > 0 && (
            <View style={s.tipItem}>
              <View style={s.tipDot} />
              <View style={{ flex: 1 }}>
                <Text style={s.tipBold}>Allergies Alert:</Text>
                <Text style={s.tipText}>You have {allergyList.length} recorded allerg{allergyList.length === 1 ? 'y' : 'ies'}. Always inform healthcare providers and check medicine labels.</Text>
              </View>
            </View>
          )}

          {condList.length > 0 && (
            <View style={s.tipItem}>
              <View style={s.tipDot} />
              <View style={{ flex: 1 }}>
                <Text style={s.tipBold}>Medical Conditions:</Text>
                <Text style={s.tipText}>Keep medications accessible and know your condition's emergency symptoms. Share this profile with emergency contacts.</Text>
              </View>
            </View>
          )}

          {bloodType && bloodType !== 'Unknown' && (
            <View style={s.tipItem}>
              <View style={s.tipDot} />
              <View style={{ flex: 1 }}>
                <Text style={s.tipBold}>Blood Type {bloodType}:</Text>
                <Text style={s.tipText}>In emergencies, medical staff will use your blood type for transfusions. Wear a medical alert ID.</Text>
              </View>
            </View>
          )}

          {allergyList.length === 0 && condList.length === 0 && (!bloodType || bloodType === 'Unknown') && (
            <View style={s.tipItem}>
              <View style={s.tipDot} />
              <View style={{ flex: 1 }}>
                <Text style={s.tipBold}>Complete Your Profile:</Text>
                <Text style={s.tipText}>Add your blood type, allergies, and medical conditions so we can give you personalized health advice.</Text>
              </View>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#f0f2f5' },
  scroll:      { flex: 1 },
  scrollPad:   { padding: 14, paddingTop: 16 },
  secHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  secLabel:    { fontSize: 15, fontWeight: '800', color: '#1a1a2e' },
  editToggle:  { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#f2f2f2', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  editToggleOn:{ backgroundColor: '#e74c3c' },
  editToggleTxt:{ fontSize: 12, fontWeight: '700', color: '#666' },
  guestNote:   { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fef9e7', padding: 12, borderRadius: 12, marginBottom: 12 },
  guestNoteTxt:{ flex: 1, fontSize: 12, color: '#856404' },
  medicalCard:    { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
  medicalRow:     { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 15, gap: 14 },
  medicalRowIcon: { width: 44, height: 44, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  medicalRowBody: { flex: 1 },
  medicalRowTitle:{ fontSize: 14, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  medicalRowValue:{ fontSize: 16, fontWeight: '800', color: '#1a1a2e' },
  medicalRowHint: { fontSize: 11, fontWeight: '500', color: '#999' },
  medicalDivider: { height: 1, backgroundColor: '#f5f5f5', marginHorizontal: 16 },
  bloodGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  btChip:      { paddingHorizontal: 13, paddingVertical: 7, borderRadius: 10, backgroundColor: '#f5f5f5', borderWidth: 1.5, borderColor: '#eee' },
  btChipOn:    { backgroundColor: '#e74c3c', borderColor: '#e74c3c' },
  btChipTxt:   { fontSize: 12, fontWeight: '700', color: '#666' },
  btChipTxtOn: { color: '#fff' },
  textArea:    { backgroundColor: '#f8f8f8', borderRadius: 10, borderWidth: 1, borderColor: '#eee', padding: 12, fontSize: 14, color: '#222', minHeight: 60, textAlignVertical: 'top' },
  tagWrap:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag:         { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  tagTxt:      { fontSize: 12, fontWeight: '600' },
  nilTxt:      { fontSize: 13, color: '#bbb', fontStyle: 'italic' },
  saveBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#e74c3c', borderRadius: 14, paddingVertical: 15, elevation: 3 },
  saveBtnTxt:  { fontSize: 15, fontWeight: '800', color: '#fff' },
  tipsCard:    { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', marginTop: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
  tipsHeader:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12, backgroundColor: '#fef9e7', borderBottomWidth: 1, borderBottomColor: '#fde9c2' },
  tipsHeaderIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#fef5e7', justifyContent: 'center', alignItems: 'center' },
  tipsTitle:   { fontSize: 16, fontWeight: '800', color: '#1a1a2e', marginBottom: 2 },
  tipsSub:     { fontSize: 11, color: '#f39c12', fontWeight: '600', letterSpacing: 0.3 },
  tipItem:     { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  tipDot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: '#f39c12', marginTop: 8 },
  tipBold:     { fontSize: 14, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  tipText:     { fontSize: 13, lineHeight: 18, color: '#555' },
});
