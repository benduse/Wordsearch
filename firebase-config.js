var firebaseConfig = {
   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
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