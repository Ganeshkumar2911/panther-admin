<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="title-text">Cashback Plans</h2>
        <p class="sub-text text-secondary-text">Manage cashback plans for the active program</p>
      </div>
    </div>

    <div class="bg-card-background border border-primary-border rounded-xl">
      <DataTable
        :columns="columns"
        :data="store.plans"
        :loading="store.loading"
        :pagination="pagination"
      >
        <template #cell-rate_per_lot="{ row }">
          <span class="font-medium text-primary-text">{{ formatCurrency(row.rate_per_lot) }}</span>
        </template>
        <template #cell-status="{ row }">
          <StatusBadge :status="row.status" />
        </template>
        <template #cell-actions="{ row }">
          <button
            class="text-xs text-primary hover:underline font-medium"
            @click="openEditModal(row)"
          >
            Edit
          </button>
        </template>
      </DataTable>
    </div>

    <EditPlanModal
      v-if="selectedPlan"
      :plan="selectedPlan"
      @close="closeEditModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useCashbackStore } from "@/stores/cashback/cashback";
import DataTable from "@/components/common/DataTable.vue";
import StatusBadge from "@/components/common/StatusBadge.vue";
import EditPlanModal from "../components/EditPlanModal.vue";

const store = useCashbackStore();
const selectedPlan = ref(null);

// Plans aren't paginated by default, so we just pass a simple pagination object for the table UI.
const pagination = computed(() => ({
  page: 1,
  per_page: store.plans.length || 50,
  total: store.plans.length,
}));

const columns = [
  { key: "code", label: "Code", sortable: true },
  { key: "name", label: "Plan Name", sortable: true },
  { key: "qualify_on", label: "Qualifies On", sortable: true },
  { key: "rate_per_lot", label: "Rate / Lot", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "actions", label: "Actions", sortable: false, align: "right" },
];

const formatCurrency = (val) => {
  if (val == null) return "-";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: store.activeProgram?.currency || "USD" }).format(val);
};

const openEditModal = (plan) => {
  selectedPlan.value = plan;
};

const closeEditModal = () => {
  selectedPlan.value = null;
};

onMounted(() => {
  if (store.activeProgram && (!store.isFetched.plans || store.plans.length === 0)) {
    store.fetchPlans(store.activeProgram.id);
  }
});
</script>
