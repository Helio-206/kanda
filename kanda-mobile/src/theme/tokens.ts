import { Platform } from "react-native";

export const tokens = {
  colors: {
    brand: "#0F766E",
    brandSoft: "#D9F3EF",
    background: "#F4F7FB",
    surface: "#FFFFFF",
    surfaceMuted: "#E8EEF5",
    surfaceStrong: "#DCE5EE",
    textPrimary: "#0F172A",
    textSecondary: "#64748B",
    border: "#D7E0EA",
    success: "#16A34A",
    warning: "#D97706",
    danger: "#DC2626",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },
  radius: {
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
  },
  shadows: Platform.select({
    ios: {
      shadowColor: "#0F172A",
      shadowOpacity: 0.08,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
    },
    android: {
      elevation: 3,
    },
    default: {},
  }),
} as const;
