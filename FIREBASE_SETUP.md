# Firebase Setup Guide for CodeFlow

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `codeflow` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Register Your Web App

1. In your Firebase project, click the **Web icon** (`</>`) to add a web app
2. Enter app nickname: `CodeFlow Web`
3. **Check** "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. Copy the Firebase configuration object

## Step 3: Enable Authentication Methods

1. In Firebase Console, go to **Build** > **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab

### Enable Email/Password:
- Click on "Email/Password"
- Toggle **Enable**
- Click "Save"

### Enable Google Sign-In:
- Click on "Google"
- Toggle **Enable**
- Enter project support email
- Click "Save"

## Step 4: Configure Firebase in Your Project

1. Open `.env` file in your project root
2. Replace the Firebase configuration values with your actual credentials:

```env
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abc123"
```

**Where to find these values:**
- Firebase Console > Project Settings > General
- Scroll down to "Your apps" section
- Click on your web app
- Copy the config values

## Step 5: Set Up Firestore Database (for snippets)

1. In Firebase Console, go to **Build** > **Firestore Database**
2. Click "Create database"
3. Choose **Start in production mode** (we'll add rules later)
4. Select a location (choose closest to your users)
5. Click "Enable"

### Add Security Rules:

Go to the **Rules** tab and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Snippets collection
    match /snippets/{snippetId} {
      // Allow read if public or owned by user
      allow read: if resource.data.visibility == 'public' 
                  || resource.data.userId == request.auth.uid;
      
      // Allow create if authenticated
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid;
      
      // Allow update/delete only if owner
      allow update, delete: if request.auth != null 
                             && resource.data.userId == request.auth.uid;
    }
    
    // User profiles collection (optional for future)
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Click "Publish"

## Step 6: Configure Authorized Domains

1. Go to **Authentication** > **Settings** > **Authorized domains**
2. Add your domains:
   - `localhost` (already added by default)
   - Your production domain (e.g., `codeflow.app`)
   - Your Lovable domain if using Lovable

## Step 7: Test Your Setup

1. Run your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173/signup`
3. Try creating an account
4. Try logging in
5. Try Google sign-in

## Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"
- Add your domain to Authorized domains in Firebase Console
- Make sure you're using the correct domain (check the error message)

### "Firebase: Error (auth/api-key-not-valid)"
- Double-check your API key in `.env`
- Make sure there are no extra spaces or quotes
- Restart your dev server after changing `.env`

### Google Sign-In Not Working
- Ensure Google provider is enabled in Firebase Console
- Check that you've added a support email
- Verify authorized domains include your current domain

### "Firebase: Error (auth/operation-not-allowed)"
- Make sure Email/Password authentication is enabled
- Check that the authentication method is properly configured

## Next Steps

After Firebase is set up, you can:

1. **Migrate snippets to Firestore** - Update `src/lib/snippets.ts` to use Firestore instead of Supabase
2. **Add user profiles** - Store additional user data in Firestore
3. **Implement snippet sharing** - Use Firestore security rules for public snippets
4. **Add social features** - Likes, comments, follows using Firestore

## Firebase vs Supabase

Currently, the project uses:
- **Firebase**: Authentication (login/signup)
- **Supabase**: Code execution (Edge Functions) and snippets storage

You can either:
1. Keep both (hybrid approach)
2. Fully migrate to Firebase (requires migrating snippets to Firestore and code execution to Firebase Functions)
3. Fully migrate to Supabase (requires updating auth to use Supabase Auth)

For this implementation, we're using **Firebase for Auth** and keeping **Supabase for code execution** (best of both worlds).
