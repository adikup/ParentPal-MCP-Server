import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

console.log('🔍 Debugging Nearest Events Query...\n');

async function debugNearestEvents() {
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
    const days = 30; // Test with 30 days
    
    console.log('📋 Testing Nearest Events Query for User:', userId);
    console.log('📅 Looking for events in next', days, 'days');
    
    // Calculate date range
    const now = new Date();
    const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    
    console.log('📅 Date range:');
    console.log('- From:', now.toISOString());
    console.log('- To:', futureDate.toISOString());
    
    // Test 1: Get all events for the user first
    console.log('\n1. Getting all events for user...');
    const allUserEventsRef = db.collection('events');
    const allUserEventsSnapshot = await allUserEventsRef
      .where('parentIds', 'array-contains', userId)
      .get();
    
    console.log(`Found ${allUserEventsSnapshot.size} total events for user`);
    
    // Show all events with their dates
    allUserEventsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      const eventDate = data.eventDate;
      console.log(`Event ${index + 1}:`, {
        id: doc.id,
        title: data.title,
        eventType: data.eventType,
        eventDate: eventDate ? eventDate.toDate().toISOString() : 'No date',
        isDeleted: data.isDeleted
      });
    });
    
    // Test 2: Test the date range query step by step
    console.log('\n2. Testing date range query...');
    
    // First, try without date filtering
    const eventsWithoutDateFilter = await allUserEventsRef
      .where('parentIds', 'array-contains', userId)
      .where('isDeleted', '==', false)
      .get();
    
    console.log(`Found ${eventsWithoutDateFilter.size} non-deleted events for user`);
    
    // Now try with date filtering
    try {
      const eventsWithDateFilter = await allUserEventsRef
        .where('parentIds', 'array-contains', userId)
        .where('eventDate', '>=', Timestamp.fromDate(now))
        .where('eventDate', '<=', Timestamp.fromDate(futureDate))
        .where('isDeleted', '==', false)
        .get();
      
      console.log(`Found ${eventsWithDateFilter.size} events in date range`);
      
      eventsWithDateFilter.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`Date Range Event ${index + 1}:`, {
          id: doc.id,
          title: data.title,
          eventDate: data.eventDate.toDate().toISOString(),
          eventType: data.eventType
        });
      });
      
    } catch (dateError) {
      console.log('❌ Date range query failed:', dateError.message);
      
      // Try without orderBy to see if that's the issue
      console.log('\n3. Trying without orderBy...');
      try {
        const eventsWithoutOrderBy = await allUserEventsRef
          .where('parentIds', 'array-contains', userId)
          .where('eventDate', '>=', Timestamp.fromDate(now))
          .where('eventDate', '<=', Timestamp.fromDate(futureDate))
          .where('isDeleted', '==', false)
          .get();
        
        console.log(`Found ${eventsWithoutOrderBy.size} events without orderBy`);
        
      } catch (orderByError) {
        console.log('❌ Query without orderBy also failed:', orderByError.message);
      }
    }
    
    // Test 3: Check if events have valid dates
    console.log('\n4. Checking event date formats...');
    const validDateEvents = [];
    const invalidDateEvents = [];
    
    allUserEventsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const eventDate = data.eventDate;
      
      if (eventDate && eventDate.toDate) {
        try {
          const jsDate = eventDate.toDate();
          validDateEvents.push({
            id: doc.id,
            title: data.title,
            eventDate: jsDate.toISOString(),
            eventType: data.eventType
          });
        } catch (e) {
          invalidDateEvents.push({
            id: doc.id,
            title: data.title,
            eventDate: eventDate,
            error: e.message
          });
        }
      } else {
        invalidDateEvents.push({
          id: doc.id,
          title: data.title,
          eventDate: eventDate,
          error: 'No date or invalid format'
        });
      }
    });
    
    console.log(`Valid date events: ${validDateEvents.length}`);
    console.log(`Invalid date events: ${invalidDateEvents.length}`);
    
    if (invalidDateEvents.length > 0) {
      console.log('Invalid date events:');
      invalidDateEvents.forEach(event => {
        console.log('-', event.title, ':', event.error);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugNearestEvents();
