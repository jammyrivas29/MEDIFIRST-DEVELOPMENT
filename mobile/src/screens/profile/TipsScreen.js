import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useProfile, SectionHeader } from './ProfileContext';

const URGENCY_COLORS = { critical: '#e74c3c', high: '#e67e22', medium: '#2980b9', low: '#27ae60' };

const getRecommendations = (profile) => {
  const recs = [];
  const bt         = profile?.medicalProfile?.bloodType;
  const allergies  = profile?.medicalProfile?.allergies || [];
  const conditions = profile?.medicalProfile?.medicalConditions || [];
  if (!bt || bt === 'Unknown') recs.push({ icon: 'water', color: '#e74c3c', title: 'Know Your Blood Type', desc: 'Knowing your blood type is critical in emergencies.', urgency: 'high' });
  if (allergies.length === 0) recs.push({ icon: 'alert-circle', color: '#e67e22', title: 'Document Allergies', desc: 'Recording allergies ensures emergency responders provide safe treatment.', urgency: 'medium' });
  if (conditions.some(c => c.toLowerCase().includes('diabetes'))) recs.push({ icon: 'fitness', color: '#2980b9', title: 'Diabetes First Aid Kit', desc: 'Keep glucose tablets, glucagon, and your medical ID accessible.', urgency: 'high' });
  if (conditions.some(c => c.toLowerCase().includes('hypertension') || c.toLowerCase().includes('blood pressure'))) recs.push({ icon: 'heart', color: '#e74c3c', title: 'Hypertension Awareness', desc: 'Learn to recognize hypertensive crisis: severe headache, chest pain, blurred vision.', urgency: 'high' });
  if (conditions.some(c => c.toLowerCase().includes('asthma'))) recs.push({ icon: 'medical', color: '#8e44ad', title: 'Asthma Action Plan', desc: 'Always carry your inhaler. Learn triggers and have a written action plan.', urgency: 'high' });
  if (conditions.some(c => c.toLowerCase().includes('heart'))) recs.push({ icon: 'pulse', color: '#e74c3c', title: 'Cardiac Emergency Prep', desc: 'Inform household members of your condition. Keep nitroglycerin accessible.', urgency: 'high' });
  if (allergies.some(a => ['peanut','bee','shellfish'].some(k => a.toLowerCase().includes(k)))) recs.push({ icon: 'warning', color: '#c0392b', title: 'Carry an EpiPen', desc: 'Severe allergies can cause anaphylaxis. Always have an epinephrine auto-injector.', urgency: 'critical' });
  recs.push({ icon: 'people', color: '#27ae60', title: 'Add Emergency Contacts', desc: 'Ensure at least 2 to 3 emergency contacts are saved for responders.', urgency: 'medium' });
  recs.push({ icon: 'book', color: '#2980b9', title: 'Learn CPR', desc: 'CPR is the most important life-saving skill. Take a certified course.', urgency: 'medium' });
  return recs.slice(0, 5);
};

export default function TipsScreen() {
  const navigation = useNavigation();
  const { profile } = useProfile();
  const recs = getRecommendations(profile);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#e74c3c' }}>
        {Platform.OS === 'android' && <View style={{ height: StatusBar.currentHeight || 0 }} />}
        <SectionHeader title="Health Tips" icon="bulb" onBack={() => navigation.goBack()} />
      </SafeAreaView>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false}>
        <View style={s.secHeader}>
          <Text style={s.secLabel}>Health Tips</Text>
        </View>
        <Text style={s.tipsSub}>Personalized based on your medical profile</Text>
        {recs.map((rec, i) => (
          <View key={i} style={s.featureCard}>
            <View style={[s.featureCardIcon, { backgroundColor: URGENCY_COLORS[rec.urgency] + '18' }]}>
              <Ionicons name={rec.icon} size={22} color={URGENCY_COLORS[rec.urgency]} />
            </View>
            <View style={s.recHeadRow}>
              <Text style={s.featureCardTitle}>{rec.title}</Text>
              <View style={[s.urgencyBadge, { backgroundColor: URGENCY_COLORS[rec.urgency] }]}>
                <Text style={s.urgencyBadgeTxt}>{rec.urgency?.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={s.recDesc}>{rec.desc}</Text>
          </View>
        ))}
        <View style={s.featureCard}>
          <View style={[s.featureCardIcon, { backgroundColor: '#e9f7ef' }]}>
            <Ionicons name="shield-checkmark" size={22} color="#27ae60" />
          </View>
          <Text style={s.featureCardTitle}>General Safety Reminders</Text>
          {['Always call 911 first in a life-threatening emergency.','Keep a first aid kit at home, in your car, and at work.','Inform household members of your medical conditions.','Renew your first aid training every 2 years.','Know the location of the nearest emergency department.'].map((tip, i) => (
            <View key={i} style={s.safetyRow}>
              <View style={s.safetyDot} />
              <Text style={s.safetyTxt}>{tip}</Text>
            </View>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:            { flex: 1, backgroundColor: '#f0f2f5' },
  scroll:          { flex: 1 },
  scrollPad:       { padding: 14, paddingTop: 16 },
  secHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  secLabel:        { fontSize: 15, fontWeight: '800', color: '#1a1a2e' },
  tipsSub:         { fontSize: 12, color: '#999', marginBottom: 14 },
  featureCard:     { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
  featureCardIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  featureCardTitle:{ fontSize: 15, fontWeight: '800', color: '#1a1a2e' },
  recHeadRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  urgencyBadge:    { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 7 },
  urgencyBadgeTxt: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  recDesc:         { fontSize: 13, color: '#666', lineHeight: 19 },
  safetyRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginTop: 11 },
  safetyDot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: '#27ae60', marginTop: 6 },
  safetyTxt:       { flex: 1, fontSize: 13, color: '#555', lineHeight: 19 },
});
