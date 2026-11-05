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
  const [expandPassword, setExpandPassword] = useState(false);

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const resetPw = () => { setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setShowPw(false); };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) { Alert.alert('Missing Fields', 'First and last name are required.'); return; }
    try {
      setSaving(true);
      await api.put('/user/profile', { firstName: firstName.trim(), lastName: lastName.trim(), phoneNumber: phone.trim() });
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

  const InputField = ({ label, value, onChange, icon, kbType = 'default', cap = 'words', maxLen = 100, placeholder = '' }) => (
    <View style={eS.fieldContainer}>
      <View style={eS.labelRow}>
        <Ionicons name={icon} size={16} color="#e74c3c" />
        <Text style={eS.fieldLabel}>{label}</Text>
      </View>
      <TextInput
        style={eS.textInput}
        value={value}
        onChangeText={onChange}
        keyboardType={kbType}
        autoCapitalize={cap}
        autoCorrect={false}
        maxLength={maxLen}
        placeholder={placeholder}
        placeholderTextColor="#ccc"
      />
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f6f8' }}>
        <ModalHeader title="Edit Account" onClose={onClose} />
        <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 16 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* ACCOUNT INFO SECTION */}
          <View style={eS.sectionCard}>
            <View style={eS.sectionHeader}>
              <Ionicons name="person-circle-outline" size={20} color="#e74c3c" />
              <Text style={eS.sectionTitle}>Personal Information</Text>
            </View>
            <View style={eS.divider} />
            
            <InputField label="First Name" value={firstName} onChange={setFirstName} icon="person-outline" cap="words" maxLen={50} />
            <InputField label="Last Name" value={lastName} onChange={setLastName} icon="person-outline" cap="words" maxLen={50} />
            
            {/* Email - Read Only Display */}
            <View style={eS.fieldContainer}>
              <View style={eS.labelRow}>
                <Ionicons name="mail-outline" size={16} color="#e74c3c" />
                <Text style={eS.fieldLabel}>Email Address</Text>
              </View>
              <View style={[eS.textInput, eS.readOnlyInput, eS.emailLockContainer]}>
                <Text style={eS.readOnlyText}>{email}</Text>
                <Ionicons name="lock-closed" size={12} color="#888" style={eS.emailLockIcon} />
              </View>
            </View>
            
            <InputField
              label="Phone Number"
              value={phone}
              onChange={(v) => setPhone(v.replace(/\D/g, '').slice(0, 15))}
              icon="call-outline"
              kbType="number-pad"
              maxLen={15}
              placeholder="(optional)"
            />
          </View>

          {/* SAVE BUTTON */}
          <TouchableOpacity style={eS.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                <Text style={eS.saveBtnText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>

          {/* CHANGE PASSWORD SECTION */}
          <TouchableOpacity
            style={eS.expandBtn}
            onPress={() => setExpandPassword(!expandPassword)}
            activeOpacity={0.75}
          >
            <View style={eS.expandBtnContent}>
              <Ionicons name="lock-closed-outline" size={20} color="#e74c3c" />
              <Text style={eS.expandBtnText}>Change Password</Text>
            </View>
            <Ionicons
              name={expandPassword ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#e74c3c"
            />
          </TouchableOpacity>

          {expandPassword && (
            <View style={eS.passwordCard}>
              <Text style={eS.passwordCardSubtitle}>Enter your current password and choose a new one</Text>

              <View style={eS.pwFieldContainer}>
                <Text style={eS.fieldLabel}>Current Password</Text>
                <View style={eS.pwInputRow}>
                  <TextInput
                    style={eS.pwInput}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry={!showPw}
                    placeholder="Enter current password"
                    placeholderTextColor="#ccc"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity onPress={() => setShowPw(!showPw)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name={showPw ? 'eye-off' : 'eye'} size={18} color="#999" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={eS.pwFieldContainer}>
                <Text style={eS.fieldLabel}>New Password</Text>
                <View style={eS.pwInputRow}>
                  <TextInput
                    style={eS.pwInput}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showPw}
                    placeholder="At least 6 characters"
                    placeholderTextColor="#ccc"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={eS.pwFieldContainer}>
                <Text style={eS.fieldLabel}>Confirm New Password</Text>
                <View style={eS.pwInputRow}>
                  <TextInput
                    style={eS.pwInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPw}
                    placeholder="Re-enter new password"
                    placeholderTextColor="#ccc"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={eS.updatePwBtn}
                onPress={handleChangePassword}
                disabled={changingPass}
                activeOpacity={0.85}
              >
                {changingPass ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="key" size={17} color="#fff" />
                    <Text style={eS.updatePwBtnText}>Update Password</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
const eS = StyleSheet.create({
  // SECTION CARDS
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginBottom: 16,
  },

  // FORM FIELDS
  fieldContainer: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#555',
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  readOnlyInput: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
  },
  readOnlyText: {
    fontSize: 14,
    color: '#888',
  },
  hintText: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 4,
    fontStyle: 'italic',
  },
  emailLockContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emailLockIcon: {
    marginRight: 2,
  },

  // PASSWORD SECTION
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  expandBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  expandBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  passwordCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  passwordCardSubtitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 16,
  },
  pwFieldContainer: {
    marginBottom: 14,
  },
  pwInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  pwInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a1a2e',
  },

  // BUTTONS
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#e74c3c',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  updatePwBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2c3e50',
    paddingVertical: 13,
    borderRadius: 10,
    marginTop: 8,
    elevation: 2,
    shadowColor: '#2c3e50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  updatePwBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
});
