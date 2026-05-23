import {
  googleAuthLogin as googleAuthLoginApi,
  logout as logoutApi,
} from '@/api-client';
import { clearTokens } from '@/lib/auth-token';
import { getCookie, removeCookie, resetCookies } from '@/lib/helpers';
import { queryClient } from '@/lib/query-client';
import type { AuthUser, UserRole } from '@/types';
import React, { createContext, useCallback, useContext, useState } from 'react';

interface GoogleLoginResponse {
  accessToken?: string;
  refreshToken?: string;
  isNewUser?: boolean;
  status: boolean;
  message?: string;
  isAdmin?: boolean;
  requiresOtp?: boolean;
  expiresInSeconds?: number;
  adminEmail?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
  isLoading: boolean;
  googleLogin: (
    idToken: string,
    role: UserRole
  ) => Promise<GoogleLoginResponse>;
}

const getStoredUser = (): AuthUser | null => {
  const storedUser = getCookie('user');
  return storedUser ? JSON.parse(storedUser) : null;
};

const clearStoredUser = () => {
  removeCookie('user', { path: '/' });
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);
  const [isLoading, setIsLoading] = useState(false);

  const googleLogin = useCallback(async (idToken: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const { data } = await googleAuthLoginApi({
        idToken,
        role,
        fcmToken: '',
      });
      return data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await logoutApi();
      resetCookies();
    } catch {
      // Proceed with local cleanup even if API call fails
    }
    clearTokens();
    setUser(null);
    clearStoredUser();
    queryClient.clear();
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: !!user,
        logout,
        isLoading,
        googleLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
