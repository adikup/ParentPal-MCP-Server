import { Timestamp } from 'firebase-admin/firestore';

// Test account credentials for Anthropic's testing
export const TEST_ACCOUNT = {
  email: 'test@carri.app',
  password: 'TestPassword123!',
  userId: 'test-user-anthropic-2024',
  displayName: 'Test Parent',
  firstName: 'Test',
  lastName: 'Parent',
  role: 'mom',
  roleLabel: 'Mom',
  healthProvider: 'maccabi',
  city: 'Tel Aviv',
  languagePreference: 'en',
  reminderTime: 9,
  subscriptionStatus: 'active',
  subscriptionTier: 'basic_carri_plan',
  hasActiveSubscription: true,
  isTrialActive: false,
  hasEverHadSubscription: true,
  onboardingCompleted: true,
  gdprConsentGiven: true,
  status: 'active',
  isDeleted: false,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
  lastSignInAt: Timestamp.now(),
  trialStartedAt: Timestamp.now(),
  trialEndsAt: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days from now
  subscriptionExpiresAt: Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)), // 1 year from now
  subscriptionHistory: [{
    planId: 'basic_carri_plan',
    amount: 14.99,
    currency: 'USD',
    transactionId: 'test-transaction-123',
    subscriptionId: 'SUB_TEST_123',
    startDate: Timestamp.now(),
    endDate: Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
    status: 'active',
    paymentMethod: 'test',
    receipt: 'test_receipt'
  }],
  subscriptionFeatures: [
    'planFeatureHealthReminders',
    'planFeatureBirthdayReminders',
    'planFeatureBirthdayWishes',
    'planFeaturePhotoReminders',
    'planFeatureEducationEvents',
    'planFeatureFinancialBenefits',
    'planFeaturePrioritySupport',
    'planFeatureNoRecurring'
  ],
  notificationPreferences: {
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    quietHoursEnabled: false,
    categories: {
      babyPhotoReminders: true,
      birthdayWishes: true,
      birthdays: true,
      childHealth: true,
      education: true,
      financialBenefits: true,
      seasonalShopping: false
    }
  }
};

