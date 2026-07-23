<template>
  <div class="px-4">

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <template v-if="store.loading">
        <div v-for="n in 4" :key="n" class="bg-card-background border border-primary-border rounded-xl p-4 animate-pulse space-y-2">
          <div class="h-3 w-24 bg-background rounded" />
          <div class="h-6 w-28 bg-background rounded" />
        </div>
      </template>
      <template v-else>
        <div class="bg-card-background border border-primary-border rounded-xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total Trades</p>
          <p class="text-2xl font-medium text-primary-text">{{ store.summary.total_trades }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total PnL</p>
          <p class="text-2xl font-medium" :class="store.summary.total_pnl >= 0 ? 'text-green-700' : 'text-red-700'">
            {{ store.summary.total_pnl >= 0 ? '+' : '' }}${{ formatNum(store.summary.total_pnl) }}
          </p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Net PnL</p>
          <p class="text-2xl font-medium" :class="store.summary.net_pnl >= 0 ? 'text-green-700' : 'text-red-700'">
            {{ store.summary.net_pnl >= 0 ? '+' : '' }}${{ formatNum(store.summary.net_pnl) }}
          </p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total Fee</p>
          <p class="text-2xl font-medium text-primary-text">${{ formatNum(store.summary.total_fee) }}</p>
        </div>
      </template>
    </div>

    <!-- Filter bar -->
    <div class="flex items-center justify-end gap-3 mb-4">
      <BaseSelect
        :modelValue="store.pagination.per_page"
        :options="store.perPageOptions"
        placeholder="Per page..."
        class="w-32"
        @update:modelValue="(val) => store.updatePerPage(settlementId, val)"
      />
    </div>

    <!-- Table -->
    <div class="w-full border border-primary-border rounded-xl overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-primary-border">
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Client</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Account</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Symbol</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Type</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Volume</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">PnL</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Fee</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Status</th>
            <th class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Opened</th>
          </tr>
        </thead>

        <!-- Skeleton -->
        <tbody v-if="store.loading">
          <tr v-for="n in 8" :key="n" class="border-b border-primary-border animate-pulse">
            <td class="p-3">
              <div class="space-y-1.5">
                <div class="h-3 w-20 bg-card-background rounded" />
                <div class="h-2.5 w-28 bg-card-background rounded" />
              </div>
            </td>
            <td class="p-3"><div class="h-3 w-16 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-14 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-5 w-10 bg-card-background rounded-full" /></td>
            <td class="p-3"><div class="h-3 w-10 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-16 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-12 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-5 w-14 bg-card-background rounded-full" /></td>
            <td class="p-3 flex justify-end"><div class="h-3 w-20 bg-card-background rounded" /></td>
          </tr>
        </tbody>

        <!-- Empty -->
        <tbody v-else-if="store.records.length === 0">
          <tr>
            <td colspan="9" class="py-16 text-center">
              <div class="flex flex-col items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-card-background flex items-center justify-center">
                  <BarChart2 class="w-5 h-5 text-secondary-text" />
                </div>
                <p class="text-sm font-medium text-primary-text">No trades found</p>
                <p class="text-xs text-secondary-text">No trades recorded for this settlement</p>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Data -->
        <tbody v-else>
          <tr
            v-for="row in store.records"
            :key="row.trade_id"
            class="border-b border-primary-border last:border-none hover:bg-card-background transition-colors"
          >
            <td class="p-3">
              <p class="text-xs font-medium text-primary-text">{{ row.client.name ?? '—' }}</p>
              <p class="text-[11px] text-secondary-text">{{ row.client.email ?? '' }}</p>
            </td>

            <td class="p-3">
              <p class="text-xs text-primary-text">#{{ row.trading_account.account_number ?? '—' }}</p>
              <p class="text-[11px] text-secondary-text">{{ row.trading_account.broker ?? '' }}</p>
            </td>

            <td class="p-3 text-xs font-medium text-primary-text">{{ row.symbol ?? '—' }}</td>

            <td class="p-3">
              <span
                class="text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize"
                :class="row.order_type === 'buy'
                  ? 'bg-primary-green/50 text-green-800 border-green-200'
                  : 'bg-primary-red/50 text-red-800 border-red-200'"
              >
                {{ row.order_type ?? '—' }}
              </span>
            </td>

            <td class="p-3 text-xs text-primary-text tabular-nums">{{ row.lot?.toFixed(2) ?? '—' }}</td>

            <td class="p-3">
              <span class="text-xs font-medium tabular-nums" :class="row.pnl >= 0 ? 'text-green-700' : 'text-red-700'">
                {{ row.pnl >= 0 ? '+' : '' }}${{ formatNum(row.pnl) }}
              </span>
            </td>

            <td class="p-3 text-xs text-secondary-text tabular-nums">${{ formatNum(row.fee) }}</td>

            <td class="p-3">
              <span class="text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize" :class="statusClass(row.status)">
                {{ row.status ?? '—' }}
              </span>
            </td>

            <td class="p-3 text-xs text-secondary-text text-right">{{ formatDate(row.opened_at ?? row.created_at) }}</td>
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
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { BarChart2 } from 'lucide-vue-next'
import { useSettlementTradesStore } from '@/stores/settlements/settlementTrades'
import Pagination from '@/components/common/Pagination.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'

const store = useSettlementTradesStore()
const route = useRoute()
const settlementId = route.params.id

const handlePageChange = (page) => {
  store.setPage(page)
  store.fetchTrades(settlementId, true)
}

const formatNum = (val) => (val ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatDate = (val) => val ? new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const statusClass = (s) => ({
  closed:   'bg-background text-secondary-text border-primary-border',
  open:     'bg-primary-blue/50 text-blue-800 border-blue-200',
  pending:  'bg-yellow-50 text-yellow-800 border-yellow-200',
  cancelled:'bg-primary-red/50 text-red-800 border-red-200',
}[s] ?? 'bg-background text-secondary-text border-primary-border')

onMounted(() => store.fetchTrades(settlementId))
</script>