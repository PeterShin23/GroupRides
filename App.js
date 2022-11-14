import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, TabActions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EventListScreen from './src/screens/eventListScreen';
import OrgListScreen from './src/screens/orgListScreen';
import UserProfileScreen from './src/screens/userProfileScreen';
import AuthScreen from './src/screens/authScreen';

const bottomTab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// "Home" screens need to be nested in a stack navigator for login/register func.
function Home() {
  return (
    <bottomTab.Navigator>
      <bottomTab.Screen name='My Events' component={EventListScreen}></bottomTab.Screen>
      <bottomTab.Screen name='My Organizations' component={OrgListScreen}></bottomTab.Screen>
      <bottomTab.Screen name='My User Profile' component={UserProfileScreen}></bottomTab.Screen>
    </bottomTab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name='Auth'
          component={AuthScreen}
          options={{
            headerTitle: "Welcome! Please Login or Register.",
          }}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
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
