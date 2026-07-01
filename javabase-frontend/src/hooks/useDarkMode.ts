import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "javabase:theme";
type Theme = "dark" | "light";

function readInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return "dark"; // devs preferem dark mode — é o padrão do JavaBase
}

export function useDarkMode() {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggle, isDark: theme === "dark" };
}
