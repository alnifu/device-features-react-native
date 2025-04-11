// App.tsx
import React, { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import { ThemeProvider } from './context/ThemeContext';


export default function App() {
  useEffect(() => {
    (async () => {
      // Request location permissions
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use this app.');
      }

      // Request notification permissions (expo-notifications v0.14.0+)
      const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
      if (notificationStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Notification permission is required to use this app.');
      }
    })();
  }, []);

  return (
    <ThemeProvider>
      <NavigationContainer>
        <BottomTabNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}

