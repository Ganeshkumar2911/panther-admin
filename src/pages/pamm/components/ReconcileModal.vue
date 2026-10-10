<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div class="bg-card-background rounded-2xl w-full max-w-3xl overflow-hidden shadow-none ring-1 ring-primary-border/30">
      
      <!-- Header -->
      <div class="px-6 py-5 bg-gradient-to-r from-primary/5 via-background to-card-background flex justify-between items-center">
        <div>
          <h3 class="title-text text-primary-text font-bold text-lg">Pool Reconciliation</h3>
          <p class="text-xs text-secondary-text mt-0.5">Automatic MT5 synchronization check</p>
        </div>
        <button
          @click="$emit('close')"
          class="group p-2.5 rounded-full bg-card-background border border-primary-border/60 text-secondary-text cursor-pointer transition-all duration-200 active:scale-95 flex items-center justify-center hover:text-primary-text hover:bg-background"
        >
          <X :size="16" />
        </button>
      </div>
      
      <!-- Body -->
      <div class="p-6">
      
      <div v-if="store.actionLoading" class="flex flex-col items-center justify-center py-12 gap-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <div class="text-sm text-secondary-text animate-pulse">Running reconciliation check...</div>
      </div>
      
      <div v-else-if="store.reconcileReport" class="flex flex-col gap-6">
        
        <!-- Status Banner -->
        <div 
          class="p-4 rounded-xl flex items-center gap-4"
          :class="store.reconcileReport.ok ? 'bg-gradient-to-r from-green-50/50 to-transparent border border-green-100/50 text-green-700' : 'bg-gradient-to-r from-red-50/50 to-transparent border border-red-100/50 text-red-700'"
        >
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm"
            :class="store.reconcileReport.ok ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'"
          >
            <Check v-if="store.reconcileReport.ok" :size="20" />
            <AlertTriangle v-else :size="20" />
          </div>
          <div>
            <h4 class="font-bold text-sm">
              {{ store.reconcileReport.ok ? 'Reconciliation Successful' : 'Mismatch Detected' }}
            </h4>
            <p class="text-xs opacity-80 mt-1">
              {{ store.reconcileReport.ok ? 'MT5 balances and internal pool values are perfectly aligned.' : 'There is a discrepancy between MT5 and internal records.' }}
            </p>
          </div>
        </div>

        <div v-if="store.reconcileReport.mismatches?.length" class="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-100/50">
          <ul class="list-disc pl-5 space-y-1">
            <li v-for="(err, i) in store.reconcileReport.mismatches" :key="i" class="font-medium">{{ err }}</li>
          </ul>
        </div>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div class="p-4 rounded-xl bg-gradient-to-br from-background/80 to-background/30 flex flex-col justify-center border border-primary-border/20">
            <div class="text-[11px] text-secondary-text mb-1.5 uppercase tracking-wider font-semibold">MT5 Equity</div>
            <div class="font-mono text-primary-text font-bold text-lg">{{ Number(store.reconcileReport.mt5_equity || 0).toFixed(2) }}</div>
          </div>
          <div class="p-4 rounded-xl bg-gradient-to-br from-background/80 to-background/30 flex flex-col justify-center border border-primary-border/20">
            <div class="text-[11px] text-secondary-text mb-1.5 uppercase tracking-wider font-semibold">MT5 Balance</div>
            <div class="font-mono text-primary-text font-bold text-lg">{{ Number(store.reconcileReport.mt5_balance || 0).toFixed(2) }}</div>
          </div>
          <div class="p-4 rounded-xl bg-gradient-to-br from-background/80 to-background/30 flex flex-col justify-center border border-primary-border/20">
            <div class="text-[11px] text-secondary-text mb-1.5 uppercase tracking-wider font-semibold">MT5 Floating PnL</div>
            <div class="font-mono font-bold text-lg" :class="Number(store.reconcileReport.mt5_floating_pnl) < 0 ? 'text-primary-red' : 'text-primary-green'">
              {{ Number(store.reconcileReport.mt5_floating_pnl || 0).toFixed(2) }}
            </div>
          </div>
          <div class="p-4 rounded-xl bg-gradient-to-br from-background/80 to-background/30 flex flex-col justify-center border border-primary-border/20">
            <div class="text-[11px] text-secondary-text mb-1.5 uppercase tracking-wider font-semibold">MT5 Margin Free</div>
            <div class="font-mono text-primary-text font-bold text-lg">{{ Number(store.reconcileReport.mt5_margin_free || 0).toFixed(2) }}</div>
          </div>
          <div class="p-4 rounded-xl bg-gradient-to-br from-background/80 to-background/30 flex flex-col justify-center border border-primary-border/20">
            <div class="text-[11px] text-secondary-text mb-1.5 uppercase tracking-wider font-semibold">Total PAMM Units</div>
            <div class="font-mono text-primary-text font-bold text-lg">{{ Number(store.reconcileReport.total_pamm_units || 0).toFixed(6) }}</div>
          </div>
          <div class="p-4 rounded-xl bg-gradient-to-br from-background/80 to-background/30 flex flex-col justify-center border border-primary-border/20">
            <div class="text-[11px] text-secondary-text mb-1.5 uppercase tracking-wider font-semibold">Participant Units</div>
            <div class="font-mono text-primary-text font-bold text-lg">{{ Number(store.reconcileReport.sum_participant_units || 0).toFixed(6) }}</div>
          </div>
        </div>
      </div>
      <div v-else class="flex flex-col items-center justify-center py-12 text-secondary-text">
        <AlertTriangle :size="32" class="opacity-40 mb-3" />
        <p>Failed to load reconciliation report.</p>
      </div>
      
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { X, Check, AlertTriangle } from 'lucide-vue-next';
import { usePAMMStore } from '@/stores/pamm/pamm';

const props = defineProps({
  pammId: {
    type: [Number, String],
    required: true,
  }
});

const emit = defineEmits(['close']);
const store = usePAMMStore();

onMounted(() => {
  store.reconcilePAMM(props.pammId);
});
</script>
