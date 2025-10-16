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

// Authentication service
export async function authenticateUser(email: string, password: string): Promise<UserDocument | null> {
  try {
    // Note: Firebase Admin SDK doesn't have direct email/password auth
    // You'll need to implement this through Firebase Auth REST API or client SDK
    // For now, we'll simulate authentication
    
    // In production, you would:
    // 1. Use Firebase Auth REST API to verify credentials
    // 2. Get the user's Firebase UID
    // 3. Fetch user document from Firestore
    
    console.log(`Authenticating user: ${email}`);
    
    // Simulate finding user by email
    const usersRef = collection(db, COLLECTIONS.USERS);
    const q = query(usersRef, where('email', '==', email), where('isDeleted', '==', false));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null; // User not found
    }
    
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data() as UserDocument;
    
    // In production, verify password hash here
    // For now, we'll accept any password for demo
    console.log(`User authenticated: ${userData.displayName}`);
    
    return {
      ...userData,
      id: userDoc.id
    };
  } catch (error) {
    console.error('Authentication error:', error);
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
