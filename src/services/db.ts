import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, PeerRequest, Match, Conversation, Message, SkillsData } from '../types';

export class DatabaseService {
  // Users collection operations
  static async getUser(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() ? userDoc.data() as User : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  static async updateUser(uid: string, data: Partial<User>) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...data,
        updatedAt: new Date()
      });
    } catch (error) {
      throw error;
    }
  }

  // Skills operations
  static async getSkills(locale: 'en' | 'tr' = 'en'): Promise<string[]> {
    try {
      const skillsDoc = await getDoc(doc(db, 'skills', locale));
      if (skillsDoc.exists()) {
        const data = skillsDoc.data() as SkillsData;
        return data.items || [];
      }
      return [];
    } catch (error) {
      console.error('Error getting skills:', error);
      return [];
    }
  }

  // Peer requests operations
  static async sendPeerRequest(fromUid: string, toUid: string, message?: string): Promise<string> {
    try {
      const requestData: Omit<PeerRequest, 'id'> = {
        fromUid,
        toUid,
        status: 'pending',
        message,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const requestRef = doc(collection(db, 'requests'));
      await setDoc(requestRef, requestData);
      return requestRef.id;
    } catch (error) {
      throw error;
    }
  }

  static async updateRequestStatus(requestId: string, status: PeerRequest['status']) {
    try {
      await updateDoc(doc(db, 'requests', requestId), {
        status,
        updatedAt: new Date()
      });

      // If accepted, create a match
      if (status === 'accepted') {
        const requestDoc = await getDoc(doc(db, 'requests', requestId));
        if (requestDoc.exists()) {
          const request = requestDoc.data() as PeerRequest;
          await this.createMatch(request.fromUid, request.toUid);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  static async getUserRequests(uid: string, type: 'sent' | 'received'): Promise<PeerRequest[]> {
    try {
      const field = type === 'sent' ? 'fromUid' : 'toUid';
      const q = query(
        collection(db, 'requests'),
        where(field, '==', uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PeerRequest));
    } catch (error) {
      console.error('Error getting user requests:', error);
      return [];
    }
  }

  // Matches operations
  static async createMatch(uid1: string, uid2: string): Promise<string> {
    try {
      // Create deterministic match ID
      const matchId = [uid1, uid2].sort().join('_');
      
      const matchData: Omit<Match, 'id'> = {
        uids: [uid1, uid2] as [string, string],
        startedAt: new Date(),
        lastActivityAt: new Date()
      };

      await setDoc(doc(db, 'matches', matchId), matchData);

      // Create conversation
      const conversationData: Omit<Conversation, 'id'> = {
        unread: { [uid1]: 0, [uid2]: 0 },
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'conversations', matchId), conversationData);

      return matchId;
    } catch (error) {
      throw error;
    }
  }

  static async getUserMatches(uid: string): Promise<Match[]> {
    try {
      const q = query(
        collection(db, 'matches'),
        where('uids', 'array-contains', uid),
        orderBy('lastActivityAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
    } catch (error) {
      console.error('Error getting user matches:', error);
      return [];
    }
  }

  // Messages operations
  static async sendMessage(
    conversationId: string, 
    senderUid: string, 
    type: Message['type'], 
    content: { text?: string; fileURL?: string; thumbURL?: string }
  ): Promise<string> {
    try {
      const messageData: Omit<Message, 'id'> = {
        conversationId,
        senderUid,
        type,
        text: content.text,
        fileURL: content.fileURL,
        thumbURL: content.thumbURL,
        deletedBy: [],
        sentAt: new Date()
      };

      const messageRef = doc(collection(db, 'conversations', conversationId, 'messages'));
      await setDoc(messageRef, messageData);

      // Update conversation last message
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: content.text || `${type} message`,
        lastSenderUid: senderUid,
        updatedAt: new Date()
      });

      return messageRef.id;
    } catch (error) {
      throw error;
    }
  }

  static subscribeToMessages(
    conversationId: string, 
    callback: (messages: Message[]) => void
  ) {
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('sentAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      callback(messages);
    });
  }

  // Discover users
  static async discoverUsers(
    currentUid: string, 
    filters?: {
      skills?: string[];
      university?: string;
      city?: string;
    }
  ): Promise<User[]> {
    try {
      let q = query(
        collection(db, 'users'),
        where('visibility.profilePublic', '==', true),
        limit(20)
      );

      // Apply filters if provided
      if (filters?.university) {
        q = query(q, where('university', '==', filters.university));
      }
      if (filters?.city) {
        q = query(q, where('city', '==', filters.city));
      }

      const snapshot = await getDocs(q);
      const users = snapshot.docs
        .map(doc => doc.data() as User)
        .filter(user => user.uid !== currentUid); // Exclude current user

      // Filter by skills on client side (Firestore doesn't support array-contains-any with other filters)
      if (filters?.skills && filters.skills.length > 0) {
        return users.filter(user => 
          user.skills.some(skill => filters.skills!.includes(skill)) ||
          user.needs.some(need => filters.skills!.includes(need))
        );
      }

      return users;
    } catch (error) {
      console.error('Error discovering users:', error);
      return [];
    }
  }

  // Block user
  static async blockUser(blockerUid: string, targetUid: string) {
    try {
      await setDoc(doc(db, 'blocks', blockerUid, 'list', targetUid), {
        targetUid,
        since: new Date()
      });
    } catch (error) {
      throw error;
    }
  }

  // Report user
  static async reportUser(
    reporterUid: string, 
    targetUid: string, 
    type: string, 
    note?: string
  ) {
    try {
      const reportData = {
        reporterUid,
        targetUid,
        type,
        note,
        status: 'pending',
        createdAt: new Date()
      };

      const reportRef = doc(collection(db, 'reports'));
      await setDoc(reportRef, reportData);
      return reportRef.id;
    } catch (error) {
      throw error;
    }
  }
}