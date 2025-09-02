
"use client";

import { createContext, useState, useEffect, ReactNode, useMemo } from 'react';
import type { User } from '@/lib/types';

interface UserContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  setUser: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setUser = (userToSet: User | null) => {
    setUserState(userToSet);
    if (userToSet) {
      localStorage.setItem('gis-user-profile', JSON.stringify(userToSet));
    } else {
      localStorage.removeItem('gis-user-profile');
    }
  };

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('gis-user-profile');
      if (storedUser) {
        setUserState(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('gis-user-profile');
    } finally {
        setLoading(false);
    }
  }, []);

  const value = useMemo(() => ({ user, loading, setUser }), [user, loading]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
