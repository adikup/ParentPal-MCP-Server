import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

console.log('🧪 Testing fetch-nearest-events with different day ranges...\n');

async function testNearestEventsRanges() {
  try {
    // Load service account key
    const serviceAccountKey = JSON.parse(readFileSync('./src/serviceAccountKey.json', 'utf8'));
    
    // Initialize Firebase Admin SDK
    const app = initializeApp({
      projectId: serviceAccountKey.project_id,
      credential: cert(serviceAccountKey)
    });
    
    const db = getFirestore(app);
    const userId = 'ambLSTXQYiZNaWYSB6GKR06UyDw1';
    
    const now = new Date();
    console.log('📅 Current date:', now.toISOString());
    
    // Test different day ranges
    const dayRanges = [30, 60, 90, 120];
    
    for (const days of dayRanges) {
      console.log(`\n🔍 Testing ${days} days range...`);
      
      const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
      
      const eventsRef = db.collection('events');
      const querySnapshot = await eventsRef
        .where('parentIds', 'array-contains', userId)
        .where('eventDate', '>=', Timestamp.fromDate(now))
        .where('eventDate', '<=', Timestamp.fromDate(futureDate))
        .where('isDeleted', '==', false)
        .orderBy('eventDate', 'asc')
        .get();
      
      console.log(`📊 Found ${querySnapshot.size} events in next ${days} days`);
      
      if (querySnapshot.size > 0) {
        console.log('🎉 Events found:');
        querySnapshot.docs.forEach((doc, index) => {
          const data = doc.data();
          const eventDate = data.eventDate.toDate();
          const daysFromNow = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          console.log(`  ${index + 1}. ${data.title} (${data.eventType}) - ${daysFromNow} days from now`);
        });
      }
    }
    
    // Test the exact same query as your MCP call
    console.log('\n🎯 Testing exact MCP query (30 days)...');
    const mcpQuerySnapshot = await db.collection('events')
      .where('parentIds', 'array-contains', userId)
      .where('eventDate', '>=', Timestamp.fromDate(now))
      .where('eventDate', '<=', Timestamp.fromDate(new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))))
      .where('isDeleted', '==', false)
      .orderBy('eventDate', 'asc')
      .get();
    
    console.log(`📊 MCP Query Result: ${mcpQuerySnapshot.size} events`);
    
    if (mcpQuerySnapshot.size === 0) {
      console.log('✅ This is the CORRECT result - no events in next 30 days');
      console.log('📅 Your next event is Hanukkah on December 15, 2025 (59 days away)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testNearestEventsRanges();
