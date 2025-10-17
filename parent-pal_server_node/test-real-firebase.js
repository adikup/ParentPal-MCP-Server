import { authenticateUser, FirebaseEventService } from './src/firebaseService.ts';

// Test with real Firebase Auth credentials
async function testRealFirebaseAuth() {
  console.log('🔥 Testing Real Firebase Authentication...\n');

  // You need to replace these with real Firebase Auth user credentials
  const realUser = {
    email: 'your-real-email@example.com',  // Replace with real email
    password: 'your-real-password'          // Replace with real password
  };

  try {
    console.log('1. Testing authentication with real user...');
    const user = await authenticateUser(realUser.email, realUser.password);
    
    if (user) {
      console.log('✅ Authentication successful!');
      console.log('User details:', {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        status: user.status
      });

      console.log('\n2. Testing get user children...');
      const children = await FirebaseEventService.getUserChildren(user.id);
      console.log(`Found ${children.length} children:`, children.map(c => ({ id: c.id, name: c.name })));

      console.log('\n3. Testing get events by category...');
      const birthdayEvents = await FirebaseEventService.getEventsByCategory('birthday', user.id);
      console.log(`Found ${birthdayEvents.length} birthday events:`, birthdayEvents.map(e => ({ id: e.id, title: e.title, eventDate: e.eventDate })));

      console.log('\n4. Testing get nearest events...');
      const nearestEvents = await FirebaseEventService.getNearestEvents(30, user.id);
      console.log(`Found ${nearestEvents.length} events in next 30 days:`, nearestEvents.map(e => ({ id: e.id, title: e.title, eventDate: e.eventDate })));

      if (children.length > 0) {
        console.log('\n5. Testing get events by child...');
        const childEvents = await FirebaseEventService.getEventsByChild(children[0].id, user.id);
        console.log(`Found ${childEvents.length} events for child ${children[0].name}:`, childEvents.map(e => ({ id: e.id, title: e.title, eventDate: e.eventDate })));
      }

    } else {
      console.log('❌ Authentication failed - check your credentials');
      console.log('Make sure:');
      console.log('1. The email/password are correct');
      console.log('2. The user exists in Firebase Auth');
      console.log('3. The FIREBASE_API_KEY is set correctly');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check if FIREBASE_API_KEY is set in your environment');
    console.log('2. Verify the Firebase project ID is correct');
    console.log('3. Make sure the user exists in Firebase Auth');
  }
}

// Instructions for setup
console.log('📋 Setup Instructions:');
console.log('1. Replace the email/password in this file with real Firebase Auth credentials');
console.log('2. Make sure FIREBASE_API_KEY is set in your environment');
console.log('3. Run: npx tsx test-real-firebase.js');
console.log('\n' + '='.repeat(50) + '\n');

// Uncomment the line below when you're ready to test with real credentials
// testRealFirebaseAuth();
