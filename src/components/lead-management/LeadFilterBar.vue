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
import BaseSelect from '@/components/common/BaseSelect.vue'

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
  const options = [{ label: 'All Stages', value: '' }]
  if (props.stages && props.stages.length > 0) {
    props.stages.forEach(s => {
      options.push({
        label: s.name || s.label || s.key,
        value: s.code || s.key,
      })
    })
  }
  return options
})

const staffOptions = computed(() => {
  const options = [{ label: 'All Staff', value: '' }]
  if (props.staffList && props.staffList.length > 0) {
    props.staffList.forEach(st => {
      options.push({
        label: st.name || `${st.first_name || ''} ${st.last_name || ''}`.trim() || st.email,
        value: st.id,
      })
    })
  }
  return options
})

const priorityOptions = [
  { label: 'All Priorities', value: '' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
]

const hasActiveFilters = computed(() => {
  return (
    !!localSearchQuery.value?.trim() ||
    !!props.selectedStage ||
    !!props.selectedStaff ||
    !!props.selectedCountry ||
    !!props.selectedSource ||
    !!props.selectedPriority ||
    !!props.selectedDate
  )
})
</script>

<template>
  <div class="bg-card-background border border-primary-border rounded-xl p-3 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
    <!-- Title & Icon -->
    <div class="flex items-center gap-2 shrink-0">
      <SlidersHorizontal class="w-4 h-4 text-primary" />
      <span class="text-xs font-semibold text-primary-text uppercase tracking-wider whitespace-nowrap">
        Filter & Search Leads
      </span>
    </div>

    <!-- Filter Inputs & Action Buttons Row -->
    <div class="flex flex-wrap xl:flex-nowrap items-center gap-2.5 flex-1 min-w-0">
      <!-- Search Input -->
      <div class="relative flex-1 min-w-[200px]">
        <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
        <input
          type="text"
          :value="localSearchQuery"
          @input="handleSearchInput"
          placeholder="Search lead name, email, phone..."
          class="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-primary-border rounded-lg text-primary-text placeholder-secondary-text focus:outline-none focus:border-primary transition-colors h-[38px]"
        />
      </div>

      <!-- Stage Filter -->
      <div class="w-full sm:w-44 shrink-0">
        <BaseSelect
          :model-value="selectedStage"
          @update:model-value="emit('update:selectedStage', $event)"
          :options="stageOptions"
          placeholder="All Stages"
          variant="surface"
        />
      </div>

      <!-- Staff Filter -->
      <div class="w-full sm:w-44 shrink-0">
        <BaseSelect
          :model-value="selectedStaff"
          @update:model-value="emit('update:selectedStaff', $event)"
          :options="staffOptions"
          placeholder="All Staff"
          variant="surface"
        />
      </div>

      <!-- Priority Filter -->
      <div class="w-full sm:w-36 shrink-0">
        <BaseSelect
          :model-value="selectedPriority"
          @update:model-value="emit('update:selectedPriority', $event)"
          :options="priorityOptions"
          placeholder="All Priorities"
          variant="surface"
        />
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 shrink-0 ml-auto xl:ml-0">
        <button
          @click="emit('refresh')"
          class="flex items-center gap-1.5 px-3 py-2 h-[38px] rounded-lg text-xs font-medium text-secondary-text hover:text-primary-text bg-background border border-primary-border hover:bg-card-background transition-colors cursor-pointer whitespace-nowrap"
        >
          <RefreshCw class="w-3 h-3" />
          <span>Refresh</span>
        </button>

        <button
          v-if="hasActiveFilters"
          @click="emit('reset-filters')"
          class="flex items-center gap-1.5 px-3 py-2 h-[38px] rounded-lg text-xs font-medium text-secondary-text hover:text-primary-text bg-background border border-primary-border hover:bg-card-background transition-colors cursor-pointer whitespace-nowrap"
        >
          <RotateCcw class="w-3 h-3" />
          <span>Reset Filters</span>
        </button>
      </div>
    </div>
  </div>
</template>
