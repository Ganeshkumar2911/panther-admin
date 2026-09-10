<template>
  <div
    v-if="
      !hasPermission('payment_requests.platform_view') &&
      !hasPermission('payment_request.platform_view')
    "
  >
    <NoPermissionsState />
  </div>

  <div v-else class="px-4 pb-8 space-y-5">
    <!-- Header & Source Toggle Switcher -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h2 class="text-lg font-bold text-primary-text flex items-center gap-2">
          <FileText class="w-5 h-5 text-primary" />
          <span>Payment Gateway Data</span>
        </h2>
        <p class="text-xs text-secondary-text mt-0.5">
          Inspect raw gateway webhook logs and payment gateway transaction
          records.
        </p>
      </div>

      <!-- Segmented Source Toggle -->
      <div
        class="inline-flex p-1 bg-card-background border border-primary-border rounded-xl"
      >
        <button
          type="button"
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          :class="
            store.source === 'logs'
              ? 'bg-primary text-white shadow-sm'
              : 'text-secondary-text hover:text-primary-text'
          "
          @click="store.setSource('logs')"
        >
          <Code2 class="w-3.5 h-3.5" />
          <span>Webhook & Gateway Logs</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          :class="
            store.source === 'transaction'
              ? 'bg-primary text-white shadow-sm'
              : 'text-secondary-text hover:text-primary-text'
          "
          @click="store.setSource('transaction')"
        >
          <ArrowLeftRight class="w-3.5 h-3.5" />
          <span>Gateway Transactions</span>
        </button>
      </div>
    </div>

    <!-- Filters Bar -->
    <div
      class="flex w-full min-w-0 flex-col gap-2 rounded-xl border border-primary-border bg-card-background/40 p-2 sm:flex-row sm:items-center xl:flex-nowrap flex-wrap"
    >
      <!-- Gateway Filter -->
      <BaseSelect
        v-model="store.filters.gateway"
        :options="gatewayOptions"
        placeholder="All Gateways"
        :allow-all="true"
        all-label="All Gateways"
        class="w-full sm:w-40 xl:w-44"
        @update:modelValue="store.applyFilters()"
      />

      <!-- Search Input -->
      <div class="relative w-full sm:w-52 xl:w-60">
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text pointer-events-none"
        />
        <input
          v-model="store.filters.search"
          type="text"
          placeholder="Search by keyword..."
          class="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-primary-border bg-card-background text-primary-text placeholder:text-secondary-text focus:outline-hidden focus:border-primary transition"
          @input="onSearchInput"
          @keyup.enter="handleSearchImmediate"
        />
      </div>

      <!-- Gateway Transaction ID -->
      <div class="relative w-full sm:w-48 xl:w-52">
        <Hash
          class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text pointer-events-none"
        />
        <input
          v-model="store.filters.gateway_transaction_id"
          type="text"
          placeholder="Gateway Tx ID..."
          class="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-primary-border bg-card-background text-primary-text placeholder:text-secondary-text focus:outline-hidden focus:border-primary transition"
          @input="onTxIdInput"
          @keyup.enter="handleTxIdImmediate"
        />
      </div>

      <!-- Date Range Picker -->
      <BaseDatePicker
        v-model="dateRangeValue"
        :range="true"
        placeholder="Filter by date range..."
        class="w-full sm:w-60 xl:w-64"
      />

      <!-- Per Page Select -->
      <BaseSelect
        :modelValue="store.pagination.per_page"
        :options="store.perPageOptions"
        placeholder="Per page..."
        class="w-full sm:w-28 xl:w-28"
        @update:modelValue="store.updatePerPage"
      />

      <!-- Clear Filters Button -->
      <button
        v-if="hasActiveFilters"
        type="button"
        class="rounded-lg px-3 py-2 text-xs font-medium text-secondary-text hover:bg-background hover:text-primary-text transition-colors sm:flex-none cursor-pointer"
        @click="handleResetFilters"
      >
        Clear
      </button>

      <!-- Refresh Button -->
      <Tooltip text="Refresh" position="right">
        <button
          type="button"
          :disabled="store.loading"
          class="inline-flex items-center justify-center rounded-lg border border-primary-border p-2 text-secondary-text transition-colors hover:text-primary-text hover:bg-background disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer sm:ml-auto"
          @click="store.fetchData(true)"
        >
          <RefreshCw
            class="h-3.5 w-3.5"
            :class="{ 'animate-spin': store.loading }"
          />
        </button>
      </Tooltip>
    </div>

    <!-- VIEW 1: LOGS DATA TABLE (Desktop) -->
    <div
      v-if="store.source === 'logs'"
      class="hidden md:block w-full border border-primary-border rounded-xl overflow-x-auto bg-card-background/40"
    >
      <table class="w-full border-collapse text-left">
        <thead>
          <tr
            class="border-b border-primary-border text-[11px] font-medium text-secondary-text uppercase tracking-widest bg-card-background"
          >
            <th class="p-3">Log ID & Date</th>
            <th class="p-3">Gateway</th>
            <th class="p-3">Direction & Operation</th>
            <th class="p-3">Method & Endpoint</th>
            <th class="p-3">Gateway Tx ID</th>
            <th class="p-3">Status</th>
            <th class="p-3">Signature</th>
            <th class="p-3 text-right">Action</th>
          </tr>
        </thead>

        <!-- Skeleton -->
        <tbody v-if="store.loading">
          <tr
            v-for="n in 6"
            :key="n"
            class="border-b border-primary-border animate-pulse"
          >
            <td class="p-3">
              <div class="h-3.5 w-16 bg-card-background rounded mb-1.5" />
              <div class="h-2.5 w-24 bg-card-background rounded" />
            </td>
            <td class="p-3">
              <div class="h-4 w-20 bg-card-background rounded" />
            </td>
            <td class="p-3">
              <div class="h-3.5 w-24 bg-card-background rounded mb-1" />
              <div class="h-2.5 w-16 bg-card-background rounded" />
            </td>
            <td class="p-3">
              <div class="h-3.5 w-36 bg-card-background rounded" />
            </td>
            <td class="p-3">
              <div class="h-3.5 w-16 bg-card-background rounded" />
            </td>
            <td class="p-3">
              <div class="h-5 w-16 bg-card-background rounded-full" />
            </td>
            <td class="p-3">
              <div class="h-5 w-16 bg-card-background rounded-full" />
            </td>
            <td class="p-3 text-right">
              <div class="h-6 w-14 bg-card-background rounded ml-auto" />
            </td>
          </tr>
        </tbody>

        <!-- Empty -->
        <tbody v-else-if="store.records.length === 0">
          <tr>
            <td colspan="8" class="py-16 text-center">
              <div class="flex flex-col items-center gap-3">
                <div
                  class="w-12 h-12 rounded-full bg-card-background flex items-center justify-center border border-primary-border"
                >
                  <FileCode2 class="w-5 h-5 text-secondary-text" />
                </div>
                <p class="text-sm font-medium text-primary-text">
                  No payment gateway logs found
                </p>
                <p class="text-xs text-secondary-text">
                  Try adjusting your gateway or date filters
                </p>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Data Rows -->
        <tbody v-else>
          <tr
            v-for="log in store.records"
            :key="log.id"
            class="border-b border-primary-border last:border-none hover:bg-card-background/70 transition-colors text-xs"
          >
            <!-- ID & Date -->
            <td class="p-3 align-top">
              <span
                class="inline-block font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-background border border-primary-border/60 text-primary-text"
              >
                #{{ log.id }}
              </span>
              <p class="text-[11px] text-secondary-text mt-1">
                {{ formatDate(log.created_at) }}
              </p>
            </td>

            <!-- Gateway -->
            <td class="p-3 align-top">
              <span
                class="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-primary/10 text-primary border-primary/20"
              >
                {{ log.gateway }}
              </span>
            </td>

            <!-- Direction & Operation -->
            <td class="p-3 align-top">
              <p class="font-semibold text-primary-text">
                {{ log.operation || "WEBHOOK" }}
              </p>
              <p class="text-[11px] text-secondary-text">
                {{ log.direction || "inbound" }}
              </p>
            </td>

            <!-- Method & Endpoint -->
            <td class="p-3 align-top">
              <span
                class="font-mono text-[11px] font-bold text-primary mr-1.5"
                >{{ log.http_method }}</span
              >
              <span
                class="font-mono text-[11px] text-secondary-text truncate"
                :title="log.endpoint"
                >{{ log.endpoint }}</span
              >
            </td>

            <!-- Gateway Transaction ID -->
            <td class="p-3 align-top font-mono">
              <span v-if="log.gateway_transaction_id" class="text-primary-text"
                >#{{ log.gateway_transaction_id }}</span
              >
              <span v-else class="text-secondary-text">—</span>
            </td>

            <!-- Status -->
            <td class="p-3 align-top">
              <span
                class="inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border"
                :class="
                  log.response_status >= 200 && log.response_status < 300
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                "
              >
                {{ log.response_status ? `HTTP ${log.response_status}` : "—" }}
              </span>
            </td>

            <!-- Signature -->
            <td class="p-3 align-top">
              <span
                class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                :class="
                  log.signature_valid
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                "
              >
                <Check v-if="log.signature_valid" class="w-3 h-3" />
                <AlertCircle v-else class="w-3 h-3" />
                {{ log.signature_valid ? "Valid" : "Unverified" }}
              </span>
            </td>

            <!-- Actions -->
            <td class="p-3 align-top text-right">
              <button
                type="button"
                class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-primary rounded-lg bg-primary/10 hover:bg-primary/20 transition cursor-pointer"
                @click="openDetails(log)"
              >
                <Eye class="w-3 h-3" />
                <span>Details</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- VIEW 2: TRANSACTIONS DATA TABLE (Desktop) -->
    <div
      v-else
      class="hidden md:block w-full border border-primary-border rounded-xl overflow-x-auto bg-card-background/40"
    >
      <table class="w-full border-collapse text-left">
        <thead>
          <tr
            class="border-b border-primary-border text-[11px] font-medium text-secondary-text uppercase tracking-widest bg-card-background"
          >
            <th class="p-3">ID & Date</th>
            <th class="p-3">Gateway & Method</th>
            <th class="p-3">Payment Req & Ref ID</th>
            <th class="p-3">User & Account</th>
            <th class="p-3">Type</th>
            <th class="p-3">Amount</th>
            <th class="p-3">State</th>
            <th class="p-3 text-right">Action</th>
          </tr>
        </thead>

        <!-- Skeleton -->
        <tbody v-if="store.loading">
          <tr
            v-for="n in 6"
            :key="n"
            class="border-b border-primary-border animate-pulse"
          >
            <td class="p-3">
              <div class="h-3.5 w-16 bg-card-background rounded mb-1.5" />
              <div class="h-2.5 w-24 bg-card-background rounded" />
            </td>
            <td class="p-3">
              <div class="h-4 w-24 bg-card-background rounded" />
            </td>
            <td class="p-3">
              <div class="h-3.5 w-20 bg-card-background rounded mb-1" />
              <div class="h-2.5 w-28 bg-card-background rounded" />
            </td>
            <td class="p-3">
              <div class="h-3.5 w-16 bg-card-background rounded mb-1" />
              <div class="h-2.5 w-20 bg-card-background rounded" />
            </td>
            <td class="p-3">
              <div class="h-4 w-16 bg-card-background rounded" />
            </td>
            <td class="p-3">
              <div class="h-4 w-20 bg-card-background rounded" />
            </td>
            <td class="p-3">
              <div class="h-5 w-16 bg-card-background rounded-full" />
            </td>
            <td class="p-3 text-right">
              <div class="h-6 w-14 bg-card-background rounded ml-auto" />
            </td>
          </tr>
        </tbody>

        <!-- Empty -->
        <tbody v-else-if="store.records.length === 0">
          <tr>
            <td colspan="8" class="py-16 text-center">
              <div class="flex flex-col items-center gap-3">
                <div
                  class="w-12 h-12 rounded-full bg-card-background flex items-center justify-center border border-primary-border"
                >
                  <ArrowLeftRight class="w-5 h-5 text-secondary-text" />
                </div>
                <p class="text-sm font-medium text-primary-text">
                  No payment gateway transactions found
                </p>
                <p class="text-xs text-secondary-text">
                  Try adjusting your filters or switching to logs
                </p>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Data Rows -->
        <tbody v-else>
          <tr
            v-for="tx in store.records"
            :key="tx.id"
            class="border-b border-primary-border last:border-none hover:bg-card-background/70 transition-colors text-xs"
          >
            <!-- ID & Date -->
            <td class="p-3 align-top">
              <span
                class="inline-block font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-background border border-primary-border/60 text-primary-text"
              >
                #{{ tx.id }}
              </span>
              <p class="text-[11px] text-secondary-text mt-1">
                {{ formatDate(tx.created_at) }}
              </p>
            </td>

            <!-- Gateway & Method -->
            <td class="p-3 align-top">
              <p class="font-bold uppercase tracking-wider text-primary">
                {{ tx.gateway }}
              </p>
              <p class="text-[11px] text-secondary-text">
                {{ tx.payment_method || "—" }}
              </p>
            </td>

            <!-- Payment Request ID & Reference ID -->
            <td class="p-3 align-top">
              <p class="font-mono font-medium text-primary-text">
                {{
                  tx.payment_request_id ? `Req #${tx.payment_request_id}` : "—"
                }}
              </p>
              <p
                class="font-mono text-[10px] text-secondary-text truncate max-w-35"
                :title="tx.reference_id"
              >
                {{ tx.reference_id || "—" }}
              </p>
            </td>

            <!-- User & Account -->
            <td class="p-3 align-top">
              <p class="font-medium text-primary-text">
                User #{{ tx.user_id }}
              </p>
              <p
                v-if="tx.trading_account_id"
                class="font-mono text-[11px] text-secondary-text"
              >
                Acc #{{ tx.trading_account_id }}
              </p>
            </td>

            <!-- Type -->
            <td class="p-3 align-top">
              <span
                class="inline-flex text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-background border border-primary-border text-primary-text"
              >
                {{ tx.payment_type }}
              </span>
            </td>

            <!-- Amount -->
            <td class="p-3 align-top">
              <p class="font-mono font-bold text-primary-text">
                {{ fmt(tx.amount) }} {{ tx.currency }}
              </p>
              <p
                v-if="tx.customer_amount && tx.customer_amount !== tx.amount"
                class="font-mono text-[10px] text-secondary-text"
              >
                ({{ fmt(tx.customer_amount) }} {{ tx.customer_currency }})
              </p>
            </td>

            <!-- State -->
            <td class="p-3 align-top">
              <span
                class="inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize"
                :class="getTransactionStateClass(tx.state)"
              >
                {{ tx.state || "PENDING" }}
              </span>
            </td>

            <!-- Actions -->
            <td class="p-3 align-top text-right">
              <button
                type="button"
                class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-primary rounded-lg bg-primary/10 hover:bg-primary/20 transition cursor-pointer"
                @click="openDetails(tx)"
              >
                <Eye class="w-3 h-3" />
                <span>Details</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MOBILE CARDS (Mobile view) -->
    <div class="md:hidden space-y-3">
      <!-- Loading Skeleton -->
      <template v-if="store.loading">
        <div
          v-for="n in 3"
          :key="n"
          class="bg-card-background border border-primary-border rounded-xl p-4 animate-pulse space-y-3"
        >
          <div class="flex justify-between items-center">
            <div class="h-3 w-20 bg-background rounded" />
            <div class="h-5 w-16 bg-background rounded-full" />
          </div>
          <div class="space-y-1.5">
            <div class="h-3 w-full bg-background rounded" />
            <div class="h-2.5 w-2/3 bg-background rounded" />
          </div>
        </div>
      </template>

      <!-- Empty -->
      <div v-else-if="store.records.length === 0" class="py-16 text-center">
        <p class="text-sm font-medium text-primary-text">No records found</p>
        <p class="text-xs text-secondary-text mt-1">
          Try adjusting your filters
        </p>
      </div>

      <!-- Log Mobile Cards -->
      <template v-else-if="store.source === 'logs'">
        <div
          v-for="log in store.records"
          :key="log.id"
          class="bg-card-background border border-primary-border rounded-xl p-4 space-y-3 text-xs"
        >
          <div class="flex items-start justify-between">
            <div>
              <span
                class="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-background border border-primary-border/60"
              >
                #{{ log.id }}
              </span>
              <span class="ml-2 font-bold uppercase text-primary text-[10px]">{{
                log.gateway
              }}</span>
              <p class="text-[11px] text-secondary-text mt-1">
                {{ formatDate(log.created_at) }}
              </p>
            </div>
            <span
              class="text-[10px] font-bold px-2 py-0.5 rounded-full border"
              :class="
                log.response_status >= 200 && log.response_status < 300
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'bg-red-500/10 text-red-500 border-red-500/20'
              "
            >
              HTTP {{ log.response_status || "—" }}
            </span>
          </div>

          <div
            class="bg-background/30 rounded-lg p-2.5 space-y-1 font-mono text-[11px]"
          >
            <p>
              <span class="font-bold text-primary">{{ log.http_method }}</span>
              {{ log.endpoint }}
            </p>
            <p
              v-if="log.gateway_transaction_id"
              class="text-secondary-text text-[10px]"
            >
              Gateway Tx ID: #{{ log.gateway_transaction_id }}
            </p>
          </div>

          <button
            type="button"
            class="w-full text-center py-2 text-xs font-semibold text-primary rounded-lg bg-primary/10 hover:bg-primary/20 transition cursor-pointer"
            @click="openDetails(log)"
          >
            View Details
          </button>
        </div>
      </template>

      <!-- Transaction Mobile Cards -->
      <template v-else>
        <div
          v-for="tx in store.records"
          :key="tx.id"
          class="bg-card-background border border-primary-border rounded-xl p-4 space-y-3 text-xs"
        >
          <div class="flex items-start justify-between">
            <div>
              <span
                class="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-background border border-primary-border/60"
              >
                #{{ tx.id }}
              </span>
              <span class="ml-2 font-bold uppercase text-primary text-[10px]"
                >{{ tx.gateway }} · {{ tx.payment_method }}</span
              >
              <p class="text-[11px] text-secondary-text mt-1">
                {{ formatDate(tx.created_at) }}
              </p>
            </div>
            <span
              class="text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize"
              :class="getTransactionStateClass(tx.state)"
            >
              {{ tx.state || "PENDING" }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2 bg-background/30 rounded-lg p-2.5">
            <div>
              <span class="text-[10px] text-secondary-text block">Amount</span>
              <span class="font-mono font-bold text-primary-text"
                >{{ fmt(tx.amount) }} {{ tx.currency }}</span
              >
            </div>
            <div>
              <span class="text-[10px] text-secondary-text block">Type</span>
              <span class="font-bold uppercase text-primary-text">{{
                tx.payment_type
              }}</span>
            </div>
            <div>
              <span class="text-[10px] text-secondary-text block">User</span>
              <span class="text-primary-text">User #{{ tx.user_id }}</span>
            </div>
            <div>
              <span class="text-[10px] text-secondary-text block">Account</span>
              <span class="font-mono text-primary-text">{{
                tx.trading_account_id ? `#${tx.trading_account_id}` : "—"
              }}</span>
            </div>
          </div>

          <button
            type="button"
            class="w-full text-center py-2 text-xs font-semibold text-primary rounded-lg bg-primary/10 hover:bg-primary/20 transition cursor-pointer"
            @click="openDetails(tx)"
          >
            View Details
          </button>
        </div>
      </template>
    </div>

    <!-- Pagination -->
    <div class="mt-4">
      <Pagination
        v-if="store.pagination.total_items > store.pagination.per_page"
        :pagination="store.pagination"
        @page-change="handlePageChange"
      />
    </div>

    <!-- Detail Drawer -->
    <PaymentGatewayDetailDrawer
      :open="detailOpen"
      :item="selectedItem || {}"
      :source="store.source"
      @close="closeDetails"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import {
  FileText,
  Code2,
  ArrowLeftRight,
  Search,
  Hash,
  RefreshCw,
  Eye,
  Check,
  AlertCircle,
  FileCode2,
} from "lucide-vue-next";
import { usePaymentGatewayLogsStore } from "@/stores/paymentGatewayLogs/paymentGatewayLogs";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import BaseSelect from "@/components/common/BaseSelect.vue";
import BaseDatePicker from "@/components/common/BaseDatePicker.vue";
import Pagination from "@/components/common/Pagination.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import NoPermissionsState from "@/components/common/NoPermissionsState.vue";
import PaymentGatewayDetailDrawer from "@/components/paymentGatewayLogs/PaymentGatewayDetailDrawer.vue";
import { formatDate } from "@/utils/timeFormatter";

const store = usePaymentGatewayLogsStore();
const { hasPermission } = usePermissionCheck();

const detailOpen = ref(false);
const selectedItem = ref(null);

let searchDebounceTimer = null;
let txIdDebounceTimer = null;

const onSearchInput = () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    store.applyFilters();
  }, 350);
};

