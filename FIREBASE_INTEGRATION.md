# Firebase Authentication Integration - BuyData.Shop

## Overview

BuyData.Shop now supports cross-platform authentication using **DataSell.Store Firebase credentials**. Agents can login or signup using their existing DataSell.Store account.

## What Was Added

### 1. Firebase Configuration (`src/lib/firebase.ts`)

- Initializes Firebase SDK with environment variables
- Configures auth persistence (localStorage)
- Exports `auth` instance for client-side operations
- Supports Firebase emulator in development mode

**Environment Variables Required:**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

### 2. Firebase Sync API (`src/app/api/auth/firebase-sync/route.ts`)

**Endpoint:** `POST /api/auth/firebase-sync`

Handles Firebase user creation/synchronization to Prisma database:
- Accepts: `email`, `displayName`, `uid`
- Creates new agent if doesn't exist:
  - Auto-generates unique slug from business name + timestamp
  - Sets status to PENDING (requires activation)
  - Sets commission rate to 30%
- Updates existing agent with Firebase UID
- Returns: Agent object with ID and status

```json
// Request
{
  "email": "agent@datasell.store",
  "displayName": "Great Data Ghana",
  "uid": "firebase-uid-12345"
}

// Response (201 - New Agent)
{
  "agent": { ... },
  "message": "Agent created successfully. Please complete activation."
}

// Response (200 - Existing Agent)
{
  "agent": { ... },
  "message": "Agent found and synced"
}
```

### 3. Updated Login Page (`src/app/login/page.tsx`)

**New Features:**
- "Sign In with DataSell.Store" button (blue, Firebase-branded)
- Existing email/password login still available
- Validates Firebase credentials against datasell.store Firebase project
- Auto-creates Prisma session after Firebase auth
- Handles Firebase-specific errors:
  - User not found → "No DataSell.Store account found"
  - Wrong password → "Incorrect password"
  - Invalid email → "Invalid email address"

**Flow:**
1. User enters email/password
2. Clicks "Sign In with DataSell.Store"
3. Firebase validates against datasell-7b993 project
4. firebase-sync endpoint creates/updates agent in database
5. NextAuth session created
6. Redirects to `/dashboard`

### 4. Updated Register Page (`src/app/register/page.tsx`)

**New Features:**
- "Sign Up with DataSell.Store" button
- Auto-fills display name as business name
- Creates Firebase user and Prisma agent simultaneously
- Validates password confirmation
- Handles Firebase signup errors:
  - Email already exists → "Email already registered"
  - Weak password → "Password is too weak"
  - Invalid email → "Invalid email address"

**Flow:**
1. User fills in email, password, business name
2. Clicks "Sign Up with DataSell.Store"
3. Creates Firebase user with `createUserWithEmailAndPassword`
4. Updates Firebase profile with business name
5. Syncs to Prisma via firebase-sync endpoint
6. Auto-generates unique slug
7. Redirects to `/pending?agentId=...`

### 5. Updated NextAuth Config (`src/app/api/auth/[...nextauth]/route.ts`)

**Enhanced Credentials Provider:**
- Now accepts: `email`, `password`, `firebaseUid` (optional)
- If `firebaseUid` provided: validates against agent.firebaseUid
- If `password` provided: compares bcryptjs hash (existing flow)
- Supports both authentication methods simultaneously

### 6. Database Schema Updates (`prisma/schema.prisma`)

Added to Agent model:
```prisma
// Firebase authentication
firebaseUid   String?    @unique

// Banking details (for future withdrawals)
phoneNumber   String     @default("")
bankName      String     @default("")
accountNumber String     @default("")
accountName   String     @default("")
```

## User Flows

### Firebase Login Flow

```
Login Page
  ↓
[Email/Password Input] + [Sign In with DataSell.Store Button]
  ↓
Firebase Auth (datasell-7b993)
  ├─ Validates email/password
  └─ Returns Firebase user object
       ↓
/api/auth/firebase-sync
  ├─ Checks if agent exists in Prisma
  ├─ If new: Creates agent with auto-generated slug
  └─ If exists: Updates firebaseUid
       ↓
NextAuth Session Created (JWT)
  ↓
/dashboard (Protected route)
```

### Firebase Registration Flow

