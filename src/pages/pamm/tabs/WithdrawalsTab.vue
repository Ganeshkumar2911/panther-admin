<template>
  <div>
    <div>
      <div class="flex justify-between items-center mb-4">
        <h3 class="title-text text-primary-text">Pending Withdrawals</h3>
      </div>
      
      <DataTable
        :columns="columns"
        :data="store.pendingWithdrawals"
        :loading="store.loading"
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
          <div class="flex gap-2" v-if="row.status === 'PENDING' && hasPermission('pamm.approve_withdrawal')">
            <button 
              class="text-xs text-primary-green hover:underline font-medium disabled:opacity-50 cursor-pointer"
              :disabled="store.actionLoading"
              @click="openApproveModal(row)"
            >
              Approve
            </button>
            <span class="text-primary-border">|</span>
            <button 
              class="text-xs text-primary-red hover:underline font-medium disabled:opacity-50 cursor-pointer"
              :disabled="store.actionLoading"
              @click="openRejectModal(row.id)"
            >
              Reject
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Approve Confirmation Dialog -->
    <ConfirmationDialog
      :open="showApproveDialog"
      title="Approve PAMM Withdrawal"
      :message="`Are you sure you want to approve this withdrawal request (${selectedOperation?.reference_id || '#' + selectedOperation?.id}) for ${store.activePAMM?.currency || 'USD'} ${Number(selectedOperation?.requested_amount || 0).toFixed(2)}? Cash will be transferred from the master MT5 account.`"
      confirm-text="Approve Withdrawal"
      type="success"
      :loading="store.actionLoading"
      @confirm="handleConfirmApprove"
      @cancel="showApproveDialog = false"
    />

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
import { RefreshCw } from 'lucide-vue-next';
import { usePAMMStore } from '@/stores/pamm/pamm';
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import { useSnackbarStore } from '@/stores/snackbar/snackbar';
import DataTable from '@/components/common/DataTable/DataTable.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue';
import RejectWithdrawalModal from '../components/RejectWithdrawalModal.vue';

const route = useRoute();
const store = usePAMMStore();
const snackbar = useSnackbarStore();
const pammId = route.params.id;
const { hasPermission } = usePermissionCheck();

const rejectModalOpen = ref(false);
const selectedOperationId = ref(null);
const showApproveDialog = ref(false);
const selectedOperation = ref(null);

const columns = [
  { key: 'reference_id', label: 'Reference ID' },
  { key: 'status', label: 'Status' },
  { key: 'requested_amount', label: 'Requested Amount' },
  { key: 'created_at', label: 'Date' },
  { key: 'actions', label: 'Actions', align: 'right' }
];

const fetchData = (force = false) => {
  store.fetchPendingWithdrawals(pammId, force);
};

defineExpose({ fetchData });

onMounted(() => {
  fetchData();
});

const openApproveModal = (row) => {
  selectedOperation.value = row;
  showApproveDialog.value = true;
};

const handleConfirmApprove = async () => {
  if (!selectedOperation.value) return;
  await store.approveWithdrawal(selectedOperation.value.id, pammId);
  showApproveDialog.value = false;
  selectedOperation.value = null;
};

const openRejectModal = (opId) => {
  selectedOperationId.value = opId;
  rejectModalOpen.value = true;
};
</script>
