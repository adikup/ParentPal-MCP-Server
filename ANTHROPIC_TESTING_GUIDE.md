# Anthropic Testing Guide for Carri MCP Server

## Overview
This guide provides Anthropic with everything needed to test the Carri MCP server functionality and verify compliance with the MCP Directory requirements.

## Test Account Setup

### 1. Test Credentials
- **Email:** `test@carri.app`
- **Password:** `TestPassword123!`
- **User ID:** `test-user-anthropic-2024`

### 2. Setup Test Data
Run the following command to populate Firebase with test data:

```bash
cd parent-pal_server_node
pnpm run setup:test
```

This will create:
- 1 test user account in Firebase Auth
- 1 test user document in Firestore
- 3 test children (Emma, Neo, Maya)
- 6 sample events across different categories

### 3. Create Required Firestore Indexes
For full functionality, create these Firestore indexes:

**Events Collection Index:**
```
Collection: events
Fields: parentIds (Array-contains), eventType (==), isDeleted (==), eventDate (Ascending)
```

**Create Index Link:** [Firebase Console - Create Index](https://console.firebase.google.com/v1/r/project/parent-pal-97ae2/firestore/indexes?create_composite=Ck9wcm9qZWN0cy9wYXJlbnQtcGFsLTk3YWUyL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9ldmVudHMvaW5kZXhlcy9fEAEaDQoJcGFyZW50SWRzGAEaDQoJZXZlbnRUeXBlEAEaDQoJaXNEZWxldGVkEAEaDQoJZXZlbnREYXRlEAEaDAoIX19uYW1lX18QAQ)

**Note:** Without this index, some queries will return empty results but the server will still function for basic operations.

### 4. Cleanup Test Data
After testing, clean up with:

```bash
pnpm run cleanup:test
```

## Test Data Details

### Test Children
| Name | Age | Gender | ID |
|------|-----|--------|-----|
| Emma | 5 years | Female | `test-child-emma-2024` |
| Neo | 4 years | Male | `test-child-neo-2024` |
| Maya | 2 years | Female | `test-child-maya-2024` |

### Sample Events
| Title | Type | Date | Child | Description |
|-------|------|------|-------|-------------|
| Emma - Annual Checkup | health | 1 week from now | Emma | Pediatric checkup |
| Neo - MMR Vaccination | health | 2 weeks from now | Neo | Vaccination appointment |
| Emma - 6th Birthday Party | birthday | March 15, 2025 | Emma | Birthday celebration |
| Parent-Teacher Conference | education | 3 weeks from now | Emma | School meeting |
| Child Savings Account Review | financial_benefits | 1 month from now | Family | Annual review |
| Family Holiday Dinner | holiday | December 25 | Family | Holiday celebration |

## Test Scenarios

### Scenario 1: Health Events Query
**Prompt:** "Show me my upcoming health events for the next 30 days"

**Expected Result:** 
- Emma's Annual Checkup (1 week from now)
- Neo's MMR Vaccination (2 weeks from now)

**Tools Used:** `authenticate-user`, `fetch-events-by-category`

### Scenario 2: Child-Specific Events
**Prompt:** "What events do I have scheduled for Emma this month?"

**Expected Result:**
- Emma's Annual Checkup
- Emma's 6th Birthday Party
- Parent-Teacher Conference

**Tools Used:** `authenticate-user`, `fetch-events-by-child`

### Scenario 3: Create New Event
**Prompt:** "Create a birthday party event for Maya on August 10th at 2 PM"

**Expected Result:** 
- New birthday event created for Maya
- Event appears in calendar
- Optional Google Calendar sync

**Tools Used:** `authenticate-user`, `create-event`

### Scenario 4: Upcoming Events
**Prompt:** "What events do I have coming up in the next 2 weeks?"

**Expected Result:**
- Emma's Annual Checkup
- Neo's MMR Vaccination

**Tools Used:** `authenticate-user`, `fetch-nearest-events`

### Scenario 5: Financial Events
**Prompt:** "Show me my financial benefit events"

**Expected Result:**
- Child Savings Account Review event

**Tools Used:** `authenticate-user`, `fetch-events-by-category`

## Verification Checklist

### ✅ Authentication
- [ ] User can authenticate with test credentials
- [ ] Authentication returns valid user data
- [ ] Invalid credentials are rejected

### ✅ Event Fetching
- [ ] Events by category work correctly
- [ ] Events by child work correctly
- [ ] Nearest events work correctly
- [ ] Deleted events are excluded
- [ ] User permissions are respected

### ✅ Event Creation
- [ ] New events can be created
- [ ] All required fields are validated
- [ ] Optional fields work correctly
- [ ] Events appear in subsequent queries

### ✅ Error Handling
- [ ] Graceful error messages
- [ ] Invalid inputs are handled
- [ ] Network errors are handled
- [ ] Authentication errors are handled

### ✅ Performance
- [ ] Response times are fast (< 2 seconds)
- [ ] Token usage is efficient
- [ ] No unnecessary data in responses

### ✅ Security
- [ ] User data is properly filtered
- [ ] No unauthorized access
- [ ] Sensitive data is not exposed

## Troubleshooting

### Common Issues

**Authentication Fails:**
- Verify test data was populated correctly
- Check Firebase service account key
- Ensure user exists in database

**No Events Returned:**
- Verify events were created with correct parentIds
- Check that events are not marked as deleted
- Ensure user ID matches in queries

**Create Event Fails:**
- Verify all required fields are provided
- Check date format (ISO 8601)
- Ensure eventType is valid

### Debug Commands

```bash
# Check if test data exists
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"authenticate-user","arguments":{"email":"test@carri.app","password":"TestPassword123!"}}}' | ./start-mcp.sh

# List all tools
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | ./start-mcp.sh
```

## Contact Information

For any issues during testing:
- **Email:** support@carri.app
- **Response Time:** 24-48 hours
- **GitHub Issues:** [Report bugs](https://github.com/carri-app/carri-mcp-server/issues)

## Compliance Verification

This test setup verifies compliance with:
- ✅ Requirement #7: Tool descriptions are narrow and unambiguous
- ✅ Requirement #8: Descriptions match functionality
- ✅ Requirement #15: Efficient token usage
- ✅ Requirement #17: Required annotations provided
- ✅ Requirement #20: Privacy policy provided
- ✅ Requirement #21: Contact information provided
- ✅ Requirement #22: Documentation explains functionality
- ✅ Requirement #23: Testing account provided
- ✅ Requirement #24: Working examples provided
- ✅ Requirement #25: API ownership verified
- ✅ Requirement #26: Maintenance commitments provided
