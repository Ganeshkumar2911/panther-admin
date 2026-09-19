<template>
  <div class="fixed inset-0 z-40 bg-black bg-opacity-50" @click="$emit('close')"></div>
  <div class="fixed top-0 right-0 z-50 h-full w-full md:w-[600px] bg-card-background shadow-xl flex flex-col transform transition-transform duration-300">
    <div class="p-4 border-b border-primary-border flex justify-between items-center bg-card-background">
      <h2 class="title-text text-primary-text">Trade Allocations</h2>
      <button @click="$emit('close')" class="text-secondary-text hover:text-primary-text">&times;</button>
    </div>

    <div class="flex-1 overflow-y-auto p-4 bg-background">
      <div v-if="store.detailLoading" class="flex justify-center p-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
      
      <div v-else-if="store.activeTrade">
        <div class="bg-card-background border border-primary-border rounded p-4 mb-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-xs text-secondary-text">MT5 Deal ID</div>
              <div class="font-mono text-sm text-primary-text">{{ store.activeTrade.mt5_deal_id }}</div>
            </div>
            <div>
              <div class="text-xs text-secondary-text">Symbol</div>
              <div class="text-sm font-medium text-primary-text">{{ store.activeTrade.symbol }}</div>
            </div>
            <div>
              <div class="text-xs text-secondary-text">Deal Net PnL</div>
              <div class="font-mono text-sm" :class="Number(store.activeTrade.deal_net_pnl) >= 0 ? 'text-primary-green' : 'text-primary-red'">
                {{ Number(store.activeTrade.deal_net_pnl || 0).toFixed(2) }}
              </div>
            </div>
            <div>
              <div class="text-xs text-secondary-text">Total PAMM Units</div>
              <div class="font-mono text-sm text-primary-text">{{ Number(store.activeTrade.total_pamm_units || 0).toFixed(6) }}</div>
            </div>
          </div>
        </div>

        <h3 class="font-medium text-primary-text mb-3">Participant Splits</h3>
        
        <div class="bg-card-background border border-primary-border rounded overflow-hidden">
          <DataTable
            :data="store.tradeAllocations"
            :loading="false"
            :pagination="{ page: 1, per_page: 200, total: store.tradeAllocations.length, pages: 1 }"
          >
            <template #cell-user_id="{ row }">
              <span class="font-medium">User #{{ row.user_id }}</span>
            </template>
            
            <template #cell-ownership_percentage="{ row }">
              <span class="font-mono">{{ Number(row.ownership_percentage || 0).toFixed(2) }}%</span>
            </template>
            
            <template #cell-allocated_pnl="{ row }">
              <span class="font-mono" :class="Number(row.allocated_pnl) >= 0 ? 'text-primary-green' : 'text-primary-red'">
                {{ Number(row.allocated_pnl || 0).toFixed(2) }}
              </span>
            </template>

            <template #cell-units_at_attribution="{ row }">
              <span class="font-mono">{{ Number(row.units_at_attribution || 0).toFixed(6) }}</span>
            </template>
          </DataTable>
        </div>
      </div>
      
      <div v-else class="text-center p-8 text-secondary-text">
        Trade not found.
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { usePAMMStore } from '@/stores/pamm/pamm';
import DataTable from '@/components/common/DataTable/DataTable.vue';

const props = defineProps({
  tradeId: {
    type: [Number, String],
    required: true,
  },
  pammId: {
    type: [Number, String],
    required: true,
  }
});

const emit = defineEmits(['close']);
const store = usePAMMStore();

onMounted(() => {
  store.fetchTradeAllocations(props.pammId, props.tradeId, true);
});
</script>
