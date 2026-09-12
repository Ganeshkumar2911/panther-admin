<script setup>
import { ref, computed, watch, onMounted } from "vue";
import {
  Search01Icon,
  RefreshCwIcon,
  FilterIcon,
  Cancel01Icon,
  Coins01Icon,
  Tick02Icon,
  Delete02Icon,
  CheckmarkCircle02Icon,
  Alert02Icon,
  Calendar01Icon,
  InformationCircleIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { useCommissionEngineStore } from "@/stores/commissionEngine/commissionEngine";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import BaseSelect from "@/components/common/BaseSelect.vue";
import ApproveCommissionModal from "../components/ApproveCommissionModal.vue";
import RejectCommissionModal from "../components/RejectCommissionModal.vue";
import CalculateCommissionsModal from "../components/CalculateCommissionsModal.vue";

const store = useCommissionEngineStore();
const { hasPermission } = usePermissionCheck();

const canView = computed(() => hasPermission("ib_commission.view"));
const canApprove = computed(() => hasPermission("ib_commission.approve"));
const canSync = computed(() => hasPermission("ib_commission.sync"));

// Filters
const statusFilter = ref("pending"); // 'pending' | 'approved' | 'rejected' | ''
const loginFilter = ref("");
const ibIdFilter = ref("");
const tradeIdFilter = ref("");
const symbolFilter = ref("");
const dateFrom = ref("");
const dateTo = ref("");
const dateField = ref("created_at");

// Modals state
const isApproveModalOpen = ref(false);
const singleCommissionToApprove = ref(null);
const selectedCommissions = ref([]);

const isRejectModalOpen = ref(false);
const singleCommissionToReject = ref(null);

const isCalculateModalOpen = ref(false);

const searchTimer = ref(null);

const dateFieldOptions = [
  { label: "Created At", value: "created_at" },
  { label: "Approved At", value: "approved_at" },
  { label: "Trade Close Time", value: "close_time" },
];

onMounted(() => {
  store.fetchWorkflowSettings();
  loadCommissions(1);
});

// Auto-adjust default filter if workflow is auto_wallet
watch(
  () => store.workflowSettings?.auto_wallet_credit,
  (isAuto) => {
    if (isAuto && statusFilter.value === "pending" && !store.commissionsList?.length) {
      statusFilter.value = "approved";
      loadCommissions(1, true);
    }
  }
);

const loadCommissions = (page = 1, force = false) => {
  const params = {
    status: statusFilter.value || undefined,
    login: loginFilter.value.trim() ? Number(loginFilter.value.trim()) : undefined,
    ib_id: ibIdFilter.value.trim() ? Number(ibIdFilter.value.trim()) : undefined,
    trade_id: tradeIdFilter.value.trim() ? Number(tradeIdFilter.value.trim()) : undefined,
    symbol: symbolFilter.value.trim() ? symbolFilter.value.trim().toUpperCase() : undefined,
    date_from: dateFrom.value || undefined,
    date_to: dateTo.value || undefined,
    date_field: dateField.value || "created_at",
    page,
    per_page: store.commissionsPagination.per_page || 50,
  };

  store.fetchCommissions(params, force);
};

const handleFilterChange = () => {
  if (searchTimer.value) clearTimeout(searchTimer.value);
  searchTimer.value = setTimeout(() => {
    selectedCommissions.value = [];
    loadCommissions(1, true);
  }, 350);
};

const handleResetFilters = () => {
  statusFilter.value = store.workflowSettings?.auto_wallet_credit ? "approved" : "pending";
  loginFilter.value = "";
  ibIdFilter.value = "";
  tradeIdFilter.value = "";
  symbolFilter.value = "";
  dateFrom.value = "";
  dateTo.value = "";
  dateField.value = "created_at";
  selectedCommissions.value = [];
  loadCommissions(1, true);
};

const handlePageChange = (newPage) => {
  loadCommissions(newPage, true);
};

const handlePerPageChange = (newPerPage) => {
  const perPageVal = typeof newPerPage === "object" && newPerPage !== null ? (newPerPage.value || 50) : newPerPage;
  store.commissionsPagination.per_page = Number(perPageVal) || 50;
  loadCommissions(1, true);
};

const handleToggleWorkflow = async (event) => {
  const isChecked = event.target.checked;
  await store.updateWorkflowSettings({ auto_wallet_credit: isChecked });
};

// Approval triggers
const openSingleApprove = (commission) => {
  singleCommissionToApprove.value = commission;
  isApproveModalOpen.value = true;
};

const openBulkApprove = () => {
  singleCommissionToApprove.value = null;
  isApproveModalOpen.value = true;
};

// Rejection trigger
const openSingleReject = (commission) => {
  singleCommissionToReject.value = commission;
  isRejectModalOpen.value = true;
};

const handleApprovedCallback = () => {
  selectedCommissions.value = [];
  loadCommissions(store.commissionsPagination.page, true);
};

const handleRejectedCallback = () => {
  loadCommissions(store.commissionsPagination.page, true);
};

const handleCalculatedCallback = () => {
  loadCommissions(1, true);
};

// Filter selectable rows: Only pending commissions can be bulk approved
const pendingSelectedCommissions = computed(() => {
  return selectedCommissions.value.filter((c) => c.status === "pending");
});

const columns = [
  { key: "id", label: "ID", width: "80px", sortable: true },
  { key: "status", label: "Status", align: "center", width: "110px" },
  { key: "ib_partner", label: "IB Partner", width: "150px" },
  { key: "trade_info", label: "Trade (MT5 Login & Symbol)", width: "180px" },
  { key: "rates", label: "Rate Applied", width: "150px" },
  { key: "total_commission", label: "Commission", align: "right", width: "130px", sortable: true },
  { key: "timeline", label: "Timeline & Audit", width: "170px" },
  { key: "actions", label: "Actions", align: "right", width: "140px" },
];

const formatDate = (val) => {
  if (!val) return "-";
  const d = new Date(val);
  return isNaN(d.getTime()) ? val : d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};
</script>

<template>
  <div class="space-y-4">
    <!-- Workflow Mode Settings Bar -->
    <div
      class="p-4 rounded-2xl bg-card-background border border-primary-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0"
          :class="
            store.workflowSettings?.auto_wallet_credit
              ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
              : 'bg-primary/10 text-primary border-primary/20'
          "
        >
          <HugeIcon :icon="Coins01Icon" :size="20" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-bold text-primary-text">
              Commission Workflow Mode:
              <span
                class="ml-1 font-semibold"
                :class="store.workflowSettings?.auto_wallet_credit ? 'text-primary-green' : 'text-primary'"
              >
                {{ store.workflowSettings?.auto_wallet_credit ? "Auto Wallet Credit" : "Pending Approval Required" }}
              </span>
            </h3>
          </div>
          <p class="text-xs text-secondary-text">
            {{
              store.workflowSettings?.auto_wallet_credit
                ? "Calculated commissions credit the IB wallet immediately upon calculation without a pending queue."
                : "Calculated commissions remain in Pending status until authorized by an administrator."
            }}
          </p>
        </div>
      </div>

      <!-- Toggle Switch (If Permitted) -->
      <div v-if="canApprove" class="flex items-center gap-2.5 shrink-0">
        <label class="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            :checked="store.workflowSettings?.auto_wallet_credit"
            :disabled="store.actionLoading"
            class="custom-checkbox h-4 w-4 rounded text-primary focus:ring-0"
            @change="handleToggleWorkflow"
          />
          <span class="text-xs font-semibold text-primary-text">
            Auto Wallet Credit (Skip Pending)
          </span>
        </label>
      </div>
    </div>

    <!-- Commissions DataTable -->
    <DataTable
      :columns="columns"
      :data="store.commissionsList"
      :loading="store.loading"
      :pagination="store.commissionsPagination"
      :selectable="canApprove && statusFilter === 'pending'"
      v-model:selected="selectedCommissions"
      row-key="id"
      table-key="ib-commissions-table"
      :per-page-options="[20, 50, 100, 200]"
      empty-title="No commission records found"
      empty-text="No commissions match the current filter or status criteria."
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
    >
      <!-- Toolbar Slot -->
      <template #toolbar>
        <div class="space-y-3">
          <!-- Top Row: Filters & Calculate Action -->
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <!-- Left: Status Pills & Filter Inputs -->
            <div class="flex flex-wrap items-center gap-2.5 flex-1">
              <!-- Status Filter Pills -->
              <div class="inline-flex p-1 rounded-xl bg-background border border-primary-border shrink-0">
                <button
                  type="button"
                  class="px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  :class="[
                    statusFilter === 'pending'
                      ? 'bg-primary text-white font-bold'
                      : 'text-secondary-text hover:text-primary-text'
                  ]"
                  @click="
                    statusFilter = 'pending';
                    handleFilterChange();
                  "
                >
                  Pending
                </button>
                <button
                  type="button"
                  class="px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  :class="[
                    statusFilter === 'approved'
                      ? 'bg-primary-green text-white font-bold'
                      : 'text-secondary-text hover:text-primary-text'
                  ]"
                  @click="
                    statusFilter = 'approved';
                    handleFilterChange();
                  "
                >
                  Approved
                </button>
                <button
                  type="button"
                  class="px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  :class="[
                    statusFilter === 'rejected'
                      ? 'bg-primary-red text-white font-bold'
                      : 'text-secondary-text hover:text-primary-text'
                  ]"
                  @click="
                    statusFilter = 'rejected';
                    handleFilterChange();
                  "
                >
                  Rejected
                </button>
                <button
                  type="button"
                  class="px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  :class="[
                    statusFilter === ''
                      ? 'bg-card-background text-primary-text font-bold shadow-2xs'
                      : 'text-secondary-text hover:text-primary-text'
                  ]"
                  @click="
                    statusFilter = '';
                    handleFilterChange();
                  "
                >
                  All
                </button>
              </div>

              <!-- MT5 Login Filter -->
              <div class="w-28 sm:w-32">
                <input
                  v-model="loginFilter"
                  type="number"
                  placeholder="MT5 Login"
                  class="input-field w-full px-2.5 py-1.5 text-xs font-mono"
                  @input="handleFilterChange"
                />
              </div>

              <!-- IB ID Filter -->
              <div class="w-24 sm:w-28">
                <input
                  v-model="ibIdFilter"
                  type="number"
                  placeholder="IB ID"
                  class="input-field w-full px-2.5 py-1.5 text-xs font-mono"
                  @input="handleFilterChange"
                />
              </div>

              <!-- Symbol Search -->
              <div class="relative w-32 sm:w-36">
                <HugeIcon
                  :icon="Search01Icon"
                  :size="13"
                  class="absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none"
                />
                <input
                  v-model="symbolFilter"
                  type="text"
                  placeholder="Symbol"
                  class="input-field w-full pl-7 pr-3 py-1.5 text-xs font-mono uppercase"
                  @input="handleFilterChange"
                />
              </div>
            </div>

            <!-- Right: Action Buttons -->
            <div class="flex items-center gap-2 justify-end shrink-0">
              <!-- Bulk Approve Button -->
              <button
                v-if="canApprove && pendingSelectedCommissions.length > 0"
                type="button"
                :disabled="store.actionLoading"
                class="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary-green hover:bg-primary-green/90 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
                @click="openBulkApprove"
              >
                <HugeIcon :icon="CheckmarkCircle02Icon" :size="14" />
                <span>Approve Selected ({{ pendingSelectedCommissions.length }})</span>
              </button>

              <!-- Calculate Commissions Button -->
              <button
                v-if="canSync"
                type="button"
                :disabled="store.actionLoading"
                class="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
                @click="isCalculateModalOpen = true"
              >
                <HugeIcon :icon="Coins01Icon" :size="14" />
                <span>Calculate Commissions</span>
              </button>

              <!-- Refresh Button -->
              <button
                type="button"
                :disabled="store.loading"
                class="p-2 border border-primary-border rounded-xl text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
                title="Refresh Commissions"
                @click="loadCommissions(store.commissionsPagination.page, true)"
              >
                <HugeIcon
                  :icon="RefreshCwIcon"
                  :size="14"
                  :class="{ 'animate-spin': store.loading }"
                />
              </button>
            </div>
          </div>

          <!-- Bottom Row: Date Range & Date Field Filter -->
          <div class="flex flex-wrap items-center gap-2.5 pt-2 border-t border-primary-border/50 text-xs">
            <span class="text-secondary-text font-medium flex items-center gap-1">
              <HugeIcon :icon="Calendar01Icon" :size="13" />
              <span>Date Filter:</span>
            </span>

            <div class="w-44">
              <BaseSelect
                v-model="dateField"
                :options="dateFieldOptions"
                variant="surface"
                @update:model-value="handleFilterChange"
              />
            </div>

            <div class="flex items-center gap-1.5">
              <input
                v-model="dateFrom"
                type="date"
                class="input-field px-2.5 py-1 text-xs"
                @change="handleFilterChange"
              />
              <span class="text-secondary-text">to</span>
              <input
                v-model="dateTo"
                type="date"
                class="input-field px-2.5 py-1 text-xs"
                @change="handleFilterChange"
              />
            </div>

            <button
              v-if="loginFilter || ibIdFilter || tradeIdFilter || symbolFilter || dateFrom || dateTo"
              type="button"
              class="px-2.5 py-1 text-[11px] text-secondary-text hover:text-primary-red transition-colors cursor-pointer underline"
              @click="handleResetFilters"
            >
              Clear filters
            </button>
          </div>
        </div>
      </template>

      <!-- Cell: ID -->
      <template #cell-id="{ row }">
        <span class="font-mono text-xs font-semibold text-primary-text">
          #{{ row.id }}
        </span>
      </template>

      <!-- Cell: Status -->
      <template #cell-status="{ row }">
        <span
          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
          :class="{
            'bg-primary-green/10 text-primary-green border border-primary-green/20': row.status === 'approved',
            'bg-primary/10 text-primary border border-primary/20': row.status === 'pending',
            'bg-primary-red/10 text-primary-red border border-primary-red/20': row.status === 'rejected',
          }"
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="{
              'bg-primary-green': row.status === 'approved',
              'bg-primary': row.status === 'pending',
              'bg-primary-red': row.status === 'rejected',
            }"
          />
          {{ row.status?.toUpperCase() }}
        </span>
      </template>

      <!-- Cell: IB Partner -->
      <template #cell-ib_partner="{ row }">
        <div class="text-xs font-mono">
          <p class="font-bold text-primary-text">IB #{{ row.ib_id }}</p>
          <p class="text-[10px] text-secondary-text">User #{{ row.ib_user_id || "N/A" }} &middot; Link #{{ row.referral_link_id }}</p>
        </div>
      </template>

      <!-- Cell: Trade Info -->
      <template #cell-trade_info="{ row }">
        <div class="text-xs">
          <div class="flex items-center gap-1.5">
            <span class="font-mono font-bold text-primary-text">
              {{ row.trade?.symbol || "N/A" }}
            </span>
            <span class="text-[11px] font-mono text-secondary-text">
              ({{ row.closed_volume_lots ?? '-' }} lots)
            </span>
          </div>
          <p class="text-[10px] text-secondary-text font-mono">
            Login: {{ row.trade?.login || '-' }} &middot; Trade #{{ row.trade_id }}
          </p>
        </div>
      </template>

      <!-- Cell: Rates Applied -->
      <template #cell-rates="{ row }">
        <div class="text-[11px] font-mono space-y-0.5">
          <p v-if="row.rate_per_lot !== null">
            Per Lot: <strong class="text-primary-text">${{ row.rate_per_lot }}</strong>
          </p>
          <p v-if="row.rate_per_spread !== null">
            Per Spread: <strong class="text-primary-text">{{ row.rate_per_spread }}%</strong>
          </p>
          <p v-if="row.rate_per_millions_volume !== null">
            Per M. Vol: <strong class="text-primary-text">${{ row.rate_per_millions_volume }}</strong>
          </p>
          <p v-if="row.rate_per_lot === null && row.rate_per_spread === null && row.rate_per_millions_volume === null" class="text-secondary-text">
            Standard Matrix
          </p>
        </div>
      </template>

      <!-- Cell: Total Commission -->
      <template #cell-total_commission="{ row }">
        <div class="text-right">
          <p class="font-mono text-sm font-bold text-primary-green">
            ${{ Number(row.total_commission || 0).toFixed(4) }}
          </p>
          <p class="text-[10px] text-secondary-text font-mono">
            {{ row.account_currency || "USD" }}
          </p>
        </div>
      </template>

      <!-- Cell: Timeline & Audit -->
      <template #cell-timeline="{ row }">
        <div class="text-[11px] text-secondary-text space-y-0.5">
          <p>
            Created: <span class="text-primary-text font-mono">{{ formatDate(row.created_at) }}</span>
          </p>
          <p v-if="row.approved_at">
            Approved: <span class="text-primary-green font-mono">{{ formatDate(row.approved_at) }}</span>
            <span v-if="row.wallet_transaction_id" class="block text-[10px] font-mono">
              Trx #{{ row.wallet_transaction_id }}
            </span>
          </p>
          <p v-if="row.rejected_at">
            Rejected: <span class="text-primary-red font-mono">{{ formatDate(row.rejected_at) }}</span>
            <span v-if="row.reject_reason" class="block text-[10px] text-primary-red truncate max-w-[150px]" :title="row.reject_reason">
              "{{ row.reject_reason }}"
            </span>
          </p>
        </div>
      </template>

      <!-- Cell: Actions -->
      <template #cell-actions="{ row }">
        <div class="flex items-center justify-end gap-1.5">
          <!-- Pending Action Buttons -->
          <template v-if="row.status === 'pending' && canApprove">
            <button
              type="button"
              :disabled="store.actionLoading"
              class="flex items-center gap-1 px-2.5 py-1 text-xs bg-primary-green/10 hover:bg-primary-green/20 text-primary-green rounded-lg transition-colors font-semibold cursor-pointer"
              title="Approve commission"
              @click="openSingleApprove(row)"
            >
              <HugeIcon :icon="CheckmarkCircle02Icon" :size="12" />
              <span>Approve</span>
            </button>

            <button
              type="button"
              :disabled="store.actionLoading"
              class="p-1.5 text-secondary-text hover:text-primary-red hover:bg-primary-red/10 rounded-lg transition-colors cursor-pointer"
              title="Reject commission"
              @click="openSingleReject(row)"
            >
              <HugeIcon :icon="Delete02Icon" :size="13" />
            </button>
          </template>

          <!-- Non-pending Badge Indicator -->
          <span
            v-else-if="row.status === 'approved'"
            class="text-[11px] text-primary-green font-mono font-medium"
          >
            Credited
          </span>
          <span
            v-else-if="row.status === 'rejected'"
            class="text-[11px] text-primary-red font-mono font-medium"
          >
            Disallowed
          </span>
        </div>
      </template>
    </DataTable>

    <!-- Approve Modal (Single & Bulk) -->
    <ApproveCommissionModal
      v-model="isApproveModalOpen"
      :commission="singleCommissionToApprove"
      :commissions="pendingSelectedCommissions"
      @approved="handleApprovedCallback"
    />

    <!-- Reject Modal (Single with Reason) -->
    <RejectCommissionModal
      v-model="isRejectModalOpen"
      :commission="singleCommissionToReject"
      @rejected="handleRejectedCallback"
    />

    <!-- Calculate Commissions Modal -->
    <CalculateCommissionsModal
      v-model="isCalculateModalOpen"
      @calculated="handleCalculatedCallback"
    />
  </div>
</template>
