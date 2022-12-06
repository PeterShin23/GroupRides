import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Pressable, Button, Platform } from 'react-native';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import { onValue, ref, set } from 'firebase/database';
import { auth, db, storage } from '../../firebase';
import RNDateTimePicker from '@react-native-community/datetimepicker';

import uid from '../../utils/uid';

export default function NewEventScreen() {

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [destination, setDestination] = useState('')

  const [events, setEvents] = useState({})

  useEffect(() => {
    return onValue(ref(db, '/events'), querySnapShot => {
      let data = querySnapShot.val() || {};
      let events = {...data};
      setEvents(events)
    });
  }, []);

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
    let formattedDate = tempDate.getMonth()+1 + "/" + tempDate.getDate() + "/" + tempDate.getFullYear()
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
    let formattedTime = tempHours + ":" + tempTime.getMinutes() + amPm
    setTimeText(formattedTime) 
  }

  function onCreateEventHandler() {
    console.log("create event")
  }

  return (
    <View style={styles.body}>
      <TextInput 
          style={styles.input} 
          placeholder="Event Name"
          value={name}
          onChangeText={(value) => setName(value)}    
      ></TextInput>
      <TextInput 
          style={styles.input} 
          placeholder="Event Destination"
          value={destination}
          onChangeText={(value) => setDestination(value)}    
      ></TextInput>
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
