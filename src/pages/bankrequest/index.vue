<template>
  <div class="space-y-6 pb-12 max-w-[1600px] mx-auto">
    <!-- ─── TOP ACTION & HEADER BAR ──────────────────────────────── -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="title-text text-primary-text tracking-tight flex items-center gap-2.5">
          <HugeIcon :icon="Building02Icon" :size="24" class="text-primary" />
          <span>Bank Account Requests</span>
        </h1>
        <p class="sub-text text-secondary-text mt-1">
          Review, verify document proofs, and approve or reject saved bank accounts for clients, IBs, and Fund Managers.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="btn-primary"
          :disabled="store.loading"
          @click="handleRefresh"
          title="Refresh bank requests"
        >
          <HugeIcon :icon="RefreshCwIcon" :size="14" :class="{ 'animate-spin': store.loading }" />
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- ─── 4 SUMMARY METRIC CARDS ──────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Accounts -->
      <div class="bg-card-background border border-primary-border rounded-2xl p-5 shadow-xs transition-all hover:border-primary/40 flex items-center justify-between">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text">
            Total Requests
          </p>
          <p class="text-2xl sm:text-3xl font-extrabold text-primary-text mt-1">
            {{ totalCount }}
          </p>
        </div>
        <div class="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <HugeIcon :icon="Building02Icon" :size="22" />
        </div>
      </div>

      <!-- Pending Approval -->
      <div class="bg-card-background border border-primary-border rounded-2xl p-5 shadow-xs transition-all hover:border-primary-yellow/40 flex items-center justify-between">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text">
            Pending Review
          </p>
          <p class="text-2xl sm:text-3xl font-extrabold text-primary-yellow mt-1">
            {{ pendingCount }}
          </p>
        </div>
        <div class="w-11 h-11 rounded-xl bg-primary-yellow/10 border border-primary-yellow/20 flex items-center justify-center text-primary-yellow shrink-0">
          <HugeIcon :icon="Time02Icon" :size="22" />
        </div>
      </div>

      <!-- Approved -->
      <div class="bg-card-background border border-primary-border rounded-2xl p-5 shadow-xs transition-all hover:border-primary-green/40 flex items-center justify-between">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text">
            Approved Accounts
          </p>
          <p class="text-2xl sm:text-3xl font-extrabold text-primary-green mt-1">
            {{ approvedCount }}
          </p>
        </div>
        <div class="w-11 h-11 rounded-xl bg-primary-green/10 border border-primary-green/20 flex items-center justify-center text-primary-green shrink-0">
          <HugeIcon :icon="CheckmarkCircle02Icon" :size="22" />
        </div>
      </div>

      <!-- Rejected -->
      <div class="bg-card-background border border-primary-border rounded-2xl p-5 shadow-xs transition-all hover:border-primary-red/40 flex items-center justify-between">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text">
            Rejected Accounts
          </p>
          <p class="text-2xl sm:text-3xl font-extrabold text-primary-red mt-1">
            {{ rejectedCount }}
          </p>
        </div>
        <div class="w-11 h-11 rounded-xl bg-primary-red/10 border border-primary-red/20 flex items-center justify-center text-primary-red shrink-0">
          <HugeIcon :icon="Alert02Icon" :size="22" />
        </div>
      </div>
    </div>

    <!-- ─── CONTROLS & FILTER BAR ────────────────────────────────── -->
    <div class="bg-card-background border border-primary-border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
      <!-- Status Tabs / Pills -->
      <div class="flex items-center gap-1.5 p-1 bg-background rounded-xl border border-primary-border w-full md:w-auto overflow-x-auto no-scrollbar">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          type="button"
          @click="setStatusFilter(tab.value)"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
          :class="
            store.filters.approval_status === tab.value
              ? 'bg-card-background text-primary shadow-2xs border border-primary-border font-bold'
              : 'text-secondary-text hover:text-primary-text'
          "
        >
          <span>{{ tab.label }}</span>
          <span
            v-if="tab.count !== undefined"
            class="text-[10px] px-1.5 py-0.2 rounded-full font-bold"
            :class="
              store.filters.approval_status === tab.value
                ? 'bg-primary/10 text-primary'
                : 'bg-primary-border/40 text-secondary-text'
            "
          >
            {{ tab.count }}
          </span>
        </button>
      </div>

      <!-- Filters & Search -->
      <div class="flex items-center gap-2.5 w-full md:w-auto flex-wrap sm:flex-nowrap">
        <!-- Search Input -->
        <div class="relative w-full sm:w-64">
          <HugeIcon :icon="Search01Icon" :size="15" class="absolute left-3 top-2.5 text-secondary-text" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search bank, IFSC, name..."
            class="input-field pl-9 pr-3 py-2 text-xs"
          />
        </div>

        <!-- User ID Filter -->
        <div class="relative w-full sm:w-36">
          <input
            v-model="userIdFilter"
            type="number"
            placeholder="User ID..."
            class="input-field px-3 py-2 text-xs"
            @keyup.enter="handleApplyFilters"
          />
        </div>

        <button
          v-if="hasActiveFilters"
          type="button"
          @click="clearFilters"
          class="px-3 py-2 text-xs font-semibold text-rose-500 hover:text-rose-600 bg-background border border-primary-border rounded-xl transition-colors cursor-pointer whitespace-nowrap"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- ─── DATA TABLE ───────────────────────────────────────────── -->
    <div class="bg-card-background border border-primary-border rounded-2xl overflow-hidden shadow-xs">
      <DataTable
        :columns="tableColumns"
        :data="filteredBankAccounts"
        :loading="store.loading"
        :pagination="store.pagination"
        @page-change="handlePageChange"
      >
        <!-- User / Owner Column -->
        <template #cell-user="{ row }">
          <div class="flex flex-col min-w-[150px]">
            <div class="flex items-center gap-2">
              <span class="font-bold text-primary-text text-xs sm:text-sm">
                {{ row.account_name || 'Account Holder' }}
              </span>
              <span v-if="row.label" class="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-semibold border border-primary/20">
                {{ row.label }}
              </span>
            </div>
            <div class="flex items-center gap-1.5 mt-0.5">
              <button
                type="button"
                @click="openUserAccountsDrawer(row.user_id)"
                class="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                title="View all bank accounts for this user"
              >
                User #{{ row.user_id }}
              </button>
              <span v-if="row.is_default" class="text-[9px] bg-primary-green/10 text-primary-green border border-primary-green/20 px-1.5 py-0.2 rounded font-bold">
                Default
              </span>
            </div>
          </div>
        </template>

        <!-- Bank & Branch Column -->
        <template #cell-bank="{ row }">
          <div class="flex flex-col min-w-[140px]">
            <span class="font-bold text-primary-text text-xs">{{ row.bank }}</span>
            <div class="flex items-center gap-1.5 text-[11px] text-secondary-text mt-0.5">
              <span class="uppercase font-medium">{{ row.account_type || 'Savings' }}</span>
              <span v-if="row.bank_branch">• {{ row.bank_branch }}</span>
            </div>
          </div>
        </template>

        <!-- Account Number & IFSC -->
        <template #cell-account_number="{ row }">
          <div class="flex flex-col min-w-[130px]">
            <span class="font-mono font-bold text-primary-text text-xs">{{ row.account_number }}</span>
            <span class="text-[11px] text-secondary-text font-medium mt-0.5">
              IFSC: {{ row.bank_branch_code || '—' }}
            </span>
          </div>
        </template>

        <!-- Document Proof Column -->
        <template #cell-document_proof="{ row }">
          <div v-if="row.document_proof_url || row.document_proof" class="flex items-center gap-2">
            <button
              type="button"
              @click="openProofModal(row)"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-background border border-primary-border text-secondary-text hover:text-primary-text hover:border-primary/40 transition-colors cursor-pointer shadow-2xs"
            >
              <HugeIcon :icon="FileAttachmentIcon" :size="13" class="text-primary" />
              <span>Verify Proof</span>
            </button>
          </div>
          <span v-else class="text-xs text-secondary-text italic">No document</span>
        </template>

        <!-- Approval Status Column -->
        <template #cell-status="{ row }">
          <div class="flex flex-col gap-1 items-start">
            <span
              class="px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize border"
              :class="getStatusClass(row.approval_status)"
            >
              {{ row.approval_status }}
            </span>
            <p
              v-if="row.approval_status === 'rejected' && row.rejection_reason"
              class="text-[10px] text-primary-red truncate max-w-[180px]"
              :title="row.rejection_reason"
            >
              {{ row.rejection_reason }}
            </p>
          </div>
        </template>

        <!-- Edit Unlock Column -->
        <template #cell-flag_enable_edit="{ row }">
          <div class="flex items-center gap-1.5">
            <button
              v-if="hasPermission('user_bank_account.enable_edit')"
              type="button"
              @click="toggleEditLock(row)"
              :disabled="store.actionLoading"
              class="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
              :class="row.flag_enable_edit ? 'bg-primary-yellow/10 border-primary-yellow/30 text-primary-yellow hover:bg-primary-yellow/20' : 'bg-background border-primary-border text-secondary-text hover:text-primary-text'"
              :title="row.flag_enable_edit ? 'Edit unlocked by user. Click to lock.' : 'Edit locked. Click to allow client editing.'"
            >
              <HugeIcon :icon="row.flag_enable_edit ? PencilEdit01Icon : LockPasswordIcon" :size="12" />
              <span>{{ row.flag_enable_edit ? 'Unlocked' : 'Locked' }}</span>
            </button>
            <span
              v-else
              class="text-[11px] font-medium"
              :class="row.flag_enable_edit ? 'text-primary-yellow' : 'text-secondary-text'"
            >
              {{ row.flag_enable_edit ? 'Unlocked' : 'Locked' }}
            </span>
          </div>
        </template>

        <!-- Date Column -->
        <template #cell-created_at="{ row }">
          <span class="text-xs text-secondary-text font-medium whitespace-nowrap">
            {{ formatDate(row.created_at) }}
          </span>
        </template>

        <!-- Actions Column -->
        <template #cell-actions="{ row }">
          <div class="flex items-center justify-end gap-1.5 whitespace-nowrap">
            <!-- Approve Button (If pending) -->
            <button
              v-if="row.approval_status === 'pending' && hasPermission('user_bank_account.approve')"
              type="button"
              @click="openApproveConfirm(row)"
              :disabled="store.actionLoading"
              class="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-primary-green/10 text-primary-green border border-primary-green/20 hover:bg-primary-green hover:text-white transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
              title="Approve Bank Account"
            >
              <HugeIcon :icon="CheckmarkCircle02Icon" :size="13" />
              <span>Approve</span>
            </button>

            <!-- Reject Button (If pending) -->
            <button
              v-if="row.approval_status === 'pending' && hasPermission('user_bank_account.reject')"
              type="button"
              @click="openRejectModal(row)"
              :disabled="store.actionLoading"
              class="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-primary-red/10 text-primary-red border border-primary-red/20 hover:bg-primary-red hover:text-white transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
              title="Reject Bank Account"
            >
              <HugeIcon :icon="Cancel01Icon" :size="13" />
              <span>Reject</span>
            </button>

            <!-- View User Accounts Button -->
            <button
              type="button"
              @click="openUserAccountsDrawer(row.user_id)"
              class="p-1.5 rounded-lg bg-background border border-primary-border text-secondary-text hover:text-primary-text hover:border-primary/40 transition-colors cursor-pointer shadow-2xs"
              title="View all bank accounts for this user"
            >
              <HugeIcon :icon="Building02Icon" :size="14" />
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- ─── REJECT REASON MODAL ──────────────────────────────────── -->
    <RejectReasonModal
      :open="showRejectModal"
      :account="selectedAccount"
      :loading="store.actionLoading"
      @close="showRejectModal = false"
      @submit="handleRejectSubmit"
    />

    <!-- ─── PROOF DOCUMENT MODAL ─────────────────────────────────── -->
    <ProofDocumentModal
      :open="showProofModal"
      :account="selectedAccount"
      @close="showProofModal = false"
    />

    <!-- ─── USER BANK ACCOUNTS DRAWER ────────────────────────────── -->
    <UserBankAccountsDrawer
      :open="showUserDrawer"
      :user-id="selectedUserId"
      @close="showUserDrawer = false"
      @preview-proof="openProofModal"
      @approve="openApproveConfirm"
      @reject="openRejectModal"
    />

    <!-- ─── APPROVAL CONFIRMATION DIALOG ─────────────────────────── -->
    <ConfirmationDialog
      :open="showApproveDialog"
      title="Approve Bank Account"
      :message="`Are you sure you want to approve bank account ${selectedAccount?.bank} (${selectedAccount?.account_number}) for ${selectedAccount?.account_name || 'User #' + selectedAccount?.user_id}?`"
      confirm-text="Approve Account"
      type="success"
      :loading="store.actionLoading"
      @confirm="handleConfirmApprove"
      @cancel="showApproveDialog = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  Building02Icon,
  RefreshCwIcon,
  Search01Icon,
  Time02Icon,
  CheckmarkCircle02Icon,
  Alert02Icon,
  FileAttachmentIcon,
  Cancel01Icon,
  LockPasswordIcon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons";

