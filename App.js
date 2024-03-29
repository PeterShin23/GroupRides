import React, { useState, useRef, useCallback, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Pressable, Button, Platform, SafeAreaView, Modal } from 'react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { NavigationContainer, TabActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';  // https://ionic.io/ionicons
// import { darkTheme } from './utils/colors';
import EventListScreen from './src/screens/eventListScreen';
import OrgListScreen from './src/screens/orgListScreen';
import UserProfileScreen from './src/screens/userProfileScreen';
import AuthScreen from './src/screens/authScreen';
import NewEventScreen from './src/screens/newEventScreen';
import NewOrgScreen from './src/screens/newOrgScreen';
import RegisterScreen from './src/screens/registerScreen';
import OrgInfoScreen from './src/screens/orgInfoScreen';
import EventInfoScreen from './src/screens/eventInfoScreen';
import CarInfoScreen from './src/screens/carInfoScreen';
import NewDriverScreen from './src/screens/newDriverScreen';
import RideInfoScreen from './src/screens/rideInfoScreen';
import EventEditScreen from './src/screens/eventEditScreen';

const bottomTab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
// "Home" screens need to be nested in a stack navigator for login/register func.
function Home({ navigation }) {

  return (
    <bottomTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let iconName;
          let iconSize;
          let iconColor;

          if (route.name === 'My Events') {
            iconName = focused
              ? 'today'
              : 'today-outline';
            iconSize = focused
              ? 30
              : 28;
            iconColor = focused
              ? '#49b3b3'
              : '#000'
          }
          else if (route.name === 'My Organizations') {
            iconName = focused
              ? 'earth'
              : 'earth-outline';
            iconSize = focused
              ? 30
              : 28;
            iconColor = focused
              ? '#49b3b3'
              : '#000'
          }
          else if (route.name === 'My Profile') {
            iconName = focused
              ? 'person'
              : 'person-outline';
            iconSize = focused
              ? 30
              : 28;
            iconColor = focused
              ? '#49b3b3'
              : '#000'
          }

          return <Ionicons name={iconName} size={iconSize} color={iconColor}></Ionicons>;
        },
        tabBarShowLabel: false,
      })}>
      <bottomTab.Screen
        name='My Events'
        component={EventListScreen}
      ></bottomTab.Screen>
      <bottomTab.Screen
        name='My Organizations'
        component={OrgListScreen}
        options={{
          headerRight: () => (
            <View>
              <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('New Organization')}>
                <Text style={styles.headerRightText}>Create</Text>
              </TouchableOpacity>
            </View>
          )
        }}></bottomTab.Screen>
      <bottomTab.Screen name='My Profile' component={UserProfileScreen}></bottomTab.Screen>
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
          name='Register'
          component={RegisterScreen}
          options={{
            headerTitle: "Create your account!"
          }}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            headerShown: false,
            headerBackVisible: false,
            gestureEnabled: false
          }}
        />
        <Stack.Screen
          name="New Event"
          component={NewEventScreen}
          options={{
            headerTitle: "Create Event",
          }}
        />
        <Stack.Screen
          name="Event Information"
          component={EventInfoScreen}
        // options={{
        //   headerRight: () => (
        //     <View>
        //       <TouchableOpacity style={styles.stackAddButton}>
        //         <Text style={styles.stackHeaderRightText}>Be a Driver</Text>
        //       </TouchableOpacity>
        //     </View>
        //   )
        // }}
        />
        <Stack.Screen
          name="New Organization"
          component={NewOrgScreen}
          options={{
            headerTitle: "Create Organization",
          }}
        />
        <Stack.Screen
          name="Organization Information"
          component={OrgInfoScreen}
        // options={{
        //   headerRight: () => (
        //     <View>
        //       <TouchableOpacity style={styles.stackAddButton}>
        //         <Text style={styles.stackHeaderRightText}>New Event</Text>
        //       </TouchableOpacity>
        //     </View>
        //   )
        // }}
        />
        <Stack.Screen
          name="Car Information"
          component={CarInfoScreen}
        />
        <Stack.Screen
          name="Be a Driver"
          component={NewDriverScreen}
          options={{
            headerTitle: "Be a Driver",
          }}
        />
        <Stack.Screen
          name='Ride Information'
          component={RideInfoScreen}
          options={{
            headerTitle: "Ride Information"
          }}
        />
        <Stack.Screen
          name="Edit Event"
          component={EventEditScreen}
          options={{
            headerTitle: "Edit Event"
          }}
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
  addButton: {
    width: 70,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#49b3b3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerRightText: {
    fontSize: 15,
    textAlign: 'center',
    color: 'white',
  },
  stackAddButton: {
    width: 90,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#49b3b3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stackHeaderRightText: {
    fontSize: 13,
    textAlign: 'center',
    color: 'white',
  },
});
