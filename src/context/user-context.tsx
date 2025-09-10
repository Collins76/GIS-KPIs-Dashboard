
"use client";

import { createContext, useState, useEffect, ReactNode, useMemo, useRef } from 'react';
import type { User } from '@/lib/types';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { addUserSignInActivity, addUserProfileUpdateActivity } from '@/lib/realtimedb';
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
        nickname: "", // Add default nickname
        role: "GIS Analyst", // Default role
        location: "CHQ", // Default location
        avatar: firebaseUser.photoURL || `https://i.pravatar.cc/150?u=${firebaseUser.email}`,
    };
}


export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastLoggedInEmail, setLastLoggedInEmail] = useState<string | null>(null);
  const previousUserRef = useRef<User | null>(null);


  useEffect(() => {
    if (!auth) {
        setLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setLoading(true); // Set loading true while processing auth state
        if (firebaseUser) {
            const storedUserJson = localStorage.getItem('gis-user-profile');
            let profile: User;

            if (storedUserJson) {
                const storedUser = JSON.parse(storedUserJson);
                // Sync with Firebase auth data if email matches
                 if (storedUser.email === firebaseUser.email) {
                    profile = {
                        ...storedUser,
                        name: firebaseUser.displayName || storedUser.name,
                        avatar: firebaseUser.photoURL || storedUser.avatar,
                    };
                } else {
                    // New user has logged in, create a fresh profile
                    profile = createProfileFromFirebaseUser(firebaseUser);
                }
            } else {
                // This case handles a fresh login where no profile is in local storage yet.
                profile = createProfileFromFirebaseUser(firebaseUser);
            }
            
            setUserState(profile); // Use internal state setter
            
             // Log sign-in activity only when a new user logs in
             if (firebaseUser.email !== lastLoggedInEmail) {
                // Add a small delay to ensure backend auth state is settled before writing to DB
                setTimeout(() => {
                  addUserSignInActivity(profile, weatherData.find(d => d.isToday) || null);
                }, 1000);
                localStorage.setItem('gis-signin-time', new Date().toISOString());
                setLastLoggedInEmail(firebaseUser.email);
            }

        } else {
            // User is signed out.
            setUserState(null); // Use internal state setter
            setLastLoggedInEmail(null);
        }
        setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [lastLoggedInEmail]);
  
  useEffect(() => {
    // Check for profile updates to log them
    const previousUser = previousUserRef.current;
    if (previousUser && user && JSON.stringify(previousUser) !== JSON.stringify(user)) {
        addUserProfileUpdateActivity(user);
    }
    // Update the ref to the current user for the next render
    previousUserRef.current = user;
  }, [user]);


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
