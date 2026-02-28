import { defineStore } from "pinia";
import { ref } from "vue";
import { lightTheme } from "@/Theme/light";
import { darkTheme } from "@/Theme/dark";

export const useThemeStore = defineStore("theme", () => {
  const currentTheme = ref("light");

  function applyTheme(themeName: string) {
    const theme = themeName === "dark" ? darkTheme : lightTheme;
    const root = document.documentElement;

    // Set CSS variables
    root.style.setProperty("--primary-color", theme.primary);
    root.style.setProperty("--secondary-color", theme.secondary);
    root.style.setProperty("--bg-color", theme.background);
    root.style.setProperty("--text-color", theme.text);
    root.style.setProperty("--border-color", theme.border);

    // Set data attribute for other styling needs
    root.setAttribute("data-theme", themeName);
  }

  function setTheme(theme: string) {
    currentTheme.value = theme;
    if (import.meta.client) {
      applyTheme(theme);
      localStorage.setItem("theme", theme);
    }
  }

  function initTheme() {
    if (import.meta.client) {
      const savedTheme = localStorage.getItem("theme") || "light";
      setTheme(savedTheme);
    }
  }

  return {
    currentTheme,
    setTheme,
    initTheme,
  };
});
