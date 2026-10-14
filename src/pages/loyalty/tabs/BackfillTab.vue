<template>
  <div class="space-y-6">
    <!-- Header & Action -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-base font-semibold text-primary-text">
          MT5 History Backfill Jobs
        </h2>
        <p class="text-xs text-secondary-text">
          Background batch jobs scanning past MT5 trading activity and awarding
          loyalty points.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="hasPermission('loyalty.backfill')"
          type="button"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs"
          @click="isStartDrawerOpen = true"
        >
          <Play class="w-3.5 h-3.5" />
          <span>Start MT5 Backfill</span>
        </button>

        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-secondary-text hover:text-primary-text text-xs font-medium transition cursor-pointer"
          @click="fetchData"
        >
          <RefreshCw
            class="w-3.5 h-3.5 text-primary"
            :class="store.loading ? 'animate-spin' : ''"
          />
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Filter Bar -->
    <div
      class="flex flex-wrap items-center gap-2.5 p-3 bg-card-background border border-primary-border rounded-xl text-xs"
    >
      <div class="relative w-full sm:w-48">
        <Search
          class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text"
        />
        <input
          v-model="filters.trading_account_id"
          type="number"
          placeholder="Filter by Trading A/C..."
          class="w-full pl-8 pr-3 py-1.5 bg-background border border-primary-border rounded-lg text-primary-text placeholder:text-secondary-text/60 outline-none focus:border-primary transition font-mono text-xs"
          @keyup.enter="fetchData"
        />
      </div>

      <button
        type="button"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold transition cursor-pointer text-xs"
        @click="fetchData"
      >
        <Search class="w-3 h-3" />
        <span>Search</span>
      </button>

      <button
        v-if="filters.trading_account_id"
        type="button"
        class="px-2.5 py-1.5 rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition cursor-pointer text-xs"
        @click="resetFilters"
      >
        Clear
      </button>
    </div>

    <!-- Backfill Jobs DataTable -->
    <DataTable
      :columns="columns"
      :data="jobs"
      :loading="store.loading"
      row-key="id"
    >
      <template #empty>
        <div
          class="flex flex-col items-center justify-center p-12 text-center gap-3"
        >
          <div
            class="w-12 h-12 rounded-xl bg-card-background border border-primary-border flex items-center justify-center text-secondary-text"
          >
            <History class="w-6 h-6 text-primary" />
          </div>
          <div class="space-y-1">
            <h3 class="text-sm font-semibold text-primary-text">
              No Backfill Jobs Found
            </h3>
            <p class="text-xs text-secondary-text max-w-sm mx-auto">
              {{
                filters.trading_account_id
                  ? "No jobs match this trading account filter."
                  : "Queue historical MT5 trade backfills for newly enrolled accounts to credit eligible points."
              }}
            </p>
          </div>
          <button
            v-if="hasPermission('loyalty.backfill')"
            type="button"
            class="mt-2 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
            @click="isStartDrawerOpen = true"
          >
            <Play class="w-3.5 h-3.5" />
            <span>Start First Backfill</span>
          </button>
        </div>
      </template>

      <template #cell-id="{ row }">
        <span class="text-secondary-text font-mono">#{{ row.id }}</span>
      </template>

      <template #cell-trading_account_id="{ row }">
        <span class="font-mono font-medium text-primary"
          >#{{ row.trading_account_id }}</span
        >
      </template>

      <template #cell-date_range="{ row }">
        <span class="text-secondary-text text-[11px] leading-relaxed">
          {{ formatDate(row.from_at) }} – {{ formatDate(row.to_at) }}
        </span>
      </template>

      <template #cell-status="{ row }">
        <span
          class="px-2 py-0.5 rounded text-[10px] font-medium uppercase"
          :class="getStatusBadgeClass(row.status)"
        >
          {{ row.status }}
        </span>
      </template>

      <template #cell-deals_seen="{ row }">
        <span class="text-primary-text font-mono">{{
          row.deals_seen ?? 0
        }}</span>
      </template>

      <template #cell-awarded="{ row }">
        <span class="font-mono font-medium text-primary-green">{{
          row.awarded ?? 0
        }}</span>
      </template>

      <template #cell-skipped_existing="{ row }">
        <span class="text-secondary-text font-mono">{{
          row.skipped_existing ?? 0
        }}</span>
      </template>

      <template #cell-skipped_ineligible="{ row }">
        <span class="text-secondary-text font-mono">{{
          row.skipped_ineligible ?? 0
        }}</span>
      </template>

      <template #cell-errors="{ row }">
        <span
          class="font-mono"
          :class="
            row.errors > 0
              ? 'text-rose-400 font-medium'
              : 'text-secondary-text'
          "
        >
          {{ row.errors ?? 0 }}
        </span>
      </template>

      <template #cell-started_at="{ row }">
        <span class="text-secondary-text whitespace-nowrap">
          {{ formatDate(row.started_at) }}
        </span>
      </template>

      <template #cell-actions="{ row }">
        <div class="flex items-center justify-end">
          <button
            type="button"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-primary-border hover:bg-background text-secondary-text hover:text-primary transition cursor-pointer text-xs"
            title="Inspect Backfill Job"
            @click="handleViewDetail(row)"
          >
            <Eye class="w-3 h-3" />
            <span>Inspect</span>
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Start Backfill Slide-Over Drawer -->
    <StartBackfillDrawer
      :open="isStartDrawerOpen"
      @close="isStartDrawerOpen = false"
      @queued="fetchData"
    />

    <!-- Backfill Detail Slide-Over Drawer -->
    <BackfillDetailDrawer
      :open="isDetailDrawerOpen"
      :job="selectedJob"
      @close="isDetailDrawerOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { Play, RefreshCw, History, Search, Eye } from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import { formatDate } from "@/utils/timeFormatter";
