import * as Location from "expo-location";

import type {
  Coordinates,
  GeoPoint,
  LocationPermissionStatus,
  MapRegion,
  OccurrenceGeoDraft,
} from "@/types/geo";

export const LUANDA_COORDINATES: Coordinates = {
  latitude: -8.839,
  longitude: 13.2894,
};

export const LUANDA_REGION: MapRegion = {
  ...LUANDA_COORDINATES,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const CURRENT_LOCATION_TIMEOUT_MS = 12000;
const WATCH_DISTANCE_INTERVAL_METERS = 15;
const WATCH_TIME_INTERVAL_MS = 5000;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }) as Promise<T>;
}

export function isValidCoordinates(value: Partial<Coordinates> | null | undefined): value is Coordinates {
  if (!value) {
    return false;
  }

  const { latitude, longitude } = value;

  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export function distanceBetweenCoordinates(a: Coordinates, b: Coordinates) {
  const earthRadius = 6371000;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const deltaLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const deltaLng = ((b.longitude - a.longitude) * Math.PI) / 180;

  const haversine =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  return 2 * earthRadius * Math.asin(Math.sqrt(haversine));
}

export function coordinatesToRegion(coordinates: Coordinates, accuracyMeters?: number | null): MapRegion {
  const spread = accuracyMeters ? clamp(accuracyMeters / 9000, 0.01, 0.12) : 0.02;

  return {
    ...coordinates,
    latitudeDelta: spread,
    longitudeDelta: spread * 1.15,
  };
}

export function getLuandaFallbackRegion() {
  return LUANDA_REGION;
}

export function getLuandaFallbackPoint(): GeoPoint {
  return {
    ...LUANDA_COORDINATES,
    accuracy: null,
    timestamp: Date.now(),
    addressLabel: "Luanda, Angola",
  };
}

export function createOccurrenceGeoDraft(
  coordinates: Coordinates,
  accuracy: number | null,
  addressLabel?: string
): OccurrenceGeoDraft {
  return {
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    accuracy,
    addressLabel,
    selectedOnMap: true,
    capturedAt: new Date().toISOString(),
  };
}

function normalizePermissionStatus(
  response: Location.LocationPermissionResponse
): LocationPermissionStatus {
  if (response.granted) {
    return "granted";
  }

  if (!response.canAskAgain) {
    return "blocked";
  }

  return response.status as "denied" | "undetermined";
}

async function ensureLocationServicesEnabled() {
  const enabled = await Location.hasServicesEnabledAsync();

  if (!enabled) {
    throw new Error("Serviços de localização desligados. Ativa o GPS e tenta outra vez.");
  }
}

async function ensurePermissionGranted() {
  const permission = await Location.getForegroundPermissionsAsync();

  if (!permission.granted) {
    throw new Error("Permissão de localização não concedida.");
  }
}

function toGeoPoint(location: Location.LocationObject): GeoPoint {
  const { coords, timestamp } = location;

  if (!isValidCoordinates(coords)) {
    throw new Error("Localização inválida.");
  }

  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy ?? null,
    timestamp,
  };
}

export async function requestLocationPermission(): Promise<LocationPermissionStatus> {
  await ensureLocationServicesEnabled();

  const current = await Location.getForegroundPermissionsAsync();
  if (current.granted) {
    return "granted";
  }

  const response = await Location.requestForegroundPermissionsAsync();
  return normalizePermissionStatus(response);
}

export async function getLocationPermissionStatus(): Promise<LocationPermissionStatus> {
  await ensureLocationServicesEnabled();

  const current = await Location.getForegroundPermissionsAsync();
  return normalizePermissionStatus(current);
}

export async function getCurrentLocation(): Promise<GeoPoint> {
  await ensureLocationServicesEnabled();
  await ensurePermissionGranted();

  const lastKnown = await Location.getLastKnownPositionAsync({
    maxAge: 5 * 60 * 1000,
    requiredAccuracy: 1000,
  });

  if (lastKnown && isValidCoordinates(lastKnown.coords)) {
    return toGeoPoint(lastKnown);
  }

  const current = await withTimeout(
    Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      mayShowUserSettingsDialog: true,
    }),
    CURRENT_LOCATION_TIMEOUT_MS,
    "A localização demorou demasiado a responder."
  );

  return toGeoPoint(current);
}

export async function watchCurrentLocation(
  onLocation: (location: GeoPoint) => void
): Promise<Location.LocationSubscription> {
  await ensureLocationServicesEnabled();
  await ensurePermissionGranted();

  return Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: WATCH_DISTANCE_INTERVAL_METERS,
      timeInterval: WATCH_TIME_INTERVAL_MS,
      mayShowUserSettingsDialog: true,
    },
    (location) => {
      if (!isValidCoordinates(location.coords)) {
        return;
      }

      onLocation(toGeoPoint(location));
    }
  );
}
