<template>
  <div>
    <div class="flex items-center justify-end mb-6">
      <button
        class="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-medium transition-colors"
        @click="handleAdd"
      >
        <Plus class="w-3.5 h-3.5" /> Add
      </button>
    </div>

    <!-- Skeleton -->
    <div v-if="store.isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="n in 3" :key="n" class="bg-card-background border border-primary-border rounded-2xl overflow-hidden animate-pulse">
        <div class="flex items-center justify-between px-4 py-3.5">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-background" />
            <div class="h-3 w-24 bg-background rounded" />
          </div>
          <div class="h-5 w-8 bg-background rounded-full" />
        </div>
        <div class="grid grid-cols-4 border-t border-primary-border divide-x divide-primary-border">
          <div v-for="m in 5" :key="m" class="px-3 py-3 space-y-2">
            <div class="h-2 w-8 bg-background rounded" />
            <div class="h-4 w-10 bg-background rounded" />
          </div>
        </div>
      </div>
    </div>

    <!-- Cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="(item, index) in store.data"
        :key="item.id"
        class="bg-card-background border border-primary-border rounded-2xl overflow-hidden"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-background transition-colors"
          @click="toggleCard(item.id)"
        >
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-medium shrink-0">
              {{ index + 1 }}
            </div>
            <span class="text-sm font-medium text-primary-text">{{ item.label_name ?? 'Unnamed' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[11px] text-secondary-text bg-background border border-primary-border px-2 py-0.5 rounded-full">#{{ item.id }}</span>
          </div>
        </div>

        <!-- Metrics row -->
        <div class="grid grid-cols-5 border-t border-primary-border divide-x divide-primary-border">
          <div class="px-3 py-3">
            <p class="text-[10px] uppercase tracking-wide text-secondary-text mb-1">Broker</p>
            <p class="text-base font-medium text-primary-text">{{ item.broker_share }}%</p>
          </div>
          <div class="px-3 py-3">
            <p class="text-[10px] uppercase tracking-wide text-secondary-text mb-1">FM</p>
            <p class="text-base font-medium text-primary-text">{{ item.fm_share }}%</p>
          </div>
          <div class="px-3 py-3">
            <p class="text-[10px] uppercase tracking-wide text-secondary-text mb-1">Perf.</p>
            <p class="text-base font-medium text-primary-text">{{ item.performance_fee }}%</p>
          </div>
          <div class="px-3 py-3">
            <p class="text-[10px] uppercase tracking-wide text-secondary-text mb-1">IB Pool</p>
            <p class="text-base font-medium text-primary-text">{{ item.ib_pool_percentage }}%</p>
          </div>
          <div class="px-3 py-3">
            <p class="text-[10px] uppercase tracking-wide text-secondary-text mb-1">Min Cap.</p>
            <p class="text-base font-medium text-primary-text">{{ formatMoney(item.min_capital) }}</p>
          </div>
        </div>

        <!-- Expanded -->
        <div class="border-t border-primary-border">
          <div class="flex items-center justify-between px-4 py-2.5 border-b border-primary-border">
            <span class="text-xs text-secondary-text">Settlement</span>
            <span class="text-xs font-medium text-primary-text capitalize">{{ item.settlement }} · {{ item.settlement_time }}</span>
          </div>
          <div class="flex items-center justify-between px-4 py-2.5 border-b border-primary-border">
            <span class="text-xs text-secondary-text">Status</span>
            <span
              class="text-[10px] font-medium px-2 py-0.5 rounded-full border"
              :class="item.is_active
                ? 'bg-green-50 text-green-800 border-green-200'
                : 'bg-background text-secondary-text border-primary-border'"
            >
              {{ item.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div class="flex items-center justify-between px-4 py-2.5 border-b border-primary-border">
            <span class="text-xs text-secondary-text">Created</span>
            <div class="flex items-center gap-1.5">
              <CalendarDays class="w-3 h-3 text-secondary-text" />
              <span class="text-xs text-primary-text">{{ formatDate(item.created_at) }}</span>
            </div>
          </div>
          <div class="flex justify-end px-4 py-2.5">
            <button
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-medium transition-colors"
              @click="handleEdit(item)"
            >
              <Edit class="w-3 h-3" /> Edit
            </button>
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

    <AddEditFundManager
      :open="dialogOpen"
      :mode="dialogMode"
      :item="selectedItem"
      @close="dialogOpen = false"
      @success="dialogOpen = false"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { CalendarDays, Edit, Plus, ChevronDown } from 'lucide-vue-next'
import { useFmLeaderboardStore } from '@/stores/fmLeaderboard/fmLeaderboard'
import Pagination from '@/components/common/Pagination.vue'
import AddEditFundManager from '@/components/fundManager/AddEditFundManager.vue'

const store = useFmLeaderboardStore()
const dialogOpen = ref(false)
const dialogMode = ref('add')
const selectedItem = ref(null)


const formatDate = (val) => new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
const formatMoney = (val) => {
  if (val == null || val === '') return '—'
  const num = Number(val)
  if (Number.isNaN(num)) return String(val)
  return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

const handleAdd = () => { dialogMode.value = 'add'; selectedItem.value = null; dialogOpen.value = true }
const handleEdit = (item) => { dialogMode.value = 'edit'; selectedItem.value = item; dialogOpen.value = true }

const handlePageChange = (page) => {
  store.pagination.page = page
  store.fetchFmLeaderboard(true, page)
}

onMounted(() => { store.fetchFmLeaderboard() })
</script>
