var firebaseConfig = {
  apiKey: "AIzaSyCjtKQ7UoV3j4taDn6bNi3ONRlMsBaijBU",
  authDomain: "ejowordsearch.firebaseapp.com",
  projectId: "ejowordsearch",
  storageBucket: "ejowordsearch.firebasestorage.app",
  messagingSenderId: "29577044517",
  appId: "1:29577044517:web:98ab30b2969d5fea0c55cc",
  measurementId: "G-DQRLWF0FWC"
};

firebase.initializeApp(firebaseConfig);

var db = firebase.firestore(); 

console.log("✅ Firebase Initialized:", firebase.apps.length > 0);
console.log("✅ Firestore Ready:", db);