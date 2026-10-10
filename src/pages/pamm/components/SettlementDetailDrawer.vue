<template>
  <div class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>
  <div class="fixed top-0 right-0 z-50 h-full w-full md:w-[700px] bg-card-background shadow-xl flex flex-col transform transition-transform duration-300">
    <div class="p-4 border-b border-primary-border flex justify-between items-center bg-card-background">
      <h2 class="title-text text-primary-text">Settlement Details</h2>
      <button @click="$emit('close')" class="text-secondary-text hover:text-primary-text text-xl font-medium">&times;</button>
    </div>

    <div class="flex-1 overflow-y-auto p-4 bg-background space-y-4">
      <div v-if="store.detailLoading" class="flex justify-center p-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
      
      <div v-else-if="store.activeSettlement">
        <!-- Settlement Info -->
        <div class="bg-card-background border border-primary-border rounded p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-primary-text">Key: <span class="font-mono font-medium">{{ store.activeSettlement.settlement_key }}</span></h3>
            <StatusBadge :status="store.activeSettlement.status" />
          </div>
          
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <div class="text-[11px] text-secondary-text uppercase tracking-wider">Valuation Snapshot</div>
              <div class="font-mono text-sm font-medium text-primary-text">#{{ store.activeSettlement.valuation_snapshot_id || 'N/A' }}</div>
            </div>
            <div>
              <div class="text-[11px] text-secondary-text uppercase tracking-wider">Unit Value</div>
              <div class="font-mono text-sm text-primary-blue font-bold">{{ Number(store.activeSettlement.unit_value || 0).toFixed(6) }}</div>
            </div>
            <div>
              <div class="text-[11px] text-secondary-text uppercase tracking-wider">Total PAMM Value</div>
              <div class="font-mono text-sm font-medium">${{ Number(store.activeSettlement.total_pamm_value || 0).toFixed(2) }}</div>
            </div>
            <div>
              <div class="text-[11px] text-secondary-text uppercase tracking-wider">Participants</div>
              <div class="text-sm font-medium text-primary-text">{{ store.activeSettlement.participant_count || 0 }}</div>
            </div>
            <div>
              <div class="text-[11px] text-secondary-text uppercase tracking-wider">Batches</div>
              <div class="text-sm font-medium text-primary-text">{{ store.activeSettlement.completed_batch_count || 0 }} / {{ store.activeSettlement.batch_count || 0 }}</div>
            </div>
            <div>
              <div class="text-[11px] text-secondary-text uppercase tracking-wider">Finalized</div>
              <div class="text-sm font-medium text-primary-text">{{ store.activeSettlement.finalized_at ? new Date(store.activeSettlement.finalized_at).toLocaleString() : 'N/A' }}</div>
            </div>
          </div>
        </div>

        <h3 class="font-medium text-primary-text mt-4 mb-2">Batches</h3>
        
        <div v-if="!store.activeSettlement.batches || store.activeSettlement.batches.length === 0" class="text-sm text-secondary-text py-4 text-center">
          No batches found.
        </div>

        <div v-else class="space-y-6">
          <div 
            v-for="batch in store.activeSettlement.batches" 
            :key="batch.id"
            class="bg-card-background border border-primary-border rounded overflow-hidden"
          >
            <!-- Batch Header -->
            <div class="p-3 border-b border-primary-border bg-background/50 flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-3">
                <span class="font-semibold text-sm text-primary-text">Batch #{{ batch.batch_index }}</span>
                <StatusBadge :status="batch.status" />
              </div>
              <div class="text-xs text-secondary-text flex items-center gap-3">
                <span>{{ batch.participant_count }} participants</span>
                <span v-if="batch.failure_reason" class="text-primary-red">Error: {{ batch.failure_reason }}</span>
              </div>
            </div>

            <!-- Participants Table -->
            <DataTable
              v-if="batch.participants && batch.participants.length > 0"
              :columns="columns"
              :data="batch.participants"
              :loading="false"
              :has-actions="true"
              :pagination="{ page: 1, per_page: 500, total: batch.participants.length, pages: 1 }"
            >
              <template #cell-participant_id="{ row }">
                <span class="font-mono text-xs">#{{ row.participant_id }}</span>
              </template>
              
              <template #cell-user_id="{ row }">
                <span class="font-medium text-xs">User #{{ row.user_id }}</span>
              </template>

              <template #cell-units="{ row }">
                <span class="font-mono text-xs">{{ Number(row.units || 0).toFixed(6) }}</span>
              </template>
              
              <template #cell-participant_value="{ row }">
                <span class="font-mono text-xs font-medium text-primary-text">${{ Number(row.participant_value || 0).toFixed(2) }}</span>
              </template>

              <template #cell-actions="{ row }">
                <button 
                  v-if="hasManagePermission"
                  class="text-[11px] text-primary hover:underline font-medium border border-primary-border px-2 py-1 rounded bg-background"
                  @click="rerunParticipant(row)"
                  :disabled="store.actionLoading"
                >
                  Rerun line
                </button>
              </template>
            </DataTable>
            <div v-else class="p-4 text-xs text-secondary-text text-center">
              No participants in this batch.
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center p-8 text-secondary-text">
        Settlement not found.
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { usePAMMSettlementStore } from '@/stores/pamm/pammSettlement';
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import DataTable from '@/components/common/DataTable/DataTable.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';

const props = defineProps({
  pammId: {
    type: [Number, String],
    required: true,
  },
  settlementId: {
    type: [Number, String],
    required: true,
  }
});

const emit = defineEmits(['close']);
const store = usePAMMSettlementStore();
const { hasPermission } = usePermissionCheck();

const hasManagePermission = computed(() => {
  return hasPermission("pamm.manage");
});

const columns = [
  { key: 'participant_id', label: 'Participant ID' },
  { key: 'user_id', label: 'User ID' },
  { key: 'units', label: 'Units' },
  { key: 'participant_value', label: 'Value' },
  { key: 'actions', label: 'Actions', align: 'right' }
];

onMounted(() => {
  store.fetchSettlementDetail(props.pammId, props.settlementId);
});

const rerunParticipant = (row) => {
  if (confirm("Refresh this participant's checkpoint using frozen settlement unit value and current units. Does not create a new settlement.")) {
    store.rerunParticipant(props.pammId, props.settlementId, row.participant_id);
  }
};
</script>
