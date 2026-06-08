interface NominatimAddress {
  neighbourhood?: string;
  suburb?: string;
  quarter?: string;
  city_district?: string;
  hamlet?: string;
  village?: string;
  town?: string;
  city?: string;
  municipality?: string;
  county?: string;
  state?: string;
  country?: string;
  road?: string;
}

interface NominatimReverseResult {
  display_name?: string;
  address?: NominatimAddress;
}

export interface ReverseGeocodeResult {
  label: string;
  source: 'osm' | 'fallback';
}

const LUANDA_AREAS = [
  { name: 'Talatona, Luanda', lat: -8.916, lng: 13.183 },
  { name: 'Maianga, Luanda', lat: -8.836, lng: 13.235 },
  { name: 'Ingombota, Luanda', lat: -8.813, lng: 13.235 },
  { name: 'Samba, Luanda', lat: -8.872, lng: 13.233 },
  { name: 'Kilamba, Luanda', lat: -8.999, lng: 13.269 },
  { name: 'Viana, Luanda', lat: -8.904, lng: 13.372 },
];

function distanceScore(lat: number, lng: number, target: { lat: number; lng: number }) {
  return Math.abs(lat - target.lat) + Math.abs(lng - target.lng);
}

function fallbackArea(lat: number, lng: number): string {
  const nearest = [...LUANDA_AREAS].sort(
    (a, b) => distanceScore(lat, lng, a) - distanceScore(lat, lng, b),
  )[0];

  return nearest?.name ?? 'Localização GPS capturada';
}

function cleanPlaceName(value?: string): string | undefined {
  return value
    ?.replace(/^Município\s+d[aeo]s?\s+/i, '')
    .replace(/^Província\s+d[aeo]s?\s+/i, '')
    .trim();
}

function compactAddress(result: NominatimReverseResult, lat: number, lng: number): string {
  const address = result.address;
  if (!address) return fallbackArea(lat, lng);

  const area = cleanPlaceName(
    address.neighbourhood ||
      address.suburb ||
      address.quarter ||
      address.city_district ||
      address.hamlet ||
      address.village,
  );

  const municipality = cleanPlaceName(
    address.city ||
      address.town ||
      address.municipality ||
      address.county,
  );
  const state = cleanPlaceName(address.state);

  if (area && municipality && area !== municipality) return [area, municipality].join(', ');
  if (municipality && state && municipality !== state) return [municipality, state].join(', ');
  if (area && state && area !== state) return [area, state].join(', ');
  if (area || municipality || state) return area || municipality || state || fallbackArea(lat, lng);


  return result.display_name?.split(',').slice(0, 2).join(',').trim() || fallbackArea(lat, lng);
}

export async function reverseGeocodeCoordinates(
  lat: number,
  lng: number,
): Promise<ReverseGeocodeResult> {
  const params = new URLSearchParams({
    format: 'jsonv2',
    lat: String(lat),
    lon: String(lng),
    zoom: '18',
    addressdetails: '1',
    'accept-language': 'pt',
  });

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`);
    if (!response.ok) throw new Error('Reverse geocoding failed');

    const result = (await response.json()) as NominatimReverseResult;
    return {
      label: compactAddress(result, lat, lng),
      source: 'osm',
    };
  } catch {
    return {
      label: fallbackArea(lat, lng),
      source: 'fallback',
    };
  }
}
