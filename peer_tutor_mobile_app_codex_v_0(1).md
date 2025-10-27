# PeerTutor — Mobile App Codex (v0.1)

_Last updated: 20 Oct 2025_

## 0) Vision & Scope
- **Goal:** A mobile‑first social learning platform where students match as peers/tutors via shared skills/needs and collaborate via chat.
- **Platforms:** iOS & Android (single codebase).
- **Out of scope (for MVP):** Voice rooms, video calls, advanced moderation dashboards, web app.

## 1) Core User Stories (MVP)
- As a new user, I can sign up with email/Google/Apple and verify my account.
- I can create a profile (username, age, university, department, city, short bio, experience).
- I can select up to **5 Skills** and **5 Needs** from a curated list (editable later by admins).
- I see **real‑time match suggestions** with a visible **match score** and **common topics**.
- I can **send a peer request**; the other side can accept/decline.
- Once accepted, we **unlock chat** with text + image/file sharing.
- I can **Discover** users outside my matches with filters (topic, university, city).
- I receive **push notifications** for requests, accepts, and new messages.
- I can manage **Privacy** (who sees what), **Theme**, and **Security** (password reset, 2‑step later).

## 2) Feature Map
- **Onboarding & Auth**: Email/Password, Google, Apple; Terms/Privacy consent; profile setup wizard.
- **Profile**: Edit profile, avatar upload, skills/needs picker, visibility controls.
- **Matching**: Real‑time suggestions, scoring, common topics, send/receive requests.
- **Requests**: Inbox of pending/accepted; accept/decline; block/report.
- **Chat**: 1:1 messaging, read receipts, attachments (images/docs), delete own message.
- **Discover**: Filtered exploration; quick view; send request from card.
- **Notifications**: FCM push; in‑app notification center.
- **Settings**: Account, privacy, theme (light/dark/system), security.
- **Admin (basic in‑app)**: Toggle skill list items (for now seeded in Firestore), emergency broadcast (later).

## 3) Tech Stack & Architecture
- **Framework:** React Native (Expo managed workflow).
- **Backend:** Firebase (Auth, Firestore, Storage, Cloud Functions, FCM).
- **State:** React Query + Zustand (server cache + local ui state) or Redux Toolkit (alternative).
- **Routing:** Expo Router.
- **Media:** Expo ImagePicker, Firebase Storage; image compression on‑device.
- **Analytics & Crash:** Firebase Analytics + Crashlytics.
- **CI/CD:** EAS Build & Submit, release channels, OTA updates (Expo Updates).
- **Testing:** Jest + React Native Testing Library, Detox (E2E later).
- **Design System:** Tailwind (Nativewind) + shadcn/ui‑inspired primitives (RN variants) + Lucide icons.

### High‑Level Diagram
```text
[React Native App]
  ├─ Screens (Onboarding, Profile, Matching, Requests, Chat, Discover, Settings)
  ├─ UI Kit (Buttons, Cards, Avatars, Chips, TagPickers)
  ├─ State (Zustand/RTK) + React Query
  └─ Services
       ├─ auth.ts  -> Firebase Auth
       ├─ db.ts    -> Firestore (queries)
       ├─ storage.ts -> Firebase Storage
       ├─ notify.ts -> FCM
       └─ match.ts -> Matching logic

[Firebase]
  ├─ Auth
  ├─ Firestore
  ├─ Storage
  ├─ Cloud Functions (matching, notifications, moderation hooks)
  └─ FCM
```

## 4) Data Model (Firestore — v0.1)
**Collections & example fields** (all documents include `createdAt`, `updatedAt`, `ownerUid` when applicable):

- `users/{uid}`
  - `username`, `displayName`, `email`, `photoURL`
  - `age`, `university`, `department`, `city`
  - `bio`, `experience`
  - `skills: string[<=5]`, `needs: string[<=5]`
  - `visibility: { profilePublic: boolean, showUniversity: boolean, showCity: boolean }`
  - `flags: { isBanned: boolean, isVerified: boolean }`

- `matchSuggestions/{uid}/items/{uidB}` (cached suggestions)
  - `score: number`, `commonTopics: string[]`, `lastComputedAt`

