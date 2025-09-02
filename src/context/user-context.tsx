
"use client";

import { createContext, useState, useEffect, ReactNode, useMemo } from 'react';
import type { User } from '@/lib/types';
import { getFirebase } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { addUserSignInActivity } from '@/lib/firestore';
import { weatherData } from '@/lib/data';

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

  useEffect(() => {
    const { auth } = getFirebase();
    if (!auth) {
        setLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
            // User is signed in.
            const storedUser = localStorage.getItem('gis-user-profile');
            let profile: User;
            if (storedUser) {
                profile = JSON.parse(storedUser);
                // Ensure local storage is in sync with auth state
                if (profile.email !== firebaseUser.email) {
                    profile = createProfileFromFirebaseUser(firebaseUser);
                    addUserSignInActivity(profile, weatherData.find(d => d.isToday) || null);
                }
            } else {
                profile = createProfileFromFirebaseUser(firebaseUser);
                addUserSignInActivity(profile, weatherData.find(d => d.isToday) || null);
            }
            setUser(profile);
        } else {
            // User is signed out.
            setUser(null);
        }
        setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
  
  const createProfileFromFirebaseUser = (firebaseUser: any): User => {
    return {
        name: firebaseUser.displayName || "Anonymous",
        email: firebaseUser.email || "no-email@example.com",
        role: "GIS Analyst", // Default role
        location: "CHQ", // Default location
        avatar: firebaseUser.photoURL || `https://i.pravatar.cc/150?u=${firebaseUser.email}`,
    };
  }

  const setUser = (userToSet: User | null) => {
    setUserState(userToSet);
    if (userToSet) {
      localStorage.setItem('gis-user-profile', JSON.stringify(userToSet));
    } else {
      localStorage.removeItem('gis-user-profile');
    }
  };

  const value = useMemo(() => ({ user, loading, setUser }), [user, loading]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
