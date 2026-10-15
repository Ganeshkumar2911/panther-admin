<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs cursor-pointer"
        @click="handleClose"
      />
    </Transition>

    <!-- Drawer Panel -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-2xl bg-card-background border-l border-primary-border flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div
          class="px-6 py-4 border-b border-primary-border bg-card-background/95 backdrop-blur-md flex items-center justify-between shrink-0 sticky top-0 z-10"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs"
            >
              <Wallet class="w-5 h-5" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-sm font-bold text-primary-text truncate">
                  {{ paymentMethod?.wallet_label || 'Vendor Wallet' }}
                </h3>
                <span
                  v-if="paymentMethod?.id"
                  class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-background border border-primary-border text-secondary-text"
                >
                  ID: #{{ paymentMethod.id }}
                </span>
                <span
                  v-if="paymentMethod?.gateway"
                  class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20 uppercase"
                >
                  {{ paymentMethod.gateway }}
                </span>
              </div>
              <p class="text-[11px] text-secondary-text mt-0.5 truncate">
                Adjust exact balances, add credit, and inspect ledger transactions
              </p>
            </div>
          </div>

          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer shrink-0"
            title="Close Drawer"
            @click="handleClose"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Body Scrollable Content -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          <!-- 1. Balances Summary Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <!-- Deposit Balance Card -->
            <div
              class="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-card-background to-background/80 border border-primary-border space-y-2"
            >
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold uppercase tracking-wider text-secondary-text flex items-center gap-1.5">
                  <ArrowDownLeft class="w-3.5 h-3.5 text-primary-green" />
                  <span>Deposit Balance</span>
                </span>
                <span class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-primary-green/10 text-primary-green border border-primary-green/20">
                  Float
                </span>
              </div>
              <div class="flex items-baseline gap-1.5">
                <span class="text-2xl font-bold font-mono text-primary-green tracking-tight">
                  ₹{{ fmt(currentDepositBalance) }}
                </span>
              </div>
              <p class="text-[10px] text-secondary-text">
                Current vendor deposit fund balance
              </p>
            </div>

            <!-- Withdrawal Balance Card -->
            <div
              class="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-card-background to-background/80 border border-primary-border space-y-2"
            >
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold uppercase tracking-wider text-secondary-text flex items-center gap-1.5">
                  <ArrowUpRight class="w-3.5 h-3.5 text-primary-blue" />
                  <span>Withdrawal Balance</span>
                </span>
                <span class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-primary-blue/10 text-primary-blue border border-primary-blue/20">
                  Reserve
                </span>
              </div>
              <div class="flex items-baseline gap-1.5">
                <span class="text-2xl font-bold font-mono text-primary-blue tracking-tight">
                  ₹{{ fmt(currentWithdrawalBalance) }}
                </span>
              </div>
              <p class="text-[10px] text-secondary-text">
                Current vendor withdrawal payout balance
              </p>
            </div>
          </div>

          <!-- Metadata Pill Bar (Bot ID, updated timestamp) -->
          <div
            v-if="store.activeWallet?.updated_at || store.activeWallet?.telegram_bot_id"
            class="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-lg bg-background/50 border border-primary-border/60 text-[11px] text-secondary-text"
          >
            <div class="flex items-center gap-2">
              <Calendar class="w-3 h-3 text-secondary-text/80" />
              <span>Last Updated: <span class="font-medium text-primary-text">{{ formatDate(store.activeWallet?.updated_at) }}</span></span>
            </div>
            <div v-if="store.activeWallet?.telegram_bot_id" class="font-mono">
              Telegram Bot ID: <span class="font-bold text-primary-text">#{{ store.activeWallet.telegram_bot_id }}</span>
            </div>
          </div>

          <!-- 2. Wallet Actions Section -->
          <div class="rounded-2xl border border-primary-border bg-card-background/70 overflow-hidden">
            <!-- Action Mode Tabs -->
            <div class="flex items-center border-b border-primary-border bg-background/40 p-1.5 gap-1.5">
              <button
                type="button"
                class="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer"
                :class="actionTab === 'exact'
                  ? 'bg-card-background border border-primary-border text-primary shadow-xs'
                  : 'text-secondary-text hover:text-primary-text'"
                @click="actionTab = 'exact'"
              >
                <SlidersHorizontal class="w-3.5 h-3.5" />
                <span>Exact Balance Adjustment</span>
              </button>

              <button
                type="button"
                class="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer"
                :class="actionTab === 'credit'
                  ? 'bg-card-background border border-primary-border text-primary shadow-xs'
                  : 'text-secondary-text hover:text-primary-text'"
                @click="actionTab = 'credit'"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>Top-up / Add Credit</span>
              </button>
            </div>

            <!-- Tab 1: Exact Balance Adjustment Form -->
            <div v-if="actionTab === 'exact'" class="p-4.5 space-y-4">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h4 class="text-xs font-bold text-primary-text">Override Exact Balances</h4>
                  <p class="text-[11px] text-secondary-text mt-0.5">
                    Set explicit deposit and/or withdrawal balances. An <code>admin_adjustment</code> record will be logged.
                  </p>
                </div>
                <span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-background border border-primary-border text-secondary-text shrink-0">
                  PATCH /balances
                </span>
              </div>

              <!-- Scope Selector Pills -->
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-medium text-secondary-text">Update:</span>
                <div class="inline-flex rounded-lg border border-primary-border bg-background p-0.5 text-xs">
                  <button
                    type="button"
                    class="px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer"
                    :class="exactScope === 'both' ? 'bg-primary text-white font-semibold' : 'text-secondary-text hover:text-primary-text'"
                    @click="exactScope = 'both'"
                  >
                    Both Balances
                  </button>
                  <button
                    type="button"
                    class="px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer"
                    :class="exactScope === 'deposit' ? 'bg-primary text-white font-semibold' : 'text-secondary-text hover:text-primary-text'"
                    @click="exactScope = 'deposit'"
                  >
                    Deposit Only
                  </button>
                  <button
                    type="button"
                    class="px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer"
                    :class="exactScope === 'withdrawal' ? 'bg-primary text-white font-semibold' : 'text-secondary-text hover:text-primary-text'"
                    @click="exactScope = 'withdrawal'"
                  >
                    Withdrawal Only
                  </button>
                </div>
              </div>

              <form class="space-y-3.5" @submit.prevent="handleAdjustBalances">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <!-- Deposit Balance Input -->
                  <div v-if="exactScope === 'both' || exactScope === 'deposit'">
                    <label class="block text-[11px] font-semibold text-primary-text mb-1">
                      Deposit Balance (₹)
                      <span class="text-primary-red">*</span>
                    </label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text text-xs font-mono">₹</span>
                      <input
                        v-model="exactForm.deposit_balance"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="e.g. 5000"
                        class="w-full pl-7 pr-3 py-2 rounded-lg bg-background border border-primary-border text-xs font-mono text-primary-text outline-none focus:border-primary transition"
                        :disabled="store.submittingBalance"
                      />
                    </div>
                    <p class="text-[10px] text-secondary-text mt-1">
                      Current: ₹{{ fmt(currentDepositBalance) }}
                    </p>
                  </div>

                  <!-- Withdrawal Balance Input -->
                  <div v-if="exactScope === 'both' || exactScope === 'withdrawal'">
                    <label class="block text-[11px] font-semibold text-primary-text mb-1">
                      Withdrawal Balance (₹)
                      <span class="text-primary-red">*</span>
                    </label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text text-xs font-mono">₹</span>
                      <input
                        v-model="exactForm.withdrawal_balance"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="e.g. 2500"
                        class="w-full pl-7 pr-3 py-2 rounded-lg bg-background border border-primary-border text-xs font-mono text-primary-text outline-none focus:border-primary transition"
                        :disabled="store.submittingBalance"
                      />
                    </div>
                    <p class="text-[10px] text-secondary-text mt-1">
                      Current: ₹{{ fmt(currentWithdrawalBalance) }}
                    </p>
                  </div>
                </div>

                <!-- Remarks Input -->
                <div>
                  <label class="block text-[11px] font-semibold text-primary-text mb-1">
                    Remarks / Reason
                  </label>
                  <input
                    v-model="exactForm.remarks"
                    type="text"
                    placeholder="e.g. Daily vendor funding, Corrected deposit balance"
                    class="w-full px-3 py-2 rounded-lg bg-background border border-primary-border text-xs text-primary-text outline-none focus:border-primary transition"
                    :disabled="store.submittingBalance"
                  />
                  <p class="text-[10px] text-secondary-text mt-1">
                    Logged with the adjustment in the transaction ledger.
                  </p>
                </div>

                <!-- Validation or Form Error Banner -->
                <div
                  v-if="formErrorMessage"
                  class="p-2.5 rounded-lg bg-primary-red/10 border border-primary-red/20 text-primary-red text-xs flex items-center gap-2"
                >
                  <AlertCircle class="w-3.5 h-3.5 shrink-0" />
                  <span>{{ formErrorMessage }}</span>
                </div>

                <!-- Submit Button -->
                <div class="flex items-center justify-between pt-2">
                  <span class="text-[11px] text-secondary-text">
                    Requires: <code class="font-mono font-bold text-primary-text">vendor.wallet_adjust</code>
                  </span>

                  <button
                    type="submit"
                    :disabled="store.submittingBalance || !hasPermission('vendor.wallet_adjust')"
                    class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                  >
                    <RefreshCw v-if="store.submittingBalance" class="w-3.5 h-3.5 animate-spin" />
                    <Check v-else class="w-3.5 h-3.5" />
                    <span>{{ store.submittingBalance ? 'Updating Balances...' : 'Apply Balance Override' }}</span>
                  </button>
                </div>
              </form>
            </div>

            <!-- Tab 2: Top-Up / Add Credit Form -->
            <div v-else class="p-4.5 space-y-4">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h4 class="text-xs font-bold text-primary-text">Add-Only Wallet Top-Up</h4>
                  <p class="text-[11px] text-secondary-text mt-0.5">
                    Increment deposit or withdrawal balance by a specified amount without overriding.
                  </p>
                </div>
                <span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-background border border-primary-border text-secondary-text shrink-0">
                  POST /credit
                </span>
              </div>

              <form class="space-y-3.5" @submit.prevent="handleCreditWallet">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <!-- Balance Type Selector -->
                  <div>
                    <label class="block text-[11px] font-semibold text-primary-text mb-1">
                      Balance Target
                      <span class="text-primary-red">*</span>
                    </label>
                    <div class="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        class="p-2.5 rounded-lg border text-left transition cursor-pointer flex items-center gap-2"
                        :class="creditForm.balance_type === 'deposit'
                          ? 'bg-primary-green/10 border-primary-green text-primary-green font-semibold'
                          : 'bg-background border-primary-border text-secondary-text hover:text-primary-text'"
                        @click="creditForm.balance_type = 'deposit'"
                      >
                        <ArrowDownLeft class="w-3.5 h-3.5 shrink-0" />
                        <span class="text-xs">Deposit (+)</span>
                      </button>

                      <button
                        type="button"
                        class="p-2.5 rounded-lg border text-left transition cursor-pointer flex items-center gap-2"
                        :class="creditForm.balance_type === 'withdrawal'
                          ? 'bg-primary-blue/10 border-primary-blue text-primary-blue font-semibold'
                          : 'bg-background border-primary-border text-secondary-text hover:text-primary-text'"
                        @click="creditForm.balance_type = 'withdrawal'"
                      >
                        <ArrowUpRight class="w-3.5 h-3.5 shrink-0" />
                        <span class="text-xs">Withdrawal (+)</span>
                      </button>
                    </div>
                  </div>

                  <!-- Amount Input -->
                  <div>
                    <label class="block text-[11px] font-semibold text-primary-text mb-1">
                      Top-Up Amount (₹)
                      <span class="text-primary-red">*</span>
                    </label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text text-xs font-mono">₹</span>
                      <input
                        v-model="creditForm.amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="e.g. 1000"
                        class="w-full pl-7 pr-3 py-2 rounded-lg bg-background border border-primary-border text-xs font-mono text-primary-text outline-none focus:border-primary transition"
                        :disabled="store.submittingCredit"
                      />
                    </div>
                  </div>
                </div>

                <!-- Remarks Input -->
                <div>
                  <label class="block text-[11px] font-semibold text-primary-text mb-1">
                    Remarks / Note
                  </label>
                  <input
                    v-model="creditForm.remarks"
                    type="text"
                    placeholder="e.g. Top-up"
                    class="w-full px-3 py-2 rounded-lg bg-background border border-primary-border text-xs text-primary-text outline-none focus:border-primary transition"
                    :disabled="store.submittingCredit"
                  />
                </div>

                <!-- Validation or Form Error Banner -->
                <div
                  v-if="creditErrorMessage"
                  class="p-2.5 rounded-lg bg-primary-red/10 border border-primary-red/20 text-primary-red text-xs flex items-center gap-2"
                >
                  <AlertCircle class="w-3.5 h-3.5 shrink-0" />
                  <span>{{ creditErrorMessage }}</span>
                </div>

                <!-- Submit Button -->
                <div class="flex items-center justify-between pt-2">
                  <span class="text-[11px] text-secondary-text">
                    Action: Add funds to vendor balance
                  </span>

                  <button
                    type="submit"
                    :disabled="store.submittingCredit || !hasPermission('vendor.wallet_adjust')"
                    class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                  >
                    <RefreshCw v-if="store.submittingCredit" class="w-3.5 h-3.5 animate-spin" />
                    <Plus v-else class="w-3.5 h-3.5" />
                    <span>{{ store.submittingCredit ? 'Crediting...' : 'Add Credit' }}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- 3. Transaction Ledger Section -->
          <div class="space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <h4 class="text-xs font-bold text-primary-text uppercase tracking-wider">
                  Transaction &amp; Adjustment Ledger
                </h4>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-md bg-background border border-primary-border text-secondary-text">
                  {{ store.pagination.total_items }} records
                </span>
              </div>

              <!-- Balance Type Filter Pills & Refresh -->
              <div class="flex items-center gap-2">
                <div class="flex items-center p-0.5 rounded-lg border border-primary-border bg-background text-xs">
                  <button
                    type="button"
                    class="px-2.5 py-1 rounded-md text-[10px] font-medium transition cursor-pointer"
                    :class="store.filterBalanceType === '' ? 'bg-primary text-white font-semibold' : 'text-secondary-text hover:text-primary-text'"
                    @click="onFilterBalanceType('')"
                  >
                    All
                  </button>
                  <button
                    type="button"
                    class="px-2.5 py-1 rounded-md text-[10px] font-medium transition cursor-pointer"
                    :class="store.filterBalanceType === 'deposit' ? 'bg-primary text-white font-semibold' : 'text-secondary-text hover:text-primary-text'"
                    @click="onFilterBalanceType('deposit')"
                  >
                    Deposit
                  </button>
                  <button
                    type="button"
                    class="px-2.5 py-1 rounded-md text-[10px] font-medium transition cursor-pointer"
                    :class="store.filterBalanceType === 'withdrawal' ? 'bg-primary text-white font-semibold' : 'text-secondary-text hover:text-primary-text'"
                    @click="onFilterBalanceType('withdrawal')"
                  >
                    Withdrawal
                  </button>
                </div>

                <Tooltip text="Refresh Ledger" position="top">
                  <button
                    type="button"
                    :disabled="store.loadingTransactions"
                    class="w-7 h-7 flex items-center justify-center rounded-lg border border-primary-border bg-card-background hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer disabled:opacity-50"
                    @click="refreshLedger"
                  >
                    <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': store.loadingTransactions }" />
                  </button>
                </Tooltip>
              </div>
            </div>

            <!-- Ledger DataTable -->
            <DataTable
              :columns="tableColumns"
              :data="store.transactions"
              :loading="store.loadingTransactions"
              :pagination="store.pagination"
              table-key="vendor-wallet-ledger-table"
              empty-title="No Ledger Transactions"
              empty-text="No transactions or adjustments found for this vendor wallet."
              @page-change="handlePageChange"
              @per-page-change="handlePerPageChange"
            >
              <!-- Cell: Date & Time -->
              <template #cell-created_at="{ row }">
                <span class="text-[11px] text-secondary-text whitespace-nowrap font-mono">
                  {{ formatDate(row.created_at) }}
                </span>
              </template>

              <!-- Cell: Entry Type -->
              <template #cell-entry_type="{ row }">
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-md border font-mono uppercase tracking-wider inline-block"
                  :class="getEntryTypeClass(row.entry_type)"
                >
                  {{ formatEntryType(row.entry_type) }}
                </span>
              </template>

              <!-- Cell: Target Balance Type -->
              <template #cell-balance_type="{ row }">
                <span
                  class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border capitalize"
                  :class="row.balance_type === 'deposit'
                    ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                    : 'bg-primary-blue/10 text-primary-blue border-primary-blue/20'"
                >
                  <ArrowDownLeft v-if="row.balance_type === 'deposit'" class="w-2.5 h-2.5" />
                  <ArrowUpRight v-else class="w-2.5 h-2.5" />
                  <span>{{ row.balance_type || '—' }}</span>
                </span>
              </template>

              <!-- Cell: Signed Amount -->
              <template #cell-amount="{ row }">
                <span
                  class="text-xs font-bold font-mono tabular-nums whitespace-nowrap"
                  :class="Number(row.amount) >= 0 ? 'text-primary-green' : 'text-primary-red'"
                >
                  {{ Number(row.amount) >= 0 ? '+' : '' }}₹{{ fmt(row.amount) }}
                </span>
              </template>

              <!-- Cell: Balance Before & After -->
              <template #cell-balances="{ row }">
                <div class="flex items-center gap-1.5 text-[11px] font-mono tabular-nums whitespace-nowrap">
                  <span class="text-secondary-text" title="Balance Before">
                    ₹{{ fmt(row.balance_before) }}
                  </span>
                  <span class="text-secondary-text/60">→</span>
                  <span class="text-primary-text font-semibold" title="Balance After">
                    ₹{{ fmt(row.balance_after) }}
                  </span>
                </div>
              </template>

              <!-- Cell: Admin / Actor -->
              <template #cell-admin="{ row }">
                <span v-if="row.admin_id || row.admin?.id" class="text-[11px] font-mono text-secondary-text">
                  Admin #{{ row.admin_id || row.admin?.id }}
                </span>
                <span v-else class="text-[11px] text-secondary-text">—</span>
              </template>

              <!-- Cell: Remarks -->
              <template #cell-remarks="{ row }">
                <span
                  v-if="row.remarks"
                  class="text-[11px] text-secondary-text truncate max-w-[140px] block"
                  :title="row.remarks"
                >
                  {{ row.remarks }}
                </span>
                <span v-else class="text-[11px] text-secondary-text/60 italic">—</span>
              </template>
            </DataTable>
          </div>

        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  Wallet,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  SlidersHorizontal,
  Plus,
  Check,
  AlertCircle,
  Calendar,
} from 'lucide-vue-next'
import DataTable from '@/components/common/DataTable/DataTable.vue'
import Tooltip from '@/components/common/Tooltip.vue'
import { useVendorWalletsStore } from '@/stores/vendorWallets/vendorWallets'
import { usePermissionCheck } from '@/composables/usePermissionCheck'
import { formatDate } from '@/utils/timeFormatter'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  paymentMethod: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'updated'])

