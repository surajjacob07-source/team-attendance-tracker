// Firebase Configuration
// IMPORTANT: Replace these values with your own Firebase project credentials
// See FIREBASE-SETUP-GUIDE.md for detailed instructions

const firebaseConfig = {
    apiKey: "AIzaSyCxc596y5vmRjAWDQWLLK4wjbLi91fJNqs",
    authDomain: "team-attendance-tracker-8aa19.firebaseapp.com",
    databaseURL: "https://team-attendance-tracker-8aa19-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "team-attendance-tracker-8aa19",
    storageBucket: "team-attendance-tracker-8aa19.firebasestorage.app",
    messagingSenderId: "945575429447",
    appId: "1:945575429447:web:71f759284292e7ffa93862"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
const database = firebase.database();
