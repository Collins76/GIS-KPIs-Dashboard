

import { getFirebase } from './firebase';
import { ref, set, push, serverTimestamp, get, query, orderByChild, limitToLast, onValue } from 'firebase/database';
import type { User, ManagedFile as AppFile, WeatherData, Kpi, ActivityLog, Role, KpiCategory, KpiStatus } from './types';


const DB_REF_NAME = 'activities';

export const getActivities = async (): Promise<ActivityLog[]> => {
  const { db } = getFirebase();
  if (!db) {
    console.error("Realtime Database is not available.");
    return [];
  }

  try {
      const activitiesRef = ref(db, DB_REF_NAME);
      // The orderByChild query requires an index in Firebase rules.
      // To avoid this, we fetch all data and sort on the client.
      const snapshot = await get(activitiesRef);
      const activities: ActivityLog[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            activities.push({
              id: childSnapshot.key,
              ...data,
              timestamp: new Date(data.timestamp).toISOString(),
            } as ActivityLog);
        });
      }
      // Sort by most recent first
      return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
      console.error("Failed to fetch activities from Realtime Database:", error);
      // Re-throw the error to be caught by the calling component
      throw new Error("Could not retrieve activities. This may be a network or permissions issue.");
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
    nickname: user.nickname || "",
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
        alert("⚠️ Connection failed: Please sign in first to test the database connection.");
        return;
    }
    console.log(`✅ Authenticated as: ${currentUser.email}`);
    
    // Test writing data
    const testData = {
      activityType: 'test_connection',
      user: {
          name: currentUser.displayName || "Test User",
          email: currentUser.email || "test@example.com",
          nickname: "test",
          role: 'GIS Analyst',
          location: 'CHQ',
          avatar: currentUser.photoURL || ""
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

    