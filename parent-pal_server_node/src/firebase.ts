import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';

// Firebase configuration from parent-pal-fixed
const firebaseConfig = {
  projectId: "parent-pal-97ae2",
  storageBucket: "parent-pal-97ae2.firebasestorage.app",
  databaseURL: "https://parent-pal-97ae2-default-rtdb.firebaseio.com"
};

// Initialize Firebase Admin SDK
let app;
if (getApps().length === 0) {
  try {
    // Try to load service account key using ES modules
    const serviceAccountKey = JSON.parse(readFileSync('./src/serviceAccountKey.json', 'utf8'));
    app = initializeApp({
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      databaseURL: firebaseConfig.databaseURL,
      credential: cert(serviceAccountKey)
    });
    console.log('✅ Firebase initialized with service account key');
  } catch (error) {
    console.log('⚠️  Service account key not found, using default credentials');
    console.log('Error details:', error.message);
    app = initializeApp({
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      databaseURL: firebaseConfig.databaseURL,
    });
  }
} else {
  app = getApps()[0];
}

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;