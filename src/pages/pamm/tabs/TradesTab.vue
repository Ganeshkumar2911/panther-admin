<template>
  <div>
    <div>
      <div class="flex justify-between items-center mb-4">
        <h3 class="title-text text-primary-text">Pool Trades</h3>
      </div>
      
      <DataTable
        :columns="columns"
        :data="store.trades"
        :loading="store.loading"
      >
        <template #cell-mt5_deal_id="{ row }">
          <div class="font-mono font-medium">{{ row.mt5_deal_id }}</div>
          <div class="text-xs text-secondary-text">{{ row.symbol }}</div>
        </template>
        
        <template #cell-volume_lots="{ row }">
          <span class="font-mono">{{ Number(row.volume_lots || 0).toFixed(2) }}</span>
        </template>

        <template #cell-deal_net_pnl="{ row }">
          <span class="font-mono" :class="Number(row.deal_net_pnl) >= 0 ? 'text-primary-green' : 'text-primary-red'">
            {{ Number(row.deal_net_pnl || 0).toFixed(2) }}
          </span>
        </template>
        
        <template #cell-unit_value_at_attribution="{ row }">
          <span class="font-mono">{{ Number(row.unit_value_at_attribution || 1).toFixed(6) }}</span>
        </template>
        
        <template #cell-deal_time="{ row }">
          <span class="text-sm">{{ new Date(row.deal_time).toLocaleString() }}</span>
        </template>

        <template #cell-actions="{ row }">
          <button 
            class="text-xs text-primary hover:underline font-medium"
            @click="viewAllocations(row.id)"
          >
            View Allocations
          </button>
        </template>
      </DataTable>
    </div>

    <TradeAllocationsDrawer 
      v-if="allocationsDrawerOpen"
      :tradeId="selectedTradeId"
      :pammId="pammId"
      @close="allocationsDrawerOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { RefreshCw } from 'lucide-vue-next';
import { usePAMMStore } from '@/stores/pamm/pamm';
import DataTable from '@/components/common/DataTable/DataTable.vue';
import TradeAllocationsDrawer from '../components/TradeAllocationsDrawer.vue';

const route = useRoute();
const store = usePAMMStore();
const pammId = route.params.id;

const allocationsDrawerOpen = ref(false);
const selectedTradeId = ref(null);

const columns = [
  { key: 'mt5_deal_id', label: 'MT5 Deal ID' },
  { key: 'volume_lots', label: 'Volume (Lots)' },
  { key: 'deal_net_pnl', label: 'Net PnL' },
  { key: 'unit_value_at_attribution', label: 'Unit Value (At Trade)' },
  { key: 'deal_time', label: 'Deal Time' },
  { key: 'actions', label: 'Actions', align: 'right' }
];

const fetchData = (force = false) => {
  store.fetchTrades(pammId, force);
};

defineExpose({ fetchData });

onMounted(() => {
  fetchData();
});

const viewAllocations = (tradeId) => {
  selectedTradeId.value = tradeId;
  allocationsDrawerOpen.value = true;
};
</script>
