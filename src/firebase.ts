import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBBgPDB0GmGr9Siyr5chV9XktlHkNPwm9w",
    authDomain: "adam-17aa6.firebaseapp.com",
    projectId: "adam-17aa6",
    storageBucket: "adam-17aa6.firebasestorage.app",
    messagingSenderId: "914906910725",
    appId: "1:914906910725:web:0ebb24f1aa809e52d2cc6c",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);