import React from 'react';
import {Text} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import AddTravelScreen from '../screens/AddTravelScreen';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const { darkMode } = useTheme();  

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Add') {
            iconName = 'add-circle';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabel: ({ focused }) => {
          return (
            <Text style={{
              color: darkMode ? (focused ? '#fff' : '#aaa') : (focused ? '#000' : '#666'),
              fontSize: 12,
              marginTop: 5,
            }}>
              {route.name}
            </Text>
          );
        },
        tabBarStyle: {
          backgroundColor: darkMode ? '#222' : '#fff',  
          height: 70,  
          justifyContent: 'center',  
          alignItems: 'center', 
        },
        tabBarLabelStyle: {
          fontSize: 12,  
          marginTop: 5,  
        },
        tabBarShowLabel: true, 
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Add" component={AddTravelScreen} />
    </Tab.Navigator>
  );
}
