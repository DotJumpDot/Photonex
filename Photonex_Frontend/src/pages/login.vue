<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white shadow-lg rounded-lg p-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Photonex
        </h1>
        <p class="text-gray-600">
          {{ $t("welcome") }}
        </p>
      </div>

      <!-- Language Switcher -->
      <div class="flex justify-end mb-4">
        <LanguageSwitcher />
      </div>

      <!-- Mode Toggle -->
      <div class="flex border-b border-gray-200 mb-6">
        <button
          :class="[
            'flex-1 py-2 text-center font-medium',
            mode === 'login'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700',
          ]"
          @click="mode = 'login'"
        >
          {{ $t("login") }}
        </button>
        <button
          :class="[
            'flex-1 py-2 text-center font-medium',
            mode === 'register'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700',
          ]"
          @click="mode = 'register'"
        >
          {{ $t("register") }}
        </button>
      </div>

      <!-- Error Message -->
      <div
        v-if="authStore.error"
        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-sm"
      >
        {{ authStore.error }}
      </div>

      <!-- Email/Password Form -->
      <form
        class="space-y-6"
        @submit.prevent="handleSubmit"
      >
        <div>
          <label
            for="email"
            class="block text-sm font-medium text-gray-700"
          >Email</label>
          <div class="mt-1">
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              required
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
          </div>
        </div>

        <div>
          <label
            for="password"
            class="block text-sm font-medium text-gray-700"
          >Password</label>
          <div class="mt-1">
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              required
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="authStore.loading">{{ $t("loading") }}</span>
            <span v-else>{{ mode === "login" ? $t("login") : $t("register") }}</span>
          </button>
        </div>
      </form>

      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300" />
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <!-- OAuth Buttons -->
      <div class="space-y-3">
        <button
          :disabled="authStore.loading"
          class="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          @click="loginWithGoogle"
        >
          <!-- Google SVG -->
          <svg
            class="w-5 h-5"
            viewBox="0 0 24 24"
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </button>

        <button
          :disabled="authStore.loading"
          class="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          @click="loginWithGithub"
        >
          <!-- GitHub SVG -->
          <svg
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clipRule="evenodd"
            />
          </svg>
          GitHub
        </button>
      </div>

      <div class="mt-6 text-center">
        <NuxtLink
          to="/"
          class="text-sm text-blue-600 hover:text-blue-800"
        >
          Back to Home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { createClient } from "@supabase/supabase-js";
import { useAuthStore } from "../stores/auth.store";
import LanguageSwitcher from "../components/LanguageSwitcher.vue";

const router = useRouter();
const authStore = useAuthStore();

// Form State
const mode = ref<"login" | "register">("login");
const email = ref("");
const password = ref("");

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

onMounted(() => {
  // Check if already authenticated
  if (authStore.isAuthenticated) {
    router.push("/");
  }

  // Handle OAuth callback
  const hash = window.location.hash;
  if (hash) {
    handleAuthCallback();
  }
});

async function handleSubmit() {
  try {
    if (mode.value === "login") {
      await authStore.login(email.value, password.value);
    } else {
      await authStore.register(email.value, password.value);
    }
    router.push("/");
  } catch (_error) {
    // Error is handled in store
  }
}

async function loginWithGoogle() {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/login",
      },
    });

    if (error) throw error;
  } catch (error) {
    console.error("Google login error:", error);
  }
}

async function loginWithGithub() {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: window.location.origin + "/login",
      },
    });

    if (error) throw error;
  } catch (error) {
    console.error("GitHub login error:", error);
  }
}

async function handleAuthCallback() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;

    if (session?.user) {
      const user = session.user;
      const provider = user.app_metadata.provider as "google" | "github";

      await authStore.handleOAuthCallback(user.email!, provider, user.id);

      router.push("/");
    }
  } catch (error) {
    console.error("Auth callback error:", error);
  }
}
</script>
