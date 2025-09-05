
"use client";

import { createContext, useState, useEffect, ReactNode, useMemo } from 'react';
import type { User } from '@/lib/types';
import { getFirebase } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
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

const createProfileFromFirebaseUser = (firebaseUser: FirebaseUser): User => {
    return {
        name: firebaseUser.displayName || "Anonymous",
        email: firebaseUser.email || "no-email@example.com",
        role: "GIS Analyst", // Default role
        location: "CHQ", // Default location
        avatar: firebaseUser.photoURL || `https://i.pravatar.cc/150?u=${firebaseUser.email}`,
    };
}


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
            const storedUserJson = localStorage.getItem('gis-user-profile');
            let profile: User;

            if (storedUserJson) {
                const storedUser = JSON.parse(storedUserJson);
                // Sync with Firebase auth data
                profile = {
                    ...storedUser,
                    name: firebaseUser.displayName || storedUser.name,
                    email: firebaseUser.email, // email is source of truth
                    avatar: firebaseUser.photoURL || storedUser.avatar,
                };
            } else {
                // This case handles a fresh login where no profile is in local storage yet.
                profile = createProfileFromFirebaseUser(firebaseUser);
                // Also log their sign-in activity
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
