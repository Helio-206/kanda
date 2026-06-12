import { StyleSheet, Text, View } from "react-native";

import {
  occurrenceStatusLabels,
  type OccurrenceStatus,
} from "@/types/occurrence";

type StatusBadgeProps = {
  status: OccurrenceStatus;
  compact?: boolean;
};

const statusStyles: Record<
  OccurrenceStatus,
  { backgroundColor: string; borderColor: string; textColor: string }
> = {
  enviada: {
    backgroundColor: "#F5F8FA",
    borderColor: "#D7E0EA",
    textColor: "#334155",
  },
  recebida: {
    backgroundColor: "#D9F3EF",
    borderColor: "#B7E4DA",
    textColor: "#0F766E",
  },
  em_analise: {
    backgroundColor: "#EEF2FF",
    borderColor: "#C7D2FE",
    textColor: "#4338CA",
  },
  em_execucao: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
    textColor: "#065F46",
  },
  resolvida: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
    textColor: "#065F46",
  },
  rejeitada: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    textColor: "#991B1B",
  },
};

export function StatusBadge({ status, compact = false }: StatusBadgeProps) {
  const palette = statusStyles[status];

  return (
    <View
      style={[
        styles.badge,
        compact && styles.compact,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
        },
      ]}>
      <Text style={[styles.text, { color: palette.textColor }]}>
        {occurrenceStatusLabels[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  compact: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  text: {
    fontSize: 12,
    fontWeight: "800",
  },
});
