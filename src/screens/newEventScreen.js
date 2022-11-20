import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Pressable, Button, Platform } from 'react-native';
// import DatePicker from 'react-native-date-picker';
import DateTimePicker from '@react-native-community/datetimepicker'
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import { onValue, ref, set } from 'firebase/database';
import { auth, db, storage } from '../../firebase';
import RNDateTimePicker from '@react-native-community/datetimepicker';

export default function NewEventScreen() {

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [destination, setDestination] = useState('')

  const [events, setEvents] = useState({})
  const [presentEvent, setPresentEvent] = useState('')

  function addEvent() {
    setPresentEvent('')
  }

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
  const [open, setOpen] = useState(false)

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setOpen(Platform.OS === 'ios');
    setDate(currentDate)

    let tempDate = new Date(currentDate)
    let formattedDate = tempDate.getMonth()+1 + "/" + tempDate.getDate() + "/" + tempDate.getFullYear()
    setDateText(formattedDate)
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
          placeholder="Event Description"
          value={description}
          onChangeText={(value) => setDescription(value)}    
      ></TextInput>
      <TextInput 
          style={styles.input} 
          placeholder="Event Destination"
          value={destination}
          onChangeText={(value) => setDestination(value)}    
      ></TextInput>
      <Pressable onPress={() => setOpen(true)}>
          <Text style={styles.text}>{dateText}</Text>
      </Pressable>
      {open && 
        <RNDateTimePicker 
        mode="date"
        display="default"
        value={new Date()}
        onChange={onDateChange}
        />
      }
      <TouchableOpacity style={styles.button} onPress={() => onSavePressHandler()}>
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
