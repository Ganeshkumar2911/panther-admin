<template>
  <div class="px-4 pb-8">

    <!-- Header -->
    <div class="flex flex-wrap items-start justify-end gap-4 mb-6">
      <!-- <div>
        <h1 class="text-base font-semibold text-primary-text">Payment Methods</h1>
        <p class="text-xs text-secondary-text mt-0.5">Manage payment wallets, labels, and activation status.</p>
      </div> -->
      <button
        :disabled="store.syncLoading"
        class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-black text-xs font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        @click="store.syncWallets()"
      >
        <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': store.syncLoading }" />
        {{ store.syncLoading ? 'Syncing...' : 'Sync Wallets' }}
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
        class="bg-card-background border border-primary-border rounded-xl p-5 flex flex-col gap-4 hover:border-primary/30 transition-all duration-200"
      >

        <!-- Card Header: Label + Status Badge -->
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <!-- Editable Label -->
            <div v-if="editingId === record.id" class="flex items-center gap-1.5">
              <input
                v-model="editingLabel"
                ref="labelInput"
                type="text"
                class="flex-1 min-w-0 px-2 py-1 rounded-lg bg-background border border-primary text-primary-text text-sm outline-none"
                @keydown.enter="saveLabel(record)"
                @keydown.escape="cancelEdit"
              />
              <button
                class="w-6 h-6 flex items-center justify-center rounded-md hover:bg-background transition-colors shrink-0"
                :disabled="store.updateLoading"
                @click="saveLabel(record)"
              >
                <Loader2 v-if="store.updateLoading && savingId === record.id" class="w-3.5 h-3.5 text-secondary-text animate-spin" />
                <Check v-else class="w-3.5 h-3.5 text-primary-green" />
              </button>
              <button class="w-6 h-6 flex items-center justify-center rounded-md hover:bg-background transition-colors shrink-0" @click="cancelEdit">
                <X class="w-3.5 h-3.5 text-secondary-text" />
              </button>
            </div>

            <div v-else class="flex items-center gap-1.5 group cursor-pointer" @click="startEdit(record)">
              <p class="text-sm font-semibold text-primary-text truncate">{{ record.wallet_label || 'Untitled Wallet' }}</p>
              <Pencil class="w-3 h-3 text-secondary-text opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>

            <p class="text-[11px] text-secondary-text mt-0.5">ID: {{ record.wallet_id }}</p>
          </div>

          <span
            class="text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0"
            :class="record.is_active
              ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
              : 'bg-primary-red/10 text-primary-red border-primary-red/20'"
          >
            {{ record.is_active ? 'Active' : 'Inactive' }}
          </span>
        </div>

        <!-- Meta Grid -->
        <div class="grid grid-cols-2 gap-2">
          <div class="bg-background rounded-lg px-3 py-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Currency ID</p>
            <p class="text-xs font-medium text-primary-text">{{ record.currency_id }}</p>
          </div>
          <div class="bg-background rounded-lg px-3 py-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Wallet Type</p>
            <p class="text-xs font-medium text-primary-text">{{ record.wallet_type }}</p>
          </div>
          <div class="bg-background rounded-lg px-3 py-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Confirmed</p>
            <p class="text-xs font-semibold text-primary-green">{{ formatNum(record.balance_confirmed) }}</p>
          </div>
          <div class="bg-background rounded-lg px-3 py-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Pending</p>
            <p class="text-xs font-medium text-primary-text">{{ formatNum(record.balance_pending) }}</p>
          </div>
        </div>

        <!-- Footer: Min Transfer + Toggle -->
        <div class="flex items-center justify-between pt-1 border-t border-primary-border">
          <div>
            <p class="text-[10px] text-secondary-text">Min Transfer</p>
            <p class="text-xs font-medium text-primary-text">{{ formatNum(record.minimal_transfer_amount) }}</p>
          </div>

          <!-- Toggle -->
          <button
            class="relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none"
            :class="record.is_active ? 'bg-primary' : 'bg-background border border-primary-border'"
            :disabled="store.updateLoading && togglingId === record.id"
            @click="toggleActive(record)"
          >
            <span
              class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
              :class="record.is_active ? 'translate-x-5' : 'translate-x-0'"
            />
            <Loader2
              v-if="store.updateLoading && togglingId === record.id"
              class="absolute inset-0 m-auto w-3 h-3 text-secondary-text animate-spin"
            />
          </button>
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

  </div>
</template>

<script setup>
import { onMounted, ref, computed, nextTick } from 'vue'
import { RefreshCw, Wallet, Pencil, Check, X, Loader2 } from 'lucide-vue-next'
import { usePaymentMethodsStore } from '@/stores/paymentMethods/paymentMethods'
import Pagination from '@/components/common/Pagination.vue'

const store = usePaymentMethodsStore()

// ── Edit label state ──
const editingId    = ref(null)
const editingLabel = ref('')
const savingId     = ref(null)
const labelInput   = ref(null)

// ── Toggle state ──
const togglingId = ref(null)

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
  (val ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })

onMounted(() => store.fetchPaymentMethods())
</script>