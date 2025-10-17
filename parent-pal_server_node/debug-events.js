import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

console.log('🔍 Debugging Events Query...\n');

async function debugEventsQuery() {
  try {
    // Load service account key
    const serviceAccountKey = JSON.parse(readFileSync('./src/serviceAccountKey.json', 'utf8'));
    
    // Initialize Firebase Admin SDK
    const app = initializeApp({
      projectId: serviceAccountKey.project_id,
      credential: cert(serviceAccountKey)
    });
    
    const db = getFirestore(app);
    const userId = 'ambLSTXQYiZNaWYSB6GKR06UyDw1'; // Your authenticated user ID
    
    console.log('📋 Testing Events Query for User:', userId);
    
    // Test 1: Get all events to see the structure
    console.log('\n1. Getting all events to see structure...');
    const allEventsRef = db.collection('events');
    const allEventsSnapshot = await allEventsRef.limit(5).get();
    
    console.log(`Found ${allEventsSnapshot.size} events total`);
    allEventsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`Event ${index + 1}:`, {
        id: doc.id,
        title: data.title,
        parentIds: data.parentIds,
        eventType: data.eventType,
        isDeleted: data.isDeleted
      });
    });
    
    // Test 2: Query by parentIds array-contains
    console.log('\n2. Testing parentIds array-contains query...');
    const eventsByParentRef = db.collection('events');
    const eventsByParentSnapshot = await eventsByParentRef
      .where('parentIds', 'array-contains', userId)
      .limit(5)
      .get();
    
    console.log(`Found ${eventsByParentSnapshot.size} events for user ${userId}`);
    eventsByParentSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`User Event ${index + 1}:`, {
        id: doc.id,
        title: data.title,
        parentIds: data.parentIds,
        eventType: data.eventType
      });
    });
    
    // Test 3: Query by category
    console.log('\n3. Testing birthday events query...');
    const birthdayEventsRef = db.collection('events');
    const birthdayEventsSnapshot = await birthdayEventsRef
      .where('parentIds', 'array-contains', userId)
      .where('eventType', '==', 'birthday')
      .where('isDeleted', '==', false)
      .limit(5)
      .get();
    
    console.log(`Found ${birthdayEventsSnapshot.size} birthday events for user ${userId}`);
    birthdayEventsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`Birthday Event ${index + 1}:`, {
        id: doc.id,
        title: data.title,
        eventDate: data.eventDate,
        parentIds: data.parentIds
      });
    });
    
    // Test 4: Check if there are any events with different parentIds structure
    console.log('\n4. Checking for events with different parentIds structures...');
    const allEventsSnapshot2 = await allEventsRef.get();
    const parentIdsStructures = new Set();
    
    allEventsSnapshot2.docs.forEach(doc => {
      const data = doc.data();
      if (data.parentIds) {
        parentIdsStructures.add(JSON.stringify(data.parentIds));
      }
    });
    
    console.log('Different parentIds structures found:');
    parentIdsStructures.forEach(structure => {
      console.log('-', structure);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugEventsQuery();
