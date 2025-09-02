
"use client";

import { createContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirebase } from '@/lib/firebase';
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
    const { auth } = getFirebase();
    if (!auth) {
        setLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const storedUser = localStorage.getItem('gis-user-profile');
        if (storedUser) {
          setUserState(JSON.parse(storedUser));
        } else {
          // If no local profile, create a basic one from firebase user
          const newUser: User = {
            name: firebaseUser.displayName || 'Anonymous',
            email: firebaseUser.email || '',
            role: 'GIS Analyst',
            location: 'CHQ',
            avatar: firebaseUser.photoURL || `https://i.pravatar.cc/150?u=${firebaseUser.email}`,
          };
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo(() => ({ user, loading, setUser }), [user, loading]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
