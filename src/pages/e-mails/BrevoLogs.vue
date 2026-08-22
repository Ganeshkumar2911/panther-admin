<template>
  <div class="space-y-4 py-3 min-h-[calc(100vh-100px)] flex flex-col">
    <!-- Filter & Toolbar Bar -->
    <div class="relative z-10">
      <div
        class="flex w-full min-w-0 flex-col gap-2.5 rounded-xl border border-primary-border bg-card-background/50 p-2.5 sm:flex-row sm:items-center justify-between overflow-visible"
      >
        <!-- Left: Filter Controls -->
        <div class="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          <!-- Email Search Dropdown (/client-list API) -->
          <BaseSelect
            v-model="store.filters.email"
            :options="[
              { label: 'All Emails', value: null },
              ...store.clientEmails,
            ]"
            placeholder="Filter Email"
            class="w-full sm:w-52 lg:w-60"
            searchable
            :isLoading="store.isLoadingClientEmails"
            @search="handleSearchClientEmails"
            @update:modelValue="store.applyFilters()"
          />

          <!-- Event Filter Dropdown (All 14 Brevo Events) -->
          <BaseSelect
            v-model="store.filters.event"
            :options="[
              { label: 'All Events', value: null },
              ...store.eventOptions,
            ]"
            placeholder="Filter Event"
            class="w-full sm:w-44 lg:w-48"
            searchable
            @update:modelValue="store.applyFilters()"
          />

          <!-- Tag Filter Dropdown (/email-templates API using 'code' property) -->
          <BaseSelect
            v-model="store.filters.tags"
            :options="[
              { label: 'All Tags', value: 'ALL' },
              ...store.templateTags,
            ]"
            placeholder="Filter Tag"
            class="w-full sm:w-56 lg:w-64"
            searchable
            :isLoading="store.isLoadingTemplateTags"
            @update:modelValue="store.applyFilters()"
          />

          <!-- Date Range Picker -->
          <BaseDatePicker
            v-model="dateRangeValue"
            :range="true"
            placeholder="Filter date range..."
            class="w-full sm:w-56 lg:w-60"
          />

          <!-- Sort Dropdown -->
          <BaseSelect
            v-model="store.filters.sort"
            :options="sortOptions"
            placeholder="Sort"
            class="w-full sm:w-32 lg:w-36"
            @update:modelValue="store.applyFilters()"
          />

          <!-- Per Page Select -->
          <BaseSelect
            :modelValue="store.pagination.per_page"
            :options="perPageOptions"
            placeholder="Per Page"
            class="w-full sm:w-24"
            @update:modelValue="store.updatePerPage"
          />

          <!-- Refresh & Reset Action Buttons -->
          <div class="flex items-center gap-1.5 h-9">
            <Tooltip text="Refresh Logs" placement="top">
              <button
                :disabled="store.loading"
                @click="store.fetchLogs(true)"
                class="w-9 h-9 flex items-center justify-center text-xs font-medium text-secondary-text hover:text-primary-text bg-card-background hover:bg-background rounded-lg border border-primary-border transition-colors cursor-pointer"
                :class="{ 'opacity-50 cursor-not-allowed': store.loading }"
              >
                <RefreshCcw
                  size="15"
                  :class="{ 'animate-spin': store.loading }"
                />
              </button>
            </Tooltip>

            <button
              v-if="store.hasActiveFilters"
              @click="store.resetFilters()"
              class="h-9 px-3 text-xs font-semibold text-secondary-text hover:text-primary-text bg-card-background hover:bg-background rounded-lg border border-primary-border transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Filters Pills Bar -->
    <div
      v-if="store.hasActiveFilters"
      class="flex items-center gap-2 flex-wrap text-xs px-1"
    >
      <span class="text-secondary-text font-medium text-[11px]">Active Filters:</span>
      
      <span
        v-if="store.filters.email"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[11px]"
      >
        Email: {{ store.filters.email }}
        <X class="w-3 h-3 cursor-pointer hover:opacity-80" @click="handleClearEmail" />
      </span>

      <span
        v-if="store.filters.event"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[11px] capitalize"
      >
        Event: {{ store.filters.event }}
        <X class="w-3 h-3 cursor-pointer hover:opacity-80" @click="store.filters.event = null; store.applyFilters()" />
      </span>

      <span
        v-if="store.filters.tags && store.filters.tags !== 'ALL'"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[11px]"
      >
        Tag: {{ store.filters.tags }}
        <X class="w-3 h-3 cursor-pointer hover:opacity-80" @click="store.filters.tags = 'ALL'; store.applyFilters()" />
      </span>

      <span
        v-if="store.filters.startDate || store.filters.endDate"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[11px]"
      >
        Date: {{ store.filters.startDate || 'Any' }} to {{ store.filters.endDate || 'Any' }}
        <X
          class="w-3 h-3 cursor-pointer hover:opacity-80"
          @click="store.filters.startDate = null; store.filters.endDate = null; store.applyFilters()"
        />
      </span>
    </div>

    <!-- Logs Table -->
    <div class="w-full border border-primary-border rounded-xl overflow-x-auto bg-card-background">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-primary-border bg-background/50">
            <th class="p-3 text-xs font-semibold text-primary-text text-start">
              Date & Time
            </th>
            <th class="p-3 text-xs font-semibold text-primary-text text-start">
              Event Status
            </th>
            <th class="p-3 text-xs font-semibold text-primary-text text-start">
              Subject
            </th>
            <th class="p-3 text-xs font-semibold text-primary-text text-start">
              Sender
            </th>
            <th class="p-3 text-xs font-semibold text-primary-text text-start">
              Recipient Email
            </th>
            <th class="p-3 text-xs font-semibold text-primary-text text-start">
              Tag / Campaign
            </th>
            <th class="p-3 text-xs font-semibold text-primary-text text-start">
              Action
            </th>
          </tr>
        </thead>

        <!-- Skeleton Loading State -->
        <tbody v-if="store.loading">
          <tr
            v-for="n in 6"
            :key="n"
            class="border-b border-primary-border animate-pulse"
          >
            <td class="p-3">
              <div class="h-3.5 w-28 bg-primary-border/40 rounded" />
            </td>
            <td class="p-3">
              <div class="h-5 w-20 bg-primary-border/40 rounded-full" />
            </td>
            <td class="p-3">
              <div class="h-3.5 w-44 bg-primary-border/40 rounded" />
            </td>
            <td class="p-3">
              <div class="h-3.5 w-32 bg-primary-border/40 rounded" />
            </td>
            <td class="p-3">
              <div class="h-3.5 w-36 bg-primary-border/40 rounded" />
            </td>
            <td class="p-3">
              <div class="h-3.5 w-20 bg-primary-border/40 rounded" />
            </td>
            <td class="p-3">
              <div class="h-7 w-8 bg-primary-border/40 rounded-lg" />
            </td>
          </tr>
        </tbody>

        <!-- Empty State -->
        <tbody v-else-if="store.logs.length === 0">
          <tr>
            <td colspan="7" class="py-16 text-center">
              <div class="flex flex-col items-center gap-3">
                <div
                  class="w-12 h-12 rounded-full bg-background border border-primary-border flex items-center justify-center text-secondary-text"
                >
                  <Mail class="w-6 h-6" />
                </div>
                <p class="text-sm font-semibold text-primary-text">
                  No Brevo email logs found
                </p>
                <p class="text-xs text-secondary-text max-w-sm">
                  {{
                    store.hasActiveFilters
                      ? "No records matched your current filter criteria. Try adjusting or clearing your filters."
                      : "Logs from Brevo dispatch will appear here."
                  }}
                </p>
                <button
                  v-if="store.hasActiveFilters"
                  @click="store.resetFilters()"
                  class="mt-1 px-3 py-1.5 text-xs font-semibold text-primary border border-primary/30 hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Data Rows -->
        <tbody v-else>
          <tr
            v-for="(log, idx) in store.logs"
            :key="log.messageId || log.id || idx"
            class="border-b border-primary-border last:border-none hover:bg-background/50 transition-colors"
          >
            <td
              class="p-3 text-xs font-medium text-primary-text whitespace-nowrap"
            >
              {{ formatDate(log.date || log.created_at || log.timestamp) }}
            </td>
            <td class="p-3 text-xs">
              <span
                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize"
                :class="eventClass(log.event)"
              >
                {{ formatEventName(log.event) }}
              </span>
            </td>
            <td
              class="p-3 text-xs text-primary-text max-w-[220px] truncate"
              :title="log.subject || '—'"
            >
              {{ log.subject || "—" }}
            </td>
            <td
              class="p-3 text-xs text-secondary-text max-w-[180px] truncate"
              :title="log.from || log.sender || '—'"
            >
              {{ log.from || log.sender || "—" }}
            </td>
            <td
              class="p-3 text-xs text-primary-text font-mono max-w-[200px] truncate"
              :title="log.email || log.recipient || '—'"
            >
              {{ log.email || log.recipient || "—" }}
            </td>
            <td class="p-3 text-xs text-secondary-text">
              <span
                v-if="log.tag || log.tags"
                class="px-2 py-0.5 rounded text-[11px] font-mono bg-background border border-primary-border text-secondary-text"
              >
                {{ log.tag || log.tags }}
              </span>
              <span v-else class="text-secondary-text/60">—</span>
            </td>
            <td class="p-3 text-xs text-secondary-text">
              <Tooltip text="View Details" placement="top">
                <button
                  @click="handleViewLog(log.messageId || log.id)"
                  class="cursor-pointer flex items-center justify-center w-8 h-8 rounded-lg border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary-text transition-colors"
                >
                  <Eye class="w-4 h-4" />
                </button>
              </Tooltip>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Footer -->
    <div
      v-if="store.pagination && (store.pagination.hasNext || store.pagination.hasPrev || store.pagination.total_pages > 1)"
      class="pt-3 border-t border-primary-border flex items-center justify-between flex-wrap gap-3 mt-auto"
    >
      <p class="text-xs text-secondary-text">
        Showing Page <strong class="text-primary-text">{{ store.pagination.page }}</strong>
        <template v-if="store.pagination.total_pages">
          of <strong class="text-primary-text">{{ store.pagination.total_pages }}</strong>
        </template>
        <template v-if="store.pagination.total_items">
          (<strong class="text-primary-text">{{ store.pagination.total_items }}</strong> total logs)
        </template>
      </p>

      <SimplePagination
        v-if="store.pagination.hasNext || store.pagination.hasPrev"
        :pagination="store.pagination"
        @page-change="store.changePage"
      />
    </div>

    <!-- Log Details Slide-over Modal -->
    <ViewEmailLogDetails
      v-if="openDialog"
      :open="openDialog"
      :id="selectedLogId"
      @close="handleCloseDialog"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import {
  Search,
  Mail,
  RefreshCcw,
  Eye,
  RotateCcw,
  X,
  Tag,
} from "lucide-vue-next";
import { useEmailLogsStore } from "@/stores/emails/emailLogs";
import BaseSelect from "@/components/common/BaseSelect.vue";
import BaseDatePicker from "@/components/common/BaseDatePicker.vue";
import SimplePagination from "@/components/common/SimplePagination.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import ViewEmailLogDetails from "@/pages/e-mails/ViewEmailLogDetails.vue";

