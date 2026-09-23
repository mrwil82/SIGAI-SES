import { createContext, useContext } from "react";

export type ThemeName = "green" | "blue" | "bone";

export interface ThemeContextType {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: "green",
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);
