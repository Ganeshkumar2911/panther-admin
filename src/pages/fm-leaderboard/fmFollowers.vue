<template>
  <div class="space-y-6 py-2">
    <!-- Top Header / FM Basic Info Banner -->
    <div class="bg-card-background border border-primary-border rounded-2xl p-4 sm:p-5 shadow-2xs">
      <div v-if="fmInfo" class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3.5 min-w-0">
          <div class="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm flex items-center justify-center shrink-0">
            {{ (fmInfo.label_name || 'FM')[0].toUpperCase() }}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="text-base font-bold text-primary-text truncate">
                {{ fmInfo.label_name || 'Fund Manager Followers' }}
              </h2>
              <span
                class="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border inline-flex items-center gap-1"
                :class="fmInfo.is_active ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="fmInfo.is_active ? 'bg-emerald-500' : 'bg-zinc-400'" />
                {{ fmInfo.is_active ? 'Active' : 'Inactive' }}
              </span>
              <span class="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-md border text-secondary-text bg-background/80 border-primary-border">
                {{ fmInfo.visibility_type || 'public' }}
              </span>
            </div>
            <div class="flex items-center gap-3 text-xs text-secondary-text mt-1 flex-wrap font-medium">
              <span v-if="fmInfo.user?.email" class="flex items-center gap-1 font-mono text-primary-text select-all">
                <Mail class="w-3.5 h-3.5 text-primary shrink-0" />
                {{ fmInfo.user.email }}
              </span>
              <span v-if="fmInfo.user?.name" class="text-secondary-text">
                Owner: <strong class="text-primary-text">{{ fmInfo.user.name }}</strong>
              </span>
            </div>
          </div>
        </div>

        <!-- Summary Specs & Refresh Button -->
        <div class="flex items-center gap-3 shrink-0 flex-wrap">
          <div class="flex items-center gap-3 text-xs bg-background/60 border border-primary-border/60 rounded-xl px-3.5 py-2 shrink-0 flex-wrap">
            <div>
              <span class="text-[9px] uppercase text-secondary-text block font-semibold">Master Account</span>
              <span class="font-bold text-primary-text font-mono text-xs">{{ fmInfo.master_account?.account_number || `#${fmInfo.master_account_id}` }}</span>
            </div>
            <div class="h-6 w-px bg-primary-border/60" />
            <div>
              <span class="text-[9px] uppercase text-secondary-text block font-semibold">Coverage Account</span>
              <span class="font-bold text-primary-text font-mono text-xs">{{ fmInfo.coverage_account?.account_number || `#${fmInfo.coverage_account_id}` }}</span>
            </div>
            <div class="h-6 w-px bg-primary-border/60" />
            <div>
              <span class="text-[9px] uppercase text-secondary-text block font-semibold">Perf Fee / Min Cap</span>
              <span class="font-bold text-primary text-xs">{{ fmInfo.performance_fee }}% · ${{ fmInfo.min_capital }}</span>
            </div>
          </div>

          <Tooltip text="Refresh List">
            <button
              class="p-2 rounded-lg border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
              @click="fetchFollowers(true)"
              :disabled="loading"
              title="Refresh List"
            >
              <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
            </button>
          </Tooltip>
        </div>
      </div>
      <div v-else class="flex items-center justify-between gap-3">
        <h2 class="text-base font-bold text-primary-text">
          Clients & Followers List <span class="text-xs text-secondary-text font-normal">(FM #{{ fmId }})</span>
        </h2>
        <Tooltip text="Refresh List">
          <button
            class="p-2 rounded-lg border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
            @click="fetchFollowers(true)"
            :disabled="loading"
            title="Refresh List"
          >
            <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
          </button>
        </Tooltip>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card-background/40 border border-primary-border rounded-xl p-2.5">
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <!-- Search Input -->
        <div class="relative w-full sm:w-64">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text pointer-events-none" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search follower name, email, account..."
            class="w-full h-9 pl-8 pr-7 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text cursor-pointer"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Offer Filter -->
        <BaseSelect
          v-if="offerOptions.length > 1"
          v-model="selectedOffer"
          :options="offerOptions"
          placeholder="Filter Offer"
          class="w-40 sm:w-44"
        />
      </div>

      <!-- Clear Filters -->
      <button
        v-if="hasActiveFilters"
        type="button"
        class="rounded-lg px-2.5 py-1.5 text-xs font-medium text-secondary-text hover:bg-background hover:text-primary-text transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
        @click="resetFilters"
      >
        <RotateCcw class="w-3.5 h-3.5" />
        Reset Filters
      </button>
    </div>

    <!-- SKELETON LOADING STATE -->
    <template v-if="loading">
      <div class="hidden md:block w-full border border-primary-border rounded-2xl overflow-hidden bg-card-background/40">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b border-primary-border bg-card-background/50">
              <th v-for="n in 8" :key="n" class="px-4 py-3">
                <div class="h-3 w-16 bg-background rounded animate-pulse" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="n in 5" :key="n" class="border-b border-primary-border/60 last:border-none">
              <td v-for="i in 8" :key="i" class="px-4 py-4">
                <div class="h-4 bg-background rounded animate-pulse" :class="i === 1 ? 'w-32' : 'w-16'" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div v-for="n in 3" :key="n" class="bg-card-background border border-primary-border rounded-2xl p-5 animate-pulse space-y-4">
          <div class="flex items-center justify-between">
            <div class="h-4 w-32 bg-background rounded" />
            <div class="h-5 w-14 bg-background rounded-full" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div v-for="m in 4" :key="m" class="h-10 bg-background rounded-xl" />
          </div>
        </div>
      </div>
    </template>

    <!-- EMPTY STATE -->
    <div
      v-else-if="filteredFollowers.length === 0"
      class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary-border bg-card-background/30 py-20 px-4 text-center"
    >
      <div class="w-16 h-16 rounded-2xl bg-background border border-primary-border flex items-center justify-center mb-4 shadow-xs">
        <Users class="w-7 h-7 text-secondary-text" />
      </div>
      <p class="text-base font-semibold text-primary-text mb-1">
        {{ hasActiveFilters ? 'No matching followers found' : 'No Followers Assigned Yet' }}
      </p>
      <p class="text-xs text-secondary-text max-w-sm">
        {{ hasActiveFilters ? 'Try adjusting your search criteria or resetting filters.' : 'No client accounts have subscribed to this Fund Manager yet.' }}
      </p>
    </div>

    <!-- MAIN CONTENT -->
    <template v-else>
      <!-- Desktop Table View -->
      <div class="hidden md:block w-full border border-primary-border rounded-2xl overflow-x-auto bg-card-background/40 shadow-sm">
        <table class="w-full border-collapse text-left text-xs">
          <thead>
            <tr class="border-b border-primary-border bg-background/60 text-secondary-text font-bold uppercase tracking-wider text-[10px]">
              <th class="py-3.5 px-4 whitespace-nowrap">Follower & Email</th>
              <th class="py-3.5 px-4 whitespace-nowrap">Account & Server</th>
              <th class="py-3.5 px-4 whitespace-nowrap">Equity & PnL</th>
              <th class="py-3.5 px-4 whitespace-nowrap">Lot Setup & Trades</th>
              <th class="py-3.5 px-4 whitespace-nowrap">Offer & IB Partner</th>
              <th class="py-3.5 px-4 whitespace-nowrap">Status</th>
              <th class="py-3.5 px-4 text-right whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-primary-border/60">
            <tr
              v-for="row in filteredFollowers"
              :key="row.id || row.account_id"
              class="hover:bg-background/50 transition-colors"
            >
              <!-- Name & Email -->
              <td class="py-4 px-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                    {{ (row.name || 'F')[0].toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold text-primary-text text-xs truncate" :title="row.name">
                      {{ row.name || 'Unnamed Follower' }}
                    </p>
                    <p class="text-[11px] font-semibold text-primary font-mono select-all truncate max-w-[200px]" :title="row.email">
                      {{ row.email || 'No email' }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Account & Server -->
              <td class="py-4 px-4 whitespace-nowrap">
                <div class="space-y-0.5">
                  <p class="font-mono text-xs text-primary-text font-bold">
                    {{ row.account_number || `#${row.account_id}` }}
                  </p>
                  <p class="text-[10px] text-secondary-text uppercase font-semibold">
                    {{ row.broker_label || row.server || 'COPY_TRADING' }}
                  </p>
                </div>
              </td>

              <!-- Equity & PnL -->
              <td class="py-4 px-4 whitespace-nowrap">
                <div class="space-y-0.5">
                  <p class="text-xs font-extrabold text-primary-text">${{ fmt(row.equity) }}</p>
                  <p
                    class="text-[10px] font-bold"
                    :class="Number(row.net_profit || row.gross_pnl || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'"
                  >
                    PnL: {{ Number(row.net_profit || row.gross_pnl || 0) >= 0 ? '+' : '' }}${{ fmt(row.net_profit || row.gross_pnl) }}
                  </p>
                </div>
              </td>

              <!-- Lot Setup & Trades -->
              <td class="py-4 px-4 whitespace-nowrap">
                <div class="space-y-0.5">
                  <p class="text-xs font-semibold text-primary-text capitalize">
                    {{ row.lot_type || 'fixed' }} <span class="text-secondary-text text-[10px] font-normal">({{ row.lot_value ?? '0' }})</span>
                  </p>
                  <p class="text-[10px] text-secondary-text">
                    Trades: <span class="font-bold text-primary-text">{{ row.total_trades ?? 0 }}</span> · Fees: <span class="font-bold text-primary-text">${{ fmt(row.total_fees) }}</span>
                  </p>
                </div>
              </td>

              <!-- Offer & IB Partner -->
              <td class="py-4 px-4 whitespace-nowrap">
                <div class="space-y-0.5">
                  <p v-if="row.offer_name" class="text-xs font-semibold text-primary-text truncate max-w-[170px]" :title="row.offer_name">
                    {{ row.offer_name }}
                  </p>
                  <p v-else class="text-xs text-secondary-text">—</p>
                  <p v-if="row.ib_name || row.ib_email" class="text-[10px] text-secondary-text truncate max-w-[170px]" :title="row.ib_email">
                    IB: {{ row.ib_name || row.ib_email }}
                  </p>
                </div>
              </td>

              <!-- Status -->
              <td class="py-4 px-4 text-left whitespace-nowrap">
                <span
                  class="text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 shadow-2xs"
                  :class="row.status === 'active' || row.is_active
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="row.status === 'active' || row.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'" />
                  {{ row.status || (row.is_active ? 'Active' : 'Inactive') }}
                </span>
              </td>

              <!-- Action -->
              <td class="py-4 px-4 text-right whitespace-nowrap">
                <div class="flex items-center justify-end gap-1.5">
                  <Tooltip text="Edit Follower Settings">
                    <button
                      class="p-1.5 rounded-lg border border-primary-border hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer inline-flex items-center gap-1 text-xs font-semibold"
                      @click="openEditFollowerDialog(row)"
                    >
                      <Pencil class="w-3.5 h-3.5" />
                    </button>
                  </Tooltip>

                  <Tooltip text="View Follower Details">
                    <button
                      class="p-1.5 rounded-lg border border-primary-border hover:bg-background text-secondary-text hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1 text-xs font-semibold"
                      @click="router.push(`/follower-info/${row.id || row.account_id}`)"
                    >
                      <ChevronsRight class="w-4 h-4" />
                    </button>
                  </Tooltip>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card View -->
      <div class="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="row in filteredFollowers"
          :key="row.id || row.account_id"
          class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col gap-3 shadow-2xs"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="min-w-0">
              <p class="text-xs font-bold text-primary-text truncate">{{ row.name || 'Unnamed Follower' }}</p>
              <p class="text-[11px] text-primary font-semibold truncate">{{ row.email }}</p>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <span
                class="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase"
                :class="row.status === 'active' || row.is_active
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'"
              >
                {{ row.status || (row.is_active ? 'Active' : 'Inactive') }}
              </span>
              <button
                class="p-1 rounded-lg border border-primary-border text-secondary-text hover:text-primary-text"
                @click="openEditFollowerDialog(row)"
              >
                <Pencil class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs bg-background/60 border border-primary-border/60 rounded-xl p-2.5">
            <div>
              <span class="text-[9px] text-secondary-text block uppercase font-semibold">Account</span>
              <span class="font-bold text-primary-text font-mono">{{ row.account_number || `#${row.account_id}` }}</span>
            </div>
            <div>
              <span class="text-[9px] text-secondary-text block uppercase font-semibold">Equity</span>
              <span class="font-bold text-primary-text">${{ fmt(row.equity) }}</span>
            </div>
            <div>
              <span class="text-[9px] text-secondary-text block uppercase font-semibold">Net PnL</span>
              <span
                class="font-bold"
                :class="Number(row.net_profit || row.gross_pnl || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'"
              >
                ${{ fmt(row.net_profit || row.gross_pnl) }}
              </span>
            </div>
            <div>
              <span class="text-[9px] text-secondary-text block uppercase font-semibold">Trades</span>
              <span class="font-bold text-primary-text">{{ row.total_trades ?? 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- PAGINATION -->
      <div v-if="pagination.total_items > pagination.per_page" class="mt-4">
        <Pagination
          :pagination="pagination"
          @page-change="handlePageChange"
        />
      </div>
    </template>

    <!-- EDIT FOLLOWER DIALOG -->
    <EditFollowerDialog
      :open="editDialogOpen"
      :follower="editingFollower"
      @close="editDialogOpen = false"
      @updated="handleFollowerUpdated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { RotateCw, RotateCcw, Users, Search, X, Mail, ChevronsRight, Pencil } from 'lucide-vue-next'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import Tooltip from '@/components/common/Tooltip.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import Pagination from '@/components/common/Pagination.vue'
import EditFollowerDialog from '@/components/fmOffers/EditFollowerDialog.vue'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'

const route = useRoute()
const router = useRouter()
const snackbar = useSnackbarStore()

const fmId = route.params.id
const fmInfo = ref(null)
const followers = ref([])
const availableOffers = ref([])
const loading = ref(false)
const searchQuery = ref('')
const selectedOffer = ref('ALL')

const editDialogOpen = ref(false)
const editingFollower = ref(null)

const openEditFollowerDialog = (row) => {
  editingFollower.value = row
  editDialogOpen.value = true
}

const handleFollowerUpdated = () => {
  fetchFollowers(true, pagination.value.page)
}

const pagination = ref({
  page: 1,
  per_page: 10,
  total_items: 0,
  total_pages: 0,
})

const loadFmInfo = () => {
  try {
    const raw = localStorage.getItem('active_fm')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (String(parsed?.id) === String(fmId)) {
        fmInfo.value = parsed
      }
    }
  } catch (e) {
    console.error('Failed to load active FM from localStorage:', e)
  }
}

const offerOptions = computed(() => {
  const options = [{ label: 'All Offers', value: 'ALL' }]
  if (Array.isArray(availableOffers.value)) {
    availableOffers.value.forEach((off) => {
      options.push({
        label: off.name || off.offer_code || `Offer #${off.id}`,
        value: String(off.id),
      })
    })
  }
  return options
})

const hasActiveFilters = computed(() => {
  return Boolean(searchQuery.value.trim()) || selectedOffer.value !== 'ALL'
})

const resetFilters = () => {
  searchQuery.value = ''
  selectedOffer.value = 'ALL'
}

const fmt = (val) => {
  const num = Number(val ?? 0)
  if (isNaN(num)) return '0.00'
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const filteredFollowers = computed(() => {
  if (!Array.isArray(followers.value)) return []
  return followers.value.filter((row) => {
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      const matchName = row.name?.toLowerCase().includes(q)
      const matchEmail = row.email?.toLowerCase().includes(q)
      const matchAcc = row.account_number?.toLowerCase().includes(q) || String(row.account_id ?? '').includes(q)
      const matchOffer = row.offer_name?.toLowerCase().includes(q)
      if (!matchName && !matchEmail && !matchAcc && !matchOffer) return false
    }
    if (selectedOffer.value !== 'ALL') {
      if (String(row.offer_id) !== String(selectedOffer.value)) return false
    }
    return true
  })
})

const fetchFollowers = (force = false, page = 1) => {
  if (!fmId) return
  loading.value = true

  apiRequest(urls.KEYS.GET, `${urls.fm.followers}/${fmId}`, {
    params: { page, per_page: pagination.value.per_page },
    isTokenRequired: true,
    onSuccess: (res) => {
      followers.value = res?.data || []
      availableOffers.value = res?.filters?.offers || []
      if (res?.pagination) {
        pagination.value = res.pagination
      }
      loading.value = false
    },
    onFailure: (err) => {
      loading.value = false
      snackbar.show(err?.error || err?.message || 'Failed to load followers.', 'error')
    },
  })
}

const handlePageChange = (page) => {
  pagination.value.page = page
  fetchFollowers(true, page)
}

onMounted(() => {
  loadFmInfo()
  fetchFollowers()
})
</script>
