import { View, StyleSheet } from "react-native";
import { Marker } from "react-native-maps";

import type { Coordinates } from "@/types/geo";

type UserLocationMarkerProps = {
  coordinate: Coordinates;
};

export function UserLocationMarker({ coordinate }: UserLocationMarkerProps) {
  return (
    <Marker coordinate={coordinate} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
      <View style={styles.outer}>
        <View style={styles.inner} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: "rgba(15, 118, 110, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(15, 118, 110, 0.3)",
  },
  inner: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: "#0F766E",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