- `requests/{requestId}`
  - `fromUid`, `toUid`, `status: 'pending'|'accepted'|'declined'|'blocked'`, `message?`

- `matches/{matchId}` (created on acceptance, deterministic id from UIDs)
  - `uids: [uidA, uidB]`, `startedAt`, `lastActivityAt`

- `conversations/{matchId}`
  - `lastMessage`, `lastSenderUid`, `unread: { [uid]: number }`

- `conversations/{matchId}/messages/{messageId}`
  - `senderUid`, `type: 'text'|'image'|'file'`, `text?`, `fileURL?`, `thumbURL?`, `deletedBy?: uid[]`, `sentAt`

- `skills` (static list for now)
  - `items: string[]`, `locale: 'en'|'tr'`

- `reports/{reportId}`
  - `reporterUid`, `targetUid`, `type`, `note`, `status`

- `blocks/{uid}/list/{targetUid}`
  - `since`

## 5) Matching Logic (v0.1)
- **Base score** = |intersection(user.skills, other.needs)| × w1 + |intersection(user.needs, other.skills)| × w2.
- **Bonuses:** same university/city (+w3/w4), common hobbies (later), profile completeness bonus.
- **Decay:** Recent activity boosts; stale accounts decay.
- **Refresh:** Recompute on profile edits and daily via Cloud Function (scheduled).

## 6) Security & Privacy
- **Auth:** Firebase Auth; email verification required.
- **Rules:** Firestore security rules
  - Users can read public profiles; write only to own doc.
  - Requests: `fromUid == auth.uid`; target can update status.
  - Conversations: read/write only if `auth.uid` ∈ `match.uids`.
  - Attachments: Storage paths namespaced by `uid` and rule‑guarded.
- **Moderation:** Report + block; auto‑mutual hide; abuse rate limiting in Functions.
- **Data retention:** Soft delete for messages (hide per‑user), hard delete on report resolution if necessary.

## 7) Navigation Structure (Expo Router)
- `(auth)/` login, register, forgot, verify
- `(onboarding)/` profile‑wizard, skills‑needs‑picker
- `(tabs)/`
  - `home/` (Matches feed)
  - `discover/` (search + filters)
  - `requests/` (incoming/outgoing)
  - `chat/` (inbox)
  - `profile/` (me)

## 8) UX Notes
- Crisp cards with avatars, pill chips for skills/needs, prominent **Match Score** badge.
- One‑hand use: primary CTAs bottom‑aligned.
- Empty states with friendly guidance and quick actions.
- Accessibility: dynamic font sizes, sufficient touch targets, VoiceOver labels.
- Locales: EN (default), TR (phase 2, via i18n).

## 9) Notifications (FCM)
- **Types:** peer_request_received, request_accepted, new_message.
- Foreground: in‑app banners; background: push.
- Token management: store on `users/{uid}.fcmTokens` array; revoke on logout.

## 10) Analytics / KPIs
- Activation funnel, profile completeness, request send/accept rates, time‑to‑first‑match, DAU/WAU/MAU, message sends per user, retention D1/D7/D30.

## 11) Delivery Plan & Milestones
### Phase A — MVP (4–6 weeks equivalent)
1. Project scaffold (Expo, Router, Nativewind, theming, icons)
2. Auth + Onboarding wizard
3. Profile edit + avatar upload
4. Skills/Needs picker (with static `skills` collection)
5. Matching service (client first, then CF cache)
6. Requests flow
7. Chat (text + images + read receipts)
8. Notifications (request/message)
9. Discover with filters
10. Settings (privacy/theme/security minimal)
11. Firestore rules v1; basic reporting/blocking
12. QA + TestFlight/Closed testing

### Phase B — v1.1 Enhancements
- Server‑side scoring + daily refresh (CF)
- Message deletion (per‑user hide already in MVP) + attachments doc preview
- Rate limiting (CF) and anti‑spam heuristics
- Admin skill list editor (internal tool)
- Localization (TR)

### Phase C — v1.2 (Nice‑to‑have)
- Video call (WebRTC), presence indicators, typing status
- Smart recommendations in Discover, advanced filters
- In‑chat quick actions (share contact, schedule study)

