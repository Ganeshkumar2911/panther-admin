<script setup>
import { onMounted, computed, ref } from 'vue'
import { BookOpen, RefreshCw, Plus } from 'lucide-vue-next'
import { useFmLedgerStore } from '@/stores/fmLedger/fmLedger'
import DataTable from '@/components/common/DataTable/DataTable.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseDatePicker from '@/components/common/BaseDatePicker.vue'
import Tooltip from '@/components/common/Tooltip.vue'
import UpdateLedgerDialog from '@/components/fm-wallet/UpdateLedgerDialog.vue'
import { usePermissionCheck } from '@/composables/usePermissionCheck'

const store = useFmLedgerStore()
const { hasPermission } = usePermissionCheck()

const columns = [
  { key: 'fm_name', label: 'FM Name', sortable: false },
  { key: 'account', label: 'Account', sortable: false },
  { key: 'account_role', label: 'Role', sortable: false },
  { key: 'type', label: 'Type', sortable: false },
  { key: 'amount', label: 'Amount', sortable: false },
  { key: 'balance_before', label: 'Bal. Before', sortable: false },
  { key: 'balance_after', label: 'Bal. After', sortable: false },
  { key: 'description', label: 'Description', sortable: false },
  { key: 'created_at', label: 'Date', align: 'right', sortable: false },
]

const handlePerPageChange = (perPage) => {
  store.updatePerPage(perPage)
}

const updateLedgerDialogOpen = ref(false)

const openUpdateLedgerDialog = () => {
  updateLedgerDialogOpen.value = true
}

const closeUpdateLedgerDialog = () => {
  updateLedgerDialogOpen.value = false
}

const handleUpdateSuccess = () => {
  store.fetchLedger(true)
}

const isLoading = computed(() => store.loading)
let fmSearchTimer = null

const typeOptions = computed(() =>
  (store.filterOptions.types ?? []).map((t) => ({ label: formatType(t), value: t }))
)

const sourceOptions = computed(() => {
  if (store.filterOptions.sources?.length) {
    return store.filterOptions.sources.map((s) => ({ label: formatType(s), value: s }))
  }
  return [
    { label: 'Account', value: 'account' },
    { label: 'Wallet', value: 'wallet' },
  ]
})

const onFmSearch = (query) => {
  clearTimeout(fmSearchTimer)

  if (!query.trim()) {
    store.searchFm('')
    return
  }

  fmSearchTimer = setTimeout(() => {
    store.searchFm(query).catch(() => {})
  }, 300)
}

const dateRangeValue = computed({
  get() {
    if (store.filters.from_date || store.filters.to_date) {
      return {
        start: store.filters.from_date || null,
        end: store.filters.to_date || null,
      }
    }
    return null
  },
  set(val) {
    if (!val) {
      store.filters.from_date = ''
      store.filters.to_date = ''
    } else if (Array.isArray(val)) {
      store.filters.from_date = val[0] || ''
      store.filters.to_date = val[1] || ''
    } else if (typeof val === 'object') {
      store.filters.from_date = val.start || val.from || ''
      store.filters.to_date = val.end || val.to || ''
    }
    applyDateFilters()
  },
})

const hasFilters = computed(() =>
  store.filters.fm_id || (store.filters.source && store.filters.source !== 'account') || store.filters.type || store.filters.from_date || store.filters.to_date
)

const hasCompleteDateRange = () => store.filters.from_date && store.filters.to_date
const hasEmptyDateRange = () => !store.filters.from_date && !store.filters.to_date

const applyFilters = () => {
  store.applyFilters()
}

const applyDateFilters = () => {
  if (hasCompleteDateRange() || hasEmptyDateRange()) {
    applyFilters()
  }
}

const clearFilters = () => {
  Object.assign(store.filters, { fm_id: null, source: 'account', type: null, from_date: '', to_date: '' })
  applyFilters()
}

