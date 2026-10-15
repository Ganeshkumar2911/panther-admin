<template>
  <div class="px-4 pb-8 space-y-6">

    <!-- Header & Navigation -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <button
          class="p-2 rounded-xl border border-primary-border bg-card-background hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
          title="Back to Settlement"
          @click="goBack"
        >
          <ArrowLeft class="w-4 h-4" />
        </button>

        <div class="space-y-1">
          <div class="flex items-center gap-2.5 flex-wrap">
            <h1 class="text-base font-bold text-primary-text">Settlement Trades Snapshot</h1>

            <span class="px-2 py-0.5 rounded-md text-xs font-bold bg-primary text-white">
              Settlement #{{ settlementId }}
            </span>

            <span
              v-if="store.settlement?.fm_name"
              class="px-2 py-0.5 rounded-md text-[11px] font-medium bg-card-background text-secondary-text border border-primary-border"
            >
              FM: {{ store.settlement.fm_name }} (FM #{{ store.settlement.fm_id }})
            </span>

            <span
              v-if="store.settlement?.status"
              class="text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize"
              :class="statusClass(store.settlement.status)"
            >
              {{ store.settlement.status }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          :disabled="store.loading"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-xs font-medium text-secondary-text hover:text-primary-text transition-colors disabled:opacity-50 cursor-pointer"
          @click="loadTrades"
        >
          <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': store.loading }" />
          Refresh
        </button>

        <button
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-xs font-medium text-primary-text transition-colors cursor-pointer"
          @click="goToDetails($event)"
        >
          <Eye class="w-3.5 h-3.5 text-primary" />
          Settlement Overview
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <template v-if="store.loading && !store.records?.length">
        <div v-for="n in 4" :key="n" class="bg-card-background border border-primary-border rounded-2xl p-4 animate-pulse space-y-2">
          <div class="h-3 w-24 bg-background rounded" />
          <div class="h-6 w-28 bg-background rounded" />
        </div>
      </template>
      <template v-else>
        <div class="bg-card-background border border-primary-border rounded-2xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total Trades</p>
          <p class="text-2xl font-bold text-primary-text">{{ store.summary.total_trades }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-2xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total PnL</p>
          <p class="text-2xl font-bold tabular-nums" :class="store.summary.total_pnl >= 0 ? 'text-primary-green' : 'text-primary-red'">
            {{ store.summary.total_pnl >= 0 ? '+' : '' }}${{ formatNum(store.summary.total_pnl) }}
          </p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-2xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Net PnL</p>
          <p class="text-2xl font-bold tabular-nums" :class="store.summary.net_pnl >= 0 ? 'text-primary-green' : 'text-primary-red'">
            {{ store.summary.net_pnl >= 0 ? '+' : '' }}${{ formatNum(store.summary.net_pnl) }}
          </p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-2xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total Fee</p>
          <p class="text-2xl font-bold text-primary-text tabular-nums">${{ formatNum(store.summary.total_fee) }}</p>
        </div>
      </template>
    </div>

    <!-- Table -->
    <DataTable
      :data="store.records"
      :columns="columns"
      :loading="store.loading"
      :pagination="store.pagination"
      row-key="trade_id"
      empty-title="No trades found"
      empty-text="No trades recorded for this settlement"
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
    >
      <template #empty>
        <div class="flex flex-col items-center gap-3 py-16">
          <div class="w-12 h-12 rounded-full bg-card-background border border-primary-border flex items-center justify-center">
            <BarChart2 class="w-5 h-5 text-secondary-text" />
          </div>
          <p class="text-sm font-semibold text-primary-text">No trades found</p>
          <p class="text-xs text-secondary-text">No trades recorded for this settlement</p>
        </div>
      </template>

      <!-- Trade ID -->
      <template #cell-trade_id="{ value }">
        <span class="text-xs font-bold font-mono text-primary">#{{ value }}</span>
      </template>

      <!-- Client -->
      <template #cell-client="{ row }">
        <div>
          <p class="text-xs font-semibold text-primary-text">{{ row.client?.name ?? row.client_name ?? '—' }}</p>
          <p
            class="text-[11px] font-mono cursor-pointer hover:underline text-primary"
            :title="(row.client?.email ?? row.client_email) ? `${row.client?.email ?? row.client_email} (Ctrl+Click to open in new tab)` : ''"
            @click.stop="(row.client?.email ?? row.client_email) && goToClient(row.client?.email ?? row.client_email, $event)"
          >
            {{ row.client?.email ?? row.client_email ?? '' }}
          </p>
        </div>
      </template>

      <!-- Account -->
      <template #cell-account="{ row }">
        <div>
          <p
            class="text-xs font-mono font-medium cursor-pointer hover:underline text-primary"
            :title="(row.trading_account?.account_number ?? row.account_number) ? `Trading Account #${row.trading_account?.account_number ?? row.account_number} (Ctrl+Click to open in new tab)` : ''"
            @click.stop="(row.trading_account?.account_number ?? row.account_number) && goToTradingAccount(row.trading_account?.account_number ?? row.account_number, $event)"
          >
            #{{ row.trading_account?.account_number ?? row.account_number ?? '—' }}
          </p>
          <p class="text-[11px] text-secondary-text">{{ row.trading_account?.broker ?? '' }}</p>
        </div>
      </template>

      <!-- Symbol -->
      <template #cell-symbol="{ value }">
        <span class="inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold bg-background border border-primary-border text-primary-text">
          {{ value ?? '—' }}
        </span>
      </template>

      <!-- Type -->
      <template #cell-order_type="{ row }">
        <span
          class="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase"
          :class="String(row.order_type || row.type).toLowerCase() === 'buy'
            ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
            : 'bg-primary-red/10 text-primary-red border-primary-red/20'"
        >
          {{ row.order_type || row.type || '—' }}
        </span>
      </template>

      <!-- Volume -->
      <template #cell-lot="{ row }">
        <span class="text-xs font-mono text-primary-text tabular-nums">{{ formatNum(row.lot ?? row.volume) }}</span>
      </template>

      <!-- PnL -->
      <template #cell-pnl="{ row }">
        <span
          class="text-xs font-bold font-mono tabular-nums"
          :class="(row.pnl ?? row.gross_pnl ?? 0) >= 0 ? 'text-primary-green' : 'text-primary-red'"
        >
          {{ (row.pnl ?? row.gross_pnl ?? 0) >= 0 ? '+' : '' }}${{ formatNum(row.pnl ?? row.gross_pnl) }}
        </span>
      </template>

      <!-- Fee -->
      <template #cell-fee="{ value }">
        <span class="text-xs font-mono text-primary-text tabular-nums">${{ formatNum(value) }}</span>
      </template>

      <!-- FM Fee -->
      <template #cell-fm_fee="{ value }">
        <span class="text-xs font-mono text-secondary-text tabular-nums">
          {{ value != null ? `$${formatNum(value)}` : '—' }}
        </span>
      </template>

      <!-- Broker Net -->
      <template #cell-broker_net="{ row }">
        <span class="text-xs font-mono text-secondary-text tabular-nums">
          {{ row.broker_net != null ? `$${formatNum(row.broker_net)}` : (row.broker_fee != null ? `$${formatNum(row.broker_fee)}` : '—') }}
        </span>
      </template>

      <!-- IB Share -->
      <template #cell-ib_distributed="{ value }">
        <span class="text-xs font-mono text-primary-green tabular-nums">
          {{ value != null ? `$${formatNum(value)}` : '—' }}
        </span>
      </template>

      <!-- Status -->
      <template #cell-status="{ value }">
        <span class="text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize inline-block" :class="statusClass(value)">
          {{ value ?? '—' }}
        </span>
      </template>

      <!-- Closed / Opened -->
      <template #cell-closed_at="{ row }">
        <span class="text-xs text-secondary-text text-right font-mono block">
          {{ formatDate(row.closed_at ?? row.opened_at ?? row.created_at) }}
        </span>
      </template>
    </DataTable>

  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BarChart2, ArrowLeft, RotateCw, Eye } from 'lucide-vue-next'
import { useSettlementTradesStore } from '@/stores/settlements/settlementTrades'
import DataTable from '@/components/common/DataTable/DataTable.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import { goToTradingAccount, goToClient, openInNewTab, isNewTabEvent } from '@/composables/useNavigation'

const store = useSettlementTradesStore()
const route = useRoute()
const router = useRouter()
const settlementId = route.params.id

const columns = [
  { key: 'trade_id', label: 'Trade ID', sortable: false },
  { key: 'client', label: 'Client', sortable: false },
  { key: 'account', label: 'Account', sortable: false },
  { key: 'symbol', label: 'Symbol', sortable: false },
  { key: 'order_type', label: 'Type', sortable: false },
  { key: 'lot', label: 'Volume', sortable: false },
  { key: 'pnl', label: 'PnL', sortable: false },
  { key: 'fee', label: 'Fee', sortable: false },
  { key: 'fm_fee', label: 'FM Fee', sortable: false },
  { key: 'broker_net', label: 'Broker Net', sortable: false },
  { key: 'ib_distributed', label: 'IB Share', sortable: false },
  { key: 'status', label: 'Status', align: 'center', sortable: false },
  { key: 'closed_at', label: 'Closed / Opened', align: 'right', sortable: false },
]

const handlePageChange = (page) => {
  store.setPage(settlementId, page)
}

const handlePerPageChange = (perPage) => {
  store.updatePerPage(settlementId, perPage)
}

const loadTrades = () => {
  store.fetchTrades(settlementId)
}

const goBack = () => {
  router.push(`/settlement/details/${settlementId}`)
}

const goToDetails = (event) => {
  const routeLoc = `/settlement/details/${settlementId}`
  if (isNewTabEvent(event)) {
    return openInNewTab(router.resolve(routeLoc).href)
  }
  router.push(routeLoc)
}

const formatNum = (val) =>
  (Number(val) || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const formatDate = (val) => {
  if (!val) return '—'
  try {
    const d = new Date(val)
    if (isNaN(d.getTime())) return String(val)
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch (e) {
    return String(val)
  }
}

const statusClass = (s) =>
  ({
    closed: 'bg-background text-secondary-text border-primary-border',
    open: 'bg-primary-blue/10 text-primary-blue border-primary-blue/20',
    completed: 'bg-primary-green/10 text-primary-green border-primary-green/20',
    pending: 'bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20',
    cancelled: 'bg-primary-red/10 text-primary-red border-primary-red/20',
  }[String(s).toLowerCase()] ?? 'bg-background text-secondary-text border-primary-border')

onMounted(() => {
  loadTrades()
})
</script>