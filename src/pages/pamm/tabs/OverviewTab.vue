<template>
  <div>
    <!-- Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-card-background border border-primary-border rounded-lg shadow-sm p-4">
        <div class="text-sm text-secondary-text mb-1">Total Pool Value</div>
        <div class="text-xl font-bold text-primary-text font-mono">
          {{ store.activePAMM?.currency || 'USD' }} {{ Number(store.activePAMM?.total_pamm_value || 0).toFixed(2) }}
        </div>
      </div>
      
      <div class="bg-card-background border border-primary-border rounded-lg shadow-sm p-4">
        <div class="text-sm text-secondary-text mb-1">Total PAMM Units</div>
        <div class="text-xl font-bold text-primary-text font-mono">
          {{ Number(store.activePAMM?.total_pamm_units || 0).toFixed(6) }}
        </div>
      </div>
      
      <div class="bg-card-background border border-primary-border rounded-lg shadow-sm p-4">
        <div class="text-sm text-secondary-text mb-1">Current Unit Value</div>
        <div class="text-xl font-bold text-primary-text font-mono">
          {{ Number(store.activePAMM?.unit_value || 1).toFixed(6) }}
        </div>
      </div>

      <div class="bg-card-background border border-primary-border rounded-lg shadow-sm p-4 flex flex-col justify-center gap-2">
        <button 
          @click="isReconcileModalOpen = true"
          class="w-full bg-card-background border border-primary-border hover:bg-gray-50 text-primary-text px-3 py-1.5 rounded text-sm font-medium transition-colors"
        >
          Reconcile Pool
        </button>
        <button 
          @click="isSettlementModalOpen = true"
          class="w-full bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
        >
          Run Settlement
        </button>
      </div>
    </div>

    <!-- Participants Table -->
    <div class="bg-card-background border border-primary-border rounded-lg shadow-sm p-4">
      <h3 class="title-text text-primary-text mb-4">Participants</h3>
      
      <DataTable
        :data="store.activeParticipants"
        :loading="store.detailLoading"
        :pagination="store.pagination"
      >
        <template #cell-user_id="{ row }">
          <div class="font-medium text-primary-text">User #{{ row.user_id }}</div>
          <div v-if="row.is_master_participant" class="text-xs text-primary-blue">Master</div>
        </template>
        
        <template #cell-status="{ row }">
          <StatusBadge :status="row.status" />
        </template>
        
        <template #cell-units="{ row }">
          <span class="font-mono">{{ Number(row.units || 0).toFixed(6) }}</span>
        </template>
        
        <template #cell-participant_value="{ row }">
          <span class="font-mono">{{ store.activePAMM?.currency || 'USD' }} {{ Number(row.participant_value || 0).toFixed(2) }}</span>
        </template>
        
        <template #cell-ownership_percentage="{ row }">
          <span class="font-mono">{{ Number(row.ownership_percentage || 0).toFixed(2) }}%</span>
        </template>
      </DataTable>
    </div>

    <ReconcileModal 
      v-if="isReconcileModalOpen" 
      :pammId="pammId"
      @close="isReconcileModalOpen = false" 
    />
    
    <RunSettlementModal 
      v-if="isSettlementModalOpen" 
      :pammId="pammId"
      @close="isSettlementModalOpen = false" 
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { usePAMMStore } from '@/stores/pamm/pamm';
import DataTable from '@/components/common/DataTable/DataTable.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import ReconcileModal from '../components/ReconcileModal.vue';
import RunSettlementModal from '../components/RunSettlementModal.vue';

const route = useRoute();
const store = usePAMMStore();
const pammId = route.params.id;

const isReconcileModalOpen = ref(false);
const isSettlementModalOpen = ref(false);
</script>
