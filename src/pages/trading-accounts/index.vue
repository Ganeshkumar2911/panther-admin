<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { BarChart2, RotateCcwKey, Search, X, Wallet as WalletIcon, DollarSign, ArrowDownUp, RefreshCw, Plus, Pencil } from 'lucide-vue-next'
import Pagination from '@/components/common/Pagination.vue'
import DropdownMenu from '@/components/common/DropdownMenu.vue'
import ChangePasswordDialog from '@/components/trading-accounts/ChangePasswordDialog.vue'
import DepositWithdrawalDialog from '@/components/trading-accounts/DepositWithdrawal.vue'
import AddEditAccount from '@/components/trading-accounts/AddEditAccount.vue'
import { useAccountsStore } from '@/stores/tradingAccounts/tradingAccounts'
import { useProfileStore } from '@/stores/profile/profile'

const store = useAccountsStore()
const profile = useProfileStore()
const router = useRouter()

const tabs = [
  { label: 'All', value: 'all' },
  // { label: 'Client', value: 'client' },
  { label: 'FM', value: 'fm' },
]

const tradingTypeFilters = [
  { label: 'All', value: 'all' },
  { label: 'MT5', value: 'real' },
  { label: 'Copy Trading', value: 'copy_trading' },
]

const accountTypeFilters = [
  { label: 'All', value: 'all' },
  { label: 'Demo', value: 'demo' },
  { label: 'Live', value: 'live' },
]

const changePasswordDialog = ref({
  open: false,
  account: null,
})

const depositWithdrawalDialog = ref({
  open: false,
  account: null,
  mode: 'deposit', // 'deposit' or 'withdrawal'
})

const addEditAccountDialog = ref({
  open: false,
  editData: null,
})

const openAddAccount = () => {
  addEditAccountDialog.value = {
    open: true,
    editData: null,
  }
}

const openEditAccount = (acc) => {
  addEditAccountDialog.value = {
    open: true,
    editData: acc,
  }
}

const closeAddEditAccount = () => {
  addEditAccountDialog.value = {
    open: false,
    editData: null,
  }
}

let searchTimer = null

const isRefreshing = ref(false)

const refreshAccounts = async () => {
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    await store.fetchAccounts()
  } finally {
    isRefreshing.value = false
  }
}

const isFm = computed(() => profile.user?.role === 'fm')
const activeTab = computed(() => store.filters.account_type ?? 'all')
const activeTradingType = computed(() => store.filters.trading_type ?? 'all')
const activeAccountType = computed(() => store.filters.account_subtype ?? 'all')
const hasActiveFilters = computed(
  () =>
    activeTab.value !== 'all' ||
    activeTradingType.value !== 'all' ||
    activeAccountType.value !== 'all' ||
    Boolean(store.filters.search_query?.trim())
)

const emptyStateTitle = computed(() =>
  hasActiveFilters.value ? 'No accounts match the selected filters' : 'No trading accounts yet'
)

const emptyStateDescription = computed(() =>
  hasActiveFilters.value
    ? 'Try a different account type, trading type, or account subtype.'
    : 'Trading accounts will appear here once they are added.'
)

const getAccountId = (acc) => acc?.id ?? acc?.account_id ?? null

const switchTab = (val) => {
  if (activeTab.value === val) return
  store.setType(val)
}

const handlePageChange = (page) => {
  store.setPage(page)
}

const setTradingType = (type) => {
  const nextFilters = {
    trading_type: type,
  }
  // Reset account_subtype when trading_type is 'all'
  if (type === 'all') {
    nextFilters.account_subtype = 'all'
  }
  store.setFilters(nextFilters)
}

const setAccountType = (type) => {
  store.setFilters({
    account_subtype: type,
  })
}

const onSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    store.setFilters({
      search_query: store.filters.search_query,
    })
  }, 1000)
}

const clearAllFilters = () => {
  store.setFilters({
    account_type: 'all',
    trading_type: 'all',
    account_subtype: 'all',
    search_query: '',
  })
}

