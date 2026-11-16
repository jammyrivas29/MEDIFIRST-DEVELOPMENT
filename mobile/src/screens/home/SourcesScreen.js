import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Linking, StatusBar, SafeAreaView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SOURCES = [
  {
    category: 'CPR & Cardiac Arrest',
    items: [{ title: 'WikiHow — How to Perform CPR on an Adult, Child, Baby', url: 'https://www.wikihow.com/Perform-CPR' }],
  },
  {
    category: 'Choking',
    items: [{ title: 'WikiHow — How to Help a Choking Victim', url: 'https://www.wikihow.com/Help-a-Choking-Victim' }],
  },
  {
    category: 'Burns & Wounds',
    items: [{ title: 'WikiHow — How to Treat a Burn', url: 'https://www.wikihow.com/Treat-a-Burn' }],
  },
  {
    category: 'Bleeding & Wounds',
    items: [{ title: 'WikiHow — How to Stop a Cut from Bleeding', url: 'https://www.wikihow.com/Stop-Bleeding' }],
  },
  {
    category: 'Fractures & Broken Bones',
    items: [{ title: 'WikiHow — How to Treat a Broken Foot', url: 'https://www.wikihow.com/Treat-a-Foot-Fracture' }],
  },
  {
    category: 'Seizures',
    items: [{ title: 'WikiHow — How to Help Someone Having a Seizure', url: 'https://www.wikihow.com/Stop-a-Seizure' }],
  },
  {
    category: 'Stroke',
    items: [{ title: 'WikiHow — How to Recognize a Stroke', url: 'https://www.wikihow.com/Identify-if-Someone-Had-a-Stroke' }],
  },
  {
    category: 'Heat Stroke',
    items: [{ title: 'Red Cross — Extreme Heat Safety', url: 'https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/extreme-heat-safety/heat-check.html' }],
  },
  {
    category: 'Poisoning',
    items: [{ title: 'WikiHow — How to Treat Poisoning', url: 'https://www.wikihow.com/Treat-Poisoning' }],
  },
  {
    category: 'Hospital & Emergency Locator',
    items: [
      { title: 'OpenStreetMap — Overpass API', url: 'https://overpass-api.de' },
      { title: 'OpenStreetMap Foundation', url: 'https://www.openstreetmap.org' },
    ],
  },
  {
    category: 'AI Assistant',
    items: [
      { title: 'Groq AI — LLaMA 3.3 Model', url: 'https://console.groq.com' },
      { title: 'Meta LLaMA 3 — Open Source LLM', url: 'https://ai.meta.com/llama/' },
    ],
  },
  {
    category: 'App Technology',
    items: [
      { title: 'React Native — Mobile Framework', url: 'https://reactnative.dev' },
      { title: 'Expo — Development Platform', url: 'https://expo.dev' },
      { title: 'Node.js + MongoDB — Backend', url: 'https://nodejs.org' },
    ],
  },
];

export default function SourcesScreen({ navigation }) {
  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#e74c3c" translucent={true} />

      <SafeAreaView edges={['top']} style={s.safeArea}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Sources & References</Text>
            <Text style={s.headerSub}>MediFirst App v1.0.0</Text>
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        {SOURCES.map((section) => (
          <View key={section.category} style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>{section.category}</Text>
            </View>
            {section.items.map((item, idx) => (
              <TouchableOpacity key={idx} style={s.sourceRow} onPress={() => Linking.openURL(item.url)} activeOpacity={0.75}>
                <View style={s.sourceRowLeft}>
                  <Ionicons name="link-outline" size={15} color="#888" />
                  <Text style={s.sourceTitle}>{item.title}</Text>
                </View>
                <Ionicons name="open-outline" size={14} color="#bbb" />
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
  container: {
    flex: 1,
    backgroundColor: '#f5f6f8',
  },
  safeArea: {
    backgroundColor: '#e74c3c',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e74c3c',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 30 : 67,
    paddingBottom: 14,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  headerSub: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#fef9e7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#fef0c0',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12.5,
    color: '#856404',
    lineHeight: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 18,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#eef0f2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sourceRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  sourceTitle: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  appInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  appInfoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  appInfoText: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
    textAlign: 'center',
  },
});
