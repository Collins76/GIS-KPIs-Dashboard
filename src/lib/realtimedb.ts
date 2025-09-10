
import { auth, db } from './firebase';
import { ref, set, push, serverTimestamp, get, query, orderByChild } from 'firebase/database';
import type { User, ManagedFile as AppFile, WeatherData, Kpi, ActivityLog, Role, KpiCategory, KpiStatus, StatusPost } from './types';
import { signInAnonymously, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';


const DB_REF_NAME = 'activities';
const STATUS_POSTS_REF_NAME = 'status_posts';

let authPromise: Promise<FirebaseUser | null> | null = null;

function ensureAuth(): Promise<FirebaseUser | null> {
  if (authPromise) {
    return authPromise;
  }
  authPromise = new Promise((resolve, reject) => {
    if (!auth) {
      console.error("❌ Firebase auth is not initialized.");
      return reject(new Error("Firebase auth not initialized"));
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user);
      } else {
        signInAnonymously(auth)
          .then((result) => {
            resolve(result.user);
          })
          .catch((error) => {
            console.error('❌ Authentication failed:', error);
            reject(error);
          });
      }
    });
  });
  // Do not automatically unsubscribe to allow auth state to be monitored.
  return authPromise;
}


export async function getActivities(): Promise<ActivityLog[]> {
    try {
      await ensureAuth();
      const activitiesRef = ref(db, DB_REF_NAME);
      const snapshot = await get(activitiesRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        const activities = Object.keys(data).map(key => ({
            id: key,
            ...data[key],
            timestamp: new Date(data[key].timestamp).toISOString(),
        }));
        
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        return activities;
        
      } else {
        return [];
      }
    } catch (error: any) {
      console.error('❌ Error fetching activities:', error);
      throw new Error(`Failed to get activities: ${error.message}`);
    }
}

async function addActivity(activityType: string, activityData: Omit<ActivityLog, 'id' | 'activityType' | 'timestamp'>) {
    try {
      await ensureAuth();
      const newActivityRef = push(ref(db, DB_REF_NAME));
      await set(newActivityRef, {
        ...activityData,
        activityType,
        timestamp: serverTimestamp()
      });
      return true;
    } catch (error: any) {
      console.error(`❌ Error adding activity (${activityType}):`, error);
      throw error;
    }
}

export async function updateActivity(id: string, data: Partial<ActivityLog>) {
    await ensureAuth();
    const docRef = ref(db, `${DB_REF_NAME}/${id}`);
    if ('id' in data) {
        delete data.id;
    }
    const updateData = { ...data };
    delete (updateData as any).id;
    await set(docRef, updateData);
}

export async function deleteActivity(id: string) {
    await ensureAuth();
    const docRef = ref(db, `${DB_REF_NAME}/${id}`);
    await set(docRef, null);
}

export async function getStatusPosts(): Promise<StatusPost[]> {
    try {
      await ensureAuth();
      const statusPostsRef = ref(db, STATUS_POSTS_REF_NAME);
      const postsQuery = query(statusPostsRef, orderByChild('timestamp'));
      const snapshot = await get(postsQuery);

      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({
            id: key,
            ...data[key],
        })).sort((a, b) => b.timestamp - a.timestamp); // Sort descending
      } else {
        return [];
      }
    } catch (error: any) {
        console.error("Error in getStatusPosts:", error);
        throw new Error(`Could not retrieve status posts. This may be a network or permissions issue.`);
    }
}

export async function addStatusPost(statusData: { status: string, user: User, category?: KpiCategory }) {
    try {
        console.log("🔄 Attempting to post status:", statusData.status);
        const firebaseUser = await ensureAuth();
        console.log("✅ User authenticated:", firebaseUser?.uid);

        if (!firebaseUser) {
            throw new Error("Authentication failed or is still in progress.");
        }

        const now = Date.now();
        const postData = {
            message: statusData.status,
            username: statusData.user.name,
            avatar: statusData.user.avatar,
            role: statusData.user.role,
            category: statusData.category || "General",
            status: "posted",
            timestamp: now,
            date: new Date(now).toISOString(),
            location: statusData.user.location || "Lagos, Nigeria"
        };
        
        const activityId = Date.now();
        const updates: { [key: string]: object } = {};

        updates[`${STATUS_POSTS_REF_NAME}/${activityId}`] = postData;
        updates[`users/${firebaseUser.uid}/activities/${activityId}`] = postData;
        
        if (postData.category && postData.category !== 'General') {
            const categoryKey = postData.category.toLowerCase().replace(/\s+/g, '_');
            updates[`kpi_updates/${categoryKey}/${activityId}`] = postData;
        }

        await Promise.all(
            Object.entries(updates).map(([path, data]) => {
                const dbRef = ref(db, path);
                return set(dbRef, data);
            })
        );

        console.log("✅ Status posted successfully to multiple paths");
        return { success: true };

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

export async function testDatabaseConnection() {
    try {
        await ensureAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("Authentication failed.");

        const testData = {
            user: {
                name: currentUser.displayName || "Test User",
                email: currentUser.email || "test@example.com",
                role: 'GIS Analyst',
                location: 'CHQ',
                avatar: currentUser.photoURL || ""
            },
            details: {
                test_message: "Dashboard connected successfully!",
                dashboard_version: "GIS_KPI_v1.0_Functional",
            },
        };

        await addActivity('test_connection', testData);
        console.log("✅ Data written successfully.");
        alert("🎉 Database connection successful! A test record has been written to 'activities'.");
    } catch (error: any) {
        console.error("❌ Database connection failed:", error);
        alert("⚠️ Connection failed: " + error.message);
    }
}

const sanitizeUserForDB = (user: User | null) => {
    if (!user) {
        return {
            name: "Anonymous",
            email: "anonymous@example.com",
            role: "GIS Analyst",
            location: "N/A",
            avatar: "",
        };
    }
    return {
        name: user.name || "Anonymous",
        email: user.email || "no-email@example.com",
        role: user.role || "GIS Analyst",
        location: user.location || "CHQ",
        avatar: user.avatar || "",
    };
};

export const addUserSignInActivity = (user: User, weather: WeatherData | null) => {
    const activityData = {
      user: sanitizeUserForDB(user),
      weather: weather ? {
        condition: weather.condition,
        temperature: weather.temp,
      } : null,
    };
    return addActivity('user_signin', activityData);
};

export const addUserSignOutActivity = (user: User, duration: number) => {
    const activityData = {
        user: sanitizeUserForDB(user),
        duration: Math.round(duration),
    };
    return addActivity('user_signout', activityData);
};

export const addUserProfileUpdateActivity = (user: User) => {
    const activityData = {
        user: sanitizeUserForDB(user)
    };
    return addActivity('profile_update', activityData);
};

export const addFileUploadActivity = (user: User | null, file: AppFile) => {
    const activityData = {
        user: sanitizeUserForDB(user),
        file: {
            name: file.name,
            type: file.type,
            size: file.size,
            url: file.url,
        },
    };
    return addActivity('file_upload', activityData);
};

export const addKpiUpdateActivity = (user: User, kpi: Kpi, filters: any) => {
    const activityData = {
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
    };
    return addActivity('kpi_update', activityData);
};

export const addFilterChangeActivity = (user: User, filter: any) => {
    const activityData = {
        user: sanitizeUserForDB(user),
        filter_interaction: { ...filter },
    };
    return addActivity('filter_change', activityData);
};
