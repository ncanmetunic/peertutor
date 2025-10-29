import { AuthService } from '../auth';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { setDoc, getDoc, updateDoc } from 'firebase/firestore';

// Mock Firebase functions
jest.mock('firebase/auth');
jest.mock('firebase/firestore');

const mockedCreateUser = createUserWithEmailAndPassword as jest.MockedFunction<typeof createUserWithEmailAndPassword>;
const mockedSignIn = signInWithEmailAndPassword as jest.MockedFunction<typeof signInWithEmailAndPassword>;
const mockedSignOut = signOut as jest.MockedFunction<typeof signOut>;
const mockedSendEmailVerification = sendEmailVerification as jest.MockedFunction<typeof sendEmailVerification>;
const mockedSendPasswordReset = sendPasswordResetEmail as jest.MockedFunction<typeof sendPasswordResetEmail>;
const mockedUpdateProfile = updateProfile as jest.MockedFunction<typeof updateProfile>;
const mockedUpdatePassword = updatePassword as jest.MockedFunction<typeof updatePassword>;
const mockedReauthenticate = reauthenticateWithCredential as jest.MockedFunction<typeof reauthenticateWithCredential>;
const mockedEmailAuthProvider = EmailAuthProvider as jest.Mocked<typeof EmailAuthProvider>;
const mockedSetDoc = setDoc as jest.MockedFunction<typeof setDoc>;
const mockedGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockedUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;

// Mock auth object
const mockAuth = {
  currentUser: {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
  } as any,
};

jest.mock('../../config/firebase', () => ({
  auth: {
    currentUser: {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
    },
  },
  db: {},
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerWithEmail', () => {
    it('should create user account and user document successfully', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      };

      mockedCreateUser.mockResolvedValue({
        user: mockUser,
      } as any);
      mockedUpdateProfile.mockResolvedValue(undefined);
      mockedSendEmailVerification.mockResolvedValue(undefined);
      mockedSetDoc.mockResolvedValue(undefined);

      const result = await AuthService.registerWithEmail(
        'test@example.com',
        'password123',
        'Test User'
      );

      expect(mockedCreateUser).toHaveBeenCalledWith(
        mockAuth,
        'test@example.com',
        'password123'
      );
      expect(mockedUpdateProfile).toHaveBeenCalledWith(
        mockUser,
        { displayName: 'Test User' }
      );
      expect(mockedSendEmailVerification).toHaveBeenCalledWith(mockUser);
      expect(mockedSetDoc).toHaveBeenCalled();
      expect(result).toBe(mockUser);
    });

    it('should throw error when registration fails', async () => {
      const error = new Error('Registration failed');
      mockedCreateUser.mockRejectedValue(error);

      await expect(
        AuthService.registerWithEmail('test@example.com', 'password123', 'Test User')
      ).rejects.toThrow('Registration failed');
    });
  });

  describe('signInWithEmail', () => {
    it('should sign in user successfully', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
      };

      mockedSignIn.mockResolvedValue({
        user: mockUser,
      } as any);

      const result = await AuthService.signInWithEmail('test@example.com', 'password123');

      expect(mockedSignIn).toHaveBeenCalledWith(
        mockAuth,
        'test@example.com',
        'password123'
      );
      expect(result).toBe(mockUser);
    });

    it('should throw error when sign in fails', async () => {
      const error = new Error('Sign in failed');
      mockedSignIn.mockRejectedValue(error);

      await expect(
        AuthService.signInWithEmail('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Sign in failed');
    });
  });

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      mockedSignOut.mockResolvedValue(undefined);

      await AuthService.signOut();

      expect(mockedSignOut).toHaveBeenCalledWith(mockAuth);
    });

    it('should throw error when sign out fails', async () => {
      const error = new Error('Sign out failed');
      mockedSignOut.mockRejectedValue(error);

      await expect(AuthService.signOut()).rejects.toThrow('Sign out failed');
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email successfully', async () => {
      mockedSendPasswordReset.mockResolvedValue(undefined);

      await AuthService.resetPassword('test@example.com');

      expect(mockedSendPasswordReset).toHaveBeenCalledWith(
        mockAuth,
        'test@example.com'
      );
    });

    it('should throw error when password reset fails', async () => {
      const error = new Error('Password reset failed');
      mockedSendPasswordReset.mockRejectedValue(error);

      await expect(
        AuthService.resetPassword('test@example.com')
      ).rejects.toThrow('Password reset failed');
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const mockCredential = { providerId: 'password' };
      mockedEmailAuthProvider.credential = jest.fn().mockReturnValue(mockCredential);
      mockedReauthenticate.mockResolvedValue({} as any);
      mockedUpdatePassword.mockResolvedValue(undefined);

      await AuthService.changePassword('currentPassword', 'newPassword');

      expect(mockedEmailAuthProvider.credential).toHaveBeenCalledWith(
        'test@example.com',
        'currentPassword'
      );
      expect(mockedReauthenticate).toHaveBeenCalledWith(
        mockAuth.currentUser,
        mockCredential
      );
      expect(mockedUpdatePassword).toHaveBeenCalledWith(
        mockAuth.currentUser,
        'newPassword'
      );
    });

    it('should throw error when no user is authenticated', async () => {
      const originalCurrentUser = mockAuth.currentUser;
      (mockAuth as any).currentUser = null;

      await expect(
        AuthService.changePassword('currentPassword', 'newPassword')
      ).rejects.toThrow('No authenticated user found');

      mockAuth.currentUser = originalCurrentUser;
    });

    it('should throw error when reauthentication fails', async () => {
      const mockCredential = { providerId: 'password' };
      mockedEmailAuthProvider.credential = jest.fn().mockReturnValue(mockCredential);
      
      const error = new Error('Wrong password');
      mockedReauthenticate.mockRejectedValue(error);

      await expect(
        AuthService.changePassword('wrongPassword', 'newPassword')
      ).rejects.toThrow('Wrong password');
    });
  });

  describe('getUserData', () => {
    it('should get user data successfully', async () => {
      const mockUserData = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      };

      mockedGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
      } as any);

      const result = await AuthService.getUserData('test-uid');

      expect(mockedGetDoc).toHaveBeenCalled();
      expect(result).toEqual(mockUserData);
    });

    it('should return null when user document does not exist', async () => {
      mockedGetDoc.mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await AuthService.getUserData('test-uid');

      expect(result).toBeNull();
    });

    it('should return null when getting user data fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockedGetDoc.mockRejectedValue(new Error('Firestore error'));

      const result = await AuthService.getUserData('test-uid');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Error getting user data:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('updateUserData', () => {
    it('should update user data successfully', async () => {
      mockedUpdateDoc.mockResolvedValue(undefined);

      const updateData = { displayName: 'Updated Name' };
      await AuthService.updateUserData('test-uid', updateData);

      expect(mockedUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ...updateData,
          updatedAt: expect.any(Date),
        })
      );
    });

    it('should throw error when update fails', async () => {
      const error = new Error('Update failed');
      mockedUpdateDoc.mockRejectedValue(error);

      await expect(
        AuthService.updateUserData('test-uid', { displayName: 'Updated Name' })
      ).rejects.toThrow('Update failed');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', () => {
      const result = AuthService.getCurrentUser();
      expect(result).toBe(mockAuth.currentUser);
    });
  });
});