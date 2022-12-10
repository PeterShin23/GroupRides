import React, { useState, useRef, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { getDatabase, ref, onValue, set, get, child } from 'firebase/database';
import { auth, db, storage } from '../../firebase';
import { Accelerometer } from 'expo-sensors';

export default function NewOrgScreen({navigation}) {

  const [oName, setOname] = useState('')
  const [oId, setOid] = useState('')
  const [shake, setShake] = useState(false)

  function onCreateOrgHandler() {

    if (oName.trim().length === 0 || oId.trim().length === 0) {
      alert("Please complete all fields before submitting.")
      return
    }

    const user = auth.currentUser
    
    // check if the organization id is unique
    const organizationRef = ref(db, `organization/` + oId);
    get(organizationRef).then((snapshot) => {
      // If the snapshot exists, it means the org id is NOT unique
      if (snapshot.exists()) {
        console.log('id already exists')
        alert("An organization with the entered ID already exists. Please enter a new ID.")
      } else {
        // create organization for all users to find
        set(ref(db, 'organization/' + oId), {
          name: oName
        })

        // link this organization to creator
        const user2orgRef = ref(db, `user2organization/${user.uid}/${oId}`);
        set(user2orgRef, {
          favorite: false,
          memberType: "admin"      
        })

        navigation.navigate('My Organizations')
      }
    }).catch((error) => {
      console.error(error)
    })
  }

  // Source: https://stackoverflow.com/questions/56877709/how-do-i-detect-a-shake-event-i-looked-into-react-native-shake-but-i-noticed-it
  const configureShake = onShake => {
    // update value every 100ms.
    // Adjust this interval to detect
    // faster (20ms) or slower shakes (500ms)
    Accelerometer.setUpdateInterval(40);

    // at each update, we have acceleration registered on 3 axis
    // 1 = no device movement, only acceleration caused by gravity
    const onUpdate = ({ x, y, z }) => {

      // compute a total acceleration value, here with a square sum
      // you can eventually change the formula
      // if you want to prioritize an axis
      const acceleration = Math.sqrt(x * x + y * y + z * z);

      // Adjust sensibility, because it can depend of usage (& devices)
      const sensibility = 7;
      if (acceleration >= sensibility) {
        onShake(acceleration);
      }
    };

    Accelerometer.addListener(onUpdate);
  };

  // usage :
  configureShake(acceleration => {
    setShake(true)
    setOid('')
    setOname('')
    Accelerometer.removeAllListeners()
  });

  return (
    <View style={styles.body}>
      {
        shake &&
        <Text style={{marginBottom: 5}}>Tip: Shake your device to clear inputs!</Text>
      }
      <Text style={styles.inputLabels}>Organization Name</Text>
      <TextInput 
          style={styles.input} 
          placeholder="Organization Name"
          value={oName}
          onChangeText={(value) => setOname(value)}    
      ></TextInput>
      <Text style={styles.inputLabels}>Organization ID</Text>
      <TextInput 
          style={styles.input} 
          placeholder="Example: myOrgId1234"
          value={oId}
          onChangeText={(value) => setOid(value)}    
      ></TextInput>
      <TouchableOpacity style={styles.button} onPress={() => onCreateOrgHandler()}>
        <Text style={styles.buttonText}>Create</Text>
      </TouchableOpacity>
    </View>
  )
}
const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    paddingTop: 50,
  },
  inputLabels: {
    fontSize: 14,
    alignSelf: 'flex-start',
    marginLeft: 32,
    marginBottom: 2
  },
  input: {
    width: '85%',
    borderRadius: 12,
    borderColor: '#0783FF',
    textAlign: 'left',
    fontSize: 16,
    marginBottom: 20,
    padding: 10,
    borderWidth: 2
  },
  button: {
    width: 90,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#49b3b3',
    justifyContent: 'center',
    alignItems: 'center', 
    position: 'absolute',
    bottom: 40,
    elevation: 2,
  },
  buttonText: {
    color: '#eef5db',
    fontSize: 16,
  },
})

