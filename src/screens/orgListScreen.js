import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TouchableHighlight } from 'react-native';
// import { darkTheme } from '../../utils/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { getDatabase, ref, onValue, set, update } from 'firebase/database';
import { auth, db, storage } from '../../firebase';


export default function OrgListScreen() {

  // list of organizations
  // const testOrgs  = [
  //   {id: 'testorg1id', name: "testOrgName", description: "", favorite: false},
  //   {id: 'testorg2id', name: "testOrgName2", description: "", favorite: false},
  // ]
  // const [orgItems, setOrgItems] = useState(testOrgs)
  const [userOrganizations, setUserOrganizations] = useState([])


  function getUserOrganizations() {
    const user = auth.currentUser

    // get all organizations of user
    let userOrgs = []
    const user2orgRef = ref(db, `user2organization/${user.uid}`);
    onValue(user2orgRef, (snapshot) => {
      if (snapshot.val() === null) {
        console.log("user is not part of any organizations")
      } else {
        // get information about organization
        console.log("Inside onValue user2orgRef")
        for (var orgId in snapshot.val()) {

          // get information from user2organization
          const favorite = snapshot.val()[orgId]['favorite']
          const memberType = snapshot.val()[orgId]['memberType']

          const orgRef = ref(db, `organization/${orgId}`)
          onValue(orgRef, (ss) => {
            console.log("Inside onValue orgRef WITH ORGID: " + orgId)
            if (ss.val() === null) {
              console.log('no such organization found')
            } else {
              // get info from organization
              const orgName = ss.val()['name']

              // put together information
              const orgInfo = {
                id: orgId,
                name: orgName,
                favorite: favorite,
                memberType: memberType
              }

              // push to temp list of orgs
              userOrgs.push({ label: orgId, value: orgInfo })

            }
          })
        }
      }
      console.log(userOrgs)
      setUserOrganizations(userOrgs)
    })
  }

  useEffect(() => {
    getUserOrganizations();
    // markItemFavorite();
    console.log("USEEFFECT FIRED")
  }, []);

  const markItemFavorite = orgId => {
    console.log('marking favorite')
    // const db = getDatabase()
    // const user = auth.currentUser

    // const markFavoriteOrgRef = ref(db, `user2organization/${user.uid}/${orgId}`);
    // onValue(markFavoriteOrgRef, (snapshot) => {
    //   if (snapshot.val() === null) {
    //     console.log('check ref path')
    //   } else {
    //     // update(markFavoriteOrgRef, {
    //     //   favorite: !snapshot.val()['favorite']
    //     // })
    //   }
    // })
    // // getUserOrganizations()
  }

  // works with test orgs
  // const markItemFavorite = itemId => {
  //   const newItem = orgItems.map(item => {
  //       if (item.id == itemId) {
  //         return {...item, favorite: !item.favorite};
  //       }
  //       return item;
  //   });
  //   setOrgItems(newItem);
  // };

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
            <TouchableOpacity style={styles.favoriteButton} onPress={() => { markItemFavorite(item['value']['id']) }}>
              <Ionicons name='star' size={25} color={'#ffcd3c'}></Ionicons>
            </TouchableOpacity>
          )}
          {!item['value']['favorite'] && (
            <TouchableOpacity style={styles.favoriteButton} onPress={() => { markItemFavorite(item['value']['id']) }}>
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
        contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
        data={userOrganizations.sort((a, b) => b['value']['favorite'] - a['value']['favorite'] || a['value']['name'].localeCompare(b['value']['name']))}
        renderItem={({ item }) => <OrganizationItem item={item} />}
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