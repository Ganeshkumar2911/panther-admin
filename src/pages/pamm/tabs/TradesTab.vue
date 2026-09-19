<template>
  <div>
    <div class="bg-card-background border border-primary-border rounded-lg shadow-sm p-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="title-text text-primary-text">Pool Trades</h3>
        <button 
          @click="fetchData(true)"
          class="text-xs text-primary-blue hover:underline"
        >
          Refresh List
        </button>
      </div>
      
      <DataTable
        :data="store.trades"
        :loading="store.loading"
        :pagination="store.pagination"
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
import { usePAMMStore } from '@/stores/pamm/pamm';
import DataTable from '@/components/common/DataTable/DataTable.vue';
import TradeAllocationsDrawer from '../components/TradeAllocationsDrawer.vue';

const route = useRoute();
const store = usePAMMStore();
const pammId = route.params.id;

const allocationsDrawerOpen = ref(false);
const selectedTradeId = ref(null);

const fetchData = (force = false) => {
  store.fetchTrades(pammId, force);
};

onMounted(() => {
  fetchData();
});

const viewAllocations = (tradeId) => {
  selectedTradeId.value = tradeId;
  allocationsDrawerOpen.value = true;
};
</script>