const handleSearchImmediate = () => {
  clearTimeout(searchDebounceTimer);
  store.applyFilters();
};

const onTxIdInput = () => {
  clearTimeout(txIdDebounceTimer);
  txIdDebounceTimer = setTimeout(() => {
    store.applyFilters();
  }, 350);
};

const handleTxIdImmediate = () => {
  clearTimeout(txIdDebounceTimer);
  store.applyFilters();
};

const handleResetFilters = () => {
  clearTimeout(searchDebounceTimer);
  clearTimeout(txIdDebounceTimer);
  store.resetFilters();
};

const gatewayOptions = [
  { label: "Coinsbuy", value: "coinsbuy" },
  { label: "Paymaxis", value: "paymaxis" },
];

const hasActiveFilters = computed(() => {
  return (
    store.filters.gateway ||
    store.filters.gateway_transaction_id ||
    store.filters.search ||
    store.filters.from_date ||
    store.filters.to_date
  );
});

// Date Range Computed Wrapper for BaseDatePicker
const dateRangeValue = computed({
  get() {
    if (store.filters.from_date || store.filters.to_date) {
      return {
        start: store.filters.from_date || null,
        end: store.filters.to_date || null,
      };
    }
    return null;
  },
  set(val) {
    if (!val) {
      store.filters.from_date = "";
      store.filters.to_date = "";
    } else if (Array.isArray(val)) {
      store.filters.from_date = val[0] || "";
      store.filters.to_date = val[1] || "";
    } else if (typeof val === "object") {
      store.filters.from_date = val.start || val.from || "";
      store.filters.to_date = val.end || val.to || "";
    }
    store.applyFilters();
  },
});

const fmt = (v) =>
  Number(v ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const getTransactionStateClass = (state) => {
  const s = (state || "").toUpperCase();
  if (s === "COMPLETED" || s === "SUCCESS") {
    return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  }
  if (s === "FAILED" || s === "REJECTED" || s === "ERROR") {
    return "bg-red-500/10 text-red-500 border-red-500/20";
  }
  return "bg-amber-500/10 text-amber-500 border-amber-500/20";
};

const handlePageChange = (page) => {
  store.setPage(page);
};

const openDetails = (item) => {
  selectedItem.value = item;
  detailOpen.value = true;
};

const closeDetails = () => {
  detailOpen.value = false;
  selectedItem.value = null;
};

onMounted(() => {
  if (
    hasPermission("payment_requests.platform_view") ||
    hasPermission("payment_request.platform_view")
  ) {
    store.fetchData();
  }
});
</script>
