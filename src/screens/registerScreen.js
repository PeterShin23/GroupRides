import { KeyboardAvoidingView, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { createUserWithEmailAndPassword } from "firebase/auth";
import * as ImagePicker from 'expo-image-picker';
import { ref as stref, uploadBytes } from 'firebase/storage';
import { ref as dbref, set } from 'firebase/database';
import { auth, db, storage } from '../../firebase';
import { Entypo } from '@expo/vector-icons';

const RegisterScreen = () => {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [profilePic, setProfilePic] = useState(null)

    const handleSignUp = () => {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                console.log(user.email + " has signed up!")
                if (profilePic) {
                    uploadImage(profilePic, user.uid)
                }
                set(dbref(db, 'users/' + user.uid), {
                    username: username,
                    email: email,
                    profile_picture: profilePic,
                });
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                // ..
                console.log("SIGNUP ERROR:")
                console.log("Error Code: " + errorCode + "\nError Message: " + errorMessage)

                // TODO: alert needs to match error message
                alert("Please make sure your email is in the corrent format and/or that your password is at least 6 characters.")
            });
    }

    const uploadImage = async (uri, imageName) => {
        const response = await fetch(uri)
        const blob = await response.blob();

        const picRef = stref(storage, `images/${imageName}`)
        uploadBytes(picRef, blob).then((snapshot) => {
            console.log("SUCCESS")
        })
    }

    // Function from expo documentation: https://docs.expo.dev/versions/latest/sdk/imagepicker/
    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        console.log(result);
        if (!result.canceled) {
            setProfilePic(result.assets[0].uri);
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior="padding"
        >
            <View style={styles.imagePicker}>
                {
                    profilePic && <Image source={{ uri: profilePic }} style={{ width: 200, height: 200 }} />
                }
                <View style={styles.uploadBtnContainer}>
                    <TouchableOpacity onPress={pickImage} style={styles.uploadBtn} >
                        <Text>{profilePic ? 'Edit' : 'Upload'} Profile Picture</Text>
                        <Entypo name="image" size={24} color="black" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    placeholder='Username'
                    style={styles.input}
                    value={username}
                    onChangeText={text => setUsername(text)}
                />
                <TextInput
                    placeholder='Email'
                    style={styles.input}
                    value={email}
                    onChangeText={text => setEmail(text)}
                    keyboardType='email-address'
                />
                <TextInput
                    placeholder='Password (at least 6 characters)'
                    style={styles.input}
                    secureTextEntry
                    value={password}
                    onChangeText={text => setPassword(text)}
                />
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    onPress={handleSignUp}
                    style={styles.registerButton}
                >
                    <Text style={styles.registerText}>Register</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    )
}

export default RegisterScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    inputContainer: {
        width: '80%',
    },
    input: {
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 5,
        marginBottom: 5
    },
    buttonContainer: {
        width: '60%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerButton: {
        backgroundColor: 'white',
        width: '100%',
        padding: 15,
        borderRadius: 10,
        marginTop: 5,
        borderColor: '#0783FF',
        borderWidth: 2,
        alignItems: 'center'
    },
    registerText: {
        color: '#0783FF',
        fontWeight: '700',
        fontSize: 16
    },
    profilePicText: {
        color: '#0783FF',
        fontWeight: '700',
        fontSize: 16,
        alignSelf: 'center',
        marginBottom: 5
    },
    imageIcon: {
        marginTop: 25
    },
    imagePicker: {
        height: 200,
        width: 200,
        backgroundColor: 'white',
        borderRadius: 999,
        overflow: 'hidden',
        marginBottom: 10
    },
    uploadBtnContainer: {
        opacity: 0.7,
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: 'lightgrey',
        width: '100%',
        height: '30%',
    },
    uploadBtn: {
        display: 'flex',
        alignItems: "center",
        justifyContent: 'center'
    }
})