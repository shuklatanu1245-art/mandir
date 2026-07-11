// ══════════════════════════════════════
//  FIREBASE CONFIGURATION
// ══════════════════════════════════════

const firebaseConfig = {
    apiKey: "AIzaSyCbljHuxCSYUnwMHxBPHGpMXttPfcLkX1E",
    authDomain: "temple-f6274.firebaseapp.com",
    databaseURL: "https://temple-f6274-default-rtdb.firebaseio.com",
    projectId: "temple-f6274",
    storageBucket: "temple-f6274.firebasestorage.app",
    messagingSenderId: "885620607656",
    appId: "1:885620607656:web:8171bf2c61479066b6109d",
    measurementId: "G-74WZ4CPQG4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const storage = firebase.storage();
