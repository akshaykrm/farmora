import { createContext, useContext } from "react";
import type { ThemeMode } from "../../theme/tokens";

export type ThemeContextValue = {
  mode: ThemeMode;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
};

export const themeContext = createContext<ThemeContextValue | null>(null);

export const useTheme = () => {
  const ctx = useContext(themeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeModeProvider");
  }
  return ctx;
};
