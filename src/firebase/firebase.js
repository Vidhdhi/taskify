import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCIFsLjcFSn4oSWetWFn1yYP4yYcOforZs",
    authDomain: "todo-61f1b.firebaseapp.com",
    projectId: "todo-61f1b",
    storageBucket: "todo-61f1b.appspot.com",
    messagingSenderId: "765258126755",
    appId: "1:765258126755:web:81b1def140a95393edb616",
    measurementId: "G-RC5N4ZWC52"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const provider = new GoogleAuthProvider();

export { auth, db, provider };