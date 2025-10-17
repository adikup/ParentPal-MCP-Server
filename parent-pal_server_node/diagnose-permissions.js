import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

console.log('🔧 Diagnosing Firebase Service Account Permissions...\n');

async function diagnoseFirebasePermissions() {
  try {
    // Load service account key
    const serviceAccountKey = JSON.parse(readFileSync('./src/serviceAccountKey.json', 'utf8'));
    
    console.log('📋 Service Account Details:');
    console.log('- Project ID:', serviceAccountKey.project_id);
    console.log('- Client Email:', serviceAccountKey.client_email);
    console.log('- Private Key ID:', serviceAccountKey.private_key_id);
    
    // Initialize Firebase Admin SDK
    const app = initializeApp({
      projectId: serviceAccountKey.project_id,
      credential: cert(serviceAccountKey)
    });
    
    console.log('\n✅ Firebase Admin SDK initialized');
    
    // Test Firebase Auth Admin SDK
    console.log('\n🔐 Testing Firebase Auth Admin SDK...');
    const auth = getAuth(app);
    
    try {
      const listUsersResult = await auth.listUsers(1);
      console.log('✅ Firebase Auth Admin SDK works!');
      console.log('- Total users:', listUsersResult.totalUsers);
    } catch (error) {
      console.log('❌ Firebase Auth Admin SDK failed:', error.message);
      
      if (error.message.includes('PERMISSION_DENIED')) {
        console.log('\n🔧 SOLUTION: Add these roles to your service account:');
        console.log('1. Go to: https://console.developers.google.com/iam-admin/iam/project?project=' + serviceAccountKey.project_id);
        console.log('2. Find service account:', serviceAccountKey.client_email);
        console.log('3. Add these roles:');
        console.log('   - Firebase Admin SDK Administrator Service Agent');
        console.log('   - Service Usage Consumer');
        console.log('   - Firebase Authentication Admin');
      }
    }
    
    // Test Firestore
    console.log('\n🗄️  Testing Firestore...');
    const db = getFirestore(app);
    
    try {
      // Try to read from users collection
      const usersRef = db.collection('users');
      const snapshot = await usersRef.limit(1).get();
      console.log('✅ Firestore read works!');
      console.log('- Users collection accessible');
      
      // Try to write a test document
      const testRef = db.collection('test').doc('permission-test');
      await testRef.set({
        test: true,
        timestamp: new Date(),
        serviceAccount: serviceAccountKey.client_email
      });
      console.log('✅ Firestore write works!');
      
      // Clean up
      await testRef.delete();
      console.log('✅ Firestore delete works!');
      
    } catch (error) {
      console.log('❌ Firestore failed:', error.message);
      
      if (error.message.includes('PERMISSION_DENIED')) {
        console.log('\n🔧 SOLUTION: Add these roles to your service account:');
        console.log('1. Go to: https://console.developers.google.com/iam-admin/iam/project?project=' + serviceAccountKey.project_id);
        console.log('2. Find service account:', serviceAccountKey.client_email);
        console.log('3. Add these roles:');
        console.log('   - Cloud Datastore User');
        console.log('   - Firebase Admin SDK Administrator Service Agent');
        console.log('   - Service Usage Consumer');
      }
    }
    
    // Test specific collections
    console.log('\n📊 Testing specific collections...');
    const collections = ['users', 'children', 'events'];
    
    for (const collectionName of collections) {
      try {
        const ref = db.collection(collectionName);
        const snapshot = await ref.limit(1).get();
        console.log(`✅ ${collectionName} collection accessible (${snapshot.size} docs)`);
      } catch (error) {
        console.log(`❌ ${collectionName} collection failed:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Setup error:', error.message);
  }
}

diagnoseFirebasePermissions();
