<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
  >
    <div class="bg-card-background rounded-2xl border border-primary-border w-full max-w-md" @click.stop>

      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between">
        <div class="flex items-center gap-2">
          <PlayCircle class="w-4 h-4 text-secondary-text" />
          <h2 class="text-sm font-semibold text-primary-text">Run Settlement</h2>
        </div>
        <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors" @click="emit('close')">
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <div class="px-6 py-5 space-y-4">
        <div class="bg-background border border-primary-border rounded-xl p-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs text-secondary-text">FM Name</span>
            <span class="text-xs font-semibold text-primary-text">{{ settlement?.fm_name ?? '—' }}</span>
          </div>
          <div class="border-t border-primary-border" />
          <div class="flex items-center justify-between">
            <span class="text-xs text-secondary-text">Total PnL</span>
            <span class="text-xs font-semibold text-primary-green">${{ fmt(settlement?.total_pnl) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-secondary-text">Total Fee</span>
            <span class="text-xs font-semibold text-primary-text">${{ fmt(settlement?.total_fee) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-secondary-text">Total Trades</span>
            <span class="text-xs font-semibold text-primary-text">{{ settlement?.total_trades ?? 0 }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-secondary-text">Followers</span>
            <span class="text-xs font-semibold text-primary-text">{{ settlement?.followers?.length ?? 0 }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-secondary-text">IB Distributions</span>
            <span class="text-xs font-semibold text-primary-text">{{ settlement?.ib_distribution?.length ?? 0 }}</span>
          </div>
        </div>
        <p class="text-xs text-secondary-text">This action will process the settlement and distribute commissions. This cannot be undone.</p>
      </div>

      <div class="px-6 py-4 border-t border-primary-border flex gap-3">
        <button
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors"
          @click="emit('close')"
        >Cancel</button>
        <button
          :disabled="runLoading"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-black bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          @click="emit('confirm')"
        >
          <Loader2 v-if="runLoading" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ runLoading ? 'Running...' : 'Confirm & Run' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { X, PlayCircle, Loader2 } from 'lucide-vue-next'

defineProps({
  open:       { type: Boolean, default: false },
  settlement: { type: Object,  default: null  },
  runLoading: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'confirm'])
const fmt = (v) => (v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
</script>