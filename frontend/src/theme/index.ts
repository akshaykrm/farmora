import { alpha, createTheme, type Shadows, type Theme } from "@mui/material/styles"
import { modes, palette, radius, shadow, typography, type ThemeMode } from "./tokens"

const toMuiShadows = (): Shadows => {
  const levels: Record<number, string> = {
    1: shadow.xs,
    2: shadow.sm,
    3: shadow.md,
    4: shadow.lg,
  }
  return Array.from({ length: 25 }, (_, i) => {
    if (i === 0) return "none"
    if (levels[i]) return levels[i]
    return shadow.xl
  }) as Shadows
}

export const createAppTheme = (mode: ThemeMode = "light"): Theme => {
  const roles = modes[mode]

  return createTheme({
    palette: {
      mode,
      primary: {
        main: roles.primary,
        light: palette.green[400],
        dark: roles.primaryStrong,
        contrastText: roles.onPrimary,
      },
      secondary: {
        main: roles.primaryStrong,
        light: roles.primary,
        dark: palette.green[800],
        contrastText: "#ffffff",
      },
      success: {
        main: roles.success,
        light: palette.green[400],
        dark: roles.successStrong,
        contrastText: "#ffffff",
      },
      warning: {
        main: roles.warning,
        contrastText: "#ffffff",
      },
      error: {
        main: roles.danger,
        contrastText: "#ffffff",
      },
      info: {
        main: roles.info,
        contrastText: "#ffffff",
      },
      background: {
        default: roles.canvas,
        paper: roles.card,
      },
      text: {
        primary: roles.ink,
        secondary: roles.inkSoft,
      },
      divider: roles.border,
    },
    typography: {
      fontFamily: typography.family,
      h1: { fontWeight: typography.weights.bold },
      h2: { fontWeight: typography.weights.bold },
      h3: { fontWeight: typography.weights.semibold },
      h4: { fontWeight: typography.weights.semibold },
      button: { textTransform: "none", fontWeight: typography.weights.medium },
    },
    shape: {
      borderRadius: radius.md,
    },
    shadows: toMuiShadows(),
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: radius.md,
            textTransform: "none",
            fontWeight: typography.weights.medium,
            padding: "10px 24px",
          },
          contained: {
            boxShadow: "none",
            "&:hover": {
              boxShadow: "none",
            },
          },
          containedPrimary: {
            backgroundColor: roles.primary,
            color: roles.onPrimary,
            "&:hover": {
              backgroundColor: roles.primaryStrong,
            },
          },
          outlined: {
            borderColor: roles.primary,
            color: roles.primary,
            "&:hover": {
              borderColor: roles.primaryStrong,
              backgroundColor: alpha(roles.primary, 0.05),
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: radius.md,
              "& fieldset": {
                borderColor: roles.borderStrong,
              },
              "&:hover fieldset": {
                borderColor: roles.primary,
              },
              "&.Mui-focused fieldset": {
                borderColor: roles.primary,
                borderWidth: "2px",
              },
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: radius.lg,
            boxShadow: shadow.sm,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: radius.lg,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: radius.md,
          },
          elevation1: {
            boxShadow: shadow.sm,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: radius.sm,
          },
          filled: {
            backgroundColor: roles.primarySoft,
            color: roles.primaryStrong,
            "&:hover": {
              backgroundColor: palette.green[100],
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            backgroundColor: roles.cardSoft,
            fontWeight: 600,
            color: roles.ink,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: radius.sm,
            "&.Mui-selected": {
              backgroundColor: roles.primarySoft,
              color: roles.primaryStrong,
              "&:hover": {
                backgroundColor: palette.green[100],
              },
            },
            "&:hover": {
              backgroundColor: roles.primarySoft,
            },
          },
        },
      },
      MuiPaginationItem: {
        styleOverrides: {
          root: {
            "&.Mui-selected": {
              backgroundColor: roles.primary,
              color: roles.onPrimary,
              "&:hover": {
                backgroundColor: roles.primaryStrong,
              },
            },
          },
        },
      },
    },
  })
}

/** Default light theme — used by <ThemeProvider> today. */
export const theme = createAppTheme("light")

export default theme
