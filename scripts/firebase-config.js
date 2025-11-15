// ============================================
// FIREBASE CONFIGURATION
// ============================================

// Replace these placeholders with your Firebase project credentials
// Get these from: Firebase Console > Project Settings > General > Your apps


const firebaseConfig = {
  apiKey: "AIzaSyBBfXuuvI_x_gqNWZzwi0aTrr0KnMiQPu4",
  authDomain: "carbon-emission-tracker-e88fe.firebaseapp.com",
  projectId: "carbon-emission-tracker-e88fe",
  storageBucket: "carbon-emission-tracker-e88fe.firebasestorage.app",
  messagingSenderId: "999072104086",
  appId: "1:999072104086:web:3b320e35906b279c3e8cb7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Global flag to track auth state
let authReady = false;

