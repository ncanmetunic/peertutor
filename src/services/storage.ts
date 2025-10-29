import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, StorageReference } from 'firebase/storage';
import app from '../config/firebase';

export class StorageService {
  private storage = getStorage(app);

  async uploadProfilePicture(userId: string, imageUri: string): Promise<string> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const storageRef = ref(this.storage, `profile-pictures/${userId}/${Date.now()}.jpg`);
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw new Error('Failed to upload profile picture');
    }
  }

  async uploadChatImage(conversationId: string, imageUri: string): Promise<string> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const storageRef = ref(this.storage, `chat-images/${conversationId}/${Date.now()}.jpg`);
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading chat image:', error);
      throw new Error('Failed to upload image');
    }
  }

  async uploadDocument(userId: string, documentUri: string, fileName: string): Promise<string> {
    try {
      const response = await fetch(documentUri);
      const blob = await response.blob();
      
      const storageRef = ref(this.storage, `documents/${userId}/${Date.now()}_${fileName}`);
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw new Error('Failed to upload document');
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, fileUrl);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  getFileReference(path: string): StorageReference {
    return ref(this.storage, path);
  }
}

export const storageService = new StorageService();