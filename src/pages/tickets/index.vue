<template>
  <div class="px-4">
    <!-- Tab Toggle -->
    <div class="flex gap-2 mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
          activeTab === tab.id
            ? 'bg-primary text-white'
            : 'bg-card-background border border-primary-border text-primary-text hover:border-primary/50'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Your Tickets Tab -->
    <div v-if="activeTab === 'your-tickets'" class="space-y-5">
      <!-- Top bar -->
      <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        <div class="flex w-full min-w-0 flex-col gap-2 rounded-xl border border-primary-border bg-card-background/40 p-2 sm:flex-row sm:items-center xl:flex-1 xl:flex-nowrap">
          <!-- Search -->
          <div class="relative sm:flex-1 xl:max-w-64">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text" />
            <input
              :value="yourTicketsFilters.search"
              type="text"
              placeholder="Search..."
              class="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
              @input="onYourTicketsSearch($event.target.value)"
            />
          </div>

          <!-- Status -->
          <BaseSelect
            v-model="yourTicketsFilters.status"
            :options="statusOptions"
            placeholder="Status"
            class="w-full sm:w-36 xl:w-40"
            @update:modelValue="applyYourTicketsFilters"
          />

          <!-- Priority -->
          <BaseSelect
            v-model="yourTicketsFilters.priority"
            :options="priorityOptions"
            placeholder="Priority"
            class="w-full sm:w-36 xl:w-40"
            @update:modelValue="applyYourTicketsFilters"
          />

          <!-- Date range -->
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:w-[310px] xl:flex-none">
            <input
              v-model="yourTicketsFilters.from_date"
              type="date"
              class="w-full px-3 py-2 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors"
              @change="applyYourTicketsFilters"
            />
            <input
              v-model="yourTicketsFilters.to_date"
              type="date"
              class="w-full px-3 py-2 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors"
              @change="applyYourTicketsFilters"
            />
          </div>

          <BaseSelect
            :modelValue="store.pagination.per_page"
            :options="store.perPageOptions"
            placeholder="Per Page"
            class="w-full sm:w-28 xl:w-28"
            @update:modelValue="(val) => store.updatePerPage(val, yourTicketsFilters)"
          />

          <!-- Clear -->
          <button
            v-if="hasYourTicketsFilters"
            class="rounded-lg px-3 py-2 text-xs font-medium text-secondary-text hover:bg-background hover:text-primary-text transition-colors sm:flex-none"
            @click="clearYourTicketsFilters"
          >
            Clear
          </button>
        </div>

        <button
          class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-medium transition-colors xl:flex-none"
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
          <tbody v-if="yourTicketsStore.isLoading">
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
          <tbody v-else-if="yourTicketsStore.data.length === 0">
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
              v-for="ticket in yourTicketsStore.data"
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
          v-if="yourTicketsStore.pagination.total_items > yourTicketsStore.pagination.per_page"
          :pagination="yourTicketsStore.pagination"
          @page-change="handleYourTicketsPageChange"
        />
      </div>

      <CreateTicketDialog :open="dialogOpen" @close="dialogOpen = false" />
    </div>

    <!-- Platform Tickets Tab -->
    <div v-if="activeTab === 'platform-tickets'" class="space-y-5">
      <!-- Filters -->
      <div class="relative z-10">
        <div
          class="flex w-full min-w-0 flex-col gap-2 rounded-xl border border-primary-border bg-card-background/40 p-2 sm:flex-row sm:items-center xl:flex-nowrap overflow-visible"
        >
          <!-- Search -->
          <div class="relative sm:flex-1 xl:max-w-64">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text" />
            <input
              v-model="platformTicketsFilters.search"
              type="text"
              placeholder="Search..."
              class="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
              @input="onPlatformTicketsSearch"
            />
          </div>

          <BaseSelect
            v-model="platformTicketsFilters.filter"
            :options="dateFilterOptions"
            placeholder="Date Range"
            class="w-full sm:w-36 xl:w-40"
            @update:modelValue="platformTicketsStore.applyFilters()"
          />
          <BaseSelect
            v-model="platformTicketsFilters.status"
            :options="statusOptions"
            placeholder="All Statuses"
            class="w-full sm:w-36 xl:w-40"
            @update:modelValue="platformTicketsStore.applyFilters()"
          />
          <BaseSelect
            v-model="platformTicketsFilters.priority"
            :options="priorityOptions"
            placeholder="All Priorities"
            class="w-full sm:w-36 xl:w-40"
            @update:modelValue="platformTicketsStore.applyFilters()"
          />
          <BaseSelect
            v-model="platformTicketsFilters.sort"
            :options="sortOptions"
            placeholder="Sort"
            class="w-full sm:w-32 xl:w-36"
            @update:modelValue="platformTicketsStore.applyFilters()"
          />
          <BaseSelect
            :modelValue="platformTicketsStore.pagination.per_page"
            :options="platformTicketsStore.perPageOptions"
            placeholder="Per Page"
            class="w-full sm:w-28 xl:w-28"
            @update:modelValue="platformTicketsStore.updatePerPage"
          />

          <button
            v-if="hasPlatformTicketsFilters"
            class="rounded-lg px-3 py-2 text-xs font-medium text-secondary-text hover:bg-background hover:text-primary-text transition-colors sm:flex-none"
            @click="platformTicketsStore.resetFilters()"
          >
            Clear
          </button>
        </div>
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
              <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Created By</th>
              <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Created</th>
              <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Updated</th>
              <th class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Action</th>
            </tr>
          </thead>

          <!-- Skeleton -->
          <tbody v-if="platformTicketsStore.isLoading">
            <tr v-for="n in 6" :key="n" class="border-b border-primary-border animate-pulse">
              <td class="p-3"><div class="h-3 w-20 bg-card-background rounded" /></td>
              <td class="p-3"><div class="h-3 w-40 bg-card-background rounded" /></td>
              <td class="p-3"><div class="h-5 w-14 bg-card-background rounded-full" /></td>
              <td class="p-3"><div class="h-5 w-14 bg-card-background rounded-full" /></td>
              <td class="p-3"><div class="h-3 w-28 bg-card-background rounded" /></td>
              <td class="p-3"><div class="h-3 w-20 bg-card-background rounded" /></td>
              <td class="p-3"><div class="h-3 w-20 bg-card-background rounded" /></td>
              <td class="p-3 flex justify-end"><div class="h-7 w-14 bg-card-background rounded-lg" /></td>
            </tr>
          </tbody>

          <!-- Empty -->
          <tbody v-else-if="platformTicketsStore.data.length === 0">
            <tr>
              <td colspan="8" class="py-16 text-center">
                <div class="flex flex-col items-center gap-3">
                  <div class="w-12 h-12 rounded-full bg-card-background flex items-center justify-center">
                    <TicketIcon class="w-5 h-5 text-secondary-text" />
                  </div>
                  <p class="text-sm font-medium text-primary-text">No tickets found</p>
                  <p class="text-xs text-secondary-text">Try adjusting your filters or create a new ticket</p>
                </div>
              </td>
            </tr>
          </tbody>

          <!-- Data -->
          <tbody v-else>
            <tr
              v-for="ticket in platformTicketsStore.data"
              :key="ticket.id"
              class="border-b border-primary-border last:border-none hover:bg-card-background transition-colors"
            >
              <td class="p-3 text-xs font-medium text-primary-text">{{ ticket.ticket_number }}</td>
              <td class="p-3 text-xs text-primary-text max-w-[200px] truncate">{{ ticket.subject }}</td>
              <td class="p-3">
                <span class="text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize" :class="priorityClass(ticket.priority)">
                  {{ ticket.priority }}
                </span>
              </td>
              <td class="p-3">
                <span class="text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize" :class="statusClass(ticket.status)">
                  {{ ticket.status }}
                </span>
              </td>
              <td class="p-3 text-xs text-secondary-text">
                <div class="flex flex-col">
                  <span class="text-[11px] text-secondary-text mt-0.5">
                    <template v-if="ticket.created_by_email">{{ ticket.created_by_email }}</template>
                    <template v-if="ticket.created_by_role">
                      <span v-if="ticket.created_by_email"> &middot; </span>{{ ticket.created_by_role }}
                    </template>
                  </span>
                </div>
              </td>
              <td class="p-3 text-xs text-secondary-text">{{ formatDate(ticket.created_at) }}</td>
              <td class="p-3 text-xs text-secondary-text">{{ formatDate(ticket.updated_at) }}</td>
              <td class="p-3 text-right">
                <button
                  class="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary-border text-xs text-secondary-text hover:text-primary-text hover:bg-background transition-colors ml-auto"
                  @click="$router.push(`/ticket/${ticket.id}`)"
                >
                  <Eye class="w-3.5 h-3.5" /> View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4">
        <Pagination
          v-if="platformTicketsStore.pagination.total_items > platformTicketsStore.pagination.per_page"
          :pagination="platformTicketsStore.pagination"
          @page-change="platformTicketsStore.changePage"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Plus, Eye, Ticket as TicketIcon } from 'lucide-vue-next'
