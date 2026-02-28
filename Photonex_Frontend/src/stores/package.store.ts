import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { packageService } from "../services/package.service";
import type { PackageWithStats, CreatePackageInput } from "../Types";

export const usePackageStore = defineStore("package", () => {
  // State
  const packages = ref<PackageWithStats[]>([]);
  const loading = ref(false);
  const refreshing = ref(false);
  const error = ref<string | null>(null);
  const autoRefreshInterval = ref<number | null>(null);

  // Getters
  const npmPackages = computed(() => packages.value.filter((p) => p.type === "npm"));
  const vscodeExtensions = computed(() => packages.value.filter((p) => p.type === "vscode"));
  const totalPackages = computed(() => packages.value.length);

  // Actions
  async function fetchPackages() {
    loading.value = true;
    error.value = null;

    try {
      const { packages: data } = await packageService.getPackages();
      packages.value = data;
    } catch (err) {
      error.value = "Failed to fetch packages";
    } finally {
      loading.value = false;
    }
  }

  async function addPackage(input: CreatePackageInput) {
    loading.value = true;
    error.value = null;

    try {
      const { package: newPackage } = await packageService.addPackage(input);
      await fetchPackages(); // Refresh to get stats
      return newPackage;
    } catch (err) {
      error.value = "Failed to add package";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deletePackage(id: string) {
    loading.value = true;
    error.value = null;

    try {
      await packageService.deletePackage(id);
      packages.value = packages.value.filter((p) => p.id !== id);
    } catch (err) {
      error.value = "Failed to delete package";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function refreshPackage(id: string) {
    refreshing.value = true;
    error.value = null;

    try {
      const { package: updatedPackage } = await packageService.refreshPackage(id);
      const index = packages.value.findIndex((p) => p.id === id);
      if (index !== -1) {
        packages.value[index] = updatedPackage;
      }
    } catch (err) {
      error.value = "Failed to refresh package";
      throw err;
    } finally {
      refreshing.value = false;
    }
  }

  async function refreshAllPackages() {
    refreshing.value = true;
    error.value = null;

    try {
      const { packages: data, refreshed, failed } = await packageService.refreshAllPackages();
      packages.value = data;
      return { refreshed, failed };
    } catch (err) {
      error.value = "Failed to refresh all packages";
      throw err;
    } finally {
      refreshing.value = false;
    }
  }

  function startAutoRefresh(intervalMinutes: number = 5) {
    stopAutoRefresh();

    const intervalMs = intervalMinutes * 60 * 1000;
    autoRefreshInterval.value = window.setInterval(() => {
      refreshAllPackages();
    }, intervalMs);
  }

  function stopAutoRefresh() {
    if (autoRefreshInterval.value) {
      clearInterval(autoRefreshInterval.value);
      autoRefreshInterval.value = null;
    }
  }

  return {
    packages,
    loading,
    refreshing,
    error,
    npmPackages,
    vscodeExtensions,
    totalPackages,
    fetchPackages,
    addPackage,
    deletePackage,
    refreshPackage,
    refreshAllPackages,
    startAutoRefresh,
    stopAutoRefresh,
  };
});