const store = useVendorWalletsStore()
const { hasPermission } = usePermissionCheck()

// ── Tab State ──
const actionTab = ref('exact') // 'exact' | 'credit'
const exactScope = ref('both') // 'both' | 'deposit' | 'withdrawal'

// ── Form State ──
const exactForm = ref({
  deposit_balance: '',
  withdrawal_balance: '',
  remarks: '',
})
const formErrorMessage = ref('')

const creditForm = ref({
  balance_type: 'deposit',
  amount: '',
  remarks: '',
})
const creditErrorMessage = ref('')

// ── Table Columns ──
const tableColumns = [
  { key: 'created_at', label: 'Date & Time', sortable: false },
  { key: 'entry_type', label: 'Entry Type', sortable: false },
  { key: 'balance_type', label: 'Target', sortable: false },
  { key: 'amount', label: 'Amount', sortable: false },
  { key: 'balances', label: 'Before → After', sortable: false },
  { key: 'admin', label: 'Admin', sortable: false },
  { key: 'remarks', label: 'Remarks', sortable: false },
]

// ── Dynamic Current Balances ──
const currentDepositBalance = computed(() => {
  if (store.activeWallet?.deposit_balance !== undefined) {
    return store.activeWallet.deposit_balance
  }
  if (props.paymentMethod?.deposit_balance !== undefined) {
    return props.paymentMethod.deposit_balance
  }
  if (props.paymentMethod?.vendor_wallet?.deposit_balance !== undefined) {
    return props.paymentMethod.vendor_wallet.deposit_balance
  }
  return 0
})

