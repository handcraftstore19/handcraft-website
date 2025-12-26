// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCArKkvgkxZCKhG7bWg3qMcWGi0PjprTpI",
  authDomain: "hand-craft-store.firebaseapp.com",
  projectId: "hand-craft-store",
  storageBucket: "hand-craft-store.firebasestorage.app",
  messagingSenderId: "20341238426",
  appId: "1:20341238426:web:390d2f0c1ae9523cf1cd23",
  measurementId: "G-7BKVXWZPG1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics (only in browser)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;

