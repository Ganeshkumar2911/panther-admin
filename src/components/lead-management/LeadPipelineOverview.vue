<script setup>
import { computed } from 'vue'
import { Filter, ArrowRight } from 'lucide-vue-next'

const props = defineProps({
  leads: { type: Array, default: () => [] },
  stages: { type: Array, default: () => [] },
  stageCounts: { type: Object, default: () => ({}) },
  selectedStage: { type: String, default: null },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['select-stage'])

// Compute stage metrics dynamically from stageCounts / current lead set and provided stages
const stageMetrics = computed(() => {
  const activeStagesList = (props.stages && props.stages.length > 0)
    ? props.stages.filter(s => s.is_active !== false)
    : []

  const total = activeStagesList.reduce((acc, s) => {
    const key = s.code || s.key
    const countVal = props.stageCounts[key] ?? props.stageCounts[s.id] ?? props.stageCounts[s.code]
    const count = countVal !== undefined
      ? Number(countVal)
      : props.leads.filter(l => (l.current_stage?.code || l.stage) === key).length
    return acc + count
  }, 0) || props.leads.length || 1

  return activeStagesList.map((s, idx) => {
    const key = s.code || s.key
    const label = s.name || s.label || s.key
    const countVal = props.stageCounts[key] ?? props.stageCounts[s.id] ?? props.stageCounts[s.code]
    const count = countVal !== undefined
      ? Number(countVal)
      : props.leads.filter(l => (l.current_stage?.code || l.stage) === key).length
    const pct = Math.round((count / total) * 100)

    return {
      ...s,
      key,
      label,
      stepNumber: idx + 1,
      count,
      pct,
    }
  })
})

function handleStageClick(key) {
  if (props.selectedStage === key) {
    emit('select-stage', null)
  } else {
    emit('select-stage', key)
  }
}
</script>

<template>
  <div class="bg-card-background border border-primary-border rounded-xl p-5 space-y-4">
    <!-- Minimal Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xs font-bold uppercase tracking-wider text-primary-text">
          Onboarding Process Stepper
        </h2>
        <p class="text-[11px] text-secondary-text mt-0.5">
          Select a step to filter leads by onboarding stage
        </p>
      </div>

      <button
        v-if="selectedStage"
        @click="emit('select-stage', null)"
        class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 font-medium transition-colors cursor-pointer"
      >
        <Filter class="w-3 h-3" />
        <span>Clear Filter ({{ selectedStage }})</span>
      </button>
    </div>

    <!-- Stepper Skeleton Loader -->
    <div v-if="loading" class="overflow-x-auto pb-2 pt-1 no-scrollbar">
      <div class="flex items-start min-w-[950px] justify-between relative px-2 py-2">
        <div
          v-for="n in 6"
          :key="n"
          class="flex-1 flex flex-col items-center relative animate-pulse"
        >
          <!-- Connector Line Placeholder -->
          <div
            v-if="n < 6"
            class="absolute top-4 left-[50%] right-[-50%] h-[2px] bg-primary-border/40 z-0"
          />

          <!-- Circle Node Placeholder -->
          <div class="relative z-10 w-8 h-8 rounded-full bg-primary-border/60 border-2 border-primary-border/40 shrink-0" />

          <!-- Step Title & Metrics Placeholder -->
          <div class="mt-2.5 flex flex-col items-center gap-1.5 w-full">
            <div class="h-3 w-16 bg-primary-border/50 rounded" />
            <div class="h-4 w-12 bg-primary-border/30 rounded-md" />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="stageMetrics.length === 0"
      class="py-6 text-center text-xs text-secondary-text border border-dashed border-primary-border/60 rounded-lg"
    >
      No active stages found. Manage stages to configure your onboarding pipeline.
    </div>

    <!-- Stepper Pipeline View -->
    <div v-else class="overflow-x-auto pb-2 pt-1 no-scrollbar">
      <div class="flex items-start min-w-[950px] justify-between relative px-2">
        <div
          v-for="(stg, i) in stageMetrics"
          :key="stg.key"
          @click="handleStageClick(stg.key)"
          class="flex-1 flex flex-col items-center relative group cursor-pointer select-none"
        >
          <!-- Connector Line & Enhanced Arrow to next step -->
          <div
            v-if="i < stageMetrics.length - 1"
            class="absolute top-4 left-[50%] right-[-50%] h-[2px] z-0 flex items-center justify-center transition-colors"
            :class="[
              selectedStage === stg.key ? 'bg-primary' : 'bg-primary-border group-hover:bg-primary/40'
            ]"
          >
            <div
              :class="[
                'w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-200 z-10 shrink-0 shadow-xs group-hover:scale-110 group-hover:translate-x-0.5',
                selectedStage === stg.key
                  ? 'bg-primary text-white border-primary shadow-sm shadow-primary/30'
                  : 'bg-card-background text-secondary-text border-primary-border group-hover:border-primary/60 group-hover:text-primary'
              ]"
            >
              <ArrowRight class="w-3 h-3" />
            </div>
          </div>

          <!-- Step Circle Node -->
          <div
            :class="[
              'relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 border-2',
              selectedStage === stg.key
                ? 'bg-primary border-primary text-white shadow-primary/30 scale-110'
                : 'bg-background border-primary-border text-secondary-text group-hover:border-primary/50 group-hover:text-primary-text'
            ]"
          >
            <span>{{ stg.stepNumber }}</span>
          </div>

          <!-- Step Title & Metrics -->
          <div class="mt-2.5 text-center px-1">
            <p
              :class="[
                'text-[11px] font-semibold tracking-tight uppercase transition-colors line-clamp-1',
                selectedStage === stg.key ? 'text-primary font-bold' : 'text-primary-text group-hover:text-primary'
              ]"
            >
              {{ stg.label }}
            </p>

            <div class="mt-1 flex items-center justify-center gap-1.5">
              <span
                :class="[
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-md border',
                  selectedStage === stg.key
                    ? 'bg-primary/20 text-primary border-primary/30'
                    : 'bg-background text-secondary-text border-primary-border/60'
                ]"
              >
                {{ stg.count }}
              </span>
              <span class="text-[10px] text-secondary-text font-medium">
                {{ stg.pct }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
