import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
// import { darkTheme } from '../../utils/colors';


export default function EventListScreen() {

  const testEvents  = [
    {id: '1', name: "testEvent", date: "20221202", description: "", destination: ""},
    {id: '2', name: "testEvent2", date: "20221203", description: "", destination: ""},
  ]

  const [eventItems, setItems] = useState(testEvents)

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
})
