<template>
  <div class="px-4">

    <!-- Filters -->
    <div class="flex items-center justify-between gap-3 mb-5 relative z-10">
      <div class="flex items-center gap-2">

        <!-- Search -->
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text" />
          <input
            v-model="store.filters.search"
            type="text"
            placeholder="Search..."
            class="pl-8 pr-3 py-2 text-xs rounded-lg bg-card-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text w-44"
            @input="onSearch"
          />
        </div>

        <BaseSelect
          v-model="store.filters.filter"
          :options="dateFilterOptions"
          placeholder="Date Range"
          class="w-36"
          @update:modelValue="store.applyFilters()"
        />
        <BaseSelect
          v-model="store.filters.status"
          :options="statusOptions"
          placeholder="All Statuses"
          class="w-36"
          @update:modelValue="store.applyFilters()"
        />
        <BaseSelect
          v-model="store.filters.priority"
          :options="priorityOptions"
          placeholder="All Priorities"
          class="w-36"
          @update:modelValue="store.applyFilters()"
        />
        <BaseSelect
          v-model="store.filters.sort"
          :options="sortOptions"
          placeholder="Sort"
          class="w-32"
          @update:modelValue="store.applyFilters()"
        />
        <BaseSelect
          :modelValue="store.pagination.per_page"
          :options="store.perPageOptions"
          placeholder="Per Page"
          class="w-28"
          @update:modelValue="store.updatePerPage"
        />

        <button
          v-if="hasFilters"
          class="text-xs text-secondary-text hover:text-primary-text transition-colors px-2 py-2"
          @click="store.resetFilters()"
        >
          Clear
        </button>
      </div>

      <!-- <button
        class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary hover:bg-primary-hover text-black text-xs font-medium transition-colors"
        @click="router.push('/tickets/create')"
      >
        <Plus class="w-3.5 h-3.5" /> New Ticket
      </button> -->
    </div>

    <!-- Table -->
    <DataTable
      :data="store.data"
      :columns="columns"
      :loading="store.isLoading"
      :pagination="store.pagination"
      row-key="id"
      empty-title="No tickets found"
      empty-text="Try adjusting your filters or create a new ticket"
      @page-change="store.changePage"
      @per-page-change="store.updatePerPage"
    >
      <template #empty>
        <div class="flex flex-col items-center gap-3 py-16">
          <div class="w-12 h-12 rounded-full bg-card-background flex items-center justify-center">
            <TicketIcon class="w-5 h-5 text-secondary-text" />
          </div>
          <p class="text-sm font-medium text-primary-text">No tickets found</p>
          <p class="text-xs text-secondary-text">Try adjusting your filters or create a new ticket</p>
        </div>
      </template>

      <!-- Ticket Number -->
      <template #cell-ticket_number="{ value }">
        <span class="text-xs font-medium text-primary-text">{{ value }}</span>
      </template>

      <!-- Subject -->
      <template #cell-subject="{ value }">
        <span class="text-xs text-primary-text max-w-[200px] truncate block" :title="value">{{ value }}</span>
      </template>

      <!-- Priority -->
      <template #cell-priority="{ value }">
        <span class="text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize" :class="priorityClass(value)">
          {{ value }}
        </span>
      </template>

      <!-- Status -->
      <template #cell-status="{ value }">
        <span class="text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize" :class="statusClass(value)">
          {{ value }}
        </span>
      </template>

      <!-- Created By -->
      <template #cell-created_by="{ row }">
        <div class="flex flex-col">
          <span class="text-[11px] text-secondary-text mt-0.5">
            <template v-if="row.created_by_email">{{ row.created_by_email }}</template>
            <template v-if="row.created_by_role">
              <span v-if="row.created_by_email"> &middot; </span>{{ row.created_by_role }}
            </template>
          </span>
        </div>
      </template>

      <!-- Created At -->
      <template #cell-created_at="{ value }">
        <span class="text-xs text-secondary-text">{{ formatDate(value) }}</span>
      </template>

      <!-- Updated At -->
      <template #cell-updated_at="{ value }">
        <span class="text-xs text-secondary-text">{{ formatDate(value) }}</span>
      </template>

      <!-- Action -->
      <template #cell-actions="{ row }">
        <button
          v-if="hasPermission('ticket.platform_view')"
          class="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary-border text-xs text-secondary-text hover:text-primary-text hover:bg-background transition-colors ml-auto cursor-pointer"
          @click="router.push(`/ticket/${row.id}`)"
        >
          <Eye class="w-3.5 h-3.5" /> View
        </button>
      </template>
    </DataTable>

  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Plus, Eye, Ticket as TicketIcon } from 'lucide-vue-next'
import { usePlatfromTicketsStore } from '@/stores/platformTickets/platformTickets'
import DataTable from '@/components/common/DataTable/DataTable.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import { usePermissionCheck } from '@/composables/usePermissionCheck'

const store = usePlatfromTicketsStore()
const router = useRouter()
const { hasPermission } = usePermissionCheck()

const columns = [
  { key: 'ticket_number', label: '#', sortable: false },
  { key: 'subject', label: 'Subject', sortable: false },
  { key: 'priority', label: 'Priority', sortable: false },
  { key: 'status', label: 'Status', sortable: false },
  { key: 'created_by', label: 'Created By', sortable: false },
  { key: 'created_at', label: 'Created', sortable: false },
  { key: 'updated_at', label: 'Updated', sortable: false },
  { key: 'actions', label: 'Action', align: 'right', sortable: false },
]

let searchTimer = null
const onSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => store.applyFilters(), 400)
}

const dateFilterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: 'last_7_days' },
  { label: 'Last 30 Days', value: 'last_30_days' },
  { label: 'Latest', value: 'latest' },
]

const statusOptions = [
  { label: 'Open',        value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved',    value: 'resolved' },
  { label: 'Closed',      value: 'closed' },
]

const priorityOptions = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
]

const sortOptions = [
  { label: 'Newest', value: 'desc' },
  { label: 'Oldest', value: 'asc' },
]

const hasFilters = computed(() =>
  store.filters.search || store.filters.status || store.filters.priority ||
  (store.filters.filter && store.filters.filter !== 'all') ||
  (store.filters.sort && store.filters.sort !== 'desc')
)

import { formatDate } from "@/utils/timeFormatter";

const priorityClass = (p) => ({
  high:   'bg-primary-red/20 text-primary-red border border-primary-red/30',
  medium: 'bg-primary-yellow/20 text-primary-yellow border border-primary-yellow/30',
  low:    'bg-primary-green/20 text-primary-green border border-primary-green/30',
}[p] ?? 'bg-primary-border/20 text-secondary-text border border-primary-border')

const statusClass = (s) => ({
  open:        'bg-primary-blue/20 text-primary border border-primary-blue/30',
  in_progress: 'bg-primary-yellow/20 text-primary-yellow border border-primary-yellow/30',
  resolved:    'bg-primary-green/20 text-primary-green border border-primary-green/30',
  closed:      'bg-primary-border/20 text-secondary-text border border-primary-border',
})[s] ?? 'bg-primary-border/20 text-secondary-text border border-primary-border'

onMounted(() => store.fetchTickets())
</script>
