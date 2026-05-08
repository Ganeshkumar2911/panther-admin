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
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total Records</p>
          <p class="text-2xl font-medium text-primary-text">{{ store.summary.total_records ?? 0 }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total Earnings</p>
          <p class="text-2xl font-medium text-green-700">+${{ formatNum(store.summary.total_earnings) }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Broker Fee</p>
          <p class="text-2xl font-medium text-primary-text">${{ formatNum(store.summary.total_broker_fee) }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Platform Earning</p>
          <p class="text-2xl font-medium text-primary-text">${{ formatNum(store.summary.total_platform_earning) }}</p>
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
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">ID</th>
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
            <td class="p-3"><div class="h-5 w-24 bg-card-background rounded-full" /></td>
            <td class="p-3"><div class="h-3 w-16 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-16 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-16 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-24 bg-card-background rounded" /></td>
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
            <td class="p-3 text-xs font-medium text-primary-text">{{ entry.ledger_id }}</td>

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
            <td class="p-3 text-xs text-secondary-text max-w-[180px] truncate">{{ entry.description ?? '—' }}</td>
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
import { onMounted, computed } from 'vue'
import { BookOpen } from 'lucide-vue-next'
import { useAdminLedgerStore } from '@/stores/adminLedger/adminLedger'
import Pagination from '@/components/common/Pagination.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'

const store = useAdminLedgerStore()

const typeOptions = computed(() =>
  (store.filterOptions?.types ?? []).map((t) => ({ label: formatType(t), value: t }))
)

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
  broker_fee:       'bg-blue-50 text-blue-800 border-blue-200',
  platform_earning: 'bg-green-50 text-green-800 border-green-200',
}[type] ?? 'bg-background text-secondary-text border-primary-border')

onMounted(() => store.fetchAdminLedger())
</script>
