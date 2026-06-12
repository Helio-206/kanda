import { useCallback, useEffect, useRef, useState } from "react";

import {
  getCurrentLocation,
  getLocationPermissionStatus,
  requestLocationPermission,
  watchCurrentLocation,
} from "@/services/location.service";
import type { GeoPoint, LocationPermissionStatus } from "@/types/geo";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Não foi possível obter a localização.";
}

export function useCurrentLocation() {
  const watchSubscription = useRef<{ remove: () => void } | null>(null);
  const mounted = useRef(true);

  const [permission, setPermission] = useState<LocationPermissionStatus>("undetermined");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastKnownLocation, setLastKnownLocation] = useState<GeoPoint | null>(null);

  useEffect(() => {
    return () => {
      mounted.current = false;
      watchSubscription.current?.remove();
      watchSubscription.current = null;
    };
  }, []);

  const stopWatching = useCallback(() => {
    watchSubscription.current?.remove();
    watchSubscription.current = null;
  }, []);

  const requestPermission = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextPermission = await requestLocationPermission();

      if (!mounted.current) {
        return nextPermission;
      }

      setPermission(nextPermission);
      return nextPermission;
    } catch (exception) {
      const message = getErrorMessage(exception);

      if (mounted.current) {
        setError(message);
        setPermission("unavailable");
      }

      return "unavailable";
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, []);

  const checkPermission = useCallback(async () => {
    try {
      const nextPermission = await getLocationPermissionStatus();

      if (!mounted.current) {
        return nextPermission;
      }

      setPermission(nextPermission);
      return nextPermission;
    } catch (exception) {
      const message = getErrorMessage(exception);

      if (mounted.current) {
        setError(message);
        setPermission("unavailable");
      }

      return "unavailable";
    }
  }, []);

  const getCurrentPosition = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const location = await getCurrentLocation();

      if (!mounted.current) {
        return location;
      }

      setLastKnownLocation(location);
      setPermission("granted");
      return location;
    } catch (exception) {
      if (mounted.current) {
        setError(getErrorMessage(exception));
      }

      return null;
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, []);

  const watchPosition = useCallback(async () => {
    stopWatching();

    try {
      const subscription = await watchCurrentLocation((location) => {
        if (!mounted.current) {
          return;
        }

        setLastKnownLocation(location);
      });

      if (!mounted.current) {
        subscription.remove();
        return null;
      }

      watchSubscription.current = subscription;
      return subscription;
    } catch (exception) {
      if (mounted.current) {
        setError(getErrorMessage(exception));
      }

      return null;
    }
  }, [stopWatching]);

  return {
    permission,
    loading,
    error,
    lastKnownLocation,
    requestPermission,
    getCurrentPosition,
    watchPosition,
    stopWatching,
    checkPermission,
  };
}
