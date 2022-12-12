import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, KeyboardAvoidingView, View, TextInput, TouchableOpacity, Platform, ToastAndroid, Alert, ScrollView } from 'react-native'
import Slider from '@react-native-community/slider';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { auth, db, mapsApiKey } from '../../firebase';
import { LogBox } from 'react-native';
import { update, get, ref } from 'firebase/database';

const RideInfoScreen = ({ route, navigation }) => {
    const { rideInfo, eventData, userType } = route.params

    const [brand, setBrand] = useState(rideInfo.brand)
    const [color, setColor] = useState(rideInfo.color)
    const [type, setType] = useState(rideInfo.type)
    const [seatCount, setSeatCount] = useState(rideInfo.seatCount)

    // pick up information
    const [pickupName, setPickupName] = useState(rideInfo.pickupName)
    const [pickupAddress, setPickupAddress] = useState(rideInfo.pickupAddress)

    // time
    const [timeText, setTimeText] = useState('Select Event Time')
    const [timeOpen, setTimeOpen] = useState(false)
    // TODO: set displayed time as rideInfo.pickupTime
    const [time, setTime] = useState(new Date())

    const user = auth.currentUser

    useEffect(() => {
        LogBox.ignoreLogs(['VirtualizedLists should never be nested'])
        // console.log(pickupTimePlaceholder)
    }, []);

    const onTimeChange = (event, selectedTime) => {
        const currentTime = selectedTime || time;
        setTimeOpen(false)
        setTime(currentTime)

        let tempTime = new Date(currentTime)
        // console.log(tempTime)
        let tempHours = tempTime.getHours()
        let amPm = "AM"
        if (tempHours > 12) {
            tempHours = tempHours - 12
            amPm = "PM"
        }
        let tempMinutes = tempTime.getMinutes()
        if (tempMinutes < 10) {
            tempMinutes = '0' + tempMinutes.toString()
        }
        let formattedTime = tempHours + ":" + tempMinutes + amPm
        setTimeText(formattedTime)
    }

    function isEmptyString(input) {
        return input.trim().length === 0
    }

    function saveDriverInfo() {
        // Sanitize inputs before proceeding
        if (isEmptyString(brand) || isEmptyString(color) || isEmptyString(type) || isEmptyString(pickupName) || isEmptyString(pickupAddress) || seatCount === 0 || time == null) {
            alert("Please fill out all fields before submitting.")
            return
        }

        // if user is driver, they can't be rider
        // if they are rider, they can't be driver
        const user2eventRef = ref(db, `user2event/${user.uid}/${eventData['id']}`)

        get(user2eventRef).then((snapshot) => {
            if (!snapshot.exists()) {
                console.log('user is not part of this organization event')
            } else {
                // change type to 'driver'
                const updates = {}

                // add/update driver information
                const date = time.toLocaleDateString().split('/')
                let year = date[2]
                let month = date[0]
                if (month.length == 1) {
                    month = '0' + month
                }
                let day = date[1]
                if (day.length == 1) {
                    day = '0' + day
                }
                const formattedDate = `${year}/${month}/${day}`

                const driverInformation = {
                    brand: brand,
                    color: color,
                    type: type,
                    seatCount: seatCount,
                    pickupName: pickupName,
                    pickupAddress: pickupAddress,
                    pickupDate: formattedDate,
                    pickupTime: time.toLocaleTimeString(),
                }

                const user2event = {
                    driverInformation: driverInformation,
                    type: 'driver'
                }

                updates[`user2event/${user.uid}/${eventData['id']}`] = user2event

                const eventRide = {
                    rideId: rideInfo.rideId,
                    driver: user.uid,
                    riderCount: rideInfo.riderCount
                }
                updates[`eventRides/${eventData['orgId']}/${eventData['id']}/${rideInfo.rideId}`] = eventRide
                update(ref(db), updates)
                // let the user know that it saved
                let saveMessage = "Changes Saved!"
                if (Platform.OS === 'android') {
                    ToastAndroid.show(saveMessage, ToastAndroid.SHORT)
                } else {
                    Alert.alert(saveMessage)
                }

                navigation.goBack()
            }
        })
    }

    const RiderView = () => {
        return (
            <View>
                <Text style={styles.inputLabels}>Pickup Location</Text>
                <View style={styles.textContainer}>
                    <Text style={styles.pickupText}>{pickupName}</Text>
                </View>
                <Text style={styles.inputLabels}>Pickup Address</Text>
                <View style={styles.textContainer}>
                    <Text style={styles.pickupText}>{pickupAddress}</Text>
                </View>
                <Text style={styles.inputLabels}>Pickup Time</Text>
                <View style={styles.textContainer}>
                    <Text style={styles.pickupText}>{rideInfo.pickupTime}</Text>
                </View>
            </View>
        )
    }

    const DriverView = () => {
        return (
            <View>
                <Text style={styles.inputLabels}>Where will you pick up?</Text>
                <GooglePlacesAutocomplete
                    styles={{
                        container: {
                            width: '100%',
                            flex: 1,
                            marginBottom: 10
                        },
                        textInput: {
                            borderRadius: 12,
                            borderColor: '#0783FF',
                            textAlign: 'left',
                            fontSize: 14,
                            padding: 10,
                            borderWidth: 2,
                        },
                    }}
                    placeholder={pickupName}
                    onPress={(data, details = null) => {
                        setPickupName(data.description)
                    }}
                    query={{
                        key: mapsApiKey,
                        language: 'en',
                    }}
                />
                <Text style={styles.inputLabels}>Select pick up address:</Text>
                <GooglePlacesAutocomplete
                    styles={{
                        container: {
                            width: '100%',
                            flex: 1,
                            marginBottom: 10
                        },
                        textInput: {
                            borderRadius: 12,
                            borderColor: '#0783FF',
                            textAlign: 'left',
                            fontSize: 14,
                            padding: 10,
                            borderWidth: 2
                        }
                    }}
                    placeholder={pickupAddress}
                    onPress={(data, details = null) => {
                        setPickupAddress(data.description)
                    }}
                    query={{
                        key: mapsApiKey,
                        language: 'en',
                    }}
                />
                {Platform.OS === 'android' && <AndroidDateTime />}
                {Platform.OS === 'ios' &&
                    <View>
                        <Text style={styles.dateTimeText}>Select Pickup Time</Text>
                        <RNDateTimePicker
                            mode="time"
                            display="default"
                            value={time}
                            onChange={onTimeChange}
                            style={styles.dateTimePicker}
                        />
                    </View>
                }
                <TouchableOpacity style={styles.button} onPress={() => saveDriverInfo()}>
                    <Text style={styles.buttonText}>Update Info</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <KeyboardAvoidingView style={styles.body} behavior="padding">
            <ScrollView style={{ width: "90%" }} keyboardShouldPersistTaps={'always'} >
                <Text style={styles.eventTimeText}>Event Start Time: {eventData['time']}</Text>
                <Text style={styles.subheaders}>Vehicle Description</Text>
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabels}>Car Brand</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Car Brand"
                            value={brand}
                            editable={false}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabels}>Car Type</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Car Type"
                            value={type}
                            editable={false}
                        />
                    </View>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabels}>Car Color</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Car Color"
                            value={color}
                            editable={false}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabels}>Seats Available: {(seatCount)}</Text>
                        <Slider
                            style={{ width: 170, height: 50 }}
                            step={1}
                            value={seatCount}
                            disabled={true}
                            minimumValue={0}
                            maximumValue={7}
                            onValueChange={(value) => setSeatCount(value)}
                            thumbTintColor={'#0783FF'}
                        />
                    </View>
                </View>
                <Text style={styles.subheaders}>Pickup Information</Text>
                {
                    user.uid == rideInfo.driverid ? <DriverView /> : <RiderView />
                }
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    body: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        paddingTop: 25,
    },
    inputLabels: {
        fontSize: 14,
        alignSelf: 'flex-start',
        marginBottom: 2,
        marginLeft: 10
    },
    subheaders: {
        marginTop: 5,
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 10,
        textAlign: 'center'
    },
    input: {
        width: '85%',
        borderRadius: 12,
        borderColor: '#0783FF',
        textAlign: 'left',
        fontSize: 14,
        marginBottom: 10,
        padding: 10,
        borderWidth: 2
    },
    button: {
        width: 110,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#49b3b3',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
    },
    dateTimeButton: {
        alignSelf: 'center', // fit text
        padding: 8,
        // height: 40,
        borderRadius: 10,
        backgroundColor: '#fff',
        borderColor: '#0783FF',
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    dateTimeText: {
        fontSize: 16,
        marginBottom: 10,
        textAlign: 'center'
    },
    dateTimePicker: {
        marginBottom: 10,
        alignSelf: 'center'
    },
    eventTimeText: {
        marginBottom: 20,
        fontSize: 24,
        fontWeight: '300',
        textAlign: 'center'
    },
    textContainer: {
        width: '100%',
        flex: 1,
        marginBottom: 10
    },
    pickupText: {
        borderRadius: 12,
        borderColor: '#0783FF',
        textAlign: 'left',
        fontSize: 14,
        padding: 10,
        borderWidth: 2
    },
})

export default RideInfoScreen