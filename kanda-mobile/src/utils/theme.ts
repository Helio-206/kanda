import { tokens } from "@/theme/tokens";

export const colors = {
  background: tokens.colors.background,
  surface: tokens.colors.surface,
  surfaceMuted: tokens.colors.surfaceMuted,
  surfaceStrong: tokens.colors.surfaceStrong,
  text: tokens.colors.textPrimary,
  textSoft: tokens.colors.textSecondary,
  border: tokens.colors.border,
  primary: tokens.colors.brand,
  primarySoft: tokens.colors.brandSoft,
  accent: "#F97316",
  warning: tokens.colors.warning,
  danger: tokens.colors.danger,
  success: tokens.colors.success,
} as const;

export const spacing = tokens.spacing;

export const radius = tokens.radius;

export const shadows = tokens.shadows;
