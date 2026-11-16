import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { runNewChat } from './chatActions';

export default function ChatMenuScreen() {
  const navigation = useNavigation();

  const handleNewChat = () => {
    runNewChat();
    navigation.goBack();
  };

  const handleHistory = () => {
    navigation.navigate('ChatHistory');
  };

  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#e74c3c' }}>
        <View>
          {Platform.OS === 'android' && <View style={{ height: StatusBar.currentHeight || 0 }} />}
          <View style={s.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.iconBtn} activeOpacity={0.85}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Menu</Text>
            <View style={{ width: 34 }} />
          </View>
        </View>
      </SafeAreaView>

      <View style={s.body}>
        {/* New Chat */}
        <TouchableOpacity style={s.row} onPress={handleNewChat} activeOpacity={0.82}>
          <View style={[s.rowIcon, { backgroundColor: '#e74c3c' }]}>
            <Ionicons name="add" size={22} color="#fff" />
          </View>
          <View style={s.rowText}>
            <Text style={s.rowTitle}>New Chat</Text>
            <Text style={s.rowSub}>Start a fresh conversation</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#bbb" />
        </TouchableOpacity>

        {/* Chat History */}
        <TouchableOpacity style={s.row} onPress={handleHistory} activeOpacity={0.82}>
          <View style={[s.rowIcon, { backgroundColor: '#2980b9' }]}>
            <Ionicons name="time-outline" size={22} color="#fff" />
          </View>
          <View style={s.rowText}>
            <Text style={s.rowTitle}>Chat History</Text>
            <Text style={s.rowSub}>View, pin, rename &amp; delete past chats</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#bbb" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#e74c3c', paddingHorizontal: 16, paddingVertical: 12, paddingTop: 24,},
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center' },
  iconBtn: { padding: 6 },
  body: { padding: 16, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 14, padding: 16, elevation: 1 },
  rowIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: '700', color: '#222' },
  rowSub: { fontSize: 12, color: '#888', marginTop: 2 },
});
