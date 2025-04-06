import { getAuth, GoogleAuthProvider,  } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDCJLQ_k5iZBzKAmPO1g6xj5c806HW4IP4",
  authDomain: "chatbot-app-da47b.firebaseapp.com",
  projectId: "chatbot-app-da47b",
  storageBucket: "chatbot-app-da47b.firebasestorage.app",
  messagingSenderId: "566171052828",
  appId: "1:566171052828:web:b07e1d32dc35946cc8a8d9",
  measurementId: "G-7CPG0HNJ76"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { auth };
export const googleProvider = new GoogleAuthProvider();