"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Apply saved theme and dark mode on mount
    const applyTheme = () => {
      const isDark = localStorage.getItem("darkMode") === "true" ||
        (!localStorage.getItem("darkMode") && window.matchMedia("(prefers-color-scheme: dark)").matches);
      const theme = localStorage.getItem("theme") || "cyan";

      setDarkMode(isDark);
      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.className = document.documentElement.className
        .replace(/theme-\w+/g, "")
        .trim();
      if (theme !== "cyan") {
        document.documentElement.classList.add(`theme-${theme}`);
      }
    };

    applyTheme();

    // Listen for storage changes from other components (e.g., SettingsSection)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "darkMode" && e.newValue !== null) {
        const newMode = e.newValue === "true";
        setDarkMode(newMode);
        document.documentElement.classList.toggle("dark", newMode);
      }
      if (e.key === "theme" && e.newValue !== null) {
        document.documentElement.className = document.documentElement.className
          .replace(/theme-\w+/g, "")
          .trim();
        if (e.newValue !== "cyan") {
          document.documentElement.classList.add(`theme-${e.newValue}`);
        }
      }
    };

    // Also listen for custom event for same-tab updates
    const handleThemeChange = () => {
      const isDark = localStorage.getItem("darkMode") === "true";
      const theme = localStorage.getItem("theme") || "cyan";
      setDarkMode(isDark);
      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.className = document.documentElement.className
        .replace(/theme-\w+/g, "")
        .trim();
      if (theme !== "cyan") {
        document.documentElement.classList.add(`theme-${theme}`);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("themechange", handleThemeChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("themechange", handleThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", String(newMode));
    document.documentElement.classList.toggle("dark", newMode);
    // Dispatch custom event for same-tab components
    window.dispatchEvent(new Event("themechange"));
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-surface border border-border hover:bg-background transition-colors"
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? <SunIcon className="w-5 h-5 text-accent" /> : <MoonIcon className="w-5 h-5 text-text-muted" />}
    </button>
  );
}
