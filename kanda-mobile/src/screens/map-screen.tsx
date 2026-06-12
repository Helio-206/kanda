import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, {
  Callout,
  Circle,
  Marker,
  type LongPressEvent,
  type Region,
} from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import { FloatingMapButton } from "@/components/map/FloatingMapButton";
import { SelectedLocationSheet } from "@/components/map/SelectedLocationSheet";
import { UserLocationMarker } from "@/components/map/UserLocationMarker";
import { PriorityBadge } from "@/components/priority-badge";
import { StatusBadge } from "@/components/status-badge";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { useOccurrenceStore } from "@/store/occurrence.store";
import {
  humanLocationToLabel,
  humanizeCoordinates,
} from "@/services/location-humanizer.service";
import {
  coordinatesToRegion,
  createOccurrenceGeoDraft,
  getLuandaFallbackRegion,
} from "@/services/location.service";
import type { Coordinates, MapRegion, OccurrenceGeoDraft } from "@/types/geo";
import type { Occurrence } from "@/types/occurrence";
import { colors, radius, shadows, spacing } from "@/utils/theme";

const initialRegion = getLuandaFallbackRegion();

function pickParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function markerColor(occurrence: Occurrence) {
  if (occurrence.status === "resolvida") return "#16A34A";
  if (occurrence.status === "rejeitada") return "#991B1B";
  if (occurrence.priority === "critica") return "#DC2626";
  if (occurrence.priority === "alta") return "#F97316";
  if (occurrence.priority === "media") return "#2563EB";
  return "#0F766E";
}