import { useTicketsStore } from '@/stores/tickets/tickets'
import { usePlatfromTicketsStore } from '@/stores/platformTickets/platformTickets'
import Pagination from '@/components/common/Pagination.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import CreateTicketDialog from '@/components/tickets/CreateTicketDialog.vue'

const router = useRouter()
const yourTicketsStore = useTicketsStore()
const platformTicketsStore = usePlatfromTicketsStore()

const activeTab = ref('your-tickets')
const dialogOpen = ref(false)

const tabs = [
  { id: 'your-tickets', label: 'Your Tickets' },
  { id: 'platform-tickets', label: 'Platform Tickets' },
]

// Your Tickets filters
const yourTicketsFilters = ref({ search: '', status: null, priority: null, from_date: '', to_date: '' })
let yourTicketsSearchTimer = null

// Platform Tickets filters
const platformTicketsFilters = computed(() => platformTicketsStore.filters)

let platformTicketsSearchTimer = null
const onPlatformTicketsSearch = () => {
  clearTimeout(platformTicketsSearchTimer)
  platformTicketsSearchTimer = setTimeout(() => platformTicketsStore.applyFilters(), 400)
}

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

const dateFilterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: 'last_7_days' },
  { label: 'Last 30 Days', value: 'last_30_days' },
  { label: 'Latest', value: 'latest' },
]

