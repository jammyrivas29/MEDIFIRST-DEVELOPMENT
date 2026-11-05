import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { forgotPassword, verifyResetCode, resetPasswordWithCode } from '../../api/authApi';

export default function ForgotPasswordScreen({ navigation }) {
  // step: 0 = email, 1 = verification code, 2 = new password, 3 = done
  const [step, setStep]         = useState(0);
  const [email, setEmail]       = useState('');
  const [code, setCode]         = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSendCode = async () => {
    const trimmed = email.trim();
    if (!trimmed) { setError('Please enter your email address.'); return; }
    if (!emailRegex.test(trimmed)) { setError('Please enter a valid email address.'); return; }
    setError('');
    setLoading(true);
    try {
      await forgotPassword(trimmed);
      setStep(1);
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  const handleVerifyCode = async () => {
    if (code.trim().length < 4) { setError('Please enter the verification code.'); return; }
    setError('');
    setLoading(true);
    try {
      await verifyResetCode(email.trim(), code.trim());
      setStep(2);
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid or expired code.');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async () => {
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setError('');
    setLoading(true);
    try {
      await resetPasswordWithCode(email.trim(), code.trim(), password);
      setStep(3);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not reset password. Please try again.');
    } finally { setLoading(false); }
  };

  const openMailApp = async () => {
    const gmailUrl = 'googlegmail://';
    try {
      const canOpen = await Linking.canOpenURL(gmailUrl);
      if (canOpen) await Linking.openURL(gmailUrl);
      else await Linking.openURL('mailto:');
    } catch { Linking.openURL('mailto:'); }
  };

  const stepTitle = step === 0 ? 'Forgot Password?'
    : step === 1 ? 'Enter Verification Code'
    : step === 2 ? 'Set New Password'
    : 'Password Updated';

  const stepSub = step === 0 ? "We'll send a verification code to your email"
    : step === 1 ? 'Check your Gmail and enter the code below'
    : step === 2 ? 'Create a new password for your account'
    : 'You can now sign in with your new password';

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ══ HEADER ══ */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons
              name={step === 0 ? 'lock-closed' : step === 1 ? 'keypad' : step === 2 ? 'lock-open' : 'checkmark-circle'}
              size={26} color="#fff"
            />
          </View>
          <Text style={styles.headerTitle}>{stepTitle}</Text>
          <Text style={styles.headerSub}>{stepSub}</Text>

          {/* Step dots */}
          <View style={styles.dotsRow}>
            {[0, 1, 2].map(i => (
              <View key={i} style={[styles.dot, i <= Math.min(step, 2) && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* ══ CARD ══ */}
        <View style={styles.card}>

          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#e74c3c" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* ── STEP 0: EMAIL ── */}
          {step === 0 && (
            <>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputRow}>
                <Ionicons name="mail-outline" size={19} color="#bbb" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="your.email@gmail.com"
                  placeholderTextColor="#bbb"
                  value={email}
                  onChangeText={(v) => { setEmail(v); setError(''); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, (loading || !email.trim()) && styles.btnOff]}
                onPress={handleSendCode}
                disabled={loading || !email.trim()}
                activeOpacity={0.85}
              >
                {loading ? <ActivityIndicator color="#fff" /> : (
                  <Text style={styles.primaryBtnText}>Send Code</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Login')} activeOpacity={0.8}>
                <Text style={styles.backBtnText}>Back to Sign In</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── STEP 1: VERIFICATION CODE ── */}
          {step === 1 && (
            <>
              <Text style={styles.label}>Verification Code</Text>
              <View style={styles.inputRow}>
                <Ionicons name="keypad-outline" size={19} color="#bbb" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.codeInput]}
                  placeholder="6-digit code"
                  placeholderTextColor="#bbb"
                  value={code}
                  onChangeText={(v) => { setCode(v.replace(/[^0-9]/g, '')); setError(''); }}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
              </View>

              <TouchableOpacity onPress={openMailApp} activeOpacity={0.7} style={styles.gmailLink}>
                <Ionicons name="open-outline" size={15} color="#e74c3c" />
                <Text style={styles.gmailLinkText}>Open Gmail to check your code</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryBtn, (loading || code.trim().length < 4) && styles.btnOff]}
                onPress={handleVerifyCode}
                disabled={loading || code.trim().length < 4}
                activeOpacity={0.85}
              >
                {loading ? <ActivityIndicator color="#fff" /> : (
                  <Text style={styles.primaryBtnText}>Verify Code</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.backBtn} onPress={() => { setStep(0); setError(''); setCode(''); }} activeOpacity={0.8}>
                <Text style={styles.backBtnText}>Change Email</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── STEP 2: NEW PASSWORD ── */}
          {step === 2 && (
            <>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={19} color="#bbb" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="At least 6 characters"
                  placeholderTextColor="#bbb"
                  value={password}
                  onChangeText={(v) => { setPassword(v); setError(''); }}
                  secureTextEntry={!showPw}
                  autoCapitalize="none"
                  autoFocus
                />
                <TouchableOpacity onPress={() => setShowPw(!showPw)} style={styles.eyeBtn}>
                  <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color="#bbb" />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={19} color="#bbb" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter password"
                  placeholderTextColor="#bbb"
                  value={confirm}
                  onChangeText={(v) => { setConfirm(v); setError(''); }}
                  secureTextEntry={!showPw}
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, (loading || !password || !confirm) && styles.btnOff]}
                onPress={handleResetPassword}
                disabled={loading || !password || !confirm}
                activeOpacity={0.85}
              >
                {loading ? <ActivityIndicator color="#fff" /> : (
                  <Text style={styles.primaryBtnText}>Update Password</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.backBtn} onPress={() => { setStep(1); setError(''); }} activeOpacity={0.8}>
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── STEP 3: SUCCESS ── */}
          {step === 3 && (
            <View style={styles.successWrap}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark" size={40} color="#fff" />
              </View>
              <Text style={styles.successTitle}>Password Updated!</Text>
              <Text style={styles.successSub}>Sign in with your new password to continue.</Text>

              <TouchableOpacity
                style={[styles.primaryBtn, { marginTop: 24 }]}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Go to Sign In</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Fill remaining space so the card covers to the bottom (no red gap) */}
          <View style={{ flex: 1, minHeight: 24, backgroundColor: '#fff' }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#e74c3c' },
  scroll: { flexGrow: 1, backgroundColor: '#e74c3c' },

  header: {
    alignItems: 'center',
    paddingTop: 70,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  headerIcon: {
    width: 62, height: 62, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 6, textAlign: 'center' },
  headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 19 },
  dotsRow:     { flexDirection: 'row', gap: 7, marginTop: 18 },
  dot:         { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive:   { backgroundColor: '#fff' },

  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingTop: 28,
  },

  errorBox:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fdecea', padding: 12, borderRadius: 10, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#e74c3c' },
  errorText: { color: '#c0392b', fontSize: 13, flex: 1 },

  label:    { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 12, marginBottom: 16, paddingHorizontal: 14, borderWidth: 1.5, borderColor: '#ececec' },
  inputIcon:{ marginRight: 10 },
  input:    { flex: 1, paddingVertical: 14, fontSize: 15, color: '#1a1a2e' },
  codeInput:{ letterSpacing: 6, fontWeight: '700' },
  eyeBtn:   { padding: 4 },

  gmailLink:     { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginBottom: 20, marginTop: -4 },
  gmailLinkText: { fontSize: 13, color: '#e74c3c', fontWeight: '700' },

  primaryBtn: {
    backgroundColor: '#e74c3c', paddingVertical: 15, borderRadius: 12,
    alignItems: 'center', marginTop: 4, marginBottom: 12,
    shadowColor: '#e74c3c', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 4,
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  btnOff: { opacity: 0.55 },

  backBtn:     { alignItems: 'center', paddingVertical: 12 },
  backBtnText: { fontSize: 14, color: '#888', fontWeight: '600' },

  successWrap:  { alignItems: 'center', paddingTop: 16 },
  successIcon:  { width: 74, height: 74, borderRadius: 37, backgroundColor: '#27ae60', justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
  successTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a2e', marginBottom: 6 },
  successSub:   { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 19 },
});
