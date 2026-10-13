import React, { useState } from 'react';
import { View, Text, ScrollView, Modal, SafeAreaView, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { submitReport } from '../../../api/reportApi';
import ModalHeader from './ModalHeader';

export default function FeedbackModal({ visible, onClose }) {
  const [type, setType]     = useState('feedback');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const reset = () => { setType('feedback'); setSubject(''); setMessage(''); setSending(false); };

  const handleSubmit = async () => {
    if (!message.trim()) {
      return Alert.alert('Message required', 'Please describe your feedback or concern.');
    }
    try {
      setSending(true);
      await submitReport({
        type,
        subject: subject.trim() || (type === 'concern' ? 'App Concern' : 'App Feedback'),
        message: message.trim(),
      });
      Alert.alert('Sent!', 'Thank you. Your message was sent to the MediFirst team.', [
        { text: 'OK', onPress: () => { reset(); onClose(); } },
      ]);
    } catch (e) {
      Alert.alert('Could not send', e?.response?.data?.message || 'Please try again later.');
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <ModalHeader title="Send Feedback" onClose={onClose} />
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30 }} keyboardShouldPersistTaps="handled">
          <Text style={fS.label}>What would you like to send?</Text>
          <View style={fS.typeRow}>
            {[
              { key: 'feedback', label: 'Feedback', icon: 'thumbs-up', color: '#27ae60' },
              { key: 'concern', label: 'Report a Concern', icon: 'alert-circle', color: '#e74c3c' },
            ].map(t => (
              <TouchableOpacity key={t.key} style={[fS.typeChip, type === t.key && { borderColor: t.color, backgroundColor: t.color }]} onPress={() => setType(t.key)} activeOpacity={0.8}>
                <Ionicons name={t.icon} size={16} color={type === t.key ? '#fff' : t.color} />
                <Text style={[fS.typeTxt, type === t.key && { color: '#fff' }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={fS.label}>Subject (optional)</Text>
          <View style={fS.inputRow}>
            <TextInput style={fS.input} value={subject} onChangeText={setSubject} placeholder="Short title" placeholderTextColor="#ccc" maxLength={80} />
          </View>

          <Text style={fS.label}>Message</Text>
          <View style={[fS.inputRow, { marginBottom: 24 }]}>
            <TextInput style={[fS.input, { height: 120, textAlignVertical: 'top' }]} value={message} onChangeText={setMessage} placeholder="Tell us what's on your mind…" placeholderTextColor="#ccc" multiline maxLength={1000} />
          </View>

          <TouchableOpacity style={fS.sendBtn} onPress={handleSubmit} disabled={sending} activeOpacity={0.85}>
            {sending ? <ActivityIndicator color="#fff" size="small" /> : <><Ionicons name="send" size={16} color="#fff" /><Text style={fS.sendTxt}>Send to MediFirst Team</Text></>}
          </TouchableOpacity>
          <Text style={fS.note}>Your message is reviewed by the MediFirst admin team. It is linked to your account.</Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
const fS = StyleSheet.create({
  label:     { fontSize: 11, fontWeight: '700', color: '#999', marginBottom: 8, marginTop: 6 },
  typeRow:   { flexDirection: 'row', gap: 10, marginBottom: 18 },
  typeChip:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderColor: '#eee', borderRadius: 12, paddingVertical: 12, backgroundColor: '#fff' },
  typeTxt:   { fontSize: 13, fontWeight: '800', color: '#1a1a2e' },
  inputRow:  { backgroundColor: '#f8f9fa', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 4, borderWidth: 1.5, borderColor: '#eee', marginBottom: 16 },
  input:     { paddingVertical: 13, fontSize: 14, color: '#1a1a2e' },
  sendBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#e74c3c', paddingVertical: 16, borderRadius: 14, elevation: 4, shadowColor: '#e74c3c', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  sendTxt:   { color: '#fff', fontSize: 15, fontWeight: '800' },
  note:      { fontSize: 11, color: '#bbb', textAlign: 'center', marginTop: 10 },
});
