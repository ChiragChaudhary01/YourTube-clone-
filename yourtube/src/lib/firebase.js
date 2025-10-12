import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const VITE_FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: VITE_FIREBASE_API_KEY,
  authDomain: "yourtube-bb2be.firebaseapp.com",
  projectId: "yourtube-bb2be",
  storageBucket: "yourtube-bb2be.firebasestorage.app",
  messagingSenderId: "735027968893",
  appId: "1:735027968893:web:0ea76329fd156e430daa14",
  measurementId: "G-XSFKY91SNY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };
