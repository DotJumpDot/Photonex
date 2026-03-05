<script setup lang="ts">
import { useThemeStore, type ThemeName } from "@/stores/theme.store";
import { useI18n } from "vue-i18n";
import { computed } from "vue";

const themeStore = useThemeStore();
const { t } = useI18n();

const themes: { value: ThemeName; label: string }[] = [
  { value: "light", label: t("theme_light") },
  { value: "dark", label: t("theme_dark") },
  { value: "midnight", label: t("theme_midnight") },
  { value: "dracula", label: t("theme_dracula") },
  { value: "nord", label: t("theme_nord") },
  { value: "monokai", label: t("theme_monokai") },
  { value: "solarized", label: t("theme_solarized") },
  { value: "github-light", label: t("theme_github_light") },
  { value: "one-dark", label: t("theme_one_dark") },
  { value: "material", label: t("theme_material") },
  { value: "ocean", label: t("theme_ocean") },
  { value: "rose-pine", label: t("theme_rose_pine") },
];

const currentThemeLabel = computed(() => {
  return themes.find((theme) => theme.value === themeStore.currentTheme)?.label || t("theme_light");
});

function handleThemeChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  themeStore.setTheme(target.value as ThemeName);
}
</script>

<template>
  <div class="theme-selector">
    <select
      :value="themeStore.currentTheme"
      @change="handleThemeChange"
      class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white cursor-pointer"
    >
      <option v-for="theme in themes" :key="theme.value" :value="theme.value">
        {{ theme.label }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.theme-selector select {
  min-width: 120px;
}
</style>
