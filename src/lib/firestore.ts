import { getFirebase } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { User, ManagedFile as AppFile, WeatherData, Kpi } from './types';

const DB_COLLECTION_NAME = 'gis-team15';

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

export const addKpiUpdateActivity = async (user: User | null, kpi: Kpi) => {
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
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding KPI update activity to Firestore: ", error);
  }
}
