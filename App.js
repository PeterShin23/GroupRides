import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, TabActions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import EventListScreen from './src/screens/eventListScreen';
import OrgListScreen from './src/screens/orgListScreen';
import UserProfileScreen from './src/screens/userProfileScreen';

const bottomTab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <bottomTab.Navigator>
        <bottomTab.Screen name='My Events' component={EventListScreen}></bottomTab.Screen>
        <bottomTab.Screen name='My Organizations' component={OrgListScreen}></bottomTab.Screen>
        <bottomTab.Screen name='My User Profile' component={UserProfileScreen}></bottomTab.Screen>
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
