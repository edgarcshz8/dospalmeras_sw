import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { setLogoutHandler } from '../api/client';

interface AuthContextType {
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function decodeJwtExp(token: string): number | null {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(b64));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (!token || !u) return null;
    const exp = decodeJwtExp(token);
    if (exp !== null && exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
    return JSON.parse(u);
  });

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  useEffect(() => {
    setLogoutHandler(logout);
  }, [logout]);

  const login = (token: string, newUser: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
