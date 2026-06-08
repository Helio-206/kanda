import { useState } from 'react';
import { Loader2, Navigation2 } from 'lucide-react';
import type { OccurrenceLocation } from '@/types/occurrence';
import RealMap from '@/components/maps/RealMap';
import { reverseGeocodeCoordinates } from '@/lib/geo/reverseGeocode';

interface LocationInputProps {
  value: OccurrenceLocation;
  onChange: (location: OccurrenceLocation) => void;
}

export default function LocationInput({ value, onChange }: LocationInputProps) {
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState('A obter localização...');
  const [error, setError] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [resolvedBy, setResolvedBy] = useState<'osm' | 'fallback' | null>(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocalização não disponível neste dispositivo.');
      return;
    }

    setLoading(true);
    setLoadingLabel('A obter coordenadas GPS...');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        onChange({
          latitude,
          longitude,
          address: 'A identificar local...',
        });
        setAccuracy(position.coords.accuracy);

        setLoadingLabel('A identificar bairro...');
        const resolved = await reverseGeocodeCoordinates(latitude, longitude);
        setResolvedBy(resolved.source);
        onChange({
          latitude,
          longitude,
          address: resolved.label,
        });

        setLoading(false);
      },
      () => {
        setError('Não foi possível obter a localização. Insira o endereço manualmente.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const previewCenter =
    value.latitude !== null && value.longitude !== null
      ? { lat: value.latitude, lng: value.longitude }
      : { lat: -8.92441, lng: 13.30128 };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-4">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-kanda-text-primary mb-2">
            Localização
          </label>
          <input
            id="address"
            type="text"
            value={value.address}
            onChange={(e) =>
              onChange({
                ...value,
                address: e.target.value,
              })
            }
            placeholder="Ex.: Talatona, Luanda"
            className="w-full rounded-lg border border-kanda-border bg-white px-4 py-3 text-kanda-text-primary placeholder:text-kanda-text-secondary/60 focus:border-kanda-primary focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={requestLocation}
          disabled={loading}
          className="btn-secondary w-full sm:w-auto disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="inline mr-2 animate-spin" size={16} />
              {loadingLabel}
            </>
          ) : (
            <>
              <Navigation2 className="inline mr-2 -mt-0.5" size={16} />
              Capturar GPS actual
            </>
          )}
        </button>

        {error && <p className="text-sm text-red-700">{error}</p>}
      </div>

      <div className="overflow-hidden rounded-lg border border-kanda-border bg-white">
        <div className="relative h-44">
          <RealMap
            center={previewCenter}
            points={[
              {
                id: 'preview-location',
                label: value.address || 'Pré-visualização de localização',
                lat: previewCenter.lat,
                lng: previewCenter.lng,
                primary: true,
              },
            ]}
            zoom={value.latitude !== null && value.longitude !== null ? 16 : 13}
            height="100%"
            interactive={false}
            showRadius={value.latitude !== null && value.longitude !== null}
            radiusMeters={120}
          />
        </div>
        <div className="border-t border-kanda-divider bg-white px-4 py-3">
          <p className="text-xs font-medium text-kanda-text-primary">
            {value.latitude !== null && value.longitude !== null
              ? value.address || 'Localização capturada'
              : 'Aguardando localização'}
          </p>
          {value.latitude !== null && value.longitude !== null ? (
            <div className="mt-1 space-y-1 text-xs text-kanda-text-secondary">
              <p>{value.latitude.toFixed(5)}, {value.longitude.toFixed(5)}</p>
              {accuracy !== null && <p>Precisão aproximada: ± {Math.round(accuracy)} m</p>}
              {resolvedBy === 'osm' && <p>Nome obtido por OpenStreetMap</p>}
            </div>
          ) : (
            <p className="mt-1 text-xs text-kanda-text-secondary">
              Use GPS ou informe uma referência manual.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
