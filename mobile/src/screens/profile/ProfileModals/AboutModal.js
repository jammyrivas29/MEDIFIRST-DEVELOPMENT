import React from 'react';
import { View, Text, ScrollView, Modal, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ModalHeader from './ModalHeader';

export default function AboutModal({ visible, onClose }) {
  const features = [
    { icon: 'medical',       color: '#e74c3c', bg: '#fdecea', title: 'First Aid Guides',   desc: 'Step-by-step emergency protocols' },
    { icon: 'chatbubbles',   color: '#16a085', bg: '#e8f8f5', title: 'AI Assistant',       desc: 'Instant first aid answers' },
    { icon: 'location',      color: '#27ae60', bg: '#e9f7ef', title: 'Hospital Locator',   desc: 'Find nearby emergency care' },
    { icon: 'call',          color: '#2980b9', bg: '#e8f4fb', title: 'Emergency Hotlines', desc: 'One-tap 911 and crisis lines' },
    { icon: 'people',        color: '#8e44ad', bg: '#f5eef8', title: 'Emergency Contacts', desc: 'Save and call contacts fast' },
    { icon: 'person-circle', color: '#d35400', bg: '#fef5ec', title: 'Medical Profile',    desc: 'Blood type, allergies and conditions' },
    { icon: 'send',          color: '#c0392b', bg: '#fdecea', title: 'GPS Location Share', desc: 'SMS your location to contacts' },
    { icon: 'play-circle',   color: '#f39c12', bg: '#fef9e7', title: 'Video Tutorials',    desc: 'Watch first aid demonstrations' },
  ];
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <ModalHeader title="About MediFirst" onClose={onClose} />
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <View style={{ alignItems: 'center', paddingVertical: 24 }}>
            <Image source={require('../../../../assets/logo2.png')} style={{ width: 100, height: 100, marginBottom: 14 }} resizeMode="contain" />
            <Text style={{ fontSize: 26, fontWeight: '900', color: '#1a1a2e' }}>MediFirst</Text>
            <Text style={{ fontSize: 12, color: '#e74c3c', fontWeight: '700', marginTop: 4 }}>First Aid & Emergency Assistant</Text>
            <Text style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>Version 1.0.0</Text>
          </View>
          <View style={{ height: 1, backgroundColor: '#f0f0f0', marginBottom: 20 }} />
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#1a1a2e', marginBottom: 14 }}>Key Features</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {features.map((f, i) => (
              <View key={i} style={{ width: '46%', backgroundColor: f.bg, borderRadius: 14, padding: 14, alignItems: 'flex-start' }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: f.color + '22', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                  <Ionicons name={f.icon} size={20} color={f.color} />
                </View>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#1a1a2e' }}>{f.title}</Text>
                <Text style={{ fontSize: 11, color: '#777', marginTop: 3, lineHeight: 16 }}>{f.desc}</Text>
              </View>
            ))}
          </View>
          <Text style={{ fontSize: 11, color: '#ccc', textAlign: 'center', marginTop: 24 }}>MediFirst v1.0.0 — © 2026 All rights reserved.</Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
