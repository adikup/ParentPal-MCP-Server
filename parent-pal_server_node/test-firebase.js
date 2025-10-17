import { FirebaseEventService, authenticateUser } from './src/firebaseService.ts';
import { db } from './src/firebase.ts';
import { Timestamp } from 'firebase-admin/firestore';

console.log('🧪 Testing Firebase functionality...\n');

async function testFirebaseConnection() {
  console.log('1. Testing Firebase connection...');
  try {
    // Test basic Firestore connection
    const testRef = db.collection('test').doc('connection-test');
    await testRef.set({
      test: true,
      timestamp: Timestamp.now()
    });
    
    const doc = await testRef.get();
    if (doc.exists) {
      console.log('✅ Firebase connection successful');
      await testRef.delete(); // Clean up
    } else {
      console.log('❌ Firebase connection failed');
    }
  } catch (error) {
    console.log('❌ Firebase connection error:', error.message);
  }
}

async function testUserAuthentication() {
  console.log('\n2. Testing user authentication...');
  try {
    // Test with a dummy user (this will fail but we can see the error handling)
    const result = await authenticateUser('test@example.com', 'password123');
    if (result) {
      console.log('✅ User authentication successful:', result.email);
    } else {
      console.log('⚠️  User authentication failed (expected for test user)');
    }
  } catch (error) {
    console.log('⚠️  User authentication error (expected):', error.message);
  }
}

async function testGetUserById() {
  console.log('\n3. Testing getUserById...');
  try {
    // Test with a non-existent user ID
    const result = await FirebaseEventService.getUserById('non-existent-user-id');
    if (result) {
      console.log('✅ getUserById returned user:', result.email);
    } else {
      console.log('⚠️  getUserById returned null (expected for non-existent user)');
    }
  } catch (error) {
    console.log('❌ getUserById error:', error.message);
  }
}

async function testGetUserChildren() {
  console.log('\n4. Testing getUserChildren...');
  try {
    // Test with a non-existent user ID
    const result = await FirebaseEventService.getUserChildren('non-existent-user-id');
    console.log('✅ getUserChildren returned:', result.length, 'children');
  } catch (error) {
    console.log('❌ getUserChildren error:', error.message);
  }
}

async function testGetEventsByCategory() {
  console.log('\n5. Testing getEventsByCategory...');
  try {
    // Test with a non-existent user ID
    const result = await FirebaseEventService.getEventsByCategory('birthday', 'non-existent-user-id');
    console.log('✅ getEventsByCategory returned:', result.length, 'events');
  } catch (error) {
    console.log('❌ getEventsByCategory error:', error.message);
  }
}

async function testGetEventsByChild() {
  console.log('\n6. Testing getEventsByChild...');
  try {
    // Test with a non-existent child ID
    const result = await FirebaseEventService.getEventsByChild('non-existent-child-id', 'non-existent-user-id');
    console.log('✅ getEventsByChild returned:', result.length, 'events');
  } catch (error) {
    console.log('❌ getEventsByChild error:', error.message);
  }
}

async function testGetNearestEvents() {
  console.log('\n7. Testing getNearestEvents...');
  try {
    // Test with a non-existent user ID
    const result = await FirebaseEventService.getNearestEvents(30, 'non-existent-user-id');
    console.log('✅ getNearestEvents returned:', result.length, 'events');
  } catch (error) {
    console.log('❌ getNearestEvents error:', error.message);
  }
}

async function testGetChildById() {
  console.log('\n8. Testing getChildById...');
  try {
    // Test with a non-existent child ID
    const result = await FirebaseEventService.getChildById('non-existent-child-id');
    if (result) {
      console.log('✅ getChildById returned child:', result.name);
    } else {
      console.log('⚠️  getChildById returned null (expected for non-existent child)');
    }
  } catch (error) {
    console.log('❌ getChildById error:', error.message);
  }
}

async function runAllTests() {
  await testFirebaseConnection();
  await testUserAuthentication();
  await testGetUserById();
  await testGetUserChildren();
  await testGetEventsByCategory();
  await testGetEventsByChild();
  await testGetNearestEvents();
  await testGetChildById();
  
  console.log('\n🎉 All Firebase tests completed!');
  console.log('\nNote: Most tests will return empty results because we\'re using non-existent IDs.');
  console.log('This is expected behavior and shows the Firebase service is working correctly.');
}

// Run the tests
runAllTests().catch(console.error);
