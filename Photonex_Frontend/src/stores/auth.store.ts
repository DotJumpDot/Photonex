import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authService } from "../services/auth.service";
import type { User } from "../Types";

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!user.value);
  const userId = computed(() => user.value?.id || null);

  // Actions
  async function setUser(userData: User, token?: string) {
    user.value = userData;
    if (token) {
      authService.setToken(token);
    }
  }

  async function fetchUser() {
    const token = authService.getToken();
    if (!token) return;

    loading.value = true;
    error.value = null;

    try {
      const { user: userData } = await authService.getMe();
      user.value = userData;
    } catch (_err) {
      error.value = "Failed to fetch user";
      logout();
    } finally {
      loading.value = false;
    }
  }

  async function handleOAuthCallback(
    email: string,
    provider: "google" | "github",
    providerId: string
  ) {
    loading.value = true;
    error.value = null;

    try {
      const { user: userData, token } = await authService.callback({
        email,
        provider,
        provider_id: providerId,
      });

      await setUser(userData, token);
      return userData;
    } catch (err: any) {
      const errorData = err.response?.data;
      error.value = errorData?.error?.message || "Authentication failed";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function login(loginInput: string, password: string) {
    loading.value = true;
    error.value = null;
    try {
      const result = await authService.login(loginInput, password);

      if (!result.success || !result.data) {
        // Extract professional error message from backend
        const errorMessage = result.error?.message || "Login failed";
        throw new Error(errorMessage);
      }

      const { user: userData, token } = result.data;
      await setUser(userData, token);
      return userData;
    } catch (err: any) {
      // Handle axios errors vs our custom errors
      const errorData = err.response?.data;
      const errorMessage =
        errorData?.error?.message ||
        err.message ||
        "An unexpected error occurred. Please try again.";

      error.value = errorMessage;
      throw new Error(errorMessage, { cause: err });
    } finally {
      loading.value = false;
    }
  }

  async function register(username: string, email: string | null, password: string) {
    loading.value = true;
    error.value = null;
    try {
      const result = await authService.register(username, email, password);

      if (!result.success || !result.data) {
        // Extract professional error message from backend
        const errorMessage = result.error?.message || "Registration failed";
        throw new Error(errorMessage);
      }

      const { user: userData, token } = result.data;
      await setUser(userData, token);
      return userData;
    } catch (err: any) {
      // Handle axios errors vs our custom errors
      const errorData = err.response?.data;
      const errorMessage =
        errorData?.error?.message ||
        (errorData?.error?.details
          ? errorData.error.details.map((d: any) => `${d.field}: ${d.message}`).join(", ")
          : null) ||
        err.message ||
        "An unexpected error occurred. Please try again.";

      error.value = errorMessage;
      throw new Error(errorMessage, { cause: err });
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    user.value = null;
    authService.clearToken();
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    userId,
    setUser,
    fetchUser,
    handleOAuthCallback,
    login,
    register,
    logout,
  };
});
