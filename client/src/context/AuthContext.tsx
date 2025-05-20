import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, LoginCredentials, RegisterCredentials } from '../types';
import * as authApi from '../api/auth';
import { auth } from '../utils/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { deactivateAccount as apiDeactivateAccount } from '../api/users';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserData: (userData: Partial<AuthUser>) => void;
  deactivateAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth by checking if user exists via API
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        // This is expected if user is not logged in, don't show error
        console.log('User not authenticated:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const userData = await authApi.login(credentials);
      setUser(userData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const userData = await authApi.register(credentials);
      setUser(userData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Sign in with Firebase
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // 2. Get the ID token
      const idToken = await result.user.getIdToken();

      // 3. Send token to our backend
      const userData = await authApi.googleAuth(idToken);
      setUser(userData);
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.response?.data?.message || 'Google login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();

      // Also sign out from Firebase if we were using it
      await signOut(auth);

      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUserData = (userData: Partial<AuthUser>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
    }
  };

  const deactivateAccount = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await apiDeactivateAccount();
      setUser(null);
    } catch (err: any) {
      console.error('Account deactivation error:', err);
      setError(err.response?.data?.message || 'Failed to deactivate account');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        loginWithGoogle,
        logout,
        updateUserData,
        deactivateAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 