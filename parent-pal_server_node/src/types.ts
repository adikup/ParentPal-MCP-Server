import { Timestamp } from 'firebase-admin/firestore';

// Base interface for all documents with soft delete fields
export interface BaseDocument {
  id?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isDeleted: boolean;
  deletedAt?: Timestamp;
  hardDeleteScheduledAt?: Timestamp;
}

// User document interface (simplified for MCP server)
export interface UserDocument extends BaseDocument {
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  id: string; // Firebase Auth UID
  status: 'active' | 'soft_deleted' | 'restored' | 'expired_recreated' | 'signed_out';
  lastSignInAt: Timestamp;
  onboardingCompleted: boolean;
  languagePreference: string;
  city?: string;
  healthProvider?: string;
  reminderTime?: number;
  coverPhotoURL?: string;
  isSecondaryParent?: boolean;
  roleLabel?: string;
  primaryParentId?: string;
}

// Child document interface
export interface ChildDocument extends BaseDocument {
  userId: string; // Keep for backward compatibility
  parentIds: string[]; // Array of parent user IDs
  primaryParentId: string; // ID of the primary parent
  name: string;
  dateOfBirth: Timestamp;
  gender: 'male' | 'female' | 'other';
  photoURL?: string;
  emailAddress?: string;
  birthingParentId?: string | null;
  hasPassport?: boolean;
  passportExpiredAt?: Timestamp;
  calendarId?: string;
  calendarEventsCreated: boolean;
}

// Event types (for reminders/calendar events)
export type EventType = 
  | 'birthday'
  | 'doctor_appointment'
  | 'school_event'
  | 'vaccination'
  | 'dental_checkup'
  | 'sports_activity'
  | 'playdate'
  | 'family_event'
  | 'education'
  | 'financial_benefits'
  | 'health'
  | 'birthday_wish'
  | 'prep'
  | 'baby_photo'
  | 'custom'
  | 'holiday'
  | 'school_pickup'
  | 'personal'
  | 'school_vacation'
  | 'school_show'
  | 'parent_meeting'
  | 'after_school'
  | 'field_trip'
  | 'registration'
  | 'registration_deadline'
  | 'homework'
  | 'photo'
  | 'wish'
  | 'other';

// Event document interface
export interface EventDocument extends BaseDocument {
  parentIds: string[]; // Array of parent user IDs
  title: string;
  eventDate: Timestamp;
  description?: string;
  eventType: EventType;
  childId?: string; // For child-specific events
  isRecurring: boolean;
  recurrenceRule?: string; // RRULE for recurring events
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
  googleCalendarEventId?: string;
  lastSyncedAt?: Timestamp;
  syncStatus: 'pending' | 'synced' | 'failed' | 'not_synced';
  readBy?: string[]; // Array of user IDs who have marked this event as read
  metadata?: Record<string, any>;
}

// Event widget type for MCP server
export interface EventWidget {
  id: string;
  title: string;
  templateUri: string;
  html: string;
  responseText: string;
}

// MCP tool input schemas
export interface FetchEventsByCategoryInput {
  category: EventType;
  userId: string;
}

export interface FetchEventsByChildInput {
  childId: string;
  userId: string;
}

export interface FetchNearestEventsInput {
  days: number;
  userId: string;
}

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  CHILDREN: 'children',
  EVENTS: 'events',
} as const;
