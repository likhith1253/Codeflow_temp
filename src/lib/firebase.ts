import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6EiWiiGEPWrOI1tntSzqX4JqEXqyejrA",
  authDomain: "codeflow-306fc.firebaseapp.com",
  projectId: "codeflow-306fc",
  storageBucket: "codeflow-306fc.firebasestorage.app",
  messagingSenderId: "89644078286",
  appId: "1:89644078286:web:821870866b0cb4c8bbec9f",
  measurementId: "G-SGNSMWEDNL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