const currentWithdrawalBalance = computed(() => {
  if (store.activeWallet?.withdrawal_balance !== undefined) {
    return store.activeWallet.withdrawal_balance
  }
  if (props.paymentMethod?.withdrawal_balance !== undefined) {
    return props.paymentMethod.withdrawal_balance
  }
  if (props.paymentMethod?.vendor_wallet?.withdrawal_balance !== undefined) {
    return props.paymentMethod.vendor_wallet.withdrawal_balance
  }
  return 0
})

// ── Watch open to load data ──
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && props.paymentMethod?.id) {
      store.reset()
      formErrorMessage.value = ''
      creditErrorMessage.value = ''

      // Pre-seed activeWallet from props if present
      if (props.paymentMethod.deposit_balance !== undefined || props.paymentMethod.vendor_wallet) {
        store.activeWallet = {
          payment_method_id: props.paymentMethod.id,
          deposit_balance: props.paymentMethod.deposit_balance ?? props.paymentMethod.vendor_wallet?.deposit_balance,
          withdrawal_balance: props.paymentMethod.withdrawal_balance ?? props.paymentMethod.vendor_wallet?.withdrawal_balance,
          telegram_bot_id: props.paymentMethod.telegram_bot_id ?? props.paymentMethod.vendor_wallet?.telegram_bot_id,
          updated_at: props.paymentMethod.updated_at,
        }
      }

      // Prepopulate form with current balances
      exactForm.value = {
        deposit_balance: currentDepositBalance.value ?? '',
        withdrawal_balance: currentWithdrawalBalance.value ?? '',
        remarks: '',
      }

      creditForm.value = {
        balance_type: 'deposit',
        amount: '',
        remarks: '',
      }

      // Fetch transaction ledger
      store.fetchTransactions(props.paymentMethod.id, true)
    }
  },
  { immediate: true }
)

