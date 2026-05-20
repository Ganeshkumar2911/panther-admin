<template>
  <div class="px-4">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <template v-if="store.loading">
        <div
          v-for="n in 2"
          :key="n"
          class="bg-card-background border border-primary-border rounded-xl p-4 animate-pulse space-y-2"
        >
          <div class="h-3 w-20 bg-background rounded" />
          <div class="h-6 w-28 bg-background rounded" />
        </div>
      </template>
      <template v-else>
        <div
          class="bg-card-background border border-primary-border rounded-xl p-4"
        >
          <p
            class="text-[11px] uppercase tracking-wide text-secondary-text mb-1"
          >
            Total Lots
          </p>
          <p class="text-2xl font-medium text-primary-text">
            {{ formatNum(store.summary.total_lots) }}
          </p>
        </div>
        <div
          class="bg-card-background border border-primary-border rounded-xl p-4"
        >
          <p
            class="text-[11px] uppercase tracking-wide text-secondary-text mb-1"
          >
            Total PnL
          </p>
          <p
            class="text-2xl font-medium"
            :class="
              store.summary.total_pnl >= 0 ? 'text-green-700' : 'text-red-700'
            "
          >
            {{ store.summary.total_pnl >= 0 ? "+" : "" }}${{
              formatNum(store.summary.total_pnl)
            }}
          </p>
        </div>
      </template>
    </div>

    <!-- Positions Tabs -->
    <div class="flex items-center gap-2 mb-4">
      <button
        type="button"
        class="px-3 py-1.5 text-xs font-medium rounded-full border transition-colors"
        :class="
          store.side == null
            ? 'bg-primary-text text-background border-primary-text'
            : 'bg-card-background text-secondary-text border-primary-border hover:text-primary-text'
        "
        @click="handleSideChange(null)"
      >
        All
      </button>
      <button
        type="button"
        class="px-3 py-1.5 text-xs font-medium rounded-full border transition-colors"
        :class="
          store.side === 'open'
            ? 'bg-primary-text text-background border-primary-text'
            : 'bg-card-background text-secondary-text border-primary-border hover:text-primary-text'
        "
        @click="handleSideChange('open')"
      >
        Open
      </button>
      <button
        type="button"
        class="px-3 py-1.5 text-xs font-medium rounded-full border transition-colors"
        :class="
          store.side === 'closed'
            ? 'bg-primary-text text-background border-primary-text'
            : 'bg-card-background text-secondary-text border-primary-border hover:text-primary-text'
        "
        @click="handleSideChange('closed')"
      >
        Closed
      </button>
    </div>

    <!-- Table -->
    <div class="w-full border border-primary-border rounded-xl overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-primary-border">
            <th
              class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3"
            >
              Trade ID
            </th>
            <th
              class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3"
            >
              Symbol
            </th>
            <th
              class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3"
            >
              Type
            </th>
            <th
              class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3"
            >
              Lot
            </th>
            <th
              class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3"
            >
              Entry
            </th>
            <th
              class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3"
            >
              Exit
            </th>
            <th
              class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3"
            >
              LTP
            </th>
            <th
              class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3"
            >
              PnL
            </th>
            <th
              class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3"
            >
              Status
            </th>
            <th
              class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3"
            >
              Created
            </th>
          </tr>
        </thead>

        <!-- Skeleton -->
        <tbody v-if="store.loading">
          <tr
            v-for="n in 8"
            :key="n"
            class="border-b border-primary-border animate-pulse"
          >
            <td class="p-3">
              <div class="h-3 w-10 bg-card-background rounded" />
            </td>
            <td class="p-3">
              <div class="h-3 w-16 bg-card-background rounded" />
            </td>
            <td class="p-3">
              <div class="h-5 w-10 bg-card-background rounded-full" />
            </td>
            <td class="p-3">
              <div class="h-3 w-10 bg-card-background rounded" />
            </td>
            <td class="p-3">
              <div class="h-3 w-14 bg-card-background rounded" />
            </td>
            <td class="p-3">
              <div class="h-3 w-14 bg-card-background rounded" />
            </td>
            <td class="p-3">
              <div class="h-3 w-16 bg-card-background rounded" />
            </td>
            <td class="p-3">
              <div class="h-5 w-14 bg-card-background rounded-full" />
            </td>
            <td class="p-3 flex justify-end">
              <div class="h-3 w-20 bg-card-background rounded" />
            </td>
          </tr>
        </tbody>

        <!-- Empty -->
        <tbody v-else-if="store.data.length === 0">
          <tr>
            <td colspan="9" class="py-16 text-center">
              <div class="flex flex-col items-center gap-3">
                <div
                  class="w-12 h-12 rounded-full bg-card-background flex items-center justify-center"
                >
                  <BarChart2 class="w-5 h-5 text-secondary-text" />
                </div>
                <p class="text-sm font-medium text-primary-text">
                  No trades found
                </p>
                <p class="text-xs text-secondary-text">
                  Trades will appear here once executed
                </p>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Data -->
        <tbody v-else>
          <tr
            v-for="trade in store.data"
            :key="trade.trade_id"
            class="border-b border-primary-border last:border-none hover:bg-card-background transition-colors"
          >
            <td class="p-3 text-xs font-medium text-primary-text">
              #{{ trade.trade_id }}
            </td>

            <td class="p-3 text-xs font-medium text-primary-text">
              {{ trade.symbol }}
            </td>

            <td class="p-3">
              <span
                class="text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize"
                :class="
                  trade.type === 'BUY'
                    ? 'bg-primary-green/10 text-green-800 border-primary-green/20'
                    : 'bg-primary-red/10 text-red-800 border-primary-red/20'
                "
              >
                {{ trade.type }}
              </span>
            </td>

            <td class="p-3 text-xs text-primary-text tabular-nums">
              {{ trade.lot.toFixed(2) }}
            </td>

            <td class="p-3 text-xs text-primary-text tabular-nums">
              {{
                trade.entry_price != null
                  ? Number(trade.entry_price).toFixed(2)
                  : "—"
              }}
            </td>

            <td class="p-3 text-xs text-primary-text tabular-nums">
              {{
                trade.last_price != null
                  ? Number(trade.last_price).toFixed(2)
                  : "—"
              }}
            </td>

            <td class="p-3 text-xs text-primary-text tabular-nums">
              {{ lastTickerPriceText(trade) }}
            </td>

            <td class="p-3">
              <span
                class="text-xs tabular-nums font-medium"
                :class="pnlValue(trade) >= 0 ? 'text-green-700' : 'text-red-700'"
              >
                {{ pnlValue(trade) >= 0 ? "+" : "" }}${{ formatNum(pnlValue(trade)) }}
              </span>
            </td>

            <td class="p-3">
              <span
                class="text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize"
                :class="
                  trade.status === 'closedd'
                    ? 'bg-background text-secondary-text border-primary-border'
                    : 'bg-blue-50 text-blue-800 border-blue-200'
                "
              >
                {{ trade.status }}
              </span>
            </td>

            <td class="p-3 text-xs text-secondary-text text-right">
              {{ formatDate(trade.created_at) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4">
      <Pagination
        v-if="store.pagination.total_items > store.pagination.per_page"
        :pagination="store.pagination"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { BarChart2 } from "lucide-vue-next";
import { useAccountTradesStore } from "@/stores/tradingAccounts/accountsTrades";
import Pagination from "@/components/common/Pagination.vue";
import { livePNL } from '@/utils/livePNL'
import { useTickerStore } from '@/stores/ws/ticker'

const store = useAccountTradesStore();
const route = useRoute();
const accountId = route.params.id;
const tickerStore = useTickerStore()

const isOpenTrade = (trade) => String(trade?.status ?? "").toUpperCase() === "OPEN";
const pnlValue = (trade) => {
  const raw = isOpenTrade(trade) ? livePNL(trade) : trade?.pnl;
  const val = Number(raw);
  return Number.isFinite(val) ? val : 0;
};

const lastTickerPriceText = (trade) => {
  const quote = tickerStore?.getLastPrice?.(trade?.symbol);
  if (quote == null) return "—";

  if (typeof quote === "number") return Number.isFinite(quote) ? formatNum(quote) : "—";

  const side = String(trade?.type ?? "").toUpperCase();
  const raw = side === "BUY" ? quote?.bid : quote?.ask;
  const val = Number(raw);
  return Number.isFinite(val) ? formatNum(val) : "—";
};

const handlePageChange = (page) => {
  store.setPage(page);
};

const handleSideChange = (side) => {
  store.setSide(side);
};

const formatNum = (val) =>
  (val ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const formatDate = (val) =>
  new Date(val).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

onMounted(() => store.fetchTrades(accountId, store.side));
</script>
