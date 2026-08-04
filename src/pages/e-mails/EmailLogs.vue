<template>
  <div class="space-y-5 py-4">
    <!-- Filters Section -->
    <div class="relative z-10">
      <div
        class="flex w-full min-w-0 flex-col gap-2 rounded-xl border border-primary-border bg-card-background/40 p-2 sm:flex-row sm:items-center xl:flex-wrap overflow-visible"
      >
        <!-- Email Search -->
        <div class="relative sm:flex-1 xl:max-w-64">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text"
          />
          <input
            v-model="store.filters.email"
            type="text"
            placeholder="Search by email..."
            class="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
            @input="debounceSearch"
          />
        </div>

        <!-- Event Filter -->
        <BaseSelect
          v-model="store.filters.event"
          :options="[
            { label: 'All Events', value: null },
            ...store.eventOptions,
          ]"
          placeholder="Events"
          class="w-full sm:w-48"
          @update:modelValue="store.applyFilters()"
        />

        <!-- Days Quick Filter -->
        <BaseSelect
          v-model="store.filters.days"
          :options="[{ label: 'All Days', value: null }, ...store.dayOptions]"
          placeholder="Quick Date"
          class="w-full sm:w-40"
          @update:modelValue="store.applyFilters()"
        />

        <!-- Sort -->
        <BaseSelect
          v-model="store.filters.sort"
          :options="sortOptions"
          placeholder="Sort"
          class="w-full sm:w-32"
          @update:modelValue="store.applyFilters()"
        />

        <!-- Per Page -->
        <BaseSelect
          :modelValue="store.pagination.per_page"
          :options="perPageOptions"
          placeholder="Per Page"
          class="w-full sm:w-28"
          @update:modelValue="store.updatePerPage"
        />

        <!-- Reset Filters (if active) -->
        <button
          v-if="store.hasActiveFilters"
          @click="store.resetFilters()"
          class="px-3 py-2 text-xs font-medium text-secondary-text hover:text-primary-text bg-card-background hover:bg-background rounded-lg border border-primary-border transition-colors whitespace-nowrap"
        >
          Clear
        </button>

        <Tooltip text="Sync Logs" placement="top">
          <button
            :disabled="store.isSyncing"
            @click="store.syncLogs()"
            class="flex items-center gap-1 px-3 py-2 text-xs font-medium text-secondary-text hover:text-primary-text bg-card-background hover:bg-background rounded-lg border border-primary-border transition-colors whitespace-nowrap"
            :class="{ 'opacity-50 cursor-not-allowed': store.isSyncing }"
          >
            <RefreshCcw size="16" />
          </button>
        </Tooltip>
      </div>
    </div>

    <!-- Date Range Picker -->
    <div class="flex flex-col sm:flex-row items-center gap-3">
      <input
        v-model="store.filters.startDate"
        type="date"
        placeholder="Start Date"
        class="px-3 py-2 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
        @change="store.applyFilters()"
      />
      <span class="text-secondary-text text-xs hidden sm:block">to</span>
      <input
        v-model="store.filters.endDate"
        type="date"
        placeholder="End Date"
        class="px-3 py-2 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
        @change="store.applyFilters()"
      />
      <button
        v-if="store.filters.startDate || store.filters.endDate"
        @click="
          () => {
            store.filters.startDate = null;
            store.filters.endDate = null;
            store.applyFilters();
          }
        "
        class="cursor-pointer px-3 py-2 text-xs font-medium text-secondary-text hover:text-primary-text bg-card-background hover:bg-background rounded-lg border border-primary-border transition-colors whitespace-nowrap"
      >
        Clear Dates
      </button>
    </div>

    <!-- Table -->
    <div class="w-full border border-primary-border rounded-xl overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-primary-border">
            <th class="p-3 text-xs font-semibold text-primary-text text-start">
              Date
            </th>
            <th class="p-3 text-xs font-semibold text-primary-text text-start">
              Event
            </th>
            <th class="p-3 text-xs font-semibold text-primary-text text-start">
              Subject
            </th>
            <th class="p-3 text-xs font-semibold text-primary-text text-start">
              From
            </th>
            <th class="p-3 text-xs font-semibold text-primary-text text-start">
              Email
            </th>
            <th class="p-3 text-xs font-semibold text-primary-text text-start">
              IP
            </th>
            <th class="p-3 text-xs font-semibold text-primary-text text-start">
              Message ID
            </th>
          </tr>
        </thead>

        <!-- Skeleton Loading -->
        <tbody v-if="store.loading">
          <tr
            v-for="n in 5"
            :key="n"
            class="border-b border-primary-border animate-pulse"
          >
            <td class="p-3">
              <div class="h-3 w-24 bg-card-background rounded" />
            </td>
            <td class="p-3">
              <div class="h-3 w-16 bg-card-background rounded" />
            </td>
            <td class="p-3">
              <div class="h-3 w-40 bg-card-background rounded" />
            </td>
            <td class="p-3">
              <div class="h-3 w-32 bg-card-background rounded" />
            </td>
            <td class="p-3">
              <div class="h-3 w-36 bg-card-background rounded" />
            </td>
            <td class="p-3">
              <div class="h-3 w-20 bg-card-background rounded" />
            </td>
            <td class="p-3">
              <div class="h-3 w-32 bg-card-background rounded" />
            </td>
          </tr>
        </tbody>

        <!-- Empty State -->
        <tbody v-else-if="store.logs.length === 0">
          <tr>
            <td colspan="7" class="py-16 text-center">
              <div class="flex flex-col items-center gap-3">
                <div
                  class="w-12 h-12 rounded-full bg-card-background flex items-center justify-center"
                >
                  <Mail class="w-5 h-5 text-secondary-text" />
                </div>
                <p class="text-sm font-medium text-primary-text">
                  No email logs found
                </p>
                <p class="text-xs text-secondary-text">
                  {{
                    store.hasActiveFilters
                      ? "Try adjusting your filters"
                      : "Email logs will appear here"
                  }}
                </p>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Data Rows -->
        <tbody v-else>
          <tr
            v-for="log in store.logs"
            :key="log.messageId"
            class="border-b border-primary-border last:border-none hover:bg-card-background transition-colors"
          >
            <td
              class="p-3 text-xs font-medium text-primary-text whitespace-nowrap"
            >
              {{ formatDate(log.date) }}
            </td>
            <td class="p-3 text-xs">
              <span
                class="px-2 py-0.5 rounded-full text-[11px] font-medium border capitalize"
                :class="eventClass(log.event)"
              >
                {{ log.event }}
              </span>
            </td>
            <td
              class="p-3 text-xs text-primary-text max-w-[250px] truncate"
              :title="log.subject"
            >
              {{ log.subject }}
            </td>
            <td
              class="p-3 text-xs text-secondary-text max-w-[200px] truncate"
              :title="log.from"
            >
              {{ log.from }}
            </td>
            <td
              class="p-3 text-xs text-secondary-text max-w-[200px] truncate"
              :title="log.email"
            >
              {{ log.email }}
            </td>
            <td class="p-3 text-xs text-secondary-text">
              {{ log.ip }}
            </td>
            <td
              class="p-3 text-xs text-secondary-text max-w-[200px] truncate"
              :title="log.messageId"
            >
              {{ log.messageId }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <Pagination
      v-if="store.pagination.total_pages > 1"
      :pagination="store.pagination"
      @page-change="store.changePage"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, watchEffect } from "vue";
