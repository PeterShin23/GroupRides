import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Pressable, Button, Platform } from 'react-native';
import { ref, onValue, set, get, child } from 'firebase/database';
import { auth, db, storage } from '../../firebase';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';
import { Accelerometer } from 'expo-sensors';
import uid from '../../utils/uid';

export default function NewEventScreen({ navigation }) {

  const [name, setName] = useState('')
  const [destination, setDestination] = useState('')
  const [shake, setShake] = useState(false)

  useEffect(() => {
    getUserOrganizations();
  }, []);

  // dropdown
  const [selectedOrganization, setSelectedOrganization] = useState(null)
  const [userOrganizations, setUserOrganizations] = useState([])

  function getUserOrganizations() {
    const user = auth.currentUser

    // get all organizations of user
    let userOrgs = []
    const user2orgRef = ref(db, `user2organization/${user.uid}`);
    get(user2orgRef).then((snapshot) => {
      if (!snapshot.exists()) {
        console.log("User is not part of any organizations.")
      }
      else {
        for (var orgId in snapshot.val()) {
          // console.log(orgId)                        // get the key
          // console.log(snapshot.val()[orgId])        // get the value of key
          userOrgs.push({ label: `@${orgId}`, value: `@${orgId}` }) // This way because of item schema: https://www.npmjs.com/package/react-native-element-dropdown
        }
      }
    })
    // console.log(userOrgs)
    setUserOrganizations(userOrgs)
  }

  // date
  const [dateText, setDateText] = useState('Select Event Date')
  const [date, setDate] = useState(new Date())

  const onDateChange = (event, selectedDate) => {
    console.log("selectedDATE:" + selectedDate)
    const currentDate = selectedDate || date;
    setDate(currentDate)
    let tempDate = new Date(currentDate)
    console.log("TEMPDATE" + tempDate)
    let formattedDate = tempDate.getMonth() + 1 + "/" + tempDate.getDate() + "/" + tempDate.getFullYear()
    setDateText(formattedDate)
  }

  // time
  const [timeText, setTimeText] = useState('Select Event Time')
  const [time, setTime] = useState(new Date())

  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
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

  function onCreateEventHandler() {
    // console.log("create event")

    if (!selectedOrganization || name.trim().length === 0 || destination.trim().length === 0) {
      alert("Please complete all fields before submitting.")
      return
    }

    const user = auth.currentUser
    // let's add event to org
    const orgId = selectedOrganization.substring(1)  // removing '@'
    const eventId = uid()
    const orgEventRef = ref(db, `organizationEvents/${orgId}/${eventId}`);

    get(orgEventRef).then((snapshot) => {
      // If the snapshot exists, it means the eventId exists already
      if (snapshot.exists()) {
        console.error("Event with ID: " + eventId + " already exists!")
        alert("Event with ID: " + eventId + " already exists! Please try again.")
      }
      else {
        // add event to selected organization
        set(orgEventRef, {
          id: eventId,
          name: name,
          destinationName: destination,
          date: date.toLocaleDateString(),
          time: time.toLocaleTimeString()
        })

        // make user the host (admin) of event
        const user2eventRef = ref(db, `user2event/${user.uid}/${eventId}`)
        set(user2eventRef, {
          type: 'admin',
          favorite: false
        })

        navigation.navigate('My Events')
      }
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
    setName("")
    setDate(new Date())
    setDateText(new Date().toLocaleDateString())
    const currentTime = new Date();
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
    setDestination('')
    setSelectedOrganization(null)

    Accelerometer.removeAllListeners()
  });

  return (
    <View style={styles.body}>
      {
        shake &&
        <Text>Tip: Shake your device to clear inputs!</Text>
      }
      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        maxHeight={300}
        placeholder="Select an organization"
        data={userOrganizations}
        labelField="label"
        valueField="value"
        value={selectedOrganization}
        onChange={item => {
          setSelectedOrganization(item.value);
        }}

      />
      <Text style={styles.inputLabels}>Event Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Event Name"
        value={name}
        onChangeText={(value) => setName(value)}
      />
      <Text style={styles.inputLabels}>Event Destination</Text>
      <TextInput
        style={styles.input}
        placeholder="Event Destination"
        value={destination}
        onChangeText={(value) => setDestination(value)}
      />
      <Text style={styles.dateTimeText}>Select Event Date</Text>
      <RNDateTimePicker
        mode="date"
        display="default"
        value={date}
        onChange={onDateChange}
        style={styles.dateTimePicker}
      />
      <Text style={styles.dateTimeText}>Select Event Time</Text>
      <RNDateTimePicker
        mode="time"
        display="default"
        value={time}
        onChange={onTimeChange}
        style={styles.dateTimePicker}
      />
      <TouchableOpacity style={styles.button} onPress={() => onCreateEventHandler()}>
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
  dropdown: {
    width: '80%',
    margin: 16,
    height: 50,
    borderColor: '#49b3b3',
    borderWidth: 2,
    borderRadius: 16,
    paddingLeft: 3
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
  dateTimeText: {
    fontSize: 16,
  },
  dateTimePicker: {
    marginBottom: 10,
  },
})
