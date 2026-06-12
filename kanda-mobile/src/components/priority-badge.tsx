import { StyleSheet, Text, View } from "react-native";

import {
  occurrencePriorityLabels,
  type OccurrencePriority,
} from "@/types/occurrence";

type PriorityBadgeProps = {
  priority: OccurrencePriority;
  compact?: boolean;
};

const priorityStyles: Record<
  OccurrencePriority,
  { backgroundColor: string; borderColor: string; textColor: string }
> = {
  baixa: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    textColor: "#166534",
  },
  media: {
    backgroundColor: "#EEF2FF",
    borderColor: "#C7D2FE",
    textColor: "#3730A3",
  },
  alta: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FDBA74",
    textColor: "#C2410C",
  },
  critica: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
    textColor: "#B91C1C",
  },
};

export function PriorityBadge({ priority, compact = false }: PriorityBadgeProps) {
  const palette = priorityStyles[priority];

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
        {occurrencePriorityLabels[priority]}
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
