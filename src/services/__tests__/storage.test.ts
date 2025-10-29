import { StorageService } from '../storage';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Mock Firebase Storage functions
jest.mock('firebase/storage');

const mockedGetStorage = getStorage as jest.MockedFunction<typeof getStorage>;
const mockedRef = ref as jest.MockedFunction<typeof ref>;
const mockedUploadBytes = uploadBytes as jest.MockedFunction<typeof uploadBytes>;
const mockedGetDownloadURL = getDownloadURL as jest.MockedFunction<typeof getDownloadURL>;
const mockedDeleteObject = deleteObject as jest.MockedFunction<typeof deleteObject>;

// Mock global fetch
global.fetch = jest.fn();

describe('StorageService', () => {
  let storageService: StorageService;
  const mockStorage = {};
  const mockStorageRef = {};

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetStorage.mockReturnValue(mockStorage as any);
    mockedRef.mockReturnValue(mockStorageRef as any);
    storageService = new StorageService();
  });

  describe('uploadProfilePicture', () => {
    it('should upload profile picture successfully', async () => {
      const mockBlob = new Blob(['fake image data'], { type: 'image/jpeg' });
      const mockSnapshot = { ref: mockStorageRef };
      const mockDownloadURL = 'https://storage.googleapis.com/test/profile.jpg';

      (global.fetch as jest.Mock).mockResolvedValue({
        blob: () => Promise.resolve(mockBlob),
      });
      
      mockedUploadBytes.mockResolvedValue(mockSnapshot as any);
      mockedGetDownloadURL.mockResolvedValue(mockDownloadURL);

      const result = await storageService.uploadProfilePicture('user123', 'file://path/to/image.jpg');

      expect(global.fetch).toHaveBeenCalledWith('file://path/to/image.jpg');
      expect(mockedRef).toHaveBeenCalledWith(
        mockStorage,
        expect.stringMatching(/^profile-pictures\/user123\/\d+\.jpg$/)
      );
      expect(mockedUploadBytes).toHaveBeenCalledWith(mockStorageRef, mockBlob);
      expect(mockedGetDownloadURL).toHaveBeenCalledWith(mockStorageRef);
      expect(result).toBe(mockDownloadURL);
    });

    it('should throw error when fetch fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

      await expect(
        storageService.uploadProfilePicture('user123', 'file://path/to/image.jpg')
      ).rejects.toThrow('Failed to upload profile picture');
    });

    it('should throw error when upload fails', async () => {
      const mockBlob = new Blob(['fake image data'], { type: 'image/jpeg' });
      
      (global.fetch as jest.Mock).mockResolvedValue({
        blob: () => Promise.resolve(mockBlob),
      });
      
      mockedUploadBytes.mockRejectedValue(new Error('Upload failed'));

      await expect(
        storageService.uploadProfilePicture('user123', 'file://path/to/image.jpg')
      ).rejects.toThrow('Failed to upload profile picture');
    });
  });

  describe('uploadChatImage', () => {
    it('should upload chat image successfully', async () => {
      const mockBlob = new Blob(['fake image data'], { type: 'image/jpeg' });
      const mockSnapshot = { ref: mockStorageRef };
      const mockDownloadURL = 'https://storage.googleapis.com/test/chat.jpg';

      (global.fetch as jest.Mock).mockResolvedValue({
        blob: () => Promise.resolve(mockBlob),
      });
      
      mockedUploadBytes.mockResolvedValue(mockSnapshot as any);
      mockedGetDownloadURL.mockResolvedValue(mockDownloadURL);

      const result = await storageService.uploadChatImage('conv123', 'file://path/to/image.jpg');

      expect(global.fetch).toHaveBeenCalledWith('file://path/to/image.jpg');
      expect(mockedRef).toHaveBeenCalledWith(
        mockStorage,
        expect.stringMatching(/^chat-images\/conv123\/\d+\.jpg$/)
      );
      expect(mockedUploadBytes).toHaveBeenCalledWith(mockStorageRef, mockBlob);
      expect(mockedGetDownloadURL).toHaveBeenCalledWith(mockStorageRef);
      expect(result).toBe(mockDownloadURL);
    });

    it('should throw error when upload fails', async () => {
      const mockBlob = new Blob(['fake image data'], { type: 'image/jpeg' });
      
      (global.fetch as jest.Mock).mockResolvedValue({
        blob: () => Promise.resolve(mockBlob),
      });
      
      mockedUploadBytes.mockRejectedValue(new Error('Upload failed'));

      await expect(
        storageService.uploadChatImage('conv123', 'file://path/to/image.jpg')
      ).rejects.toThrow('Failed to upload image');
    });
  });

  describe('uploadDocument', () => {
    it('should upload document successfully', async () => {
      const mockBlob = new Blob(['fake document data'], { type: 'application/pdf' });
      const mockSnapshot = { ref: mockStorageRef };
      const mockDownloadURL = 'https://storage.googleapis.com/test/document.pdf';

      (global.fetch as jest.Mock).mockResolvedValue({
        blob: () => Promise.resolve(mockBlob),
      });
      
      mockedUploadBytes.mockResolvedValue(mockSnapshot as any);
      mockedGetDownloadURL.mockResolvedValue(mockDownloadURL);

      const result = await storageService.uploadDocument(
        'user123',
        'file://path/to/document.pdf',
        'document.pdf'
      );

      expect(global.fetch).toHaveBeenCalledWith('file://path/to/document.pdf');
      expect(mockedRef).toHaveBeenCalledWith(
        mockStorage,
        expect.stringMatching(/^documents\/user123\/\d+_document\.pdf$/)
      );
      expect(mockedUploadBytes).toHaveBeenCalledWith(mockStorageRef, mockBlob);
      expect(mockedGetDownloadURL).toHaveBeenCalledWith(mockStorageRef);
      expect(result).toBe(mockDownloadURL);
    });

    it('should throw error when document upload fails', async () => {
      const mockBlob = new Blob(['fake document data'], { type: 'application/pdf' });
      
      (global.fetch as jest.Mock).mockResolvedValue({
        blob: () => Promise.resolve(mockBlob),
      });
      
      mockedUploadBytes.mockRejectedValue(new Error('Upload failed'));

      await expect(
        storageService.uploadDocument('user123', 'file://path/to/document.pdf', 'document.pdf')
      ).rejects.toThrow('Failed to upload document');
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      mockedDeleteObject.mockResolvedValue(undefined);

      await storageService.deleteFile('https://storage.googleapis.com/test/file.jpg');

      expect(mockedRef).toHaveBeenCalledWith(
        mockStorage,
        'https://storage.googleapis.com/test/file.jpg'
      );
      expect(mockedDeleteObject).toHaveBeenCalledWith(mockStorageRef);
    });

    it('should throw error when delete fails', async () => {
      mockedDeleteObject.mockRejectedValue(new Error('Delete failed'));

      await expect(
        storageService.deleteFile('https://storage.googleapis.com/test/file.jpg')
      ).rejects.toThrow('Failed to delete file');
    });
  });

  describe('getFileReference', () => {
    it('should return file reference', () => {
      const result = storageService.getFileReference('path/to/file.jpg');

      expect(mockedRef).toHaveBeenCalledWith(mockStorage, 'path/to/file.jpg');
      expect(result).toBe(mockStorageRef);
    });
  });
});