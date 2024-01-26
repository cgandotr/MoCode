// firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "@firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIIeM2fAxFKw6UjTaYUv91JeTvtSDtaSo",
  authDomain: "mocode-115a.firebaseapp.com",
  projectId: "mocode-115a",
  storageBucket: "mocode-115a.appspot.com",
  messagingSenderId: "423180520710",
  appId: "1:423180520710:web:e4125ea1bc6e4605b46287",
  measurementId: "G-5EERF1QSXB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, db, auth };
