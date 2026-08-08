<template>
  <div class="space-y-5 py-4">
    <!-- Filters Section -->
    <div class="relative z-10">
      <div
        class="flex w-full min-w-0 flex-col gap-2 rounded-xl border border-primary-border bg-card-background/40 p-2 sm:flex-row sm:items-center sm:flex-wrap overflow-visible"
      >
        <!-- Tags Filter -->
        <BaseSelect
          v-model="store.filters.tags"
          :options="[{ label: 'All Tags', value: 'ALL' }, ...store.tags]"
          placeholder="Filters"
          class="w-full sm:w-48"
          searchable
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
        </div>

        <Tooltip text="Refresh Logs" placement="top">
          <button
            :disabled="store.isLoadingLogsList"
            @click="store.fetchLogsList(true)"
            class="flex items-center gap-1 px-3 py-2 text-xs font-medium text-secondary-text hover:text-primary-text bg-card-background hover:bg-background rounded-lg border border-primary-border transition-colors whitespace-nowrap"
            :class="{ 'opacity-50 cursor-not-allowed': store.loading }"
          >
            <RefreshCcw size="16" />
          </button>
        </Tooltip>
        <Tooltip :text="syncTooltip" placement="top">
          <button
            :disabled="isButtonDisabled"
            @click="store.syncMail"
            class="flex items-center gap-1 px-3 py-2 text-xs font-medium text-secondary-text hover:text-primary-text bg-card-background hover:bg-background rounded-lg border border-primary-border transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CloudSync size="16" />
          </button>
        </Tooltip>

        <!-- Reset Filters (if active) -->
        <button
          v-if="store.hasActiveFilters"
          @click="store.resetFilters()"
          class="px-3 py-2 text-xs font-medium text-secondary-text hover:text-primary-text bg-card-background hover:bg-background rounded-lg border border-primary-border transition-colors whitespace-nowrap"
        >
          Clear
        </button>
      </div>
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
      v-else-if="store.logLists?.length === 0"
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
        v-for="d in store.logLists"
        :key="d.id"
        class="bg-card-background border border-primary-border rounded-2xl p-5 flex flex-col gap-3 hover:border-primary/30 transition-all duration-200"
      >
        <!-- Top -->
        <div class="flex items-center justify-between gap-4">
          <p class="text-sm font-semibold text-primary-text">
            {{ d.tag }}
          </p>
          <p class="text-xs font-semibold text-secondary-text">
            {{ formatDate(d.last_sent_at) }}
          </p>
          <button
            class="flex items-center justify-center gap-1.5 p-1 rounded-lg border border-primary-border text-xs text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
            @click="navigateToViewDetailsPage(d.campaign_id)"
          >
            <ChevronRight size="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watchEffect } from "vue";
import {
  Search,
  Mail,
  RefreshCcw,
  Eye,
  ChevronRight,
  CloudSync,
} from "lucide-vue-next";
import { useEmailLogsStore } from "@/stores/emails/emailLogs";
import BaseSelect from "@/components/common/BaseSelect.vue";
import Pagination from "@/components/common/Pagination.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import SimplePagination from "@/components/common/SimplePagination.vue";
import { useRouter } from "vue-router";
// import ViewEmailLog from "@/pages/e-mails/ViewEmailLog.vue";

const router = useRouter();
const store = useEmailLogsStore();
const openDialog = ref(false);
let tagsSearchTimer = null;
const selectedLogId = ref(null);

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

// Aapke script tag ke andar (Vue 3 Composition API example)
const isButtonDisabled = computed(() => {
  const { startDate, endDate, tags } = store.filters;
  return (
    store.isSyncing ||
    !startDate ||
    !endDate ||
    !tags ||
    tags === "ALL"
  );
});

const syncTooltip = computed(() =>
  isButtonDisabled.value
    ? "Sync Logs : date and filter are required"
    : "Sync Logs",
);

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

// Navigate
const navigateToViewDetailsPage = (id) => {
  router.push({ name: "email-logs-details", params: { tagId: id } });
  store.reset();
};

watchEffect(() => {
  console.log("logs: w", store.logLists);
});

// onMounted(() => {
//   store.fetchLogsList();
//   store.fetchTags();
// });

onMounted(() => {
  store.setActiveFetcher(() => store.fetchLogsList(true));
  store.fetchLogsList();
  store.fetchTags();
});
</script>
