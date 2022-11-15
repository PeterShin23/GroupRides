import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

export default function UserProfileScreen() {

  const handleSignOut = () => {
    signOut(auth).then(() => {
      console.log("Sign-out successful.")
    }).catch((error) => {
      alert("An error has occurred on sign-out.")
    });
  }

  return (
    <View style={styles.container}>
      <Text>Users will see their stuff here!</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutButton: {
    backgroundColor: 'white',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginTop: 5,
    borderColor: '#0783FF',
    borderWidth: 2,
    alignItems: 'center'
  },
  buttonContainer: {
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  signOutText: {
    color: '#0783FF',
    fontWeight: '700',
    fontSize: 16
  },
});