<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div class="bg-card-background rounded-xl shadow-xl w-full max-w-2xl border border-primary-border overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-primary-border flex justify-between items-center">
        <h3 class="title-text text-primary-text font-semibold">Pool Reconciliation Report</h3>
        <button
          @click="$emit('close')"
          class="text-secondary-text hover:text-primary-text p-1 rounded-lg transition-colors cursor-pointer"
        >
          &times;
        </button>
      </div>
      
      <!-- Body -->
      <div class="p-6">
      
      <div v-if="store.actionLoading" class="flex justify-center p-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
      
      <div v-else-if="store.reconcileReport">
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="p-3 border border-primary-border rounded bg-gray-50 dark:bg-slate-800">
            <div class="text-xs text-secondary-text mb-1">MT5 Equity</div>
            <div class="font-mono text-primary-text">{{ Number(store.reconcileReport.mt5_equity || 0).toFixed(2) }}</div>
          </div>
          <div class="p-3 border border-primary-border rounded bg-gray-50 dark:bg-slate-800">
            <div class="text-xs text-secondary-text mb-1">MT5 Balance</div>
            <div class="font-mono text-primary-text">{{ Number(store.reconcileReport.mt5_balance || 0).toFixed(2) }}</div>
          </div>
          <div class="p-3 border border-primary-border rounded bg-gray-50 dark:bg-slate-800">
            <div class="text-xs text-secondary-text mb-1">MT5 Floating PnL</div>
            <div class="font-mono text-primary-text">{{ Number(store.reconcileReport.mt5_floating_pnl || 0).toFixed(2) }}</div>
          </div>
          <div class="p-3 border border-primary-border rounded bg-gray-50 dark:bg-slate-800">
            <div class="text-xs text-secondary-text mb-1">MT5 Margin Free</div>
            <div class="font-mono text-primary-text">{{ Number(store.reconcileReport.mt5_margin_free || 0).toFixed(2) }}</div>
          </div>
          <div class="p-3 border border-primary-border rounded bg-gray-50 dark:bg-slate-800">
            <div class="text-xs text-secondary-text mb-1">Total PAMM Units</div>
            <div class="font-mono text-primary-text">{{ Number(store.reconcileReport.total_pamm_units || 0).toFixed(6) }}</div>
          </div>
          <div class="p-3 border border-primary-border rounded bg-gray-50 dark:bg-slate-800">
            <div class="text-xs text-secondary-text mb-1">Sum Participant Units</div>
            <div class="font-mono text-primary-text">{{ Number(store.reconcileReport.sum_participant_units || 0).toFixed(6) }}</div>
          </div>
        </div>
        
        <div class="mb-4">
          <h4 class="font-medium text-primary-text mb-2 flex items-center gap-2">
            Status:
            <span :class="store.reconcileReport.ok ? 'text-primary-green' : 'text-primary-red'">
              {{ store.reconcileReport.ok ? 'OK (Matches)' : 'MISMATCH DETECTED' }}
            </span>
          </h4>
        </div>
        
        <div v-if="store.reconcileReport.mismatches?.length" class="bg-red-50 text-red-700 p-3 rounded text-sm mb-4 border border-red-200">
          <ul class="list-disc pl-5">
            <li v-for="(err, i) in store.reconcileReport.mismatches" :key="i">{{ err }}</li>
          </ul>
        </div>

      </div>
      <div v-else class="text-center p-8 text-secondary-text">
        Failed to load report.
      </div>
      
      </div>
      
      <!-- Footer -->
      <div class="px-6 py-4 border-t border-primary-border flex justify-end bg-background/50">
        <button 
          @click="$emit('close')"
          class="bg-card-background border border-primary-border text-primary-text hover:bg-background px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
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
