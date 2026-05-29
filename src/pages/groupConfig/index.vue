<template>
  <div class="px-4 pb-8">

    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-base font-semibold text-primary-text">Group Config</h1>
        <p class="text-xs text-secondary-text mt-0.5">Manage MT5 group configurations</p>
      </div>
      <!-- <div class="flex items-center gap-2">
        <button
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary-border bg-card-background text-xs text-secondary-text hover:text-primary-text hover:bg-background transition-all"
          :class="{ 'animate-spin-slow': store.loading }"
          @click="refresh"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="refreshing ? 'animate-spin' : ''" />
          Refresh
        </button>
      </div> -->
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-3 gap-3 mb-5">
      <template v-if="store.loading">
        <div v-for="n in 3" :key="n" class="bg-card-background border border-primary-border rounded-2xl p-4 animate-pulse space-y-2">
          <div class="h-3 w-20 bg-background rounded" />
          <div class="h-6 w-12 bg-background rounded" />
        </div>
      </template>
      <template v-else>
        <div class="bg-card-background border border-primary-border rounded-2xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total Groups</p>
          <p class="text-2xl font-bold text-primary-text">{{ store.summary.total_groups ?? 0 }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-2xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Added</p>
          <p class="text-2xl font-bold text-primary-green">{{ store.summary.added ?? 0 }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-2xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Not Added</p>
          <p class="text-2xl font-bold text-primary-yellow">{{ store.summary.not_added ?? 0 }}</p>
        </div>
      </template>
    </div>

    <!-- Filters Row -->
    <div class="flex flex-wrap items-center gap-3 mb-5">
      <!-- Search -->
      <!-- <div class="relative flex-1 min-w-48 max-w-64">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text" />
        <input
          v-model="store.filters.search"
          type="text"
          placeholder="Search groups..."
          class="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-card-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
          @input="onSearch"
        />
      </div> -->

      <!-- Status Tabs -->
      <div class="flex items-center gap-1 bg-card-background border border-primary-border rounded-xl p-1">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          :class="store.filters.status === tab.value
            ? 'bg-primary text-black'
            : 'text-secondary-text hover:text-primary-text'"
          @click="switchTab(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Skeleton Cards -->
    <div v-if="store.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="n in 6" :key="n" class="bg-card-background border border-primary-border rounded-2xl p-5 animate-pulse space-y-3">
        <div class="flex items-center justify-between">
          <div class="h-4 w-32 bg-background rounded" />
          <div class="h-5 w-14 bg-background rounded-full" />
        </div>
        <div class="h-3 w-full bg-background rounded" />
        <div class="grid grid-cols-2 gap-2">
          <div class="h-8 bg-background rounded-lg" />
          <div class="h-8 bg-background rounded-lg" />
          <div class="h-8 bg-background rounded-lg" />
          <div class="h-8 bg-background rounded-lg" />
        </div>
        <div class="h-8 bg-background rounded-xl" />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="store.records.length === 0" class="flex flex-col items-center gap-3 py-20">
      <div class="w-14 h-14 rounded-2xl bg-card-background border border-primary-border flex items-center justify-center">
        <Database class="w-6 h-6 text-secondary-text" />
      </div>
      <p class="text-sm font-semibold text-primary-text">No groups found</p>
      <p class="text-xs text-secondary-text">Try adjusting your filters or search</p>
    </div>

    <!-- Group Cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="g in store.records"
        :key="g.config_id ?? g.group"
        class="bg-card-background border border-primary-border rounded-2xl p-5 flex flex-col gap-4 hover:border-primary/40 transition-all duration-200 group relative overflow-hidden"
      >
        <!-- Top accent line -->
        <span class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <!-- Card Header -->
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-primary-text truncate">
              {{ g.label ?? extractGroupName(g.group) }}
            </p>
            <p class="text-[11px] text-secondary-text font-mono truncate mt-0.5">{{ g.group }}</p>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <span
              v-if="g.is_added"
              class="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
              :class="g.is_active
                ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                : 'bg-primary-red/10 text-primary-red border-primary-red/20'"
            >
              {{ g.is_active ? 'Active' : 'Inactive' }}
            </span>
            <span v-else class="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20">
              Not Added
            </span>
          </div>
        </div>

        <!-- Meta Grid -->
        <div class="grid grid-cols-2 gap-2">
          <div class="bg-background rounded-xl px-3 py-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Currency</p>
            <p class="text-xs font-semibold text-primary-text">{{ g.currency ?? '—' }}</p>
          </div>
          <div class="bg-background rounded-xl px-3 py-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Badge</p>
            <p class="text-xs font-semibold text-primary-text">{{ g.badge ?? '—' }}</p>
          </div>
          <div class="bg-background rounded-xl px-3 py-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Account Type</p>
            <p class="text-xs font-semibold text-primary-text capitalize">{{ g.account_type ?? '—' }}</p>
          </div>
          <div class="bg-background rounded-xl px-3 py-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Category</p>
            <p class="text-xs font-semibold text-primary-text capitalize">{{ g.account_category ?? '—' }}</p>
          </div>
        </div>

        <!-- Margin Mode + Leverage -->
        <div class="flex items-center justify-between px-3 py-2 bg-background rounded-xl">
          <div>
            <p class="text-[10px] text-secondary-text mb-0.5">Margin Mode</p>
            <p class="text-xs font-medium text-primary-text capitalize">{{ g.margin_mode?.replace(/_/g, ' ') ?? '—' }}</p>
          </div>
          <div v-if="g.leverage" class="text-right">
            <p class="text-[10px] text-secondary-text mb-0.5">Leverage</p>
            <p class="text-xs font-semibold text-primary-text">1:{{ g.leverage }}</p>
          </div>
        </div>

        <!-- Action -->
        <div v-if="!g.is_added">
          <button
            class="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-black text-xs font-semibold transition-colors"
            @click="openAdd(g)"
          >
            <Plus class="w-3.5 h-3.5" /> Add Config
          </button>
        </div>
        <div v-else class="flex items-center gap-2">
          <div class="flex items-center gap-1.5 px-3 py-2 bg-background border border-primary-border rounded-xl flex-1">
            <CheckCircle2 class="w-3.5 h-3.5 text-primary-green shrink-0" />
            <span class="text-[11px] text-secondary-text">Config #{{ g.config_id }}</span>
          </div>
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

    <!-- Add Config Dialog -->
    <AddGroupConfigDialog
      :open="dialog.open"
      :group="dialog.group"
      @close="dialog.open = false"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Search, RefreshCw, Plus, CheckCircle2, Database } from 'lucide-vue-next'
import { useGroupConfigStore } from '@/stores/groupConfig/groupConfig'
import Pagination from '@/components/common/Pagination.vue'
import AddGroupConfigDialog from '@/components/groupConfig/AddGroupConfigDialog.vue'

const store = useGroupConfigStore()
const route = useRoute()
const refreshing = ref(false)
const dialog = ref({ open: false, group: null })

const tabs = [
  { label: 'All',       value: 'all'       },
  { label: 'Added',     value: 'added'     },
  { label: 'Not Added', value: 'not_added' },
]

let searchTimer = null
const onSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => store.applyFilters(), 400)
}

const switchTab = (val) => {
  store.filters.status = val
  store.applyFilters()
}

const refresh = async () => {
  refreshing.value = true
  await store.fetchGroups(true)
  refreshing.value = false
}

const openAdd = (group) => {
  dialog.value = {
    open: true,
    group: {
      ...group,
      account_category: route.params.account_category,
      account_type: route.params.account_type,
    }
  }
}

const handlePageChange = (page) => {
  store.setPage(page)
  store.fetchGroups(true)
}

const extractGroupName = (path) => path?.split('\\').pop() ?? path

onMounted(() => {
  store.filters.account_category = route.params.account_category
  store.filters.account_type = route.params.account_type
  store.fetchGroups()
})
</script>