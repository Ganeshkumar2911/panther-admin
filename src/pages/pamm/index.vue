<template>
  <div v-if="hasAccess">
    <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="title-text text-primary-text font-bold text-xl">PAMM Pools</h1>
        <p class="sub-text text-secondary-text mt-0.5">
          Percentage Allocation Management Module pools
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button
          class="btn-refresh"
          @click="fetchData(true)"
          :disabled="store.loading"
          title="Refresh PAMM Pools"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': store.loading }" />
        </button>
        <button
          v-if="hasPermission('pamm.manage')"
          class="bg-card-background border border-primary-border hover:bg-background text-primary-text px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer "
          @click="isRunAllModalOpen = true"
        >
          <span>Run All Settlements</span>
        </button>
        <button
          v-if="hasPermission('pamm.manage')"
          class="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer "
          @click="isEnrollModalOpen = true"
        >
          <Plus class="w-4 h-4" />
          <span>Enroll Fund Manager</span>
        </button>
      </div>
    </div>

    <!-- Data Table for PAMMs -->
    <div>
      <DataTable
        :columns="columns"
        :data="store.pamms"
        :loading="store.loading"
        :pagination="store.pagination"
        @page-change="handlePageChange"
        @per-page-change="handlePerPageChange"
      >
        <template #cell-name="{ row }">
          <div class="font-medium text-primary-text">{{ row.name }}</div>
          <div class="text-xs text-secondary-text">{{ row.description || 'No description' }}</div>
          <div class="text-[11px] font-mono mt-0.5 text-primary-blue">
            FM #{{ row.fund_manager_id }}
          </div>
        </template>
        
        <template #cell-master_account="{ row }">
          <div v-if="row.master_trading_account">
            <div class="font-mono font-medium text-primary-text">#{{ row.master_trading_account.account_number }}</div>
            <div class="text-xs text-secondary-text truncate max-w-[120px]" :title="row.master_trading_account.server">
              {{ row.master_trading_account.server }}
            </div>
          </div>
          <div v-else class="text-secondary-text text-xs italic">Not assigned</div>
        </template>
        
        <template #cell-status="{ row }">
          <StatusBadge :status="row.status" />
        </template>
        
        <template #cell-value="{ row }">
          <div class="text-sm font-medium text-primary-text">
            {{ row.currency || 'USD' }} {{ Number(row.total_pamm_value || 0).toFixed(2) }}
          </div>
          <div class="text-[11px] text-secondary-text mt-0.5 flex flex-col">
            <span>Units: <span class="font-mono">{{ Number(row.total_pamm_units || 0).toFixed(6) }}</span></span>
            <span>Unit Val: <span class="font-mono">{{ Number(row.unit_value || 1).toFixed(6) }}</span></span>
          </div>
        </template>
        
        <template #cell-settings="{ row }">
          <div class="text-xs space-y-1">
            <div class="flex items-center gap-1">
              <span class="text-secondary-text w-16">Transfers:</span>
              <span :class="row.accept_deposits ? 'text-primary-green' : 'text-primary-red'" title="Deposits">D</span> /
              <span :class="row.accept_withdrawal_requests ? 'text-primary-green' : 'text-primary-red'" title="Withdrawals">W</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="text-secondary-text w-16">Settle:</span>
              <span class="capitalize">{{ row.settlement_type }}</span> @ {{ row.settlement_time || 'N/A' }}
            </div>
          </div>
        </template>

        <template #cell-actions="{ row }">
          <div class="flex justify-end">
            <button 
              class="btn-secondary whitespace-nowrap"
              @click="goToDetail(row.id)"
            >
              <span>View Details</span>
              <ChevronRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Enroll Fund Manager Modal -->
    <EnrollFundManagerModal
      v-if="isEnrollModalOpen"
      @close="isEnrollModalOpen = false"
      @enrolled="fetchData(true)"
    />

    <RunAllSettlementsModal
      v-if="isRunAllModalOpen"
      @close="isRunAllModalOpen = false"
    />
  </div>
  <div v-else class="p-6">
    <div class="bg-card-background border border-primary-border rounded-lg  p-8 text-center">
      <div class="flex justify-center mb-4">
        <div class="bg-red-50 text-red-500 p-4 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
            <path d="M12 8v4"/>
            <path d="M12 16h.01"/>
          </svg>
        </div>
      </div>
      <h2 class="title-text text-primary-text mb-2">Access Restricted</h2>
      <p class="text-secondary-text mb-6">
        You do not have permission to view the PAMM module. Please contact your system administrator.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, RefreshCw, ChevronRight } from 'lucide-vue-next';
import { usePAMMStore } from '@/stores/pamm/pamm';
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import DataTable from '@/components/common/DataTable/DataTable.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import EnrollFundManagerModal from './components/EnrollFundManagerModal.vue';
import RunAllSettlementsModal from './components/RunAllSettlementsModal.vue';

const router = useRouter();
const store = usePAMMStore();
const { hasPermission } = usePermissionCheck();

const hasAccess = computed(() => hasPermission("pamm.view"));
const isEnrollModalOpen = ref(false);
const isRunAllModalOpen = ref(false);

const columns = [
  { key: 'name', label: 'PAMM Pool' },
  { key: 'master_account', label: 'Master MT5' },
  { key: 'status', label: 'Status' },
  { key: 'value', label: 'Value / Units' },
  { key: 'settings', label: 'Config' },
  { key: 'actions', label: 'Actions', align: 'right' }
];

const fetchData = (force = false) => {
  store.fetchPAMMs({
    page: store.pagination.page,
    per_page: store.pagination.per_page,
  }, force);
};

onMounted(() => {
  fetchData();
});

const handlePageChange = (page) => {
  store.pagination.page = page;
  fetchData(true);
};

const handlePerPageChange = (perPage) => {
  store.pagination.per_page = perPage;
  store.pagination.page = 1;
  fetchData(true);
};

const goToDetail = (id) => {
  router.push(`/pamm/${id}`);
};
</script>
