import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, TouchableHighlight, Platform, ToastAndroid, Alert } from 'react-native';
// import { darkTheme } from '../../utils/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';

import { getDatabase, ref, onValue, set, get } from 'firebase/database';
import { auth, db, storage } from '../../firebase';


export default function CarInfoScreen({ navigation }) {

//   const [userOrganizations, setUserOrganizations] = useState([])
//   const [refresh, setRefresh] = useState(false)
	const [brand, setBrand] = useState('')
	const [color, setColor] = useState('')
	const [type, setType] = useState('')
	const [seatCount, setSeatCount] = useState(0)
  const user = auth.currentUser

  useEffect(() => {
    getUserCarInformation();
  }, []);

  function getUserCarInformation() {
    // try to retrieve user's car information
    const userCarRef = ref(db, `user2car/${user.uid}`)
    onValue(userCarRef, (snapshot) => {
      if (!snapshot.exists()) {
        // This means that we are not going to prefill any text fields
        console.log("User does not have saved car information.")
      } else {
        // retrieve and set information
        setBrand(snapshot.val()['brand'])
        setColor(snapshot.val()['color'])
        setType(snapshot.val()['type'])
        // TODO: This is stupid
        // Bug is: if i set and come back to screen, seatcount is set to value in db
        // if i update it, then come back to screen, seatcount is set to 0
        setSeatCount(snapshot.val()['seatCount'])  
      }
    })
    
  }

  function saveUserCarInformation() {
    
    // set car information to db
    const userCarRef = ref(db, `user2car/${user.uid}`)
    set(userCarRef, {
      brand: brand,
      color: color,
      type: type,
      seatCount: seatCount
    })

    // let the user know that it saved
    let saveMessage = "Car information saved!"
    if (Platform.OS === 'android') {
      ToastAndroid.show(saveMessage, ToastAndroid.SHORT)
    } else {
      Alert.alert(saveMessage)
    }

    navigation.navigate('My Profile')
  }

  return (
    <View style={styles.body}>
      <Text style={styles.inputLabels}>Car Brand</Text>
      <TextInput
        style={styles.input}
        placeholder="Car Brand"
        value={brand}
        onChangeText={(value) => setBrand(value)}
      />
      <Text style={styles.inputLabels}>Car Color</Text>
      <TextInput
        style={styles.input}
        placeholder="Car Color"
        value={color}
        onChangeText={(value) => setColor(value)}
      />
			<Text style={styles.inputLabels}>Car Type</Text>
      <TextInput
        style={styles.input}
        placeholder="Car Type"
        value={type}
        onChangeText={(value) => setType(value)}
      />
			<Text style={styles.inputLabels}>Set Default Number of Seats: {(seatCount)}</Text>
      <Slider
        style={{width:300, height:50}}
        step={1}
        value={seatCount}
        minimumValue={0}
        maximumValue={7}
        onValueChange={(value) => setSeatCount(value)}
        thumbTintColor={'#0783FF'}
      />
      <TouchableOpacity style={styles.button} onPress={() => saveUserCarInformation()}>
        <Text style={styles.buttonText}>Save</Text>
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
  orgPic: {
    width: 50,
    height: 50,
    borderRadius: 50,
    color: 'black',
    justifyContent: 'center',
  },
  orgLetter: {
    fontSize: 25,
    fontWeight: '500',
  },
  nameText: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'left',
  },
  idText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'left',
    color: '#444444'
  },
  orgItem: {
    padding: 20,
    flexDirection: 'row',
    elevation: 4,
    borderRadius: 8,
    marginVertical: 10,
    backgroundColor: 'white'
  },
  favoriteButton: {
    top: '25%',
    alignItems: 'center',
    marginRight: 20,
    borderRadius: 3,
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
    color: '#fff',
    fontSize: 16,
  },
})