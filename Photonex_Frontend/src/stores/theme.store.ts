import { defineStore } from "pinia";
import { ref } from "vue";
import { lightTheme } from "@/Theme/light";
import { darkTheme } from "@/Theme/dark";
import { midnightTheme } from "@/Theme/midnight";
import { draculaTheme } from "@/Theme/dracula";
import { nordTheme } from "@/Theme/nord";
import { monokaiTheme } from "@/Theme/monokai";
import { solarizedTheme } from "@/Theme/solarized";
import { githubLightTheme } from "@/Theme/github-light";
import { oneDarkTheme } from "@/Theme/one-dark";
import { materialTheme } from "@/Theme/material";
import { oceanTheme } from "@/Theme/ocean";
import { rosePineTheme } from "@/Theme/rose-pine";

export type ThemeName =
  | "light"
  | "dark"
  | "midnight"
  | "dracula"
  | "nord"
  | "monokai"
  | "solarized"
  | "github-light"
  | "one-dark"
  | "material"
  | "ocean"
  | "rose-pine";

const themes: Record<
  ThemeName,
  { primary: string; secondary: string; background: string; text: string; border: string }
> = {
  light: lightTheme,
  dark: darkTheme,
  midnight: midnightTheme,
  dracula: draculaTheme,
  nord: nordTheme,
  monokai: monokaiTheme,
  solarized: solarizedTheme,
  "github-light": githubLightTheme,
  "one-dark": oneDarkTheme,
  material: materialTheme,
  ocean: oceanTheme,
  "rose-pine": rosePineTheme,
};

export const useThemeStore = defineStore("theme", () => {
  const currentTheme = ref<ThemeName>("light");

  function applyTheme(themeName: ThemeName) {
    const theme = themes[themeName] || lightTheme;
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

  function setTheme(theme: ThemeName) {
    currentTheme.value = theme;
    if (import.meta.client) {
      applyTheme(theme);
      localStorage.setItem("theme", theme);
    }
  }

  function initTheme() {
    if (import.meta.client) {
      const savedTheme = (localStorage.getItem("theme") as ThemeName) || "light";
      setTheme(savedTheme);
    }
  }

  return {
    currentTheme,
    setTheme,
    initTheme,
  };
});
