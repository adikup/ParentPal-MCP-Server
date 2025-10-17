import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  doc,
  getDoc,
  Timestamp 
} from 'firebase-admin/firestore';
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
    
    // Get user document from Firestore using Firebase UID
    const userDoc = await FirebaseEventService.getUserById(firebaseUid);
    if (!userDoc) {
      console.log(`❌ User document not found for UID: ${firebaseUid}`);
      return null;
    }
    
    return userDoc;
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
      const eventsRef = collection(db, COLLECTIONS.EVENTS);
      const q = query(
        eventsRef,
        where('parentIds', 'array-contains', userId),
        where('eventType', '==', category),
        where('isDeleted', '==', false),
        orderBy('eventDate', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
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
      const eventsRef = collection(db, COLLECTIONS.EVENTS);
      const q = query(
        eventsRef,
        where('parentIds', 'array-contains', userId),
        where('childId', '==', childId),
        where('isDeleted', '==', false),
        orderBy('eventDate', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
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
      
      const eventsRef = collection(db, COLLECTIONS.EVENTS);
      const q = query(
        eventsRef,
        where('parentIds', 'array-contains', userId),
        where('eventDate', '>=', Timestamp.fromDate(now)),
        where('eventDate', '<=', Timestamp.fromDate(futureDate)),
        where('isDeleted', '==', false),
        orderBy('eventDate', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
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
      const childRef = doc(db, COLLECTIONS.CHILDREN, childId);
      const childSnap = await getDoc(childRef);
      
      if (!childSnap.exists()) {
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
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
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
      const childrenRef = collection(db, COLLECTIONS.CHILDREN);
      const q = query(
        childrenRef,
        where('parentIds', 'array-contains', userId),
        where('isDeleted', '==', false),
        orderBy('name', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
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
