import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Pressable, ScrollView, Platform, Alert } from 'react-native';
import { ref, onValue, set, get, child, update, remove } from 'firebase/database';
import { auth, db, mapsApiKey } from '../../firebase';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';
import { Accelerometer } from 'expo-sensors';
import uid from '../../utils/uid';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { LogBox } from 'react-native';

export default function EventEditScreen({ route, navigation }) {

    const { eventData, orgName } = route.params

    const [name, setName] = useState(eventData['name'])
    const [destination, setDestination] = useState(eventData['destinationName'])

    useEffect(() => {
        LogBox.ignoreLogs(['VirtualizedLists should never be nested'])
    }, []);

    // Organization name
    const [selectedOrganization, setSelectedOrganization] = useState(orgName)

    // date
    // const [dateText, setDateText] = useState('Select Event Date')
    const [dateText, setDateText] = useState('')

    const [dateOpen, setDateOpen] = useState(false)
    const [date, setDate] = useState(new Date(eventData['date']))

    const onDateChange = (event, selectedDate) => {
        // console.log("selectedDATE:" + selectedDate)
        const currentDate = selectedDate || date;
        setDateOpen(false)
        setDate(currentDate)
        let tempDate = new Date(currentDate)
        // console.log("TEMPDATE" + tempDate)
        let formattedDate = tempDate.getMonth() + 1 + "/" + tempDate.getDate() + "/" + tempDate.getFullYear()
        setDateText(formattedDate)
    }

    // time
    const [timeText, setTimeText] = useState(eventData['time'])
    const [timeOpen, setTimeOpen] = useState(false)
    const [time, setTime] = useState(new Date())

    const onTimeChange = (event, selectedTime) => {
        const currentTime = selectedTime || time;
        // console.log(timeText)
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

    const AndroidDateTime = () => {
        return (
            <View>
                {/* <Pressable onPress={() => setDateOpen(true)}>
            <Text style={styles.text}>{dateText}</Text>
        </Pressable> */}
                <Text style={styles.dateTimeText}>Select Event Date</Text>
                <TouchableOpacity style={styles.dateTimeButton} onPress={() => setDateOpen(true)}>
                    <Text style={{ fontSize: 16, color: '#000' }}>{dateText}</Text>
                </TouchableOpacity>
                {dateOpen &&
                    <RNDateTimePicker
                        mode="date"
                        display="default"
                        value={date}
                        onChange={onDateChange}
                        style={styles.dateTimePicker}
                    />
                }
                <Text style={styles.dateTimeText}>Select Event Time</Text>
                <TouchableOpacity style={styles.dateTimeButton} onPress={() => setTimeOpen(true)}>
                    <Text style={{ fontSize: 16, color: '#000' }}>{timeText}</Text>
                </TouchableOpacity>
                {timeOpen &&
                    <RNDateTimePicker
                        mode="time"
                        display="default"
                        value={time}
                        onChange={onTimeChange}
                        style={styles.dateTimePicker}
                    />
                }
            </View>
        )
    }



    function onSaveEventHandler() {
        // console.log("create event")

        if (!selectedOrganization || name.trim().length === 0 || destination.trim().length === 0) {
            alert("Please complete all fields before submitting.")
            return
        }

        const user = auth.currentUser
        // Update the event
        const dateStr = date.toLocaleDateString().split('/')
        // console.log(dateStr)
        let year = dateStr[2]
        let month = dateStr[0]
        if (month.length == 1) {
            month = '0' + month
        }
        let day = dateStr[1]
        if (day.length == 1) {
            day = '0' + day
        }
        const formattedDate = `${year}/${month}/${day}`
        // console.log(formattedDate)

        const updates = {}
        const newInfo = {
            id: eventData['id'],
            name: name,
            destinationName: destination,
            date: formattedDate,
            time: timeText
        }
        updates[`organizationEvents/${eventData['orgId']}/${eventData['id']}`] = newInfo
        update(ref(db), updates)
        alert("Event changes saved!")
        navigation.navigate("Home")
    }

    function onDeleteHandler() {
        // First delete from organizationEvents
        remove(ref(db, `organizationEvents/${eventData['orgId']}/${eventData['id']}`))
        // Then remove all rides associated with this event
        remove(ref(db, `eventRides/${eventData['orgId']}/${eventData['id']}`))
        // Finally need to remove all instances of user2event for this event
        get(ref(db, `user2event`)).then((snapshot) => {
            // Inside each user2event/userid/ look for the event id and remove it
            snapshot.forEach((childss) => {
                remove(ref(db, `user2event/${childss.val().key}/${eventData['id']}}`))
            })
        }).finally(() => {
            navigation.navigate("Home")
        })
    }

    const deleteAlert = () =>
        Alert.alert(
        "Delete Event?",
        "Do you really want to delete this event?",
        [
            {
                text: "No",
                style: "cancel"
            },
            { text: "Yes", onPress: () => onDeleteHandler() }
        ]
    );

    return (
        <ScrollView style={{ width: "100%", height: "100%", backgroundColor: 'white' }} keyboardShouldPersistTaps={'always'} >
            <View style={styles.body}>
                <Text style={styles.inputLabels}>Organization</Text>
                <Text style={styles.input}>{orgName}</Text>
                <Text style={styles.inputLabels}>Event Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Event Name"
                    value={name}
                    onChangeText={(value) => setName(value)}
                />
                <Text style={styles.inputLabels}>Event Destination</Text>
                <GooglePlacesAutocomplete
                    styles={{
                        container: {
                            width: '85%',
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
                    placeholder={eventData['destinationName']}
                    onPress={(data, details = null) => {
                        setDestination(data.description)
                    }}
                    query={{
                        key: mapsApiKey,
                        language: 'en',
                    }}
                />
                {Platform.OS === 'android' && <AndroidDateTime />}
                {Platform.OS === 'ios' &&
                    <View>
                        <Text style={styles.dateTimeText}>Select Event Date</Text>
                        <RNDateTimePicker
                            mode="date"
                            display="default"
                            value={date}
                            onChange={onDateChange}
                            style={styles.dateTimePicker}
                        />
                        <Text style={styles.dateTimeText}>Current Event Time: {timeText}</Text>
                        <RNDateTimePicker
                            mode="time"
                            display="default"
                            value={time}
                            onChange={onTimeChange}
                            style={styles.dateTimePicker}
                        />
                    </View>
                }
                <TouchableOpacity style={styles.button} onPress={() => onSaveEventHandler()}>
                    <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => deleteAlert()}>
                    <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}
const styles = StyleSheet.create({
    body: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        paddingTop: 50,
    },
    dropdown: {
        width: '85%',
        // margin: 16,
        marginBottom: 20,
        height: 50,
        borderColor: '#0783FF',
        borderWidth: 2,
        borderRadius: 12,
        paddingLeft: 3
    },
    inputLabels: {
        fontSize: 14,
        alignSelf: 'flex-start',
        marginLeft: 32,
        marginBottom: 2
    },
    input: {
        width: '85%',
        borderRadius: 12,
        borderColor: '#0783FF',
        textAlign: 'left',
        fontSize: 16,
        marginBottom: 20,
        padding: 10,
        borderWidth: 2
    },
    button: {
        width: 90,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#49b3b3',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        marginBottom: 10
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
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
        marginBottom: 15,
        alignSelf: 'center'
    },
    deleteButton: {
        width: 90,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#FF0000',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    }
})
