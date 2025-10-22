#!/usr/bin/env tsx

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { TEST_ACCOUNT, TEST_CHILDREN, TEST_EVENTS, TESTING_INSTRUCTIONS } from './testingData.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
const serviceAccountPath = path.join(process.cwd(), 'src', 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Service account key not found at:', serviceAccountPath);
  console.error('Please add your Firebase service account key to src/serviceAccountKey.json');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function populateTestData() {
  console.log('🚀 Starting test data population...');
  
  try {
    // 1. Create test user in Firebase Auth
    console.log('👤 Creating test user in Firebase Auth...');
    const authResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_ACCOUNT.email,
        password: TEST_ACCOUNT.password,
        returnSecureToken: true
      })
    });

    let firebaseAuthUserId = TEST_ACCOUNT.userId; // Default fallback

    if (!authResponse.ok) {
      const errorData = await authResponse.json();
      if (errorData.error?.message?.includes('EMAIL_EXISTS')) {
        console.log('ℹ️ Test user already exists in Firebase Auth');
        // Get the existing user ID by signing in
        const signInResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: TEST_ACCOUNT.email,
            password: TEST_ACCOUNT.password,
            returnSecureToken: true
          })
        });
        
        if (signInResponse.ok) {
          const signInData = await signInResponse.json();
          firebaseAuthUserId = signInData.localId;
          console.log('✅ Retrieved existing Firebase Auth user ID:', firebaseAuthUserId);
        }
      } else {
        console.error('❌ Failed to create Firebase Auth user:', errorData.error?.message);
        throw new Error('Failed to create Firebase Auth user');
      }
    } else {
      const authData = await authResponse.json();
      firebaseAuthUserId = authData.localId;
      console.log('✅ Test user created in Firebase Auth:', TEST_ACCOUNT.email, 'ID:', firebaseAuthUserId);
    }

    // 2. Create test user in Firestore with correct Firebase Auth ID
    console.log('👤 Creating test user in Firestore...');
    const userData = { ...TEST_ACCOUNT, id: firebaseAuthUserId };
    await db.collection('users').doc(firebaseAuthUserId).set(userData);
    console.log('✅ Test user created in Firestore:', TEST_ACCOUNT.email);
    
    // 3. Create test children with correct parent ID
    console.log('👶 Creating test children...');
    for (const child of TEST_CHILDREN) {
      const childData = { 
        ...child, 
        primaryParentId: firebaseAuthUserId,
        parentIds: [firebaseAuthUserId],
        birthingParentId: firebaseAuthUserId
      };
      await db.collection('children').doc(child.id).set(childData);
      console.log(`✅ Child created: ${child.name} (${child.id})`);
    }
    
    // 4. Create test events with correct parent ID
    console.log('📅 Creating test events...');
    for (const event of TEST_EVENTS) {
      const eventData = { ...event, parentIds: [firebaseAuthUserId] };
      await db.collection('events').doc(event.id).set(eventData);
      console.log(`✅ Event created: ${event.title} (${event.id})`);
    }
    
    console.log('\n🎉 Test data population completed successfully!');
    console.log('\n📋 Test Account Summary:');
    console.log(`Email: ${TEST_ACCOUNT.email}`);
    console.log(`Password: ${TEST_ACCOUNT.password}`);
    console.log(`User ID: ${TEST_ACCOUNT.userId}`);
    console.log(`Children: ${TEST_CHILDREN.map(c => c.name).join(', ')}`);
    console.log(`Events: ${TEST_EVENTS.length} total events`);
    
    console.log('\n📖 Testing Instructions:');
    console.log(TESTING_INSTRUCTIONS);
    
  } catch (error) {
    console.error('❌ Error populating test data:', error);
    process.exit(1);
  }
}

async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...');
  
  try {
    // Delete test user
    await db.collection('users').doc(TEST_ACCOUNT.userId).delete();
    console.log('✅ Test user deleted');
    
    // Delete test children
    for (const child of TEST_CHILDREN) {
      await db.collection('children').doc(child.id).delete();
      console.log(`✅ Child deleted: ${child.name}`);
    }
    
    // Delete test events
    for (const event of TEST_EVENTS) {
      await db.collection('events').doc(event.id).delete();
      console.log(`✅ Event deleted: ${event.title}`);
    }
    
    console.log('🎉 Test data cleanup completed!');
    
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error);
    process.exit(1);
  }
}

// Command line interface
const command = process.argv[2];

if (command === 'populate') {
  populateTestData();
} else if (command === 'cleanup') {
  cleanupTestData();
} else {
  console.log('Usage:');
  console.log('  tsx src/setupTestData.ts populate  - Create test data');
  console.log('  tsx src/setupTestData.ts cleanup   - Remove test data');
  console.log('');
  console.log('Examples:');
  console.log('  pnpm run setup:test');
  console.log('  pnpm run cleanup:test');
}
