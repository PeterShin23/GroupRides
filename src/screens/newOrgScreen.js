import React, { useState, useRef, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { getDatabase, ref, onValue, set, get, child } from 'firebase/database';
import { auth, db, storage } from '../../firebase';

export default function NewOrgScreen({navigation}) {

  const [oName, setOname] = useState('')
  const [oId, setOid] = useState('')
  const [idExistsText, setIdExistsText] = useState('this ID already exists!')
  const [idExistsBool, setIdExistsBool] = useState(false)

  function onCreateOrgHandler() {
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

  return (
    <View style={styles.body}>
      <TextInput 
          style={styles.input} 
          placeholder="Organization Name"
          value={oName}
          onChangeText={(value) => setOname(value)}    
      ></TextInput>
      <TextInput 
          style={styles.input} 
          placeholder="example: myOrgId1234"
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
  input: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#fff',
    textAlign: 'left',
    fontSize: 20,
    margin: 20,
    paddingHorizontal: 10,
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