// ── Actions ──
const handleClose = () => {
  emit('close')
}

const onFilterBalanceType = (type) => {
  if (props.paymentMethod?.id) {
    store.setBalanceType(props.paymentMethod.id, type)
  }
}

const refreshLedger = () => {
  if (props.paymentMethod?.id) {
    store.fetchTransactions(props.paymentMethod.id, true)
  }
}

const handlePageChange = ({ page }) => {
  if (props.paymentMethod?.id) {
    store.setPage(props.paymentMethod.id, page)
  }
}

const handlePerPageChange = (per_page) => {
  if (props.paymentMethod?.id) {
    store.updatePerPage(props.paymentMethod.id, per_page)
  }
}

// ── Submit Exact Balance Adjustment ──
const handleAdjustBalances = async () => {
  formErrorMessage.value = ''

  if (!props.paymentMethod?.id) return

  const payload = {}

  if (exactScope.value === 'both' || exactScope.value === 'deposit') {
    if (exactForm.value.deposit_balance === '' || exactForm.value.deposit_balance === null) {
      formErrorMessage.value = 'Please provide a deposit balance.'
      return
    }
    const dep = Number(exactForm.value.deposit_balance)
    if (isNaN(dep) || dep < 0) {
      formErrorMessage.value = 'deposit_balance cannot be negative'
      return
    }
    payload.deposit_balance = dep
  }

  if (exactScope.value === 'both' || exactScope.value === 'withdrawal') {
    if (exactForm.value.withdrawal_balance === '' || exactForm.value.withdrawal_balance === null) {
      formErrorMessage.value = 'Please provide a withdrawal balance.'
      return
    }
    const wth = Number(exactForm.value.withdrawal_balance)
    if (isNaN(wth) || wth < 0) {
      formErrorMessage.value = 'withdrawal_balance cannot be negative'
      return
    }
    payload.withdrawal_balance = wth
  }

  if (exactForm.value.remarks && exactForm.value.remarks.trim()) {
    payload.remarks = exactForm.value.remarks.trim()
  }

  try {
    const res = await store.adjustBalances(props.paymentMethod.id, payload)
    emit('updated', res?.data || store.activeWallet)
  } catch (err) {
    if (err?.message) {
      formErrorMessage.value = err.message
    }
  }
}

