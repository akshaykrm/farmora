/**
 * Farmora design tokens — SINGLE SOURCE OF TRUTH.
 *
 * Every color, radius, shadow, spacing, typography and transition value used by
 * the app lives here. Two consumers derive from this file:
 *   1. Tailwind utilities  → scripts/gen-tokens.ts generates src/theme/tokens.css
 *   2. MUI theme           → src/theme/index.ts (createAppTheme)
 *
 * Naming convention:
 *   - Semantic roles (canvas/card/ink/primary/success...) are what components
 *     should use. They are mode-aware (light vs dark) so adding dark mode later
 *     only requires populating `modes.dark` and toggling `data-theme="dark"` on
 *     <html> — no component changes.
 *   - Raw palette values (green scale, neutrals) stay available for accents and
 *     are also used as the source for the semantic roles.
 */

export type ThemeMode = "light" | "dark"

/* ------------------------------------------------------------------ */
/* Raw palette                                                         */
/* ------------------------------------------------------------------ */

export const palette = {
  green: {
    900: '#1B5E20',
    800: '#27632B',
    700: '#2E7D32',
    600: '#388E3C',
    500: '#43A047',
    400: '#66BB6A',
    300: '#81C784',
    200: '#A5D6A7',
    100: '#C8E6C9',
    50: '#E8F5E9',
  },
  mint: '#F7FBF6',
  neutral: {
    charcoal: '#263238',
    slate: '#37474F',
    steel: '#607D8B',
    muted: '#90A4AE',
    pale: '#B0BEC5',
    divider: '#ECEFF1',
  },
  status: {
    success: '#16A34A',
    successSoft: '#DCFCE7',
    successStrong: '#166534',
    warning: '#D97706',
    warningSoft: '#FEF3C7',
    warningStrong: '#92400E',
    danger: '#DC2626',
    dangerSoft: '#FEE2E2',
    dangerStrong: '#991B1B',
    info: '#2563EB',
    infoSoft: '#DBEAFE',
    infoStrong: '#1E40AF',
  },
  white: '#FFFFFF',
} as const

/* ------------------------------------------------------------------ */
/* Semantic color roles (mode-aware)                                   */
/* ------------------------------------------------------------------ */

export type ColorRoles = {
  canvas: string
  card: string
  cardSoft: string
  cardRaised: string
  border: string
  borderStrong: string
  ink: string
  inkSoft: string
  inkMuted: string
  primary: string
  primaryStrong: string
  primarySoft: string
  onPrimary: string
  success: string
  successSoft: string
  successStrong: string
  warning: string
  warningSoft: string
  warningStrong: string
  danger: string
  dangerSoft: string
  dangerStrong: string
  info: string
  infoSoft: string
  infoStrong: string
}

const lightRoles: ColorRoles = {
  canvas: palette.mint,
  card: palette.white,
  cardSoft: palette.green[50],
  cardRaised: palette.white,
  border: palette.neutral.divider,
  borderStrong: palette.neutral.pale,
  ink: palette.neutral.charcoal,
  inkSoft: palette.neutral.steel,
  inkMuted: palette.neutral.muted,
  primary: palette.green[500],
  primaryStrong: palette.green[700],
  primarySoft: palette.green[50],
  onPrimary: palette.white,
  success: palette.status.success,
  successSoft: palette.status.successSoft,
  successStrong: palette.status.successStrong,
  warning: palette.status.warning,
  warningSoft: palette.status.warningSoft,
  warningStrong: palette.status.warningStrong,
  danger: palette.status.danger,
  dangerSoft: palette.status.dangerSoft,
  dangerStrong: palette.status.dangerStrong,
  info: palette.status.info,
  infoSoft: palette.status.infoSoft,
  infoStrong: palette.status.infoStrong,
}

const darkRoles: ColorRoles = {
  canvas: '#0E1210',
  card: '#171C19',
  cardSoft: '#1F2622',
  cardRaised: '#1C221F',
  border: '#2B332E',
  borderStrong: '#3D463F',
  ink: '#E8F0EB',
  inkSoft: '#A7B3AC',
  inkMuted: '#6E7B73',
  primary: '#66BB6A',
  primaryStrong: '#81C784',
  primarySoft: '#1D2A22',
  onPrimary: '#0E1210',
  success: '#4ADE80',
  successSoft: '#12261A',
  successStrong: '#86EFAC',
  warning: '#FBBF24',
  warningSoft: '#2B2110',
  warningStrong: '#FCD34D',
  danger: '#F87171',
  dangerSoft: '#2B1212',
  dangerStrong: '#FCA5A5',
  info: '#60A5FA',
  infoSoft: '#101F31',
  infoStrong: '#93C5FD',
}

export const modes: Record<ThemeMode, ColorRoles> = {
  light: lightRoles,
  dark: darkRoles,
}

/* ------------------------------------------------------------------ */
/* Radius / shadow / spacing / typography / transitions                */
/* ------------------------------------------------------------------ */

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  pill: 9999,
} as const