import { useBankRequestStore } from "@/stores/bankRequest/bankRequest";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

import DataTable from "@/components/common/DataTable/DataTable.vue";
import ConfirmationDialog from "@/components/common/ConfirmationDialog.vue";
import RejectReasonModal from "./components/RejectReasonModal.vue";
import ProofDocumentModal from "./components/ProofDocumentModal.vue";
import UserBankAccountsDrawer from "./components/UserBankAccountsDrawer.vue";

const store = useBankRequestStore();
const { hasPermission } = usePermissionCheck();

const searchQuery = ref("");
const userIdFilter = ref("");

// Modals & Drawers state
const showRejectModal = ref(false);
const showProofModal = ref(false);
const showUserDrawer = ref(false);
const showApproveDialog = ref(false);
const selectedAccount = ref(null);
const selectedUserId = ref(null);

// Table Columns definition
const tableColumns = [
  { key: "user", label: "User / Account Holder", sortable: true },
  { key: "bank", label: "Bank & Branch", sortable: true },
  { key: "account_number", label: "Account Number & IFSC", sortable: true },
  { key: "document_proof", label: "Document Proof" },
  { key: "status", label: "Status", sortable: true },
  { key: "flag_enable_edit", label: "Edit Permission" },
  { key: "created_at", label: "Submitted Date", sortable: true },
  { key: "actions", label: "Actions", headerClass: "text-right" },
];

