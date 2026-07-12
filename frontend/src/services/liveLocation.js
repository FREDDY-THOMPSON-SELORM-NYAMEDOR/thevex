import * as Location from 'expo-location';
import { postJson } from './api';

let locationSubscription = null;

async function pushLocation(userId, coords) {
  try {
    await postJson('/location/update', {
      userId,
      latitude: coords.latitude,
      longitude: coords.longitude
    });
  } catch (error) {
    console.warn('Location update failed:', error.message || error);
  }
}

export async function startLiveLocationTracking(userId) {
  if (!userId) return null;

  await stopLiveLocationTracking();

  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== 'granted') {
    console.warn('Location permission not granted');
    return null;
  }

  try {
    const currentPosition = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest
    });
    await pushLocation(userId, currentPosition.coords);
  } catch (error) {
    console.warn('Could not get current position:', error.message || error);
  }

  locationSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Highest,
      distanceInterval: 5,
      timeInterval: 4000
    },
    (position) => {
      pushLocation(userId, position.coords);
    }
  );

  return stopLiveLocationTracking;
}

export async function stopLiveLocationTracking() {
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }
}