

import { auth, db } from './firebase';
import { ref, set, push, serverTimestamp, get, query, orderByChild } from 'firebase/database';
import type { User, ManagedFile as AppFile, WeatherData, Kpi, ActivityLog, Role, KpiCategory, KpiStatus, StatusPost } from './types';
import { signInAnonymously, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';


const DB_REF_NAME = 'activities';
const STATUS_POSTS_REF_NAME = 'status_posts';

class ActivityService {
  private isAuthenticated: boolean = false;
  private authPromise: Promise<FirebaseUser | null>;

  constructor() {
    this.authPromise = this.initAuth();
  }

  async initAuth(): Promise<FirebaseUser | null> {
    return new Promise((resolve) => {
      if (!auth) {
        console.error("❌ Firebase auth is not initialized.");
        return resolve(null);
      }
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          this.isAuthenticated = true;
          console.log('✅ Authenticated as:', user.uid);
          unsubscribe();
          resolve(user);
        } else {
          console.log('🔄 Signing in anonymously...');
          signInAnonymously(auth)
            .then((result) => {
              this.isAuthenticated = true;
              console.log('✅ Anonymous login successful');
              unsubscribe();
              resolve(result.user);
            })
            .catch((error) => {
              console.error('❌ Authentication failed:', error);
              this.isAuthenticated = false;
              unsubscribe();
              resolve(null);
            });
        }
      });
    });
  }

  private async ensureAuth() {
    if (!this.isAuthenticated) {
      await this.authPromise;
    }
    if (!this.isAuthenticated) {
        throw new Error("Authentication failed and could not be established.");
    }
  }

  async getActivities(): Promise<ActivityLog[]> {
    try {
      await this.ensureAuth();
      const activitiesRef = ref(db, DB_REF_NAME);
      const snapshot = await get(query(activitiesRef, orderByChild('timestamp')));
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({
          id: key,
          ...data[key],
          timestamp: new Date(data[key].timestamp).toISOString(),
        })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      } else {
        return [];
      }
    } catch (error: any) {
      console.error('❌ Error fetching activities:', error);
      throw new Error(`Failed to get activities: ${error.message}`);
    }
  }

  async addActivity(activityType: string, activityData: Omit<ActivityLog, 'id' | 'activityType' | 'timestamp'>) {
    try {
      await this.ensureAuth();
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

  async updateActivity(id: string, data: Partial<ActivityLog>) {
    await this.ensureAuth();
    const docRef = ref(db, `${DB_REF_NAME}/${id}`);
    if ('id' in data) {
        delete data.id;
    }
    await set(docRef, data);
  }

  async deleteActivity(id: string) {
    await this.ensureAuth();
    const docRef = ref(db, `${DB_REF_NAME}/${id}`);
    await set(docRef, null);
  }

  async getStatusPosts(): Promise<StatusPost[]> {
    try {
      await this.ensureAuth();
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

  async addStatusPost(statusData: { status: string, user: User }) {
    try {
      await this.ensureAuth();
      if (!auth.currentUser) throw new Error("Authentication required.");

      const newPostRef = push(ref(db, STATUS_POSTS_REF_NAME));

      const statusUpdate = {
        id: newPostRef.key,
        username: statusData.user.name,
        avatar: statusData.user.avatar,
        status: statusData.status,
        timestamp: new Date().getTime(),
      };
      
      await set(newPostRef, statusUpdate);
      return true;
    } catch (error: any) {
       console.error("❌ Error posting status:", error);
       throw error;
    }
  }

    async testDatabaseConnection() {
        try {
            await this.ensureAuth();
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
                    dashboard_version: "GIS_KPI_v1.0_RTDB_Class",
                },
            };

            await this.addActivity('test_connection', testData);
            console.log("✅ Data written successfully.");
            alert("🎉 Database connection successful! A test record has been written to 'activities'.");
        } catch (error: any) {
            console.error("❌ Database connection failed:", error);
            alert("⚠️ Connection failed: " + error.message);
        }
    }

}

// Instantiate and export the service
export const activityService = new ActivityService();


// Wrapper functions to maintain compatibility with existing code
const sanitizeUserForDB = (user: User) => ({
    name: user.name || "Anonymous",
    email: user.email || "no-email@example.com",
    role: user.role || "GIS Analyst",
    location: user.location || "CHQ",
    avatar: user.avatar || "",
});

export const updateActivity = (id: string, data: Partial<ActivityLog>) => activityService.updateActivity(id, data);
export const deleteActivity = (id: string) => activityService.deleteActivity(id);

export const addUserSignInActivity = (user: User, weather: WeatherData | null) => {
    const activityData = {
      user: sanitizeUserForDB(user),
      weather: weather ? {
        condition: weather.condition,
        temperature: weather.temp,
      } : null,
    };
    return activityService.addActivity('user_signin', activityData);
};

export const addUserSignOutActivity = (user: User, duration: number) => {
    const activityData = {
        user: sanitizeUserForDB(user),
        duration: Math.round(duration),
    };
    return activityService.addActivity('user_signout', activityData);
};

export const addUserProfileUpdateActivity = (user: User) => {
    const activityData = {
        user: sanitizeUserForDB(user)
    };
    return activityService.addActivity('profile_update', activityData);
};

export const addFileUploadActivity = (user: User, file: AppFile) => {
    const activityData = {
        user: sanitizeUserForDB(user),
        file: {
            name: file.name,
            type: file.type,
            size: file.size,
            url: file.url,
        },
    };
    return activityService.addActivity('file_upload', activityData);
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
    return activityService.addActivity('kpi_update', activityData);
};

export const addFilterChangeActivity = (user: User, filter: any) => {
    const activityData = {
        user: sanitizeUserForDB(user),
        filter_interaction: { ...filter },
    };
    return activityService.addActivity('filter_change', activityData);
};

export const testDatabaseConnection = () => activityService.testDatabaseConnection();

export const addStatusPost = (statusData: { status: string, user: User }) => activityService.addStatusPost(statusData);

export const getStatusPosts = () => activityService.getStatusPosts();
