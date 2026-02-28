// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@pinia/nuxt", "@nuxtjs/i18n"],

  i18n: {
    langDir: "../src/Language",
    locales: [
      { code: "en", file: "en.json", name: "English" },
      { code: "th", file: "th.json", name: "Thai" },
    ],
    defaultLocale: "en",
    strategy: "no_prefix",
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL || "http://localhost:3002",
      apiKey: process.env.API_KEY || "",
    },
  },

  srcDir: "src/",

  app: {
    head: {
      title: "Photonex - Package Monitor",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "Monitor NPM packages and VS Code Marketplace extensions" },
      ],
    },
  },
});