export function MapScreen() {
  const mapRef = useRef<MapView | null>(null);
  const params = useLocalSearchParams<{ occurrenceId?: string | string[] }>();

  const occurrences = useOccurrenceStore((state) => state.occurrences);
  const getOccurrenceById = useOccurrenceStore((state) => state.getOccurrenceById);

  const [mapReady, setMapReady] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapLoadTimedOut, setMapLoadTimedOut] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<MapRegion>(initialRegion);
  const [selectedDraft, setSelectedDraft] = useState<OccurrenceGeoDraft | null>(null);
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState<string | null>(null);
  const [hasCenteredOnUser, setHasCenteredOnUser] = useState(false);
  const draftRequestRef = useRef(0);

  const {
    permission,
    loading,
    error,
    lastKnownLocation,
    requestPermission,
    checkPermission,
    getCurrentPosition,
    watchPosition,
    stopWatching,
  } = useCurrentLocation();

  const selectedOccurrence = selectedOccurrenceId
    ? occurrences.find((occurrence) => occurrence.id === selectedOccurrenceId) ?? null
    : null;

  const routeOccurrenceId = pickParam(params.occurrenceId);

  const userCoordinate = useMemo<Coordinates | null>(() => {
    if (!lastKnownLocation) {
      return null;
    }

    return {
      latitude: lastKnownLocation.latitude,
      longitude: lastKnownLocation.longitude,
    };
  }, [lastKnownLocation]);

  const focusOnCoordinate = useCallback(
    (coordinate: Coordinates, accuracy?: number | null) => {
      const region = coordinatesToRegion(coordinate, accuracy);
      setCurrentRegion(region);
      mapRef.current?.animateToRegion(region, 450);
    },
    []
  );

  useEffect(() => {
    const run = checkPermission ?? (async () => "unavailable" as const);
    void run();
  }, [checkPermission]);

  useEffect(() => {
    if (permission === "granted") {
      void watchPosition();
      return;
    }

    stopWatching();
  }, [permission, stopWatching, watchPosition]);

  useEffect(() => {
    if (permission !== "granted" || lastKnownLocation) {
      return;
    }

    void getCurrentPosition();
  }, [getCurrentPosition, lastKnownLocation, permission]);

  useEffect(() => {
    if (mapLoaded) {
      setMapLoadTimedOut(false);
      return;
    }

    const timer = setTimeout(() => {
      setMapLoadTimedOut(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, [mapLoaded]);

  useEffect(() => {
    if (!userCoordinate || hasCenteredOnUser || !mapReady) {
      return;
    }

    const region = coordinatesToRegion(userCoordinate, lastKnownLocation?.accuracy ?? null);
    setCurrentRegion(region);
    mapRef.current?.animateToRegion(region, 450);
    setHasCenteredOnUser(true);
  }, [hasCenteredOnUser, lastKnownLocation?.accuracy, mapReady, userCoordinate]);

  useEffect(() => {
    if (!routeOccurrenceId || !mapReady) {
      return;
    }

    const occurrence = getOccurrenceById(routeOccurrenceId);

    if (!occurrence) {
      return;
    }

    setSelectedOccurrenceId(occurrence.id);
    focusOnCoordinate(
      {
        latitude: occurrence.latitude,
        longitude: occurrence.longitude,
      },
      occurrence.accuracy ?? null
    );
  }, [focusOnCoordinate, getOccurrenceById, mapReady, routeOccurrenceId]);

  const handleMyLocation = useCallback(async () => {
    if (permission !== "granted") {
      const nextPermission = await (requestPermission ?? (async () => "unavailable" as const))();

      if (nextPermission !== "granted") {
        return;
      }
    }

    const location = lastKnownLocation ?? (await getCurrentPosition());

    if (!location) {
      return;
    }

    setHasCenteredOnUser(true);
    setSelectedOccurrenceId(null);
    focusOnCoordinate(
      {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      location.accuracy
    );
  }, [
    focusOnCoordinate,
    getCurrentPosition,
    lastKnownLocation,
    permission,
    requestPermission,
  ]);

  const handleReportHere = useCallback(() => {
    const draft = createOccurrenceGeoDraft(
      {
        latitude: currentRegion.latitude,
        longitude: currentRegion.longitude,
      },
      lastKnownLocation?.accuracy ?? null,
      "A identificar localização"
    );

    setSelectedOccurrenceId(null);
    setSelectedDraft(draft);

    const requestId = ++draftRequestRef.current;
    void humanizeCoordinates({
      latitude: currentRegion.latitude,
      longitude: currentRegion.longitude,
    }).then((humanLocation) => {
      if (draftRequestRef.current !== requestId) {
        return;
      }

      setSelectedDraft((current) =>
        current
          ? {
              ...current,
              addressLabel: humanLocationToLabel(humanLocation),
            }
          : current
      );
    });
  }, [currentRegion.latitude, currentRegion.longitude, lastKnownLocation?.accuracy]);

  const handleLongPress = useCallback(
    (event: LongPressEvent) => {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      setSelectedOccurrenceId(null);
      setSelectedDraft(
        createOccurrenceGeoDraft(
          { latitude, longitude },
          lastKnownLocation?.accuracy ?? null,
          "A identificar localização"
        )
      );

      const requestId = ++draftRequestRef.current;
      void humanizeCoordinates({ latitude, longitude }).then((humanLocation) => {
        if (draftRequestRef.current !== requestId) {
          return;
        }

        setSelectedDraft((current) =>
          current
            ? {
                ...current,
                addressLabel: humanLocationToLabel(humanLocation),
              }
            : current
        );
      });
    },
    [lastKnownLocation?.accuracy]
  );

  const handleSelectOccurrence = useCallback(
    (occurrence: Occurrence) => {
      setSelectedDraft(null);
      setSelectedOccurrenceId(occurrence.id);
      focusOnCoordinate(
        {
          latitude: occurrence.latitude,
          longitude: occurrence.longitude,
        },
        occurrence.accuracy ?? null
      );
    },
    [focusOnCoordinate]
  );

  const handleConfirmDraft = useCallback(() => {
    if (!selectedDraft) {
      return;
    }

    router.push({
      pathname: "/report",
      params: {
        latitude: String(selectedDraft.latitude),
        longitude: String(selectedDraft.longitude),
        accuracy: selectedDraft.accuracy != null ? String(selectedDraft.accuracy) : "",
        addressLabel: selectedDraft.addressLabel ?? "",
        selectedOnMap: "1",
        capturedAt: selectedDraft.capturedAt,
      },
    });
    setSelectedDraft(null);
  }, [selectedDraft]);

  const handleCancelDraft = useCallback(() => {
    setSelectedDraft(null);
  }, []);

  const closeOccurrencePreview = useCallback(() => {
    setSelectedOccurrenceId(null);
  }, []);

  const openOccurrenceDetails = useCallback((occurrenceId: string) => {
    router.push({
      pathname: "/occurrence/[id]",
      params: { id: occurrenceId },
    });
  }, []);

  const permissionHint =
    permission === "blocked"
      ? "Permissão bloqueada. Abre as definições da app se quiseres usar o GPS."
      : permission === "denied"
        ? "Permissão negada. O mapa fica centrado em Luanda até decidires activar o GPS."
        : permission === "unavailable"
          ? "O GPS está desligado. Liga a localização do telefone e tenta outra vez."
          : occurrences.length === 0
            ? "Ainda não tens ocorrências guardadas."
            : `${occurrences.length} ocorrência${occurrences.length === 1 ? "" : "s"} guardada${occurrences.length === 1 ? "" : "s"} para rever no mapa.`;

  const locationHint = loading && permission === "granted" ? "A localizar-te..." : permissionHint;

  const selectedOccurrenceSheet = selectedOccurrence ? (
    <View style={styles.previewSheet}>
      <View style={styles.sheetHandle} />
      <View style={styles.previewHeader}>
          <View style={styles.previewTitleBlock}>
            <Text style={styles.previewKicker}>Ocorrência</Text>
            <Text style={styles.previewTitle}>{selectedOccurrence.title}</Text>
            <Text style={styles.previewCode}>{selectedOccurrence.code}</Text>
            <Text style={styles.previewMeta}>
              {selectedOccurrence.addressLabel ?? "Sem referência"} •{" "}
            {new Date(selectedOccurrence.createdAt).toLocaleDateString("pt-AO", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </Text>
        </View>

        <Pressable onPress={closeOccurrencePreview} style={styles.previewClose}>
          <Text style={styles.previewCloseText}>Fechar</Text>
        </Pressable>
      </View>

      <View style={styles.previewPillsRow}>
        <StatusBadge status={selectedOccurrence.status} compact />
        <PriorityBadge priority={selectedOccurrence.priority} compact />
      </View>

      <Text style={styles.previewDescription}>{selectedOccurrence.description}</Text>

      <Pressable
        onPress={() => openOccurrenceDetails(selectedOccurrence.id)}
        style={({ pressed }) => [styles.previewButton, pressed && styles.previewButtonPressed]}>
        <Text style={styles.previewButtonText}>Abrir detalhes</Text>
      </Pressable>
    </View>
  ) : null;

  return (
    <View style={styles.root}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        onMapReady={() => setMapReady(true)}
        onMapLoaded={() => setMapLoaded(true)}
        onRegionChangeComplete={(region: Region) => setCurrentRegion(region)}
        onLongPress={handleLongPress}
        showsUserLocation={false}
        showsMyLocationButton={false}
        rotateEnabled={false}
      >
        {occurrences.map((occurrence) => {
          const accent = markerColor(occurrence);

          return (
            <Marker
              key={occurrence.id}
              coordinate={{ latitude: occurrence.latitude, longitude: occurrence.longitude }}
              onPress={() => handleSelectOccurrence(occurrence)}
              tracksViewChanges={false}>
              <View style={[styles.marker, { borderColor: accent }]}>
                <View style={[styles.markerInner, { backgroundColor: accent }]} />
              </View>
              <Callout onPress={() => openOccurrenceDetails(occurrence.id)}>
                <View style={styles.calloutCard}>
                  <Text style={styles.calloutTitle}>{occurrence.title}</Text>
                  <Text style={styles.calloutCode}>{occurrence.code}</Text>
                  <Text style={styles.calloutText}>
                    {occurrence.addressLabel ?? "Sem referência"}
                  </Text>
                  <View style={styles.calloutBadges}>
                    <StatusBadge status={occurrence.status} compact />
                    <PriorityBadge priority={occurrence.priority} compact />
                  </View>
                  <Text style={styles.calloutLink}>Ver detalhes</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}

        {userCoordinate ? (
          <>
            <Circle
              center={userCoordinate}
              radius={Math.max((lastKnownLocation?.accuracy ?? 80) * 1.2, 40)}
              fillColor="rgba(15, 118, 110, 0.12)"
              strokeColor="rgba(15, 118, 110, 0.18)"
            />
            <UserLocationMarker coordinate={userCoordinate} />
          </>
        ) : null}

        {selectedDraft ? (
          <Marker
            coordinate={{
              latitude: selectedDraft.latitude,
              longitude: selectedDraft.longitude,
            }}
            anchor={{ x: 0.5, y: 1 }}
            tracksViewChanges={false}>
            <View style={styles.selectedPin}>
              <View style={styles.selectedPinDot} />
            </View>
          </Marker>
        ) : null}
      </MapView>

      <View pointerEvents="box-none" style={styles.overlay}>
        <SafeAreaView pointerEvents="box-none" style={styles.safeOverlay}>
          <View style={styles.topStack} pointerEvents="box-none">
            <View style={styles.statusCard}>
              <Text style={styles.statusLabel}>Mapa de casos</Text>
              <Text style={styles.statusTitle}>Luanda em leitura comunitária</Text>
              <Text style={styles.statusText}>{locationHint}</Text>
            </View>

            {(error || mapLoadTimedOut) && (
              <View style={styles.warningCard}>
                <Text style={styles.warningTitle}>Problema de localização</Text>
                <Text style={styles.warningText}>{error ?? "O mapa está a demorar a carregar."}</Text>
              </View>
            )}
          </View>

          <View style={styles.controls}>
            <FloatingMapButton
              label="Minha localização"
              symbol="◎"
              onPress={handleMyLocation}
              variant="surface"
            />
            <FloatingMapButton
              label="Reportar ocorrência"
              symbol="+"
              onPress={handleReportHere}
              variant="primary"
            />
          </View>

          {selectedDraft ? (
            <View style={styles.sheetWrap} pointerEvents="box-none">
              <SelectedLocationSheet
                draft={selectedDraft}
                onConfirm={handleConfirmDraft}
                onCancel={handleCancelDraft}
              />
            </View>
          ) : selectedOccurrenceSheet ? (
            <View style={styles.sheetWrap} pointerEvents="box-none">
              {selectedOccurrenceSheet}
            </View>
          ) : null}
        </SafeAreaView>
      </View>

      {!mapLoaded && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <View style={styles.loadingCard}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>
              A carregar mapa
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  safeOverlay: {
    flex: 1,
    justifyContent: "space-between",
  },
  topStack: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  statusCard: {
    alignSelf: "flex-start",
    maxWidth: "86%",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(215, 224, 234, 0.9)",
    ...shadows,
  },
  statusLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  statusTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  statusText: {
    color: colors.textSoft,
    fontSize: 12,
    lineHeight: 17,
  },
  warningCard: {
    alignSelf: "flex-start",
    maxWidth: "92%",
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...shadows,
  },
  warningTitle: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 4,
  },
  warningText: {
    color: "rgba(255, 255, 255, 0.84)",
    fontSize: 12,
    lineHeight: 17,
  },
  controls: {
    position: "absolute",
    right: spacing.md,
    bottom: 204,
    gap: spacing.sm,
  },
  sheetWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  loadingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    ...shadows,
  },
  loadingText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  selectedPin: {
    alignItems: "center",
    justifyContent: "center",
  },
  selectedPinDot: {
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: "#F97316",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    transform: [{ translateY: 6 }],
  },
  marker: {
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    ...shadows,
  },
  markerInner: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  previewSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    ...shadows,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.surfaceStrong,
    alignSelf: "center",
    marginBottom: spacing.xs,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  previewTitleBlock: {
    flex: 1,
    gap: 4,
  },
  previewKicker: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  previewTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  previewCode: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  previewMeta: {
    color: colors.textSoft,
    fontSize: 12,
    lineHeight: 17,
  },
  previewClose: {
    backgroundColor: colors.background,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewCloseText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  previewPillsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  previewDescription: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  previewCoords: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "600",
  },
  previewButton: {
    backgroundColor: colors.text,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  previewButtonPressed: {
    opacity: 0.88,
  },
  previewButtonText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: "800",
  },
  calloutCard: {
    minWidth: 160,
    maxWidth: 220,
    gap: 6,
    padding: spacing.sm,
  },
  calloutTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  calloutCode: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  calloutText: {
    color: colors.textSoft,
    fontSize: 12,
    lineHeight: 16,
  },
  calloutBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    paddingTop: 2,
  },
  calloutLink: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
});
