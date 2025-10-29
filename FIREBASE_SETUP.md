# Firebase Setup Guide for PeerTutor

## 1. Create a New Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name your project: `peertutor-[environment]` (e.g., `peertutor-dev`, `peertutor-prod`)
4. Enable Google Analytics (optional but recommended)
5. Create the project

## 2. Enable Authentication

1. In Firebase Console, go to **Authentication > Sign-in method**
2. Enable the following providers:
   - **Email/Password** (required)
   - **Google** (optional but recommended)
   - **Apple** (for iOS, optional)

## 3. Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Start in **test mode** initially
4. Choose a location (preferably close to your users)
5. After creation, deploy the security rules:

```bash
firebase deploy --only firestore:rules
```

## 4. Set up Firebase Storage

1. Go to **Storage**
2. Click "Get started"
3. Start in **test mode** initially
4. Choose the same location as Firestore
5. Deploy the security rules:

```bash
firebase deploy --only storage
```

## 5. Configure Firebase SDK

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select the web icon `</>`
4. Register your app with a nickname: `PeerTutor Mobile`
5. Copy the Firebase configuration object

## 6. Update App Configuration

Replace the placeholder config in `src/config/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## 7. Initialize Firestore Collections

Run these commands in the Firebase Console to create initial collections:

### Skills Collection
```javascript
// In Firestore Console, create collection 'skills'
// Document ID: 'en'
{
  items: [
    "JavaScript", "Python", "React", "Mathematics", "Physics", 
    "Chemistry", "Biology", "English", "Turkish", "Marketing",
    // ... add all skills from skillsDatabase.ts
  ],
  locale: "en",
  updatedAt: new Date()
}
```

## 8. Set up Cloud Functions (Optional for MVP)

1. Initialize Functions:
```bash
firebase init functions
```

2. Install dependencies and deploy:
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

## 9. Enable Cloud Messaging (for Push Notifications)

1. Go to **Project Settings > Cloud Messaging**
2. Generate a Web Push certificate
3. Add the configuration to your app

## 10. Security Rules Deployment

Make sure to deploy the production-ready security rules:

```bash
# Deploy all rules
firebase deploy --only firestore:rules,storage

# Or deploy individually
firebase deploy --only firestore:rules
firebase deploy --only storage
```

## 11. Environment Configuration

For multiple environments (dev, staging, prod), create separate Firebase projects:

- `peertutor-dev` (development)
- `peertutor-staging` (testing)
- `peertutor-prod` (production)

Use different config files or environment variables to switch between them.

## 12. Monitoring and Analytics

1. Enable **Crashlytics** for error reporting
2. Set up **Performance Monitoring**
3. Configure **Analytics** events for user tracking

## 13. Testing the Setup

After configuration, test the following:

1. **Authentication**: Register and login
2. **Firestore**: Save user profile data
3. **Storage**: Upload profile picture
4. **Security**: Verify rules work correctly

## Important Notes

- **Never commit** your actual Firebase config with real API keys to version control
- Use environment variables or secure configuration management
- Start with test mode for rules, then deploy production rules
- Monitor usage and costs in Firebase Console
- Set up billing alerts to avoid unexpected charges

## Production Checklist

- [ ] Real Firebase project created
- [ ] Authentication providers configured
- [ ] Firestore database created with production rules
- [ ] Storage bucket configured with production rules
- [ ] App configuration updated
- [ ] Initial collections created
- [ ] Security rules tested
- [ ] Monitoring enabled
- [ ] Backup strategy planned