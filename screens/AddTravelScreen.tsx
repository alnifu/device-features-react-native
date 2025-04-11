import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { saveEntry } from '../utils/storage';
import { TravelEntry } from '../types';
import uuid from 'react-native-uuid';
import { useTheme } from '../context/ThemeContext'; 

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function AddTravelScreen({ navigation }: any) {
  const { darkMode, toggleDarkMode } = useTheme(); 
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    (async () => {
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(locationStatus === 'granted');

     
      await registerForPushNotificationsAsync();
    })();
  }, []);

  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (!Device.isDevice) {
      Alert.alert('Notice', 'Push notifications require a physical device.');
      return;
    }

    const { granted } = await Notifications.getPermissionsAsync();
    if (!granted) {
      const { granted: newGranted } = await Notifications.requestPermissionsAsync();
      if (!newGranted) {
        Alert.alert('Permission Denied', 'Push notification permissions not granted.');
      }
    }

    if (Constants.expoConfig?.extra?.eas?.projectId) {
      const token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig.extra.eas.projectId,
        })
      ).data;
      console.log('Expo Push Token:', token);
    }
  };

  const takePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);
      fetchLocation();
    }
  };

  const fetchLocation = async () => {
    if (!hasLocationPermission) {
      Alert.alert('Location Permission', 'Location access is required to save this entry.');
      return;
    }

    setIsLocating(true);
    try {
      const { coords } = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync(coords);
      if (address.length > 0) {
        const { city, region, country } = address[0];
        setLocation(`${city}, ${region}, ${country}`);
      }
    } catch (error) {
      console.warn('Failed to fetch location:', error);
      setLocation(null);
    } finally {
      setIsLocating(false);
    }
  };

  const save = async () => {
    if (!photoUri) return;
    if (!location) {
      Alert.alert(
        'Missing Location',
        'Save without location?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save Anyway',
            onPress: async () => {
              await finalizeSave(null);
            },
          },
        ],
        { cancelable: true }
      );
    } else {
      await finalizeSave(location);
    }
  };

  const finalizeSave = async (loc: string | null) => {
    const newEntry: TravelEntry = {
      id: uuid.v4().toString(),
      imageUri: photoUri!,
      location: loc || undefined,
      liked: false,
    };

    await saveEntry(newEntry);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Travel Entry Saved',
        body: 'Your travel memory has been saved successfully.',
      },
      trigger: null, 
    });

    navigation.navigate('Home');
  };

  const clearPhoto = () => {
    setPhotoUri(null);
    setLocation(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#000' : '#fff' }]}>
      <View
        style={[
          styles.topBar,
          {
            paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 60,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
          },
        ]}
      >

        <Text
          style={{
            color: darkMode ? 'white' : 'black',
            fontSize: 18,
            fontWeight: '600',
          }}
        >
          New Travel Entry
        </Text>

        <TouchableOpacity onPress={toggleDarkMode}>
          <Ionicons
            name={darkMode ? 'sunny-outline' : 'moon-outline'}
            size={26}
            color={darkMode ? 'white' : 'black'}
          />
        </TouchableOpacity>
      </View>

      <View style={[styles.cameraContainer, { backgroundColor: darkMode ? '#222' : '#ddd' }]}>
        {photoUri ? (
          <>
            <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="contain" />
            <TouchableOpacity style={styles.trashIcon} onPress={clearPhoto}>
              <Ionicons name="trash" size={24} color="white" />
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.placeholder}>
            <Text style={[styles.text, { color: darkMode ? 'white' : 'black' }]}>No photo taken</Text>
          </View>
        )}
      </View>

      <View style={styles.indicator}>
        {photoUri && isLocating ? (
          <ActivityIndicator size="large" color={darkMode ? 'white' : '#000'} />
        ) : (
          photoUri && (
            <Text style={[styles.text, { color: darkMode ? 'white' : 'black' }]}>
              Location: {location || 'Fetching...'}
            </Text>
          )
        )}
      </View>

      <View style={styles.bottomButtons}>
        {!photoUri ? (
          <TouchableOpacity style={styles.actionBtn} onPress={takePicture}>
            <Text style={styles.btnText}>Take a Picture</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.actionBtn} onPress={save}>
            <Text style={styles.btnText}>Save Entry</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
  },
  cameraContainer: {
    flex: 0.75,
    marginTop: 20,
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  trashIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#000000aa',
    padding: 6,
    borderRadius: 20,
  },
  indicator: {
    alignItems: 'center',
    padding: 10,
  },
  text: {
    fontSize: 14,
  },
  bottomButtons: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#1e90ff',
    padding: 18,
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