onMounted(() => {
  store.fetchBankAccounts(store.filters);
});

const bankAccounts = computed(() => store.bankAccounts || []);

// Summary counts
const totalCount = computed(() => bankAccounts.value.length);
const pendingCount = computed(() => bankAccounts.value.filter((a) => a.approval_status === "pending").length);
const approvedCount = computed(() => bankAccounts.value.filter((a) => a.approval_status === "approved").length);
const rejectedCount = computed(() => bankAccounts.value.filter((a) => a.approval_status === "rejected").length);

const statusTabs = computed(() => [
  { label: "Pending", value: "pending", count: pendingCount.value },
  { label: "Approved", value: "approved", count: approvedCount.value },
  { label: "Rejected", value: "rejected", count: rejectedCount.value },
  { label: "All Requests", value: "all", count: totalCount.value },
]);

const hasActiveFilters = computed(() => {
  return (
    store.filters.approval_status !== "pending" ||
    Boolean(searchQuery.value) ||
    Boolean(userIdFilter.value)
  );
});

const filteredBankAccounts = computed(() => {
  let list = bankAccounts.value;

  // Filter by approval status
  if (store.filters.approval_status && store.filters.approval_status !== "all") {
    list = list.filter((a) => a.approval_status === store.filters.approval_status);
  }

  // Filter by user ID
  if (userIdFilter.value) {
    list = list.filter((a) => String(a.user_id) === String(userIdFilter.value).trim());
  }

  // Filter by search query
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (a) =>
        a.account_name?.toLowerCase().includes(q) ||
        a.bank?.toLowerCase().includes(q) ||
        a.account_number?.toLowerCase().includes(q) ||
        a.bank_branch_code?.toLowerCase().includes(q) ||
        a.bank_branch?.toLowerCase().includes(q) ||
        a.label?.toLowerCase().includes(q)
    );
  }

  return list;
});

