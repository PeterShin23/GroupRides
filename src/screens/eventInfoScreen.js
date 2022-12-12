import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TouchableHighlight, TextInput, Pressable, Button, Platform, StatusBar, Linking, } from 'react-native';
// import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
// import Modal from 'react-native-modal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { onValue, ref, set, update, get } from 'firebase/database';
import { auth, db, storage } from '../../firebase';


export default function EventInfoScreen({ route, navigation }) {

    const { item } = route.params // organization information
    const user = auth.currentUser
    // retrieve rides
    const [rides, setRides] = useState([])
    const [refresh, setRefresh] = useState(false)
    const [headerRefresh, setHeaderRefresh] = useState(false)
    // Is the user a driver, rider, or none
    const [userType, setUserType] = useState('')
    // Is the user the admin of this event (can they edit it?)
    const [userAdmin, setUserAdmin] = useState(false)

    useEffect(() => {
        getOrgName()
        getEventRides()
        getUserStatus()
    }, [refresh]);

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View>
                    {
                        userType == "none" ?                
                        <TouchableOpacity style={styles.stackAddButton} onPress={() => onBeDriverPressHandler()}>
                            <Text style={styles.stackHeaderRightText}>Be a Driver</Text>
                        </TouchableOpacity> : <View></View>
                    }
                </View>
            )
        })
    }, [headerRefresh])

    // find organization Name for screen
    const [orgName, setOrgName] = useState("")
    function getOrgName() {
        // TODO: Add if there's something good to add for event info name
        // navigation.setOptions({
        //     headerTitle: `Event Information`
        // })
        const orgRef = ref(db, `organization/${item['value']['orgId']}`)
        onValue(orgRef, (orgSS) => {
            if (!orgSS.exists()) {
                console.log("Organization with this ID does not exist.")
            } else {
                setOrgName(orgSS.val()['name'])
            }
        })
    }


    function getEventRides() {
        const eventRidesRef = ref(db, `eventRides/${item['value']['orgId']}/${item['value']['id']}`)
        onValue(eventRidesRef, (eventRidesSS) => {
            var tempRides = []
            // If it does not exist, it means that there are no rides yet.
            if (!eventRidesSS.exists()) {
                console.log("There are no rides associated with this event.")
            } else {
                // For each ride associated with the event, grab all relevant info
                eventRidesSS.forEach((snapshot) => {
                    if (snapshot.exists()) {
                        var driverid = snapshot.val()['driver']
                        var rideid = snapshot.val()['rideId']
                        var riderCount = snapshot.val()['riderCount']
                        // Need to retrieve the driverInformation from user2event
                        const user2eventRef = ref(db, `user2event/${driverid}/${item['value']['id']}/driverInformation`)
                        onValue(user2eventRef, (user2eventSS) => {
                            if (user2eventSS.exists()) {
                                // console.log(user2eventSS.val())
                                var brand = user2eventSS.val()["brand"]
                                var color = user2eventSS.val()["color"]
                                var pickupAddress = user2eventSS.val()["pickupAddress"]
                                var pickupName = user2eventSS.val()['pickupName']
                                var pickupTime = user2eventSS.val()["pickupTime"]
                                var seatCount = user2eventSS.val()["seatCount"]
                                var type = user2eventSS.val()["type"]
                                
                                // Finally, get the driver's username to display on the ride info
                                const driverRef = ref(db, `users/${driverid}`)
                                get(driverRef).then((driverSS) => {
                                    if (driverSS.exists()) {
                                        var driveruser = driverSS.val()['username']
                                        // Populate rideInformation
                                        const rideInformation = {
                                            rideId: rideid,
                                            driverid: driverid,
                                            driveruser: driveruser,
                                            riderCount: riderCount,
                                            brand: brand,
                                            color: color,
                                            type: type,
                                            seatCount: seatCount,
                                            pickupAddress: pickupAddress,
                                            pickupName: pickupName,
                                            pickupTime: pickupTime,
                                        }
                                        // console.log(rideInformation)
                                        tempRides.push({ label: rideid, value: rideInformation })
                                        setRides(tempRides)
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    }

    function getUserStatus() {
        onValue(ref(db, `user2event/${user.uid}/${item['value']['id']}`), (snapshot) => {
            if (snapshot.exists()) {
                setUserType(snapshot.val()["type"])
                setUserAdmin(snapshot.val()["admin"])
                // console.log(snapshot.val()['admin'])
            }
            else {
                setUserType("none")
                setUserAdmin(false)
            }
        })
        setHeaderRefresh(!headerRefresh)
    }

    // format date time for screen
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

    // Source: https://stackoverflow.com/questions/45527549/react-native-opening-native-maps
    const openMap = () => {
        if (Platform.OS == "ios") {
            Linking.openURL(`http://maps.apple.com/maps?daddr=${item['value']['destinationName']}`);
        } else if (Platform.OS == "android") {
            Linking.openURL(`http://maps.google.com/maps?daddr=${item['value']['destinationName']}`);
        }
    }

    const onBeDriverPressHandler = () => {
        // console.log(item['value']['time'])
        const eventData = {
            eventId: item['value']['id'],
            orgId: item['value']['orgId'],
            time: item['value']['time']
        }
        setRefresh(!refresh)
        navigation.navigate('Be a Driver', { eventData })
    }

    const EmptyListView = () => {
        return (
            <View style={styles.emptyListView}>
                <Text style={styles.emptyListText}>
                    There aren't any rides yet! Check back later.
                </Text>
            </View>
        )
    }

    const RideItem = ({ rideItem }) => {
        const rideInfo = rideItem['value']
        // Only want to let a user join a ride if they aren't already involved in one
        const showButton = rideInfo.riderCount < rideInfo.seatCount && userType == 'none'

        return (
            <View style={styles.rideInfoContainer}>
                {
                    // Highlight your name if you are the driver
                    rideInfo.driverid == user.uid ? 
                    <Text style={[styles.driverText, {color: '#07ff83'}]}>Driver: {rideInfo.driveruser}</Text> :
                    <Text style={styles.driverText}>Driver: {rideInfo.driveruser}</Text>
                }
                
                <Text style={styles.pickupText}>Pickup Location: {rideInfo.pickupName}</Text>
                <Text style={styles.riderCountText}>Riders: {rideInfo.riderCount} (Max {rideInfo.seatCount})</Text>
                {
                    showButton &&
                    <TouchableOpacity style={styles.joinRiderButton} onPress={() => onJoinAsRider(rideInfo)}>
                        <Text>Join as Rider</Text>
                    </TouchableOpacity>
                }
            </View>
        )
    }

    const onJoinAsRider = ({ rideInfo }) => {
        if (userType !== "none") {
            alert("You are already part of a ride for this event!")
            return
        }
        if (rideInfo.riderCount >= rideInfo.seatCount) {
            alert("This ride already has the max amount of riders!")
            return
        }
        
        // Simultaneous updates we want to make to db
        const updates = {}
        const riderInformation = {
            riderId: user.uid,
            driverId: rideInfo.driverid,
            driverUser: rideInfo.driveruser,
            pickupName: rideInfo.pickupName,
            pickupAddress: rideInfo.pickupAddress,
            seatCount: rideInfo.seatCount,
            car: rideInfo.color + rideInfo.brand + rideInfo.type
        }
        const user2event = {
            riderInformation: riderInformation,
            type: 'rider'
        }
        updates[`user2event/${user.uid}/${item['value']['id']}`] = user2event
        updates[`eventRides/${item['value']['id']}/${rideInfo.rideId}`] = {riderCount: rideInfo.riderCount++}
        update(ref(db), updates).then(() => {
            console.log("I work!")
        }).catch(() => {
            console.error("I don't work :(")
        })
        setRefresh(!refresh)
    }

    const onPressRideItem = (rideInfo) => {
        let eventData = item['value']
        // console.log(rideInfo)
        navigation.navigate("Ride Information", {rideInfo, eventData, userType})
    }

    const onPressEdit = () => {
        let eventData = item['value']
        navigation.navigate("Edit Event", {eventData, orgName})
    }

    return (
        <View style={styles.body}>
            <Text style={styles.beginText}>{orgName}</Text>
            <Text style={styles.hostingText}>is Hosting:</Text>
            <Text style={styles.eventText}>{item['value']['name']}!</Text>
            <Text style={styles.timeText}>Event is at {item['value']['time']} on {item['value']['date'].substring(5)}.</Text>
            <TouchableOpacity onPress={openMap}>
                <Text style={styles.destinationText}>
                    Destination: {item['value']['destinationName']}
                </Text>
            </TouchableOpacity>
            {
                rides.length == 0 ? <EmptyListView /> :
                    <FlatList
                        showsVerticalScrollingIndicator={true}
                        contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
                        data={rides}
                        renderItem={({ item }) =>
                            <TouchableOpacity onPress={() => onPressRideItem(item['value'])}>
                                <RideItem rideItem={item} />
                            </TouchableOpacity>}
                    />
            }
            {
                userAdmin ? 
                <TouchableOpacity style={styles.addButton} onPress={() => onPressEdit()}>
                    <Text style={{fontSize: 16, fontWeight: '600'}}>Edit Event</Text>
                </TouchableOpacity> : <View></View>
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
    destinationText: {
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 5,
        fontWeight: '600',
        color: '#0783FF'
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
        backgroundColor: '#07ff83',
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
    emptyListView: {
        marginVertical: '30%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyListText: {
        padding: 10,
        fontSize: 20,
        fontWeight: '500',
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
    rideInfoContainer: {
        width: "100%",
        borderRadius: 10,
        borderWidth: 2,
        flex: 1,
        backgroundColor: '#0783FF',
        marginBottom: 10,
        padding: 5
    },
    driverText: {
        textAlign: 'center',
        fontSize: 22,
        fontWeight: '500',
        color: 'white'
    },
    pickupText: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '500',
        color: 'white'
    },
    riderCountText: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500',
        color: 'white'
    },
    joinRiderButton: {
        backgroundColor: '#07ff83',
        alignSelf: 'center',
        margin: 5,
        borderRadius: 15,
        padding: 10
    }
})
