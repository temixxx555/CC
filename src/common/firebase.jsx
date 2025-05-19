// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {GoogleAuthProvider,getAuth, signInWithPopup} from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBPfeAANaHwB9kcPXKAv8YqKLvPBDVVkYA",
  authDomain: "mern-blog-76ba3.firebaseapp.com",
  projectId: "mern-blog-76ba3",
  storageBucket: "mern-blog-76ba3.firebasestorage.app",
  messagingSenderId: "283067116065",
  appId: "1:283067116065:web:8d7a4cb3eaaaf8bad51160",
  measurementId: "G-DH9VW6MGY3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

//google auth
const auth = getAuth();
const provider = new GoogleAuthProvider();

export const authWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const idToken = await result.user.getIdToken(); // Get Firebase ID Token
        return { user: result.user, idToken };
    } catch (error) {
        console.error("Google Sign-In Error:", error);
        throw error;
    }
};