```
Register Page
  ↓
[Personal Details + Sign Up with DataSell.Store Button]
  ↓
Firebase Auth (datasell-7b993)
  ├─ Creates user with email + password
  └─ Updates profile displayName = businessName
       ↓
/api/auth/firebase-sync
  ├─ Creates new agent in Prisma
  ├─ Auto-generates slug from businessName + timestamp
  └─ Sets status = PENDING
       ↓
/pending?agentId=...
  ↓
[Pay GH₵20 activation fee]
  ↓
/dashboard (After activation)
```

## Security Considerations

1. **Firebase API Key is Public** (marked `NEXT_PUBLIC_`)
   - Contains no secrets (designed for client-side use)
   - Project ID, auth domain are public
   - Only read-only operations can be performed without auth

2. **Password Hashing**
   - Email/password flow still uses bcryptjs (12 salt rounds)
   - Firebase flow uses Firebase's built-in security

3. **Session Management**
   - 30-day JWT session timeout
   - httpOnly cookies prevent XSS access
   - Token includes agent status and slug

4. **Unique Constraints**
   - Email unique (can't double-register)
   - firebaseUid unique (one Firebase → one agent)
   - Slug unique (personalized shop links)

## Testing the Integration

### Prerequisites
```bash
# Environment variables must be set in .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC0-m1kyRi7UlCoT1bpeWU05ue4lYwudfg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=datasell-7b993.firebaseapp.com
# ... other 6 variables
```

### Test Flow 1: Register with Firebase
1. Navigate to `/register`
2. Fill in:
   - Email: `test@example.com` (from datasell.store)
   - Password: `TestPassword123`
   - Business Name: `Test Business`
3. Click "Sign Up with DataSell.Store"
4. Should redirect to `/pending?agentId=...`
5. Check Prisma:
   - New Agent created
   - slug = "test-business-xxxxx"
   - firebaseUid = Firebase UID
   - status = PENDING

### Test Flow 2: Login with Firebase
1. Register an agent first (as above)
2. Navigate to `/login`
3. Enter email and password
4. Click "Sign In with DataSell.Store"
5. Should redirect to `/dashboard`
6. Session should be active

### Test Flow 3: Email/Password Still Works
1. Register via email/password form (not Firebase button)
2. Login via email/password form
3. Should work without Firebase (original flow)

## API Routes Affected

| Route | Change | Status |
|-------|--------|--------|
| POST `/api/auth/firebase-sync` | NEW | ✅ Created |
| POST `/api/auth/register` | No change | ✅ Working |
| POST `/api/auth/[...nextauth]` | Enhanced | ✅ Updated |
| GET `/api/agent/profile` | No change | ✅ Working |
| POST `/api/orders/checkout` | No change | ✅ Working |

## Packages Added

- `firebase` (^10.7.0) - Firebase SDK
- `firebase-admin` (^12.0.0) - Firebase Admin SDK (for server-side if needed)

## What's Still TODO

1. **Manual User Sync** (Optional)
   - Add script to sync existing datasell.store users
   - Update agent records with corresponding Firebase UIDs

2. **Password Reset** (Optional)
   - Implement `/api/auth/reset-password` route
   - Send reset links via email
   - Redirect to password reset page

3. **Profile Picture** (Optional)
   - Fetch from Firebase user.photoURL
   - Store in agent.logo

4. **Account Linking** (Advanced)
   - Allow existing BuyData agents to link their Firebase account
   - Merge local auth with Firebase auth

## Troubleshooting

### "No DataSell.Store account found"
- User doesn't exist in datasell-7b993 Firebase project
- Solution: Register first on datasell.store

### "Email already registered"
- Email exists in both BuyData and DataSell Firebase
- Solution: Use different email or reset password

### "Sign in failed" with blank button
- Firebase credentials not loaded (check .env.local)
- Network issue connecting to Firebase
- Check browser console for detailed error

### Agent not created after Firebase signup
- Check `/api/auth/firebase-sync` route for 500 error
- Verify Prisma is connected
- Check database for duplicate email

## Reference

- Firebase Project: **datasell-7b993**
- Firebase Auth Domain: **datasell-7b993.firebaseapp.com**
- Shared Credentials: All agents authenticate against same Firebase project
- Database: PostgreSQL with Prisma ORM
- Session: JWT with 30-day expiration
