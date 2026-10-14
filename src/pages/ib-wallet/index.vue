<template>
  <div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6">
      <template v-if="store.loading">
        <div v-for="n in 4" :key="n" class="bg-card-background border border-primary-border rounded-xl p-3 sm:p-4 animate-pulse space-y-2 min-w-0">
          <div class="h-3 w-20 bg-background rounded" />
          <div class="h-5 sm:h-6 w-24 bg-background rounded" />
        </div>
      </template>
      <template v-else>
        <div class="bg-card-background border border-primary-border rounded-xl p-3 sm:p-4 min-w-0">
          <p class="text-[10px] sm:text-[11px] uppercase tracking-wide text-secondary-text mb-1 truncate" title="Total Records">Total Records</p>
          <p class="text-sm sm:text-lg lg:text-xl font-semibold sm:font-medium text-primary-text truncate" :title="String(store.summary.total_records ?? 0)">{{ store.summary.total_records ?? 0 }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-3 sm:p-4 min-w-0">
          <p class="text-[10px] sm:text-[11px] uppercase tracking-wide text-secondary-text mb-1 truncate" title="Total Affiliate Commission">Total Commission</p>
          <p class="text-sm sm:text-lg lg:text-xl font-semibold sm:font-medium text-green-700 truncate" :title="`+$${formatNum(store.summary.total_affiliate_commission)}`">+${{ formatNum(store.summary.total_affiliate_commission) }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-3 sm:p-4 min-w-0">
          <p class="text-[10px] sm:text-[11px] uppercase tracking-wide text-secondary-text mb-1 truncate" title="Total Withdrawal">Total Withdrawal</p>
          <p class="text-sm sm:text-lg lg:text-xl font-semibold sm:font-medium text-red-700 truncate" :title="`$${formatNum(store.summary.total_withdrawal)}`">${{ formatNum(store.summary.total_withdrawal) }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-3 sm:p-4 min-w-0">
          <p class="text-[10px] sm:text-[11px] uppercase tracking-wide text-secondary-text mb-1 truncate" title="Total IB Fee">Total IB Fee</p>
          <p class="text-sm sm:text-lg lg:text-xl font-semibold sm:font-medium text-primary-text truncate" :title="`$${formatNum(store.summary.total_ib_fee)}`">${{ formatNum(store.summary.total_ib_fee) }}</p>
        </div>
      </template>
    </div>

    <!-- Filters -->
    <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 mb-5">
      <div class="flex w-full min-w-0 flex-col gap-2 rounded-xl border border-primary-border bg-card-background/40 p-2 sm:flex-row sm:items-center xl:flex-1 xl:flex-nowrap">

        <!-- IB Filter -->
        <BaseSelect
          v-model="store.filters.user_id"
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

        <!-- Clear -->
        <button
          v-if="hasFilters"
          class="rounded-lg px-3 py-2 text-xs font-medium text-secondary-text hover:bg-background hover:text-primary-text transition-colors sm:flex-none cursor-pointer"
          @click="clearFilters"
        >
          Clear
        </button>

        
          <Tooltip text="Refresh List">
            <button
              class="p-2 rounded-lg border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
              @click="store.fetchIbWallet(true)"
              :disabled="store.loading"
              title="Refresh List"
            >
              <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': store.loading }" />
            </button>
          </Tooltip>
        
      </div>

      <!-- Update Ledger Action Button -->
      <button
        v-if="hasPermission('ib_wallet.update')"
        class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer self-start xl:self-auto shrink-0"
        @click="openUpdateLedgerDialog"
      >
        <Plus class="w-3.5 h-3.5" />
        Update IB Ledger
      </button>

    </div>

    <!-- Table -->
    <DataTable
      :data="store.data"
      :columns="columns"
      :loading="store.loading"
      :pagination="store.pagination"
      row-key="ledger_id"
      empty-title="No records found"
      empty-text="Try adjusting your filters"
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
    >
      <template #empty>
        <div class="flex flex-col items-center gap-3 py-16">
          <div class="w-12 h-12 rounded-full bg-card-background flex items-center justify-center">
            <Wallet class="w-5 h-5 text-secondary-text" />
          </div>
          <p class="text-sm font-medium text-primary-text">No records found</p>
          <p class="text-xs text-secondary-text">Try adjusting your filters</p>
        </div>
      </template>

      <!-- IB Name -->
      <template #cell-ib_name="{ row }">
        <div>
          <p class="text-xs font-medium text-primary-text">{{ row.ib_name ?? '—' }}</p>
          <p class="text-[11px] text-secondary-text">ID {{ row.ib_user_id }}</p>
        </div>
      </template>

      <!-- Type -->
      <template #cell-type="{ value }">
        <span class="text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize" :class="typeClass(value)">
          {{ formatType(value) }}
        </span>
      </template>

      <!-- Amount -->
      <template #cell-amount="{ value }">
        <span class="text-xs font-medium tabular-nums" :class="value >= 0 ? 'text-green-700' : 'text-red-700'">
          {{ value >= 0 ? '+' : '' }}${{ formatNum(Math.abs(value)) }}
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

      <!-- Reference -->
      <template #cell-reference_id="{ value }">
        <span class="text-xs text-secondary-text">{{ value ?? '—' }}</span>
      </template>

      <!-- Description -->
      <template #cell-description="{ value }">
        <span class="text-xs text-secondary-text max-w-[160px] truncate block" :title="parseDescription(value).text">
          {{ parseDescription(value).text }}
        </span>
      </template>

      <!-- Aff. comm. Date -->
      <template #cell-aff_comm_date="{ row }">
        <span class="text-xs text-secondary-text text-right block">
          {{ parseDescription(row.description).date ? formatDate(parseDescription(row.description).date) : '_' }}
        </span>
      </template>

      <!-- Date -->
      <template #cell-created_at="{ value }">
        <span class="text-xs text-secondary-text text-right block">
          {{ formatDate(value) }}
        </span>
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

<script setup>
import { onMounted, onBeforeUnmount, computed, ref } from 'vue'
import { Wallet, RotateCw, Plus } from 'lucide-vue-next'
import { useIbWalletStore } from '@/stores/ibLedger/ibLedger'
import DataTable from '@/components/common/DataTable/DataTable.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseDatePicker from '@/components/common/BaseDatePicker.vue'
import Tooltip from '@/components/common/Tooltip.vue'
import UpdateLedgerDialog from '@/components/ib-wallet/UpdateLedgerDialog.vue'
import { usePermissionCheck } from '@/composables/usePermissionCheck'

const store = useIbWalletStore()
const { hasPermission } = usePermissionCheck()
let ibSearchTimer = null

const columns = [
  { key: 'ib_name', label: 'IB Name', sortable: false },
  { key: 'type', label: 'Type', sortable: false },
  { key: 'amount', label: 'Amount', sortable: false },
  { key: 'balance_before', label: 'Bal. Before', sortable: false },
  { key: 'balance_after', label: 'Bal. After', sortable: false },
  { key: 'reference_id', label: 'Reference', sortable: false },
  { key: 'description', label: 'Description', sortable: false },
  { key: 'aff_comm_date', label: 'Aff. comm. Date', align: 'right', sortable: false },
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
  store.fetchIbWallet(true)
}

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
    applyFilters()
  },
})

