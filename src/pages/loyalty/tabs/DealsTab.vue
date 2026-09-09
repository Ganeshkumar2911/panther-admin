<template>
  <div class="space-y-6">
    <!-- Header & Action -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-lg font-bold text-primary-text">Deals & Execution Audit</h2>
        <p class="text-xs text-secondary-text">
          Closed trades evaluated for loyalty points, durations, and award eligibility status.
        </p>
      </div>

      <div class="flex items-center gap-2.5">
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
      <div class="relative w-full sm:w-44">
        <input
          v-model="filters.trading_account_id"
          type="number"
          placeholder="Filter by Account ID..."
          class="w-full px-3 py-1.5 bg-background border border-primary-border rounded-lg text-primary-text placeholder:text-secondary-text/60 outline-none focus:border-primary transition font-mono"
          @keyup.enter="fetchData"
        />
      </div>

      <div class="relative w-full sm:w-44">
        <input
          v-model="filters.enrollment_id"
          type="number"
          placeholder="Filter by Enrollment ID..."
          class="w-full px-3 py-1.5 bg-background border border-primary-border rounded-lg text-primary-text placeholder:text-secondary-text/60 outline-none focus:border-primary transition font-mono"
          @keyup.enter="fetchData"
        />
      </div>

      <div class="relative w-full sm:w-44">
        <input
          v-model="filters.from_at"
          type="text"
          placeholder="From (ISO datetime)..."
          class="w-full px-3 py-1.5 bg-background border border-primary-border rounded-lg text-primary-text placeholder:text-secondary-text/60 outline-none focus:border-primary transition font-mono"
          @keyup.enter="fetchData"
        />
      </div>

      <div class="relative w-full sm:w-44">
        <input
          v-model="filters.to_at"
          type="text"
          placeholder="To (ISO datetime)..."
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
        v-if="filters.trading_account_id || filters.enrollment_id || filters.from_at || filters.to_at"
        type="button"
        class="px-2.5 py-1.5 rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition cursor-pointer"
        @click="resetFilters"
      >
        Clear
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="store.loading && deals.length === 0" class="space-y-2">
      <div v-for="n in 5" :key="n" class="h-14 bg-card-background border border-primary-border rounded-xl animate-pulse" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="deals.length === 0"
      class="flex flex-col items-center justify-center p-12 bg-card-background border border-dashed border-primary-border rounded-2xl text-center gap-3"
    >
      <div class="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
        <Activity class="w-6 h-6" />
      </div>
      <p class="text-sm font-bold text-primary-text">No loyalty deals found</p>
      <p class="text-xs text-secondary-text max-w-sm">
        {{ (filters.trading_account_id || filters.enrollment_id || filters.from_at || filters.to_at) ? 'No deals match your filter range.' : 'Closed trades by enrolled members will be audited and displayed here.' }}
      </p>
    </div>

    <!-- Deals Table -->
    <div v-else class="bg-card-background border border-primary-border rounded-2xl overflow-hidden shadow-2xs">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-background/80 text-secondary-text font-semibold border-b border-primary-border">
            <tr>
              <th class="py-3 px-4">Deal ID</th>
              <th class="py-3 px-4">MT5 Deal ID</th>
              <th class="py-3 px-4">Trading Account</th>
              <th class="py-3 px-4">Symbol</th>
              <th class="py-3 px-4">Side</th>
              <th class="py-3 px-4">Lots</th>
              <th class="py-3 px-4">Duration</th>
              <th class="py-3 px-4">Points</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4">Close Time</th>
              <th class="py-3 px-4">Processed At</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-primary-border font-mono">
            <tr
              v-for="deal in deals"
              :key="deal.id"
              class="hover:bg-background/40 transition-colors"
            >
              <td class="py-3 px-4 text-secondary-text">#{{ deal.id }}</td>
              <td class="py-3 px-4 font-bold text-primary-text">#{{ deal.mt5_deal_id }}</td>
              <td class="py-3 px-4 font-bold text-primary">#{{ deal.trading_account_id }}</td>
              <td class="py-3 px-4 font-sans font-bold text-primary-text">{{ deal.symbol }}</td>
              <td class="py-3 px-4">
                <span
                  class="font-bold font-sans"
                  :class="deal.side === 'BUY' ? 'text-primary-green' : 'text-primary-red'"
                >
                  {{ deal.side }}
                </span>
              </td>
              <td class="py-3 px-4 text-primary-text">{{ deal.lots }}</td>
              <td class="py-3 px-4 text-secondary-text">{{ deal.duration_seconds }}s</td>
              <td class="py-3 px-4 font-bold text-primary">{{ deal.points_awarded }}</td>
              <td class="py-3 px-4 font-sans">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1"
                  :class="deal.eligibility_status === 'awarded' ? 'bg-primary-green/10 text-primary-green border border-primary-green/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'"
                >
                  {{ deal.eligibility_status }}
                </span>
                <span v-if="deal.skip_reason" class="block text-[9px] text-secondary-text mt-0.5" :title="deal.skip_reason">
                  ({{ deal.skip_reason }})
                </span>
              </td>
              <td class="py-3 px-4 font-sans text-secondary-text">{{ formatDate(deal.close_time) }}</td>
              <td class="py-3 px-4 font-sans text-secondary-text">{{ formatDate(deal.processed_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted } from "vue";
import { RefreshCw, Activity, Search } from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";
import { formatDate } from "@/utils/timeFormatter";

const store = useLoyaltyStore();

const filters = reactive({
  trading_account_id: "",
  enrollment_id: "",
  from_at: "",
  to_at: "",
});

const deals = computed(() => store.deals || []);

const fetchData = () => {
  const params = {};
  if (filters.trading_account_id) params.trading_account_id = Number(filters.trading_account_id);
  if (filters.enrollment_id) params.enrollment_id = Number(filters.enrollment_id);
  if (filters.from_at) params.from_at = filters.from_at.trim();
  if (filters.to_at) params.to_at = filters.to_at.trim();
  store.fetchDeals(params);
};

const resetFilters = () => {
  filters.trading_account_id = "";
  filters.enrollment_id = "";
  filters.from_at = "";
  filters.to_at = "";
  fetchData();
};

onMounted(() => {
  fetchData();
});
</script>
