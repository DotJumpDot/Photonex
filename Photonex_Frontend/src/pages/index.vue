<template>
  <div class="min-h-screen themed-page">
    <!-- Header -->
    <header class="themed-header shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold themed-text">Photonex</h1>
        <div class="flex items-center gap-4">
          <ThemeSelector />
          <LanguageSwitcher />
          <span v-if="authStore.user" class="text-sm themed-text">
            {{ authStore.user.email }}
          </span>
          <button
            v-if="authStore.isAuthenticated"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            @click="logout"
          >
            {{ $t("logout") }}
          </button>
          <NuxtLink
            v-else
            to="/login"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {{ $t("login") }}
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Not Authenticated -->
      <div v-if="!authStore.isAuthenticated" class="text-center py-16">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {{ $t("monitor_packages") }}
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
          {{ $t("track_packages_desc") }}
        </p>
        <NuxtLink
          to="/login"
          class="inline-block px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          {{ $t("get_started") }}
        </NuxtLink>
      </div>

      <!-- Authenticated Dashboard -->
      <div v-else>
        <!-- Add Package Form -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {{ $t("add_package") }}
          </h2>
          <form class="flex flex-col md:flex-row gap-4" @submit.prevent="handleAddPackage">
            <input
              v-model="newPackageUrl"
              type="text"
              :placeholder="$t('enter_url')"
              class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
            <select
              v-model="newPackageType"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="npm">{{ $t("npm_package") }}</option>
              <option value="vscode">{{ $t("vscode_extension") }}</option>
            </select>
            <button
              type="submit"
              :disabled="packageStore.loading"
              class="px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {{ packageStore.loading ? $t("adding") : $t("add") }}
            </button>
          </form>
        </div>

        <!-- Controls -->
        <div
          class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
        >
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ $t("your_packages") }} ({{ packageStore.totalPackages }})
          </h2>
          <div class="flex flex-wrap gap-2">
            <button
              :disabled="packageStore.refreshing"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              @click="handleRefreshAll"
            >
              {{ packageStore.refreshing ? $t("refreshing") : $t("refresh_all") }}
            </button>
            <button
              :class="[
                'px-4 py-2 text-sm font-medium rounded-md',
                autoRefreshEnabled
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600',
              ]"
              @click="toggleAutoRefresh"
            >
              {{ autoRefreshEnabled ? $t("auto_on") : $t("auto_off") }}
            </button>
          </div>
        </div>

        <!-- Refresh Message -->
        <div
          v-if="packageStore.lastRefreshMessage"
          class="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-200 px-4 py-3 rounded mb-6"
        >
          {{ packageStore.lastRefreshMessage }}
        </div>

        <!-- Error Message -->
        <div
          v-if="packageStore.error"
          class="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-6"
        >
          {{ packageStore.error }}
        </div>

        <!-- Loading State -->
        <div
          v-if="packageStore.loading && packageStore.packages.length === 0"
          class="text-center py-12"
        >
          <p class="text-gray-600 dark:text-gray-400">{{ $t("loading_packages") }}</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="packageStore.packages.length === 0" class="text-center py-12">
          <p class="text-gray-600 dark:text-gray-400">
            {{ $t("no_packages") }}
          </p>
        </div>

        <!-- Packages Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PackageCard
            v-for="pkg in packageStore.packages"
            :key="pkg.id"
            :package="pkg"
            :refreshing="refreshingId === pkg.id"
            @refresh="handleRefreshPackage"
            @delete="handleDeletePackage"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../stores/auth.store";
import { usePackageStore } from "../stores/package.store";
import { useThemeStore } from "../stores/theme.store";
import PackageCard from "../components/PackageCard.vue";
import LanguageSwitcher from "../components/LanguageSwitcher.vue";
import ThemeSelector from "../components/ThemeSelector.vue";

const authStore = useAuthStore();
const packageStore = usePackageStore();
const themeStore = useThemeStore();

const newPackageUrl = ref("");
const newPackageType = ref<"npm" | "vscode">("npm");
const autoRefreshEnabled = ref(false);
const refreshingId = ref<string | null>(null);

onMounted(async () => {
  themeStore.initTheme();
  await authStore.fetchUser();
  if (authStore.isAuthenticated) {
    await packageStore.fetchPackages();
  }
});

onUnmounted(() => {
  packageStore.stopAutoRefresh();
});

async function handleAddPackage() {
  if (!newPackageUrl.value) return;

  try {
    await packageStore.addPackage({
      name: newPackageUrl.value,
      type: newPackageType.value,
      url: newPackageUrl.value,
    });
    newPackageUrl.value = "";
  } catch (error) {
    console.error("Failed to add package:", error);
  }
}

async function handleRefreshPackage(id: string) {
  refreshingId.value = id;
  try {
    await packageStore.refreshPackage(id);
  } catch (error) {
    console.error("Failed to refresh package:", error);
  } finally {
    refreshingId.value = null;
  }
}

async function handleDeletePackage(id: string) {
  const { t } = useI18n();
  if (!confirm(t("delete_confirm"))) return;

  try {
    await packageStore.deletePackage(id);
  } catch (error) {
    console.error("Failed to delete package:", error);
  }
}

async function handleRefreshAll() {
  try {
    await packageStore.refreshAllPackages();
  } catch (error) {
    console.error("Failed to refresh all packages:", error);
  }
}

function toggleAutoRefresh() {
  autoRefreshEnabled.value = !autoRefreshEnabled.value;

  if (autoRefreshEnabled.value) {
    packageStore.startAutoRefresh(5);
  } else {
    packageStore.stopAutoRefresh();
  }
}

function logout() {
  authStore.logout();
  packageStore.stopAutoRefresh();
}
</script>

<style>
.themed-page {
  background-color: var(--bg-color, #f9fafb) !important;
  color: var(--text-color, #111827) !important;
}

.themed-header {
  background-color: var(--bg-color, #ffffff) !important;
  border-bottom: 1px solid var(--border-color, #e5e7eb) !important;
}

.themed-text {
  color: var(--text-color, #111827) !important;
}

.themed-card {
  background-color: var(--bg-color, #ffffff) !important;
  border: 1px solid var(--border-color, #e5e7eb) !important;
}
</style>
