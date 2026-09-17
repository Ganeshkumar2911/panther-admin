<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="title-text">Enrollments</h2>
        <p class="sub-text text-secondary-text">Manage user trading account enrollments in cashback plans</p>
      </div>
      <button
        class="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors"
        @click="isEnrollModalOpen = true"
      >
        Enroll Account
      </button>
    </div>

    <div class="bg-card-background border border-primary-border rounded-xl">
      <DataTable
        :columns="columns"
        :data="store.enrollments"
        :loading="store.loading"
        :pagination="store.enrollmentsPagination"
        @page-change="handlePageChange"
      >
        <template #cell-plan="{ row }">
          <span class="font-medium text-primary-text">{{ row.plan?.name || '-' }}</span>
        </template>
        <template #cell-status="{ row }">
          <StatusBadge :status="row.status" />
        </template>
        <template #cell-pending_plan="{ row }">
          <div v-if="row.pending_plan_id" class="text-xs">
            <span class="text-primary-text font-medium">{{ row.pending_plan?.name }}</span>
            <div class="text-secondary-text">{{ formatDate(row.pending_effective_at) }}</div>
          </div>
          <span v-else class="text-secondary-text">-</span>
        </template>
        <template #cell-enrolled_at="{ row }">
          <span class="text-secondary-text">{{ formatDate(row.enrolled_at) }}</span>
        </template>
        <template #cell-actions="{ row }">
          <button
            v-if="row.status === 'active'"
            class="text-xs text-primary-red hover:underline font-medium"
            @click="handleUnenroll(row)"
          >
            Unenroll
          </button>
          <span v-else class="text-secondary-text text-xs">-</span>
        </template>
      </DataTable>
    </div>

    <CreateEnrollmentModal
      v-if="isEnrollModalOpen"
      @close="isEnrollModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useCashbackStore } from "@/stores/cashback/cashback";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import DataTable from "@/components/common/DataTable.vue";
import StatusBadge from "@/components/common/StatusBadge.vue";
import CreateEnrollmentModal from "../components/CreateEnrollmentModal.vue";

const store = useCashbackStore();
const snackbar = useSnackbarStore();
const isEnrollModalOpen = ref(false);

const columns = [
  { key: "id", label: "ID", sortable: false },
  { key: "user_id", label: "User ID", sortable: false },
  { key: "trading_account_id", label: "Account ID", sortable: false },
  { key: "plan", label: "Active Plan", sortable: false },
  { key: "status", label: "Status", sortable: false },
  { key: "pending_plan", label: "Pending Switch", sortable: false },
  { key: "enrolled_at", label: "Enrolled At", sortable: false },
  { key: "actions", label: "Actions", sortable: false, align: "right" },
];

const handlePageChange = (page) => {
  store.fetchEnrollments({
    offset: (page - 1) * store.enrollmentsPagination.limit,
    limit: store.enrollmentsPagination.limit,
  });
};

const handleUnenroll = async (row) => {
  if (confirm(`Are you sure you want to unenroll account ${row.trading_account_id}?`)) {
    await store.unenrollAccount({
      user_id: row.user_id,
      trading_account_id: row.trading_account_id,
    });
  }
};

const formatDate = (val) => {
  if (!val) return "-";
  return new Date(val).toLocaleDateString();
};

onMounted(() => {
  if (!store.isFetched.enrollments) {
    store.fetchEnrollments();
  }
  if (!store.isFetched.plans && store.activeProgram) {
    store.fetchPlans(store.activeProgram.id);
  }
});
</script>
