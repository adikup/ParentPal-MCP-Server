import { Timestamp } from 'firebase-admin/firestore';
import { db } from './firebase.js';
import { EventDocument, ChildDocument, UserDocument, EventType, COLLECTIONS } from './types.js';

// Authentication service using Firebase Auth REST API
export async function authenticateUser(email: string, password: string): Promise<UserDocument | null> {
  try {
    console.log(`🔐 Authenticating user: ${email}`);
    
    // Use Firebase Auth REST API to verify credentials
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
        returnSecureToken: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log(`❌ Authentication failed: ${errorData.error?.message || 'Unknown error'}`);
      return null;
    }

    const authData = await response.json();
    const firebaseUid = authData.localId;
    
    console.log(`✅ User authenticated: ${firebaseUid}`);
    
    // Return user data from Firebase Auth (no need for Firestore user document)
    return {
      id: firebaseUid,
      email: email,
      displayName: authData.displayName || '',
      firstName: authData.displayName?.split(' ')[0] || '',
      lastName: authData.displayName?.split(' ')[1] || '',
      photoURL: authData.photoUrl || '',
      status: 'active' as const,
      lastSignInAt: Timestamp.now(),
      onboardingCompleted: true,
      languagePreference: 'en',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isDeleted: false
    };
  } catch (error) {
    console.error('❌ Authentication error:', error);
    return null;
  }
}

// Real Firebase data service
export class FirebaseEventService {
  
  // Get events by category for a user
  static async getEventsByCategory(category: EventType, userId: string): Promise<EventDocument[]> {
    try {
      const eventsRef = db.collection(COLLECTIONS.EVENTS);
      const querySnapshot = await eventsRef
        .where('parentIds', 'array-contains', userId)
        .where('eventType', '==', category)
        .where('isDeleted', '==', false)
        .orderBy('eventDate', 'asc')
        .get();
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data() as EventDocument,
        id: doc.id
      }));
    } catch (error) {
      console.error('Error fetching events by category:', error);
      return [];
    }
  }
  
  // Get events for a specific child
  static async getEventsByChild(childId: string, userId: string): Promise<EventDocument[]> {
    try {
      const eventsRef = db.collection(COLLECTIONS.EVENTS);
      const querySnapshot = await eventsRef
        .where('parentIds', 'array-contains', userId)
        .where('childId', '==', childId)
        .where('isDeleted', '==', false)
        .orderBy('eventDate', 'asc')
        .get();
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data() as EventDocument,
        id: doc.id
      }));
    } catch (error) {
      console.error('Error fetching events by child:', error);
      return [];
    }
  }
  
  // Get upcoming events within specified days
  static async getNearestEvents(days: number, userId: string): Promise<EventDocument[]> {
    try {
      const now = new Date();
      const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
      
      const eventsRef = db.collection(COLLECTIONS.EVENTS);
      const querySnapshot = await eventsRef
        .where('parentIds', 'array-contains', userId)
        .where('eventDate', '>=', Timestamp.fromDate(now))
        .where('eventDate', '<=', Timestamp.fromDate(futureDate))
        .where('isDeleted', '==', false)
        .orderBy('eventDate', 'asc')
        .get();
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data() as EventDocument,
        id: doc.id
      }));
    } catch (error) {
      console.error('Error fetching nearest events:', error);
      return [];
    }
  }
  
  // Get child by ID
  static async getChildById(childId: string): Promise<ChildDocument | null> {
    try {
      const childRef = db.collection(COLLECTIONS.CHILDREN).doc(childId);
      const childSnap = await childRef.get();
      
      if (!childSnap.exists) {
        return null;
      }
      
      const childData = childSnap.data() as ChildDocument;
      if (childData.isDeleted) {
        return null;
      }
      
      return {
        ...childData,
        id: childSnap.id
      };
    } catch (error) {
      console.error('Error fetching child:', error);
      return null;
    }
  }
  
  // Get user by ID
  static async getUserById(userId: string): Promise<UserDocument | null> {
    try {
      const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
      const userSnap = await userRef.get();
      
      if (!userSnap.exists) {
        return null;
      }
      
      const userData = userSnap.data() as UserDocument;
      if (userData.isDeleted) {
        return null;
      }
      
      return {
        ...userData,
        id: userSnap.id
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }
  
  // Get all children for a user
  static async getUserChildren(userId: string): Promise<ChildDocument[]> {
    try {
      const childrenRef = db.collection(COLLECTIONS.CHILDREN);
      const querySnapshot = await childrenRef
        .where('parentIds', 'array-contains', userId)
        .where('isDeleted', '==', false)
        .orderBy('name', 'asc')
        .get();
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data() as ChildDocument,
        id: doc.id
      }));
    } catch (error) {
      console.error('Error fetching user children:', error);
      return [];
    }
  }
}
