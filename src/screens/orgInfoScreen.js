import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TouchableHighlight, ToastAndroid, Alert } from 'react-native';
// import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
// import Modal from 'react-native-modal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { onValue, ref, remove, set, update, get, child } from 'firebase/database';
import { auth, db, storage } from '../../firebase';


export default function OrgInfoScreen({ route, navigation }) {

  const { item } = route.params // organization information

  const [events, setEvents] = useState([])
  const [refresh, setRefresh] = useState(false)
  const user = auth.currentUser

  useEffect(() => {
    navigation.setOptions({
      headerTitle: item['value']['name'],
      headerRight: () => (
        <View>
          <TouchableOpacity style={styles.stackAddButton} onPress={() => newEventPressHandler()}>
            <Text style={styles.stackHeaderRightText}>New Event</Text>
          </TouchableOpacity>
        </View>
      )
    })
    // console.log("------------------------------------------")
    getOrganizationEvents();
    // console.log(events)
  }, [refresh]);

  function getOrganizationEvents() {
    // get all events by the organization
    const orgId = item['value']['id']
    const orgEventsRef = ref(db, `organizationEvents/${orgId}`);
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
            let year = date[0]
            let month = date[1]
            if (month.length == 1) {
              month = '0' + month
            }
            let day = date[2]
            if (day.length == 1) {
              day = '0' + day
            }
            const formattedDate = `${year}/${month}/${day}`
            const name = snapshot.val()['name']
            const destinationName = snapshot.val()['destinationName']
            const time = snapshot.val()['time']

            const user2eventRef = ref(db, `user2event/${user.uid}/${eventId}`)
            onValue(user2eventRef, (ueSnapshot) => {
              var favorite = false
              var memberType = 'none'
              if (ueSnapshot.exists()) {
                favorite = ueSnapshot.val()['favorite']
                memberType = ueSnapshot.val()['type']
              }

              // put information together
              const eventInfo = {
                id: eventId,
                name: name,
                date: formattedDate,
                favorite: favorite,
                destinationName: destinationName,
                memberType: memberType,
                orgId: orgId,
                time: time
              }

              // push to event list
              orgEvents.push({ label: eventId, value: eventInfo })
              setEvents(orgEvents)
            }
            )
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

      let favoriteMessage = ""
      if (!isFavorite) {
        favoriteMessage = "Added to Favorites!"
      }
      else {
        favoriteMessage = "Removed from Favorites"
      }
      if (Platform.OS === 'android') {
        ToastAndroid.show(favoriteMessage, ToastAndroid.SHORT)
      } else {
        Alert.alert(favoriteMessage)
      }

      setRefresh(!refresh)
    })
  }

  const eventInfoPressHandler = (item) => {
    // console.log("-------from org info screen----------")
    // console.log(item)
    navigation.navigate('Event Information', { item })
  }

  const newEventPressHandler = () => {
    navigation.navigate('New Event', { preOrgId: `@${item['value']['id']}` })
  }

  const leaveOrgAlert = () => {
    Alert.alert(
      "Leave Organization?",
      "Do you really want to leave this organization?",
      [
        {
          text: "No",
          style: "cancel"
        },
        { text: "Yes", onPress: () => onLeaveOrgHandler() }
      ]
    )
  }

  function onLeaveOrgHandler() {
    const orgId = item['value']['id']
    // First remove user from organization join table
    remove(ref(db, `user2organization/${user.uid}/${orgId}`))
    // Then remove user from all events associated with that org
    get(ref(db, `organizationEvents/${orgId}`)).then((snapshot) => {
      if (snapshot.exists()) {
        snapshot.forEach((childss) => {
          const eventId = childss.val()['id']
          remove(ref(db, `user2event/${user.uid}/${eventId}`)).catch(() => {
            console.log("No such user2event entry exists!")
          })

          // Also need to remove any rides the user was a part of per event
          const rideRef = ref(db, `eventRides/${orgId}/${eventId}`)
          get(rideRef).then((ss) => {
            ss.forEach((ridess) => {
              // If current user is a driver, delete from db
              if (ridess.exists()) {
                if (ridess.val()['driver'] == user.uid) {
                  remove(`eventRides/${orgId}/${eventId}/${ridess.val()['rideId']}`).catch(() => {
                    console.log("No such eventRides entry exists!")
                  })
                }
              }
            })
          })
        })
      }
    }).finally(() => {
      navigation.navigate("Home")
    })
  }

  const EventItem = ({ item }) => {
    return (
      <View style={styles.eventItem}>
        <View>
          <Text style={styles.text}>
            {formatDate(item['value']['date'])}
          </Text>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.text}>
            {item['value']['name']}
          </Text>
        </View>
        <View style={{ alignSelf: 'center' }}>
          {
            item['value']['memberType'] == 'driver' &&
            <Text style={styles.joinedLabelText}>
              <Ionicons name="md-checkmark-circle" size={28} color="green" />
              Driver!
            </Text>
          }
          {
            item['value']['memberType'] == 'rider' &&
            <Text style={styles.joinedLabelText}>
              <Ionicons name="md-checkmark-circle" size={28} color="green" />
              Rider!
            </Text>
          }
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
          style={[styles.orgPic, {
            backgroundColor: '#bbf1f1',
            justifyContent: 'center',
            alignItems: 'center',
          }]
          }
        >
          <Text style={styles.orgLetter}>{item['value']['name'].substring(0, 1).toUpperCase()}</Text>
        </TouchableHighlight>
      </View>
      <Text style={styles.idText}>@{item['value']['id']}</Text>
      <Text style={styles.headerText}>Upcoming Events</Text>
      <FlatList
        showsVerticalScrollingIndicator={true}
        contentContainerStyle={{ padding: 15 }}
        style={styles.flatList}
        // TODO: sort doesn't work bu it's prolly simple fix
        data={events.sort((a, b) => b['value']['favorite'] - a['value']['favorite'] || a['value']['date'].localeCompare(b['value']['date']))}
        renderItem={({ item }) =>
          <TouchableOpacity onPress={() => eventInfoPressHandler(item)}>
            <EventItem item={item} />
          </TouchableOpacity>}
      />
      {
        item['value']['memberType'] == "member" &&
        <TouchableOpacity style={styles.deleteButton} onPress={() => leaveOrgAlert()}>
          <Text style={styles.buttonText}>Leave Organization</Text>
        </TouchableOpacity>
      }
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
    flexGrow: 0,
    top: 0,
    bottom: 100,
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
  stackAddButton: {
    width: 90,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#49b3b3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stackHeaderRightText: {
    fontSize: 13,
    textAlign: 'center',
    color: 'white',
  },
  joinedLabelText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '400',
    marginRight: 15
  },
  deleteButton: {
    height: 40,
    width: "85%",
    borderRadius: 10,
    backgroundColor: '#FF0000',
    alignSelf: 'center',
  }, 
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10
  },
})
