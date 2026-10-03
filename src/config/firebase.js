import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBcwF8yJQaBO8Akl-ok6sBgPcy8CJu5n00",
  authDomain: "open-to-work-1788f.firebaseapp.com",
  projectId: "open-to-work-1788f",
  storageBucket: "open-to-work-1788f.firebasestorage.app",
  messagingSenderId: "740974612997",
  appId: "1:740974612997:web:56860d3f577ff62eb6426c",
  measurementId: "G-G5Y0EKRG85"
};

// Initialize Firebase safely for SSR/client
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };