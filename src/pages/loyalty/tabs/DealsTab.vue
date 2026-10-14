<template>
  <div class="space-y-6">
    <!-- Header & Action -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-base font-semibold text-primary-text">
          Deals & Execution Audit
        </h2>
        <p class="text-xs text-secondary-text">
          Closed trades evaluated for loyalty points, holding durations, and
          award eligibility status.
        </p>
      </div>

      <div class="flex items-center gap-2">
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
      <div class="relative w-full sm:w-44">
        <Search
          class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text"
        />
        <input
          v-model="filters.account_number"
          type="text"
          placeholder="Account Number..."
          class="w-full pl-8 pr-3 py-1.5 bg-background border border-primary-border rounded-lg text-primary-text placeholder:text-secondary-text/60 outline-none focus:border-primary transition font-mono text-xs"
          @keyup.enter="fetchData"
        />
      </div>

      <div class="relative w-full sm:w-40">
        <Search
          class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text"
        />
        <input
          v-model="filters.enrollment_id"
          type="number"
          placeholder="Enrollment ID..."
          class="w-full pl-8 pr-3 py-1.5 bg-background border border-primary-border rounded-lg text-primary-text placeholder:text-secondary-text/60 outline-none focus:border-primary transition font-mono text-xs"
          @keyup.enter="fetchData"
        />
      </div>

      <div class="w-full sm:w-60">
        <BaseDatePicker
          v-model="dateRange"
          :range="true"
          valueFormat="YYYY-MM-DD"
          placeholder="Filter by date range..."
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
        v-if="
          filters.account_number ||
          filters.enrollment_id ||
          filters.from_at ||
          filters.to_at
        "
        type="button"
        class="px-2.5 py-1.5 rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition cursor-pointer text-xs"
        @click="resetFilters"
      >
        Clear
      </button>
    </div>

    <!-- Deals DataTable -->
    <DataTable
      :columns="columns"
      :data="deals"
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
            <Activity class="w-6 h-6 text-primary" />
          </div>
          <div class="space-y-1">
            <h3 class="text-sm font-semibold text-primary-text">
              No Loyalty Deals Found
            </h3>
            <p class="text-xs text-secondary-text max-w-sm mx-auto">
              {{
                filters.account_number ||
                filters.enrollment_id ||
                filters.from_at ||
                filters.to_at
                  ? "No deals match your filter parameters."
                  : "Closed trades by enrolled accounts will be processed and logged here in real-time."
              }}
            </p>
          </div>
        </div>
      </template>

      <template #cell-deal_id="{ row }">
        <span class="font-mono font-medium text-primary"
          >#{{ row.mt5_deal_id || row.id }}</span
        >
      </template>

      <template #cell-account_number="{ row }">
        <span class="font-mono text-primary-text">{{
          row.account_number || row.trading_account_id
        }}</span>
      </template>

      <template #cell-position_id="{ row }">
        <span class="font-mono text-secondary-text"
          >#{{ row.position_id }}</span
        >
      </template>

      <template #cell-symbol="{ row }">
        <span class="font-mono font-bold text-primary-text">{{
          row.symbol
        }}</span>
      </template>

      <template #cell-side="{ row }">
        <span
          class="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase"
          :class="
            row.side === 'BUY'
              ? 'bg-primary-green/10 text-primary-green border border-primary-green/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          "
        >
          {{ row.side }}
        </span>
      </template>

      <template #cell-lots="{ row }">
        <span class="font-mono text-primary-text">{{ row.lots }}</span>
      </template>

      <template #cell-duration_seconds="{ row }">
        <span class="font-mono text-secondary-text"
          >{{ row.duration_seconds }}s</span
        >
      </template>

      <template #cell-points_awarded="{ row }">
        <span class="font-mono font-bold text-primary-green"
          >+{{ row.points_awarded ?? "0.00" }}</span
        >
      </template>

      <template #cell-eligibility_status="{ row }">
        <span
          class="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase border"
          :class="
            row.eligibility_status === 'awarded'
              ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
          "
        >
          {{ row.eligibility_status }}
        </span>
      </template>

      <template #cell-close_time="{ row }">
        <span class="text-secondary-text font-mono text-[11px] whitespace-nowrap">
          {{ formatDate(row.close_time) }}
        </span>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { RefreshCw, Search, Activity } from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";
import { formatDate } from "@/utils/timeFormatter";
import BaseDatePicker from "@/components/common/BaseDatePicker.vue";
import DataTable from "@/components/common/DataTable/DataTable.vue";

const store = useLoyaltyStore();

const columns = [
  { key: "deal_id", label: "Deal ID", sortable: true },
  { key: "account_number", label: "Account Number", sortable: true },
  { key: "position_id", label: "Position", sortable: true },
  { key: "symbol", label: "Symbol", sortable: true },
  { key: "side", label: "Side", sortable: true },
  { key: "lots", label: "Lots", sortable: true },
  { key: "duration_seconds", label: "Duration", sortable: true },
  { key: "points_awarded", label: "Points", sortable: true },
  { key: "eligibility_status", label: "Status", sortable: true },
  { key: "close_time", label: "Closed Time", sortable: true },
];

const filters = reactive({
  account_number: "",
  enrollment_id: "",
  from_at: "",
  to_at: "",
});

const dateRange = computed({
  get() {
    if (filters.from_at || filters.to_at) {
      return {
        start: filters.from_at || null,
        end: filters.to_at || null,
      };
    }
    return null;
  },
  set(val) {
    if (!val) {
      filters.from_at = "";
      filters.to_at = "";
    } else if (Array.isArray(val)) {
      filters.from_at = val[0] || "";
      filters.to_at = val[1] || "";
    } else if (typeof val === "object") {
      filters.from_at = val.start || val.from || "";
      filters.to_at = val.end || val.to || "";
    }
    fetchData();
  },
});

const deals = computed(() => store.deals || []);

const fetchData = (force = false) => {
  const params = {};
  if (filters.account_number)
    params.account_number = filters.account_number.trim();
  if (filters.enrollment_id)
    params.enrollment_id = Number(filters.enrollment_id);
  if (filters.from_at) params.from_at = filters.from_at.trim();
  if (filters.to_at) params.to_at = filters.to_at.trim();
  if (store.program?.id) params.program_id = store.program.id;
  store.fetchDeals(params, force);
};

const handleRefresh = () => {
  fetchData(true);
};

const resetFilters = () => {
  filters.account_number = "";
  filters.enrollment_id = "";
  filters.from_at = "";
  filters.to_at = "";
  fetchData(true);
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
