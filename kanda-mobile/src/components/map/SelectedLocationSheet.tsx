import { Pressable, StyleSheet, Text, View } from "react-native";

import type { OccurrenceGeoDraft } from "@/types/geo";
import { colors, shadows, spacing } from "@/utils/theme";

type SelectedLocationSheetProps = {
  draft: OccurrenceGeoDraft;
  onConfirm: () => void;
  onCancel: () => void;
};

export function SelectedLocationSheet({ draft, onConfirm, onCancel }: SelectedLocationSheetProps) {
  return (
    <View style={styles.sheet}>
      <View style={styles.handle} />

      <Text style={styles.kicker}>Local escolhido</Text>
      <Text style={styles.title}>{draft.addressLabel ?? "Ponto escolhido no mapa"}</Text>
      <Text style={styles.subtitle}>
        {draft.selectedOnMap ? "selecionado manualmente" : "capturado"} • pronto para confirmar
      </Text>

      <View style={styles.actions}>
        <Pressable onPress={onCancel} style={({ pressed }) => [styles.button, styles.ghost, pressed && styles.pressed]}>
          <Text style={[styles.buttonText, styles.ghostText]}>Cancelar</Text>
        </Pressable>
        <Pressable onPress={onConfirm} style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}>
          <Text style={[styles.buttonText, styles.primaryText]}>Confirmar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
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
  handle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.surfaceStrong,
    alignSelf: "center",
    marginBottom: spacing.sm,
  },
  kicker: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  button: {
    flex: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
  },
  ghost: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primary: {
    backgroundColor: colors.text,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "800",
  },
  ghostText: {
    color: colors.text,
  },
  primaryText: {
    color: colors.surface,
  },
});