import DataTable from "@/components/common/DataTable/DataTable.vue";
import StartBackfillDrawer from "../components/StartBackfillDrawer.vue";
import BackfillDetailDrawer from "../components/BackfillDetailDrawer.vue";

const store = useLoyaltyStore();
const { hasPermission } = usePermissionCheck();

const columns = [
  { key: "id", label: "Job ID", sortable: true },
  { key: "trading_account_id", label: "Trading Account", sortable: true },
  { key: "date_range", label: "Date Range", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "deals_seen", label: "Deals Seen", sortable: true },
  { key: "awarded", label: "Awarded", sortable: true },
  { key: "skipped_existing", label: "Skipped Exist.", sortable: true },
  { key: "skipped_ineligible", label: "Ineligible", sortable: true },
  { key: "errors", label: "Errors", sortable: true },
  { key: "started_at", label: "Started At", sortable: true },
  { key: "actions", label: "Action", align: "right" },
];

const isStartDrawerOpen = ref(false);
const isDetailDrawerOpen = ref(false);
const selectedJob = ref(null);

const filters = reactive({
  trading_account_id: "",
});

const jobs = computed(() => store.backfillJobs || []);

const fetchData = (force = false) => {
  const params = {};
  if (filters.trading_account_id) {
    params.trading_account_id = Number(filters.trading_account_id);
  }
  store.fetchBackfillJobs(params, force);
};

const handleRefresh = () => {
  fetchData(true);
};

const resetFilters = () => {
  filters.trading_account_id = "";
  fetchData(true);
};

const handleViewDetail = (job) => {
  selectedJob.value = job;
  store.activeBackfillJob = job;
  isDetailDrawerOpen.value = true;
};

const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "bg-primary-green/10 text-primary-green border border-primary-green/20";
    case "running":
      return "bg-primary/10 text-primary border border-primary/20 animate-pulse";
    case "queued":
      return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
    case "failed":
      return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
    case "cancelled":
    default:
      return "bg-background text-secondary-text border border-primary-border";
  }
};

watch(
  () => store.program?.id,
  (newId) => {
    if (newId) {
      fetchData(true);
    }
  },
);

onMounted(() => {
  fetchData();
});
</script>