const setStatusFilter = (status) => {
  store.filters.approval_status = status;
  store.fetchBankAccounts({
    ...store.filters,
    approval_status: status,
    user_id: userIdFilter.value || undefined,
  }, true);
};

const handleApplyFilters = () => {
  store.fetchBankAccounts({
    ...store.filters,
    user_id: userIdFilter.value || undefined,
  }, true);
};

const clearFilters = () => {
  searchQuery.value = "";
  userIdFilter.value = "";
  store.filters.approval_status = "pending";
  store.fetchBankAccounts(store.filters, true);
};

const handleRefresh = () => {
  store.fetchBankAccounts(store.filters, true);
};

const handlePageChange = (newPage) => {
  store.pagination.page = newPage;
};

// Handlers for Modals & Actions
const openProofModal = (account) => {
  selectedAccount.value = account;
  showProofModal.value = true;
};

const openUserAccountsDrawer = (userId) => {
  selectedUserId.value = userId;
  store.fetchUserBankAccounts(userId, true);
  showUserDrawer.value = true;
};

const openApproveConfirm = (account) => {
  selectedAccount.value = account;
  showApproveDialog.value = true;
};

const handleConfirmApprove = () => {
  if (!selectedAccount.value) return;
  store.approveBankAccount(selectedAccount.value.id, () => {
    showApproveDialog.value = false;
  });
};

const openRejectModal = (account) => {
  selectedAccount.value = account;
  showRejectModal.value = true;
};

const handleRejectSubmit = (reason) => {
  if (!selectedAccount.value) return;
  store.rejectBankAccount(selectedAccount.value.id, reason, () => {
    showRejectModal.value = false;
  });
};

const toggleEditLock = (account) => {
  store.toggleEnableEdit(account.user_id, account.id, !account.flag_enable_edit);
};

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case "approved":
      return "bg-primary-green/10 text-primary-green border-primary-green/20";
    case "rejected":
      return "bg-primary-red/10 text-primary-red border-primary-red/20";
    case "pending":
      return "bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20";
    default:
      return "bg-background text-secondary-text border-primary-border";
  }
};

const formatDate = (dateVal) => {
  if (!dateVal) return "—";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return dateVal;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  } catch (e) {
    return dateVal;
  }
};
</script>
