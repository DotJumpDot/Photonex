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
    } catch (err) {
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
    } catch (err) {
      error.value = "Authentication failed";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function login(email: string, password: string) {
    loading.value = true;
    error.value = null;
    try {
      const { user: userData, token } = await authService.login(email, password);
      await setUser(userData, token);
      return userData;
    } catch (err: any) {
      error.value = err.response?.data?.error || "Login failed";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function register(email: string, password: string) {
    loading.value = true;
    error.value = null;
    try {
      const { user: userData, token } = await authService.register(email, password);
      await setUser(userData, token);
      return userData;
    } catch (err: any) {
      error.value = err.response?.data?.error || "Registration failed";
      throw err;
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
