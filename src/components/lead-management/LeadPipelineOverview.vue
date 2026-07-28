<script setup>
import { computed } from 'vue'
import { STAGES } from '@/pages/lead-management/mockLeadData'
import { Filter, ArrowRight } from 'lucide-vue-next'

const props = defineProps({
  leads: { type: Array, required: true },
  selectedStage: { type: String, default: null },
})

const emit = defineEmits(['select-stage'])

// Compute stage metrics dynamically from current lead set
const stageMetrics = computed(() => {
  const total = props.leads.length || 1
  
  const countsMap = {
    NEW: props.leads.filter(l => l.stage === 'NEW').length,
    ASSIGNED: props.leads.filter(l => l.stage === 'ASSIGNED').length,
    CONTACT_ATTEMPTED: props.leads.filter(l => l.stage === 'CONTACT_ATTEMPTED').length,
    CONTACTED: props.leads.filter(l => l.stage === 'CONTACTED').length,
    INTERESTED: props.leads.filter(l => l.stage === 'INTERESTED').length,
    FOLLOW_UP: props.leads.filter(l => l.stage === 'FOLLOW_UP').length,
    REGISTERED: props.leads.filter(l => l.stage === 'REGISTERED').length,
    KYC_PENDING: props.leads.filter(l => l.stage === 'KYC_PENDING').length,
    KYC_APPROVED: props.leads.filter(l => l.stage === 'KYC_APPROVED').length,
    TRADING_ACCOUNT_CREATED: props.leads.filter(l => l.stage === 'TRADING_ACCOUNT_CREATED').length,
  }

  return STAGES.map((s, idx) => {
    const count = countsMap[s.key] || 0
    const pct = Math.round((count / total) * 100)
    return {
      ...s,
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

    <!-- Stepper Pipeline View -->
    <div class="overflow-x-auto pb-2 pt-1 no-scrollbar">
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
