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
          <p class="text-[10px] sm:text-[11px] uppercase tracking-wide text-secondary-text mb-1 truncate" title="Total Earnings">Total Earnings</p>
          <p class="text-sm sm:text-lg lg:text-xl font-semibold sm:font-medium text-green-700 truncate" :title="`+$${formatNum(store.summary.total_earnings)}`">+${{ formatNum(store.summary.total_earnings) }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-3 sm:p-4 min-w-0">
          <p class="text-[10px] sm:text-[11px] uppercase tracking-wide text-secondary-text mb-1 truncate" title="Broker Fee">Broker Fee</p>
          <p class="text-sm sm:text-lg lg:text-xl font-semibold sm:font-medium text-primary-text truncate" :title="`$${formatNum(store.summary.total_broker_fee)}`">${{ formatNum(store.summary.total_broker_fee) }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-3 sm:p-4 min-w-0">
          <p class="text-[10px] sm:text-[11px] uppercase tracking-wide text-secondary-text mb-1 truncate" title="Platform Earning">Platform Earning</p>
          <p class="text-sm sm:text-lg lg:text-xl font-semibold sm:font-medium text-primary-text truncate" :title="`$${formatNum(store.summary.total_platform_earning)}`">${{ formatNum(store.summary.total_platform_earning) }}</p>
        </div>
      </template>
    </div>

    <!-- Filters -->
    <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 mb-5">
      <div class="flex w-full min-w-0 flex-col gap-2 rounded-xl border border-primary-border bg-card-background/40 p-2 sm:flex-row sm:items-center xl:flex-1 xl:flex-nowrap">

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
                store.fetchAdminLedger(true)
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
          class="rounded-lg px-3 py-2 text-xs font-medium text-secondary-text hover:bg-background hover:text-primary-text transition-colors sm:flex-none"
          @click="clearFilters"
        >
          Clear
        </button>
      </div>
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
            <BookOpen class="w-5 h-5 text-secondary-text" />
          </div>
          <p class="text-sm font-medium text-primary-text">No records found</p>
          <p class="text-xs text-secondary-text">Try adjusting your filters</p>
        </div>
      </template>

      <!-- ID -->
      <template #cell-ledger_id="{ value }">
        <span class="text-xs font-medium text-primary-text">{{ value }}</span>
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
        <span class="text-xs text-secondary-text max-w-[180px] truncate block" :title="value ?? ''">
          {{ value ?? '—' }}
        </span>
      </template>

      <!-- Date -->
      <template #cell-created_at="{ value }">
        <span class="text-xs text-secondary-text text-right block">{{ formatDate(value) }}</span>
      </template>
    </DataTable>

  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { BookOpen, RefreshCw } from 'lucide-vue-next'
import { useAdminLedgerStore } from '@/stores/adminLedger/adminLedger'
import DataTable from '@/components/common/DataTable/DataTable.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseDatePicker from '@/components/common/BaseDatePicker.vue'

const store = useAdminLedgerStore()

const columns = [
  { key: 'ledger_id', label: 'ID', sortable: false },
  { key: 'type', label: 'Type', sortable: false },
  { key: 'amount', label: 'Amount', sortable: false },
  { key: 'balance_before', label: 'Bal. Before', sortable: false },
  { key: 'balance_after', label: 'Bal. After', sortable: false },
  { key: 'reference_id', label: 'Reference', sortable: false },
  { key: 'description', label: 'Description', sortable: false },
  { key: 'created_at', label: 'Date', align: 'right', sortable: false },
]

const handlePerPageChange = (perPage) => {
  store.updatePerPage(perPage)
}

const typeOptions = computed(() =>
  (store.filterOptions?.types ?? []).map((t) => ({ label: formatType(t), value: t }))
)

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
  store.filters.type || store.filters.from_date || store.filters.to_date
)

const applyFilters = () => store.setFilters({ ...store.filters })

const clearFilters = () => store.resetFilters()

const handlePageChange = (page) => {
  store.setPage(page)
  store.fetchAdminLedger(true)
}

const formatNum = (val) => (val ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatDate = (val) => val ? new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const formatType = (t) => t?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ?? '—'

const typeClass = (type) => ({
  broker_fee:       'bg-primary-blue/50 border-blue-200',
  platform_earning: 'bg-primary-green/50 border-green-200',
}[type] ?? 'bg-background text-secondary-text border-primary-border')

onMounted(() => store.fetchAdminLedger())
</script>
