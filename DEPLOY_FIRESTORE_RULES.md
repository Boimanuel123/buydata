# Deploy Firestore Security Rules

Follow these steps to deploy the Firestore security rules:

## Option 1: Using Firebase CLI (Recommended)

### Step 1: Install Firebase CLI
If not already installed:
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Initialize Firebase Project (if not done)
```bash
firebase init firestore
```
When prompted, select your **buydata-60e43** project.

### Step 4: Deploy Rules
```bash
firebase deploy --only firestore:rules
```

---

## Option 2: Manual Deployment via Firebase Console

### Step 1: Open Firebase Console
Go to: https://console.firebase.google.com/

### Step 2: Select Your Project
Select **buydata-60e43** project

### Step 3: Navigate to Firestore
- Click **Firestore Database** in the left sidebar
- Click the **Rules** tab at the top

### Step 4: Replace Rules
- Copy the entire content from `firestore.rules` file in your project
- Paste it into the Firebase Console Rules editor
- Click **Publish**

---

## What These Rules Allow

✅ **Anyone can read:**
- Public shop data (agents with status "ACTIVATED")
- Packages (public data)

✅ **Authenticated users can:**
- Create their own agent profile during registration
- Read their own profile
- Update their own profile
- Create orders
- Read their own orders

✅ **Denies:**
- Anonymous writes
- Users accessing other users' private data
- Unauthorized deletions

---

## Verify Rules Are Deployed

After deploying:
1. Go back to your app at `http://localhost:3000`
2. Try the registration again with:
   - Email: buydataghana@gmail.com
   - Password: Bulletman123123@
3. ✅ Registration should now work!

---

## Troubleshooting

If you still get "Missing or insufficient permissions":

1. **Clear browser cache** - Hard refresh (Ctrl+Shift+Delete)
2. **Check Firebase Console** - Verify rules are published
3. **Check browser console** - Look for specific Firestore errors
4. **Verify project ID** - Make sure you deployed to the correct project (buydata-60e43)

---

## Security Rules Explanation

```
agents/{agentId}
├── CREATE: allowed if user is authenticated and UID matches
├── READ: allowed if user owns the document OR it's a public shop
├── UPDATE: allowed if user owns the document
└── DELETE: allowed if user owns the document

packages/{packageId}
├── READ: allowed for everyone (public data)
└── WRITE: disabled (only admins can add packages)

orders/{orderId}
├── CREATE: allowed if authenticated
├── READ: allowed if user is the agent or customer
└── UPDATE: allowed if user is the agent
```
