import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { useSelector } from 'react-redux';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import AdminNavigator from './AdminNavigator';
import Loading from '../components/common/Loading';

export default function AppNavigator() {
  const { isAuthenticated, isGuest, role, authInitialRoute } = useSelector((state) => state.auth);

  // Single source of truth for the device StatusBar.
  // Admin uses a dark bar; everyone else uses a light bar.
  // This prevents the admin bar from leaking onto user screens
  // after an admin -> logout -> user cycle.
  const isAdmin = isAuthenticated && !isGuest && role === 'admin';

  return (
    <NavigationContainer>
      <StatusBar
        barStyle={isAdmin ? 'light-content' : 'dark-content'}
        backgroundColor={isAdmin ? '#1a1a2e' : '#e74c3c'}
      />
      {isGuest ? (
        <TabNavigator />
      ) : !isAuthenticated ? (
        <AuthNavigator initialRouteName={authInitialRoute || 'Login'} />
      ) : role === 'admin' ? (
        <AdminNavigator />
      ) : (
        <TabNavigator />
      )}
    </NavigationContainer>
  );
}
