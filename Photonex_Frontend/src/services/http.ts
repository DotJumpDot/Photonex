// HTTP client is provided by the axios plugin
// Access via: const { $http } = useNuxtApp()

import type { AxiosInstance } from "axios";

export const useHttp = (): AxiosInstance => {
  const nuxtApp = useNuxtApp();
  return nuxtApp.$http as AxiosInstance;
};
