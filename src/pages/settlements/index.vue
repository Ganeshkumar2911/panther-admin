<template>
  <div class="px-4">

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <template v-if="store.loading">
        <div v-for="n in 3" :key="n" class="bg-card-background border border-primary-border rounded-xl p-4 animate-pulse space-y-2">
          <div class="h-3 w-24 bg-background rounded" />
          <div class="h-6 w-32 bg-background rounded" />
        </div>
      </template>
      <template v-else>
        <div class="bg-card-background border border-primary-border rounded-xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total Fees</p>
          <p class="text-2xl font-medium text-primary-text">${{ formatNum(store.summary.total_fees) }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Broker Net</p>
          <p class="text-2xl font-medium text-green-700">${{ formatNum(store.summary.broker_net) }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">IB Pool</p>
          <p class="text-2xl font-medium text-primary-text">${{ formatNum(store.summary.ib_pool) }}</p>
        </div>
      </template>
    </div>

    <!-- Filter bar -->
    <div class="flex items-center gap-3 mb-4">
      <BaseSelect
        :modelValue="store.pagination.per_page"
        :options="store.perPageOptions"
        placeholder="Per page..."
          class="w-28 sm:w-32"
        @update:modelValue="store.updatePerPage"
      />
    </div>

    <!-- Table -->
    <div class="w-full border border-primary-border rounded-xl overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-primary-border">
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">ID</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">FM</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Period</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Net Profit</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">- Fee</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">FM Share</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">IB's Share</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Broker Net</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Followers</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Trades Count</th>
            <th class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Status</th>
            <th class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Action</th>
          </tr>
        </thead>

        <!-- Skeleton -->
        <tbody v-if="store.loading">
          <tr v-for="n in 8" :key="n" class="border-b border-primary-border animate-pulse">
            <td class="p-3"><div class="h-3 w-10 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-24 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-28 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-16 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-14 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-14 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-12 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-14 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-10 bg-card-background rounded" /></td>
            <td class="p-3 flex justify-end"><div class="h-5 w-16 bg-card-background rounded-full" /></td>
            <td class="p-3 flex justify-end"><div class="h-5 w-14 bg-card-background rounded" /></td>
          </tr>
        </tbody>

        <!-- Empty -->
        <tbody v-else-if="!store.records || store.records.length === 0">
          <tr>
            <td colspan="12" class="py-16 text-center">
              <div class="flex flex-col items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-card-background flex items-center justify-center">
                  <ReceiptText class="w-5 h-5 text-secondary-text" />
                </div>
                <p class="text-sm font-medium text-primary-text">No settlements found</p>
                <p class="text-xs text-secondary-text">Try adjusting your filters</p>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Data -->
        <tbody v-else>
          <tr
            v-for="row in store.records"
            :key="row.settlement_id"
            class="border-b border-primary-border last:border-none hover:bg-card-background transition-colors"
          >
            <td class="p-3 text-xs font-medium text-primary-text">#{{ row.settlement_id }}</td>

            <td class="p-3">
              <p class="text-xs font-medium text-primary-text">{{ row.fm_name }}</p>
              <p class="text-[11px] text-secondary-text">ID {{ row.fm_id }}</p>
            </td>

            <td class="p-3 text-xs text-secondary-text">{{ row.period }}</td>

            <td class="p-3">
              <span class="text-xs font-medium tabular-nums" :class="row.net_profit >= 0 ? 'text-green-700' : 'text-red-700'">
                {{ row.net_profit >= 0 ? '+' : '' }}${{ formatNum(row.net_profit) }}
              </span>
            </td>

            <td class="p-3 text-xs text-primary-text tabular-nums">${{ formatNum(row.gross_fee) }}</td>

            <td class="p-3 text-xs text-primary-text tabular-nums">${{ formatNum(row.fm_share) }}</td>

            <td class="p-3 text-xs text-primary-text tabular-nums">${{ formatNum(row.ib_pool) }}</td>

            <td class="p-3 text-xs text-primary-text tabular-nums">${{ formatNum(row.broker_net) }}</td>

            <td class="p-3 text-xs text-secondary-text">{{ row.followers_count }}</td>

            <td class="p-3 text-xs text-secondary-text">{{ row.trades_count }}</td>

            <td class="p-3 text-right">
              <span class="text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize" :class="statusClass(row.status)">
                {{ row.status }}
              </span>
            </td>

            <td class="p-3 text-right">
              <button
                v-if="hasPermission('settlement.trades')"
                @click="goToTrade(row.settlement_id)"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-border text-xs text-secondary-text hover:text-primary-text hover:bg-background transition-colors ml-auto cursor-pointer"
              >
                <BarChart2 class="w-3.5 h-3.5" /> Trades
              </button>
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
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ReceiptText } from 'lucide-vue-next'
import { useSettlementsStore } from '@/stores/settlements/settlements'
import Pagination from '@/components/common/Pagination.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import { BarChart2 } from 'lucide-vue-next'
import { usePermissionCheck } from '@/composables/usePermissionCheck'

const router = useRouter()
const store = useSettlementsStore()
const { hasPermission } = usePermissionCheck()

const filters = ref({ fm_id: null, status: null, from_date: '', to_date: '' })

const statusOptions = [
  { label: 'Completed', value: 'completed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
]

const hasFilters = computed(() =>
  filters.value.fm_id || filters.value.status || filters.value.from_date || filters.value.to_date
)

const applyFilters = () => store.applyFilters(filters.value)

const clearFilters = () => {
  filters.value = { fm_id: null, status: null, from_date: '', to_date: '' }
  applyFilters()
}

const handlePageChange = (page) => {
  store.setPage(page)
  store.fetchSettlements(true)
}

const formatNum = (val) => (val ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const statusClass = (s) => ({
  completed: 'bg-primary-green/50 text-green-800 border-green-200',
  pending:   'bg-yellow-50 text-yellow-800 border-yellow-200',
  failed:    'bg-primary-red/50 text-red-800 border-red-200',
}[s] ?? 'bg-background text-secondary-text border-primary-border')

const goToTrade = (settlementId) => {
  router.push(`/settlement/trade/${settlementId}`)
}

onMounted(() => store.fetchSettlements())
</script>
