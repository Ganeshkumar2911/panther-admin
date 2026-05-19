<script setup>
/**
 * SettlementSection — Settlement Analytics (Section 6)
 * API: dashboard.settlement_summary
 *   { completed, failed, pending, total_fees }
 *
 * NOTE: Existing reusable settlement table component
 * will be integrated via the #settlement-table slot.
 */
import { computed } from 'vue'
import MetricCard from '@/components/common/MetricCard.vue'

const props = defineProps({
  data:    { type: Object,  default: () => ({}) }, // settlement_summary
  loading: { type: Boolean, default: false },
})

function fmt(v) {
  return `$${Number(v ?? 0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const cards = computed(() => [
  {
    title:   'Completed',
    value:   props.data.completed ?? 0,
    subtext: 'Successful settlements',
    change:  null,
  },
  {
    title:   'Pending',
    value:   props.data.pending ?? 0,
    subtext: 'Awaiting processing',
    change:  null,
  },
  {
    title:   'Failed',
    value:   props.data.failed ?? 0,
    subtext: 'Require attention',
    change:  null,
  },
  {
    title:   'Total Fees',
    value:   fmt(props.data.total_fees),
    subtext: 'Settlement fees generated',
    change:  null,
  },
])
</script>

<template>
  <section>
    <div class="flex items-center gap-3 mb-4">
      <p class="text-[10px] font-semibold uppercase tracking-[0.15em] text-secondary-text">Settlement Analytics</p>
      <span class="flex-1 h-px bg-primary-border" />
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
      <MetricCard
        v-for="(card, i) in cards"
        :key="i"
        v-bind="card"
        :loading="loading"
      />
    </div>

    <!-- ─────────────────────────────────────────────────────────
         SETTLEMENT TABLE SLOT
         Drop in your existing table component like:
         <template #settlement-table>
           <YourSettlementTable />
         </template>
         ───────────────────────────────────────────────────────── -->
    <div class="bg-card-background border border-primary-border rounded-2xl overflow-hidden">
      <slot name="settlement-table">
        <!-- Placeholder until table is connected -->
        <div class="flex flex-col items-center justify-center py-14 gap-3 text-secondary-text">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" class="opacity-20">
            <rect x="2" y="6" width="32" height="24" rx="3" stroke="currentColor" stroke-width="1.5"/>
            <path d="M2 12h32" stroke="currentColor" stroke-width="1.5"/>
            <path d="M10 12v18M18 12v18M26 12v18" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2"/>
          </svg>
          <div class="text-center">
            <p class="text-xs font-medium">Settlement Records Table</p>
            <p class="text-[10px] text-secondary-text/50 mt-0.5">Reusable table component integrates here via slot</p>
          </div>
        </div>
      </slot>
    </div>
  </section>
</template>