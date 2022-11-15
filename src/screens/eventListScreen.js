import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { darkTheme } from '../../utils/colors';


export default function EventListScreen() {

  const testEvents  = [
    {id: '1', name: "testEvent", date: "20221202", description: "", destination: ""},
    {id: '2', name: "testEvent2", date: "20221203", description: "", destination: ""},
  ]

  const [bucketItems, setItems] = useState(testEvents)

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
        contentContainerStyle={{padding:20, paddingBottom:100}}
        data={bucketItems.sort((a,b) => a.completed-b.completed || a.dueDate.localeCompare(b.dueDate) || a.completedDate.localeCompare(b.completedDate))} 
        renderItem={({item}) => <EventItem item={item} />}
      />
    </View>
  )
}
const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  eventItem: {
    padding: 20,
    flexDirection: 'row',
    elevation: 1,
    borderRadius: 7,
    marginVertical: 10,
  },
})

//   const testEvents  = [
//     {id: '1', eventName: "testEvent", eventDate: "20221202", eventDescription: "", destination: ""},
//     {id: '2', eventName: "testEvent2", eventDate: "20221203", eventDescription: "", destination: ""},
//   ]

//   const [eventItems, setEventItems] = useState(testEvents)

//   const editEventPressHandler = (event) => {
//     // navigation.navigate('Edit Item', {item})
//     console.log(event)
//   }

//   // return list of items in FlatList style
//   const EventItem = ({event}) => {
//     // console.log(event)
//     return (
//     <View style={styles.listItem}>
//       <View style={{flex:1}}>
//         <Text>{event?.eventName}</Text>
//       </View>
//       <View style={{flex:1}}>
//         <Text>{event?.eventDate}</Text>
//       </View>
//     </View>
//     );    
// }

//     return (
        
//         <View style={styles.body}>
//             <FlatList
//                 showsVerticalScrollingIndicator={true}
//                 contentContainerStyle={{padding:20, paddingBottom:100}}
//                 data={eventItems.sort((a,b) => a.eventDate-b.eventDate)}
//                 keyExtractor={(event) => event.id} 
//                 renderItem={({ item: event }) => 
//                     <TouchableOpacity onPress={() => editEventPressHandler(event)}>
//                         <EventItem item={event} />
//                     </TouchableOpacity>
//                 }
//             />
//         </View>
//     )
// }

// const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: '#fff',
//       alignItems: 'center',
//       justifyContent: 'center',
//     },
//     body: {
//       flex: 1,
//       backgroundColor: '#eef5db',
//     },
//     text: {
//       color: '#4f6367',
//       fontSize: 20,
//       fontWeight: 'bold',
//       textAlign: 'left',
//     },
//     listItem: {
//       padding: 20,
//       backgroundColor: '#eef5db',
//       flexDirection: 'row',
//       elevation: 10,
//       borderRadius: 7,
//       marginVertical: 10,
//   },
// });