// Test children data
export const TEST_CHILDREN = [
  {
    id: 'test-child-emma-2024',
    name: 'Emma',
    dateOfBirth: Timestamp.fromDate(new Date('2019-03-15')), // 5 years old
    gender: 'female',
    primaryParentId: TEST_ACCOUNT.userId,
    parentIds: [TEST_ACCOUNT.userId],
    birthingParentId: TEST_ACCOUNT.userId,
    hasPassport: false,
    calendarEventsCreated: false,
    isDeleted: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'test-child-neo-2024',
    name: 'Neo',
    dateOfBirth: Timestamp.fromDate(new Date('2020-12-20')), // 4 years old
    gender: 'male',
    primaryParentId: TEST_ACCOUNT.userId,
    parentIds: [TEST_ACCOUNT.userId],
    birthingParentId: TEST_ACCOUNT.userId,
    hasPassport: false,
    calendarEventsCreated: false,
    isDeleted: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'test-child-maya-2024',
    name: 'Maya',
    dateOfBirth: Timestamp.fromDate(new Date('2022-08-10')), // 2 years old
    gender: 'female',
    primaryParentId: TEST_ACCOUNT.userId,
    parentIds: [TEST_ACCOUNT.userId],
    birthingParentId: TEST_ACCOUNT.userId,
    hasPassport: false,
    calendarEventsCreated: false,
    isDeleted: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

// Sample events for testing different scenarios
export const TEST_EVENTS = [
  // Health events
  {
    id: 'test-event-emma-checkup',
    title: 'Emma - Annual Checkup',
    description: 'Annual pediatric checkup for Emma',
    eventDate: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 1 week from now
    eventType: 'health',
    childId: 'test-child-emma-2024',
    parentIds: [TEST_ACCOUNT.userId],
    isRecurring: false,
    recurrenceRule: null,
    notificationPreferences: {
      push: true,
      email: true,
      sms: false
    },
    actionLinks: [],
    googleCalendarEventId: null,
    lastSyncedAt: null,
    syncStatus: 'not_synced',
    readBy: [],
    metadata: {
      category: 'health',
      doctor: 'Dr. Sarah Cohen',
      location: 'Maccabi Health Center'
    },
    isDeleted: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'test-event-neo-vaccination',
    title: 'Neo - MMR Vaccination',
    description: 'MMR vaccination appointment for Neo',
    eventDate: Timestamp.fromDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)), // 2 weeks from now
    eventType: 'health',
    childId: 'test-child-neo-2024',
    parentIds: [TEST_ACCOUNT.userId],
    isRecurring: false,
    recurrenceRule: null,
    notificationPreferences: {
      push: true,
      email: true,
      sms: false
    },
    actionLinks: [],
    googleCalendarEventId: null,
    lastSyncedAt: null,
    syncStatus: 'not_synced',
    readBy: [],
    metadata: {
      category: 'health',
      vaccine: 'MMR',
      location: 'Maccabi Health Center'
    },
    isDeleted: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  
  // Birthday events
  {
    id: 'test-event-emma-birthday',
    title: 'Emma - 6th Birthday Party',
    description: 'Emma\'s 6th birthday celebration at home',
    eventDate: Timestamp.fromDate(new Date('2025-03-15T16:00:00Z')), // Emma's birthday
    eventType: 'birthday',
    childId: 'test-child-emma-2024',
    parentIds: [TEST_ACCOUNT.userId],
    isRecurring: true,
    recurrenceRule: 'FREQ=YEARLY',
    notificationPreferences: {
      push: true,
      email: true,
      sms: false
    },
    actionLinks: [],
    googleCalendarEventId: null,
    lastSyncedAt: null,
    syncStatus: 'not_synced',
    readBy: [],
    metadata: {
      category: 'birthday',
      age: 6,
      location: 'Home'
    },
    isDeleted: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  
  // Education events
  {
    id: 'test-event-school-meeting',
    title: 'Parent-Teacher Conference',
    description: 'Quarterly parent-teacher conference for Emma',
    eventDate: Timestamp.fromDate(new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)), // 3 weeks from now
    eventType: 'education',
    childId: 'test-child-emma-2024',
    parentIds: [TEST_ACCOUNT.userId],
    isRecurring: false,
    recurrenceRule: null,
    notificationPreferences: {
      push: true,
      email: true,
      sms: false
    },
    actionLinks: [
      {
        title: 'Join Meeting',
        url: 'https://zoom.us/j/123456789',
        type: 'info'
      }
    ],
    googleCalendarEventId: null,
    lastSyncedAt: null,
    syncStatus: 'not_synced',
    readBy: [],
    metadata: {
      category: 'education',
      teacher: 'Ms. Johnson',
      location: 'Zoom'
    },
    isDeleted: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  
  // Financial benefits
  {
    id: 'test-event-savings-check',
    title: 'Child Savings Account Review',
    description: 'Annual review of children\'s savings accounts',
    eventDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 1 month from now
    eventType: 'financial_benefits',
    childId: null, // Family-wide event
    parentIds: [TEST_ACCOUNT.userId],
    isRecurring: true,
    recurrenceRule: 'FREQ=YEARLY',
    notificationPreferences: {
      push: true,
      email: true,
      sms: false
    },
    actionLinks: [
      {
        title: 'Check Account Status',
        url: 'https://www.mygemel.net',
        type: 'status'
      }
    ],
    googleCalendarEventId: null,
    lastSyncedAt: null,
    syncStatus: 'not_synced',
    readBy: [],
    metadata: {
      category: 'financial_benefits',
      accountType: 'child_savings'
    },
    isDeleted: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  
  // Holiday events
  {
    id: 'test-event-family-holiday',
    title: 'Family Holiday Dinner',
    description: 'Annual family holiday celebration',
    eventDate: Timestamp.fromDate(new Date('2024-12-25T18:00:00Z')), // Christmas
    eventType: 'holiday',
    childId: null, // Family-wide event
    parentIds: [TEST_ACCOUNT.userId],
    isRecurring: true,
    recurrenceRule: 'FREQ=YEARLY',
    notificationPreferences: {
      push: true,
      email: true,
      sms: false
    },
    actionLinks: [],
    googleCalendarEventId: null,
    lastSyncedAt: null,
    syncStatus: 'not_synced',
    readBy: [],
    metadata: {
      category: 'holiday',
      holiday: 'Christmas'
    },
    isDeleted: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

// Test prompts for Anthropic verification
export const TEST_PROMPTS = [
  {
    name: 'Health Events Query',
    prompt: 'Show me my upcoming health events for the next 30 days',
    expectedResult: 'Should display Emma\'s checkup and Neo\'s vaccination',
    toolsUsed: ['authenticate-user', 'fetch-events-by-category']
  },
  {
    name: 'Child-Specific Events',
    prompt: 'What events do I have scheduled for Emma this month?',
    expectedResult: 'Should show Emma\'s checkup, birthday, and parent-teacher conference',
    toolsUsed: ['authenticate-user', 'fetch-events-by-child']
  },
  {
    name: 'Create New Event',
    prompt: 'Create a birthday party event for Maya on August 10th at 2 PM',
    expectedResult: 'Should create a new birthday event for Maya',
    toolsUsed: ['authenticate-user', 'create-event']
  },
  {
    name: 'Upcoming Events',
    prompt: 'What events do I have coming up in the next 2 weeks?',
    expectedResult: 'Should show Emma\'s checkup and Neo\'s vaccination',
    toolsUsed: ['authenticate-user', 'fetch-nearest-events']
  },
  {
    name: 'Financial Events',
    prompt: 'Show me my financial benefit events',
    expectedResult: 'Should display the savings account review event',
    toolsUsed: ['authenticate-user', 'fetch-events-by-category']
  }
];

// Instructions for Anthropic testing
export const TESTING_INSTRUCTIONS = `
# Anthropic Testing Instructions

## Test Account Credentials
- **Email:** test@carri.app
- **Password:** TestPassword123!
- **User ID:** test-user-anthropic-2024

## Test Children
- **Emma** (5 years old, female) - ID: test-child-emma-2024
- **Neo** (4 years old, male) - ID: test-child-neo-2024  
- **Maya** (2 years old, female) - ID: test-child-maya-2024

## Sample Events Available
1. **Emma - Annual Checkup** (1 week from now, health)
2. **Neo - MMR Vaccination** (2 weeks from now, health)
3. **Emma - 6th Birthday Party** (March 15, 2025, birthday)
4. **Parent-Teacher Conference** (3 weeks from now, education)
5. **Child Savings Account Review** (1 month from now, financial_benefits)
6. **Family Holiday Dinner** (December 25, holiday)

## Test Scenarios
Use the provided test prompts to verify all core functionality works correctly.

## Notes
- All events are marked as not deleted (isDeleted: false)
- Events span different categories and time periods
- Some events are child-specific, others are family-wide
- Recurring events are properly configured
- Action links are included where relevant
`;
