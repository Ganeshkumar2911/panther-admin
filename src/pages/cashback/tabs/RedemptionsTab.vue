<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="title-text">Redemptions</h2>
        <p class="sub-text text-secondary-text">View cashback redemptions</p>
      </div>
    </div>

    <div class="bg-card-background border border-primary-border rounded-xl">
      <DataTable
        :columns="columns"
        :data="store.redemptions"
        :loading="store.loading"
        :pagination="store.redemptionsPagination"
        @page-change="handlePageChange"
      >
        <template #cell-amount="{ row }">
          <span class="font-medium text-primary-text">{{ formatCurrency(row.amount, row.currency) }}</span>
        </template>
        <template #cell-status="{ row }">
          <StatusBadge :status="row.status" />
        </template>
        <template #cell-completed_at="{ row }">
          <span class="text-secondary-text">{{ formatDateTime(row.completed_at) }}</span>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useCashbackStore } from "@/stores/cashback/cashback";
import DataTable from "@/components/common/DataTable.vue";
import StatusBadge from "@/components/common/StatusBadge.vue";

const store = useCashbackStore();

const columns = [
  { key: "id", label: "ID", sortable: false },
  { key: "user_id", label: "User ID", sortable: false },
  { key: "trading_account_id", label: "Destination Account", sortable: false },
  { key: "amount", label: "Amount", sortable: false },
  { key: "status", label: "Status", sortable: false },
  { key: "completed_at", label: "Completed At", sortable: false },
];

const handlePageChange = (page) => {
  store.fetchRedemptions({
    offset: (page - 1) * store.redemptionsPagination.limit,
    limit: store.redemptionsPagination.limit,
  });
};

const formatCurrency = (val, currency = "USD") => {
  if (val == null) return "-";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(val);
};

const formatDateTime = (val) => {
  if (!val) return "-";
  return new Date(val).toLocaleString();
};

onMounted(() => {
  if (!store.isFetched.redemptions) {
    store.fetchRedemptions();
  }
});
</script>
