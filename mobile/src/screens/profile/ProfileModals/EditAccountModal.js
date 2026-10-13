import React, { useState } from 'react';
import { View, Text, ScrollView, Modal, SafeAreaView, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../api/axiosConfig';
import ModalHeader from './ModalHeader';

export default function EditAccountModal({ visible, onClose, user, onSaved }) {
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName,  setLastName]  = useState(user?.lastName  || '');
  const [email,     setEmail]     = useState(user?.email     || '');
  const [phone,     setPhone]     = useState(user?.phoneNumber || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving,    setSaving]    = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const resetPw = () => { setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setShowPw(false); };
  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) { Alert.alert('Missing Fields', 'First and last name are required.'); return; }
    if (!isValidEmail(email)) { Alert.alert('Invalid Email', 'Please enter a valid email address.'); return; }
    try {
      setSaving(true);
      await api.put('/user/profile', { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim().toLowerCase(), phoneNumber: phone.trim() });
      Alert.alert('Saved', 'Your account has been updated.');
      onSaved(); onClose();
    } catch (e) { Alert.alert('Error', e?.response?.data?.message || 'Failed to update account.'); }
    finally { setSaving(false); }
  };
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) { Alert.alert('Missing Fields', 'Please fill in all password fields.'); return; }
    if (newPassword.length < 6) { Alert.alert('Weak Password', 'New password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { Alert.alert('Mismatch', 'New password and confirmation do not match.'); return; }
    try {
      setChangingPass(true);
      await api.put('/user/password', { currentPassword, newPassword, confirmPassword });
      Alert.alert('Success', 'Your password has been changed.');
      resetPw();
    } catch (e) { Alert.alert('Error', e?.response?.data?.message || 'Failed to change password.'); }
    finally { setChangingPass(false); }
  };
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <ModalHeader title="Edit Account" onClose={onClose} />
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 24 }} keyboardShouldPersistTaps="handled">
          {[
            { label: 'First Name',    value: firstName, set: setFirstName, icon: 'person-outline',  kbType: 'default',       cap: 'words', maxLen: 50  },
            { label: 'Last Name',     value: lastName,  set: setLastName,  icon: 'person-outline',  kbType: 'default',       cap: 'words', maxLen: 50  },
            { label: 'Email Address', value: email,     set: setEmail,     icon: 'mail-outline',    kbType: 'email-address', cap: 'none',  maxLen: 100 },
          ].map(({ label, value, set, icon, kbType, cap, maxLen }) => (
            <View key={label} style={{ marginBottom: 14 }}>
              <Text style={eS.label}>{label}</Text>
              <View style={eS.inputRow}>
                <Ionicons name={icon} size={17} color="#ccc" style={{ marginRight: 10 }} />
                <TextInput style={eS.input} value={value} onChangeText={set} keyboardType={kbType} autoCapitalize={cap} autoCorrect={false} maxLength={maxLen} />
                {value.trim() ? <Ionicons name="checkmark-circle" size={16} color="#27ae60" /> : null}
              </View>
            </View>
          ))}
          <Text style={eS.label}>Phone Number</Text>
          <View style={[eS.inputRow, { marginBottom: 24 }]}>
            <Ionicons name="call-outline" size={17} color="#ccc" style={{ marginRight: 10 }} />
            <TextInput style={eS.input} value={phone} onChangeText={v => setPhone(v.replace(/\D/g,'').slice(0,11))} keyboardType="number-pad" maxLength={11} placeholder="09XXXXXXXXX (optional)" placeholderTextColor="#ccc" />
            {phone.length === 11 ? <Ionicons name="checkmark-circle" size={16} color="#27ae60" /> : phone.length > 0 ? <Text style={{ fontSize: 11, color: '#f39c12', fontWeight: '700' }}>{phone.length}/11</Text> : null}
          </View>

          <View style={eS.pwDivider}><Text style={eS.pwDividerTxt}>Change Password</Text></View>
          {[
            { label: 'Current Password',     value: currentPassword, set: setCurrentPassword, ph: 'Enter current password' },
            { label: 'New Password',         value: newPassword,     set: setNewPassword,     ph: 'At least 6 characters' },
            { label: 'Confirm New Password', value: confirmPassword, set: setConfirmPassword, ph: 'Re-enter new password' },
          ].map(({ label, value, set, ph }) => (
            <View key={label} style={{ marginBottom: 14 }}>
              <Text style={eS.label}>{label}</Text>
              <View style={eS.inputRow}>
                <Ionicons name="lock-closed-outline" size={17} color="#ccc" style={{ marginRight: 10 }} />
                <TextInput style={eS.input} value={value} onChangeText={set} secureTextEntry={!showPw} placeholder={ph} placeholderTextColor="#ccc" autoCapitalize="none" autoCorrect={false} maxLength={64} />
                <TouchableOpacity onPress={() => setShowPw(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={17} color="#999" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <TouchableOpacity style={eS.pwBtn} onPress={handleChangePassword} disabled={changingPass} activeOpacity={0.85}>
            {changingPass ? <ActivityIndicator color="#fff" size="small" /> : <><Ionicons name="key-outline" size={17} color="#fff" /><Text style={eS.pwBtnText}>Update Password</Text></>}
          </TouchableOpacity>

          <TouchableOpacity style={eS.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
            {saving ? <ActivityIndicator color="#fff" size="small" /> : <><Ionicons name="checkmark" size={18} color="#fff" /><Text style={eS.saveBtnText}>Save Changes</Text></>}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
const eS = StyleSheet.create({
  label:      { fontSize: 11, fontWeight: '700', color: '#999', marginBottom: 8 },
  inputRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 4, borderWidth: 1.5, borderColor: '#eee' },
  input:      { flex: 1, paddingVertical: 13, fontSize: 14, color: '#1a1a2e' },
  saveBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#e74c3c', paddingVertical: 16, borderRadius: 14, elevation: 4, shadowColor: '#e74c3c', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  saveBtnText:{ color: '#fff', fontSize: 15, fontWeight: '800' },
  pwDivider:  { marginTop: 8, marginBottom: 18, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 18, alignItems: 'center' },
  pwDividerTxt:{ fontSize: 12, fontWeight: '800', color: '#888', letterSpacing: 0.5, textTransform: 'uppercase' },
  pwBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1a1a2e', paddingVertical: 14, borderRadius: 14, marginBottom: 14, elevation: 3, shadowColor: '#1a1a2e', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6 },
  pwBtnText:  { color: '#fff', fontSize: 14, fontWeight: '800' },
});
