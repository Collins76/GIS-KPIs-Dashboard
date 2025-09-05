
import { getFirebase } from './firebase';
import { collection, addDoc, serverTimestamp, getDocs, doc, deleteDoc, updateDoc, setDoc } from 'firebase/firestore';
import type { User, ManagedFile as AppFile, WeatherData, Kpi, ActivityLog, Role, KpiCategory, KpiStatus } from './types';
import { signInAnonymously } from 'firebase/auth';


const DB_COLLECTION_NAME = 'gis-team15';

export const getActivities = async (): Promise<ActivityLog[]> => {
  const { db } = getFirebase();
  if (!db) return [];

  const querySnapshot = await getDocs(collection(db, DB_COLLECTION_NAME));
  const activities: ActivityLog[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    activities.push({
      id: doc.id,
      ...data,
      timestamp: data.timestamp?.toDate()?.toISOString() || new Date().toISOString(),
    } as ActivityLog);
  });
  return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const updateActivity = async (id: string, data: Partial<ActivityLog>) => {
    const { db } = getFirebase();
    if (!db) return;
    const docRef = doc(db, DB_COLLECTION_NAME, id);
    await updateDoc(docRef, data);
};

export const deleteActivity = async (id: string) => {
    const { db } = getFirebase();
    if (!db) return;
    await deleteDoc(doc(db, DB_COLLECTION_NAME, id));
};


export const addUserSignInActivity = async (user: User, weather: WeatherData | null) => {
  const { db } = getFirebase();
  if (!db || !user) return;

  try {
    await addDoc(collection(db, DB_COLLECTION_NAME), {
      activityType: 'user_signin',
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        avatar: user.avatar,
      },
      weather: weather ? {
        condition: weather.condition,
        temperature: weather.temp,
        humidity: weather.humidity,
        windSpeed: weather.windSpeed,
      } : null,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding user sign-in activity to Firestore: ", error);
  }
};

export const addUserProfileUpdateActivity = async (user: User) => {
  const { db } = getFirebase();
  if (!db || !user) return;

  try {
    await addDoc(collection(db, DB_COLLECTION_NAME), {
      activityType: 'profile_update',
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        avatar: user.avatar,
      },
      timestamp: serverTimestamp(),
    });
    console.log("Profile update activity logged for", user.email);
  } catch (error) {
    console.error("Error adding profile update activity to Firestore: ", error);
  }
};


export const addFileUploadActivity = async (user: User | null, file: AppFile) => {
    const { db } = getFirebase();
    if (!db || !user || !file) return;

    try {
        await addDoc(collection(db, DB_COLLECTION_NAME), {
            activityType: 'file_upload',
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                location: user.location,
            },
            file: {
                name: file.name,
                type: file.type,
                size: file.size,
                url: file.url,
            },
            timestamp: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error adding file upload activity to Firestore: ", error);
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
    await addDoc(collection(db, DB_COLLECTION_NAME), {
      activityType: 'kpi_update',
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        avatar: user.avatar,
      },
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
    console.error("Error adding KPI update activity to Firestore: ", error);
  }
}

export const addFilterChangeActivity = async (
    user: User | null,
    filter: { type: string; value: string; tab: string }
) => {
    const { db } = getFirebase();
    if (!db || !user) return;
    try {
        await addDoc(collection(db, DB_COLLECTION_NAME), {
            activityType: 'filter_change',
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
            },
            filter_interaction: {
                ...filter
            },
            timestamp: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error logging filter change to Firestore: ", error);
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
      test_message: "Dashboard connected successfully!",
      timestamp: new Date(),
      dashboard_version: "GIS_KPI_v1.0",
      location: "Lagos, Nigeria",
      user_email: currentUser.email,
    };
    
    const docRef = await addDoc(collection(db, "kpi_data"), testData);
    console.log("✅ Data written successfully with ID: ", docRef.id);
    
    // Test writing user session
    await setDoc(doc(db, "user_sessions", currentUser.uid), {
      user_id: currentUser.uid,
      login_time: new Date(),
      dashboard_active: true
    }, { merge: true });
    console.log("✅ User session created/updated successfully");
    
    alert("🎉 Database connection successful! Check your Firestore console for 'kpi_data' and 'user_sessions' collections.");
    
  } catch (error: any) {
    console.error("❌ Database connection failed:", error);
    alert("⚠️ Connection failed: " + error.message);
  }
}
