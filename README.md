# PeerTutor - Mobile Social Learning Platform

A React Native app built with Expo that connects students as peers/tutors for collaborative learning.

## Tech Stack

- **React Native** with Expo managed workflow
- **TypeScript** for type safety
- **Expo Router** for file-based navigation
- **NativeWind** (Tailwind CSS for React Native)
- **Firebase** for backend (Auth, Firestore, Storage, FCM)
- **Zustand** for state management
- **React Query** for server state caching
- **Lucide React Native** for icons

## Project Structure

```
/app            # Expo Router pages
/src
  /services     # Firebase services (auth, db, storage, matching)
  /store        # Zustand stores
  /types        # TypeScript type definitions
  /utils        # Helper utilities
  /config       # Configuration files
/components     # Reusable UI components
/assets         # Images, fonts, and static assets
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open Expo Go app on your phone and scan the QR code, or press 'w' for web preview

## Development Notes

- Uses NativeWind for styling (Tailwind CSS classes)
- Firebase configuration will be added in next phase
- Authentication and matching system to be implemented
- Following the comprehensive design document in peer_tutor_mobile_app_codex_v_0(1).md

## Current Status

✅ Project setup with Expo + TypeScript
✅ NativeWind configuration
✅ Basic project structure
✅ Core type definitions
✅ Zustand store setup
✅ Complete Firebase integration
✅ Authentication system
✅ User registration and login flows
✅ Profile management
✅ Smart peer matching system
✅ Real-time user discovery
✅ Chat/messaging foundation

🎉 **Ready for development and testing!**
