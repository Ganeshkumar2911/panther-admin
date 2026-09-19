<template>
  <div class="p-6">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="title-text text-primary-text">PAMM Management</h1>
        <p class="sub-text text-secondary-text">Manage Percentage Allocation Management Module pools</p>
      </div>
      <div>
        <button class="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded text-sm font-medium transition-colors" @click="fetchData(true)">
          Refresh
        </button>
      </div>
    </div>

    <!-- Data Table for PAMMs -->
    <div class="bg-card-background border border-primary-border rounded-lg shadow-sm p-4">
      <DataTable
        :data="store.pamms"
        :loading="store.loading"
        :pagination="store.pagination"
        @page-change="handlePageChange"
        @per-page-change="handlePerPageChange"
      >
        <template #cell-name="{ row }">
          <div class="font-medium text-primary-text">{{ row.name }}</div>
          <div class="text-xs text-secondary-text">{{ row.description || 'No description' }}</div>
        </template>
        
        <template #cell-status="{ row }">
          <StatusBadge :status="row.status" />
        </template>
        
        <template #cell-total_pamm_value="{ row }">
          <span class="font-mono">{{ row.currency || 'USD' }} {{ Number(row.total_pamm_value || 0).toFixed(2) }}</span>
        </template>
        
        <template #cell-unit_value="{ row }">
          <span class="font-mono">{{ Number(row.unit_value || 1).toFixed(6) }}</span>
        </template>
        
        <template #cell-accept_deposits="{ row }">
          <span :class="row.accept_deposits ? 'text-primary-green' : 'text-primary-red'" class="text-sm font-medium">
            {{ row.accept_deposits ? 'Yes' : 'No' }}
          </span>
        </template>
        
        <template #cell-accept_withdrawal_requests="{ row }">
          <span :class="row.accept_withdrawal_requests ? 'text-primary-green' : 'text-primary-red'" class="text-sm font-medium">
            {{ row.accept_withdrawal_requests ? 'Yes' : 'No' }}
          </span>
        </template>

        <template #cell-actions="{ row }">
          <button 
            class="text-xs text-primary hover:underline font-medium"
            @click="goToDetail(row.id)"
          >
            View Details
          </button>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePAMMStore } from '@/stores/pamm/pamm';
import DataTable from '@/components/common/DataTable/DataTable.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';

const router = useRouter();
const store = usePAMMStore();

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
