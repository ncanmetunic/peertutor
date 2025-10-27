// Core types for PeerTutor app

export interface User {
  uid: string;
  username: string;
  displayName: string;
  email: string;
  photoURL?: string;
  age?: number;
  university?: string;
  department?: string;
  city?: string;
  bio?: string;
  experience?: string;
  skills: string[]; // max 5
  needs: string[];  // max 5
  visibility: {
    profilePublic: boolean;
    showUniversity: boolean;
    showCity: boolean;
  };
  flags: {
    isBanned: boolean;
    isVerified: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface MatchSuggestion {
  uid: string;
  score: number;
  commonTopics: string[];
  lastComputedAt: Date;
}

export interface PeerRequest {
  id: string;
  fromUid: string;
  toUid: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Match {
  id: string;
  uids: [string, string];
  startedAt: Date;
  lastActivityAt: Date;
}

export interface Conversation {
  id: string; // same as matchId
  lastMessage?: string;
  lastSenderUid?: string;
  unread: Record<string, number>;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderUid: string;
  type: 'text' | 'image' | 'file';
  text?: string;
  fileURL?: string;
  thumbURL?: string;
  deletedBy?: string[];
  sentAt: Date;
}

export interface SkillsData {
  items: string[];
  locale: 'en' | 'tr';
}

export interface Report {
  id: string;
  reporterUid: string;
  targetUid: string;
  type: string;
  note?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: Date;
}

export interface Block {
  targetUid: string;
  since: Date;
}