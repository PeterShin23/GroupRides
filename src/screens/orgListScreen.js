import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TouchableHighlight, Platform, ToastAndroid, Alert } from 'react-native';
// import { darkTheme } from '../../utils/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Dropdown } from 'react-native-element-dropdown';

import { getDatabase, ref, onValue, set, update, get } from 'firebase/database';
import { auth, db, storage } from '../../firebase';
// import { get } from 'http';


export default function OrgListScreen({ navigation }) {

    const [userOrganizations, setUserOrganizations] = useState([])
    const [refresh, setRefresh] = useState(false)
    const user = auth.currentUser

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
          getUserOrganizations()
          getAllOrganizations()
        });
    
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        getUserOrganizations();
        getAllOrganizations();
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

    // dropdown for searching organization
    const [selectedOrganization, setSelectedOrganization] = useState('')
    const [allOrganizations, setAllOrganizations] = useState([])

    function getAllOrganizations() {
        const user = auth.currentUser

        // get all organizations
        let allOrgs = []
        const orgRef = ref(db, `organization`);
        get(orgRef).then((snapshot) => {
            if (!snapshot.exists()) {
                console.log("The database doesn't have organizations")
            } else {
                // console.log(snapshot.val())
                for (var orgId in snapshot.val()) {
                    // console.log(orgId)
                    allOrgs.push({ label: `${orgId}`, value: `${orgId}` })
                }
            }
        })
        setAllOrganizations(allOrgs)
    }


    const orgInfoPressHandler = (item) => {
        navigation.navigate('Organization Information', { item })
    }

    const joinOrgPressHandler = () => {

        // let's add user to org as 'member'
        const user2organizationRef = ref(db, `user2organization/${user.uid}/${selectedOrganization}`);
        get(user2organizationRef).then((snapshot) => {
            if (snapshot.exists()) {
                console.error("This user is already a part of this organization!")
                alert("You are already a member of this organization")
            } else {
                // make this user a member of organization
                set(user2organizationRef, {
                    favorite: false,
                    memberType: 'member'
                })

                let joinMessage = `Joining @${selectedOrganization}`
                if (Platform.OS === 'android') {
                    ToastAndroid.show(joinMessage, ToastAndroid.SHORT)
                } else {
                    Alert.alert(joinMessage)
                }

                setRefresh(!refresh)

                // now that we added them to the organization, let's add the user to every event in the organization in the background
                const organizationEventsRef = ref(db, `organizationEvents/${selectedOrganization}`)
                get(organizationEventsRef).then((eventsSS) => {
                    if (!eventsSS.exists()) {
                        console.log("The organization doesn't have events")
                    } else {
                        // console.log(eventsSS.val())
                        for (var eventId in eventsSS.val()) {
                            const user2eventRef = ref(db, `user2event/${user.uid}/${eventId}`);

                            // add member information
                            set(user2eventRef, {
                                admin: false,
                                favorite: false,
                                type: "none"
                            })
                        }
                    }
                })
            }
        })

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
            <View style={{ flexDirection: 'row', marginHorizontal: 10 }}>
                <View style={{ flex: 1 }}>
                    <Dropdown
                        style={styles.dropdown}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        iconStyle={styles.iconStyle}
                        maxHeight={400}
                        search
                        searchPlaceholder="Search..."
                        placeholder="Search organization by ID"
                        data={allOrganizations}
                        labelField="label"
                        valueField="value"
                        value={selectedOrganization}
                        onChange={item => {
                            setSelectedOrganization(item.value);
                            // console.log(item)
                        }}
                        renderLeftIcon={() => (
                            <Ionicons name='search' color='#000' size={20} style={{ marginLeft: 5, marginRight: 10 }} />
                        )}
                    />
                </View>
                <View style={{ flex: 0.3 }}>
                    <TouchableOpacity style={styles.button} onPress={() => joinOrgPressHandler()}>
                        <Text style={styles.buttonText}>Join</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <FlatList
                showsVerticalScrollingIndicator={true}
                contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
                data={userOrganizations.sort((a, b) => b['value']['favorite'] - a['value']['favorite'] || a['value']['name'].localeCompare(b['value']['name']))}
                renderItem={({ item }) =>
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
    button: {
        width: '100%',
        height: 40,
        marginVertical: 5,
        borderRadius: 10,
        backgroundColor: '#49b3b3',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        elevation: 2,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    dropdown: {
        marginBottom: 5,
        marginHorizontal: 10,
        alignItems: 'center',
        height: 50,
        borderColor: '#0783FF',
        borderWidth: 2,
        borderRadius: 12,
        paddingLeft: 3
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
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
})