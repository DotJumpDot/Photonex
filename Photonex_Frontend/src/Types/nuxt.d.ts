import type { AxiosInstance } from "axios";
import type { ComposerTranslation } from "vue-i18n";

declare module "#app" {
  interface NuxtApp {
    $http: AxiosInstance;
  }
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $http: AxiosInstance;
    $t: ComposerTranslation;
  }
}

export {};
