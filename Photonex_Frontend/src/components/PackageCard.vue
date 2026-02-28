<template>
  <div class="bg-white shadow rounded-lg overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-start">
      <div>
        <div class="flex items-center gap-2">
          <span
            :class="[
              'px-2 py-1 text-xs font-semibold rounded',
              package.type === 'npm' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800',
            ]"
          >
            {{ package.type === "npm" ? "NPM" : "VS Code" }}
          </span>
          <h3 class="text-lg font-semibold text-gray-900 truncate">{{ package.name }}</h3>
        </div>
        <a
          :href="package.url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-blue-600 hover:text-blue-800 truncate block mt-1"
        >
          {{ package.url }}
        </a>
      </div>
      <button
        @click="$emit('delete', package.id)"
        class="text-gray-400 hover:text-red-600"
        title="Delete"
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

    <!-- Stats -->
    <div class="px-6 py-4">
      <div v-if="latestStats" class="grid grid-cols-2 gap-4">
        <!-- NPM Stats -->
        <template v-if="package.type === 'npm'">
          <div class="text-center">
            <p class="text-sm text-gray-600">Weekly Downloads</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatNumber(latestStats.downloads || 0) }}
            </p>
          </div>
          <div class="text-center">
            <p class="text-sm text-gray-600">Version</p>
            <p class="text-2xl font-bold text-gray-900">{{ latestStats.version || "N/A" }}</p>
          </div>
        </template>

        <!-- VS Code Stats -->
        <template v-else>
          <div class="text-center">
            <p class="text-sm text-gray-600">Installs</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatNumber(latestStats.installs || 0) }}
            </p>
          </div>
          <div class="text-center">
            <p class="text-sm text-gray-600">Rating</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ latestStats.rating ? latestStats.rating.toFixed(1) : "N/A" }}
            </p>
          </div>
        </template>
      </div>

      <div v-else class="text-center py-4">
        <p class="text-gray-500">No stats available</p>
      </div>

      <!-- Last Updated -->
      <div v-if="latestStats" class="mt-4 text-center">
        <p class="text-xs text-gray-500">Last updated: {{ formatDate(latestStats.recorded_at) }}</p>
      </div>
    </div>

    <!-- Chart -->
    <div v-if="chartData.labels.length > 1" class="px-6 pb-4">
      <div class="h-32">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <!-- Actions -->
    <div class="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
      <span class="text-xs text-gray-500"> Added {{ formatDate(package.created_at) }} </span>
      <button
        @click="$emit('refresh', package.id)"
        class="text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        Refresh
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
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
import type { PackageWithStats } from "../services/package.service";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const props = defineProps<{
  package: PackageWithStats;
}>();

defineEmits<{
  refresh: [id: string];
  delete: [id: string];
}>();

const latestStats = computed(() => {
  return props.package.stats[0] || null;
});

const chartData = computed(() => {
  const stats = [...props.package.stats].reverse();
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

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString();
}
</script>
