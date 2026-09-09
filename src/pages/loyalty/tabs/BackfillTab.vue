<template>
  <div class="space-y-6">
    <!-- Header & Action -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-lg font-bold text-primary-text">MT5 History Backfill Jobs</h2>
        <p class="text-xs text-secondary-text">
          Background batch jobs processing past MT5 trading history for enrolled accounts.
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          v-if="hasPermission('loyalty.backfill')"
          type="button"
          class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-xs"
          @click="isStartModalOpen = true"
        >
          <Play class="w-3.5 h-3.5" />
          <span>Start MT5 Backfill</span>
        </button>

        <button
          type="button"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-primary-text text-xs font-semibold transition cursor-pointer shadow-2xs"
          @click="fetchData"
        >
          <RefreshCw class="w-3.5 h-3.5 text-primary" :class="store.loading ? 'animate-spin' : ''" />
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="flex flex-wrap items-center gap-2.5 p-3 bg-card-background border border-primary-border rounded-xl text-xs">
      <div class="relative w-full sm:w-48">
        <input
          v-model="filters.trading_account_id"
          type="number"
          placeholder="Filter by Account ID..."
          class="w-full px-3 py-1.5 bg-background border border-primary-border rounded-lg text-primary-text placeholder:text-secondary-text/60 outline-none focus:border-primary transition font-mono"
          @keyup.enter="fetchData"
        />
      </div>

      <button
        type="button"
        class="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold transition cursor-pointer"
        @click="fetchData"
      >
        <Search class="w-3.5 h-3.5" />
        <span>Filter</span>
      </button>

      <button
        v-if="filters.trading_account_id"
        type="button"
        class="px-2.5 py-1.5 rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition cursor-pointer"
        @click="resetFilters"
      >
        Clear
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="store.loading && jobs.length === 0" class="space-y-2">
      <div v-for="n in 5" :key="n" class="h-14 bg-card-background border border-primary-border rounded-xl animate-pulse" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="jobs.length === 0"
      class="flex flex-col items-center justify-center p-12 bg-card-background border border-dashed border-primary-border rounded-2xl text-center gap-3"
    >
      <div class="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
        <History class="w-6 h-6" />
      </div>
      <p class="text-sm font-bold text-primary-text">No backfill jobs found</p>
      <p class="text-xs text-secondary-text max-w-sm">
        {{ filters.trading_account_id ? 'No jobs match this trading account filter.' : 'Queue a historical MT5 trade backfill job for newly enrolled accounts.' }}
      </p>
      <button
        v-if="hasPermission('loyalty.backfill')"
        type="button"
        class="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition cursor-pointer shadow-xs"
        @click="isStartModalOpen = true"
      >
        <Play class="w-3.5 h-3.5" />
        <span>Start First Backfill Job</span>
      </button>
    </div>

    <!-- Backfill Jobs Table -->
    <div v-else class="bg-card-background border border-primary-border rounded-2xl overflow-hidden shadow-2xs">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-background/80 text-secondary-text font-semibold border-b border-primary-border">
            <tr>
              <th class="py-3 px-4">Job ID</th>
              <th class="py-3 px-4">Trading Account</th>
              <th class="py-3 px-4">Date Range (From – To)</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4">Deals Seen</th>
              <th class="py-3 px-4">Awarded</th>
              <th class="py-3 px-4">Skipped Exist.</th>
              <th class="py-3 px-4">Ineligible</th>
              <th class="py-3 px-4">Errors</th>
              <th class="py-3 px-4">Started At</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-primary-border font-mono">
            <tr
              v-for="job in jobs"
              :key="job.id"
              class="hover:bg-background/40 transition-colors"
            >
              <td class="py-3 px-4 text-secondary-text font-bold">#{{ job.id }}</td>
              <td class="py-3 px-4 text-primary font-bold">#{{ job.trading_account_id }}</td>
              <td class="py-3 px-4 font-sans text-secondary-text text-[11px]">
                {{ formatDate(job.from_at) }}<br />
                <span class="text-primary-text font-medium">to</span> {{ formatDate(job.to_at) }}
              </td>
              <td class="py-3 px-4">
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  :class="getStatusBadgeClass(job.status)"
                >
                  {{ job.status }}
                </span>
              </td>
              <td class="py-3 px-4 text-primary-text">{{ job.deals_seen ?? 0 }}</td>
              <td class="py-3 px-4 text-primary-green font-bold">{{ job.awarded ?? 0 }}</td>
              <td class="py-3 px-4 text-secondary-text">{{ job.skipped_existing ?? 0 }}</td>
              <td class="py-3 px-4 text-secondary-text">{{ job.skipped_ineligible ?? 0 }}</td>
              <td class="py-3 px-4" :class="job.errors > 0 ? 'text-rose-400 font-bold' : 'text-secondary-text'">
                {{ job.errors ?? 0 }}
              </td>
              <td class="py-3 px-4 font-sans text-secondary-text">{{ formatDate(job.started_at) }}</td>
              <td class="py-3 px-4 text-right font-sans">
                <button
                  type="button"
                  class="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background border border-primary-border hover:border-primary/40 text-primary-text hover:text-primary transition cursor-pointer text-xs ml-auto shadow-2xs"
                  title="View Status & Metrics"
                  @click="handleViewDetail(job)"
                >
                  <Eye class="w-3 h-3" />
                  <span>Inspect</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Start Backfill Modal -->
    <StartBackfillModal
      :open="isStartModalOpen"
      @close="isStartModalOpen = false"
      @queued="fetchData"
    />

    <!-- Backfill Detail Modal -->
    <BackfillDetailModal
      :open="isDetailModalOpen"
      :job="selectedJob"
      @close="isDetailModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { Play, RefreshCw, History, Search, Eye } from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import { formatDate } from "@/utils/timeFormatter";
import StartBackfillModal from "../components/StartBackfillModal.vue";
import BackfillDetailModal from "../components/BackfillDetailModal.vue";

const store = useLoyaltyStore();
const { hasPermission } = usePermissionCheck();

const isStartModalOpen = ref(false);
const isDetailModalOpen = ref(false);
const selectedJob = ref(null);

const filters = reactive({
  trading_account_id: "",
});

const jobs = computed(() => store.backfillJobs || []);

const fetchData = () => {
  const params = {};
  if (filters.trading_account_id) {
    params.trading_account_id = Number(filters.trading_account_id);
  }
  store.fetchBackfillJobs(params);
};

const resetFilters = () => {
  filters.trading_account_id = "";
  fetchData();
};

const handleViewDetail = (job) => {
  selectedJob.value = job;
  store.activeBackfillJob = job;
  isDetailModalOpen.value = true;
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
      return "bg-secondary-text/10 text-secondary-text border border-primary-border";
    default:
      return "bg-secondary-text/10 text-secondary-text border border-primary-border";
  }
};

onMounted(() => {
  fetchData();
});
</script>
