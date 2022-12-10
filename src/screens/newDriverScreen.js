import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, KeyboardAvoidingView, View, TextInput, FlatList, TouchableOpacity, TouchableHighlight, Platform, ToastAndroid, Alert } from 'react-native';
// import { darkTheme } from '../../utils/colors';
import Slider from '@react-native-community/slider';

import { getDatabase, ref, onValue, set, get } from 'firebase/database';
import { auth, db, storage } from '../../firebase';


export default function NewDriverScreen({ route, navigation }) {

	const { eventData } = route.params

	// car information
	const [brand, setBrand] = useState('')
	const [color, setColor] = useState('')
	const [type, setType] = useState('')
	const [seatCount, setSeatCount] = useState(0)

	// pick up information
	const [pickupName, setPickupName] = useState('')
	const [pickupAddress, setPickupAddress] = useState('')
	const [pickupTimePlaceholder, setPickupTimePlaceholder] = useState('')
	const [pickupTime, setPickupTime] = useState('')
  const user = auth.currentUser

  useEffect(() => {
		console.log(eventData)
    getUserCarInformation();
		getEventTime();
		// console.log(pickupTimePlaceholder)
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

	function getEventTime() {
		const orgEventRef = ref(db, `organizationEvents/${eventData['orgId']}/${eventData['eventId']}`)
		onValue(orgEventRef, (snapshot) => {

			const time = snapshot.val()['time'].split(':')
			let hour = parseInt(time[0])
			let minutes = time[1]
			let ampm = "AM"
			if (hour > 12) {
					hour = parseInt(hour) - 12
					ampm = "PM"
			}
			setPickupTimePlaceholder("This event is at " + `${hour}:${minutes}${ampm}.`)
		})
	}

	function saveDriverInfo() {
		// if user is driver, they can't be rider
		// if they are rider, they can't be driver
		console.log('save driver info')
	}

  return (
    <KeyboardAvoidingView style={styles.body} behavior="padding">
			<Text style={{fontSize: 16, fontWeight: '500', marginBottom: 10}}>Vehicle Description</Text>
      <View style={{flexDirection: 'row', marginLeft: 32}}>
				<View style={{flex: 1}}>
					<Text style={styles.inputLabels}>Car Brand</Text>
					<TextInput
						style={styles.input}
						placeholder="Car Brand"
						value={brand}
						onChangeText={(value) => setBrand(value)}
					/>
				</View>
				<View style={{flex: 1}}>
					<Text style={styles.inputLabels}>Car Type</Text>
					<TextInput
						style={styles.input}
						placeholder="Car Type"
						value={type}
						onChangeText={(value) => setType(value)}
					/>
				</View>
			</View>
			<View style={{flexDirection: 'row', marginLeft: 32}}>
				<View style={{flex: 1}}>
					<Text style={styles.inputLabels}>Car Color</Text>
					<TextInput
						style={styles.input}
						placeholder="Car Color"
						value={color}
						onChangeText={(value) => setColor(value)}
					/>
				</View>
				<View style={{flex: 1}}>
					<Text style={styles.inputLabels}>Seats Available: {(seatCount)}</Text>
					<Slider
						style={{width:170, height:50}}
						step={1}
						value={seatCount}
						minimumValue={0}
						maximumValue={7}
						onValueChange={(value) => setSeatCount(value)}
						thumbTintColor={'#0783FF'}
					/>
				</View>
			</View>
			<Text style={{marginTop: 5, fontSize: 16, fontWeight: '500', marginBottom: 10}}>Pickup Information</Text>
			<Text style={[styles.inputLabels, {marginLeft: 32}]}>Where will you pick up?</Text>
      <TextInput
        style={styles.input}
        placeholder="Pick up location"
        value={pickupName}
        onChangeText={(value) => setPickupName(value)}
      />
			{/* TODO: put a dropdown here of Maps address */}
			<Text style={[styles.inputLabels, {marginLeft: 32}]}>Select pick up address:</Text>
      <TextInput
        style={styles.input}
        placeholder="Pick up address"
        value={pickupAddress}
        onChangeText={(value) => setPickupAddress(value)}
      />
			{/* TODO: make this a time picker */}
      <Text style={[styles.inputLabels, {marginLeft: 32}]}>When will you pick up?</Text>
      <TextInput
        style={styles.input}
        placeholder={pickupTimePlaceholder}
        value={pickupTime}
        onChangeText={(value) => setPickupTime(value)}
      />
      <TouchableOpacity style={styles.button} onPress={() => saveDriverInfo()}>
        <Text style={styles.buttonText}>Let's Drive</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  )
}
const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: 'white',
		alignItems: 'center',
    paddingTop: 25,
  },
	inputLabels: {
    fontSize: 14,
    alignSelf: 'flex-start',
    marginBottom: 2
  },
  input: {
    width: '85%',
    borderRadius: 12,
    borderColor: '#0783FF',
    textAlign: 'left',
    fontSize: 14,
    marginBottom: 10,
    padding: 10,
    borderWidth: 2
  },
  button: {
    width: 110,
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
    fontSize: 14,
  },
})