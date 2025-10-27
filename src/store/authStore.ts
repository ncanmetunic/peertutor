import { create } from 'zustand';
import { User } from '../types';
import { AuthService } from '../services/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Auth methods
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // Initialize auth listener
  initialize: () => () => void; // Returns unsubscribe function
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user,
    isLoading: false,
    error: null
  }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error, isLoading: false }),

  signUp: async (email, password, displayName) => {
    try {
      set({ isLoading: true, error: null });
      await AuthService.registerWithEmail(email, password, displayName);
      // User will be set via the auth state listener
    } catch (error: any) {
      set({ 
        error: error.message || 'Registration failed',
        isLoading: false 
      });
      throw error;
    }
  },

  signIn: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      await AuthService.signInWithEmail(email, password);
      // User will be set via the auth state listener
    } catch (error: any) {
      set({ 
        error: error.message || 'Sign in failed',
        isLoading: false 
      });
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      await AuthService.signOut();
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Sign out failed',
        isLoading: false 
      });
      throw error;
    }
  },

  resetPassword: async (email) => {
    try {
      set({ error: null });
      await AuthService.resetPassword(email);
    } catch (error: any) {
      set({ error: error.message || 'Password reset failed' });
      throw error;
    }
  },

  initialize: () => {
    // Set up auth state listener
    const unsubscribe = AuthService.onAuthStateChange((user) => {
      get().setUser(user);
    });

    return unsubscribe;
  }
}));