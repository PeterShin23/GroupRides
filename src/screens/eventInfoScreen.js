import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TouchableHighlight, TextInput, Pressable, Button, Platform, StatusBar, Dimensions,} from 'react-native';
// import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
// import Modal from 'react-native-modal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { onValue, ref, set, update } from 'firebase/database';
import { auth, db, storage } from '../../firebase';


export default function EventInfoScreen({ route, navigation }) {

  const { item } = route.params // organization information

  const [orgName, setOrgName] = useState("")

  useEffect(() => {
    // console.log("------------------------------------------")
    getOrgName()
    // console.log(orgName)
    // console.log(item)
  }, []);

  function getOrgName() {
    const orgRef = ref(db, `organization/${item['value']['orgId']}`)
    onValue(orgRef, (orgSS) => {
        if (!orgSS.exists()) {
            console.log("Organization with this ID does not exist.")
        } else {
            setOrgName(orgSS.val()['name'])
        }
    })
  }


  const formatDate = (dateString) => {
    const date = dateString.split('/')
    let month = date[0]
    let day = parseInt(date[1])
    return `${month}/${day}`
  }

  const formatTime = (timeString) => {
    const time = timeString.split(':')
    let hour = parseInt(time[0])
    let minutes = time[1]
    let ampm = "AM"
    if (hour > 12) {
        hour = parseInt(hour) - 12
        ampm = "PM"
    }
    return `${hour}:${minutes}${ampm}`
  }

//   const markFavoriteEvent = (eventId, isFavorite) => {
//     // console.log("mark event favorite")
//     update(ref(db, `user2event/${user.uid}/${eventId}`), {
//       favorite: !isFavorite
//     }).then(() => {
//       setRefresh(!refresh)
//     })
//   }

//   const EventItem = ({item}) => {
//     return (
//     <View style={styles.eventItem}>
//       <View>
//         <Text style={styles.text}>
//             {formatDate(item['value']['date'])}
//         </Text>
//       </View>
//       <View style={{flex:1, marginLeft: 10}}>
//         <Text style={styles.text}>
//             {item['value']['eventName']}
//         </Text>
//       </View>
//       <View>
//         {item['value']['favorite'] && (
//           <TouchableOpacity style={styles.favoriteButton} onPress={() => { markFavoriteEvent(item['value']['id'], item['value']['favorite']) }}>
//             <Ionicons name='heart' size={25} color={'#ed2939'}></Ionicons>
//           </TouchableOpacity>
//         )}
//         {!item['value']['favorite'] && (
//           <TouchableOpacity style={styles.favoriteButton} onPress={() => { markFavoriteEvent(item['value']['id'], item['value']['favorite']) }}>
//             <Ionicons name='heart-outline' size={25} color={'#ed2939'}></Ionicons>
//           </TouchableOpacity>
//         )}
//       </View>
//     </View>
//     )    
//   } 

	return (
		<View style={styles.body}>
			<Text style={styles.beginText}>{orgName}</Text>
            <Text style={styles.hostingText}>is Hosting:</Text>
			<Text style={styles.eventText}>{item['value']['name']}!</Text>
            <Text style={styles.timeText}>Event is at {formatTime(item['value']['time'])} on {formatDate(item['value']['date'])}.</Text>
			<Text style={styles.pickupText}>Pickups @:</Text>
			{/* <FlatList
			showsVerticalScrollingIndicator={true}
			contentContainerStyle={{padding:15}}
			style={styles.flatList}
      // TODO: sort doesn't work bu it's prolly simple fix
			data={events.sort((a,b) => b['value']['favorite']-a['value']['favorite'] || a['value']['date'].localeCompare(b['value']['date']))} 
			renderItem={({item}) => <EventItem item={item} />}
			/> */}
		</View>
	)
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: 'white',
  },
	idText: {
		fontSize: 15,
		fontWeight: '500',
		textAlign: 'center',
    marginTop: 10,
    marginBottom: 5,
		// padding: 10,
	},
    beginText: {
        padding: 3,
		fontSize: 40,
		fontWeight: '700',
		textAlign: 'center',
        marginTop: 20,
		marginHorizontal: 30,
	},
    hostingText: {
        padding: 3,
		fontSize: 25,
		fontWeight: '700',
		textAlign: 'center',
		marginHorizontal: 30,
	},
	eventText: {
        padding: 3,
		fontSize: 40,
		fontWeight: '700',
		textAlign: 'center',
		marginHorizontal: 30,
	},
    timeText: {
        padding: 10,
		fontSize: 20,
		fontWeight: '600',
		textAlign: 'center',
		marginHorizontal: 30,
	},
    pickupText: {
		fontSize: 25,
		fontWeight: '500',
		textAlign: 'left',
		marginHorizontal: 30,
    marginBottom: 5,
	},
  text: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'left',
  },
	flatList: {
    flexGrow:0,
		top:0,
		bottom:100,
  },
  eventItem: {
    padding: 20,
    flexDirection: 'row',
    elevation: 4,
    borderRadius: 8,
    marginVertical: 10,
    backgroundColor: 'white'
  },
	orgPic: {
    width: 150,
    height: 150,
    borderRadius: 150,
    color: 'black',
    justifyContent: 'center',
		marginTop: 25,
		alignSelf: 'center'
  },
  orgLetter: {
    fontSize: 25,
    fontWeight: '500',
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
  addButton: {
    width: 110,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#49b3b3',
    justifyContent: 'center',
    alignItems: 'center', 
		alignSelf: 'center',
    position: 'absolute',
    bottom: 40,
    elevation: 2,
  },
  favoriteButton: {
    top: '25%',
    alignItems: 'center',
    marginRight: 20,
    borderRadius: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
  },
})
