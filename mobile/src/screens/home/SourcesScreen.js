import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Linking, StatusBar, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SOURCES = [
  { category: '🫀 CPR & Cardiac Arrest', color: '#e74c3c', items: [{ title: 'WikiHow — How to Perform CPR on an Adult, Child, Baby', url: 'https://www.wikihow.com/Perform-CPR' }] },
  { category: '😮‍💨 Choking', color: '#e67e22', items: [{ title: 'WikiHow — How to Help a Choking Victim', url: 'https://www.wikihow.com/Help-a-Choking-Victim' }] },
  { category: '🔥 Burns & Wounds', color: '#f39c12', items: [{ title: 'WikiHow — How to Treat a Burn', url: 'https://www.wikihow.com/Treat-a-Burn' }] },
  { category: '🩹 Bleeding & Wounds', color: '#c0392b', items: [{ title: 'WikiHow — How to Stop a Cut from Bleeding', url: 'https://www.wikihow.com/Stop-Bleeding' }] },
  { category: '🦴 Fractures & Broken Bones', color: '#8e44ad', items: [{ title: 'WikiHow — How to Treat a Broken Foot', url: 'https://www.wikihow.com/Treat-a-Foot-Fracture' }] },
  { category: '⚡ Seizures', color: '#2980b9', items: [{ title: 'WikiHow — How to Help Someone Having a Seizure', url: 'https://www.wikihow.com/Stop-a-Seizure' }] },
  { category: '🧠 Stroke', color: '#d35400', items: [{ title: 'WikiHow — How to Recognize a Stroke', url: 'https://www.wikihow.com/Identify-if-Someone-Had-a-Stroke' }] },
  { category: '🌡️ Heat Stroke', color: '#f39c12', items: [{ title: 'Red Cross — Extreme Heat Safety', url: 'https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/extreme-heat-safety/heat-check.html' }] },
  { category: '☠️ Poisoning', color: '#27ae60', items: [{ title: 'WikiHow — How to Treat Poisoning', url: 'https://www.wikihow.com/Treat-Poisoning' }] },
  { category: '🏥 Hospital & Emergency Locator', color: '#27ae60', items: [{ title: 'OpenStreetMap — Overpass API', url: 'https://overpass-api.de' }, { title: 'OpenStreetMap Foundation', url: 'https://www.openstreetmap.org' }] },
  { category: '🤖 AI Assistant', color: '#16a085', items: [{ title: 'Groq AI — LLaMA 3.3 Model', url: 'https://console.groq.com' }, { title: 'Meta LLaMA 3 — Open Source LLM', url: 'https://ai.meta.com/llama/' }] },
  { category: '📱 App Technology', color: '#34495e', items: [{ title: 'React Native — Mobile Framework', url: 'https://reactnative.dev' }, { title: 'Expo — Development Platform', url: 'https://expo.dev' }, { title: 'Node.js + MongoDB — Backend', url: 'https://nodejs.org' }] },
];

export default function SourcesScreen({ navigation }) {
  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      <SafeAreaView edges={['top']} style={s.safeArea}>
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={s.headerIcon}>
              <Ionicons name="information-circle" size={22} color="#fff" />
            </View>
            <View>
              <Text style={s.headerTitle}>Sources &amp; References</Text>
              <Text style={s.headerSub}>MediFirst App v1.0.0</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.closeBtn} activeOpacity={0.8}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={s.disclaimer}>
        <Ionicons name="warning" size={14} color="#856404" />
        <Text style={s.disclaimerText}>MediFirst provides general first aid guidance only. Always consult a medical professional for emergencies.</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {SOURCES.map((section) => (
          <View key={section.category} style={s.section}>
            <View style={s.sectionHeader}>
              <View style={[s.sectionDot, { backgroundColor: section.color }]} />
              <Text style={s.sectionTitle}>{section.category}</Text>
            </View>
            {section.items.map((item, idx) => (
              <TouchableOpacity key={idx} style={s.sourceRow} onPress={() => Linking.openURL(item.url)} activeOpacity={0.75}>
                <View style={s.sourceRowLeft}>
                  <Ionicons name="link" size={13} color={section.color} />
                  <Text style={s.sourceTitle}>{item.title}</Text>
                </View>
                <Ionicons name="open-outline" size={14} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>
        ))}
        <View style={s.appInfo}>
          <Text style={s.appInfoTitle}>MediFirst — First Aid Assistant</Text>
          <Text style={s.appInfoText}>Version 1.0.0 · Built for emergency preparedness</Text>
          <Text style={s.appInfoText}>© 2026 MediFirst Team. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#f5f6f8' },
  safeArea:      { backgroundColor: '#e74c3c' },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#e74c3c', paddingHorizontal: 16, paddingTop: 55, paddingVertical: 14 },
  headerLeft:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  closeBtn:       { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerIcon:    { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle:   { fontSize: 17, fontWeight: '800', color: '#fff' },
  headerSub:     { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  disclaimer:     { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#fef9e7', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#fef0c0' },
  disclaimerText: { flex: 1, fontSize: 11, color: '#856404', lineHeight: 16 },
  section:        { marginBottom: 18 },
  sectionHeader:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  sectionDot:     { width: 10, height: 10, borderRadius: 5 },
  sectionTitle:   { fontSize: 14, fontWeight: '800', color: '#1a1a2e' },
  sourceRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 6, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  sourceRowLeft:  { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  sourceTitle:    { fontSize: 13, color: '#333', fontWeight: '500', flex: 1 },
  appInfo:        { backgroundColor: '#fff', borderRadius: 13, padding: 16, marginTop: 10, alignItems: 'center', borderWidth: 1, borderColor: '#f0f0f0' },
  appInfoTitle:   { fontSize: 14, fontWeight: '800', color: '#1a1a2e', marginBottom: 4 },
  appInfoText:    { fontSize: 11, color: '#888', marginTop: 2, textAlign: 'center' },
});
