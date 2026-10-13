import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function ModalHeader({ title, onClose }) {
  return (
    <View style={mS.header}>
      <TouchableOpacity onPress={onClose} style={mS.backBtn}>
        <Ionicons name="chevron-back" size={20} color="#333" />
      </TouchableOpacity>
      <Text style={mS.title}>{title}</Text>
      <View style={{ width: 36 }} />
    </View>
  );
}

const mS = StyleSheet.create({
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f2f2f2', alignItems: 'center', justifyContent: 'center' },
  title:   { fontSize: 16, fontWeight: '800', color: '#1a1a2e' },
});

export default ModalHeader;