const sortOptions = [
  { label: 'Newest', value: 'desc' },
  { label: 'Oldest', value: 'asc' },
]

const hasYourTicketsFilters = computed(() =>
  yourTicketsFilters.value.search || yourTicketsFilters.value.status || yourTicketsFilters.value.priority || yourTicketsFilters.value.from_date || yourTicketsFilters.value.to_date
)

const hasPlatformTicketsFilters = computed(() =>
  platformTicketsStore.filters.search || platformTicketsStore.filters.status || platformTicketsStore.filters.priority ||
  (platformTicketsStore.filters.filter && platformTicketsStore.filters.filter !== 'all') ||
  (platformTicketsStore.filters.sort && platformTicketsStore.filters.sort !== 'desc')
)

const applyYourTicketsFilters = (force = true) => {
  yourTicketsStore.isFetched = false
  yourTicketsStore.fetchTickets(force, 1, yourTicketsFilters.value)
}

const onYourTicketsSearch = (val) => {
  yourTicketsFilters.value.search = val
  clearTimeout(yourTicketsSearchTimer)
  yourTicketsSearchTimer = setTimeout(() => applyYourTicketsFilters(), 400)
}

const clearYourTicketsFilters = () => {
  yourTicketsFilters.value = { search: '', status: null, priority: null, from_date: '', to_date: '' }
  applyYourTicketsFilters()
}

const handleYourTicketsPageChange = (page) => {
  yourTicketsStore.pagination.page = page
  yourTicketsStore.fetchTickets(true, page, yourTicketsFilters.value)
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

onMounted(() => {
  yourTicketsStore.fetchTickets()
  platformTicketsStore.fetchTickets()
})
</script>
