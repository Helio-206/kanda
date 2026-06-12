import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";

import { colors, shadows, spacing } from "@/utils/theme";

type FloatingMapButtonProps = {
  label: string;
  symbol: string;
  onPress: () => void;
  variant?: "primary" | "surface";
  disabled?: boolean;
  style?: ViewStyle;
};

export function FloatingMapButton({
  label,
  symbol,
  onPress,
  variant = "surface",
  disabled,
  style,
}: FloatingMapButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === "primary" ? styles.primary : styles.surface,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}>
      <Text style={[styles.symbol, variant === "primary" && styles.primaryText]}>{symbol}</Text>
      <Text style={[styles.label, variant === "primary" && styles.primaryText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    minWidth: 164,
    justifyContent: "center",
    ...shadows,
  },
  surface: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primary: {
    backgroundColor: colors.text,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  symbol: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 18,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.1,
  },
  primaryText: {
    color: colors.surface,
  },
});
