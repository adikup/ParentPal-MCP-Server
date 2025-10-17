import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

console.log('🔍 Verifying Firebase Connection...\n');

async function verifyFirebaseConnection() {
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
    
    console.log('\n✅ Firebase Admin SDK initialized successfully');
    
    // Test Firebase Auth
    console.log('\n🔐 Testing Firebase Auth...');
    const auth = getAuth(app);
    
    // List users to verify connection
    try {
      const listUsersResult = await auth.listUsers(1);
      console.log('✅ Firebase Auth connection successful');
      console.log('- Total users in project:', listUsersResult.totalUsers);
      
      if (listUsersResult.users.length > 0) {
        console.log('- Sample user:', listUsersResult.users[0].email);
      }
    } catch (error) {
      console.log('❌ Firebase Auth error:', error.message);
    }
    
    // Test Firestore
    console.log('\n🗄️  Testing Firestore...');
    const db = getFirestore(app);
    
    try {
      // Try to read from a test collection
      const testRef = db.collection('test').doc('connection-test');
      await testRef.set({
        test: true,
        timestamp: new Date()
      });
      
      const doc = await testRef.get();
      if (doc.exists) {
        console.log('✅ Firestore connection successful');
        console.log('- Test document created and read successfully');
      }
      
      // Clean up
      await testRef.delete();
    } catch (error) {
      console.log('❌ Firestore error:', error.message);
    }
    
    // Test Firebase Auth REST API (what the server uses)
    console.log('\n🌐 Testing Firebase Auth REST API...');
    const apiKey = 'AIzaSyAWsZzPo4uvUyzgsu-Phq64yHeRRDtTczE';
    
    try {
      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword',
          returnSecureToken: true
        })
      });
      
      const result = await response.json();
      console.log('✅ Firebase Auth REST API connection successful');
      console.log('- API Key is valid');
      console.log('- Expected error for wrong password:', result.error?.message);
    } catch (error) {
      console.log('❌ Firebase Auth REST API error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Firebase setup error:', error.message);
  }
}

verifyFirebaseConnection();