// ── Submit Top-Up Credit ──
const handleCreditWallet = async () => {
  creditErrorMessage.value = ''

  if (!props.paymentMethod?.id) return

  const amt = Number(creditForm.value.amount)
  if (isNaN(amt) || amt <= 0) {
    creditErrorMessage.value = 'Amount must be greater than 0.'
    return
  }

  const payload = {
    balance_type: creditForm.value.balance_type,
    amount: amt,
  }
  if (creditForm.value.remarks && creditForm.value.remarks.trim()) {
    payload.remarks = creditForm.value.remarks.trim()
  }

  try {
    const res = await store.creditWallet(props.paymentMethod.id, payload)
    creditForm.value.amount = ''
    creditForm.value.remarks = ''
    emit('updated', res?.data || store.activeWallet)
  } catch (err) {
    if (err?.message) {
      creditErrorMessage.value = err.message
    }
  }
}

// ── Formatters ──
const fmt = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0.00'
  return Number(val).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const formatEntryType = (type) => {
  if (!type) return 'ADJUSTMENT'
  return type.replace(/_/g, ' ')
}

const getEntryTypeClass = (type) => {
  switch (type) {
    case 'admin_adjustment':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    case 'credit':
    case 'top_up':
      return 'bg-primary-green/10 text-primary-green border-primary-green/20'
    case 'debit':
    case 'payout':
      return 'bg-primary-red/10 text-primary-red border-primary-red/20'
    default:
      return 'bg-primary/10 text-primary border-primary/20'
  }
}
</script>

<style scoped>
/* Backdrop transitions */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease-out;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* Panel slide-out-from-right transitions */
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>
