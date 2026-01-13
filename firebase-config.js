// Firebase-Konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyA40nCcZqPE04cOiMkARhqpvbYzG-6mxA0",
  authDomain: "messeplaner.firebaseapp.com",
  projectId: "messeplaner",
  storageBucket: "messeplaner.firebasestorage.app",
  messagingSenderId: "221723303982",
  appId: "1:221723303982:web:d3ee7b56a7a3c6bd9bbfbf",
  measurementId: "G-1FKHDMCE1Z"
};

// Firebase initialisieren
firebase.initializeApp(firebaseConfig);

// Firebase Services
const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();

// Firebase Performance Monitoring (optional)
// const perf = firebase.performance();