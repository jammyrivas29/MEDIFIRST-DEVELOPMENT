import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axiosConfig';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed) { setError('Please enter your email address.'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) { setError('Please enter a valid email address.'); return; }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: trimmed });
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  const handleOpenMailApp = async () => {
    const gmailUrl = 'googlegmail://';
    try {
      const canOpenGmail = await Linking.canOpenURL(gmailUrl);
      if (canOpenGmail) {
        // Opens the Gmail app directly to the inbox (not compose)
        await Linking.openURL(gmailUrl);
      } else {
        // Fallback for default Mail app
        await Linking.openURL('mailto:');
      }
    } catch (err) {
      Linking.openURL('mailto:');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ══════════════════════════════════════════
            HEADER
        ══════════════════════════════════════════ */}
        <View style={styles.header}>
          <View style={styles.welcomeRow}>
            <View style={styles.welcomeIconWrap}>
              <Ionicons name={sent ? "mail-unread" : "key"} size={26} color="#fff" />
            </View>
            <View style={styles.welcomeInfo}>
              <Text style={styles.welcomeTitle}>{sent ? "Check Your Inbox" : "Forgot Password?"}</Text>
              <Text style={styles.welcomeSub}>
                {sent ? "We've dispatched your reset link" : "We'll send a reset link to your email"}
              </Text>
              <View style={styles.welcomeBadge}>
                <Ionicons name="shield-checkmark" size={11} color="#fff" />
                <Text style={styles.welcomeBadgeText}>Secure · Fast · Easy</Text>
              </View>
            </View>
          </View>

          {/* Dynamic Progress Steps */}
          <View style={styles.pillsRow}>
            {['Enter Email', 'Get Reset Link', 'Set New Password', 'Sign In'].map((p, i, arr) => {
              const isActive = sent ? i === 1 : i === 0;
              const isDone = sent && i === 0;
              return (
                <React.Fragment key={p}>
                  <View style={[styles.pill, isActive && styles.pillActive, isDone && styles.pillDone]}>
                    <Text style={[styles.pillText, (isActive || isDone) && styles.pillTextActive]}>
                      {isDone ? '✓ ' + p : p}
                    </Text>
                  </View>
                  {i < arr.length - 1 && <View style={styles.pillDivider} />}
                </React.Fragment>
              );
            })}
          </View>
        </View>

        {/* ══════════════════════════════════════
            WHITE CARD CONTENT
        ══════════════════════════════════════ */}
        <View style={styles.card}>

          {sent ? (
            /* ── SUCCESS STATE ── */
            <View style={styles.successContainer}>
              
              <View style={styles.mailBanner}>
                <View style={styles.mailIconCircle}>
                  <Ionicons name="paper-plane" size={28} color="#e74c3c" />
                </View>
                <Text style={styles.mailBannerTitle}>Reset Link Sent!</Text>
                <Text style={styles.mailBannerSub}>We sent an email with reset instructions to:</Text>
                <View style={styles.emailBadge}>
                  <Ionicons name="mail" size={14} color="#e74c3c" />
                  <Text style={styles.emailBadgeText} numberOfLines={1}>{email}</Text>
                </View>
              </View>

              {/* Action Sequence */}
              <Text style={styles.sectionHeader}>WHAT TO DO NEXT</Text>
              
              <View style={styles.actionList}>
                <View style={styles.actionItem}>
                  <View style={styles.actionStepBadge}><Text style={styles.actionStepNum}>1</Text></View>
                  <Text style={styles.actionText}>Open your email inbox and tap the link inside.</Text>
                </View>

                <View style={styles.actionItem}>
                  <View style={styles.actionStepBadge}><Text style={styles.actionStepNum}>2</Text></View>
                  <Text style={styles.actionText}>Create a new password on the web page that opens.</Text>
                </View>

                <View style={styles.actionItem}>
                  <View style={styles.actionStepBadge}><Text style={styles.actionStepNum}>3</Text></View>
                  <Text style={styles.actionText}>Return here to sign in with your new password.</Text>
                </View>
              </View>

              {/* Useful Hint Box */}
              <View style={styles.hintCard}>
                <Ionicons name="help-circle-outline" size={18} color="#d35400" />
                <Text style={styles.hintText}>
                  Can't find the email? Check your <Text style={styles.boldText}>Spam or Junk</Text> folder. It usually arrives within 1-2 minutes.
                </Text>
              </View>

              {/* Buttons */}
              <TouchableOpacity style={styles.primaryBtn} onPress={handleOpenMailApp} activeOpacity={0.85}>
                <Ionicons name="open-outline" size={19} color="#fff" />
                <Text style={styles.primaryBtnText}>Open Email App</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Login')} activeOpacity={0.85}>
                <Ionicons name="log-in-outline" size={19} color="#1a1a2e" />
                <Text style={styles.secondaryBtnText}>Back to Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.textLinkBtn} onPress={() => { setSent(false); setError(''); }} activeOpacity={0.7}>
                <Text style={styles.textLinkText}>Entered wrong email? <Text style={styles.textLinkBold}>Try again</Text></Text>
              </TouchableOpacity>

            </View>
          ) : (
            /* ── INPUT STATE ── */
            <>
              <Text style={styles.cardTitle}>Reset Password</Text>
              <Text style={styles.cardSub}>Enter your account email and we'll send you a link to reset your password.</Text>

              {!!error && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color="#e74c3c" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={[styles.inputRow, !!error && styles.inputRowError]}>
                <Ionicons name="mail-outline" size={19} color="#bbb" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your registered email"
                  placeholderTextColor="#bbb"
                  value={email}
                  onChangeText={(v) => { setEmail(v); setError(''); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                />
                {email.length > 0 && (
                  <TouchableOpacity onPress={() => setEmail('')} style={styles.clearBtn}>
                    <Ionicons name="close-circle" size={18} color="#ccc" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.tipBox}>
                <Ionicons name="bulb-outline" size={15} color="#f39c12" />
                <Text style={styles.tipText}>Make sure to use the email address linked to your MediFirst account.</Text>
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, (loading || !email.trim()) && { opacity: 0.65 }]}
                onPress={handleSubmit}
                disabled={loading || !email.trim()}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="send-outline" size={19} color="#fff" />
                    <Text style={styles.primaryBtnText}>Send Reset Link</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Login')} activeOpacity={0.8}>
                <Ionicons name="arrow-back-outline" size={17} color="#666" />
                <Text style={styles.backBtnText}>Back to Sign In</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#f5f6f8' },
  scroll: { flexGrow: 1 },

  // ══════ HEADER ══════
  header: {
    backgroundColor: '#e74c3c',
    paddingTop: 80,
    paddingHorizontal: 16,
    paddingBottom: 18,
    elevation: 6,
    shadowColor: '#c0392b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },

  welcomeRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  welcomeIconWrap:  { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.25)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  welcomeInfo:      { flex: 1 },
  welcomeTitle:     { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 2 },
  welcomeSub:       { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginBottom: 6 },
  welcomeBadge:     { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  welcomeBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  pillsRow:       { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 6, alignItems: 'center' },
  pill:           { flex: 1, alignItems: 'center', paddingVertical: 4 },
  pillActive:     { backgroundColor: '#fff', borderRadius: 8 },
  pillDone:       { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 8 },
  pillText:       { fontSize: 8, fontWeight: '700', color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  pillTextActive: { color: '#e74c3c', fontSize: 8.5, fontWeight: '800' },
  pillDivider:    { width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.25)' },

  // ══════ FORM CARD ══════
  card: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 28, flex: 1, minHeight: 400 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a2e', marginBottom: 6 },
  cardSub:   { fontSize: 13, color: '#888', marginBottom: 22, lineHeight: 19 },

  errorBox:      { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fdecea', padding: 12, borderRadius: 10, marginBottom: 14, borderLeftWidth: 4, borderLeftColor: '#e74c3c' },
  errorText:     { color: '#c0392b', fontSize: 13, flex: 1 },
  inputLabel:    { fontSize: 12, fontWeight: '700', color: '#555', marginBottom: 8, letterSpacing: 0.3 },
  inputRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 12, marginBottom: 14, paddingHorizontal: 14, borderWidth: 1.5, borderColor: '#ececec' },
  inputRowError: { borderColor: '#e74c3c', backgroundColor: '#fef8f8' },
  inputIcon:     { marginRight: 10 },
  input:         { flex: 1, paddingVertical: 14, fontSize: 15, color: '#1a1a2e' },
  clearBtn:      { padding: 4 },
  tipBox:        { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#fffbf0', padding: 12, borderRadius: 10, marginBottom: 22, borderLeftWidth: 3, borderLeftColor: '#f39c12' },
  tipText:       { flex: 1, fontSize: 12, color: '#856404', lineHeight: 18 },

  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#e74c3c', paddingVertical: 15, borderRadius: 12, marginBottom: 12,
    shadowColor: '#e74c3c', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 4,
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#f5f6f8', paddingVertical: 15, borderRadius: 12, marginBottom: 16,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  secondaryBtnText: { color: '#1a1a2e', fontSize: 15, fontWeight: '700' },
  backBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13, borderRadius: 12, borderWidth: 1.5, borderColor: '#e0e0e0', backgroundColor: '#fafafa' },
  backBtnText:    { fontSize: 14, fontWeight: '600', color: '#666' },

  // ══════ SUCCESS STATE ══════
  successContainer: { paddingTop: 4 },
  mailBanner: {
    backgroundColor: '#fef5f5',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fcdada',
  },
  mailIconCircle: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    marginBottom: 12, elevation: 2,
    shadowColor: '#e74c3c', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4,
  },
  mailBannerTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a2e', marginBottom: 4 },
  mailBannerSub: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 10 },
  emailBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#f8b4b4', maxWidth: '100%',
  },
  emailBadgeText: { fontSize: 13, fontWeight: '800', color: '#e74c3c' },

  sectionHeader: { fontSize: 11, fontWeight: '800', color: '#888', letterSpacing: 1, marginBottom: 12 },
  actionList: { marginBottom: 16 },
  actionItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  actionStepBadge: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center',
  },
  actionStepNum: { color: '#fff', fontSize: 11, fontWeight: '800' },
  actionText: { flex: 1, fontSize: 13, color: '#333', fontWeight: '500', lineHeight: 18 },

  hintCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#fff8f0', padding: 14, borderRadius: 12,
    borderLeftWidth: 4, borderLeftColor: '#e67e22', marginBottom: 20,
  },
  hintText: { flex: 1, fontSize: 12, color: '#7e3d11', lineHeight: 18 },
  boldText: { fontWeight: '800' },

  textLinkBtn: { alignItems: 'center', paddingVertical: 8 },
  textLinkText: { fontSize: 13, color: '#666' },
  textLinkBold: { color: '#e74c3c', fontWeight: '800' },
});