const hasFilters = computed(() =>
  store.filters.user_id || store.filters.type || store.filters.from_date || store.filters.to_date
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

const parseDescription = (desc) => {
  if (!desc) return { text: '—', date: null }
  const dateRegex = /\b\d{4}-\d{2}-\d{2}\b/
  const match = desc.match(dateRegex)
  if (match) {
    const date = match[0]
    const text = desc.replace(dateRegex, '').replace(/\s+/g, ' ').trim()
    return { text: text || '—', date }
  }
  return { text: desc, date: null }
}

const typeClass = (type) => ({
  deposit:       'bg-primary-green/50 border-green-200',
  withdrawal:    'bg-primary-red/50 border-red-200',
  ib_commission: 'bg-primary-blue/50 border-blue-200',
  fm_fee:        'bg-yellow-50 text-yellow-800 border-yellow-200',
  broker_fee:    'bg-yellow-50 text-yellow-800 border-yellow-200',
  trade_pnl:     'bg-primary-blue/50 border-blue-200',
  commission:     'bg-primary-blue/50 border-blue-200',
  fee_paid:      'bg-yellow-50 text-yellow-800 border-yellow-200',
}[type] ?? 'bg-background text-secondary-text border-primary-border')

onMounted(() => store.fetchIbWallet())
onBeforeUnmount(() => clearTimeout(ibSearchTimer))
</script>
