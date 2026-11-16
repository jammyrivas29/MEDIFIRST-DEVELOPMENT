import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useProfile, SectionHeader } from './ProfileContext';

export default function HistoryScreen() {
  const navigation = useNavigation();
  const { callHistory, logCall, clearCalls, fmtDate } = useProfile();

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#e74c3c' }}>
        {Platform.OS === 'android' && <View style={{ height: StatusBar.currentHeight || 0 }} />}
        <SectionHeader title="Call History" icon="time" onBack={() => navigation.goBack()} />
      </SafeAreaView>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false}>
        <View style={s.secHeader}>
          <Text style={s.secLabel}>Call History</Text>
          {callHistory.length > 0 && (
            <TouchableOpacity style={s.clearBtn} onPress={clearCalls}>
              <Ionicons name="trash-outline" size={13} color="#e74c3c" />
              <Text style={s.clearBtnTxt}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
        {callHistory.length === 0 ? (
          <View style={s.emptyState}>
            <View style={[s.emptyIconBox, { backgroundColor: '#fdecea' }]}>
              <Ionicons name="call-outline" size={32} color="#e74c3c" />
            </View>
            <Text style={s.emptyTitle}>No Calls Yet</Text>
            <Text style={s.emptyDesc}>Calls made through this app will appear here.</Text>
          </View>
        ) : (
          callHistory.map(e => (
            <View key={e.id} style={s.histCard}>
              <View style={[s.histIcon, { backgroundColor: '#fdecea' }]}><Ionicons name="call" size={16} color="#e74c3c" /></View>
              <View style={s.histBody}>
                <Text style={s.histName}>{e.label}</Text>
                <Text style={s.histNum}>{e.number}</Text>
                <Text style={s.histTime}>{fmtDate(e.timestamp)}</Text>
              </View>
              <TouchableOpacity style={s.histCallBtn} onPress={() => logCall(e.number, e.label)}>
                <Ionicons name="call" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#f0f2f5' },
  scroll:        { flex: 1 },
  scrollPad:     { padding: 14, paddingTop: 16 },
  secHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  secLabel:      { fontSize: 15, fontWeight: '800', color: '#1a1a2e' },
  clearBtn:      { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#fdecea' },
  clearBtnTxt:   { fontSize: 12, fontWeight: '700', color: '#e74c3c' },
  emptyState:    { alignItems: 'center', paddingVertical: 50 },
  emptyIconBox:  { width: 72, height: 72, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  emptyTitle:    { fontSize: 16, fontWeight: '800', color: '#1a1a2e', marginBottom: 5 },
  emptyDesc:     { fontSize: 13, color: '#999', textAlign: 'center' },
  histCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, gap: 13, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  histIcon:      { width: 42, height: 42, borderRadius: 12, backgroundColor: '#fdecea', justifyContent: 'center', alignItems: 'center' },
  histBody:      { flex: 1 },
  histName:      { fontSize: 14, fontWeight: '800', color: '#1a1a2e' },
  histNum:       { fontSize: 13, color: '#555', marginTop: 1 },
  histTime:      { fontSize: 11, color: '#aaa', marginTop: 3 },
  histCallBtn:   { width: 38, height: 38, borderRadius: 12, backgroundColor: '#e74c3c', justifyContent: 'center', alignItems: 'center' },
});
