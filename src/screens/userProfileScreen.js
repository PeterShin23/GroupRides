import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, TouchableHighlight, View, Image, Modal } from 'react-native';
import { signOut } from 'firebase/auth';
import { ref as dbref, child, get, update, set } from 'firebase/database';
import { ref as stref, uploadBytes } from 'firebase/storage';
import { auth, db, storage } from '../../firebase';
import { Entypo } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function UserProfileScreen({ navigation }) {

  const [username, setUsername] = useState('')
  const [uid, setUid] = useState('')
  const [profilePic, setProfilePic] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [status, requestPermission] = ImagePicker.useCameraPermissions();
  const user = auth.currentUser

  useEffect(() => {
    if (auth.currentUser) {
      const uid = auth.currentUser.uid
      setUid(uid)
      const ref = dbref(db)
      get(child(ref, `users/${uid}`)).then((snapshot) => {
        setUsername(snapshot.val().username)
        setProfilePic(snapshot.val().profile_picture)
      }).catch((error) => {
        console.log(error)
      })
    }
  }, [])

  const handleSignOut = () => {
    signOut(auth).then(() => {
      console.log("Sign-out successful.")
    }).catch((error) => {
      alert("An error has occurred on sign-out.")
    });
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

    // console.log(result);
    if (!result.canceled) {
      setProfilePic(result.assets[0].uri);
      uploadImage(result.assets[0].uri, uid)
    }
  }

  const uploadImage = async (uri, imageName) => {
    const response = await fetch(uri)
    const blob = await response.blob();

    const picRef = stref(storage, `images/${imageName}`)
    uploadBytes(picRef, blob).then((snapshot) => {
      console.log("SUCCESS")
      update(dbref(db, 'users/' + user.uid), {
        profile_picture: uri
      })
    })


  }

  const takePhoto = async () => {
    if (status.canAskAgain) {
      if (!status.granted) {
        await requestPermission()
      }
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled) {
        setProfilePic(result.assets[0].uri)
        setModalVisible(!modalVisible)
      }
    } else {
      alert("Please go to the app in Settings in order to enable your camera.")
    }

  };

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity
              onPress={pickImage}
              style={styles.choiceButtons}
            >
              <Text style={styles.closeModalText}>Choose image from camera roll</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={takePhoto}
              style={styles.choiceButtons}
            >
              <Text style={styles.closeModalText}>Take new image</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(!modalVisible)}
              style={styles.closeModalButton}
            >
              <Text style={styles.closeModalText}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={styles.imagePicker}>
        {
          profilePic && <Image source={{ uri: profilePic }} style={{ width: 200, height: 200 }} />
        }
        <View style={styles.uploadBtnContainer}>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.uploadBtn} >
            <Text>{profilePic ? 'Edit' : 'Upload'} Profile Picture</Text>
            <Entypo name="image" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      <Text>Good to see you, {username}!</Text>
      <View style={styles.verticalLine}></View>
      <TouchableOpacity style={{alignSelf: 'flex-start', marginVertical: 8, marginLeft: 15, width: '100%'}} onPress={() => navigation.navigate("Car Information")}>
        <View>
          <Text style={{fontSize: 16}}>Add/Edit Car Information</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.verticalLine}></View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutButton: {
    backgroundColor: 'white',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginTop: 5,
    borderColor: '#0783FF',
    borderWidth: 2,
    alignItems: 'center'
  },
  buttonContainer: {
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  signOutText: {
    color: '#0783FF',
    fontWeight: '700',
    fontSize: 16
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
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
},
modalText: {
    color: '#0783FF',
    fontWeight: '700',
    fontSize: 16
},
closeModalButton: {
    marginTop: 15,
    borderColor: 'red',
    borderRadius: 5,
    borderWidth: 1,
    padding: 10,
    backgroundColor: 'red'
},
closeModalText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
},
choiceButtons: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#0783FF',
    borderRadius: 20,
    marginBottom: 10,
    backgroundColor: '#0783FF'
},
verticalLine: {
  width: '100%',
  height: 1,
  backgroundColor: '#000',
  marginVertical: 5,
},
});