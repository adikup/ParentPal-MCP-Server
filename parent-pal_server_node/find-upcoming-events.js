import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

console.log('🔍 Finding Events in Next 30 Days...\n');

async function findUpcomingEvents() {
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
    
    // Calculate date range for next 30 days
    const now = new Date();
    const futureDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    console.log('📅 Current date:', now.toISOString());
    console.log('📅 Looking for events until:', futureDate.toISOString());
    
    // Find events in the next 30 days
    const upcomingEventsRef = db.collection('events');
    const upcomingEventsSnapshot = await upcomingEventsRef
      .where('parentIds', 'array-contains', userId)
      .where('eventDate', '>=', Timestamp.fromDate(now))
      .where('eventDate', '<=', Timestamp.fromDate(futureDate))
      .where('isDeleted', '==', false)
      .orderBy('eventDate', 'asc')
      .get();
    
    console.log(`\n🎉 Found ${upcomingEventsSnapshot.size} events in the next 30 days!`);
    
    if (upcomingEventsSnapshot.size > 0) {
      upcomingEventsSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        const eventDate = data.eventDate.toDate();
        const daysFromNow = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        console.log(`\nEvent ${index + 1}:`);
        console.log(`- Title: ${data.title}`);
        console.log(`- Type: ${data.eventType}`);
        console.log(`- Date: ${eventDate.toISOString()}`);
        console.log(`- Days from now: ${daysFromNow}`);
      });
    } else {
      console.log('\n📅 No events in the next 30 days, but you have events in 2026-2027!');
      
      // Let's find the next upcoming event
      const nextEventSnapshot = await upcomingEventsRef
        .where('parentIds', 'array-contains', userId)
        .where('eventDate', '>=', Timestamp.fromDate(now))
        .where('isDeleted', '==', false)
        .orderBy('eventDate', 'asc')
        .limit(1)
        .get();
      
      if (nextEventSnapshot.size > 0) {
        const nextEvent = nextEventSnapshot.docs[0];
        const data = nextEvent.data();
        const eventDate = data.eventDate.toDate();
        const daysFromNow = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        console.log(`\n🎯 Next upcoming event:`);
        console.log(`- Title: ${data.title}`);
        console.log(`- Type: ${data.eventType}`);
        console.log(`- Date: ${eventDate.toISOString()}`);
        console.log(`- Days from now: ${daysFromNow}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

findUpcomingEvents();
