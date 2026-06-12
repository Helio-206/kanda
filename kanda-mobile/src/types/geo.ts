export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type MapRegion = Coordinates & {
  latitudeDelta: number;
  longitudeDelta: number;
};

export type LocationPermissionStatus =
  | "granted"
  | "denied"
  | "undetermined"
  | "blocked"
  | "unavailable";

export type GeoPoint = Coordinates & {
  accuracy: number | null;
  timestamp: number;
  addressLabel?: string | null;
};

export type AddressPreview = {
  label: string;
  secondaryLabel?: string;
  city?: string;
  district?: string;
  country?: string;
};

export type HumanLocation = {
  title: string;
  subtitle?: string;
  district?: string;
  city: string;
  province: string;
  confidence: number;
};

export type OccurrenceGeoDraft = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  addressLabel?: string;
  selectedOnMap: boolean;
  capturedAt: string;
};
