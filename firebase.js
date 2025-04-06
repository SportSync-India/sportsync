import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCDhRQU2nUjnv-FGkuMU2l6tMMz73gdTqg",
  authDomain: "sportsynce-97d17.firebaseapp.com",
  projectId: "sportsynce-97d17",
  storageBucket: "sportsynce-97d17.appspot.com",
  messagingSenderId: "884189714176",
  appId: "1:884189714176:web:fa9bef6af69b1f98dd85e5",
  measurementId: "G-Y3DXF9834K",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, app };
