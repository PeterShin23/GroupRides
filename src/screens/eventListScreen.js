import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Pressable, Button, Platform, ToastAndroid} from 'react-native';
import { onValue, ref, set, get, update } from 'firebase/database';
import { auth, db, storage } from '../../firebase';
import Ionicons from 'react-native-vector-icons/Ionicons';


export default function EventListScreen({ navigation }) {

  const [eventItems, setEventItems] = useState([])
  const [refresh, setRefresh] = useState(false)
  const user = auth.currentUser

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View>
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('New Event', { preOrgId: null })}>
            <Text style={styles.headerRightText}>Create</Text>
          </TouchableOpacity>
        </View>
      )
    })
  }, [])

  useEffect(() => {
    getUserEvents()
  }, [refresh])

  function getUserEvents() {
    const user2orgRef = ref(db, `user2organization/${user.uid}`)
    onValue(user2orgRef, (snapshot) => {
      var tempEvents = []
      // Means user is not in any orgs therefore no events.
      if (!snapshot.exists()) {
        console.log("User has no events.")
      } else {
        // Now accumulate all events from organizations the user is a part of.
        // For each organization, add eventItems to temp array
        snapshot.forEach((snapshot) => {
          if (snapshot.exists()) {
            let orgId = snapshot.key
            const orgEventsRef = ref(db, `organizationEvents/${orgId}`)
            onValue(orgEventsRef, (eventSnapshot) => {
              // Make sure that an event was actually returned
              if (eventSnapshot.exists()) {
                // Loop through each org's event
                eventSnapshot.forEach((childss) => {
                  // Assemble event information
                  var memberType = ''
                  var favorite = false
                  // Member status and favorite data
                  onValue(ref(db, `user2event/${user.uid}/${childss.key}`), (ss) => {
                    if (ss.exists()) {
                      memberType = ss.val()['admin']
                      favorite = ss.val()['favorite']
                    }

                    let date = childss.val()['date'].split('/')
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

                    const eventInfo = {
                      id: childss.key,
                      name: childss.val()['name'],
                      destinationName: childss.val()['destinationName'],
                      time: childss.val()['time'],
                      date: formattedDate,
                      memberType: memberType,
                      favorite: favorite,
                      orgId: orgId,
                    }

                    // Finally push to temp list of events
                    tempEvents.push({ label: childss.key, value: eventInfo })
                    setEventItems(tempEvents)
                    // console.log("End of get")
                    // console.log(eventItems)
                  })
                })
              }
            })
          }
        })
        // console.log("For loop finished executing")
      }
      // console.log("End of onValue, function over")
    })
  }

  const eventInfoPressHandler = (item) => {
    // console.log("-------from event list screen----------")
    // console.log(item)
    navigation.navigate('Event Information', { item })
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

  const EventItem = ({ item }) => {
    // console.log("inside eventitem")
    let orgId = item.value.orgId
    // TODO: REPLACE ORGID WITH ORGNAME (low priority)
    // var orgName = ''
    // get(ref(db, `organization/${orgId}`)).then((snapshot) => {
    //   if (snapshot.exists()) {
    //     orgName = snapshot.val()['name']
    //   }
    // })

    return (
      <View style={styles.eventItem}>
        <View>
          <Text style={styles.dateText}>
            {formatDate(item['value']['date'])}
          </Text>
        </View>
        <View style={{ flex: 1, marginLeft: 2 }}>
          <Text style={styles.nameText}>
            {item['value']['name']}
          </Text>
          <Text style={styles.idText}>
            @{orgId}
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
      <FlatList
        showsVerticalScrollingIndicator={true}
        contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
        data={eventItems.sort((a, b) => b['value']['favorite'] - a['value']['favorite'] || a['value']['date'].localeCompare(b['value']['date']))}
        renderItem={({ item }) =>
          <TouchableOpacity onPress={() => eventInfoPressHandler(item)}>
            <EventItem item={item} />
          </TouchableOpacity>}
      />
      {
        eventItems.length == 0 &&
        <Text style={styles.noEventText}>There are no events going on. Please join an organization to make an event!</Text>
      }
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
  nameText: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'left',
  },
  noEventText: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
  idText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'left',
    color: '#444444'
  },
  dateText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'left',
    marginVertical: 10,
    marginRight: 10
  },
  favoriteButton: {
    top: '25%',
    alignItems: 'center',
    marginRight: 20,
    borderRadius: 3,
  },
  addButton: {
    width: 70,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#49b3b3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerRightText: {
    fontSize: 15,
    textAlign: 'center',
    color: 'white',
  },
})
