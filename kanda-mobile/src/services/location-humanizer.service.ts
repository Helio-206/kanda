import * as Location from "expo-location";

import { LUANDA_COORDINATES, distanceBetweenCoordinates, isValidCoordinates } from "@/services/location.service";
import type { Coordinates, HumanLocation } from "@/types/geo";

type LocationHint = {
  center: Coordinates;
  radiusMeters: number;
  title: string;
  subtitle: string;
  district: string;
  city: string;
  province: string;
  confidence: number;
};

const luandaHints: LocationHint[] = [
  {
    center: { latitude: -8.815, longitude: 13.23 },
    radiusMeters: 4500,
    title: "Rua Comandante Gika",
    subtitle: "Maianga, Luanda",
    district: "Maianga",
    city: "Luanda",
    province: "Luanda",
    confidence: 0.72,
  },
  {
    center: { latitude: -8.93, longitude: 13.34 },
    radiusMeters: 6500,
    title: "Perto do Mercado do 30",
    subtitle: "Viana, Luanda",
    district: "Viana",
    city: "Luanda",
    province: "Luanda",
    confidence: 0.66,
  },
  {
    center: { latitude: -8.9, longitude: 13.17 },
    radiusMeters: 5500,
    title: "Bairro Popular",
    subtitle: "Luanda",
    district: "Cazenga",
    city: "Luanda",
    province: "Luanda",
    confidence: 0.64,
  },
  {
    center: { latitude: -8.85, longitude: 13.2 },
    radiusMeters: 5500,
    title: "Centro de Luanda",
    subtitle: "Luanda",
    district: "Ingombota",
    city: "Luanda",
    province: "Luanda",
    confidence: 0.7,
  },
  {
    center: { latitude: -8.96, longitude: 13.27 },
    radiusMeters: 7000,
    title: "Kilamba",
    subtitle: "Luanda",
    district: "Kilamba Kiaxi",
    city: "Luanda",
    province: "Luanda",
    confidence: 0.68,
  },
];

function clampConfidence(value: number) {
  return Math.max(0.1, Math.min(value, 0.99));
}

function buildSubtitle(parts: string[]) {
  return parts.filter(Boolean).join(", ");
}

function buildHumanLocation(params: {
  title: string;
  subtitle?: string;
  district?: string;
  city: string;
  province: string;
  confidence: number;
}): HumanLocation {
  return {
    title: params.title,
    subtitle: params.subtitle,
    district: params.district,
    city: params.city,
    province: params.province,
    confidence: clampConfidence(params.confidence),
  };
}

function fromReverseGeocode(result: Location.LocationGeocodedAddress): HumanLocation {
  const street = result.street?.trim();
  const streetNumber = result.streetNumber?.trim();
  const name = result.name?.trim();
  const district = result.subregion?.trim() || result.district?.trim() || result.city?.trim();
  const city = result.city?.trim() || result.subregion?.trim() || "Luanda";
  const province = result.region?.trim() || result.city?.trim() || "Luanda";

  const title =
    street && streetNumber
      ? `${street}, ${streetNumber}`
      : street || name || district || city;

  const subtitleParts: string[] = [];

  if (district && district !== title) {
    subtitleParts.push(district);
  }

  subtitleParts.push(city);

  if (province !== city) {
    subtitleParts.push(province);
  }

  const subtitle = buildSubtitle(subtitleParts);

  return buildHumanLocation({
    title: title ?? city,
    subtitle: subtitle || city,
    district,
    city,
    province,
    confidence: street || name ? 0.9 : district ? 0.76 : 0.62,
  });
}

function fromLuandaFallback(coordinates: Coordinates): HumanLocation {
  const hint = luandaHints.find((item) => {
    const distance = distanceBetweenCoordinates(coordinates, item.center);
    return distance <= item.radiusMeters;
  });

  if (hint) {
    return buildHumanLocation(hint);
  }

  const distanceToCenter = distanceBetweenCoordinates(coordinates, LUANDA_COORDINATES);

  return buildHumanLocation({
    title: "Ponto em Luanda",
    subtitle: "Luanda",
    district: undefined,
    city: "Luanda",
    province: "Luanda",
    confidence: distanceToCenter < 22000 ? 0.48 : 0.34,
  });
}

export async function humanizeCoordinates(coordinates: Coordinates): Promise<HumanLocation> {
  if (!isValidCoordinates(coordinates)) {
    return fromLuandaFallback(LUANDA_COORDINATES);
  }

  try {
    const results = await Location.reverseGeocodeAsync(coordinates);
    const first = results[0];

    if (first) {
      return fromReverseGeocode(first);
    }
  } catch {
    // stub até o reverse geocoding comportar-se sempre
  }

  return fromLuandaFallback(coordinates);
}

export function humanLocationToLabel(location: HumanLocation) {
  return location.subtitle ? `${location.title} • ${location.subtitle}` : location.title;
}
