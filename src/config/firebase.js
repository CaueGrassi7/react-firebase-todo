// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDaER5hqXTRJloRFsTA-_n13F9PP7MUGZ8",
  authDomain: "react-firebase-9711f.firebaseapp.com",
  projectId: "react-firebase-9711f",
  storageBucket: "react-firebase-9711f.firebasestorage.app",
  messagingSenderId: "571302873960",
  appId: "1:571302873960:web:0e74ef212669ee0daf64dd",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
export { auth, db };
