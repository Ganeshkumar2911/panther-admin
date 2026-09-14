<script setup>
import { computed, onMounted } from "vue";
import {
  DatabaseIcon,
  RefreshCwIcon,
  Loading03Icon,
  CheckmarkCircle02Icon,
  Alert02Icon,
  InformationCircleIcon,
  Time02Icon,
  Coins01Icon,
  Layers01Icon,
} from "@hugeicons/core-free-icons";
import { useCommissionEngineStore } from "@/stores/commissionEngine/commissionEngine";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

const store = useCommissionEngineStore();
const { hasPermission } = usePermissionCheck();

const canSync = computed(() => hasPermission("ib_commission.sync"));

onMounted(() => {
  if (!store.isFetched.syncStatus) {
    store.fetchSyncStatus();
  }
});

const isConfigured = computed(() => store.syncStatus?.configured !== false);
const cursor = computed(() => store.syncStatus?.cursor || {});
const totals = computed(() => store.syncStatus?.totals || {});

const handleSyncDeals = () => {
  store.triggerDealsSync();
};

const handleSyncSymbols = () => {
  store.triggerSymbolsSync();
};
</script>

<template>
  <div class="space-y-5">
    <!-- Top Action & Overview Card -->
    <div
      class="p-5 rounded-2xl bg-card-background border border-primary-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
    >
      <div class="flex items-center gap-3.5">
        <div
          class="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0"
        >
          <HugeIcon :icon="DatabaseIcon" :size="22" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="title-text text-base text-primary-text font-bold">
              ETL Sync Status & Health
            </h2>
            <span
              v-if="store.syncStatus"
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
              :class="
                isConfigured
                  ? 'bg-primary-green/10 text-primary-green border border-primary-green/20'
                  : 'bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20'
              "
            >
              <span
                class="w-1.5 h-1.5 rounded-full"
                :class="isConfigured ? 'bg-primary-green' : 'bg-primary-yellow'"
              />
              {{ isConfigured ? "Report DB Connected" : "Report DB Not Configured" }}
            </span>
          </div>
          <p class="text-xs text-secondary-text">
            Continuous background synchronization of MT5 deals, symbol catalogs, and group watermarks
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2.5 w-full md:w-auto justify-end">
        <button
          type="button"
          :disabled="store.syncLoading"
          class="p-2 border border-primary-border rounded-xl text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
          title="Refresh Sync Status"
          @click="store.fetchSyncStatus(true)"
        >
          <HugeIcon
            :icon="RefreshCwIcon"
            :size="15"
            :class="{ 'animate-spin': store.syncLoading }"
          />
        </button>

        <button
          v-if="canSync"
          type="button"
          :disabled="store.actionLoading || !isConfigured"
          class="flex items-center gap-1.5 px-3.5 py-2 bg-card-background border border-primary-border hover:bg-background text-primary-text text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          @click="handleSyncSymbols"
        >
          <HugeIcon
            v-if="store.actionLoading"
            :icon="Loading03Icon"
            :size="14"
            class="animate-spin"
          />
          <HugeIcon v-else :icon="RefreshCwIcon" :size="14" />
          <span>Sync Symbols Now</span>
        </button>

        <button
          v-if="canSync"
          type="button"
          :disabled="store.actionLoading || !isConfigured"
          class="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          @click="handleSyncDeals"
        >
          <HugeIcon
            v-if="store.actionLoading"
            :icon="Loading03Icon"
            :size="14"
            class="animate-spin"
          />
          <HugeIcon v-else :icon="DatabaseIcon" :size="14" />
          <span>Sync Deals Now</span>
        </button>
      </div>
    </div>

    <!-- ─── SKELETON LOADER STATE ─── -->
    <div v-if="store.syncLoading && !store.syncStatus" class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="n in 4" :key="n" class="h-28 bg-card-background border border-primary-border rounded-2xl animate-pulse" />
      </div>
      <div class="h-44 bg-card-background border border-primary-border rounded-2xl animate-pulse" />
    </div>

    <!-- ─── ACTUAL CONTENT STATE ─── -->
    <template v-else>
      <!-- DB Warning Notice if Not Configured -->
      <div
        v-if="!isConfigured"
        class="p-4 rounded-xl bg-primary-yellow/10 border border-primary-yellow/20 flex items-start gap-3"
      >
        <HugeIcon :icon="Alert02Icon" :size="20" class="text-primary-yellow shrink-0 mt-0.5" />
        <div class="space-y-1 text-xs">
          <p class="font-bold text-primary-text">
            Report Database Environment Variables Not Configured
          </p>
          <p class="text-secondary-text leading-relaxed">
            The MT5 report MySQL credentials (<code class="font-mono text-primary-text">MT5_REPORT_MYSQL_*</code>) are currently unconfigured on the server. Rates setup and symbol groups remain fully functional, but automated deals ETL sync is paused.
          </p>
        </div>
      </div>

      <!-- Stats Metric Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Synced Deals Approx -->
        <div
          class="p-4 rounded-2xl bg-card-background border border-primary-border space-y-2"
        >
          <div class="flex items-center justify-between text-secondary-text">
            <span class="text-xs font-semibold">Total Synced Deals</span>
            <HugeIcon :icon="Coins01Icon" :size="16" class="text-primary" />
          </div>
          <p class="text-2xl font-bold font-mono text-primary-text">
            {{ totals.ibc_deals_approx !== undefined ? Number(totals.ibc_deals_approx).toLocaleString() : '-' }}
          </p>
          <p class="text-[11px] text-secondary-text">
            Local enriched deal records in CRM
          </p>
        </div>

        <!-- Last Run Upserted -->
        <div
          class="p-4 rounded-2xl bg-card-background border border-primary-border space-y-2"
        >
          <div class="flex items-center justify-between text-secondary-text">
            <span class="text-xs font-semibold">Upserted Last Run</span>
            <HugeIcon :icon="CheckmarkCircle02Icon" :size="16" class="text-primary-green" />
          </div>
          <p class="text-2xl font-bold font-mono text-primary-text">
            {{ cursor.rows_upserted_last_run !== undefined ? cursor.rows_upserted_last_run : '-' }}
          </p>
          <p class="text-[11px] text-secondary-text">
            Batch size: {{ store.syncStatus?.batch_size || 300 }} deals
          </p>
        </div>

        <!-- Unresolved MT5 Groups -->
        <div
          class="p-4 rounded-2xl bg-card-background border border-primary-border space-y-2"
        >
          <div class="flex items-center justify-between text-secondary-text">
            <span class="text-xs font-semibold">Unresolved MT5 Groups</span>
            <HugeIcon :icon="Layers01Icon" :size="16" class="text-primary-yellow" />
          </div>
          <p class="text-2xl font-bold font-mono text-primary-text">
            {{ totals.unresolved_mt5_group !== undefined ? totals.unresolved_mt5_group : '-' }}
          </p>
          <p class="text-[11px] text-secondary-text">
            Deals without resolved MT5 broker group
          </p>
        </div>

        <!-- Last Run Status -->
        <div
          class="p-4 rounded-2xl bg-card-background border border-primary-border space-y-2"
        >
          <div class="flex items-center justify-between text-secondary-text">
            <span class="text-xs font-semibold">Last Job Status</span>
            <HugeIcon :icon="Time02Icon" :size="16" class="text-primary" />
          </div>
          <p class="text-xl font-bold capitalize text-primary-text flex items-center gap-1.5">
            <span
              class="w-2 h-2 rounded-full"
              :class="cursor.last_status === 'ok' ? 'bg-primary-green' : 'bg-primary-yellow'"
            />
            {{ cursor.last_status || "Idle" }}
          </p>
          <p class="text-[11px] text-secondary-text font-mono truncate">
            {{ cursor.last_run_at ? new Date(cursor.last_run_at).toLocaleString() : 'No run recorded' }}
          </p>
        </div>
      </div>

      <!-- Detailed Configuration Specs Card -->
      <div
        class="p-5 rounded-2xl bg-card-background border border-primary-border space-y-4"
      >
        <h3 class="text-sm font-bold text-primary-text flex items-center gap-2">
          <HugeIcon :icon="InformationCircleIcon" :size="16" class="text-primary" />
          <span>ETL Engine Parameters</span>
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div class="p-3 rounded-xl bg-background border border-primary-border space-y-1">
            <p class="text-secondary-text">Source Deals Table</p>
            <p class="font-mono font-bold text-primary-text">
              {{ store.syncStatus?.deals_table || "mt5_deals_2026" }}
            </p>
          </div>

          <div class="p-3 rounded-xl bg-background border border-primary-border space-y-1">
            <p class="text-secondary-text">Sync Interval</p>
            <p class="font-mono font-bold text-primary-text">
              {{ store.syncStatus?.sync_interval_seconds ? `${store.syncStatus.sync_interval_seconds} seconds` : "120 seconds (~2 min)" }}
            </p>
          </div>

          <div class="p-3 rounded-xl bg-background border border-primary-border space-y-1">
            <p class="text-secondary-text">Max Batches / Max Runtime</p>
            <p class="font-mono font-bold text-primary-text">
              {{ store.syncStatus?.max_batches_per_run || 5 }} batches / {{ store.syncStatus?.max_runtime_seconds || 45 }}s
            </p>
          </div>

          <div class="p-3 rounded-xl bg-background border border-primary-border space-y-1">
            <p class="text-secondary-text">Last Processed Deal Number</p>
            <p class="font-mono font-bold text-primary-text">
              {{ cursor.last_deal ? `#${cursor.last_deal}` : "N/A" }}
            </p>
          </div>

          <div class="p-3 rounded-xl bg-background border border-primary-border space-y-1">
            <p class="text-secondary-text">Last Timestamp Watermark</p>
            <p class="font-mono font-bold text-primary-text">
              {{ cursor.last_timestamp || "N/A" }}
            </p>
          </div>

          <div class="p-3 rounded-xl bg-background border border-primary-border space-y-1">
            <p class="text-secondary-text">Stop Reason / Diagnostics</p>
            <p class="font-mono font-bold text-primary-text">
              {{ cursor.extra?.stopped_reason || "Scheduled Interval" }} ({{ cursor.extra?.elapsed_ms || 0 }}ms)
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
