<template>
  <div>
    <div>
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4"
      >
        <h3 class="title-text text-primary-text">Settlements</h3>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <BaseSelect
            v-model="statusFilter"
            :options="[
              { label: 'All Statuses', value: '' },
              { label: 'Pending', value: 'pending' },
              { label: 'Processing', value: 'processing' },
              { label: 'Finalized', value: 'finalized' },
              { label: 'Failed', value: 'failed' },
            ]"
            trigger-class="w-56 h-[32px] text-sm"
            @update:modelValue="fetchData(true)"
          />
          <button
            v-if="hasManagePermission"
            @click="runModalOpen = true"
            class="bg-primary hover:bg-primary-hover text-white px-4 h-[32px] rounded-lg text-xs font-semibold transition-colors flex items-center justify-center whitespace-nowrap"
          >
            Run settlement
          </button>
        </div>
      </div>

      <div
        v-if="!store.loading && store.settlements.length === 0"
        class="py-8 text-center border-t border-primary-border border-dashed mt-4"
      >
        <p class="text-secondary-text">
          No settlements yet — run a checkpoint.
        </p>
      </div>

      <DataTable
        v-else
        :columns="columns"
        :data="store.settlements"
        :loading="store.loading"
        :pagination="store.pagination"
        @page-change="handlePageChange"
        @per-page-change="handlePerPageChange"
        @row-click="openDetailDrawer"
      >
        <template #cell-settlement_key="{ row }">
          <div
            class="font-mono font-medium text-primary-blue cursor-pointer"
            @click="openDetailDrawer(row)"
          >
            {{ row.settlement_key }}
          </div>
        </template>

        <template #cell-status="{ row }">
          <StatusBadge :status="row.status" />
        </template>

        <template #cell-unit_value="{ row }">
          <span class="font-mono">{{
            Number(row.unit_value || 0).toFixed(6)
          }}</span>
        </template>

        <template #cell-total_pamm_value="{ row }">
          <span class="font-mono"
            >${{ Number(row.total_pamm_value || 0).toFixed(2) }}</span
          >
        </template>

        <template #cell-participant_count="{ row }">
          <span>{{ row.participant_count || 0 }}</span>
        </template>

        <template #cell-batches="{ row }">
          <span class="text-sm">
            {{ row.completed_batch_count || 0 }} / {{ row.batch_count || 0 }}
          </span>
        </template>

        <template #cell-dates="{ row }">
          <div class="text-xs space-y-1">
            <div>
              <span class="text-secondary-text">Created:</span>
              {{ new Date(row.created_at).toLocaleString() }}
            </div>
            <div v-if="row.finalized_at">
              <span class="text-secondary-text">Finalized:</span>
              {{ new Date(row.finalized_at).toLocaleString() }}
            </div>
          </div>
        </template>
      </DataTable>
    </div>

    <RunSettlementModal
      v-if="runModalOpen"
      :pammId="pammId"
      @close="closeRunModal"
    />

    <SettlementDetailDrawer
      v-if="detailDrawerOpen"
      :pammId="pammId"
      :settlementId="selectedSettlementId"
      @close="detailDrawerOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { RefreshCw } from "lucide-vue-next";
import { usePAMMSettlementStore } from "@/stores/pamm/pammSettlement";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import DataTable from "@/components/common/DataTable/DataTable.vue";
import StatusBadge from "@/components/common/StatusBadge.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
import RunSettlementModal from "../components/RunSettlementModal.vue";
import SettlementDetailDrawer from "../components/SettlementDetailDrawer.vue";

const route = useRoute();
const store = usePAMMSettlementStore();
const { hasPermission } = usePermissionCheck();
const pammId = route.params.id;

const runModalOpen = ref(false);
const detailDrawerOpen = ref(false);
const selectedSettlementId = ref(null);
const statusFilter = ref("");

const columns = [
  { key: "settlement_key", label: "Settlement ID" },
  { key: "status", label: "Status" },
  { key: "unit_value", label: "Unit Value" },
  { key: "total_pamm_value", label: "Pool Value" },
  { key: "participant_count", label: "Investors" },
  { key: "batches", label: "Batches (Done/Total)" },
  { key: "dates", label: "Timestamps" },
];

const hasManagePermission = computed(() => {
  return hasPermission("pamm.manage");
});

const fetchData = (resetPage = false) => {
  const params = {
    page: resetPage ? 1 : store.pagination.page,
    per_page: store.pagination.per_page,
  };
  if (statusFilter.value) {
    params.status = statusFilter.value;
  }
  store.fetchSettlements(pammId, params, true);
};

defineExpose({ fetchData });

onMounted(() => {
  fetchData(true);
});

const handlePageChange = (page) => {
  store.pagination.page = page;
  fetchData();
};

const handlePerPageChange = (perPage) => {
  store.pagination.per_page = perPage;
  store.pagination.page = 1;
  fetchData(true);
};

const closeRunModal = () => {
  runModalOpen.value = false;
  fetchData(true);
};

const openDetailDrawer = (payload) => {
  const rowData = payload.row || payload;
  selectedSettlementId.value = rowData.settlement_key || rowData.id;
  detailDrawerOpen.value = true;
};
</script>
