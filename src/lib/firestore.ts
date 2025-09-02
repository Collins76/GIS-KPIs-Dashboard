import { getFirebase } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { User, ManagedFile as AppFile, WeatherData } from './types';

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
