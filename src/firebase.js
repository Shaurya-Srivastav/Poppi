// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCbOnLKDf69TgN7IjYxmtMPmzoPU49kvGw",
  authDomain: "poppi-c6e88.firebaseapp.com",
  projectId: "poppi-c6e88",
  storageBucket: "poppi-c6e88.appspot.com",
  messagingSenderId: "815793133628",
  appId: "1:815793133628:web:387daf40722ee44c60cb39",
  measurementId: "G-4ZK93D9CWZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Firestore and get a reference to the service
const db = getFirestore(app);

export { auth, db };
