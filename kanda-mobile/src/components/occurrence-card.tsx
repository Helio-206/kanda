import { Pressable, StyleSheet, Text, View } from "react-native";

import { PriorityBadge } from "@/components/priority-badge";
import { StatusBadge } from "@/components/status-badge";
import {
  occurrenceCategoryLabels,
  type Occurrence,
} from "@/types/occurrence";
import { colors, radius, shadows, spacing } from "@/utils/theme";

type Props = {
  occurrence: Occurrence;
  compact?: boolean;
  onPress?: () => void;
  onPressViewOnMap?: () => void;
};
export function OccurrenceCard({ occurrence, compact = false, onPress, onPressViewOnMap }: Props) {
  const content = (
    <>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{occurrence.title}</Text>
          <Text style={styles.meta}>
            {occurrenceCategoryLabels[occurrence.category]} •{" "}
            {occurrence.addressLabel ?? "Sem referência"}
          </Text>
          <Text style={styles.code}>{occurrence.code}</Text>
        </View>
        <PriorityBadge priority={occurrence.priority} compact />
      </View>

      <View style={styles.statusRow}>
        <StatusBadge status={occurrence.status} compact />
        <View style={styles.scorePill}>
          <Text style={styles.scoreLabel}>Confiança</Text>
          <Text style={styles.scoreValue}>{occurrence.aiConfidence != null ? `${Math.round(occurrence.aiConfidence * 100)}%` : "—"}</Text>
        </View>
        <Text style={styles.dateText}>
          {new Date(occurrence.createdAt).toLocaleDateString("pt-AO", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </Text>
      </View>

      {!compact ? <Text style={styles.description}>{occurrence.description}</Text> : null}

      <View style={styles.footer}>
        <Text style={styles.footerText}>{occurrence.addressLabel ?? "Local guardado"}</Text>
        {occurrence.imageUri ? <Text style={styles.photoLabel}>Foto anexada</Text> : null}
      </View>

      {onPressViewOnMap ? (
        <Pressable
          onPress={onPressViewOnMap}
          style={({ pressed }) => [styles.mapButton, pressed && styles.mapButtonPressed]}>
          <Text style={styles.mapButtonText}>Ver no mapa</Text>
        </Pressable>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.card}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    ...shadows,
  },
  cardPressed: {
    opacity: 0.92,
  },
  header: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
  },
  meta: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  code: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  dateText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "600",
  },
  scorePill: {
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: "center",
  },
  scoreLabel: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  scoreValue: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  description: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  footerText: {
    color: colors.textSoft,
    fontSize: 12,
    lineHeight: 16,
  },
  photoLabel: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
  },
  mapButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.text,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  mapButtonPressed: {
    opacity: 0.85,
  },
  mapButtonText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: "800",
  },
});
