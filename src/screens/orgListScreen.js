import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TouchableHighlight } from 'react-native';
// import { darkTheme } from '../../utils/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { getDatabase, ref, set } from 'firebase/database';
import { auth, db, storage } from '../../firebase';
import { get } from 'react-native-extra-dimensions-android';


export default function OrgListScreen({ navigation }) {

  const testOrgs  = [
    {id: 'testorg1id', name: "testOrgName", description: "", favorite: false},
    {id: 'testorg2id', name: "testOrgName2", description: "", favorite: false},
  ]

  const [orgItems, setOrgItems] = useState(testOrgs)

  const markItemFavorite = itemId => {
    const newItem = orgItems.map(item => {
        if (item.id == itemId) {
          return {...item, favorite: !item.favorite};
        }
        return item;
    });
    setOrgItems(newItem);
  };

  const orgInfoPressHandler = (item) => {
    navigation.navigate('Organization Info', {item})
  }

  const OrgItem = ({item}) => {
    return (
    <View style={styles.orgItem}>
        <View >
          <TouchableHighlight
            style = { [styles.orgPic, {
              backgroundColor:'#bbf1f1',
              justifyContent: 'center',
              alignItems: 'center',
              }]
            }
          > 
            <Text style={styles.orgLetter}>{item?.name.substring(0,1).toUpperCase()}</Text>
          </TouchableHighlight>
        </View>
        <View style={{flex:1, marginLeft:10}}>
            <Text style={styles.nameText}>
                {item?.name}
            </Text>
            <Text style={styles.idText}>
                @{item?.id}
            </Text>
        </View>
        <View>
          {item?.favorite && (
            <TouchableOpacity style={styles.favoriteButton} onPress={() => { markItemFavorite(item.id) }}>
              <Ionicons name='star' size={25} color={'#ffcd3c'}></Ionicons>
            </TouchableOpacity>
          )}
          {!item?.favorite && (
            <TouchableOpacity style={styles.favoriteButton} onPress={() => { markItemFavorite(item.id) }}>
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
        contentContainerStyle={{padding:10, paddingBottom:100}}
        data={orgItems.sort((a,b) => b.favorite-a.favorite || a.name.localeCompare(b.name))} 
        renderItem={({item}) => 
          <TouchableOpacity onPress={() => orgInfoPressHandler(item)}>
            <OrgItem item={item} />
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