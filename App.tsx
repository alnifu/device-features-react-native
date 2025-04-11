// App.tsx
import React, { useEffect } from 'react';
import { Alert, Platform, StatusBar } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function AppContent() {
  const { darkMode } = useTheme(); // Access theme context

  return (
    <>
      {/* Update the StatusBar based on theme */}
      <StatusBar
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <BottomTabNavigator />
    </>
  );
}

export default function App() {
  useEffect(() => {
    (async () => {
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use this app.');
      }

      const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
      if (notificationStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Notification permission is required to use this app.');
      }
    })();
  }, []);

  return (
    <ThemeProvider>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </ThemeProvider>
  );
}
