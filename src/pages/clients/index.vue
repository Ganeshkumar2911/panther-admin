<script setup>
import { onMounted, computed, ref } from 'vue'
import { Search, Users } from 'lucide-vue-next'
import { useClientListStore } from '@/stores/clientList/clientList'
import Pagination from '@/components/common/Pagination.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import ChangeIBDialog from '@/components/common/ChangeIBDialog.vue'

const store = useClientListStore()

let searchTimer = null
let ibSearchTimer = null

const changeIBDialogOpen = ref(false)
const selectedClientForChangeIB = ref(null)

const onSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => store.applyFilters(), 400)
}

const onIbSearch = (query) => {
  clearTimeout(ibSearchTimer)
  ibSearchTimer = setTimeout(() => store.searchIbs(query), 350)
}

const hasFilters = computed(() => store.filters.search || store.filters.ib_id)

const handlePageChange = (page) => store.fetchClients(page)

const formatNum = (val) => (val ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatDate = (val) => val ? new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const openChangeIBDialog = (client) => {
  selectedClientForChangeIB.value = client
  changeIBDialogOpen.value = true
}

const closeChangeIBDialog = () => {
  changeIBDialogOpen.value = false
  selectedClientForChangeIB.value = null
}

const handleChangeIBSuccess = () => {
  store.fetchClients(store.pagination.page)
}

onMounted(() => store.fetchClients())
</script>

<template>
  <div class="px-4">

    <!-- Filters -->
    <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 mb-5">
      <div class="flex w-full min-w-0 flex-col gap-2 rounded-xl border border-primary-border bg-card-background/40 p-2 sm:flex-row sm:items-center xl:flex-1 xl:flex-nowrap">

        <div class="relative w-full sm:w-56 xl:w-56">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text" />
          <input
            v-model="store.filters.search"
            type="text"
            placeholder="Search clients..."
            class="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
            @input="onSearch"
          />
        </div>

        <BaseSelect
          v-model="store.filters.ib_id"
          :options="store.ibOptions"
          :isLoading="store.searchLoading"
          placeholder="Search IB..."
          searchable
          class="w-full sm:w-52 xl:w-52"
          @search="onIbSearch"
          @update:modelValue="store.applyFilters()"
        />

        <button
          v-if="hasFilters"
          class="rounded-lg px-3 py-2 text-xs font-medium text-secondary-text hover:bg-background hover:text-primary-text transition-colors sm:flex-none"
          @click="store.resetFilters()"
        >
          Clear
        </button>

        <span class="rounded-lg px-3 py-2 text-xs font-medium text-secondary-text bg-background border border-primary-border sm:ml-auto sm:flex-none">
          {{ store.pagination.total_items }} clients
        </span>
      </div>
    </div>

    <!-- Desktop Table -->
    <div class="hidden md:block w-full border border-primary-border rounded-xl overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-primary-border">
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Client</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">IB</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Balance</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Trades</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Win Rate</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">PnL</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Accounts</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Followings</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Last Active</th>
            <th class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Status</th>
            <th class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Actions</th>
          </tr>
        </thead>

        <!-- Skeleton -->
        <tbody v-if="store.isLoading">
          <tr v-for="n in 6" :key="n" class="border-b border-primary-border animate-pulse">
            <td class="p-3">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-full bg-card-background shrink-0" />
                <div class="space-y-1.5">
                  <div class="h-3 w-24 bg-card-background rounded" />
                  <div class="h-2.5 w-28 bg-card-background rounded" />
                </div>
              </div>
            </td>
            <td class="p-3"><div class="h-3 w-20 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-16 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-10 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-12 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-16 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-8 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-8 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-20 bg-card-background rounded" /></td>
            <td class="p-3 flex justify-end"><div class="h-5 w-14 bg-card-background rounded-full" /></td>
          </tr>
        </tbody>

        <!-- Empty -->
        <tbody v-else-if="store.data.length === 0">
          <tr>
            <td colspan="10" class="py-16 text-center">
              <div class="flex flex-col items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-card-background flex items-center justify-center">
                  <Users class="w-5 h-5 text-secondary-text" />
                </div>
                <p class="text-sm font-medium text-primary-text">No clients found</p>
                <p class="text-xs text-secondary-text">Try adjusting your filters</p>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Data -->
        <tbody v-else>
          <tr
            v-for="client in store.data"
            :key="client.id"
            class="border-b border-primary-border last:border-none hover:bg-card-background transition-colors"
          >
            <td class="p-3">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-medium text-black shrink-0">
                  {{ client.name?.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <p class="text-xs font-medium text-primary-text">{{ client.name }}</p>
                  <p class="text-[11px] text-secondary-text">{{ client.email }}</p>
                </div>
              </div>
            </td>

            <td class="p-3">
              <p class="text-xs text-primary-text">{{ client.ib_name ?? '—' }}</p>
              <p class="text-[11px] text-secondary-text">{{ client.ib_referral_code ?? '' }}</p>
            </td>

            <td class="p-3 text-xs text-primary-text tabular-nums">${{ formatNum(client.total_balance) }}</td>

            <td class="p-3 text-xs text-primary-text">{{ client.total_trades }}</td>

            <td class="p-3 text-xs text-primary-text">{{ client.win_rate }}%</td>

            <td class="p-3">
              <span class="text-xs font-medium tabular-nums" :class="client.total_pnl >= 0 ? 'text-green-700' : 'text-red-600'">
                {{ client.total_pnl >= 0 ? '+' : '' }}${{ formatNum(client.total_pnl) }}
              </span>
            </td>

            <td class="p-3 text-xs text-primary-text">{{ client.active_accounts }}</td>

            <td class="p-3 text-xs text-primary-text">{{ client.active_followings }}</td>

            <td class="p-3 text-xs text-secondary-text">{{ formatDate(client.last_activity) }}</td>

            <td class="p-3 text-right">
              <span
                class="text-[11px] font-medium px-2 py-0.5 rounded-full border"
                :class="client.is_active
                  ? 'bg-primary-green/50 border-green-200'
                  : 'bg-background text-secondary-text border-primary-border'"
              >
                {{ client.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>

            <td class="p-3 text-right">
              <button
                @click="openChangeIBDialog(client)"
                class="text-xs font-medium px-3 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition"
              >
                Change IB
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Cards -->
    <div class="md:hidden space-y-3">
      <template v-if="store.isLoading">
        <div v-for="n in 4" :key="n" class="bg-card-background border border-primary-border rounded-2xl p-4 animate-pulse space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-background" />
            <div class="space-y-1.5 flex-1">
              <div class="h-3 w-32 bg-background rounded" />
              <div class="h-2.5 w-40 bg-background rounded" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div v-for="m in 6" :key="m" class="h-8 bg-background rounded-lg" />
          </div>
        </div>
      </template>

      <div v-else-if="store.data.length === 0" class="py-16 text-center">
        <div class="flex flex-col items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-card-background flex items-center justify-center">
            <Users class="w-5 h-5 text-secondary-text" />
          </div>
          <p class="text-sm font-medium text-primary-text">No clients found</p>
        </div>
      </div>

      <div
        v-else
        v-for="client in store.data"
        :key="client.id"
        class="bg-card-background border border-primary-border rounded-2xl p-4"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-black shrink-0">
              {{ client.name?.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="text-sm font-medium text-primary-text">{{ client.name }}</p>
              <p class="text-[11px] text-secondary-text">{{ client.email }}</p>
            </div>
          </div>
          <span
            class="text-[11px] font-medium px-2 py-0.5 rounded-full border"
            :class="client.is_active
              ? 'bg-primary-green/50 text-green-800 border-green-200'
              : 'bg-background text-secondary-text border-primary-border'"
          >
            {{ client.is_active ? 'Active' : 'Inactive' }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="bg-background rounded-lg px-3 py-2">
            <p class="text-[10px] text-secondary-text mb-0.5">IB</p>
            <p class="font-medium text-primary-text truncate">{{ client.ib_name ?? '—' }}</p>
          </div>
          <div class="bg-background rounded-lg px-3 py-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Balance</p>
            <p class="font-medium text-primary-text">${{ formatNum(client.total_balance) }}</p>
          </div>
          <div class="bg-background rounded-lg px-3 py-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Trades</p>
            <p class="font-medium text-primary-text">{{ client.total_trades }}</p>
          </div>
          <div class="bg-background rounded-lg px-3 py-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Win Rate</p>
            <p class="font-medium text-primary-text">{{ client.win_rate }}%</p>
          </div>
          <div class="bg-background rounded-lg px-3 py-2">
            <p class="text-[10px] text-secondary-text mb-0.5">PnL</p>
            <p class="font-medium tabular-nums" :class="client.total_pnl >= 0 ? 'text-green-700' : 'text-red-600'">
              {{ client.total_pnl >= 0 ? '+' : '' }}${{ formatNum(client.total_pnl) }}
            </p>
          </div>
          <div class="bg-background rounded-lg px-3 py-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Last Active</p>
            <p class="font-medium text-primary-text">{{ formatDate(client.last_activity) }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <Pagination
        v-if="store.pagination.total_items > store.pagination.per_page"
        :pagination="store.pagination"
        @page-change="handlePageChange"
      />
    </div>

    <!-- Change IB Dialog -->
    <ChangeIBDialog
      :open="changeIBDialogOpen"
      :client="selectedClientForChangeIB || {}"
      @close="closeChangeIBDialog"
      @success="handleChangeIBSuccess"
    />

  </div>
</template>
