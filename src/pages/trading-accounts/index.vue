<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { BarChart2, Wallet as WalletIcon } from 'lucide-vue-next'
import { useAccountsStore } from '@/stores/tradingAccounts/tradingAccounts'
import Pagination from '@/components/common/Pagination.vue'

const store = useAccountsStore()
const router = useRouter()

const tabs = [
  { label: 'All', value: 'all' },
  { label: 'Client', value: 'client' },
  { label: 'FM', value: 'fm' },
]
const activeTab = ref('all')

const switchTab = (val) => {
  if (activeTab.value === val) return

  activeTab.value = val
  store.setType(val)
}

const handlePageChange = (page) => {
  store.setPage(page)
}

const formatNum = (val) => (val ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatDate = (val) => new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

onMounted(() => store.fetchAccounts())
</script>

<template>
  <div class="px-4">

    <!-- Tabs -->
    <div class="flex items-center gap-1 bg-card-background border border-primary-border rounded-lg p-1 w-fit mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="px-4 py-1.5 rounded-md text-xs font-medium transition-colors"
        :class="activeTab === tab.value ? 'bg-primary text-black' : 'text-secondary-text hover:text-primary-text'"
        @click="switchTab(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

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
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total Accounts</p>
          <p class="text-2xl font-medium text-primary-text">{{ store.summary.total_accounts ?? 0 }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total Balance</p>
          <p class="text-2xl font-medium text-primary-text">${{ formatNum(store.summary.total_balance) }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total PnL</p>
          <p class="text-2xl font-medium" :class="store.summary.total_pnl >= 0 ? 'text-green-700' : 'text-red-700'">
            {{ store.summary.total_pnl >= 0 ? '+' : '' }}${{ formatNum(store.summary.total_pnl) }}
          </p>
        </div>
      </template>
    </div>

    <!-- Table -->
    <div class="w-full border border-primary-border rounded-xl overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-primary-border">
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Account</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Type</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Role</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Broker</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Balance</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">PnL</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Created</th>
            <th class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Action</th>
          </tr>
        </thead>

        <!-- Skeleton -->
        <tbody v-if="store.loading">
          <tr v-for="n in 6" :key="n" class="border-b border-primary-border animate-pulse">
            <td class="p-3"><div class="h-3 w-24 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-5 w-14 bg-card-background rounded-full" /></td>
            <td class="p-3"><div class="h-5 w-16 bg-card-background rounded-full" /></td>
            <td class="p-3"><div class="h-3 w-10 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-16 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-16 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-20 bg-card-background rounded" /></td>
            <td class="p-3 flex justify-end"><div class="h-7 w-20 bg-card-background rounded-lg" /></td>
          </tr>
        </tbody>

        <!-- Empty -->
        <tbody v-else-if="store.data.length === 0">
          <tr>
            <td colspan="8" class="py-16 text-center">
              <div class="flex flex-col items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-card-background flex items-center justify-center">
                  <WalletIcon class="w-5 h-5 text-secondary-text" />
                </div>
                <p class="text-sm font-medium text-primary-text">No accounts found</p>
                <p class="text-xs text-secondary-text">No {{ activeTab }} accounts available</p>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Data -->
        <tbody v-else>
          <tr
            v-for="acc in store.data"
            :key="acc.account_id"
            class="border-b border-primary-border last:border-none hover:bg-card-background transition-colors"
          >
            <td class="p-3">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-medium text-black shrink-0">
                  {{ acc.account_number?.charAt(0) }}
                </div>
                <span class="text-xs font-medium text-primary-text">#{{ acc.account_number }}</span>
              </div>
            </td>

            <td class="p-3">
              <span class="text-[11px] font-medium px-2 py-0.5 rounded-full border border-primary-border bg-background text-secondary-text capitalize">
                {{ acc.account_type }}
              </span>
            </td>

            <td class="p-3">
              <span v-if="acc.account_role" class="text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize"
                :class="acc.account_role === 'master'
                  ? 'bg-primary-blue/40 text-primary'
                  : 'bg-background text-secondary-text border-primary-border'"
              >
                {{ acc.account_role }}
              </span>
              <span v-else class="text-xs text-secondary-text">—</span>
            </td>

            <td class="p-3">
              <span v-if="acc.broker" class="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary text-black">
                {{ acc.broker }}
              </span>
              <span v-else class="text-xs text-secondary-text">—</span>
            </td>

            <td class="p-3 text-xs text-primary-text tabular-nums">${{ formatNum(acc.balance) }}</td>

            <td class="p-3">
              <span class="text-xs tabular-nums" :class="acc.pnl >= 0 ? 'text-green-700' : 'text-red-700'">
                {{ acc.pnl >= 0 ? '+' : '' }}${{ formatNum(acc.pnl) }}
              </span>
            </td>

            <td class="p-3 text-xs text-secondary-text">{{ formatDate(acc.created_at) }}</td>

            <td class="p-3 text-right">
              <button
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-border text-xs text-secondary-text hover:text-primary-text hover:bg-background transition-colors ml-auto"
                @click="router.push(`/account/trade/${acc.account_id}`)"
              >
                <BarChart2 class="w-3.5 h-3.5" /> Trades
              </button>
            </td>
            <td class="p-3 text-right">
              <button
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-border text-xs text-secondary-text hover:text-primary-text hover:bg-background transition-colors"
                @click="router.push(`/account/transactions/${acc.account_id}`)"
              >
                <WalletIcon class="w-3.5 h-3.5" /> Transactions
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
