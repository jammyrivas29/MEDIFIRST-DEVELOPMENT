import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { registerUser, clearError } from '../../store/authSlice';

// Flaticon Padlock image direct URL / asset
const PADLOCK_ICON_URL = 'https://cdn-icons-png.flaticon.com/512/2889/2889676.png';

const RULES = {
  firstName:       { validate: v => v.trim().length >= 2,       error: 'First name required.' },
  lastName:        { validate: v => v.trim().length >= 2,       error: 'Last name required.' },
  email:           { validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), error: 'Enter a valid email.' },
  password:        { validate: v => v.length >= 6,              error: (v) => v.length === 0 ? 'This field is required.' : 'At least 6 characters required.' },
  confirmPassword: { validate: (v, form) => v.length === 0 || v === form.password, error: 'Password does not match.' },
};

export default function RegisterScreen({ navigation }) {
  const dispatch           = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched]           = useState({});
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    password: '', confirmPassword: '',
  });

  const set   = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const touch = (key)      => setTouched(prev => ({ ...prev, [key]: true }));
  const hasError = (key)   => touched[key] && !RULES[key].validate(form[key], form);
  const getError = (key)   => {
    const e = RULES[key].error;
    return typeof e === 'function' ? e(form[key], form) : e;
  };

  const allValid = () =>
    ['firstName', 'lastName', 'email', 'password', 'confirmPassword'].every(k => RULES[k].validate(form[k], form));

  const handleRegister = async () => {
    setTouched(Object.keys(RULES).reduce((a, k) => ({ ...a, [k]: true }), {}));
    if (!allValid()) { 
      Alert.alert('Fix Errors', 'Please correct the highlighted fields before continuing.'); 
      return; 
    }
    try {
      await dispatch(registerUser({
        firstName:   form.firstName.trim(),
        lastName:    form.lastName.trim(),
        email:       form.email.trim(),
        password:    form.password,
      })).unwrap();
    } catch (err) {
      Alert.alert('Registration Failed', err || 'Something went wrong.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ══ HEADER ══ */}
        <View style={styles.header}>
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Ionicons name="person-add" size={26} color="#fff" />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Create Account</Text>
              <Text style={styles.userEmail}>Join MediFirst — it's completely free</Text>
            </View>
          </View>
        </View>

        {/* ══ FORM CARD ══ */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Register</Text>
          <Text style={styles.cardSub}>Fill in your details below</Text>

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#e74c3c" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Email */}
          <Text style={styles.inputLabel}>Email Address</Text>
          <View style={[styles.inputRow, hasError('email') && styles.inputRowError]}>
            <Ionicons name="mail-outline" size={18} color="#bbb" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter Email Address"
              placeholderTextColor="#bbb"
              value={form.email}
              onChangeText={v => set('email', v)}
              onBlur={() => touch('email')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {hasError('email') && <Text style={styles.fieldError}>{RULES.email.error}</Text>}

          {/* First Name */}
          <Text style={styles.inputLabel}>First Name</Text>
          <View style={[styles.inputRow, hasError('firstName') && styles.inputRowError]}>
            <Ionicons name="person-outline" size={18} color="#bbb" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter First Name"
              placeholderTextColor="#bbb"
              value={form.firstName}
              onChangeText={v => set('firstName', v)}
              onBlur={() => touch('firstName')}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>
          {hasError('firstName') && <Text style={styles.fieldError}>{RULES.firstName.error}</Text>}

          {/* Last Name */}
          <Text style={styles.inputLabel}>Last Name</Text>
          <View style={[styles.inputRow, hasError('lastName') && styles.inputRowError]}>
            <Ionicons name="person-outline" size={18} color="#bbb" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter Last Name"
              placeholderTextColor="#bbb"
              value={form.lastName}
              onChangeText={v => set('lastName', v)}
              onBlur={() => touch('lastName')}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>
          {hasError('lastName') && <Text style={styles.fieldError}>{RULES.lastName.error}</Text>}

          {/* Password */}
          <Text style={styles.inputLabel}>Password</Text>
          <View style={[styles.inputRow, hasError('password') && styles.inputRowError]}>
            <Ionicons name="lock-closed-outline" size={18} color="#bbb" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter Password"
              placeholderTextColor="#bbb"
              value={form.password}
              onChangeText={v => set('password', v)}
              onBlur={() => touch('password')}
              secureTextEntry={!showPassword}
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color="#bbb" />
            </TouchableOpacity>
          </View>
          {hasError('password') && <Text style={styles.fieldError}>{getError('password')}</Text>}

          {/* Confirm Password */}
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <View style={[styles.inputRow, hasError('confirmPassword') && styles.inputRowError]}>
            <Ionicons name="lock-closed-outline" size={18} color="#bbb" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter Confirm Password"
              placeholderTextColor="#bbb"
              value={form.confirmPassword}
              onChangeText={v => set('confirmPassword', v)}
              onBlur={() => touch('confirmPassword')}
              secureTextEntry={!showPassword}
              autoCorrect={false}
            />
          </View>
          {hasError('confirmPassword') && form.confirmPassword.length > 0 && <Text style={styles.fieldError}>{getError('confirmPassword')}</Text>}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.primaryBtnText}>Create Account</Text>
            }
          </TouchableOpacity>

          {/* Sign In Navigation Link */}
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => { dispatch(clearError()); navigation.navigate('Login'); }}
          >
            <Text style={styles.linkText}>Already have an account? </Text>
            <Text style={styles.linkHighlight}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#fff' },
  scroll: { flexGrow: 1, backgroundColor: '#fff' },

  header: { 
    backgroundColor: '#e74c3c', 
    paddingTop: 70, 
    paddingHorizontal: 16, 
    paddingBottom: 6, 
    elevation: 6, 
    shadowColor: '#c0392b', 
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.35, 
    shadowRadius: 8 
  },
  userRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar:      { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.25)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  userInfo:    { flex: 1 },
  userName:    { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 2 },
  userEmail:   { fontSize: 12, color: 'rgba(255,255,255,0.78)', marginBottom: 6 },

  statsRow:   { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  statItem:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statNum:     { fontSize: 13, fontWeight: '800', color: '#fff' },
  statIcon:    { width: 16, height: 16, tintColor: '#fff', resizeMode: 'contain' },
  statLabel:   { fontSize: 10, color: '#fff', marginTop: 2 },
  statDivider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.25)' },

  card: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 28, 
    borderTopRightRadius: 28, 
    padding: 24, 
    paddingTop: 20, 
    flex: 1 
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a2e', marginBottom: 4 },
  cardSub:   { fontSize: 13, color: '#aaa', marginBottom: 20 },

  errorBox:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fdecea', padding: 12, borderRadius: 10, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#e74c3c' },
  errorText: { color: '#c0392b', fontSize: 13, flex: 1 },

  nameRow:            { flexDirection: 'row', gap: 10, marginBottom: 12 },
  halfInputContainer: { flex: 1 },

  inputLabel: { fontSize: 13, fontWeight: '700', color: '#1a1a2e', marginBottom: 6, marginLeft: 2 },
  inputRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 12, 
    marginBottom: 12, 
    paddingHorizontal: 14, 
    borderWidth: 1.5, 
    borderColor: '#ececec', 
    backgroundColor: '#f8f9fa' 
  },
  inputRowError: { borderColor: '#e74c3c' },
  inputIcon:     { marginRight: 10 },
  input:         { flex: 1, paddingVertical: 14, fontSize: 14, color: '#1a1a2e' },
  eyeBtn:        { padding: 6 },

  fieldError: { fontSize: 11, color: '#e74c3c', marginTop: -8, marginBottom: 10, paddingLeft: 4 },

  primaryBtn: { 
    backgroundColor: '#e74c3c', 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 8, 
    marginBottom: 18, 
    shadowColor: '#e74c3c', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 5 
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  linkRow:       { flexDirection: 'row', justifyContent: 'center', paddingVertical: 8, marginBottom: 20 },
  linkText:      { fontSize: 14, color: '#aaa' },
  linkHighlight: { fontSize: 14, color: '#e74c3c', fontWeight: '700' },
});