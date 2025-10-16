import { Timestamp } from 'firebase-admin/firestore';
import { EventDocument, ChildDocument, UserDocument, EventType } from './types.js';

// Mock user data
export const mockUser: UserDocument = {
  id: 'mock-user-123',
  email: 'parent@example.com',
  displayName: 'Sarah Johnson',
  firstName: 'Sarah',
  lastName: 'Johnson',
  photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  status: 'active',
  lastSignInAt: Timestamp.now(),
  onboardingCompleted: true,
  languagePreference: 'en',
  city: 'Tel Aviv',
  healthProvider: 'Clalit',
  reminderTime: 15,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
  isDeleted: false,
};

// Mock children data
export const mockChildren: ChildDocument[] = [
  {
    id: 'child-1',
    userId: 'mock-user-123',
    parentIds: ['mock-user-123'],
    primaryParentId: 'mock-user-123',
    name: 'Emma Johnson',
    dateOfBirth: Timestamp.fromDate(new Date('2020-03-15')),
    gender: 'female',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    calendarEventsCreated: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isDeleted: false,
  },
  {
    id: 'child-2',
    userId: 'mock-user-123',
    parentIds: ['mock-user-123'],
    primaryParentId: 'mock-user-123',
    name: 'Noah Johnson',
    dateOfBirth: Timestamp.fromDate(new Date('2018-07-22')),
    gender: 'male',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    calendarEventsCreated: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isDeleted: false,
  },
];

// Mock events data
export const mockEvents: EventDocument[] = [
  {
    id: 'event-1',
    parentIds: ['mock-user-123'],
    title: 'Emma\'s 4th Birthday',
    eventDate: Timestamp.fromDate(new Date('2024-03-15')),
    description: 'Emma\'s birthday celebration with family and friends',
    eventType: 'birthday',
    childId: 'child-1',
    isRecurring: true,
    recurrenceRule: 'FREQ=YEARLY',
    notificationPreferences: {
      push: true,
      email: true,
      sms: false,
    },
    syncStatus: 'synced',
    readBy: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isDeleted: false,
  },
  {
    id: 'event-2',
    parentIds: ['mock-user-123'],
    title: 'Noah\'s School Registration',
    eventDate: Timestamp.fromDate(new Date('2024-02-15')),
    description: 'Registration deadline for Noah\'s kindergarten',
    eventType: 'registration_deadline',
    childId: 'child-2',
    isRecurring: false,
    notificationPreferences: {
      push: true,
      email: true,
      sms: true,
    },
    actionLinks: [
      {
        title: 'Register Now',
        url: 'https://example.com/register',
        type: 'registration',
      },
    ],
    syncStatus: 'not_synced',
    readBy: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isDeleted: false,
  },
  {
    id: 'event-3',
    parentIds: ['mock-user-123'],
    title: 'Emma\'s Vaccination Appointment',
    eventDate: Timestamp.fromDate(new Date('2024-01-20')),
    description: 'MMR vaccination at Clalit Health Center',
    eventType: 'vaccination',
    childId: 'child-1',
    isRecurring: false,
    notificationPreferences: {
      push: true,
      email: false,
      sms: false,
    },
    syncStatus: 'synced',
    readBy: ['mock-user-123'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isDeleted: false,
  },
  {
    id: 'event-4',
    parentIds: ['mock-user-123'],
    title: 'Noah\'s Soccer Practice',
    eventDate: Timestamp.fromDate(new Date('2024-01-25')),
    description: 'Weekly soccer practice at the community center',
    eventType: 'sports_activity',
    childId: 'child-2',
    isRecurring: true,
    recurrenceRule: 'FREQ=WEEKLY;BYDAY=TH',
    notificationPreferences: {
      push: true,
      email: false,
      sms: false,
    },
    syncStatus: 'synced',
    readBy: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isDeleted: false,
  },
  {
    id: 'event-5',
    parentIds: ['mock-user-123'],
    title: 'Family Day Out',
    eventDate: Timestamp.fromDate(new Date('2024-02-10')),
    description: 'Visit to the science museum with both kids',
    eventType: 'family_event',
    isRecurring: false,
    notificationPreferences: {
      push: true,
      email: true,
      sms: false,
    },
    syncStatus: 'pending',
    readBy: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isDeleted: false,
  },
];

// Helper functions to filter events
export function getEventsByCategory(category: EventType, userId: string): EventDocument[] {
  return mockEvents.filter(event => 
    event.parentIds.includes(userId) && 
    event.eventType === category && 
    !event.isDeleted
  );
}

export function getEventsByChild(childId: string, userId: string): EventDocument[] {
  return mockEvents.filter(event => 
    event.parentIds.includes(userId) && 
    event.childId === childId && 
    !event.isDeleted
  );
}

export function getNearestEvents(days: number, userId: string): EventDocument[] {
  const now = new Date();
  const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
  
  return mockEvents
    .filter(event => 
      event.parentIds.includes(userId) && 
      !event.isDeleted &&
      event.eventDate.toDate() >= now &&
      event.eventDate.toDate() <= futureDate
    )
    .sort((a, b) => a.eventDate.toMillis() - b.eventDate.toMillis());
}

export function getChildById(childId: string): ChildDocument | undefined {
  return mockChildren.find(child => child.id === childId && !child.isDeleted);
}

export function getUserById(userId: string): UserDocument | undefined {
  return userId === 'mock-user-123' ? mockUser : undefined;
}
