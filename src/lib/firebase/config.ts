import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyArr_CKdovaQF1Mgrylt4KNwOj9KwLIREM",
  authDomain: "online-ai-interviewer-system.firebaseapp.com",
  projectId: "online-ai-interviewer-system",
  storageBucket: "online-ai-interviewer-system.firebasestorage.app",
  messagingSenderId: "529196521380",
  appId: "1:529196521380:web:c53c916d5abbf36fe7d331",
  measurementId: "G-KVCXLQSB6P",
};

let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth: Auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("email");
googleProvider.addScope("profile");

export { app, auth, googleProvider };
