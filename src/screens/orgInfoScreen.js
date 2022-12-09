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


export default function OrgInfoScreen({ route, navigation }) {

  const { item } = route.params // organization information

  const [events, setEvents] = useState([])
  const [refresh, setRefresh] = useState(false)
  const user = auth.currentUser

  useEffect(() => {
    navigation.setOptions({
			headerTitle: item['value']['name']
	  })
    // console.log("------------------------------------------")
    getOrganizationEvents();
    // console.log(events)
  }, [refresh]);

  function getOrganizationEvents() {
    // get all events by the organization
    const orgEventsRef = ref(db, `organizationEvents/${item['value']['id']}`);
    onValue(orgEventsRef, (snapshot) => {
      var orgEvents = []
      if (!snapshot.exists()) {
        console.log("Organization does not have events")
      } else {
        // Get information about each event
        snapshot.forEach((snapshot) => {
          if (snapshot.exists()) {
            // console.log(snapshot.val())
            const eventId = snapshot.val()['id']
            let date = snapshot.val()['date'].split('/')
            let month = date[0]
            if (month.length == 1) {
              month = '0' + month
            }
            let day = date[1]
            if (day.length == 1) {
              day = '0' + day
            }
            let year = date[2]
            const formattedDate = `${year}/${month}/${day}`
            
            const name = snapshot.val()['name']
            
            const user2eventRef = ref(db, `user2event/${user.uid}/${eventId}`)
            onValue(user2eventRef, (ueSnapshot) => {
              if (ueSnapshot.val() === null) {
                console.log('user is not associated with this event')
              } else {
                // console.log(ueSnapshot.val())
                const favorite = ueSnapshot.val()['favorite']

                // put information together
                const eventInfo = {
                  id: eventId,
                  eventName: name,
                  date: formattedDate,
                  favorite: favorite
                }

                // push to event list
                orgEvents.push({label: eventId, value: eventInfo})
                setEvents(orgEvents)
              }
            })
          }
        })
      }
      // console.log(userOrgs)
    })
  }

  const formatDate = (dateString) => {
    const date = dateString.split('/')
    let month = date[1]
    let day = parseInt(date[2])
    return `${month}/${day}`
  }

  const markFavoriteEvent = (eventId, isFavorite) => {
    // console.log("mark event favorite")
    update(ref(db, `user2event/${user.uid}/${eventId}`), {
      favorite: !isFavorite
    }).then(() => {
      setRefresh(!refresh)
    })
  }

  const EventItem = ({item}) => {
    return (
    <View style={styles.eventItem}>
      <View>
        <Text style={styles.text}>
            {formatDate(item['value']['date'])}
        </Text>
      </View>
      <View style={{flex:1, marginLeft: 10}}>
        <Text style={styles.text}>
            {item['value']['eventName']}
        </Text>
      </View>
      <View>
        {item['value']['favorite'] && (
          <TouchableOpacity style={styles.favoriteButton} onPress={() => { markFavoriteEvent(item['value']['id'], item['value']['favorite']) }}>
            <Ionicons name='heart' size={25} color={'#ed2939'}></Ionicons>
          </TouchableOpacity>
        )}
        {!item['value']['favorite'] && (
          <TouchableOpacity style={styles.favoriteButton} onPress={() => { markFavoriteEvent(item['value']['id'], item['value']['favorite']) }}>
            <Ionicons name='heart-outline' size={25} color={'#ed2939'}></Ionicons>
          </TouchableOpacity>
        )}
      </View>
    </View>
    )    
  } 

	return (
		<View style={styles.body}>
			<View >
				<TouchableHighlight
					style = { [styles.orgPic, {
						backgroundColor:'#bbf1f1',
						justifyContent: 'center',
						alignItems: 'center',
						}]
					}
				> 
					<Text style={styles.orgLetter}>{item['value']['name'].substring(0,1).toUpperCase()}</Text>
				</TouchableHighlight>
			</View>
			<Text style={styles.idText}>@{item['value']['id']}</Text>
			<Text style={styles.headerText}>Upcoming Events</Text>
			<FlatList
			showsVerticalScrollingIndicator={true}
			contentContainerStyle={{padding:15}}
			style={styles.flatList}
      // TODO: sort doesn't work bu it's prolly simple fix
			data={events.sort((a,b) => b['value']['favorite']-a['value']['favorite'] || a['value']['date'].localeCompare(b['value']['date']))} 
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
	idText: {
		fontSize: 15,
		fontWeight: '500',
		textAlign: 'center',
    marginTop: 10,
    marginBottom: 5,
		// padding: 10,
	},
	headerText: {
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
