<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import {
  STAFF,
  COUNTRIES,
  SOURCES,
} from '@/pages/lead-management/mockLeadData'
import {
  Search,
  RotateCcw,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-vue-next'

const props = defineProps({
  searchQuery: { type: String, default: '' },
  stages: { type: Array, default: () => [] },
  staffList: { type: Array, default: () => [] },
  selectedStage: { type: String, default: '' },
  selectedStaff: { type: String, default: '' },
  selectedCountry: { type: String, default: '' },
  selectedSource: { type: String, default: '' },
  selectedPriority: { type: String, default: '' },
  selectedDate: { type: String, default: '' },
})

const emit = defineEmits([
  'update:searchQuery',
  'update:selectedStage',
  'update:selectedStaff',
  'update:selectedCountry',
  'update:selectedSource',
  'update:selectedPriority',
  'update:selectedDate',
  'reset-filters',
  'refresh',
])

const localSearchQuery = ref(props.searchQuery || '')
let searchTimer = null

watch(
  () => props.searchQuery,
  (newVal) => {
    localSearchQuery.value = newVal || ''
  }
)

function handleSearchInput(e) {
  const val = e.target.value
  localSearchQuery.value = val
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    emit('update:searchQuery', val)
  }, 400)
}

onUnmounted(() => {
  clearTimeout(searchTimer)
})

const stageOptions = computed(() => {
  if (props.stages && props.stages.length > 0) {
    return props.stages.map(s => ({
      key: s.code || s.key,
      label: s.name || s.label || s.key,
    }))
  }
  return []
})
</script>

<template>
  <div class="bg-card-background border border-primary-border rounded-xl p-3.5 space-y-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <SlidersHorizontal class="w-4 h-4 text-primary" />
        <span class="text-xs font-semibold text-primary-text uppercase tracking-wider">
          Filter & Search Leads
        </span>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="emit('refresh')"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-secondary-text hover:text-primary-text bg-background border border-primary-border hover:bg-card-background transition-colors cursor-pointer"
        >
          <RefreshCw class="w-3 h-3" />
          <span>Refresh</span>
        </button>
        <button
          @click="emit('reset-filters')"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-secondary-text hover:text-primary-text bg-background border border-primary-border hover:bg-card-background transition-colors cursor-pointer"
        >
          <RotateCcw class="w-3 h-3" />
          <span>Reset Filters</span>
        </button>
      </div>
    </div>

    <!-- Filter Inputs Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
      <!-- Search Input -->
      <div class="relative lg:col-span-2">
        <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
        <input
          type="text"
          :value="localSearchQuery"
          @input="handleSearchInput"
          placeholder="Search lead name, email, phone..."
          class="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-primary-border rounded-lg text-primary-text placeholder-secondary-text focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <!-- Stage Filter -->
      <div>
        <select
          :value="selectedStage"
          @change="emit('update:selectedStage', $event.target.value)"
          class="w-full px-2.5 py-1.5 text-xs bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary transition-colors cursor-pointer"
        >
          <option value="">All Stages</option>
          <option v-for="s in stageOptions" :key="s.key" :value="s.key">
            {{ s.label }}
          </option>
        </select>
      </div>

      <!-- Staff Filter -->
      <div>
        <select
          :value="selectedStaff"
          @change="emit('update:selectedStaff', $event.target.value)"
          class="w-full px-2.5 py-1.5 text-xs bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary transition-colors cursor-pointer"
        >
          <option value="">All Staff</option>
          <option v-for="st in staffList" :key="st.id" :value="st.id">
            {{ st.name || `${st.first_name || ''} ${st.last_name || ''}`.trim() || st.email }}
          </option>
        </select>
      </div>

      <!-- Country Filter -->
      <div>
        <select
          :value="selectedCountry"
          @change="emit('update:selectedCountry', $event.target.value)"
          class="w-full px-2.5 py-1.5 text-xs bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary transition-colors cursor-pointer"
        >
          <option value="">All Countries</option>
          <option v-for="c in COUNTRIES" :key="c.code" :value="c.name">
            {{ c.flag }} {{ c.name }}
          </option>
        </select>
      </div>

      <!-- Lead Source Filter -->
      <div>
        <select
          :value="selectedSource"
          @change="emit('update:selectedSource', $event.target.value)"
          class="w-full px-2.5 py-1.5 text-xs bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary transition-colors cursor-pointer"
        >
          <option value="">All Sources</option>
          <option value="website">Website</option>
          <option value="support">Support</option>
          <option value="csv_import">CSV Import</option>
          <option value="google_ads">Google Ads</option>
          <option value="facebook">Facebook</option>
          <option value="referral">Referral</option>
        </select>
      </div>

      <!-- Priority Filter -->
      <div>
        <select
          :value="selectedPriority"
          @change="emit('update:selectedPriority', $event.target.value)"
          class="w-full px-2.5 py-1.5 text-xs bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary transition-colors cursor-pointer"
        >
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
    </div>
  </div>
</template>
