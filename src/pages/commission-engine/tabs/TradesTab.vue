<script setup>
import { ref, computed, onMounted } from "vue";
import {
  Search01Icon,
  RefreshCwIcon,
  FilterIcon,
  Cancel01Icon,
  DatabaseIcon,
  Tick02Icon,
  Alert02Icon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons";
import { useCommissionEngineStore } from "@/stores/commissionEngine/commissionEngine";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import BaseSelect from "@/components/common/BaseSelect.vue";
import BaseDatePicker from "@/components/common/BaseDatePicker.vue";
import RebuildTradesModal from "../components/RebuildTradesModal.vue";

const store = useCommissionEngineStore();
const { hasPermission } = usePermissionCheck();

const canSync = computed(() => hasPermission("ib_commission.sync"));

// Filters
const statusFilter = ref(""); // '' | 'open' | 'closed'
const loginFilter = ref("");
const ibIdFilter = ref("");
const symbolFilter = ref("");
const dateFrom = ref("");
const dateTo = ref("");
const dateField = ref("close_time");

// Date range computed wrapper for BaseDatePicker
const dateRangeValue = computed({
  get() {
    if (dateFrom.value || dateTo.value) {
      return {
        start: dateFrom.value || null,
        end: dateTo.value || null,
      };
    }
    return null;
  },
  set(val) {
    if (!val) {
      dateFrom.value = "";
      dateTo.value = "";
    } else if (Array.isArray(val)) {
      dateFrom.value = val[0] || "";
      dateTo.value = val[1] || "";
    } else if (typeof val === "object") {
      dateFrom.value = val.start || val.from || "";
      dateTo.value = val.end || val.to || "";
    }
    handleFilterChange();
  },
});

const isRebuildModalOpen = ref(false);
const searchTimer = ref(null);

const dateFieldOptions = [
  { label: "Close Time", value: "close_time" },
  { label: "Open Time", value: "open_time" },
  { label: "Either (Open or Close)", value: "either" },
];

onMounted(() => {
  loadTrades(1);
});

const loadTrades = (page = 1, force = false) => {
  const params = {
    status: statusFilter.value || undefined,
    login: loginFilter.value.trim() ? Number(loginFilter.value.trim()) : undefined,
    ib_id: ibIdFilter.value.trim() ? Number(ibIdFilter.value.trim()) : undefined,
    symbol: symbolFilter.value.trim() ? symbolFilter.value.trim().toUpperCase() : undefined,
    date_from: dateFrom.value || undefined,
    date_to: dateTo.value || undefined,
    date_field: dateField.value || "close_time",
    page,
    per_page: store.tradesPagination.per_page || 50,
  };

  store.fetchTrades(params, force);
};

const handleFilterChange = () => {
  if (searchTimer.value) clearTimeout(searchTimer.value);
  searchTimer.value = setTimeout(() => {
    loadTrades(1, true);
  }, 350);
};

const handleResetFilters = () => {
  statusFilter.value = "";
  loginFilter.value = "";
  ibIdFilter.value = "";
  symbolFilter.value = "";
  dateFrom.value = "";
  dateTo.value = "";
  dateField.value = "close_time";
  loadTrades(1, true);
};

const handlePageChange = (newPage) => {
  loadTrades(newPage, true);
};

const handlePerPageChange = (newPerPage) => {
  const perPageVal = typeof newPerPage === "object" && newPerPage !== null ? (newPerPage.value || 50) : newPerPage;
  store.tradesPagination.per_page = Number(perPageVal) || 50;
  loadTrades(1, true);
};

const columns = [
  { key: "id", label: "ID", width: "90px", sortable: true },
  { key: "status", label: "Status", align: "center", width: "100px" },
  { key: "login", label: "Login & Position", width: "150px" },
  { key: "symbol", label: "Symbol", width: "130px", sortable: true },
  { key: "mt5_group", label: "MT5 Group", width: "200px" },
  { key: "mappings", label: "Mappings (BG / SG / Link)", width: "190px" },
  { key: "volumes", label: "Closed Volume & Lots", align: "right", width: "160px" },
  { key: "times", label: "Timestamps", width: "170px" },
  { key: "calculated", label: "Calculated?", align: "center", width: "120px" },
];

const formatDate = (val) => {
  if (!val) return "-";
  const d = new Date(val);
  return isNaN(d.getTime()) ? val : d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};
</script>

<template>
  <div class="space-y-4">
    <!-- Trades DataTable -->
    <DataTable
      :columns="columns"
      :data="store.tradesList"
      :loading="store.loading"
      :pagination="store.tradesPagination"
      row-key="id"
      table-key="commission-trades-table"
      :per-page-options="[20, 50, 100, 200]"
      empty-title="No trades found"
      empty-text="No MT5 trading records match the current filter criteria."
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
    >
      <!-- Toolbar Slot -->
      <template #toolbar>
        <div class="space-y-3">
          <!-- Top Row: Filters & Ops -->
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <!-- Left: Status Pills & Main Search -->
            <div class="flex flex-wrap items-center gap-2.5 flex-1">
              <!-- Status Filter Pills -->
              <div class="inline-flex p-1 rounded-xl bg-background border border-primary-border shrink-0">
                <button
                  type="button"
                  class="px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  :class="[
                    statusFilter === ''
                      ? 'bg-card-background text-primary-text font-bold shadow-2xs'
                      : 'text-secondary-text hover:text-primary-text'
                  ]"
                  @click="
                    statusFilter = '';
                    handleFilterChange();
                  "
                >
                  All Trades
                </button>
                <button
                  type="button"
                  class="px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  :class="[
                    statusFilter === 'closed'
                      ? 'bg-primary text-white font-bold'
                      : 'text-secondary-text hover:text-primary-text'
                  ]"
                  @click="
                    statusFilter = 'closed';
                    handleFilterChange();
                  "
                >
                  Closed Only
                </button>
                <button
                  type="button"
                  class="px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  :class="[
                    statusFilter === 'open'
                      ? 'bg-primary text-white font-bold'
                      : 'text-secondary-text hover:text-primary-text'
                  ]"
                  @click="
                    statusFilter = 'open';
                    handleFilterChange();
                  "
                >
                  Open Only
                </button>
              </div>

              <!-- Symbol Search -->
              <div class="relative w-36 sm:w-44">
                <HugeIcon
                  :icon="Search01Icon"
                  :size="13"
                  class="absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none"
                />
                <input
                  v-model="symbolFilter"
                  type="text"
                  placeholder="Symbol (e.g. XAU)"
                  class="input-field w-full pl-7 pr-3 py-1.5 text-xs font-mono uppercase"
                  @input="handleFilterChange"
                />
              </div>

              <!-- Login Filter -->
              <div class="w-28 sm:w-32">
                <input
                  v-model="loginFilter"
                  type="number"
                  placeholder="MT5 Login"
                  class="input-field w-full px-2.5 py-1.5 text-xs font-mono"
                  @input="handleFilterChange"
                />
              </div>

              <!-- IB ID Filter -->
              <div class="w-24 sm:w-28">
                <input
                  v-model="ibIdFilter"
                  type="number"
                  placeholder="IB ID"
                  class="input-field w-full px-2.5 py-1.5 text-xs font-mono"
                  @input="handleFilterChange"
                />
              </div>
            </div>

            <!-- Right: Actions -->
            <div class="flex items-center gap-2 justify-end shrink-0">
              <!-- Rebuild Trades Ops Button -->
              <button
                v-if="canSync"
                type="button"
                :disabled="store.actionLoading"
                class="flex items-center gap-1.5 px-3 py-1.5 bg-card-background border border-primary-border hover:bg-background text-primary-text text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                title="Reconstruct trade positions"
                @click="isRebuildModalOpen = true"
              >
                <HugeIcon :icon="DatabaseIcon" :size="14" />
                <span>Rebuild Trades</span>
              </button>

              <!-- Refresh Button -->
              <button
                type="button"
                :disabled="store.loading"
                class="p-2 border border-primary-border rounded-xl text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
                title="Refresh Trades"
                @click="loadTrades(store.tradesPagination.page, true)"
              >
                <HugeIcon
                  :icon="RefreshCwIcon"
                  :size="14"
                  :class="{ 'animate-spin': store.loading }"
                />
              </button>
            </div>
          </div>

          <!-- Bottom Row: Date Range & Date Field Filter -->
          <div class="flex flex-wrap items-center gap-2.5 pt-2 border-t border-primary-border/50 text-xs">
            <span class="text-secondary-text font-medium flex items-center gap-1">
              <HugeIcon :icon="Calendar01Icon" :size="13" />
              <span>Date Filter:</span>
            </span>

            <div class="w-44">
              <BaseSelect
                v-model="dateField"
                :options="dateFieldOptions"
                variant="surface"
                @update:model-value="handleFilterChange"
              />
            </div>

            <div class="w-60">
              <BaseDatePicker
                v-model="dateRangeValue"
                :range="true"
                placeholder="Select date range..."
                variant="surface"
              />
            </div>

            <button
              v-if="statusFilter || loginFilter || ibIdFilter || symbolFilter || dateFrom || dateTo"
              type="button"
              class="px-2.5 py-1 text-[11px] text-secondary-text hover:text-primary-red transition-colors cursor-pointer underline"
              @click="handleResetFilters"
            >
              Clear filters
            </button>
          </div>
        </div>
      </template>

      <!-- Cell: ID -->
      <template #cell-id="{ row }">
        <span class="font-mono text-xs font-semibold text-primary-text">
          #{{ row.id }}
        </span>
      </template>

      <!-- Cell: Status -->
      <template #cell-status="{ row }">
        <span
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
          :class="
            row.trade_status === 'closed'
              ? 'bg-primary-green/10 text-primary-green border border-primary-green/20'
              : 'bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20'
          "
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="row.trade_status === 'closed' ? 'bg-primary-green' : 'bg-primary-yellow'"
          />
          {{ row.trade_status === 'closed' ? "Closed" : "Open" }}
        </span>
      </template>

      <!-- Cell: Login & Position -->
      <template #cell-login="{ row }">
        <div class="text-xs font-mono">
          <p class="font-bold text-primary-text">Login: {{ row.login }}</p>
          <p class="text-[10px] text-secondary-text">Pos: #{{ row.position_id }}</p>
        </div>
      </template>

      <!-- Cell: Symbol -->
      <template #cell-symbol="{ row }">
        <div class="text-xs">
          <span
            class="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary font-mono font-bold"
          >
            {{ row.symbol }}
          </span>
          <p class="text-[10px] text-secondary-text font-mono mt-0.5">
            CCY: {{ row.account_currency || "USD" }}
          </p>
        </div>
      </template>

      <!-- Cell: MT5 Group -->
      <template #cell-mt5_group="{ row }">
        <span class="text-xs font-mono text-secondary-text truncate block max-w-[190px]" :title="row.mt5_group">
          {{ row.mt5_group || "-" }}
        </span>
      </template>

      <!-- Cell: Mappings (BG, SG, Link) -->
      <template #cell-mappings="{ row }">
        <div class="text-[11px] font-mono space-y-0.5">
          <p>
            <span class="text-secondary-text">BG:</span>
            <span :class="row.broker_group_config_id ? 'text-primary-text font-semibold' : 'text-primary-red'">
              {{ row.broker_group_config_id ? `#${row.broker_group_config_id}` : 'None' }}
            </span>
            &middot;
            <span class="text-secondary-text">SG:</span>
            <span :class="row.symbol_group_id ? 'text-primary-text font-semibold' : 'text-primary-red'">
              {{ row.symbol_group_id ? `#${row.symbol_group_id}` : 'None' }}
            </span>
          </p>
          <p>
            <span class="text-secondary-text">IB:</span>
            <strong class="text-primary-text font-semibold">#{{ row.ib_id ?? '-' }}</strong>
            &middot;
            <span class="text-secondary-text">Link:</span>
            <span>{{ row.referral_link_id ? `#${row.referral_link_id}` : '-' }}</span>
          </p>
        </div>
      </template>

      <!-- Cell: Volumes & Lots -->
      <template #cell-volumes="{ row }">
        <div class="text-xs font-mono text-right">
          <p class="font-bold text-primary-text">
            {{ row.closed_volume_lots !== undefined ? `${row.closed_volume_lots} lots` : `${row.volume_entry_lots ?? '-'} lots` }}
          </p>
          <p class="text-[10px] text-secondary-text">
            Spread: {{ row.closed_spread ?? row.open_spread ?? '-' }} &middot; Vol: {{ row.closed_volume ?? row.open_volume ?? '-' }}
          </p>
        </div>
      </template>

      <!-- Cell: Timestamps -->
      <template #cell-times="{ row }">
        <div class="text-[11px] text-secondary-text space-y-0.5">
          <p v-if="row.close_time">
            Close: <span class="text-primary-text font-mono">{{ formatDate(row.close_time) }}</span>
          </p>
          <p v-if="row.open_time">
            Open: <span class="font-mono">{{ formatDate(row.open_time) }}</span>
          </p>
        </div>
      </template>

      <!-- Cell: Calculated? -->
      <template #cell-calculated="{ row }">
        <span
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
          :class="
            row.commission_calculated
              ? 'bg-primary-green/10 text-primary-green border border-primary-green/20'
              : 'bg-background text-secondary-text border border-primary-border'
          "
        >
          <HugeIcon
            :icon="row.commission_calculated ? Tick02Icon : Alert02Icon"
            :size="11"
          />
          <span>{{ row.commission_calculated ? "Calculated" : "Uncalculated" }}</span>
        </span>
      </template>
    </DataTable>

    <!-- Rebuild Trades Ops Modal -->
    <RebuildTradesModal
      v-model="isRebuildModalOpen"
      @rebuilt="loadTrades(store.tradesPagination.page, true)"
    />
  </div>
</template>
