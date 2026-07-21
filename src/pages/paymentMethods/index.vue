<template>
  <div class="px-4 pb-8">

    <!-- Header -->
    <div class="flex flex-wrap items-start justify-end gap-3 mb-6">
      <!-- <button
        :disabled="store.syncLoading"
        class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-card-background border border-primary-border hover:bg-background text-primary-text text-xs font-semibold transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        @click="store.syncWallets()"
      >
        <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': store.syncLoading }" />
        {{ store.syncLoading ? 'Syncing...' : 'Sync Wallets' }}
      </button> -->

      <button
        class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all active:scale-95"
        @click="handleOpenCreate"
      >
        <Plus class="w-3.5 h-3.5" />
        Add Payment Method
      </button>
    </div>

    <!-- Summary Cards -->
    <!-- <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <template v-if="store.loading">
        <div v-for="n in 3" :key="n" class="bg-card-background border border-primary-border rounded-xl p-4 animate-pulse space-y-2">
          <div class="h-3 w-24 bg-background rounded" />
          <div class="h-6 w-20 bg-background rounded" />
        </div>
      </template>
      <template v-else>
        <div class="bg-card-background border border-primary-border rounded-xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total Wallets</p>
          <p class="text-2xl font-bold text-primary-text">{{ store.records.length }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Active Wallets</p>
          <p class="text-2xl font-bold text-primary-green">{{ activeCount }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total Confirmed Balance</p>
          <p class="text-2xl font-bold text-primary-text">{{ formatNum(totalConfirmed) }}</p>
        </div>
      </template>
    </div> -->

    <!-- Skeleton Cards -->
    <div v-if="store.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="n in 6" :key="n" class="bg-card-background border border-primary-border rounded-xl p-5 animate-pulse space-y-3">
        <div class="flex items-center justify-between">
          <div class="h-4 w-28 bg-background rounded" />
          <div class="h-5 w-14 bg-background rounded-full" />
        </div>
        <div class="space-y-2">
          <div class="h-3 w-full bg-background rounded" />
          <div class="h-3 w-3/4 bg-background rounded" />
          <div class="h-3 w-1/2 bg-background rounded" />
        </div>
        <div class="flex items-center justify-between pt-2">
          <div class="h-3 w-20 bg-background rounded" />
          <div class="h-5 w-10 bg-background rounded-full" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="store.records.length === 0" class="flex flex-col items-center gap-4 py-20">
      <div class="w-14 h-14 rounded-2xl bg-card-background border border-primary-border flex items-center justify-center">
        <Wallet class="w-6 h-6 text-secondary-text" />
      </div>
      <div class="text-center">
        <p class="text-sm font-semibold text-primary-text">No payment methods found</p>
        <p class="text-xs text-secondary-text mt-1">Sync wallets to import available payment methods.</p>
      </div>
    </div>

    <!-- Cards Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="record in store.records"
        :key="record.id"
        class="bg-card-background border border-primary-border rounded-2xl p-5 flex flex-col gap-5 hover:border-primary/40 transition-all duration-300 group relative overflow-hidden"
      >
        <!-- Top accent gradient -->
        <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <!-- Header: Label + Active Toggle -->
        <div class="flex items-center justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div v-if="editingId === record.id" class="flex items-center gap-1.5">
              <input
                v-model="editingLabel"
                ref="labelInput"
                type="text"
                class="flex-1 min-w-0 px-2 py-1 rounded-lg bg-background border border-primary text-primary-text text-xs outline-none"
                @keydown.enter="saveLabel(record)"
                @keydown.escape="cancelEdit"
              />
              <div class="flex items-center gap-1">
                <button
                  class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
                  :disabled="store.updateLoading"
                  @click="saveLabel(record)"
                >
                  <Loader2 v-if="store.updateLoading && savingId === record.id" class="w-3.5 h-3.5 text-secondary-text animate-spin" />
                  <Check v-else class="w-3.5 h-3.5 text-primary-green" />
                </button>
                <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors" @click="cancelEdit">
                  <X class="w-3.5 h-3.5 text-secondary-text" />
                </button>
              </div>
            </div>
            <div v-else class="flex items-center gap-1.5 group/label cursor-pointer" @click="startEdit(record)">
              <p class="text-sm font-semibold text-primary-text truncate">{{ record.wallet_label || 'Untitled Wallet' }}</p>
              <Pencil class="w-3 h-3 text-secondary-text opacity-0 group-hover/label:opacity-100 transition-opacity shrink-0" />
            </div>
            <p class="text-[10px] font-mono text-secondary-text mt-0.5 uppercase">System ID: #{{ record.id }}</p>
          </div>

          <div class="flex items-center gap-3">
            <button
              class="w-8 h-8 flex items-center justify-center rounded-lg bg-background border border-primary-border hover:border-primary/40 transition-all hover:shadow-sm group/edit"
              @click="handleOpenEdit(record)"
            >
              <Pencil class="w-3.5 h-3.5 text-secondary-text group-hover/edit:text-primary transition-colors" />
            </button>

           <button
            type="button"
            :disabled="store.updateLoading && togglingId === record.id"
            @click="toggleActive(record)"
            class="relative w-11 h-6 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 focus:outline-none"
            :class="record.is_active ? 'bg-primary' : 'bg-primary-border'"
          >
            <span
              v-if="!(store.updateLoading && togglingId === record.id)"
              class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
              :class="record.is_active ? 'translate-x-5' : 'translate-x-0'"
            />

            <Loader2
              v-else
              class="absolute inset-0 m-auto w-4 h-4 text-white animate-spin"
            />
            </button>
          </div>
        </div>

        <!-- Balance Section -->
        <!-- <div class="bg-background/50 rounded-2xl p-4 border border-primary-border/50">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-semibold uppercase tracking-wider text-secondary-text">Confirmed Balance</span>
            <span
              class="text-[9px] font-bold px-1.5 py-0.5 rounded-md border"
              :class="record.is_active
                ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                : 'bg-primary-red/10 text-primary-red border-primary-red/20'"
            >
              {{ record.is_active ? 'ACTIVE' : 'INACTIVE' }}
            </span>
          </div>
          <p class="text-xl font-bold text-primary-green truncate">
            {{ formatNum(record.balance_confirmed) }}
          </p>
          <div class="flex items-center gap-1.5 mt-2 pt-2 border-t border-primary-border/30">
            <span class="text-[10px] text-secondary-text">Pending:</span>
            <span class="text-[10px] font-semibold text-primary-text">{{ formatNum(record.balance_pending) }}</span>
          </div>
        </div> -->

        <!-- Dynamic Details Area -->
        <div class="bg-background/25 rounded-xl p-3.5 border border-primary-border/40 space-y-2.5 text-xs">
          <!-- Method Type Badge & Indicator -->
          <div class="flex items-center justify-between pb-2 border-b border-primary-border/20">
            <span class="text-[10px] font-bold uppercase tracking-wider text-secondary-text">Payment Gateway</span>
            <span
              class="text-[9px] font-semibold px-2 py-0.5 rounded-full border uppercase"
              :class="[
                (record.method_type || record.gateway) === 'bank'
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  : (record.method_type || record.gateway) === 'upi'
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              ]"
            >
              {{ record.method_type || record.gateway || 'crypto' }}
            </span>
          </div>

          <!-- Bank Fields -->
          <div v-if="(record.method_type || record.gateway) === 'bank'" class="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <p class="text-[9px] text-secondary-text uppercase">Bank Name</p>
              <p class="font-medium text-primary-text truncate" :title="record.bank_name">{{ record.bank_name }}</p>
            </div>
            <div>
              <p class="text-[9px] text-secondary-text uppercase">Account Holder</p>
              <p class="font-medium text-primary-text truncate" :title="record.account_name">{{ record.account_name }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-[9px] text-secondary-text uppercase">Account Number</p>
              <p class="font-mono font-medium text-primary-text truncate" :title="record.account_number">{{ record.account_number }}</p>
            </div>
            <div>
              <p class="text-[9px] text-secondary-text uppercase">IFSC Code</p>
              <p class="font-mono font-medium text-primary-text">{{ record.ifsc_code }}</p>
            </div>
            <div v-if="record.swift_code">
              <p class="text-[9px] text-secondary-text uppercase">SWIFT Code</p>
              <p class="font-mono font-medium text-primary-text">{{ record.swift_code }}</p>
            </div>
          </div>

          <!-- UPI Fields -->
          <div v-else-if="(record.method_type || record.gateway) === 'upi'" class="space-y-1 text-[11px]">
            <div>
              <p class="text-[9px] text-secondary-text uppercase">UPI ID / VPA</p>
              <p class="font-mono font-medium text-primary-text break-all select-all">{{ record.upi_id }}</p>
            </div>
          </div>

          <!-- Crypto Fields -->
          <div v-else class="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <p class="text-[9px] text-secondary-text uppercase">Wallet ID</p>
              <p class="font-mono font-medium text-primary-text truncate" :title="record.wallet_id">{{ record.wallet_id || '—' }}</p>
            </div>
            <!-- <div>
              <p class="text-[9px] text-secondary-text uppercase">Confirmed Balance</p>
              <p class="font-semibold text-primary-green truncate">{{ formatNum(record.balance_confirmed) }}</p>
            </div> -->
            <div v-if="record.wallet_address" class="col-span-2">
              <p class="text-[9px] text-secondary-text uppercase">Wallet Address</p>
              <p class="font-mono font-medium text-primary-text truncate" :title="record.wallet_address">{{ record.wallet_address }}</p>
            </div>
            <div v-if="record.balance_pending > 0" class="col-span-2">
              <p class="text-[9px] text-secondary-text uppercase">Pending Balance</p>
              <p class="font-medium text-secondary-text truncate">{{ formatNum(record.balance_pending) }}</p>
            </div>
          </div>
        </div>

        <!-- Transaction Limits -->
        <div class="grid grid-cols-3 gap-2 pt-4 border-t border-primary-border/50">
          <div class="text-center p-2 rounded-xl bg-background/30 border border-primary-border/20">
            <p class="text-[9px] text-secondary-text mb-0.5">Min Deposit</p>
            <p class="text-[11px] font-semibold text-primary-text truncate">{{ formatShortNum(record.minimum_deposit_amount) }}</p>
          </div>
          <div class="text-center p-2 rounded-xl bg-background/30 border border-primary-border/20">
            <p class="text-[9px] text-secondary-text mb-0.5">Max Withdraw</p>
            <p class="text-[11px] font-semibold text-primary-text truncate">{{ formatShortNum(record.maximum_withdrawal_amount) }}</p>
          </div>
          <div class="text-center p-2 rounded-xl bg-background/30 border border-primary-border/20">
            <p class="text-[9px] text-secondary-text mb-0.5">Max WD / Day</p>
            <p class="text-[11px] font-semibold text-primary-text truncate">{{ record.maximum_withdrawals_per_day ?? '—' }}</p>
          </div>
        </div>

        <!-- Timestamp -->
        <div class="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
          <span class="w-1 h-1 rounded-full bg-secondary-text" />
          <p class="text-[9px] text-secondary-text uppercase tracking-tighter">Created: {{ formatDate(record.created_at) }}</p>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="mt-5">
      <Pagination
        v-if="store.pagination.total_items > store.pagination.per_page"
        :pagination="store.pagination"
        @page-change="handlePageChange"
      />
    </div>

    <!-- Edit Dialog -->
    <EditPaymentMethodDialog
      :open="isEditDialogOpen"
      :paymentMethod="selectedPaymentMethod"
      @close="isEditDialogOpen = false"
    />

  </div>
</template>

<script setup>
import { onMounted, ref, computed, nextTick } from 'vue'
import { RefreshCw, Wallet, Pencil, Check, X, Loader2, Settings2, Plus } from 'lucide-vue-next'
import { usePaymentMethodsStore } from '@/stores/paymentMethods/paymentMethods'
import Pagination from '@/components/common/Pagination.vue'
import EditPaymentMethodDialog from '@/components/paymentMethods/EditPaymentMethodDialog.vue'

const store = usePaymentMethodsStore()

// ── Edit label state ──
const editingId    = ref(null)
const editingLabel = ref('')
const savingId     = ref(null)
const labelInput   = ref(null)

// ── Toggle state ──
const togglingId = ref(null)

// ── Edit Dialog state ──
const isEditDialogOpen = ref(false)
const selectedPaymentMethod = ref(null)

const handleOpenEdit = (record) => {
  selectedPaymentMethod.value = record
  isEditDialogOpen.value = true
}

const handleOpenCreate = () => {
  selectedPaymentMethod.value = null
  isEditDialogOpen.value = true
}

// ── Computed summary ──
const activeCount     = computed(() => store.records.filter(r => r.is_active).length)
const totalConfirmed  = computed(() => store.records.reduce((sum, r) => sum + (r.balance_confirmed ?? 0), 0))

// ── Methods ──
const startEdit = async (record) => {
  editingId.value    = record.id
  editingLabel.value = record.wallet_label ?? ''
  await nextTick()
  labelInput.value?.focus()
}

const cancelEdit = () => {
  editingId.value    = null
  editingLabel.value = ''
}

const saveLabel = async (record) => {
  if (!editingLabel.value.trim()) return
  savingId.value = record.id
  await store.updatePaymentMethod(record.id, { wallet_label: editingLabel.value.trim() })
  savingId.value  = null
  editingId.value = null
}

const toggleActive = async (record) => {
  togglingId.value = record.id
  await store.updatePaymentMethod(record.id, { is_active: !record.is_active })
  togglingId.value = null
}

const handlePageChange = (page) => {
  store.setPage(page)
  store.fetchPaymentMethods(true)
}

const formatNum = (val) =>
  (val ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })

const formatShortNum = (val) => {
  if (val === 0) return '0.00'
  return (val ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

onMounted(() => store.fetchPaymentMethods())
</script>