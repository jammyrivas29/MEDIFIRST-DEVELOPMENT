import React from 'react';
import { View, Text, ScrollView, Modal, SafeAreaView } from 'react-native';
import ModalHeader from './ModalHeader';

export default function PrivacyModal({ visible, onClose }) {
  const sections = [
    { h: '1. Information We Collect', t: 'MediFirst collects personal information you provide directly, including your name and email address. Your phone number is optional and may be provided for emergency-related features. We also collect medical profile information and emergency contact information that you choose to provide.' },
    { h: '2. How We Use Your Information', t: 'our information is used to provide and improve MediFirst’s first aid and emergency assistance features. Medical profile information may be used to personalize first aid guidance and emergency assistance. Your phone number and emergency contact information may be used for emergency-related features when you choose to provide them.' },
    { h: '3. Data Storage & Security', t: 'We take reasonable measures to protect your personal information from unauthorized access, alteration, disclosure, or loss. MediFirst uses security measures such as HTTPS encryption and secure authentication tokens to help protect your data.' },
    { h: '4. Data Sharing', t: 'We do not sell or trade your personal information. We do not share your personal information with third parties for marketing purposes. Information may only be shared when necessary to provide a feature you choose to use or when required by applicable law.' },
    { h: '5. Location Data', t: 'MediFirst requests access to your location only when you use location-based features, such as the Send My Location feature or nearby hospital locator. Location information used by the Send My Location feature is not stored on our servers unless otherwise stated.' },
    { h: '6. Medical Information', t: 'Medical profile information is provided voluntarily and is used to support personalized first aid guidance and emergency assistance features. We do not sell or use your medical information for marketing purposes.' },
    { h: '7. Your Rights', t: 'You may have the right to access, correct, update, or delete your personal information, subject to applicable laws and the functionality of the MediFirst application.' },
    { h: '8. Contact Us', t: 'If you have questions or concerns about this Privacy Policy or your personal information, please contact us at: medifirst.help@gmail.com.' },
  ];
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <ModalHeader title="Privacy Policy" onClose={onClose} />
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          {sections.map((s, i) => (
            <View key={i} style={{ marginBottom: 22 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#1a1a2e', marginBottom: 6 }}>{s.h}</Text>
              <Text style={{ fontSize: 13, color: '#666', lineHeight: 21 }}>{s.t}</Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
