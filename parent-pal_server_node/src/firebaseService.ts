import { Timestamp } from 'firebase-admin/firestore';
import { db } from './firebase.js';
import { EventDocument, ChildDocument, UserDocument, EventType, COLLECTIONS } from './types.js';

// Authentication service using Firebase Auth REST API
export async function authenticateUser(email: string, password: string): Promise<UserDocument | null> {
  try {
    process.stderr.write(`🔐 Authenticating user: ${email}\n`);
    
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
      process.stderr.write(`❌ Authentication failed: ${errorData.error?.message || 'Unknown error'}\n`);
      return null;
    }

    const authData = await response.json();
    const firebaseUid = authData.localId;
    
    process.stderr.write(`✅ User authenticated: ${firebaseUid}\n`);
    
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
    process.stderr.write(`❌ Authentication error: ${error}\n`);
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
      process.stderr.write(`Error fetching events by category: ${error}\n`);
      return [];
    }
  }
  
  // Get events for a specific child
  static async getEventsByChild(childId: string, userId: string): Promise<EventDocument[]> {
    try {
      process.stderr.write(`🔍 Fetching events for child ${childId} and user ${userId}\n`);
      
      // First, let's try a simpler query without complex filtering
      const eventsRef = db.collection(COLLECTIONS.EVENTS);
      const querySnapshot = await eventsRef
        .where('parentIds', 'array-contains', userId)
        .get();
      
      process.stderr.write(`📊 Found ${querySnapshot.size} total events for user\n`);
      
      // Filter by childId and isDeleted in memory to avoid index issues
      const filteredEvents = querySnapshot.docs
        .map(doc => {
          const eventData = doc.data();
          return {
            ...eventData as EventDocument,
            id: doc.id
          };
        })
        .filter(event => {
          // Also check if title contains child name (case insensitive)
          const childName = childId === "Xv9zNxGw2hHhgsHM35oF" ? "neo" : "";
          const titleContainsChild = childName && event.title.toLowerCase().includes(childName);
          
          
          return (event.childId === childId || titleContainsChild) && !event.isDeleted;
        });
      
      process.stderr.write(`👶 Found ${filteredEvents.length} events for child ${childId}\n`);
      
      return filteredEvents.sort((a, b) => a.eventDate.seconds - b.eventDate.seconds);
    } catch (error) {
      process.stderr.write(`Error fetching events by child: ${error}\n`);
      return [];
    }
  }
  
  // Get upcoming events within specified days
  static async getNearestEvents(days: number, userId: string): Promise<EventDocument[]> {
    try {
      const now = new Date();
      const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
      
      process.stderr.write(`📅 Looking for events between ${now.toISOString()} and ${futureDate.toISOString()}\n`);
      
      const eventsRef = db.collection(COLLECTIONS.EVENTS);
      const querySnapshot = await eventsRef
        .where('parentIds', 'array-contains', userId)
        .get();
      
      process.stderr.write(`📊 Found ${querySnapshot.size} total events for user ${userId}\n`);
      
      // Filter in memory to avoid index issues
      const filteredEvents = querySnapshot.docs
        .map(doc => ({
          ...doc.data() as EventDocument,
          id: doc.id
        }))
        .filter(event => {
          const eventDate = event.eventDate.toDate();
          const isInRange = eventDate >= now && eventDate <= futureDate;
          const isNotDeleted = !event.isDeleted;
          
          
          return isInRange && isNotDeleted;
        });
      
      process.stderr.write(`📅 Found ${filteredEvents.length} events in date range\n`);
      
      return filteredEvents.sort((a, b) => a.eventDate.seconds - b.eventDate.seconds);
    } catch (error) {
      process.stderr.write(`Error fetching nearest events: ${error}\n`);
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
      process.stderr.write(`Error fetching child: ${error}\n`);
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
      process.stderr.write(`Error fetching user: ${error}\n`);
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
      process.stderr.write(`Error fetching user children: ${error}\n`);
      return [];
    }
  }

  // Create a new event
  static async createEvent(eventData: {
    parentIds: string[];
    title: string;
    eventDate: Date;
    description?: string;
    eventType: EventType;
    childId?: string;
    isRecurring?: boolean;
    recurrenceRule?: string;
    notificationPreferences?: {
      push: boolean;
      email: boolean;
      sms: boolean;
    };
    actionLinks?: Array<{
      title: string;
      url: string;
      type?: 'registration' | 'application' | 'status' | 'info' | 'other';
    }>;
    metadata?: Record<string, any>;
  }): Promise<EventDocument> {
    try {
      process.stderr.write(`📝 Creating new event: ${eventData.title}\n`);
      
      const eventRef = db.collection(COLLECTIONS.EVENTS).doc();
      const now = Timestamp.now();
      
      const newEvent: EventDocument = {
        id: eventRef.id,
        parentIds: eventData.parentIds,
        title: eventData.title,
        eventDate: Timestamp.fromDate(eventData.eventDate),
        description: eventData.description || '',
        eventType: eventData.eventType,
        childId: eventData.childId,
        isRecurring: eventData.isRecurring || false,
        recurrenceRule: eventData.recurrenceRule || null,
        notificationPreferences: eventData.notificationPreferences || {
          push: true,
          email: true,
          sms: false,
        },
        actionLinks: eventData.actionLinks || [],
        googleCalendarEventId: null, // Will be set after Google Calendar sync
        lastSyncedAt: null,
        syncStatus: 'not_synced', // Will be updated after Google Calendar sync
        readBy: [],
        metadata: eventData.metadata || {},
        createdAt: now,
        updatedAt: now,
        isDeleted: false,
      };

      await eventRef.set(newEvent);
      
      process.stderr.write(`✅ Event created successfully with ID: ${eventRef.id}\n`);
      
      return newEvent;
    } catch (error) {
      process.stderr.write(`❌ Error creating event: ${error}\n`);
      throw error;
    }
  }

  // Sync event to Google Calendar (placeholder for future implementation)
  static async syncEventToGoogleCalendar(eventId: string, userId: string): Promise<{
    googleCalendarEventId?: string;
    syncStatus: 'synced' | 'failed' | 'not_synced';
  }> {
    try {
      process.stderr.write(`🔄 Syncing event ${eventId} to Google Calendar for user ${userId}\n`);
      
      // TODO: Implement Google Calendar API integration
      // For now, we'll just mark it as not_synced
      // In the future, this would:
      // 1. Get user's Google Calendar credentials
      // 2. Create event in Google Calendar
      // 3. Update the event with googleCalendarEventId
      // 4. Set syncStatus to 'synced'
      
      process.stderr.write(`⚠️ Google Calendar sync not yet implemented - marking as not_synced\n`);
      
      return {
        syncStatus: 'not_synced'
      };
    } catch (error) {
      process.stderr.write(`❌ Error syncing to Google Calendar: ${error}\n`);
      return {
        syncStatus: 'failed'
      };
    }
  }
}
