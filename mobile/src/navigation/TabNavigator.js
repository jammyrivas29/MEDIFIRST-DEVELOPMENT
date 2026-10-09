import React, { useEffect } from 'react';
import { View, StatusBar, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { getUserNotifications } from '../api/adminApi';
import { setUnread, loadSeenIds, computeUnread } from '../store/notifSlice';

// ── Screens ──
import GuestHomeScreen from '../screens/home/GuestHomeScreen';
import UserHomeScreen from '../screens/home/UserHomeScreen';
import GuidesListScreen from '../screens/firstAid/GuidesListScreen';
import GuideDetailEnhancedScreen from '../screens/firstAid/GuideDetailEnhancedScreen';
import EmergencyScreen from '../screens/emergency/EmergencyScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ChatbotScreen from '../screens/chatbot/ChatbotScreen';
import HospitalLocatorScreen from '../screens/hospital/HospitalLocatorScreen';
import VideoInstructionsScreen from '../screens/videos/VideoInstructionsScreen';
import NotificationsScreen from '../screens/home/NotificationsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ── Guides Stack ──
function GuidesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="GuidesList"
        component={GuidesListScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="GuideDetail"
        component={GuideDetailEnhancedScreen}
        options={{
          title: 'Guide Detail',
          headerStyle: { backgroundColor: '#e74c3c' },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}

// ── Guest Stack ──
function GuestStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={GuestHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Guides"
        component={GuidesStack}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Hospital"
        component={HospitalLocatorScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// ── Main Tab Navigator ──
export default function TabNavigator() {
  const { isAuthenticated, isGuest } = useSelector((state) => state.auth);
  const unreadAlerts = useSelector((state) => state.notif?.unread || 0);
  const dispatch = useDispatch();

  // Populate the navbar unread badge at launch (so +N shows without opening the tab first)
  useEffect(() => {
    if (isGuest || !isAuthenticated) return;
    let active = true;
    (async () => {
      try {
        const d = await getUserNotifications();
        const list = d.notifications || [];
        const seen = await loadSeenIds();
        const unread = computeUnread(list, seen);
        if (active) dispatch(setUnread(unread));
      } catch { /* ignore */ }
    })();
    return () => { active = false; };
  }, [isAuthenticated, isGuest, dispatch]);

  if (isGuest || !isAuthenticated) {
    return <GuestStack />;
  }

  return (
    <Tab.Navigator
      screenListeners={({ route }) => ({
        focus: () => {
          // Restore correct status bar color per tab when focused
          StatusBar.setBarStyle('light-content');
          if (Platform.OS === 'android') {
            const colors = {
              Hospital: '#27ae60',
              Home:     '#e74c3c',
              Guides:   '#e74c3c',
              Emergency:'#e74c3c',
              Profile:  '#e74c3c',
              Chatbot:  '#e74c3c',
              Alerts:   '#e74c3c',
            };
            StatusBar.setBackgroundColor(colors[route.name] || '#e74c3c');
          }
          // Clear the unread badge when the Alerts tab is opened
          if (route.name === 'Alerts') {
            dispatch({ type: 'notif/clearUnread' });
          }
        },
      })}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home:      focused ? 'home'    : 'home-outline',
            Guides:    focused ? 'book'    : 'book-outline',
            Hospital:  focused ? 'hospital-marker' : 'hospital-marker',
            Emergency: focused ? 'warning' : 'warning-outline',
            Profile:   focused ? 'person'  : 'person-outline',
            Alerts:    focused ? 'notifications' : 'notifications-outline',
          };
          if (route.name === 'Hospital') {
            return <MaterialCommunityIcons name={icons.Hospital} size={size} color={color} />;
          }
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor:   '#e74c3c',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle:             { paddingBottom: 5, height: 60 },
        headerStyle:             { backgroundColor: '#e74c3c' },
        headerTintColor:         '#fff',
        headerTitleStyle:        { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen
        name="Home"
        component={UserHomeScreen}
        options={{ headerShown: false, sceneContainerStyle: { marginTop: 0, paddingTop: 0 } }}
      />
      <Tab.Screen
        name="Guides"
        component={GuidesStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Hospital"
        component={HospitalLocatorScreen}
        options={{ headerShown: false, sceneContainerStyle: { marginTop: 0, paddingTop: 0 } }}
      />
      <Tab.Screen
        name="Emergency"
        component={EmergencyScreen}
        options={{
          headerShown: false,
          sceneContainerStyle: { marginTop: 0, paddingTop: 0 },
          tabBarLabel: 'Emergency',
          tabBarBadge: '!',
          tabBarBadgeStyle: { backgroundColor: '#e74c3c', color: '#fff' },
        }}
      />
      {/* Chatbot hidden from tab bar but still navigable via floating button */}
      <Tab.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{
          tabBarButton: () => null,
          headerShown: false,
        }}
      />
      {/* Videos hidden from tab bar but navigable from home tool */}
      <Tab.Screen
        name="Videos"
        component={VideoInstructionsScreen}
        options={{
          tabBarButton: () => null,
          title: 'Video Instructions',
          headerStyle: { backgroundColor: '#e74c3c' },
          headerTintColor: '#fff',
        }}
      />
      {/* Alerts: user receives admin emergency alerts */}
      <Tab.Screen
        name="Alerts"
        component={NotificationsScreen}
        options={{
          headerShown: false,
          sceneContainerStyle: { marginTop: 0, paddingTop: 0 },
          tabBarBadge: unreadAlerts > 0 ? unreadAlerts : undefined,
          tabBarBadgeStyle: { backgroundColor: '#e74c3c', color: '#fff', fontSize: 10, minWidth: 18, height: 18 },
        }}
      />
      {/* Profile: far right end */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false,
          sceneContainerStyle: { marginTop: 0, paddingTop: 0 },
        }}
      />
    </Tab.Navigator>
  );
}