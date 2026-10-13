import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileProvider } from './ProfileContext';
import ProfileScreen from './ProfileScreen';
import MedicalScreen from './MedicalScreen';
import ContactsScreen from './ContactsScreen';
import HistoryScreen from './HistoryScreen';
import TipsScreen from './TipsScreen';
import SettingsScreen from './SettingsScreen';

const Stack = createStackNavigator();

export default function ProfileStack() {
  return (
    <ProfileProvider>
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#f0f2f5' } }}>
        <Stack.Screen name="ProfileHome" component={ProfileScreen} />
        <Stack.Screen name="Medical"   component={MedicalScreen} />
        <Stack.Screen name="Contacts"  component={ContactsScreen} />
        <Stack.Screen name="History"   component={HistoryScreen} />
        <Stack.Screen name="Tips"      component={TipsScreen} />
        <Stack.Screen name="Settings"  component={SettingsScreen} />
      </Stack.Navigator>
    </ProfileProvider>
  );
}
