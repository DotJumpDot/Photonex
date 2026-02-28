import axios from "axios";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const http = axios.create({
    baseURL: `${config.public.apiBaseUrl}/api`,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor - Add Authorization and API Key headers
  http.interceptors.request.use(
    (requestConfig) => {
      const token = localStorage.getItem("token");
      if (token) {
        requestConfig.headers["Authorization"] = `Bearer ${token}`;
      }
      if (config.public.apiKey) {
        requestConfig.headers["X-API-Key"] = config.public.apiKey;
      }
      return requestConfig;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle errors
  http.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  return {
    provide: {
      http,
    },
  };
});