import { Search, Mail, RefreshCcw } from "lucide-vue-next";
import { useEmailLogsStore } from "@/stores/emails/emailLogs";
import BaseSelect from "@/components/common/BaseSelect.vue";
import Pagination from "@/components/common/Pagination.vue";
import Tooltip from "@/components/common/Tooltip.vue";

const store = useEmailLogsStore();

let searchTimeout;

const sortOptions = [
  { label: "Newest First", value: "desc" },
  { label: "Oldest First", value: "asc" },
];

const perPageOptions = [
  { label: "10", value: 10 },
  { label: "25", value: 25 },
  { label: "50", value: 50 },
  { label: "100", value: 100 },
];

const debounceSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    store.applyFilters();
  }, 500);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const eventClass = (event) => {
  const classes = {
    delivered:
      "bg-primary-green/20 text-primary-green border border-primary-green/30",
    opened:
      "bg-primary-blue/20 text-primary-blue border border-primary-blue/30",
    requests:
      "bg-primary-yellow/20 text-primary-yellow border border-primary-yellow/30",
    failed: "bg-primary-red/20 text-primary-red border border-primary-red/30",
    bounced: "bg-primary-red/20 text-primary-red border border-primary-red/30",
  };
  return (
    classes[event] ||
    "bg-primary-border/20 text-secondary-text border border-primary-border"
  );
};

watchEffect(() => {
  // console.log("logs:", store.logs);
});

onMounted(() => {
  store.fetchLogs(true);
});
</script>