export const shadow = {
  xs: '0 1px 2px 0 rgb(16 24 40 / 0.05)',
  sm: '0 1px 3px 0 rgb(16 24 40 / 0.1), 0 1px 2px -1px rgb(16 24 40 / 0.1)',
  md: '0 4px 6px -1px rgb(16 24 40 / 0.1), 0 2px 4px -2px rgb(16 24 40 / 0.1)',
  lg: '0 10px 15px -3px rgb(16 24 40 / 0.1), 0 4px 6px -4px rgb(16 24 40 / 0.1)',
  xl: '0 20px 25px -5px rgb(16 24 40 / 0.1), 0 8px 10px -6px rgb(16 24 40 / 0.1)',
} as const

export const spacing = {
  page: '24px',
  section: '32px',
  card: '24px',
  dialog: '24px',
  table: '16px',
} as const

export const typography = {
  family: [
    '"Montserrat"',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  } as const,
  sizes: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
  } as const,
} as const

export const transitions = {
  duration: {
    fast: '120ms',
    normal: '200ms',
    slow: '300ms',
  } as const,
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasized: 'cubic-bezier(0.3, 0, 0, 1)',
  } as const,
} as const

export const gradients = {
  cta: 'linear-gradient(90deg, #43A047 0%, #2E7D32 100%)',
  ctaHover: 'linear-gradient(90deg, #2E7D32 0%, #1B5E20 100%)',
  hero: 'linear-gradient(135deg, #43A047 0%, #2E7D32 100%)',
  heroHorizontal: 'linear-gradient(90deg, #43A047 0%, #2E7D32 100%)',
} as const

/* ------------------------------------------------------------------ */
/* CSS variable helpers (used by scripts/gen-tokens.ts)                */
/* ------------------------------------------------------------------ */

export const toStaticCssVars = (): Record<string, string> => ({
  // palette
  '--brand-green-900': palette.green[900],
  '--brand-green-800': palette.green[800],
  '--brand-green-700': palette.green[700],
  '--brand-green-600': palette.green[600],
  '--brand-green-500': palette.green[500],
  '--brand-green-400': palette.green[400],
  '--brand-green-300': palette.green[300],
  '--brand-green-200': palette.green[200],
  '--brand-green-100': palette.green[100],
  '--brand-green-50': palette.green[50],
  '--brand-mint': palette.mint,
  '--brand-charcoal': palette.neutral.charcoal,
  '--brand-slate': palette.neutral.slate,
  '--brand-steel': palette.neutral.steel,
  '--brand-muted': palette.neutral.muted,
  '--brand-pale': palette.neutral.pale,
  '--brand-divider': palette.neutral.divider,
  // radius
  '--brand-radius-sm': `${radius.sm}px`,
  '--brand-radius-md': `${radius.md}px`,
  '--brand-radius-lg': `${radius.lg}px`,
  '--brand-radius-xl': `${radius.xl}px`,
  '--brand-radius-2xl': `${radius['2xl']}px`,
  '--brand-radius-pill': `${radius.pill}px`,
  // shadow
  '--brand-shadow-xs': shadow.xs,
  '--brand-shadow-sm': shadow.sm,
  '--brand-shadow-md': shadow.md,
  '--brand-shadow-lg': shadow.lg,
  '--brand-shadow-xl': shadow.xl,
  // spacing
  '--brand-spacing-page': spacing.page,
  '--brand-spacing-section': spacing.section,
  '--brand-spacing-card': spacing.card,
  '--brand-spacing-dialog': spacing.dialog,
  '--brand-spacing-table': spacing.table,
  // typography
  '--brand-font-sans': typography.family,
  // transitions
  '--brand-duration-fast': transitions.duration.fast,
  '--brand-duration-normal': transitions.duration.normal,
  '--brand-duration-slow': transitions.duration.slow,
  '--brand-ease-standard': transitions.easing.standard,
  '--brand-ease-emphasized': transitions.easing.emphasized,
})

export const toModeCssVars = (mode: ThemeMode): Record<string, string> => {
  const r = modes[mode]
  return {
    '--brand-canvas': r.canvas,
    '--brand-card': r.card,
    '--brand-card-soft': r.cardSoft,
    '--brand-card-raised': r.cardRaised,
    '--brand-border': r.border,
    '--brand-border-strong': r.borderStrong,
    '--brand-ink': r.ink,
    '--brand-ink-soft': r.inkSoft,
    '--brand-ink-muted': r.inkMuted,
    '--brand-primary': r.primary,
    '--brand-primary-strong': r.primaryStrong,
    '--brand-primary-soft': r.primarySoft,
    '--brand-on-primary': r.onPrimary,
    '--brand-success': r.success,
    '--brand-success-soft': r.successSoft,
    '--brand-success-strong': r.successStrong,
    '--brand-warning': r.warning,
    '--brand-warning-soft': r.warningSoft,
    '--brand-warning-strong': r.warningStrong,
    '--brand-danger': r.danger,
    '--brand-danger-soft': r.dangerSoft,
    '--brand-danger-strong': r.dangerStrong,
    '--brand-info': r.info,
    '--brand-info-soft': r.infoSoft,
    '--brand-info-strong': r.infoStrong,
  }
}

export default { palette, modes, radius, shadow, spacing, typography, transitions, gradients }
