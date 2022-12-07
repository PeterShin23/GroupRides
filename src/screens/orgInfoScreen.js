import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TouchableHighlight, TextInput, Pressable, Button, Platform, StatusBar, Dimensions,} from 'react-native';
// import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
// import Modal from 'react-native-modal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-navigation';
import { onValue, ref, set } from 'firebase/database';
import { auth, db, storage } from '../../firebase';


export default function OrgInfoScreen({ route, navigation }) {

  const { item } = route.params

  const testEvents  = [
    {id: '1', name: "testEvent1", date: "20221202", description: "", destination: ""},
    {id: '2', name: "testEvent2", date: "20221203", description: "", destination: ""},
		{id: '3', name: "testEvent3", date: "20221202", description: "", destination: ""},
    {id: '4', name: "testEvent4", date: "20221203", description: "", destination: ""},
    {id: '5', name: "testEvent5", date: "20221204", description: "", destination: ""},
    {id: '6', name: "testEvent6", date: "20221204", description: "", destination: ""},

	]

  const [eventItems, setEventItems] = useState(testEvents)

  useEffect(() => {
    navigation.setOptions({
			headerTitle: `${item.name}`
	})
  }, []);

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
			<Text style={styles.idText}>@{item.id}</Text>
			<Text style={styles.headerText}>Upcoming Events</Text>
			<FlatList
			showsVerticalScrollingIndicator={true}
			contentContainerStyle={{padding:15}}
			style={styles.flatList}
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
	idText: {
		fontSize: 15,
		fontWeight: '500',
		textAlign: 'center',
		padding: 10,
	},
	headerText: {
		fontSize: 25,
		fontWeight: '500',
		textAlign: 'left',
		marginHorizontal: 30,
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
	
  buttonText: {
    color: '#fff',
    fontSize: 13,
  },
})
