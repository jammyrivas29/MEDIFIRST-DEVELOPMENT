import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { login, clearError } from '../../store/authSlice';

export default function LoginScreen({ navigation }) {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch                        = useDispatch();
  const { loading, error }              = useSelector((state) => state.auth);

  const handleLogin = async () => {
    if (!email.trim() || !password) { 
      Alert.alert('Required Fields', 'Please enter both your email address and password.'); 
      return; 
    }
    try { 
      await dispatch(login({ email: email.trim(), password })).unwrap(); 
    } catch (err) { 
      Alert.alert('Login Failed', err.message || err || 'Invalid credentials.'); 
    }
  };

  const handleNavigateRegister = () => {
    dispatch(clearError());
    navigation.navigate('Register');
  };

  const handleNavigateForgot = () => {
    dispatch(clearError());
    navigation.navigate('ForgotPassword');
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ══ HEADER ══ */}
        <View style={styles.header}>
          {/* Welcome row */}
          <View style={styles.welcomeRow}>
            <View style={styles.welcomeIconWrap}>
              <Ionicons name="person" size={26} color="#fff" />
            </View>
            <View style={styles.welcomeInfo}>
              <Text style={styles.welcomeTitle}>Welcome Back!</Text>
              <Text style={styles.welcomeSub}>Sign in to access your medical profile</Text>
            </View>
          </View>

          {/* Feature pills row */}
          <View style={styles.pillsRow}>
            {[
              { label: 'Profile', icon: 'medical' },
              { label: 'Contacts', icon: 'call' },
              { label: 'AI Helper', icon: 'sparkles' },
              { label: 'History', icon: 'time' },
            ].map((p, i, arr) => (
              <React.Fragment key={p.label}>
                <View style={styles.pill}>
                  <Ionicons name={p.icon} size={12} color="#fff" style={{ marginBottom: 2 }} />
                  <Text style={styles.pillText}>{p.label}</Text>
                </View>
                {i < arr.length - 1 && <View style={styles.pillDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* ══ FORM CARD ══ */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>
          <Text style={styles.cardSub}>Enter your credentials to continue</Text>

          {/* Error Banner */}
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#e74c3c" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Email Field */}
          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={18} color="#bbb" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#bbb"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Field */}
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color="#bbb" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#bbb"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color="#bbb" />
            </TouchableOpacity>
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity
            style={styles.forgotRow}
            onPress={handleNavigateForgot}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={20} color="#fff" />
                <Text style={styles.primaryBtnText}>Sign In</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.linkRow}>
            <Text style={styles.linkText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleNavigateRegister} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.linkHighlight}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  scroll: { flexGrow: 1, backgroundColor: '#fff' },

  header: {
    backgroundColor: '#e74c3c',
    paddingTop: 70,
    paddingHorizontal: 16,
    paddingBottom: 20,
    elevation: 6,
    shadowColor: '#c0392b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },

  welcomeRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  welcomeIconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.25)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  welcomeInfo:     { flex: 1 },
  welcomeTitle:    { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 2 },
  welcomeSub:      { fontSize: 12, color: 'rgba(255,255,255,0.85)' },

  pillsRow:    { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  pill:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pillText:    { fontSize: 10, fontWeight: '800', color: '#fff' },
  pillDivider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.25)' },
  

  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingTop: 28,
    flex: 1,
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a2e', marginBottom: 4 },
  cardSub:   { fontSize: 13, color: '#aaa', marginBottom: 20 },

  errorBox:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fdecea', padding: 12, borderRadius: 10, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#e74c3c' },
  errorText: { color: '#c0392b', fontSize: 13, flex: 1 },

  inputRow:  { flexDirection: 'row', alignItems: 'center', borderRadius: 12, marginBottom: 12, paddingHorizontal: 14, borderWidth: 1.5, borderColor: '#ececec', backgroundColor: '#f8f9fa' },
  inputIcon: { marginRight: 10 },
  input:     { flex: 1, paddingVertical: 14, fontSize: 14, color: '#1a1a2e' },
  eyeBtn:    { padding: 6 },

  forgotRow:  { alignSelf: 'flex-end', marginBottom: 20, paddingTop: 2, paddingBottom: 6 },
  forgotText: { fontSize: 13, fontWeight: '700', color: '#e74c3c' },

  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#e74c3c', paddingVertical: 16,
    borderRadius: 12, marginBottom: 20,
    shadowColor: '#e74c3c', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  linkRow:       { flexDirection: 'row', justifyContent: 'center', paddingVertical: 8, marginBottom: 20 },
  linkText:      { fontSize: 14, color: '#aaa' },
  linkHighlight: { fontSize: 14, color: '#e74c3c', fontWeight: '700' },
});