const handlePageChange = (page) => {
  store.setPage(page)
  store.fetchLedger(true)
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

onMounted(() => {
  if (!store.filters.source) {
    store.filters.source = 'account'
  }
  store.fetchLedger(true)
})
</script>

<template>
  <div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6">
      <template v-if="isLoading">
        <div v-for="n in 4" :key="n" class="bg-card-background border border-primary-border rounded-xl p-3 sm:p-4 animate-pulse space-y-2 min-w-0">
          <div class="h-3 w-20 bg-background rounded" />
          <div class="h-5 sm:h-6 w-24 bg-background rounded" />
        </div>
      </template>
      <template v-else>
        <div class="bg-card-background border border-primary-border rounded-xl p-3 sm:p-4 min-w-0">
          <p class="text-[10px] sm:text-[11px] uppercase tracking-wide text-secondary-text mb-1 truncate" title="Total Deposit">Total Deposit</p>
          <p class="text-sm sm:text-lg lg:text-xl font-semibold sm:font-medium text-green-700 truncate" :title="`+$${formatNum(store.summary.total_deposit)}`">+${{ formatNum(store.summary.total_deposit) }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-3 sm:p-4 min-w-0">
          <p class="text-[10px] sm:text-[11px] uppercase tracking-wide text-secondary-text mb-1 truncate" title="Total Withdrawal">Total Withdrawal</p>
          <p class="text-sm sm:text-lg lg:text-xl font-semibold sm:font-medium text-red-700 truncate" :title="`-$${formatNum(store.summary.total_withdrawal)}`">-${{ formatNum(store.summary.total_withdrawal) }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-3 sm:p-4 min-w-0">
          <p class="text-[10px] sm:text-[11px] uppercase tracking-wide text-secondary-text mb-1 truncate" title="Trade PnL">Trade PnL</p>
          <p
            class="text-sm sm:text-lg lg:text-xl font-semibold sm:font-medium truncate"
            :class="store.summary.total_pnl >= 0 ? 'text-green-700' : 'text-red-700'"
            :title="`${store.summary.total_pnl >= 0 ? '+' : ''}$${formatNum(store.summary.total_pnl)}`"
          >
            {{ store.summary.total_pnl >= 0 ? '+' : '' }}${{ formatNum(store.summary.total_pnl) }}
          </p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-3 sm:p-4 min-w-0">
          <p class="text-[10px] sm:text-[11px] uppercase tracking-wide text-secondary-text mb-1 truncate" title="Total FM Fee">Total FM Fee</p>
          <p class="text-sm sm:text-lg lg:text-xl font-semibold sm:font-medium text-primary-text truncate" :title="`$${formatNum(store.summary.total_fm_fee)}`">${{ formatNum(store.summary.total_fm_fee) }}</p>
        </div>
      </template>
    </div>

    <!-- Filters -->
    <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 mb-5">
      <div class="flex w-full min-w-0 flex-col gap-2 rounded-xl border border-primary-border bg-card-background/40 p-2 sm:flex-row sm:items-center xl:flex-1 xl:flex-nowrap">

        <!-- FM Filter -->
        <BaseSelect
          v-model="store.filters.fm_id"
          :options="store.fmOptions"
          :isLoading="store.fmSearchLoading"
          placeholder="Search FM..."
          searchable
          class="w-full sm:w-52 xl:w-52"
          @search="onFmSearch"
          @update:modelValue="applyFilters"
        />

        <!-- Source Filter -->
        <BaseSelect
          v-model="store.filters.source"
          :options="sourceOptions"
          placeholder="Select Source"
          class="w-full sm:w-36 xl:w-36"
          @update:modelValue="applyFilters"
        />

        <!-- Type Filter -->
        <BaseSelect
          v-model="store.filters.type"
          :options="typeOptions"
          placeholder="All Types"
          class="w-full sm:w-36 xl:w-36"
          @update:modelValue="applyFilters"
        />

        <!-- Date range -->
        <BaseDatePicker
          v-model="dateRangeValue"
          :range="true"
          placeholder="Filter by date range..."
          class="w-full sm:w-60 xl:w-64"
        />

        <BaseSelect
          :modelValue="store.pagination.per_page"
          :options="store.perPageOptions"
          placeholder="Per Page"
          class="w-full sm:w-28 xl:w-28"
          @update:modelValue="store.updatePerPage"
        />

 <Tooltip text="Refresh" position="right">
          <button
            type="button"
            :disabled="store.loading"
            class="inline-flex items-center justify-center rounded-lg border border-primary-border p-1.5 text-secondary-text transition-colors hover:text-primary-text hover:bg-background disabled:opacity-60 disabled:cursor-not-allowed"
            @click="
              ()=>{
                store.fetchLedger(true)
              }
            "
          >
      <RefreshCw
      class="h-3.5 w-3.5"
      :class="{ 'animate-spin': store.loading }"
      />
      
    </button>
  </Tooltip>
        <!-- Clear -->
        <button
          v-if="hasFilters"
          class="rounded-lg px-3 py-2 text-xs font-medium text-secondary-text hover:bg-background hover:text-primary-text transition-colors sm:flex-none cursor-pointer"
          @click="clearFilters"
        >
          Clear
        </button>
      </div>

      <!-- Update Ledger Action Button -->
      <button
        v-if="hasPermission('fund_manager.update')"
        class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer self-start xl:self-auto shrink-0"
        @click="openUpdateLedgerDialog"
      >
        <Plus class="w-3.5 h-3.5" />
        Update FM Ledger
      </button>
    </div>

    <!-- Table -->
    <DataTable
      :data="store.data"
      :columns="columns"
      :loading="isLoading"
      :pagination="store.pagination"
      row-key="ledger_id"
      empty-title="No ledger entries found"
      empty-text="Try adjusting your filters"
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
    >
      <template #empty>
        <div class="flex flex-col items-center gap-3 py-16">
          <div class="w-12 h-12 rounded-full bg-card-background flex items-center justify-center">
            <BookOpen class="w-5 h-5 text-secondary-text" />
          </div>
          <p class="text-sm font-medium text-primary-text">No ledger entries found</p>
          <p class="text-xs text-secondary-text">Try adjusting your filters</p>
        </div>
      </template>

      <!-- FM Name -->
      <template #cell-fm_name="{ value }">
        <span class="text-xs font-medium text-primary-text">{{ value }}</span>
      </template>

      <!-- Account -->
      <template #cell-account="{ row }">
        <div>
          <p class="text-xs text-primary-text">#{{ row.account_number }}</p>
          <p class="text-[11px] text-secondary-text">ID {{ row.account_id }}</p>
        </div>
      </template>

      <!-- Role -->
      <template #cell-account_role="{ value }">
        <span
          class="text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize"
          :class="value === 'master'
            ? 'bg-primary-blue/50 border-blue-200'
            : 'bg-background text-secondary-text border-primary-border'"
        >
          {{ value ?? '—' }}
        </span>
      </template>

      <!-- Type -->
      <template #cell-type="{ value }">
        <span class="text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize" :class="typeClass(value)">
          {{ formatType(value) }}
        </span>
      </template>

      <!-- Amount -->
      <template #cell-amount="{ row }">
        <span class="text-xs font-medium tabular-nums" :class="amountClass(row.type, row.amount)">
          {{ row.amount >= 0 ? '+' : '' }}${{ formatNum(Math.abs(row.amount)) }}
        </span>
      </template>

      <!-- Bal. Before -->
      <template #cell-balance_before="{ value }">
        <span class="text-xs text-secondary-text tabular-nums">${{ formatNum(value) }}</span>
      </template>

      <!-- Bal. After -->
      <template #cell-balance_after="{ value }">
        <span class="text-xs text-primary-text tabular-nums">${{ formatNum(value) }}</span>
      </template>

      <!-- Description -->
      <template #cell-description="{ value }">
        <div class="max-w-[180px]">
          <Tooltip
            v-if="value"
            :text="value"
            position="top"
            maxWidth="320px"
            block
          >
            <span class="block truncate text-secondary-text cursor-default">
              {{ value }}
            </span>
          </Tooltip>
          <span v-else class="text-xs text-secondary-text">—</span>
        </div>
      </template>

      <!-- Date -->
      <template #cell-created_at="{ value }">
        <span class="text-xs text-secondary-text text-right block">{{ formatDate(value) }}</span>
      </template>
    </DataTable>

    <!-- Update Ledger Dialog -->
    <UpdateLedgerDialog
      :open="updateLedgerDialogOpen"
      @close="closeUpdateLedgerDialog"
      @success="handleUpdateSuccess"
    />

  </div>
</template>
