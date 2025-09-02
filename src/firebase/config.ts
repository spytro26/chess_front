import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9ywBMZ05d7_GLLDfrYmIqd1iCqGmrqqc",
  authDomain: "chess-e79be.firebaseapp.com",
  projectId: "chess-e79be",
  storageBucket: "chess-e79be.firebasestorage.app",
  messagingSenderId: "486149715878",
  appId: "1:486149715878:web:3a2dde02a745ff776fc167"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
