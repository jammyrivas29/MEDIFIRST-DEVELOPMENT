import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, TextInput, Alert, ActivityIndicator, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import api from '../../api/axiosConfig';
import { SectionHeader, useProfile } from './ProfileContext';

export default function ContactsScreen() {
  const navigation = useNavigation();
  const { logCall } = useProfile();
  const { isGuest } = useSelector((state) => state.auth);
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ name: '', relationship: '', phoneNumber: '' });
  const [errors, setErrors]     = useState({});
  const [showRelPicker, setShowRelPicker] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [loading, setLoading]   = useState(true);

  const RELATIONSHIPS = ['Mom','Dad','Mother','Father','Spouse','Husband','Wife','Brother','Sister','Sibling','Son','Daughter','Child','Friend','Guardian','Partner','Other'];
  const NAME_RE = /^[A-Za-z][A-Za-z .'\-/]*$/;
  const validateName = (v) => {
    const t = (v || '').trim();
    if (!t) return 'Name is required.';
    if (t.length < 2) return 'Name is too short.';
    if (!NAME_RE.test(t)) return 'Use letters only (no numbers or symbols).';
    return '';
  };
  const validateRelationship = (v) => {
    const t = (v || '').trim();
    if (!t) return 'Relationship is required.';
    if (t.length < 2) return 'Relationship is too short.';
    if (!NAME_RE.test(t)) return 'Enter a real relationship (e.g. Mom, Spouse) — letters only.';
    return '';
  };
  const validatePhone = (v) => {
    const t = (v || '').trim();
    if (!t) return 'Phone number is required.';
    if (/[A-Za-z]/.test(t)) return 'Phone number must contain digits only.';
    const digits = t.replace(/[\s\-()]/g, '');
    if (/^\+?63\d{10}$/.test(digits)) return '';
    if (/^09\d{9}$/.test(digits)) return '';
    if (digits.length < 10) return 'Phone number is too short.';
    if (digits.length > 13) return 'Phone number is too long.';
    return 'Enter a valid PH mobile number (e.g. 0912 345 6789 or +63 912 345 6789).';
  };
  const validateAll = () => ({ name: validateName(form.name), relationship: validateRelationship(form.relationship), phoneNumber: validatePhone(form.phoneNumber) });

  useEffect(() => { fetchContacts(); }, []);
  const fetchContacts = async () => {
    try { const r = await api.get('/user/emergency-contacts'); setContacts(r.data.contacts || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  const addContact = async () => {
    const errs = validateAll();
    setErrors(errs);
    if (errs.name || errs.relationship || errs.phoneNumber) { Alert.alert('Check Your Entry', 'Please fix the highlighted fields.'); return; }
    try {
      setSaving(true);
      await api.post('/user/emergency-contacts', form);
      await fetchContacts(); setForm({ name: '', relationship: '', phoneNumber: '' }); setErrors({}); setShowForm(false);
    } catch { Alert.alert('Error', 'Failed to add contact.'); } finally { setSaving(false); }
  };
  const deleteContact = (id, name) => Alert.alert('Remove Contact', 'Remove ' + name + '?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Remove', style: 'destructive', onPress: async () => { await api.delete('/user/emergency-contacts/' + id); fetchContacts(); } },
  ]);

  const AVATAR_COLORS = { mom:'#e74c3c', dad:'#e74c3c', mother:'#e74c3c', father:'#e74c3c', spouse:'#8e44ad', wife:'#8e44ad', husband:'#8e44ad', friend:'#2980b9', sibling:'#27ae60', brother:'#27ae60', sister:'#27ae60' };
  const getInitials   = (n) => n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const getColor      = (rel) => AVATAR_COLORS[rel?.toLowerCase()] || '#e74c3c';

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#e74c3c' }}>
        {Platform.OS === 'android' && <View style={{ height: StatusBar.currentHeight || 0 }} />}
        <SectionHeader title="Emergency Contacts" icon="people" onBack={() => navigation.goBack()} />
      </SafeAreaView>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={s.center}><ActivityIndicator size="small" color="#e74c3c" /></View>
        ) : (
          <>
            <View style={s.secHeader}>
              <Text style={s.secLabel}>Emergency Contacts</Text>
              {!isGuest && (
                <TouchableOpacity style={[s.addBtn, showForm && { backgroundColor: '#aaa' }]} onPress={() => setShowForm(!showForm)}>
                  <Ionicons name={showForm ? 'close' : 'add'} size={14} color="#fff" />
                  <Text style={s.addBtnTxt}>{showForm ? 'Cancel' : 'Add'}</Text>
                </TouchableOpacity>
              )}
            </View>

            {isGuest && (
              <View style={s.guestNote}>
                <Ionicons name="information-circle-outline" size={14} color="#e67e22" />
                <Text style={s.guestNoteTxt}>Sign in to add or manage emergency contacts.</Text>
              </View>
            )}

            {showForm && (
              <View style={s.featureCard}>
                <View style={[s.featureCardIcon, { backgroundColor: '#e8f4fb' }]}>
                  <Ionicons name="person-add" size={22} color="#2980b9" />
                </View>
                <Text style={s.featureCardTitle}>New Emergency Contact</Text>
                {[
                  { val: form.name,         key: 'name',          ph: 'Full Name ',   kb: 'default',   label: 'Full Name' },
                  { val: form.phoneNumber,  key: 'phoneNumber',   ph: 'Phone Number ', kb: 'phone-pad', label: 'Phone Number' },
                ].map(f => (
                  <View key={f.key} style={{ marginBottom: 4 }}>
                    <TextInput
                      style={[s.textArea, errors[f.key] && s.inputError]}
                      value={f.val}
                      onChangeText={v => { setForm({ ...form, [f.key]: v }); if (errors[f.key]) setErrors({ ...errors, [f.key]: '' }); }}
                      placeholder={f.ph}
                      placeholderTextColor="#ccc"
                      keyboardType={f.kb}
                      autoCapitalize={f.key === 'phoneNumber' ? 'none' : 'words'}
                    />
                    {errors[f.key] ? <Text style={s.fieldError}>{errors[f.key]}</Text> : null}
                  </View>
                ))}
                <Text style={s.fieldLabel}>Relationship</Text>
                <TouchableOpacity style={[s.dropdownBtn, errors.relationship && s.inputError]} onPress={() => setShowRelPicker(true)} activeOpacity={0.85}>
                  <Text style={form.relationship ? s.dropdownBtnTxt : s.dropdownPlaceholder}>
                    {form.relationship || 'Select relationship (e.g. Mom, Spouse)'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#999" />
                </TouchableOpacity>
                {errors.relationship ? <Text style={s.fieldError}>{errors.relationship}</Text> : null}
                {form.relationship === 'Other' && (
                  <View style={{ marginTop: 8 }}>
                    <TextInput
                      style={[s.textArea, errors.relationship && s.inputError]}
                      value={form.relationshipCustom || ''}
                      onChangeText={v => { setForm({ ...form, relationship: v.trim() }); if (errors.relationship) setErrors({ ...errors, relationship: '' }); }}
                      placeholder="Type relationship (letters only)"
                      placeholderTextColor="#ccc"
                      autoCapitalize="words"
                    />
                  </View>
                )}
                <Modal visible={showRelPicker} transparent animationType="slide" onRequestClose={() => setShowRelPicker(false)}>
                  <View style={s.pickerOverlay}>
                    <View style={s.pickerSheet}>
                      <View style={s.pickerHandle} />
                      <Text style={s.pickerTitle}>Select Relationship</Text>
                      <ScrollView style={s.pickerList} keyboardShouldPersistTaps="handled">
                        {RELATIONSHIPS.map(r => (
                          <TouchableOpacity key={r} style={[s.pickerItem, form.relationship === r && s.pickerItemOn]} onPress={() => { setForm({ ...form, relationship: r }); setErrors({ ...errors, relationship: '' }); setShowRelPicker(false); }} activeOpacity={0.8}>
                            <Text style={[s.pickerItemTxt, form.relationship === r && s.pickerItemTxtOn]}>{r}</Text>
                            {form.relationship === r && <Ionicons name="checkmark" size={18} color="#e74c3c" />}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                      <TouchableOpacity style={s.pickerCancel} onPress={() => setShowRelPicker(false)} activeOpacity={0.85}>
                        <Text style={s.pickerCancelTxt}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
                <TouchableOpacity style={s.saveBtn} onPress={addContact} disabled={saving} activeOpacity={0.85}>
                  {saving ? <ActivityIndicator size="small" color="#fff" /> : <><Ionicons name="person-add" size={14} color="#fff" /><Text style={s.saveBtnTxt}>Add Contact</Text></>}
                </TouchableOpacity>
              </View>
            )}

            {contacts.length === 0 && !showForm ? (
              <View style={s.emptyState}>
                <View style={[s.emptyIconBox, { backgroundColor: '#e8f4fb' }]}>
                  <Ionicons name="people-outline" size={32} color="#2980b9" />
                </View>
                <Text style={s.emptyTitle}>No Contacts Yet</Text>
                <Text style={s.emptyDesc}>Add emergency contacts so responders can reach your family.</Text>
                <TouchableOpacity style={[s.saveBtn, { marginTop: 20, paddingHorizontal: 28 }]} onPress={() => setShowForm(true)}>
                  <Ionicons name="add" size={14} color="#fff" /><Text style={s.saveBtnTxt}>Add First Contact</Text>
                </TouchableOpacity>
              </View>
            ) : (
              contacts.map(c => (
                <View key={c._id} style={s.contactCard}>
                  <View style={[s.contactAvatar, { backgroundColor: getColor(c.relationship) }]}>
                    <Text style={s.contactAvatarTxt}>{getInitials(c.name)}</Text>
                  </View>
                  <View style={s.contactBody}>
                    <Text style={s.contactName}>{c.name}</Text>
                    <View style={s.contactMeta}>
                      <Ionicons name="heart-outline" size={10} color="#ccc" />
                      <Text style={s.contactRel}>{c.relationship}</Text>
                    </View>
                    <View style={s.contactMeta}>
                      <Ionicons name="call-outline" size={10} color="#e74c3c" />
                      <Text style={s.contactPhone}>{c.phoneNumber}</Text>
                    </View>
                  </View>
                  <View style={{ gap: 8 }}>
                    <TouchableOpacity style={s.callBtn} onPress={() => logCall(c.phoneNumber, c.name)}>
                      <Ionicons name="call" size={14} color="#fff" />
                    </TouchableOpacity>
                    {!isGuest && (
                      <TouchableOpacity style={s.delBtn} onPress={() => deleteContact(c._id, c.name)}>
                        <Ionicons name="trash-outline" size={14} color="#e74c3c" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0f2f5' },
  scroll: { flex: 1 },
  scrollPad: { padding: 14, paddingTop: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40 },
  secHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  secLabel:  { fontSize: 17, fontWeight: '900', color: '#1a1a2e' },
  guestNote: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fef9ef', borderWidth: 1, borderColor: '#fbe3bf', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, marginBottom: 12 },
  guestNoteTxt: { fontSize: 12, color: '#b9770e', fontWeight: '600', flex: 1, flexWrap: 'wrap' },
  featureCard:     { backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  featureCardIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  featureCardTitle:{ fontSize: 15, fontWeight: '900', color: '#1a1a2e', marginBottom: 10 },
  textArea: { borderWidth: 1.5, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#333', backgroundColor: '#fafafa', marginBottom: 10, textAlignVertical: 'top', minHeight: 60 },
  inputError: { borderColor: '#e74c3c', backgroundColor: '#fff5f5' },
  fieldError: { fontSize: 11, color: '#e74c3c', fontWeight: '600', marginTop: -4, marginBottom: 8, marginLeft: 4 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#555', marginBottom: 6, marginLeft: 2 },
  dropdownBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, backgroundColor: '#fafafa', marginBottom: 4 },
  dropdownBtnTxt: { fontSize: 14, color: '#333', fontWeight: '600' },
  dropdownPlaceholder: { fontSize: 14, color: '#ccc' },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  pickerSheet: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingBottom: 16, maxHeight: '80%' },
  pickerHandle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#ddd', alignSelf: 'center', marginVertical: 10 },
  pickerTitle: { fontSize: 16, fontWeight: '800', color: '#1a1a2e', textAlign: 'center', marginBottom: 8 },
  pickerList: { maxHeight: 360 },
  pickerItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f4f4f4' },
  pickerItemOn: { backgroundColor: '#fdecea' },
  pickerItemTxt: { fontSize: 15, color: '#333', fontWeight: '600' },
  pickerItemTxtOn: { color: '#e74c3c', fontWeight: '800' },
  pickerCancel: { marginTop: 10, marginHorizontal: 20, backgroundColor: '#f0f0f0', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  pickerCancelTxt: { fontSize: 15, fontWeight: '700', color: '#555' },
  saveBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#e74c3c', paddingVertical: 15, borderRadius: 14, elevation: 4, shadowColor: '#e74c3c', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 8 },
  saveBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },
  addBtn:          { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#e74c3c', paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20 },
  addBtnTxt:       { color: '#fff', fontSize: 12, fontWeight: '700' },
  contactCard:     { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
  contactAvatar:   { width: 48, height: 48, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  contactAvatarTxt:{ color: '#fff', fontWeight: '900', fontSize: 15 },
  contactBody:     { flex: 1 },
  contactName:     { fontSize: 14, fontWeight: '800', color: '#1a1a2e', marginBottom: 4 },
  contactMeta:     { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  contactRel:      { fontSize: 11, color: '#aaa' },
  contactPhone:    { fontSize: 12, color: '#e74c3c', fontWeight: '700' },
  callBtn:         { width: 34, height: 34, borderRadius: 11, backgroundColor: '#27ae60', justifyContent: 'center', alignItems: 'center' },
  delBtn:          { width: 34, height: 34, borderRadius: 11, backgroundColor: '#fdecea', justifyContent: 'center', alignItems: 'center' },
  emptyState:  { alignItems: 'center', paddingVertical: 44 },
  emptyIconBox:{ width: 68, height: 68, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  emptyTitle:  { fontSize: 15, fontWeight: '800', color: '#ccc', marginBottom: 6 },
  emptyDesc:   { fontSize: 13, color: '#bbb', textAlign: 'center', lineHeight: 20, paddingHorizontal: 30 },
});
