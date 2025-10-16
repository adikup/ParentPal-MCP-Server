import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Firebase configuration from parent-pal-fixed
const firebaseConfig = {
  projectId: "parent-pal-97ae2",
  storageBucket: "parent-pal-97ae2.firebasestorage.app",
  databaseURL: "https://parent-pal-97ae2-default-rtdb.firebaseio.com"
};

// Initialize Firebase Admin SDK
let app;
if (getApps().length === 0) {
  app = initializeApp({
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    databaseURL: firebaseConfig.databaseURL,
    // Note: In production, you should use service account key
    // credential: cert(serviceAccountKey)
  });
} else {
  app = getApps()[0];
}

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;