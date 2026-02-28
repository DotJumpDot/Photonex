<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900">
          Photonex
        </h1>
        <div class="flex items-center gap-4">
          <span
            v-if="authStore.user"
            class="text-sm text-gray-600"
          >
            {{ authStore.user.email }}
          </span>
          <button
            v-if="authStore.isAuthenticated"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            @click="logout"
          >
            Logout
          </button>
          <NuxtLink
            v-else
            to="/login"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Login
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Not Authenticated -->
      <div
        v-if="!authStore.isAuthenticated"
        class="text-center py-16"
      >
        <h2 class="text-3xl font-bold text-gray-900 mb-4">
          Monitor Your Packages
        </h2>
        <p class="text-lg text-gray-600 mb-8">
          Track NPM packages and VS Code Marketplace extensions in one place.
        </p>
        <NuxtLink
          to="/login"
          class="inline-block px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Get Started
        </NuxtLink>
      </div>

      <!-- Authenticated Dashboard -->
      <div v-else>
        <!-- Add Package Form -->
        <div class="bg-white shadow rounded-lg p-6 mb-8">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">
            Add Package/Extension
          </h2>
          <form
            class="flex gap-4"
            @submit.prevent="handleAddPackage"
          >
            <input
              v-model="newPackageUrl"
              type="text"
              placeholder="Enter NPM or VS Code Marketplace URL"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
            <select
              v-model="newPackageType"
              class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="npm">
                NPM Package
              </option>
              <option value="vscode">
                VS Code Extension
              </option>
            </select>
            <button
              type="submit"
              :disabled="packageStore.loading"
              class="px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {{ packageStore.loading ? "Adding..." : "Add" }}
            </button>
          </form>
        </div>

        <!-- Controls -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-gray-900">
            Your Packages ({{ packageStore.totalPackages }})
          </h2>
          <div class="flex gap-2">
            <button
              :disabled="packageStore.refreshing"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              @click="handleRefreshAll"
            >
              {{ packageStore.refreshing ? "Refreshing..." : "Refresh All" }}
            </button>
            <button
              :class="[
                'px-4 py-2 text-sm font-medium rounded-md',
                autoRefreshEnabled
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
              ]"
              @click="toggleAutoRefresh"
            >
              {{ autoRefreshEnabled ? "Auto: ON" : "Auto: OFF" }}
            </button>
          </div>
        </div>

        <!-- Error Message -->
        <div
          v-if="packageStore.error"
          class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6"
        >
          {{ packageStore.error }}
        </div>

        <!-- Loading State -->
        <div
          v-if="packageStore.loading && packageStore.packages.length === 0"
          class="text-center py-12"
        >
          <p class="text-gray-600">
            Loading packages...
          </p>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="packageStore.packages.length === 0"
          class="text-center py-12"
        >
          <p class="text-gray-600">
            No packages added yet. Add your first package above!
          </p>
        </div>

        <!-- Packages Grid -->
        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <PackageCard
            v-for="pkg in packageStore.packages"
            :key="pkg.id"
            :package="pkg"
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
import { useAuthStore } from "../stores/auth.store";
import { usePackageStore } from "../stores/package.store";
import PackageCard from "../components/PackageCard.vue";

const authStore = useAuthStore();
const packageStore = usePackageStore();

const newPackageUrl = ref("");
const newPackageType = ref<"npm" | "vscode">("npm");
const autoRefreshEnabled = ref(false);

onMounted(async () => {
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
  try {
    await packageStore.refreshPackage(id);
  } catch (error) {
    console.error("Failed to refresh package:", error);
  }
}

async function handleDeletePackage(id: string) {
  if (!confirm("Are you sure you want to delete this package?")) return;

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
