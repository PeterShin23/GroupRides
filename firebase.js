// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrcDy-J76J3ygD1PwjxhPkYttTn9rKznk",
  authDomain: "grouprides-1d088.firebaseapp.com",
  projectId: "grouprides-1d088",
  storageBucket: "grouprides-1d088.appspot.com",
  messagingSenderId: "503177385607",
  appId: "1:503177385607:web:fcff55c6eeed09dc004a22"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a ref to service
export const auth = getAuth(app)
// Idk how to get this working, just don't use android emulator for testing
// connectAuthEmulator(auth, "http://10.0.2.2:9099")