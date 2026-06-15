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
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total Deposit</p>
          <p class="text-xl font-medium text-green-700">+${{ formatNum(store.summary.total_deposit) }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total Withdrawal</p>
          <p class="text-xl font-medium text-red-700">-${{ formatNum(store.summary.total_withdrawal) }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Trade PnL</p>
          <p class="text-xl font-medium" :class="store.summary.total_pnl >= 0 ? 'text-green-700' : 'text-red-700'">
            {{ store.summary.total_pnl >= 0 ? '+' : '' }}${{ formatNum(store.summary.total_pnl) }}
          </p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Fee Paid</p>
          <p class="text-xl font-medium text-primary-text">${{ formatNum(store.summary.total_fee_paid) }}</p>
        </div>
      </template>
    </div>

    <!-- Filters -->
    <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 mb-5">
      <div class="flex w-full min-w-0 flex-col gap-2 rounded-xl border border-primary-border bg-card-background/40 p-2 sm:flex-row sm:items-center xl:flex-1 xl:flex-nowrap">

        <!-- Client Filter -->
        <BaseSelect
          v-model="filters.client_id"
          :options="clientOptions"
          :isLoading="isSearchingClients"
          placeholder="All Clients"
          searchable
          class="w-full sm:w-40 xl:w-40"
          @update:modelValue="applyFilters"
          @search="onClientSearch"
        />

        <!-- Account Filter -->
        <BaseSelect
          v-model="filters.account_id"
          :options="accountOptions"
          :isLoading="isSearchingAccounts"
          placeholder="All Accounts"
          searchable
          class="w-full sm:w-44 xl:w-44"
          @update:modelValue="applyFilters"
          @search="onAccountSearch"
        />

        <!-- Type Filter -->
        <BaseSelect
          v-model="filters.type"
          :options="typeOptions"
          placeholder="All Types"
          class="w-full sm:w-36 xl:w-36"
          @update:modelValue="applyFilters"
        />

        <!-- Date range -->
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:w-[310px] xl:flex-none">
          <input
            v-model="filters.from_date"
            type="date"
            class="w-full px-3 py-2 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors"
            @change="applyDateFilters"
          />
          <input
            v-model="filters.to_date"
            type="date"
            class="w-full px-3 py-2 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors"
            @change="applyDateFilters"
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
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Client</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Account</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Type</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Amount</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Bal. Before</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Bal. After</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Description</th>
            <th class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Date</th>
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
            <td class="p-3"><div class="h-5 w-16 bg-card-background rounded-full" /></td>
            <td class="p-3"><div class="h-3 w-14 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-16 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-16 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-32 bg-card-background rounded" /></td>
            <td class="p-3 flex justify-end"><div class="h-3 w-20 bg-card-background rounded" /></td>
          </tr>
        </tbody>

        <!-- Empty -->
        <tbody v-else-if="store.data.length === 0">
          <tr>
            <td colspan="8" class="py-16 text-center">
              <div class="flex flex-col items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-card-background flex items-center justify-center">
                  <BookOpen class="w-5 h-5 text-secondary-text" />
                </div>
                <p class="text-sm font-medium text-primary-text">No ledger entries found</p>
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
            <td class="p-3">
              <p class="text-xs font-medium text-primary-text">{{ entry.client_name }}</p>
              <p class="text-[11px] text-secondary-text">{{ entry.client_email }}</p>
            </td>

            <td class="p-3">
              <p class="text-xs text-primary-text">#{{ entry.account_number }}</p>
              <p class="text-[11px] text-secondary-text">{{ entry.broker_label ?? '—' }}</p>
            </td>

            <td class="p-3">
              <span class="text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize" :class="typeClass(entry.type)">
                {{ formatType(entry.type) }}
              </span>
            </td>

            <td class="p-3">
              <span class="text-xs font-medium tabular-nums" :class="amountClass(entry.type, entry.amount)">
                {{ entry.amount >= 0 ? '+' : '' }}${{ formatNum(Math.abs(entry.amount)) }}
              </span>
            </td>

            <td class="p-3 text-xs text-secondary-text tabular-nums">${{ formatNum(entry.balance_before) }}</td>
            <td class="p-3 text-xs text-primary-text tabular-nums">${{ formatNum(entry.balance_after) }}</td>

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
import { onMounted, ref, computed } from 'vue'
import { BookOpen } from 'lucide-vue-next'
import { useClientLedgerStore } from '@/stores/clientLedger/clientLedger'
import Pagination from '@/components/common/Pagination.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'

const store = useClientLedgerStore()

const filters = ref({ client_id: null, account_id: null, type: null, from_date: '', to_date: '' })
const clientOptions = ref([])
const accountOptions = ref([])
const isSearchingClients = ref(false)
const isSearchingAccounts = ref(false)
let clientSearchTimer = null
let accountSearchTimer = null

const typeOptions = computed(() =>
  (store.filterOptions.types ?? []).map((t) => ({ label: formatType(t), value: t }))
)

const onClientSearch = (query) => {
  if (!query.trim()) {
    clientOptions.value = (store.filterOptions.clients ?? []).map((c) => ({ label: c.name, value: c.id }))
    return
  }

  clearTimeout(clientSearchTimer)
  isSearchingClients.value = true

  clientSearchTimer = setTimeout(async () => {
    try {
      const results = await store.fetchAllClients(query)
      clientOptions.value = results
    } catch (err) {
      clientOptions.value = []
    } finally {
      isSearchingClients.value = false
    }
  }, 300)
}

const onAccountSearch = (query) => {
  if (!query.trim()) {
    accountOptions.value = (store.filterOptions.accounts ?? []).map((a) => ({ label: `#${a.account_number} · ${a.broker_label ?? ''}`.trim(), value: a.id }))
    return
  }

  clearTimeout(accountSearchTimer)
  isSearchingAccounts.value = true

  accountSearchTimer = setTimeout(async () => {
    try {
      const results = await store.fetchAllAccounts(query, filters.value.client_id)
      accountOptions.value = results
    } catch (err) {
      accountOptions.value = []
    } finally {
      isSearchingAccounts.value = false
    }
  }, 300)
}

onMounted(() => {
  clientOptions.value = (store.filterOptions.clients ?? []).map((c) => ({ label: c.name, value: c.id }))
  accountOptions.value = (store.filterOptions.accounts ?? []).map((a) => ({ label: `#${a.account_number} · ${a.broker_label ?? ''}`.trim(), value: a.id }))
  // Initialize local filters from store to maintain state
  filters.value = { ...store.filters }
  store.fetchLedger()
})

const hasFilters = computed(() =>
  filters.value.client_id || filters.value.account_id || filters.value.type || filters.value.from_date || filters.value.to_date
)

const hasCompleteDateRange = () => filters.value.from_date && filters.value.to_date
const hasEmptyDateRange = () => !filters.value.from_date && !filters.value.to_date

const getApplicableFilters = () => {
  const nextFilters = { ...filters.value }

  if (!hasCompleteDateRange()) {
    nextFilters.from_date = ''
    nextFilters.to_date = ''
  }

  return nextFilters
}

const applyFilters = () => {
  Object.assign(store.filters, getApplicableFilters())
  store.applyFilters()
}

const applyDateFilters = () => {
  if (hasCompleteDateRange() || hasEmptyDateRange()) {
    applyFilters()
  }
}

const clearFilters = () => {
  filters.value = { client_id: null, account_id: null, type: null, from_date: '', to_date: '' }
  applyFilters()
}

const handlePageChange = (page) => {
  store.setPage(page)
}

const formatNum = (val) => (val ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatDate = (val) => new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
const formatType = (t) => t?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ?? '—'

const typeClass = (type) => ({
  deposit:    'bg-primary-green/50 border-green-200',
  withdrawal: 'bg-primary-red/50 border-red-200',
  trade_pnl:  'bg-primary-blue/50 border-blue-200',
  fee_paid:   'bg-yellow-50 border-yellow-200',
}[type] ?? 'bg-background text-secondary-text border-primary-border')

const amountClass = (type, amount) => {
  if (type === 'deposit') return 'text-green-700'
  if (type === 'withdrawal') return 'text-red-700'
  if (type === 'trade_pnl') return amount >= 0 ? 'text-green-700' : 'text-red-700'
  return 'text-secondary-text'
}

</script>