const openChangePassword = (acc) => {
  if (acc?.trading_type !== 'real') return

  changePasswordDialog.value = {
    open: true,
    account: {
      ...acc,
      id: getAccountId(acc),
    },
  }
}

const closeChangePassword = () => {
  changePasswordDialog.value = {
    open: false,
    account: null,
  }
}

const confirmChangePassword = () => {
  closeChangePassword()
}

const openDepositWithdrawalDialog = (acc, mode) => {
  depositWithdrawalDialog.value = {
    open: true,
    account: { ...acc, id: getAccountId(acc) },
    mode: mode,
  }
}

const closeDepositWithdrawalDialog = () => {
  depositWithdrawalDialog.value = {
    open: false,
    account: null,
    mode: 'deposit',
  }
}

const formatNum = (val) =>
  Number(val ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const formatLabel = (val) => {
  if (!val) return '—'

  return String(val).replace(/_/g, ' ')
}

const formatMoney = (amount, currency) => {
  if (!currency) return `$${formatNum(amount)}`

  return /^[A-Z]{3}$/.test(currency) ? `${currency} ${formatNum(amount)}` : `${currency}${formatNum(amount)}`
}

const formatDate = (val) => {
  if (!val) return '—'

  return new Date(val).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const setActiveCurrency = (acc) => {
  const currency = acc?.broker_currency ?? acc?.currency
  if (!currency) return

  try {
    localStorage.setItem('active_currency', currency)
  } catch (e) {
    // ignore storage failures
  }
}

const setActiveAccount = (acc) => {
  try {
    localStorage.setItem(
      'active_account',
      JSON.stringify(acc)
    )

    const currency = acc?.broker_currency ?? acc?.currency

    if (currency) {
      localStorage.setItem('active_currency', currency)
    }
  } catch (err) {
    console.error(err)
  }
}

function getRowActions(acc) {
  return [
    { action: 'trades', label: 'View Trades', icon: BarChart2 },
    { action: 'transactions', label: 'View Transactions', icon: WalletIcon },
    { divider: true },
    { action: 'deposit', label: 'Deposit', icon: DollarSign },
    { action: 'withdraw', label: 'Withdraw', icon: ArrowDownUp },
    {
      action: 'changePassword',
      label: 'Change Password',
      icon: RotateCcwKey,
      hidden: acc.trading_type !== 'real',
    },
    {
      action: 'editAccount',
      label: 'Edit Account',
      icon: Pencil,
      hidden: acc.trading_type !== 'copy_trading',
    },
  ]
}

function onMenuSelect(item, acc) {
  switch (item.action) {
    case 'trades':
      setActiveAccount(acc)
      router.push(`/account/trade/${getAccountId(acc)}`)
      break
    case 'transactions':
      setActiveAccount(acc)
      router.push(`/account/transactions/${getAccountId(acc)}`)
      break
    case 'deposit':
      setActiveCurrency(acc)
      openDepositWithdrawalDialog(acc, 'deposit')
      break
    case 'withdraw':
      setActiveCurrency(acc)
      openDepositWithdrawalDialog(acc, 'withdrawal')
      break
    case 'changePassword':
      setActiveCurrency(acc)
      openChangePassword(acc)
      break
    case 'editAccount':
      setActiveCurrency(acc)
      openEditAccount(acc)
      break
  }
}

onMounted(() => {
  if (!profile.user) {
    profile.fetchUserProfile()
  }

  store.fetchAccounts()
})

onBeforeUnmount(() => clearTimeout(searchTimer))
</script>

<template>
  <div class="px-4 pb-8">
    <!-- Header -->
    <div class="flex flex-wrap items-start justify-end gap-3 mb-6">
      <button
        class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer"
        @click="openAddAccount"
      >
        <Plus class="w-3.5 h-3.5" />
        Add Account
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
        <!-- <div class="bg-card-background border border-primary-border rounded-xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total Balance</p>
          <p class="text-2xl font-medium text-primary-text">${{ formatNum(store.summary.total_balance) }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total PnL</p>
          <p class="text-2xl font-medium" :class="store.summary.total_pnl >= 0 ? 'text-green-700' : 'text-red-700'">
            {{ store.summary.total_pnl >= 0 ? '+' : '' }}${{ formatNum(store.summary.total_pnl) }}
          </p>
        </div> -->
      </template>
    </div>
    <!-- Filters -->
    <div class="mb-5 flex items-center gap-3 flex-nowrap whitespace-nowrap overflow-x-auto no-scrollbar">
      <div class="flex items-center gap-1 bg-card-background border border-primary-border rounded-lg p-1 w-fit flex-nowrap whitespace-nowrap">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          class="px-4 py-1.5 rounded-md text-xs font-medium transition-colors"
          :class="activeTab === tab.value ? 'bg-primary text-white' : 'text-secondary-text hover:text-primary-text'"
          @click="switchTab(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-if="!isFm" class="flex items-center gap-1 bg-card-background border border-primary-border rounded-lg p-1 w-fit flex-nowrap whitespace-nowrap">
        <button
          v-for="filter in tradingTypeFilters"
          :key="filter.value"
          type="button"
          class="px-4 py-1.5 rounded-md text-xs font-medium transition-colors"
          :class="
            activeTradingType === filter.value
              ? 'bg-primary text-white'
              : 'text-secondary-text hover:text-primary-text'
          "
          @click="setTradingType(filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>

      <div
        v-if="!isFm && activeTradingType === 'real'"
        class="flex items-center gap-1 bg-card-background border border-primary-border rounded-lg p-1 w-fit flex-nowrap whitespace-nowrap"
      >
        <button
          v-for="filter in accountTypeFilters"
          :key="filter.value"
          type="button"
          class="px-4 py-1.5 rounded-md text-xs font-medium transition-colors"
          :class="
            activeAccountType === filter.value
              ? 'bg-primary text-white'
              : 'text-secondary-text hover:text-primary-text'
          "
          @click="setAccountType(filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>

      <div class="relative min-w-[220px] max-w-xs flex-shrink-0">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text" />
        <input
          v-model="store.filters.search_query"
          type="text"
          placeholder="Search accounts..."
          class="w-full bg-card-background border border-primary-border rounded-lg pl-9 pr-3 py-2 text-xs text-primary-text placeholder:text-secondary-text focus:outline-none focus:border-primary"
          @input="onSearch"
        />
      </div>

      <Tooltip v-if="hasActiveFilters"  text="Clear filters" position="left">
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-lg border border-primary-border p-1.5 text-secondary-text transition-colors hover:text-primary-text hover:bg-background"
          @click="clearAllFilters"
        >
          <X class="h-3.5 w-3.5" />
        </button>
      </Tooltip>

      <Tooltip text="Refresh" position="right">
        <button
          type="button"
          :disabled="isRefreshing || store.loading"
          class="inline-flex items-center justify-center rounded-lg border border-primary-border p-1.5 text-secondary-text transition-colors hover:text-primary-text hover:bg-background disabled:opacity-60 disabled:cursor-not-allowed"
          @click="refreshAccounts"
        >
          <span v-if="isRefreshing" class="inline-flex items-center justify-center">
            <span class="w-3.5 h-3.5 border-2 border-secondary-text border-t-transparent rounded-full animate-spin" />
          </span>
          <RefreshCw v-else class="h-3.5 w-3.5" :class="store.loading ? 'animate-spin' : ''" />
        </button>
      </Tooltip>
    </div>


    <!-- Table -->
    <div class="w-full border border-primary-border rounded-lg overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-primary-border">
            <th
              v-for="col in [
                'Account',
                'Client',
                'Entity',
                'Trading',
                'Type',
                'Role',
                'Broker',
                'Server',
                'Currency',
                'Leverage',
                'Balance',
                'Equity',
                'Credit',
                // 'PnL',
                'Status',
                'Created',
                'Actions',
              ]"
              :key="col"
              class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-3 py-3 whitespace-nowrap"
              :class="col === 'Actions' ? 'text-right' : ''"
            >
              {{ col }}
            </th>
          </tr>
        </thead>

        <!-- Loading skeleton -->
        <tbody v-if="store.loading">
          <tr
            v-for="n in 6"
            :key="n"
            class="border-b border-primary-border animate-pulse"
          >
            <td class="px-3 py-4">
              <div class="h-3 w-24 bg-card-background rounded" />
            </td>
            <td class="px-3 py-4">
              <div class="h-3 w-24 bg-card-background rounded" />
            </td>
            <td class="px-3 py-4">
              <div class="h-5 w-16 bg-card-background rounded-full" />
            </td>
            <td class="px-3 py-4">
              <div class="h-5 w-20 bg-card-background rounded-full" />
            </td>
            <td class="px-3 py-4">
              <div class="h-5 w-14 bg-card-background rounded-full" />
            </td>
            <td class="px-3 py-4">
              <div class="h-5 w-16 bg-card-background rounded-full" />
            </td>
            <td class="px-3 py-4">
              <div class="h-3 w-10 bg-card-background rounded" />
            </td>
            <td class="px-3 py-4">
              <div class="h-3 w-20 bg-card-background rounded" />
            </td>
            <td class="px-3 py-4">
              <div class="h-3 w-14 bg-card-background rounded" />
            </td>
            <td class="px-3 py-4">
              <div class="h-3 w-14 bg-card-background rounded" />
            </td>
            <td class="px-3 py-4">
              <div class="h-3 w-16 bg-card-background rounded" />
            </td>
            <td class="px-3 py-4">
              <div class="h-3 w-16 bg-card-background rounded" />
            </td>
            <td class="px-3 py-4">
              <div class="h-5 w-14 bg-card-background rounded-full" />
            </td>
            <td class="px-3 py-4">
              <div class="h-3 w-20 bg-card-background rounded" />
            </td>
            <td class="px-3 py-4">
              <div class="flex justify-end gap-2">
                <div class="h-7 w-16 bg-card-background rounded-lg" />
                <div class="h-7 w-20 bg-card-background rounded-lg" />
                <div class="h-7 w-7 bg-card-background rounded-lg" />
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Empty state -->
        <tbody v-else-if="store.data.length === 0">
          <tr>
            <td colspan="15" class="px-3 py-16 text-center">
              <div class="flex flex-col items-center gap-3">
                <div
                  class="w-14 h-14 rounded-full bg-card-background border border-primary-border flex items-center justify-center"
                >
                  <WalletIcon class="w-6 h-6 text-secondary-text" />
                </div>
                <div>
                  <h3 class="text-sm font-medium text-primary-text mb-1">
                    {{ emptyStateTitle }}
                  </h3>
                  <p class="text-xs text-secondary-text">
                    {{ emptyStateDescription }}
                  </p>
                </div>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Data rows -->
        <tbody v-else>
          <tr
            v-for="acc in store.data"
            :key="getAccountId(acc) ?? acc.account_number"
            class="border-b border-primary-border last:border-none hover:bg-card-background transition-colors"
          >
            <td class="px-3 py-4">
              <span class="text-sm font-medium text-primary-text tabular-nums">
                #{{ acc.account_number ?? '—' }}
              </span>
              <p class="mt-1 text-[11px] text-secondary-text tabular-nums">
                ID {{ getAccountId(acc) ?? '—' }}
              </p>
            </td>

            <td class="px-3 py-4">
              <p class="text-xs font-medium text-primary-text whitespace-nowrap">
                {{ acc.client_name ?? acc.user?.name ?? '—' }}
              </p>
              <p class="mt-1 text-[11px] text-secondary-text whitespace-nowrap">
                {{ acc.user?.email ?? '—' }}
              </p>
            </td>

            <td class="px-3 py-4">
              <span
                class="text-[11px] font-medium px-2 py-1 rounded-full bg-card-background text-secondary-text capitalize whitespace-nowrap"
              >
                {{ formatLabel(acc.entity_type) }}
              </span>
            </td>

            <td class="px-3 py-4">
              <span
                class="text-[11px] font-medium px-2 py-1 rounded-full bg-card-background text-secondary-text capitalize whitespace-nowrap"
              >
                {{ formatLabel(acc.trading_type) }}
              </span>
            </td>

            <td class="px-3 py-4">
              <span
                class="text-[11px] font-medium px-2 py-1 rounded-full bg-card-background text-secondary-text capitalize whitespace-nowrap"
              >
                {{ formatLabel(acc.account_type) }}
              </span>
            </td>

            <td class="px-3 py-4">
              <span
                v-if="acc.account_role"
                class="text-[11px] font-medium px-2 py-1 rounded-full border capitalize"
                :class="
                  acc.account_role === 'master'
                    ? 'bg-primary-blue/40 text-primary'
                    : 'bg-background text-secondary-text border-primary-border'
                "
              >
                {{ acc.account_role }}
              </span>
              <span v-else class="text-xs text-secondary-text">—</span>
            </td>

            <td class="px-3 py-4">
              <p class="text-xs font-medium text-primary-text whitespace-nowrap">
                {{ acc.broker_label ?? acc.broker ?? '—' }}
              </p>
              <p class="mt-1 text-[11px] text-secondary-text whitespace-nowrap">
                {{ acc.broker_group ?? acc.broker ?? '—' }}
              </p>
            </td>

            <td class="px-3 py-4 text-xs text-primary-text whitespace-nowrap">
              {{ acc.server ?? '—' }}
            </td>

            <td class="px-3 py-4 text-xs text-primary-text whitespace-nowrap">
              {{ acc.broker_currency ?? acc.currency ?? '—' }}
            </td>

            <td class="px-3 py-4 text-xs text-primary-text tabular-nums whitespace-nowrap">
              {{ acc.broker_leverage ?? '—' }}
            </td>

            <td class="px-3 py-4 text-xs text-primary-text tabular-nums">
              {{ formatMoney(acc.balance, acc.broker_currency ?? acc.currency) }}
            </td>
            <td class="px-3 py-4 text-xs text-primary-text tabular-nums">
              {{ formatMoney(acc.equity, acc.broker_currency ?? acc.currency) }}
            </td>
            <td class="px-3 py-4 text-xs text-primary-text tabular-nums">
              {{ formatMoney(acc.credit, acc.broker_currency ?? acc.currency) }}
            </td>

            <!-- <td class="px-3 py-4 text-nowrap">
              <span
                class="text-xs tabular-nums"
                :class="Number(acc.pnl ?? 0) >= 0 ? 'text-green-700' : 'text-red-700'"
              >
                {{ Number(acc.pnl ?? 0) >= 0 ? '+' : '' }}{{ formatMoney(acc.pnl, acc.broker_currency ?? acc.currency) }}
              </span>
            </td> -->

            <td class="px-3 py-4">
              <span
                class="text-[11px] font-medium px-2 py-1 rounded-full capitalize whitespace-nowrap"
                :class="acc.is_active ? 'bg-primary-green/100' : 'bg-primary-red/100'"
              >
                {{ acc.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>

            <td class="px-3 py-4 text-xs text-secondary-text">
              {{ formatDate(acc.created_at) }}
            </td>

            <td class="px-3 py-4 text-right">
              <DropdownMenu
                :items="getRowActions(acc)"
                @select="(item) => onMenuSelect(item, acc)"
              />
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

    <ChangePasswordDialog
      :open="changePasswordDialog.open"
      :account="changePasswordDialog.account"
      @close="closeChangePassword"
      @confirm="confirmChangePassword"
    />

    <DepositWithdrawalDialog
      :open="depositWithdrawalDialog.open"
      :account-data="depositWithdrawalDialog.account"
      :mode="depositWithdrawalDialog.mode"
      @close="closeDepositWithdrawalDialog"
      @success="store.fetchAccounts(true)"
    />

    <AddEditAccount
      :open="addEditAccountDialog.open"
      :edit-data="addEditAccountDialog.editData"
      @close="closeAddEditAccount"
    />
  </div>
</template>
