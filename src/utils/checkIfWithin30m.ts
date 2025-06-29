import { getCurrentLocation } from './getLocationPermission'; // You must create this first (see previous message)

/**
 * Calculates distance between two GPS coordinates using the Haversine formula.
 */
const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371e3; // Earth radius in meters

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Checks whether user is within 30 meters of a given lat/long.
 */
export const checkIfWithin30Meters = async (
  targetLat: number,
  targetLong: number
): Promise<{
  presentableLocation: boolean;
  actualLocation: { latitude: number; longitude: number };
  howFar: number;
}> => {
  const actualLocation = await getCurrentLocation(); // handles permissions too

  const howFar = haversineDistance(
    actualLocation.latitude,
    actualLocation.longitude,
    targetLat,
    targetLong
  );

  return {
    presentableLocation: howFar <= 30,
    actualLocation,
    howFar: Math.round(howFar),
  };
};