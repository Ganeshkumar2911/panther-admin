<template>
  <div class="space-y-5 py-4">
    <!-- Filters Section -->
    <div class="relative z-10">
      <div
        class="flex w-full min-w-0 flex-col gap-2 rounded-xl border border-primary-border bg-card-background/40 p-2 sm:flex-row sm:items-center sm:flex-wrap overflow-visible"
      >
        <!-- Email Search -->
        <div class="relative sm:flex-1 sm:min-w-32 lg:max-w-64">
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

        <!-- Tags Filter -->
        <BaseSelect
          v-model="store.filters.tags"
          :options="[{ label: 'All Tags', value: 'ALL' }, ...store.tags]"
          placeholder="Filters"
          class="w-full sm:w-48"
          searchable
          @update:modelValue="store.applyFilters()"
        />

        <!-- Days Quick Filter -->
        <BaseSelect
          v-model="store.filters.days"
          :options="[{ label: 'All Days', value: null }, ...store.dayOptions]"
          placeholder="Quick Date"
          class="w-full sm:w-48"
          @update:modelValue="store.applyFilters()"
        />

        <!-- Sort -->
        <BaseSelect
          v-model="store.filters.sort"
          :options="sortOptions"
          placeholder="Sort"
          class="w-full sm:w-48"
          @update:modelValue="store.applyFilters()"
        />

        <!-- Per Page -->
        <BaseSelect
          :modelValue="store.pagination.per_page"
          :options="perPageOptions"
          placeholder="Per Page"
          class="w-full sm:w-48"
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

        <Tooltip text="Refresh Logs" placement="top">
          <button
            :disabled="store.loading"
            @click="store.fetchLogs(true)"
            class="flex items-center gap-1 px-3 py-2 text-xs font-medium text-secondary-text hover:text-primary-text bg-card-background hover:bg-background rounded-lg border border-primary-border transition-colors whitespace-nowrap"
            :class="{ 'opacity-50 cursor-not-allowed': store.loading }"
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

    <div
      v-if="store.isLoadingLogsList"
      class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
    >
      <div
        v-for="n in 6"
        :key="n"
        class="bg-card-background border border-primary-border rounded-2xl p-5 animate-pulse space-y-3"
      >
        <div class="flex items-center justify-between">
          <div class="h-4 w-32 bg-background rounded" />
          <div class="h-5 w-14 bg-background rounded-full" />
        </div>
        <div class="flex gap-1.5">
          <div class="h-5 w-12 bg-background rounded-full" />
          <div class="h-5 w-20 bg-background rounded-full" />
        </div>
        <div class="h-3 w-full bg-background rounded" />
        <div class="h-3 w-3/4 bg-background rounded" />
        <div class="flex gap-1.5 pt-1">
          <div class="h-5 w-10 bg-background rounded-full" />
          <div class="h-5 w-10 bg-background rounded-full" />
        </div>
      </div>
    </div>

    <div
      v-else-if="store.logLists?.records?.length === 0"
      class="flex flex-col items-center gap-4 py-24"
    >
      <div
        class="w-16 h-16 rounded-2xl bg-card-background border border-primary-border flex items-center justify-center"
      >
        <Mail class="w-7 h-7 text-secondary-text" />
      </div>
      <div class="text-center">
        <p class="text-sm font-semibold text-primary-text">No logs found</p>
        <p class="text-xs text-secondary-text mt-1">
          Create your first email log to get started
        </p>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="d in store.logLists?.records"
        :key="d.id"
        class="bg-card-background border border-primary-border rounded-2xl p-5 flex flex-col gap-3 hover:border-primary/30 transition-all duration-200"
      >
        <!-- Top -->
        <div class="flex items-start justify-between gap-4">
          <p class="text-sm font-semibold text-primary-text">
            {{ d.tag }}
          </p>
          <p class="text-xs font-semibold text-secondary-text">
            {{ formatDate(d.campaigns.campaign_date) }}
          </p>
        </div>

        <!-- Actions -->
        <!-- <div
          v-if="
            hasPermission('email.template_view') ||
            hasPermission('email.template_update')
          "
          class="flex gap-2 pt-2.5 mt-auto border-t border-primary-border"
        >
          <button
            v-if="hasPermission('email.template_view')"
            class="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-border text-xs text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
            @click="openPreview(d.id)"
          >
            <Eye class="w-3.5 h-3.5" /> Preview
          </button>
          <button
            v-if="hasPermission('email.template_update')"
            class="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors cursor-pointer"
            @click="openEdit(d.id)"
          >
            <Pencil class="w-3.5 h-3.5" /> Edit
          </button>
        </div> -->
      </div>
    </div>

    <SimplePagination
      v-if="store.pagination.hasNext || store.pagination.hasPrev"
      :pagination="store.pagination"
      @page-change="store.changePage"
    />

    <!-- <ViewEmailLog
      v-if="openDialog"
      :open="openDialog"
      :id="selectedLogId"
      @close="handleCloseDialog"
    /> -->
  </div>
</template>

<script setup>
import { onMounted, ref, watchEffect } from "vue";
import { Search, Mail, RefreshCcw, Eye } from "lucide-vue-next";
import { useEmailLogsStore } from "@/stores/emails/emailLogs";
import BaseSelect from "@/components/common/BaseSelect.vue";
import Pagination from "@/components/common/Pagination.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import SimplePagination from "@/components/common/SimplePagination.vue";
// import ViewEmailLog from "@/pages/e-mails/ViewEmailLog.vue";

const store = useEmailLogsStore();
const openDialog = ref(false);
let tagsSearchTimer = null;
const selectedLogId = ref(null);

console.log("logs:", store.logLists);

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

const handleViewLog = (messageId) => {
  selectedLogId.value = messageId;
  openDialog.value = true;
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

const onTagsSearch = (query) => {
  clearTimeout(tagsSearchTimer);
  tagsSearchTimer = setTimeout(() => store.fetchTags(query), 350);
};

const handleCloseDialog = () => {
  openDialog.value = false;
  selectedLogId.value = null;
  store.resetLogDetails();
};

watchEffect(() => {
  console.log("logs: w", store.logLists);
});

onMounted(() => {
  store.fetchLogsList();
  store.fetchTags();
});
</script>
