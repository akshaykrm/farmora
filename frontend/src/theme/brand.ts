/**
 * Backward-compatible re-exports of the legacy brand constants.
 *
 * The real values now live in src/theme/tokens.ts (single source of truth).
 * Keep this file only until all consumers migrate to tokens; then delete it.
 */
import { gradients, palette, typography } from "./tokens"

export const brandGreen = {
  900: palette.green[900],
  800: palette.green[800],
  700: palette.green[700],
  600: palette.green[600],
  500: palette.green[500],
  400: palette.green[400],
  300: palette.green[300],
  200: palette.green[200],
  100: palette.green[100],
  50: palette.green[50],
  mint: palette.mint,
} as const

export const brandNeutral = {
  charcoal: palette.neutral.charcoal,
  slate: palette.neutral.slate,
  steel: palette.neutral.steel,
  muted: palette.neutral.muted,
  pale: palette.neutral.pale,
  divider: palette.neutral.divider,
} as const

export const brandGradients = gradients

export const brandFontFamily = typography.family
