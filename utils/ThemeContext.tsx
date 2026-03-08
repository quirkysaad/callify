import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import theme from "./theme";

// Re-export for convenience
export const lightColors = theme.lightColors;
export const darkColors = theme.darkColors;

export type ThemeMode = "light" | "dark" | "system";

type ThemeContextType = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colors: typeof lightColors;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
  themeMode: "system",
  setThemeMode: () => {},
  colors: lightColors,
  isDark: false,
});

const STORAGE_KEY = "theme_mode";

const resolveIsDark = (mode: ThemeMode): boolean => {
  if (mode === "system") {
    return Appearance.getColorScheme() === "dark";
  }
  return mode === "dark";
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeMode, setMode] = useState<ThemeMode>("system");
  const [isDark, setIsDark] = useState(() => resolveIsDark("system"));

  // Load saved preference (non-blocking — children render immediately with defaults)
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const mode = saved as ThemeMode;
          setMode(mode);
          setIsDark(resolveIsDark(mode));
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  // Listen for OS appearance changes when in "system" mode
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      if (themeMode === "system") {
        setIsDark(colorScheme === "dark");
      }
    });
    return () => sub.remove();
  }, [themeMode]);

  const setThemeMode = async (mode: ThemeMode) => {
    setMode(mode);
    setIsDark(resolveIsDark(mode));
    await AsyncStorage.setItem(STORAGE_KEY, mode);
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
