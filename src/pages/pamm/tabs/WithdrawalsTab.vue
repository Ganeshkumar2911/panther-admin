<template>
  <div>
    <div class="bg-card-background border border-primary-border rounded-lg shadow-sm p-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="title-text text-primary-text">Pending Withdrawals</h3>
        <button 
          @click="fetchData(true)"
          class="text-xs text-primary-blue hover:underline"
        >
          Refresh List
        </button>
      </div>
      
      <DataTable
        :data="store.pendingWithdrawals"
        :loading="store.loading"
        :pagination="store.pagination"
      >
        <template #cell-reference_id="{ row }">
          <div class="font-mono text-xs">{{ row.reference_id }}</div>
          <div class="text-xs text-secondary-text">User #{{ row.user_id }}</div>
        </template>
        
        <template #cell-status="{ row }">
          <StatusBadge :status="row.status" />
        </template>
        
        <template #cell-requested_amount="{ row }">
          <span class="font-mono">{{ store.activePAMM?.currency || 'USD' }} {{ Number(row.requested_amount || 0).toFixed(2) }}</span>
        </template>
        
        <template #cell-created_at="{ row }">
          <span class="text-sm">{{ new Date(row.created_at).toLocaleString() }}</span>
        </template>

        <template #cell-actions="{ row }">
          <div class="flex gap-2" v-if="row.status === 'PENDING'">
            <button 
              class="text-xs text-primary-green hover:underline font-medium disabled:opacity-50"
              :disabled="store.actionLoading"
              @click="approveRequest(row.id)"
            >
              Approve
            </button>
            <span class="text-primary-border">|</span>
            <button 
              class="text-xs text-primary-red hover:underline font-medium disabled:opacity-50"
              :disabled="store.actionLoading"
              @click="openRejectModal(row.id)"
            >
              Reject
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <RejectWithdrawalModal 
      v-if="rejectModalOpen"
      :operationId="selectedOperationId"
      :pammId="pammId"
      @close="rejectModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { usePAMMStore } from '@/stores/pamm/pamm';
import { useSnackbarStore } from '@/stores/snackbar/snackbar';
import DataTable from '@/components/common/DataTable/DataTable.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import RejectWithdrawalModal from '../components/RejectWithdrawalModal.vue';

const route = useRoute();
const store = usePAMMStore();
const snackbar = useSnackbarStore();
const pammId = route.params.id;

const rejectModalOpen = ref(false);
const selectedOperationId = ref(null);

const fetchData = (force = false) => {
  store.fetchPendingWithdrawals(pammId, force);
};

onMounted(() => {
  fetchData();
});

const approveRequest = async (opId) => {
  if (confirm('Are you sure you want to approve this withdrawal request? Cash will be moved.')) {
    await store.approveWithdrawal(opId, pammId);
  }
};

const openRejectModal = (opId) => {
  selectedOperationId.value = opId;
  rejectModalOpen.value = true;
};
</script>
