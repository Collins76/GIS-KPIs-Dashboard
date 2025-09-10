
import { initializeApp, getApps, getApp, FirebaseOptions, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getDatabase, Database } from "firebase/database";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;
let db: Database | null = null;

function getFirebase() {
  if (app && auth && storage && db) {
    return { app, auth, storage, db };
  }

  if (!firebaseConfig.apiKey) {
    console.error("Firebase API key is missing. Please check your .env file.");
    return { app: null, auth: null, storage: null, db: null };
  }
  
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  auth = getAuth(app);
  storage = getStorage(app);
  db = getDatabase(app);

  return { app, auth, storage, db };
}

export { getFirebase };
