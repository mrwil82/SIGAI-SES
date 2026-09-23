import React, { useEffect, useState } from "react";
import { ThemeContext, type ThemeName } from "../hooks/useTheme";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<ThemeName>(() => {
    const saved = localStorage.getItem("sigai-theme") as string | null;
    if (saved === "graphite" || saved === "bone" || saved === "sand")
      return "bone";
    if (saved === "green" || saved === "blue") return saved;
    return "green";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("sigai-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
