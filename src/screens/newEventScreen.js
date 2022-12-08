import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Pressable, Button, Platform } from 'react-native';
// import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import { ref, onValue, set, get, child } from 'firebase/database';
import { auth, db, storage } from '../../firebase';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';

import uid from '../../utils/uid';

export default function NewEventScreen({ navigation }) {

  const [name, setName] = useState('')
  const [destination, setDestination] = useState('')

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
  const [dateOpen, setDateOpen] = useState(false)

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDateOpen(Platform.OS === 'ios');
    setDate(currentDate)

    let tempDate = new Date(currentDate)
    console.log(tempDate)
    let formattedDate = tempDate.getMonth() + 1 + "/" + tempDate.getDate() + "/" + tempDate.getFullYear()
    setDateText(formattedDate)
  }

  // time
  const [timeText, setTimeText] = useState('Select Event Time')
  const [time, setTime] = useState(new Date())
  const [timeOpen, setTimeOpen] = useState(false)

  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setTimeOpen(Platform.OS === 'ios');
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
    console.log("create event")
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

  return (
    <View style={styles.body}>
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
      <TextInput
        style={styles.input}
        placeholder="Event Name"
        value={name}
        onChangeText={(value) => setName(value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Event Destination"
        value={destination}
        onChangeText={(value) => setDestination(value)}
      />
      <Pressable onPress={() => setDateOpen(true)}>
        <Text style={styles.text}>{dateText}</Text>
      </Pressable>
      {dateOpen &&
        <RNDateTimePicker
          mode="date"
          display="default"
          value={new Date()}
          onChange={onDateChange}
        />
      }
      <Pressable onPress={() => setTimeOpen(true)}>
        <Text style={styles.text}>{timeText}</Text>
      </Pressable>
      {timeOpen &&
        <RNDateTimePicker
          mode="time"
          display="default"
          value={new Date()}
          onChange={onTimeChange}
        />
      }
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
    borderBottomColor: 'gray',
    borderBottomWidth: 0.5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
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
