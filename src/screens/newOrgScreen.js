import React, { useState, useRef, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { getDatabase, ref, onValue, set, push, child, getMetadata } from 'firebase/database';
import { auth, db, storage } from '../../firebase';

export default function NewOrgScreen({navigation}) {

  const [oName, setOname] = useState('')
  const [oId, setOid] = useState('')
  const [idExistsText, setIdExistsText] = useState('this ID already exists!')
  const [idExistsBool, setIdExistsBool] = useState(false)

  function onCreateOrgHandler() {
    const db = getDatabase()
    const user = auth.currentUser
    
    // check if the organization id is unique
    const organizationRef = ref(db, `organization/` + oId);
    onValue(organizationRef, (snapshot) => {
      const organization = snapshot.val()
      if (organization === null) {
        console.log('organization does not exist yet')

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
      else {
        // TODO: Why is this code being reached if it already entered the if statement above?
        console.log('id already exists')

        // TODO: Works fine when the organization with the id doesn't exist.
        // For some reason, this alert pops up after an org with a unique id is made.
        // Need to fix this alert or change the way we display the error.
        // 'react-native-material-textfield' seems pretty useful for this.
        // Alert.alert('This ID already exists!')
      }
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

