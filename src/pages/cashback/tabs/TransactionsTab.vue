<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="title-text">Ledger Transactions</h2>
        <p class="sub-text text-secondary-text">View cashback ledger activity (Earns, Adjustments, etc.)</p>
      </div>
    </div>

    <div class="bg-card-background border border-primary-border rounded-xl">
      <DataTable
        :columns="columns"
        :data="store.transactions"
        :loading="store.loading"
        :pagination="store.transactionsPagination"
        @page-change="handlePageChange"
      >
        <template #cell-plan_code="{ row }">
          <span v-if="row.plan_code" class="font-medium text-primary-text">{{ row.plan_code }}</span>
          <span v-else class="text-secondary-text">-</span>
        </template>
        <template #cell-amount="{ row }">
          <span class="font-medium" :class="row.amount >= 0 ? 'text-primary-green' : 'text-primary-red'">
            {{ formatCurrency(row.amount) }}
          </span>
        </template>
        <template #cell-status="{ row }">
          <StatusBadge :status="row.status" />
        </template>
        <template #cell-created_at="{ row }">
          <span class="text-secondary-text">{{ formatDateTime(row.created_at) }}</span>
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
  { key: "id", label: "Tx ID", sortable: false },
  { key: "user_id", label: "User ID", sortable: false },
  { key: "trading_account_id", label: "Account ID", sortable: false },
  { key: "plan_code", label: "Plan", sortable: false },
  { key: "transaction_type", label: "Type", sortable: false },
  { key: "mt5_deal_id", label: "Deal ID", sortable: false },
  { key: "amount", label: "Amount", sortable: false },
  { key: "status", label: "Status", sortable: false },
  { key: "created_at", label: "Created At", sortable: false },
];

const handlePageChange = (page) => {
  store.fetchTransactions({
    offset: (page - 1) * store.transactionsPagination.limit,
    limit: store.transactionsPagination.limit,
  });
};

const formatCurrency = (val) => {
  if (val == null) return "-";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
};

const formatDateTime = (val) => {
  if (!val) return "-";
  return new Date(val).toLocaleString();
};

onMounted(() => {
  if (!store.isFetched.transactions) {
    store.fetchTransactions();
  }
});
</script>
