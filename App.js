import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, TabActions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';  // https://ionic.io/ionicons

import { darkTheme } from './utils/colors';
import EventListScreen from './src/screens/eventListScreen';
import OrgListScreen from './src/screens/orgListScreen';
import UserProfileScreen from './src/screens/userProfileScreen';

const bottomTab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <bottomTab.Navigator
        screenOptions={ ({ route }) => ({
          tabBarIcon: ({ focused, color }) => {
            let iconName; 
            let iconSize;
            
            if (route.name === 'My Events') {
              iconName = focused
                ? 'today'
                : 'today-outline';
              iconSize = focused
                ? 25
                : 22;
            } 
            else if (route.name === 'My Organizations') {
              iconName = focused
                ? 'earth'
                : 'earth-outline';
              iconSize = focused
                ? 25
                : 22;
            }
            else if (route.name === 'My Profile') {
              iconName = focused
                ? 'person'
                : 'person-outline';
              iconSize = focused
                ? 25
                : 22;
            }

            return <Ionicons name={iconName} size={iconSize}></Ionicons>;
          },
          tabBarShowLabel: false,
        })}
        >
        <bottomTab.Screen name='My Events' component={EventListScreen} ></bottomTab.Screen>
        <bottomTab.Screen name='My Organizations' component={OrgListScreen}></bottomTab.Screen>
        <bottomTab.Screen name='My Profile' component={UserProfileScreen}></bottomTab.Screen>
      </bottomTab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
