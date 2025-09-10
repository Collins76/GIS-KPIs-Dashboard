

import { getFirebase } from './firebase';
import { ref, set, push, serverTimestamp, get, query, orderByChild } from 'firebase/database';
import type { User, ManagedFile as AppFile, WeatherData, Kpi, ActivityLog, Role, KpiCategory, KpiStatus, StatusPost } from './types';
import { getAuth, signInAnonymously, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';


const DB_REF_NAME = 'activities';

const initAuth = (): Promise<FirebaseUser> => {
    return new Promise((resolve, reject) => {
        const { auth } = getFirebase();
        if (!auth) {
            return reject(new Error("Firebase auth is not initialized."));
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log('✅ User authenticated:', user.uid);
                unsubscribe();
                resolve(user);
            } else {
                console.log('🔄 No user found, signing in anonymously...');
                signInAnonymously(auth)
                    .then((userCredential) => {
                        console.log('✅ Anonymous auth successful');
                        unsubscribe();
                        resolve(userCredential.user);
                    })
                    .catch((error) => {
                        console.error('❌ Auth failed:', error);
                        unsubscribe();
                        reject(error);
                    });
            }
        });
    });
};


export const getActivities = async (): Promise<ActivityLog[]> => {
    try {
        await initAuth();
        const { db } = getFirebase();
        if (!db) {
            throw new Error("Firebase database is not available.");
        }

        const activitiesRef = ref(db, DB_REF_NAME);
        const snapshot = await get(activitiesRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            const activities: ActivityLog[] = Object.keys(data).map(key => ({
                id: key,
                ...data[key],
                timestamp: new Date(data[key].timestamp).toISOString(),
            })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            
            return activities;
        } else {
            console.log("No activities found");
            return [];
        }

    } catch (error: any) {
        console.error("Error in getActivities:", error);
        if (error.code === 'PERMISSION_DENIED') {
            throw new Error("Permission denied. Please check Firebase security rules and authentication.");
        } else {
            throw new Error(`Could not retrieve activities. This may be a network or permissions issue.`);
        }
    }
};

export const updateActivity = async (id: string, data: Partial<ActivityLog>) => {
    const { db } = getFirebase();
    if (!db) return;
    const docRef = ref(db, `${DB_REF_NAME}/${id}`);
    // Remove id from data to prevent it from being written to the document
    if ('id' in data) {
        delete data.id;
    }
    await set(docRef, data);
};

export const deleteActivity = async (id: string) => {
    const { db } = getFirebase();
    if (!db) return;
    const docRef = ref(db, `${DB_REF_NAME}/${id}`);
    await set(docRef, null);
};

const sanitizeUserForDB = (user: User) => {
  return {
    name: user.name || "Anonymous",
    email: user.email || "no-email@example.com",
    role: user.role || "GIS Analyst",
    location: user.location || "CHQ",
    avatar: user.avatar || "",
  };
};


export const addUserSignInActivity = async (user: User, weather: WeatherData | null) => {
  const { db } = getFirebase();
  if (!db || !user) return;

  try {
    const activitiesRef = ref(db, DB_REF_NAME);
    const newActivityRef = push(activitiesRef);
    await set(newActivityRef, {
      activityType: 'user_signin',
      user: sanitizeUserForDB(user),
      weather: weather ? {
        condition: weather.condition,
        temperature: weather.temp,
        humidity: weather.humidity,
        windSpeed: weather.windSpeed,
      } : null,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding user sign-in activity to Realtime Database: ", error);
  }
};

export const addUserSignOutActivity = async (user: User, duration: number) => {
    const { db } = getFirebase();
    if (!db || !user) return;
  
    try {
        const activitiesRef = ref(db, DB_REF_NAME);
        const newActivityRef = push(activitiesRef);
        await set(newActivityRef, {
            activityType: 'user_signout',
            user: sanitizeUserForDB(user),
            duration: Math.round(duration), // Duration in minutes
            timestamp: serverTimestamp(),
        });
      console.log("Sign-out activity logged for", user.email);
    } catch (error) {
      console.error("Error adding user sign-out activity to Realtime Database: ", error);
    }
  };

export const addUserProfileUpdateActivity = async (user: User) => {
  const { db } = getFirebase();
  if (!db || !user) return;

  try {
    const activitiesRef = ref(db, DB_REF_NAME);
    const newActivityRef = push(activitiesRef);
    await set(newActivityRef, {
      activityType: 'profile_update',
      user: sanitizeUserForDB(user),
      timestamp: serverTimestamp(),
    });
    console.log("Profile update activity logged for", user.email);
  } catch (error) {
    console.error("Error adding profile update activity to Realtime Database: ", error);
  }
};


export const addFileUploadActivity = async (user: User | null, file: AppFile) => {
    const { db } = getFirebase();
    if (!db || !user || !file) return;

    try {
        const activitiesRef = ref(db, DB_REF_NAME);
        const newActivityRef = push(activitiesRef);
        await set(newActivityRef, {
            activityType: 'file_upload',
            user: sanitizeUserForDB(user),
            file: {
                name: file.name,
                type: file.type,
                size: file.size,
                url: file.url,
            },
            timestamp: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error adding file upload activity to Realtime Database: ", error);
    }
}

export const addKpiUpdateActivity = async (
    user: User | null, 
    kpi: Kpi,
    filters: {
        role: Role | 'All',
        category: KpiCategory | 'All',
        status: KpiStatus | 'All',
        date: Date | undefined,
    }
) => {
  const { db } = getFirebase();
  if (!db || !user || !kpi) return;

  try {
    const activitiesRef = ref(db, DB_REF_NAME);
    const newActivityRef = push(activitiesRef);
    await set(newActivityRef, {
      activityType: 'kpi_update',
      user: sanitizeUserForDB(user),
      kpi: {
        id: kpi.id,
        title: kpi.title,
        progress: kpi.progress,
        status: kpi.status,
      },
      filter_settings: {
        role: filters.role,
        category: filters.category,
        status: filters.status,
        date: filters.date ? filters.date.toISOString() : null,
      },
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding KPI update activity to Realtime Database: ", error);
  }
}

export const addFilterChangeActivity = async (
    user: User | null,
    filter: { type: string; value: string; tab: string }
) => {
    const { db } = getFirebase();
    if (!db || !user) return;
    try {
        const activitiesRef = ref(db, DB_REF_NAME);
        const newActivityRef = push(activitiesRef);
        await set(newActivityRef, {
            activityType: 'filter_change',
            user: sanitizeUserForDB(user),
            filter_interaction: {
                ...filter
            },
            timestamp: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error logging filter change to Realtime Database: ", error);
    }
};

// Test function - call this when your dashboard loads
export async function testDatabaseConnection() {
  const { db, auth } = getFirebase();
  if (!db || !auth) {
    const message = "Firebase is not properly initialized.";
    console.error(`❌ Database connection failed: ${message}`);
    alert(`⚠️ Connection failed: ${message}`);
    return;
  }
  
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        // Attempt anonymous sign-in if no user
        await signInAnonymously(auth);
        const refreshedUser = getAuth().currentUser;
        if (!refreshedUser) {
           alert("⚠️ Connection failed: Could not authenticate anonymously.");
           return;
        }
         console.log(`✅ Authenticated anonymously as: ${refreshedUser.uid}`);
    } else {
        console.log(`✅ Authenticated as: ${currentUser.email || currentUser.uid}`);
    }
    
    // Test writing data
    const testData = {
      activityType: 'test_connection',
      user: {
          name: auth.currentUser?.displayName || "Test User",
          email: auth.currentUser?.email || "test@example.com",
          role: 'GIS Analyst',
          location: 'CHQ',
          avatar: auth.currentUser?.photoURL || ""
      },
      details: {
          test_message: "Dashboard connected successfully!",
          dashboard_version: "GIS_KPI_v1.0_RTDB",
      },
      timestamp: serverTimestamp(),
    };
    
    const testRef = ref(db, DB_REF_NAME);
    const newTestRef = push(testRef);
    await set(newTestRef, testData);

    console.log("✅ Data written successfully with ID: ", newTestRef.key);
        
    alert("🎉 Database connection successful! A test record has been written to 'activities'.");
    
  } catch (error: any) {
    console.error("❌ Database connection failed:", error);
    alert("⚠️ Connection failed: " + error.message + "\n\nPlease check your Realtime Database security rules and internet connection.");
  }
}

export const addStatusPost = async (statusData: {status: string; category?: KpiCategory | 'General'}) => {
    try {
        const { auth, db } = getFirebase();
        const user = auth?.currentUser;

        if (!user || !db) {
            throw new Error("Authentication required for status updates");
        }

        // Create status update object
        const statusUpdate = {
            ...statusData,
            userId: user.uid,
            userRole: "GIS Coordinator", // Collins A's role
            timestamp: Date.now(),
            date: new Date().toISOString(),
            location: "Lagos, Nigeria"
        };

        // Post to multiple relevant paths
        const updates: { [key: string]: object } = {};
        const key = Date.now();

        // Main status update
        updates[`status_updates/${key}`] = statusUpdate;

        // KPI-specific update if it's business growth related
        if (statusData.category === 'Business Growth') {
            updates[`kpis/business_growth/${key}`] = statusUpdate;
        }

        // User-specific status
        updates[`users/${user.uid}/status_updates/${key}`] = statusUpdate;

        // Batch update
        await Promise.all(
            Object.entries(updates).map(([path, data]) => {
                const updateRef = ref(db, path);
                return set(updateRef, data);
            })
        );

        console.log("✅ Status posted successfully");
        return { success: true, message: "Status updated successfully" };

    } catch (error: any) {
        console.error("❌ Error posting status:", error);

        if (error.code === 'PERMISSION_DENIED') {
            throw new Error("Permission denied. Check user role and Firebase rules.");
        } else if (error.code === 'NETWORK_ERROR') {
            throw new Error("Network error. Please check your connection.");
        } else {
            throw new Error(`Failed to post status: ${error.message}`);
        }
    }
}


export const getStatusPosts = async (): Promise<StatusPost[]> => {
    try {
        await initAuth();
        const { db } = getFirebase();
        if (!db) {
            throw new Error("Firebase database is not available.");
        }

        const statusPostsRef = ref(db, 'status_posts');
        const postsQuery = query(statusPostsRef, orderByChild('timestamp'));
        const snapshot = await get(postsQuery);

        if (snapshot.exists()) {
            const data = snapshot.val();
            const posts: StatusPost[] = Object.keys(data).map(key => ({
                id: key,
                ...data[key],
            })).sort((a, b) => b.timestamp - a.timestamp); // Sort descending
            
            return posts;
        } else {
            console.log("No status posts found");
            return [];
        }

    } catch (error: any) {
        console.error("Error in getStatusPosts:", error);
        throw new Error(`Could not retrieve status posts. This may be a network or permissions issue.`);
    }
};
