<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { computed } from "vue";

type LocaleCode = "en" | "th";

const { locale, setLocale } = useI18n();

const availableLocales: { code: LocaleCode; name: string }[] = [
  { code: "en", name: "English" },
  { code: "th", name: "ไทย" },
];

const currentLanguageLabel = computed(() => {
  return availableLocales.find((lang) => lang.code === locale.value)?.name || "English";
});

function handleLanguageChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  setLocale(target.value as LocaleCode);
}
</script>

<template>
  <div class="language-switcher">
    <select
      :value="locale"
      @change="handleLanguageChange"
      class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white cursor-pointer"
    >
      <option v-for="lang in availableLocales" :key="lang.code" :value="lang.code">
        {{ lang.name }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.language-switcher select {
  min-width: 100px;
}
</style>
