import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TouchableHighlight, Platform, ToastAndroid, Alert } from 'react-native';
// import { darkTheme } from '../../utils/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { getDatabase, ref, onValue, set, update } from 'firebase/database';
import { auth, db, storage } from '../../firebase';


export default function OrgListScreen({ navigation }) {

  const [userOrganizations, setUserOrganizations] = useState([])
  const [refresh, setRefresh] = useState(false)
  const user = auth.currentUser

  useEffect(() => {
    getUserOrganizations();
  }, [refresh]);

  function getUserOrganizations() {
    // get all organizations of user
    const user2orgRef = ref(db, `user2organization/${user.uid}`);
    onValue(user2orgRef, (snapshot) => {
      var userOrgs = []
      if (!snapshot.exists()) {
        console.log("User is not part of any organizations.")
      } else {
        // Get information about each organization the user is a part of
        snapshot.forEach((snapshot) => {
          if (snapshot.exists()) {
            let orgId = snapshot.key
            const orgRef = ref(db, `organization/${orgId}`)
            const favorite = snapshot.val()['favorite']
            const memberType = snapshot.val()['memberType']

            onValue(orgRef, (orgSnapshot) => {
              // console.log("Inside onValue orgRef WITH ORGID: " + orgId)
              if (orgSnapshot.val() === null) {
                console.log('no such organization found')
              } else {
                // get info from organization
                const orgName = orgSnapshot.val()['name']
                // put together information
                const orgInfo = {
                  id: orgId,
                  name: orgName,
                  favorite: favorite,
                  memberType: memberType
                }
  
                // push to temp list of orgs
                userOrgs.push({ label: orgId, value: orgInfo })
                setUserOrganizations(userOrgs)
              }
            })
          }
        })
      }
      // console.log(userOrgs)
    })
  }

  const orgInfoPressHandler = (item) => {
    navigation.navigate('Organization Information', {item})
  }

  const markItemFavorite = (orgId, isFavorite) => {
    // console.log('marking favorite')
    update(ref(db, `user2organization/${user.uid}/${orgId}`), {
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

  const OrganizationItem = ({ item }) => {
    return (
      <View style={styles.orgItem}>
        <View>
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
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.nameText}>
            {item['value']['name']}
          </Text>
          <Text style={styles.idText}>
            @{item['value']['id']}
          </Text>
        </View>
        <View>
          {item['value']['favorite'] && (
            <TouchableOpacity style={styles.favoriteButton} onPress={() => { markItemFavorite(item['value']['id'], item['value']['favorite']) }}>
              <Ionicons name='heart' size={25} color={'#ed2939'}></Ionicons>
            </TouchableOpacity>
          )}
          {!item['value']['favorite'] && (
            <TouchableOpacity style={styles.favoriteButton} onPress={() => { markItemFavorite(item['value']['id'], item['value']['favorite']) }}>
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
        contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
        data={userOrganizations.sort((a, b) => b['value']['favorite'] - a['value']['favorite'] || a['value']['name'].localeCompare(b['value']['name']))}
        renderItem={({item}) => 
          <TouchableOpacity onPress={() => orgInfoPressHandler(item)}>
            <OrganizationItem item={item} />
          </TouchableOpacity>
        }
      />
    </View>
  )
}
const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: 'white',
  },
  orgPic: {
    width: 50,
    height: 50,
    borderRadius: 50,
    color: 'black',
    justifyContent: 'center',
  },
  orgLetter: {
    fontSize: 25,
    fontWeight: '500',
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
  orgItem: {
    padding: 20,
    flexDirection: 'row',
    elevation: 4,
    borderRadius: 8,
    marginVertical: 10,
    backgroundColor: 'white'
  },
  favoriteButton: {
    top: '25%',
    alignItems: 'center',
    marginRight: 20,
    borderRadius: 3,
  }
})