## 12) Tasks → GitHub Issues Backlog (import‑ready)
- **Project**
  - [ ] Initialize Expo app (managed) with TypeScript
  - [ ] Setup Expo Router + Nativewind + vector‑icons
  - [ ] Theme provider (light/dark/system)
  - [ ] Global error/toast system
- **Auth & Onboarding**
  - [ ] Firebase config + Auth providers (Email, Google, Apple)
  - [ ] Email verification screen + resend
  - [ ] Onboarding wizard (3 steps: Profile → Skills/Needs → Review)
- **Profile**
  - [ ] Profile screen (view/edit)
  - [ ] Avatar upload + compression + Storage rules
- **Skills/Needs**
  - [ ] Fetch skills list; multi‑select up to 5 each with chips
- **Matching**
  - [ ] Client‑side scoring util + React Query hooks
  - [ ] CF: scheduled recompute + cache collection
- **Requests**
  - [ ] Request send/accept/decline + blocking
  - [ ] Requests inbox UI
- **Chat**
  - [ ] Conversations list with last message & unread badge
  - [ ] Message screen (text, image/file, read receipts)
  - [ ] Firestore rules for conversations/messages
- **Discover**
  - [ ] Filter UI (topic/university/city); paginated list
- **Notifications**
  - [ ] FCM token handling
  - [ ] Push handlers (foreground/background)
- **Settings**
  - [ ] Privacy toggles
  - [ ] Security (password reset)
- **Moderation & Safety**
  - [ ] Report user flow
  - [ ] Block user flow
- **DevEx & Release**
  - [ ] ESLint/Prettier/Husky
  - [ ] Jest unit tests baseline
  - [ ] EAS build profiles (dev, preview, prod)
  - [ ] App Store/Play Store metadata drafts

## 13) Firestore Rules Sketch (v0.1)
```ts
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }

    match /users/{uid} {
      allow read: if true; // restrict fields in app layer
      allow write: if signedIn() && request.auth.uid == uid;
    }

    match /requests/{requestId} {
      allow create: if signedIn() && request.resource.data.fromUid == request.auth.uid;
      allow update, read: if signedIn() && (
        resource.data.fromUid == request.auth.uid || resource.data.toUid == request.auth.uid
      );
    }

    match /matches/{matchId} {
      allow read, write: if signedIn() && (request.auth.uid in resource.data.uids);
    }

    match /conversations/{matchId} {
      allow read, write: if signedIn() && (request.auth.uid in resource.data.uids);
      match /messages/{messageId} {
        allow read, write: if signedIn() && (request.auth.uid in get(/databases/$(database)/documents/conversations/$(matchId)).data.uids);
      }
    }

    match /skills/{doc} {
      allow read: if true;
      allow write: if false; // edited via admin only (later)
    }
  }
}
```

## 14) Storage Rules Sketch (v0.1)
```ts
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function signedIn() { return request.auth != null; }

    match /users/{uid}/uploads/{fileId} {
      allow read: if signedIn();
      allow write: if signedIn() && request.auth.uid == uid;
    }
  }
}
```

## 15) Design System Notes
- Typography scale and spacing consistent; rounded‑2xl cards, soft shadows, grid‑based lists.
- Components: Button, Card, Chip, Avatar, Badge, Input, Select, Sheet/Bottom drawer.
- Motion: subtle transitions on navigation and list item mount.

## 16) Risks & Mitigations
- **Spam/abuse:** Rate limits, report/block, progressive disclosure of contact info.
- **Privacy:** Opt‑in profile fields; clear controls.
- **Scalability:** Use composite indexes; avoid hot documents; paginate lists.
- **Vendor lock‑in:** Abstract services (auth/db/storage) behind interfaces.

## 17) Definition of Done (MVP)
- All MVP user stories testable end‑to‑end
- Firestore rules audited; basic E2E tests pass
- App builds on EAS for iOS/Android; distributed to testers
- Crash‑free sessions > 99%; core funnel tracked in Analytics

---
**Next step suggestion:** Create the Expo project scaffold and push the issue backlog to GitHub. If you want, I can convert Section 12 into GitHub Issues JSON for direct import.

