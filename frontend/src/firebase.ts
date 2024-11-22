// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import withFirebaseAuth from "react-with-firebase-auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB0K6HOU6I_v05NTTyz_sOQDwXs5geM25w",
  authDomain: "cu-collaborate-x527.firebaseapp.com",
  projectId: "cu-collaborate-x527",
  storageBucket: "cu-collaborate-x527.firebasestorage.app",
  messagingSenderId: "391295639487",
  appId: "1:391295639487:web:39db90491014cdd780cb0a",
  measurementId: "G-RM16KE3V1Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const providers = {
  googleProvider: new GoogleAuthProvider(),
};

const createComponentWithAuth = withFirebaseAuth({
  providers,
  firebaseAppAuth: auth,
});

const signInWithGoogle = () => {
  signInWithPopup(auth, providers.googleProvider);
};

const signOutFirebase = () => {
  signOut(auth);
};

export {
  db,
  auth,
  createComponentWithAuth,
  signInWithGoogle,
  signOutFirebase as signOut,
  GoogleAuthProvider
};