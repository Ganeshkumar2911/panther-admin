<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
  >
    <div class="bg-card-background rounded-2xl border border-primary-border w-full max-w-md shadow-2xl" @click.stop>

      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between">
        <div class="flex items-center gap-2">
          <PlayCircle class="w-4 h-4 text-primary" />
          <h2 class="text-sm font-semibold text-primary-text">Run Settlement</h2>
        </div>
        <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors cursor-pointer" @click="emit('close')">
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <div class="px-6 py-5 space-y-4">
        <div class="bg-background border border-primary-border rounded-xl p-4 space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-xs text-secondary-text">Fund Manager</span>
            <span class="text-xs font-semibold text-primary-text">{{ settlement?.fm_name }} (ID #{{ settlement?.fm_id }})</span>
          </div>
          <div class="border-t border-primary-border" />
          <div class="flex items-center justify-between">
            <span class="text-xs text-secondary-text">Total PnL</span>
            <span class="text-xs font-bold font-mono text-primary-green">${{ fmt(settlement?.summary?.total_pnl ?? settlement?.total_pnl) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-secondary-text">Total Fee</span>
            <span class="text-xs font-semibold font-mono text-primary-text">${{ fmt(settlement?.summary?.total_fee ?? settlement?.total_fee) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-secondary-text">FM Net Share</span>
            <span class="text-xs font-semibold font-mono text-primary-text">${{ fmt(settlement?.summary?.total_fm_net_after_agents) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-secondary-text">Broker Net Share</span>
            <span class="text-xs font-semibold font-mono text-primary-text">${{ fmt(settlement?.summary?.total_broker_net) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-secondary-text">IB Payout</span>
            <span class="text-xs font-semibold font-mono text-primary-green">${{ fmt(settlement?.summary?.total_ib_distributed) }}</span>
          </div>
          <div class="border-t border-primary-border" />
          <div class="flex items-center justify-between">
            <span class="text-xs text-secondary-text">Volume</span>
            <span class="text-xs font-medium text-primary-text">
              {{ settlement?.summary?.total_trades ?? settlement?.total_trades ?? 0 }} trades · {{ settlement?.summary?.unique_followers ?? settlement?.followers?.length ?? 0 }} followers
            </span>
          </div>
        </div>
        <p class="text-xs text-secondary-text">This action will process the settlement and distribute performance fees & commissions. This cannot be undone.</p>
      </div>

      <div class="px-6 py-4 border-t border-primary-border flex gap-3">
        <button
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
          @click="emit('close')"
        >Cancel</button>
        <button
          :disabled="runLoading"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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
  open: { type: Boolean, default: false },
  settlement: { type: Object, default: null },
  runLoading: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'confirm'])
const fmt = (v) => Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
</script>