import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Pressable, Button, Platform, StatusBar, Dimensions,} from 'react-native';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import Modal from 'react-native-modal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-navigation';
import { onValue, ref, set } from 'firebase/database';
import { auth, db, storage } from '../../firebase';


export default function EventListScreen() {

  const testEvents  = [
    {id: '1', name: "testEvent", date: "20221202", description: "", destination: ""},
    {id: '2', name: "testEvent2", date: "20221203", description: "", destination: ""},
  ]

  const [eventItems, setEventItems] = useState(testEvents)

  // useEffect(() => {
  //   return onValue(ref(db, '/events'), querySnapShot => {
  //     let data = querySnapShot.val() || {testEvents};
  //     let events = {...data};
  //     setEventItems(events)
  //   });
  // }, []);

  

  const EventItem = ({item}) => {
    return (
    <View style={styles.eventItem}>
        <View style={{flex:1}}>
            <Text style={styles.text}>
                {item?.name}
            </Text>
        </View>
        <View>
            <Text style={styles.text}>
                {item?.date}
            </Text>
        </View>
    </View>
    )    
  } 

  return (
    <View style={styles.body}>
      <FlatList
        showsVerticalScrollingIndicator={true}
        contentContainerStyle={{padding:15, paddingBottom:100}}
        data={eventItems.sort((a,b) => a.date-b.date)} 
        renderItem={({item}) => <EventItem item={item} />}
      />
    </View>
  )
}
const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: 'white',
  },
  text: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'left',
  },
  eventItem: {
    padding: 20,
    flexDirection: 'row',
    elevation: 4,
    borderRadius: 8,
    marginVertical: 10,
    backgroundColor: 'white'
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
  },
  sheetContainer: {
    // flex: 1,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#fff',
    textAlign: 'left',
    fontSize: 20,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  button: {
    width: 90,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#49b3b3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
})
