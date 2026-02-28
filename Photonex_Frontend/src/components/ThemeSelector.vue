<script setup lang="ts">
import { useThemeStore } from "@/stores/theme.store";

const themeStore = useThemeStore();

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];
</script>

<template>
  <div class="theme-selector">
    <button
      v-for="theme in themes"
      :key="theme.value"
      :class="{ active: themeStore.currentTheme === theme.value }"
      @click="themeStore.setTheme(theme.value)"
    >
      {{ theme.label }}
    </button>
  </div>
</template>

<style scoped>
.theme-selector {
  display: flex;
  gap: 0.5rem;
}

button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color, #ccc);
  background: var(--bg-color, #fff);
  color: var(--text-color, #333);
  cursor: pointer;
  border-radius: 4px;
}

button.active {
  background: var(--primary-color, #3b82f6);
  color: white;
  border-color: var(--primary-color, #3b82f6);
}
</style>
