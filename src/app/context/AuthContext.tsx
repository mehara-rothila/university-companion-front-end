'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import axios from 'axios';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  image?: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (
    username: string,
    password: string
  ) => Promise<boolean | { error: string; email?: string }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  isOnline: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const { data: session, status } = useSession();
  const interceptorRef = useRef<number | null>(null);

  // Track online/offline status
  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync auth state across browser tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        if (e.newValue === null) {
          // User logged out in another tab
          setUser(null);
          setToken(null);
        } else if (e.newValue !== token) {
          // Token changed in another tab
          setToken(e.newValue);
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      }
      if (e.key === 'user' && e.newValue) {
        setUser(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [token]);

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      return;
    }

    if (session?.user) {
      // Handle Google OAuth user - use backend user data if available
      const sessionData = session as any;

      if (sessionData.backendUser) {
        // Backend user data is available
        const backendUser: User = {
          id: sessionData.backendUser.id || 0,
          username: sessionData.backendUser.username || '',
          email: sessionData.backendUser.email || '',
          firstName: sessionData.backendUser.firstName || '',
          lastName: sessionData.backendUser.lastName || '',
          role: sessionData.backendUser.role || 'STUDENT',
          image: sessionData.backendUser.imageUrl || session.user.image || undefined,
          name: session.user.name || undefined,
        };
        setUser(backendUser);
        if (sessionData.backendToken) {
          setToken(sessionData.backendToken);
          localStorage.setItem('token', sessionData.backendToken);
        }

        // Store in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(backendUser));
      } else {
        // Fallback to session data only (shouldn't happen with new implementation)
        const googleUser: User = {
          id: 0,
          username: session.user.name || session.user.email?.split('@')[0] || '',
          email: session.user.email || '',
          firstName: session.user.name?.split(' ')[0] || '',
          lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
          role: 'student',
          image: session.user.image || undefined,
          name: session.user.name || undefined,
        };
        setUser(googleUser);
        if (session.accessToken) {
          setToken(session.accessToken);
        }
      }
    } else {
      // Check for stored auth data (traditional login)
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    }
    setLoading(false);
  }, [session, status]);

  useEffect(() => {
    // Set up axios interceptor to include token
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }

    // Remove previous interceptor if exists
    if (interceptorRef.current !== null) {
      axios.interceptors.response.eject(interceptorRef.current);
    }

    // Add 401 response interceptor for expired token handling
    interceptorRef.current = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Don't force-logout for non-critical background calls (e.g. emergency alerts),
        // which can legitimately 401 for a user lacking that permission.
        const failedUrl = error.config?.url || '';
        const isBackgroundCall = failedUrl.includes('/emergency/');
        if (error.response?.status === 401 && !isBackgroundCall) {
          // Token expired or invalid - logout user
          console.warn('Session expired. Logging out...');
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Redirect to login page
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login?error=session_expired';
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      if (interceptorRef.current !== null) {
        axios.interceptors.response.eject(interceptorRef.current);
      }
    };
  }, [token]);

  const login = useCallback(
    async (
      usernameOrEmail: string,
      password: string
    ): Promise<boolean | { error: string; email?: string }> => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const response = await axios.post(`${API_URL}/api/auth/signin`, {
          usernameOrEmail,
          password,
        });

        const { accessToken, ...userData } = response.data;

        setToken(accessToken);
        setUser(userData);

        // Store in localStorage
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));

        return true;
      } catch (error: any) {
        console.error('Login failed:', error);
        console.log('Error response:', error.response);
        console.log('Error response data:', error.response?.data);

        // Check for EMAIL_NOT_VERIFIED error (handle both object and string response)
        if (error.response?.status === 403) {
          const responseData = error.response?.data;

          // Handle case where data is the error object directly
          if (responseData?.error === 'EMAIL_NOT_VERIFIED') {
            return {
              error: 'EMAIL_NOT_VERIFIED',
              email: responseData.email,
            };
          }

          // For other 403 errors (disabled/banned users), don't assume EMAIL_NOT_VERIFIED
          return {
            error: responseData?.error || 'ACCESS_DENIED',
            email: responseData?.email || usernameOrEmail,
          };
        }

        return false;
      }
    },
    []
  );

  const loginWithGoogle = useCallback(async () => {
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    if (session) {
      // Google OAuth logout
      await signOut({ callbackUrl: '/' });
    } else {
      // Traditional logout
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [session]);

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      loginWithGoogle,
      logout,
      isAuthenticated: !!user,
      loading,
      isOnline,
    }),
    [user, token, login, loginWithGoogle, logout, loading, isOnline]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
