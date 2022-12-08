import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Pressable, Button, Platform, StatusBar, Dimensions,} from 'react-native';
import { onValue, ref, set, get, update } from 'firebase/database';
import { auth, db, storage } from '../../firebase';
import Ionicons from 'react-native-vector-icons/Ionicons';


export default function EventListScreen() {

  const [eventItems, setEventItems] = useState([])
  const [refresh, setRefresh] = useState(false)
  const user = auth.currentUser

  useEffect(() => {
    getUserEvents()
  }, [refresh])

  function getUserEvents() {
    const user2orgRef = ref(db, `user2organization/${user.uid}`)
    onValue(user2orgRef, (snapshot) => {
      var tempEvents = []
      // Means user is not in any orgs therefore no events.
      if (!snapshot.exists()) {
        console.log("User is not part of any organizations. No events.")
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
                      memberType = ss.val()['type']
                      favorite = ss.val()['favorite']
                    }
                    const eventInfo = {
                      id: childss.key,
                      name: childss.val()['name'],
                      destinationName: childss.val()['destinationName'],
                      time: childss.val()['time'],
                      date: childss.val()['date'],
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

  const markFavoriteEvent = (eventId, isFavorite) => {
    // console.log("mark event favorite")
    update(ref(db, `user2event/${user.uid}/${eventId}`), {
      favorite: !isFavorite
    }).then(() => {
      setRefresh(!refresh)
    })
  }

  const EventItem = ({ item }) => {
    // console.log("inside eventitem")
    let orgId = item.value.orgId
    // TODO: REPLACE ORGID WITH ORGNAME
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
            {item['value']['date']}
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
              <Ionicons name='star' size={25} color={'#ffcd3c'}></Ionicons>
            </TouchableOpacity>
          )}
          {!item['value']['favorite'] && (
            <TouchableOpacity style={styles.favoriteButton} onPress={() => { markFavoriteEvent(item['value']['id'], item['value']['favorite']) }}>
              <Ionicons name='star-outline' size={25} color={'#ffcd3c'}></Ionicons>
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
        data={eventItems.sort((a, b) => b['value']['favorite'] - a['value']['favorite'] || a['value']['name'].localeCompare(b['value']['name']))}
        renderItem={({ item }) => <EventItem item={item} />}
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
  nameText: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'left',
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
  }
})
