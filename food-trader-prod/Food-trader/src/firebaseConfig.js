// src/firebaseConfig.js

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

// 1. PASTE YOUR UNIQUE WEB APP CONFIG OBJECT HERE
// Get this from your Firebase Console > Project Settings > Your Apps (Web)
const firebaseConfig = {
    apiKey: "AIzaSyDdp0jz_iJ5ZGQHRxF0ZMVA_T7BCcqv120", 
    authDomain: "food-trader-b3701.firebaseapp.com",
    projectId: "food-trader-b3701", 
    storageBucket: "food-trader-b3701.firebasestorage.app",
    messagingSenderId: "85225551431",
    appId: "1:85225551431:web:b7c18e0f2e86b77734e362",
};

// 2. Initialize Firebase App (only if not already initialized)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// 3. Export necessary services
const db = firebase.firestore();
const admin = firebase; // Export the entire firebase object for general use (e.g., Timestamp)

export { db, admin };