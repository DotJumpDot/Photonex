import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { packageService } from "../services/package.service";
import type { PackageWithStats, CreatePackageInput, RefreshResponse } from "../Types";

export const usePackageStore = defineStore("package", () => {
  // State
  const packages = ref<PackageWithStats[]>([]);
  const loading = ref(false);
  const refreshing = ref(false);
  const error = ref<string | null>(null);
  const autoRefreshInterval = ref<number | null>(null);
  const lastRefreshMessage = ref<string | null>(null);

  // Getters
  const npmPackages = computed(() => packages.value.filter((p) => p.type === "npm"));
  const vscodeExtensions = computed(() => packages.value.filter((p) => p.type === "vscode"));
  const totalPackages = computed(() => packages.value.length);

  // Actions
  async function fetchPackages() {
    loading.value = true;
    error.value = null;

    try {
      const response = await packageService.getPackages();
      packages.value = response.packages;
    } catch (_err) {
      error.value = "Failed to fetch packages";
    } finally {
      loading.value = false;
    }
  }

  async function addPackage(input: CreatePackageInput) {
    loading.value = true;
    error.value = null;

    try {
      const response = await packageService.addPackage(input);
      await fetchPackages();
      return response.package;
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

  async function refreshPackage(id: string, force: boolean = false): Promise<RefreshResponse> {
    refreshing.value = true;
    error.value = null;
    lastRefreshMessage.value = null;

    try {
      const result = await packageService.refreshPackage(id, force);
      const idx = packages.value.findIndex((p) => p.id === id);
      if (idx !== -1) {
        packages.value[idx] = result.package;
      }
      // Show appropriate message based on whether data was saved
      if (result.saved) {
        lastRefreshMessage.value = "Stats updated successfully";
      } else if (result.refreshed) {
        // Data was fetched but not saved (cooldown or no changes)
        lastRefreshMessage.value = result.message;
      }
      return result;
    } catch (err: any) {
      error.value = "Failed to refresh package";
      throw err;
    } finally {
      refreshing.value = false;
    }
  }

  async function refreshAllPackages(force: boolean = false) {
    refreshing.value = true;
    error.value = null;
    lastRefreshMessage.value = null;

    try {
      const result = await packageService.refreshAllPackages(force);
      packages.value = result.packages;
      if (result.skipped > 0) {
        lastRefreshMessage.value = `${result.refreshed} refreshed, ${result.skipped} skipped (rate limited), ${result.failed} failed`;
      }
      return result;
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
      refreshAllPackages(false);
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
    lastRefreshMessage,
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
