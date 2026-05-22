<template>
  <div class="px-4">

    <!-- Top bar -->
    <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 mb-5">
      <div class="flex w-full min-w-0 flex-col gap-2 rounded-xl border border-primary-border bg-card-background/40 p-2 sm:flex-row sm:items-center xl:flex-1 xl:flex-nowrap">

        <!-- Search -->
        <div class="relative sm:flex-1 xl:max-w-64">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text" />
          <input
            :value="filters.search"
            type="text"
            placeholder="Search..."
            class="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
            @input="onSearch($event.target.value)"
          />
        </div>

        <!-- Status -->
        <BaseSelect
          v-model="filters.status"
          :options="statusOptions"
          placeholder="Status"
          class="w-full sm:w-36 xl:w-40"
          @update:modelValue="applyFilters"
        />

        <!-- Priority -->
        <BaseSelect
          v-model="filters.priority"
          :options="priorityOptions"
          placeholder="Priority"
          class="w-full sm:w-36 xl:w-40"
          @update:modelValue="applyFilters"
        />

        <!-- Date range -->
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:w-[310px] xl:flex-none">
          <input
            v-model="filters.from_date"
            type="date"
            class="w-full px-3 py-2 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors"
            @change="applyFilters"
          />
          <input
            v-model="filters.to_date"
            type="date"
            class="w-full px-3 py-2 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors"
            @change="applyFilters"
          />
        </div>

        <!-- Clear -->
        <button
          v-if="hasFilters"
          class="rounded-lg px-3 py-2 text-xs font-medium text-secondary-text hover:bg-background hover:text-primary-text transition-colors sm:flex-none"
          @click="clearFilters"
        >
          Clear
        </button>
      </div>

      <button
        class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary hover:bg-primary-hover text-black text-xs font-medium transition-colors xl:flex-none"
        @click="dialogOpen = true"
      >
        <Plus class="w-3.5 h-3.5" /> New Ticket
      </button>
    </div>

    <!-- Table -->
    <div class="w-full border border-primary-border rounded-xl overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-primary-border">
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">#</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Subject</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Priority</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Status</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Created</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Updated</th>
            <th class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Actions</th>
          </tr>
        </thead>

        <!-- Skeleton -->
        <tbody v-if="store.isLoading">
          <tr v-for="n in 6" :key="n" class="border-b border-primary-border animate-pulse">
            <td class="p-3"><div class="h-3 w-16 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-40 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-5 w-14 bg-card-background rounded-full" /></td>
            <td class="p-3"><div class="h-5 w-14 bg-card-background rounded-full" /></td>
            <td class="p-3"><div class="h-3 w-24 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-24 bg-card-background rounded" /></td>
            <td class="p-3 flex justify-end"><div class="h-8 w-8 bg-card-background rounded-lg" /></td>
          </tr>
        </tbody>

        <!-- Empty -->
        <tbody v-else-if="store.data.length === 0">
          <tr>
            <td colspan="7" class="py-16 text-center">
              <div class="flex flex-col items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-card-background flex items-center justify-center">
                  <TicketIcon class="w-5 h-5 text-secondary-text" />
                </div>
                <p class="text-sm font-medium text-primary-text">No tickets found</p>
                <p class="text-xs text-secondary-text">Create your first ticket to get started</p>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Data -->
        <tbody v-else>
          <tr
            v-for="ticket in store.data"
            :key="ticket.id"
            class="border-b border-primary-border last:border-none hover:bg-card-background transition-colors"
          >
            <td class="p-3 text-xs font-medium text-primary-text">{{ ticket.ticket_number }}</td>
            <td class="p-3 text-xs text-primary-text max-w-[200px] truncate">{{ ticket.subject }}</td>
            <td class="p-3">
              <span class="text-[11px] font-medium px-2 py-0.5 rounded-full border" :class="priorityClass(ticket.priority)">
                {{ ticket.priority }}
              </span>
            </td>
            <td class="p-3">
              <span class="text-[11px] font-medium px-2 py-0.5 rounded-full border" :class="statusClass(ticket.status)">
                {{ ticket.status }}
              </span>
            </td>
            <td class="p-3 text-xs text-secondary-text">{{ formatDate(ticket.created_at) }}</td>
            <td class="p-3 text-xs text-secondary-text">{{ formatDate(ticket.updated_at) }}</td>
            <td class="p-3 text-right">
              <RouterLink :to="{ name: 'ticket-details', params: { id: ticket.id } }">
                <button class="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-primary-border hover:bg-background transition-colors group">
                  <Eye class="w-4 h-4 text-secondary-text group-hover:text-primary-text" />
                </button>
              </RouterLink>
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

    <CreateTicketDialog :open="dialogOpen" @close="dialogOpen = false" />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { Search, Plus, Ticket as TicketIcon, Eye } from 'lucide-vue-next'
import { useTicketsStore } from '@/stores/tickets/tickets'
import Pagination from '@/components/common/Pagination.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import CreateTicketDialog from '@/components/tickets/CreateTicketDialog.vue'

const store = useTicketsStore()
const dialogOpen = ref(false)

const filters = ref({ search: '', status: null, priority: null, from_date: '', to_date: '' })
let searchTimer = null

const statusOptions = [
  { label: 'Open', value: 'open' },
  { label: 'Pending', value: 'pending' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
]

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
]

const hasFilters = computed(() =>
  filters.value.search || filters.value.status || filters.value.priority || filters.value.from_date || filters.value.to_date
)

const applyFilters = (force = true) => {
  store.isFetched = false
  store.fetchTickets(force, 1, filters.value)
}

const onSearch = (val) => {
  filters.value.search = val
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => applyFilters(), 400)
}

const clearFilters = () => {
  filters.value = { search: '', status: null, priority: null, from_date: '', to_date: '' }
  applyFilters()
}

const handlePageChange = (page) => {
  store.pagination.page = page
  store.fetchTickets(true, page, filters.value)
}

const formatDate = (val) => new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

const priorityClass = (p) => ({
  low: 'bg-primary-green/20 text-primary-green border border-primary-green/30',
  medium: 'bg-primary-yellow/20 text-primary-yellow border border-primary-yellow/30',
  high: 'bg-primary-red/20 text-primary-red border border-primary-red/30',
}[p] ?? 'bg-primary-border/20 text-secondary-text border border-primary-border')

const statusClass = (s) => ({
  open: 'bg-primary-blue/20 text-primary',
  pending: 'bg-primary-yellow/20 text-primary-yellow',
  resolved: 'bg-primary-green/20 text-primary-green',
  closed: 'bg-primary-border/20 text-secondary-text',
}[s] ?? 'bg-primary-border/20 text-secondary-text')

onMounted(() => store.fetchTickets())
</script>
