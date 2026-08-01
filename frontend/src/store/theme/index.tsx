import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ThemeMode } from "../../theme/tokens";
import { themeContext } from "./context";
import { getInitialThemeMode, THEME_STORAGE_KEY } from "./utils";

type Props = {
  children: ReactNode;
};

const ThemeModeProvider = ({ children }: Props) => {
  const [mode, setModeState] = useState<ThemeMode>(getInitialThemeMode);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // ignore storage errors
    }
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setModeState((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const value = useMemo(
    () => ({ mode, toggleTheme, setMode }),
    [mode, toggleTheme, setMode],
  );

  return (
    <themeContext.Provider value={value}>{children}</themeContext.Provider>
  );
};

export default ThemeModeProvider;
