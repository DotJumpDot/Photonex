<script setup lang="ts">
import { useI18n } from "vue-i18n";

type LocaleCode = "en" | "th";

const { locale, setLocale } = useI18n();

const availableLocales: { code: LocaleCode; name: string }[] = [
  { code: "en", name: "English" },
  { code: "th", name: "ไทย" },
];

function switchLanguage(code: LocaleCode) {
  setLocale(code);
}
</script>

<template>
  <div class="language-switcher">
    <button
      v-for="lang in availableLocales"
      :key="lang.code"
      :class="{ active: locale === lang.code }"
      @click="switchLanguage(lang.code)"
    >
      {{ lang.name }}
    </button>
  </div>
</template>

<style scoped>
.language-switcher {
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
