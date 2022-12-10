import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, KeyboardAvoidingView, View, TextInput, FlatList, TouchableOpacity, TouchableHighlight, Platform, ToastAndroid, Alert } from 'react-native';
// import { darkTheme } from '../../utils/colors';
import Slider from '@react-native-community/slider';
import RNDateTimePicker from '@react-native-community/datetimepicker';

import { getDatabase, ref, onValue, set, get, update } from 'firebase/database';
import { auth, db, storage } from '../../firebase';
import uid from '../../utils/uid';


export default function NewDriverScreen({ route, navigation }) {

	const { eventData } = route.params
	const user = auth.currentUser

	// car information
	const [brand, setBrand] = useState('')
	const [color, setColor] = useState('')
	const [type, setType] = useState('')
	const [seatCount, setSeatCount] = useState(0)

	// pick up information
	const [pickupName, setPickupName] = useState('')
	const [pickupAddress, setPickupAddress] = useState('')
	// const [pickupTimePlaceholder, setPickupTimePlaceholder] = useState('')
	// const [pickupTime, setPickupTime] = useState('')
	// time
	const [timeText, setTimeText] = useState('Select Event Time')
	const [timeOpen, setTimeOpen] = useState(false)
	const [time, setTime] = useState(new Date())

	const onTimeChange = (event, selectedTime) => {
		const currentTime = selectedTime || time;
		setTimeOpen(false)
		setTime(currentTime)

		let tempTime = new Date(currentTime)
		// console.log(tempTime)
		let tempHours = tempTime.getHours()
		let amPm = "AM"
		if (tempHours > 12) {
			tempHours = tempHours - 12
			amPm = "PM"
		}
		let tempMinutes = tempTime.getMinutes()
		if (tempMinutes < 10) {
			tempMinutes = '0' + tempMinutes.toString()
		}
		let formattedTime = tempHours + ":" + tempMinutes + amPm
		setTimeText(formattedTime)
	}

  useEffect(() => {
		// console.log(eventData)
    getUserCarInformation();
		setDefaultTime();
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

	function setDefaultTime() {
		const orgEventRef = ref(db, `organizationEvents/${eventData['orgId']}/${eventData['eventId']}`)
		onValue(orgEventRef, (snapshot) => {

			// let's get event time information
			const date = snapshot.val()['date'].split('/')

			// let's set the date time like what Google does and set all events being set as 8:00AM
			const year = parseInt(date[2])
			const monthIndex = parseInt(date[0])-1 // 0-indexing
			const day = parseInt(date[1])
			setTime(new Date(year, monthIndex, day, 8))
			setTimeText('8:00AM')
		})
	}

	// TODO: i'm lazy af
	function getAvailableDriverInformation() {
		console.log('check for existing driver information for this event')
	}
	
	const AndroidDateTime = () => {
    return (
      <View>
        <Text style={styles.dateTimeText}>Select Pickup Time</Text>
        <TouchableOpacity style={styles.dateTimeButton} onPress={() => setTimeOpen(true)}>
          <Text style={{fontSize: 16, color: '#000'}}>{timeText}</Text>
        </TouchableOpacity>
        {timeOpen && 
          <RNDateTimePicker 
          mode="time"
          display="default"
          value={time}
          onChange={onTimeChange}
          style={styles.dateTimePicker}
          />
        }
      </View>
    )
  }

  // const iOSDateTime = () => {
  //   return (
  //     <View>
  //       <Text style={styles.dateTimeText}>Select Event Date</Text>
  //       <RNDateTimePicker
  //         mode="date"
  //         display="default"
  //         value={date}
  //         onChange={onDateChange}
  //         style={styles.dateTimePicker}
  //       />
  //       <Text style={styles.dateTimeText}>Select Event Time</Text>
  //       <RNDateTimePicker
  //         mode="time"
  //         display="default"
  //         value={time}
  //         onChange={onTimeChange}
  //         style={styles.dateTimePicker}
  //       />
  //     </View>
  //   )
  // }

	function saveDriverInfo() {
		// if user is driver, they can't be rider
		// if they are rider, they can't be driver
		const user2eventRef = ref(db, `user2event/${user.uid}/${eventData['eventId']}`)
		
		get(user2eventRef).then((snapshot) => {
			if (!snapshot.exists()) {
				console.log('user is not part of this organization event')
			} else {
				// change type to 'driver'
				update(user2eventRef, {
					type: 'driver'
				})

				// add/update driver information
				const user2eventDriverRef = ref(db, `user2event/${user.uid}/${eventData['eventId']}/driverInformation`)
				const driverInformation = {
					brand: brand,
					color: color,
					type: type,
					seatCount: seatCount,
					pickupName: pickupName,
					pickupAddress: pickupAddress,
					pickupDate: time.toLocaleDateString(),
					pickupTime: time.toLocaleTimeString(),
				}
				set(user2eventDriverRef, driverInformation)
				
				// add/update ride for event
				const rideId = uid()
				const eventRidesRef = ref(db, `eventRides/${eventData['orgId']}/${eventData['eventId']}/${user.uid}`)
				const eventRide = {
					rideId: rideId,
					driver: user.uid,
					riderCount: 0
				}
				set(eventRidesRef, eventRide)

				// let the user know that it saved
				let saveMessage = "Thanks for Driving!"
				if (Platform.OS === 'android') {
					ToastAndroid.show(saveMessage, ToastAndroid.SHORT)
				} else {
					Alert.alert(saveMessage)
				}

				navigation.goBack()
			}
		})
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
			{/* TODO: Figure out good way to show what event time is for reference when selecting pickup time */}
			<AndroidDateTime />
      {/* <Text style={[styles.inputLabels, {marginLeft: 32}]}>When will you pick up?</Text>
      <TextInput
        style={styles.input}
        placeholder={pickupTimePlaceholder}
        value={pickupTime}
        onChangeText={(value) => setPickupTime(value)}
      /> */}
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
	dateTimeButton: {
    alignSelf: 'center', // fit text
    padding: 8,
    // height: 40,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderColor: '#0783FF',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateTimeText: {
    fontSize: 16,
    marginBottom: 10,
  },
  dateTimePicker: {
    marginBottom: 10,
  },
})