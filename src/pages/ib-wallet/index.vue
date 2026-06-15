<template>
  <div class="px-4">

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <template v-if="store.loading">
        <div v-for="n in 5" :key="n" class="bg-card-background border border-primary-border rounded-xl p-4 animate-pulse space-y-2">
          <div class="h-3 w-24 bg-background rounded" />
          <div class="h-6 w-28 bg-background rounded" />
        </div>
      </template>
      <template v-else>
        <div class="bg-card-background border border-primary-border rounded-xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total Records</p>
          <p class="text-2xl font-medium text-primary-text">{{ store.summary.total_records ?? 0 }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total Deposit</p>
          <p class="text-2xl font-medium text-green-700">+${{ formatNum(store.summary.total_deposit) }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total Withdrawal</p>
          <p class="text-2xl font-medium text-red-700">-${{ formatNum(store.summary.total_withdrawal) }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total IB Fee</p>
          <p class="text-2xl font-medium text-primary-text">${{ formatNum(store.summary.total_ib_fee) }}</p>
        </div>
        <!-- <div class="bg-card-background border border-primary-border rounded-xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Fee Paid</p>
          <p class="text-2xl font-medium text-primary-text">${{ formatNum(store.summary.total_fee_paid) }}</p>
        </div> -->
      </template>
    </div>

    <!-- Filters -->
    <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 mb-5">
      <div class="flex w-full min-w-0 flex-col gap-2 rounded-xl border border-primary-border bg-card-background/40 p-2 sm:flex-row sm:items-center xl:flex-1 xl:flex-nowrap">

        <!-- IB Filter -->
        <BaseSelect
          v-model="store.filters.ib_id"
          :options="store.ibOptions"
          :isLoading="store.searchLoading"
          placeholder="Search IB..."
          searchable
          class="w-full sm:w-52 xl:w-52"
          @search="onIbSearch"
          @update:modelValue="applyFilters"
        />

        <!-- Type Filter -->
        <BaseSelect
          v-model="store.filters.type"
          :options="typeOptions"
          placeholder="All Types"
          class="w-full sm:w-40 xl:w-40"
          @update:modelValue="applyFilters"
        />

        <!-- Date range -->
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:w-[310px] xl:flex-none">
          <input
            v-model="store.filters.from_date"
            type="date"
            class="w-full px-3 py-2 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors"
            @change="applyFilters"
          />
          <input
            v-model="store.filters.to_date"
            type="date"
            class="w-full px-3 py-2 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors"
            @change="applyFilters"
          />
        </div>

        <!-- Clear -->
        <button
          v-if="hasFilters"
          class="rounded-lg px-3 py-2 text-xs font-medium text-secondary-text hover:bg-background hover:text-primary-text transition-colors sm:flex-none"
          @click="clearFilters"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="w-full border border-primary-border rounded-xl overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-primary-border">
            <!-- <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">ID</th> -->
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">IB Name</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Type</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Amount</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Bal. Before</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Bal. After</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Reference</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Description</th>
            <th class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Date</th>
          </tr>
        </thead>

        <!-- Skeleton -->
        <tbody v-if="store.loading">
          <tr v-for="n in 8" :key="n" class="border-b border-primary-border animate-pulse">
            <td class="p-3"><div class="h-3 w-10 bg-card-background rounded" /></td>
            <td class="p-3">
              <div class="space-y-1.5">
                <div class="h-3 w-20 bg-card-background rounded" />
                <div class="h-2.5 w-10 bg-card-background rounded" />
              </div>
            </td>
            <td class="p-3"><div class="h-5 w-20 bg-card-background rounded-full" /></td>
            <td class="p-3"><div class="h-3 w-14 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-16 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-16 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-20 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-32 bg-card-background rounded" /></td>
            <td class="p-3 flex justify-end"><div class="h-3 w-20 bg-card-background rounded" /></td>
          </tr>
        </tbody>

        <!-- Empty -->
        <tbody v-else-if="store.data.length === 0">
          <tr>
            <td colspan="9" class="py-16 text-center">
              <div class="flex flex-col items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-card-background flex items-center justify-center">
                  <Wallet class="w-5 h-5 text-secondary-text" />
                </div>
                <p class="text-sm font-medium text-primary-text">No records found</p>
                <p class="text-xs text-secondary-text">Try adjusting your filters</p>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Data -->
        <tbody v-else>
          <tr
            v-for="entry in store.data"
            :key="entry.ledger_id"
            class="border-b border-primary-border last:border-none hover:bg-card-background transition-colors"
          >
            <!-- <td class="p-3 text-xs font-medium text-primary-text">{{ entry.ledger_id }}</td> -->

            <td class="p-3">
              <p class="text-xs font-medium text-primary-text">{{ entry.ib_name ?? '—' }}</p>
              <p class="text-[11px] text-secondary-text">ID {{ entry.ib_user_id }}</p>
            </td>

            <td class="p-3">
              <span class="text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize" :class="typeClass(entry.type)">
                {{ formatType(entry.type) }}
              </span>
            </td>

            <td class="p-3">
              <span class="text-xs font-medium tabular-nums" :class="entry.amount >= 0 ? 'text-green-700' : 'text-red-700'">
                {{ entry.amount >= 0 ? '+' : '' }}${{ formatNum(Math.abs(entry.amount)) }}
              </span>
            </td>

            <td class="p-3 text-xs text-secondary-text tabular-nums">${{ formatNum(entry.balance_before) }}</td>
            <td class="p-3 text-xs text-primary-text tabular-nums">${{ formatNum(entry.balance_after) }}</td>

            <td class="p-3 text-xs text-secondary-text">{{ entry.reference_id ?? '—' }}</td>

            <td class="p-3 text-xs text-secondary-text max-w-[160px] truncate">{{ entry.description ?? '—' }}</td>

            <td class="p-3 text-xs text-secondary-text text-right">{{ formatDate(entry.created_at) }}</td>
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
import { onMounted, onBeforeUnmount, computed } from 'vue'
import { Wallet } from 'lucide-vue-next'
import { useIbWalletStore } from '@/stores/ibLedger/ibLedger'
import Pagination from '@/components/common/Pagination.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'

const store = useIbWalletStore()
let ibSearchTimer = null

const typeOptions = computed(() =>
  (store.filterOptions?.types ?? []).map((t) => ({ label: formatType(t), value: t }))
)

const onIbSearch = (query) => {
  clearTimeout(ibSearchTimer)

  if (!query.trim()) {
    store.searchIbs('')
    return
  }

  ibSearchTimer = setTimeout(() => {
    store.searchIbs(query).catch(() => {})
  }, 300)
}

const hasFilters = computed(() =>
  store.filters.ib_id || store.filters.type || store.filters.from_date || store.filters.to_date
)

const applyFilters = () => {
  store.setFilters({ ...store.filters })
}

const clearFilters = () => {
  store.resetFilters()
}

const handlePageChange = (page) => {
  store.setPage(page)
  store.fetchIbWallet(true)
}

const formatNum = (val) => (val ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatDate = (val) => val ? new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const formatType = (t) => t?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ?? '—'

const typeClass = (type) => ({
  deposit:       'bg-primary-green/50 border-green-200',
  withdrawal:    'bg-primary-red/50 border-red-200',
  ib_commission: 'bg-primary-blue/50 border-blue-200',
  fm_fee:        'bg-yellow-50 text-yellow-800 border-yellow-200',
  broker_fee:    'bg-yellow-50 text-yellow-800 border-yellow-200',
  trade_pnl:     'bg-primary-blue/50 border-blue-200',
  fee_paid:      'bg-yellow-50 text-yellow-800 border-yellow-200',
}[type] ?? 'bg-background text-secondary-text border-primary-border')

onMounted(() => store.fetchIbWallet())
onBeforeUnmount(() => clearTimeout(ibSearchTimer))
</script>
