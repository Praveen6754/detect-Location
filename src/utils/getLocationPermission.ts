import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';

export const getCurrentLocation = async (): Promise<{
  latitude: number;
  longitude: number;
}> => {
  const hasPermission = await hasLocationPermission();
  if (!hasPermission) throw new Error('Location permission not granted');

  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        resolve({ latitude, longitude });
      },
      error => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  });
};

const hasLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } else {
    const res = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
    if (res === RESULTS.GRANTED) return true;

    if (res === RESULTS.DENIED) {
      const requestResult = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      return requestResult === RESULTS.GRANTED;
    }

    if (res === RESULTS.BLOCKED) {
      openSettings();
      return false;
    }

    return false;
  }
};
