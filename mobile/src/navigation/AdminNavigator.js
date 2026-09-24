import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import {
  AdminReports, AdminConcerns, AdminUsage, AdminContent,
  AdminActivity, AdminHospitals, AdminChatbot,
  AdminUsers, AdminHotlines, AdminSettings,
} from '../screens/admin/AdminScreens';

const Stack = createStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AdminHome"        component={AdminHomeScreen} options={{ title: 'MediFirst Admin' }} />
      <Stack.Screen name="AdminReports"     component={AdminReports}     options={{ title: 'Incident Reports' }} />
      <Stack.Screen name="AdminConcerns"    component={AdminConcerns}    options={{ title: 'User Concerns' }} />
      <Stack.Screen name="AdminUsage"       component={AdminUsage}       options={{ title: 'Usage Reports' }} />
      <Stack.Screen name="AdminContent"     component={AdminContent}     options={{ title: 'First-Aid Content' }} />
      <Stack.Screen name="AdminActivity"    component={AdminActivity}    options={{ title: 'Activity Logs' }} />
      <Stack.Screen name="AdminHospitals"   component={AdminHospitals}   options={{ title: 'Hospital Data' }} />
      <Stack.Screen name="AdminChatbot"     component={AdminChatbot}     options={{ title: 'Chatbot Responses' }} />
      <Stack.Screen name="AdminUsers"       component={AdminUsers}       options={{ title: 'User Management' }} />
      <Stack.Screen name="AdminHotlines"    component={AdminHotlines}    options={{ title: 'Emergency Hotlines' }} />
      <Stack.Screen name="AdminSettings"    component={AdminSettings}    options={{ title: 'System Settings' }} />
    </Stack.Navigator>
  );
}