const store = useEmailLogsStore();
const openDialog = ref(false);
const selectedLogId = ref(null);

let searchTimeout = null;

const dateRangeValue = computed({
  get() {
    if (store.filters.startDate || store.filters.endDate) {
      return {
        start: store.filters.startDate || null,
        end: store.filters.endDate || null,
      };
    }
    return null;
  },
  set(val) {
    if (!val) {
      store.filters.startDate = null;
      store.filters.endDate = null;
    } else if (Array.isArray(val)) {
      store.filters.startDate = val[0] || null;
      store.filters.endDate = val[1] || null;
    } else if (typeof val === "object") {
      store.filters.startDate = val.start || val.from || null;
      store.filters.endDate = val.end || val.to || null;
    }
    store.applyFilters();
  },
});

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
  }, 400);
};

const handleClearEmail = () => {
  store.filters.email = "";
  store.applyFilters();
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatEventName = (evt) => {
  if (!evt) return "—";
  const names = {
    hardBounces: "Hard Bounce",
    softBounces: "Soft Bounce",
    loadedByProxy: "Loaded By Proxy",
  };
  return names[evt] || String(evt);
};

const eventClass = (event) => {
  const e = String(event || "").toLowerCase();
  if (e === "delivered") {
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  }
  if (e === "opened") {
    return "bg-sky-500/10 text-sky-400 border-sky-500/20";
  }
  if (e === "clicks") {
    return "bg-purple-500/10 text-purple-400 border-purple-500/20";
  }
  if (e === "requests") {
    return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
  }
  if (e === "deferred") {
    return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }
  if (e.includes("bounce")) {
    return "bg-rose-500/10 text-rose-400 border-rose-500/20";
  }
  if (e === "spam") {
    return "bg-orange-500/10 text-orange-400 border-orange-500/20";
  }
  if (e === "blocked" || e === "error" || e === "invalid") {
    return "bg-red-500/10 text-red-400 border-red-500/20";
  }
  if (e === "unsubscribed") {
    return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
  if (e === "loadedbyproxy") {
    return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
  }
  return "bg-primary-border/20 text-secondary-text border-primary-border";
};

const handleViewLog = (messageId) => {
  if (!messageId) return;
  selectedLogId.value = messageId;
  openDialog.value = true;
};

const handleCloseDialog = () => {
  openDialog.value = false;
  selectedLogId.value = null;
  store.resetLogDetails();
};

let clientSearchTimeout = null;
const handleSearchClientEmails = (query) => {
  clearTimeout(clientSearchTimeout);
  clientSearchTimeout = setTimeout(() => {
    store.fetchClientEmails(query);
  }, 350);
};

onMounted(() => {
  store.setActiveFetcher(() => store.fetchLogs(true));
  store.fetchLogs(true);
  store.fetchTemplateTags();
  store.fetchClientEmails();
});
</script>
