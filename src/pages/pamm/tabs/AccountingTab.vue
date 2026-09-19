<template>
  <div class="bg-card-background border border-primary-border rounded-lg shadow-sm p-4">
    <div class="flex justify-between items-center mb-4">
      <h3 class="title-text text-primary-text">Accounting Entries</h3>
      <button 
        @click="fetchData(true)"
        class="text-xs text-primary-blue hover:underline"
      >
        Refresh List
      </button>
    </div>
    
    <DataTable
      :data="store.accountingEntries"
      :loading="store.loading"
      :pagination="store.pagination"
    >
      <template #cell-entry_type="{ row }">
        <StatusBadge :status="row.entry_type" />
      </template>
      
      <template #cell-amount="{ row }">
        <span class="font-mono">{{ store.activePAMM?.currency || 'USD' }} {{ Number(row.amount || 0).toFixed(2) }}</span>
      </template>

      <template #cell-units_delta="{ row }">
        <span class="font-mono">{{ Number(row.units_delta || 0).toFixed(6) }}</span>
      </template>

      <template #cell-unit_value="{ row }">
        <span class="font-mono">{{ Number(row.unit_value || 1).toFixed(6) }}</span>
      </template>
      
      <template #cell-created_at="{ row }">
        <span class="text-sm">{{ new Date(row.created_at).toLocaleString() }}</span>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { usePAMMStore } from '@/stores/pamm/pamm';
import DataTable from '@/components/common/DataTable/DataTable.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';

const route = useRoute();
const store = usePAMMStore();
const pammId = route.params.id;

const fetchData = (force = false) => {
  store.fetchAccountingEntries(pammId, force);
};

onMounted(() => {
  fetchData();
});
</script>
