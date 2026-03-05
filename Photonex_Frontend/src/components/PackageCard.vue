<template>
  <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-colors">
    <!-- Header -->
    <div
      class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start"
    >
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <span
            :class="[
              'px-2 py-1 text-xs font-semibold rounded',
              package.type === 'npm'
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            ]"
          >
            {{ package.type === "npm" ? "NPM" : "VS Code" }}
          </span>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {{ package.name }}
          </h3>
          <span v-if="latestStats?.version" class="text-sm text-gray-500 dark:text-gray-400">
            v{{ latestStats.version }}
          </span>
        </div>

        <!-- Description -->
        <p
          v-if="package.description"
          class="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2 h-10"
        >
          {{ package.description }}
        </p>
        <!-- Empty placeholder when no description to maintain layout -->
        <div v-else class="h-10 mt-2"></div>

        <!-- Author & License -->
        <div class="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span v-if="package.author"> {{ $t("by") }} {{ package.author }} </span>
          <span v-if="package.license" class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
            {{ package.license }}
          </span>
        </div>

        <!-- Keywords - fixed 2 lines height (approx 48px for 2 rows of tags) -->
        <div class="mt-2 flex flex-wrap gap-1 h-12 content-start">
          <span
            v-for="keyword in package.keywords.slice(0, 5)"
            :key="keyword"
            class="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
          >
            {{ keyword }}
          </span>
          <span v-if="package.keywords.length > 5" class="text-xs text-gray-400 dark:text-gray-500">
            +{{ package.keywords.length - 5 }}
          </span>
        </div>

        <!-- Links -->
        <div class="mt-2 flex items-center gap-3">
          <a
            :href="package.url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            {{ $t("package") }}
          </a>
          <a
            v-if="package.homepage"
            :href="package.homepage"
            target="_blank"
            rel="noopener noreferrer"
            class="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Homepage
          </a>
          <a
            v-if="package.repository_url"
            :href="package.repository_url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
          >
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path
                fill-rule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clip-rule="evenodd"
              />
            </svg>
            Repo
          </a>
          <a
            v-if="package.bugs_url"
            :href="package.bugs_url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Issues
          </a>
        </div>
      </div>
      <button
        class="text-gray-400 hover:text-red-600 dark:hover:text-red-400 ml-2"
        :title="$t('delete')"
        @click="$emit('delete', package.id)"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Stats Grid -->
    <div class="px-6 py-4">
      <div v-if="latestStats" class="grid grid-cols-3 gap-3">
        <!-- NPM Stats -->
        <template v-if="package.type === 'npm'">
          <div class="text-center p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg min-w-0">
            <p
              class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 truncate"
            >
              {{ $t("weekly_dls") }}
            </p>
            <p class="text-base font-bold text-gray-900 dark:text-white truncate">
              {{ formatNumber(latestStats.downloads || 0) }}
            </p>
          </div>
          <div class="text-center p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg min-w-0">
            <p
              class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 truncate"
            >
              {{ $t("total_dls") }}
            </p>
            <p class="text-base font-bold text-gray-900 dark:text-white truncate">
              {{ formatNumber(latestStats.total_downloads || 0) }}
            </p>
          </div>
          <div class="text-center p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg min-w-0">
            <p
              class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 truncate"
            >
              {{ $t("versions") }}
            </p>
            <p class="text-base font-bold text-gray-900 dark:text-white truncate">
              {{ latestStats.version_count || 0 }}
            </p>
          </div>
          <div class="text-center p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg min-w-0">
            <p
              class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 truncate"
            >
              Unpacked
            </p>
            <p class="text-base font-bold text-gray-900 dark:text-white truncate">
              {{ formatBytes(latestStats.unpacked_size) }}
            </p>
          </div>
          <div class="text-center p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg min-w-0">
            <p
              class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 truncate"
            >
              Files
            </p>
            <p class="text-base font-bold text-gray-900 dark:text-white truncate">
              {{ formatNumber(latestStats.file_count || 0) }}
            </p>
          </div>
          <div class="text-center p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg min-w-0">
            <p
              class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 truncate"
            >
              Deps
            </p>
            <p class="text-base font-bold text-gray-900 dark:text-white truncate">
              {{ regularDeps.length }}
            </p>
          </div>
          <div class="text-center p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg min-w-0">
            <p
              class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 truncate"
            >
              DevDeps
            </p>
            <p class="text-base font-bold text-gray-900 dark:text-white truncate">
              {{ devDeps.length }}
            </p>
          </div>
        </template>

        <!-- VS Code Stats -->
        <template v-else>
          <div class="text-center p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg min-w-0">
            <p
              class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 truncate"
            >
              Installs
            </p>
            <p class="text-base font-bold text-gray-900 dark:text-white truncate">
              {{ formatNumber(latestStats.installs || 0) }}
            </p>
          </div>
          <div class="text-center p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg min-w-0">
            <p
              class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 truncate"
            >
              Rating
            </p>
            <p class="text-base font-bold text-gray-900 dark:text-white truncate">
              {{ latestStats.rating ? latestStats.rating.toFixed(1) : "N/A" }}
              <span v-if="latestStats.rating_count" class="text-xs text-gray-400">
                ({{ formatNumber(latestStats.rating_count) }})
              </span>
            </p>
          </div>
          <div class="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <p class="text-xs text-gray-500 dark:text-gray-400">Versions</p>
            <p class="text-lg font-bold text-gray-900 dark:text-white">
              {{ latestStats.version_count || 0 }}
            </p>
          </div>
          <div
            class="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded"
            v-if="latestStats.trending_daily"
          >
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t("trending_daily") }}</p>
            <p class="text-lg font-bold text-green-600 dark:text-green-400">
              +{{ latestStats.trending_daily.toFixed(1) }}%
            </p>
          </div>
        </template>
      </div>

      <div v-else class="text-center py-4">
        <p class="text-gray-500 dark:text-gray-400">{{ $t("no_stats") }}</p>
      </div>

      <!-- Last Updated -->
      <div v-if="latestStats" class="mt-4 text-center">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          {{ $t("last_updated") }}: {{ formatDate(latestStats.recorded_at) }}
        </p>
      </div>
    </div>

    <!-- Content area that grows to fill space -->
    <div class="flex-1 flex flex-col justify-end">
      <!-- Chart -->
      <div v-if="chartData.labels.length > 1" class="px-6 pb-4 flex-1 min-h-32">
        <div class="h-full min-h-32">
          <Line :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Versions Section (Collapsible) -->
      <div
        v-if="package.package_versions?.length"
        class="border-t border-gray-200 dark:border-gray-700"
      >
        <button
          @click="showVersions = !showVersions"
          class="w-full px-6 py-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <span>{{ $t("version_history") }} ({{ package.package_versions.length }})</span>
          <svg
            class="w-4 h-4 transition-transform"
            :class="{ 'rotate-180': showVersions }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <div v-if="showVersions" class="px-6 py-2 max-h-40 overflow-y-auto">
          <div
            v-for="version in package.package_versions.slice(0, 10)"
            :key="version.id"
            class="flex justify-between items-center py-1 text-sm"
          >
            <span class="font-mono text-gray-700 dark:text-gray-300">{{ version.version }}</span>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ version.published_at ? formatDate(version.published_at) : $t("unknown_date") }}
            </span>
          </div>
          <div
            v-if="package.package_versions.length > 10"
            class="text-center text-xs text-gray-400 py-1"
          >
            +{{ package.package_versions.length - 10 }} {{ $t("more_versions") }}
          </div>
        </div>
      </div>
    </div>

    <!-- Dependencies Section (Collapsible) -->
    <div
      v-if="package.package_dependencies?.length"
      class="border-t border-gray-200 dark:border-gray-700"
    >
      <button
        @click="showDependencies = !showDependencies"
        class="w-full px-6 py-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <span>
          {{ $t("dependencies") }}
          <span class="text-xs text-gray-400">
            ({{ regularDeps.length }} {{ $t("deps") }}, {{ devDeps.length }} {{ $t("devdeps") }})
          </span>
        </span>
        <svg
          class="w-4 h-4 transition-transform"
          :class="{ 'rotate-180': showDependencies }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div v-if="showDependencies" class="px-6 py-2 max-h-48 overflow-y-auto">
        <!-- Regular Dependencies -->
        <div v-if="regularDeps.length" class="mb-2">
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            {{ $t("dependencies") }}
          </p>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="dep in regularDeps.slice(0, 15)"
              :key="dep.id"
              class="px-2 py-0.5 text-xs bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded"
            >
              {{ dep.dependency_name }}
              <span v-if="dep.dependency_version" class="text-blue-500 dark:text-blue-300">{{
                dep.dependency_version
              }}</span>
            </span>
            <span v-if="regularDeps.length > 15" class="text-xs text-gray-400">
              +{{ regularDeps.length - 15 }} {{ $t("more") }}
            </span>
          </div>
        </div>
        <!-- Dev Dependencies -->
        <div v-if="devDeps.length">
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            {{ $t("dev_dependencies") }}
          </p>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="dep in devDeps.slice(0, 10)"
              :key="dep.id"
              class="px-2 py-0.5 text-xs bg-orange-50 dark:bg-orange-900 text-orange-700 dark:text-orange-200 rounded"
            >
              {{ dep.dependency_name }}
            </span>
            <span v-if="devDeps.length > 10" class="text-xs text-gray-400">
              +{{ devDeps.length - 10 }} {{ $t("more") }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions - mt-auto pushes this to bottom -->
    <div
      class="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center mt-auto"
    >
      <span class="text-xs text-gray-500 dark:text-gray-400">
        {{ $t("added") }} {{ formatDate(package.created_at) }}
      </span>
      <button
        class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1"
        :disabled="refreshing"
        @click="$emit('refresh', package.id)"
      >
        <svg v-if="refreshing" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {{ $t("refresh") }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type { PackageWithStats } from "../Types";
import { formatNumber, formatBytes, formatDate } from "../Functions/formatter";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const props = defineProps<{
  package: PackageWithStats;
  refreshing?: boolean;
}>();

defineEmits<{
  refresh: [id: string];
  delete: [id: string];
}>();

const showVersions = ref(false);
const showDependencies = ref(false);

const latestStats = computed(() => {
  return props.package.stats?.[0] || null;
});

const regularDeps = computed(() => {
  return props.package.package_dependencies?.filter((d) => !d.is_dev_dependency) || [];
});

const devDeps = computed(() => {
  return props.package.package_dependencies?.filter((d) => d.is_dev_dependency) || [];
});

const chartData = computed(() => {
  const stats = [...(props.package.stats || [])].reverse();
  const labels = stats.map((s) => new Date(s.recorded_at).toLocaleDateString());
  const data = stats.map((s) => {
    if (props.package.type === "npm") {
      return s.downloads || 0;
    } else {
      return s.installs || 0;
    }
  });

  return {
    labels,
    datasets: [
      {
        label: props.package.type === "npm" ? "Downloads" : "Installs",
        data,
        borderColor: props.package.type === "npm" ? "#ef4444" : "#3b82f6",
        backgroundColor:
          props.package.type === "npm" ? "rgba(239, 68, 68, 0.1)" : "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      display: false,
    },
    y: {
      display: false,
    },
  },
};
</script>
