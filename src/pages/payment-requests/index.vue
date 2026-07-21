<template>
  <div class="px-4 pb-8">
    <!-- Summary Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
      <template v-if="store.loading">
        <div
          v-for="n in 6"
          :key="n"
          class="bg-card-background border border-primary-border rounded-xl p-4 animate-pulse space-y-2"
        >
          <div class="h-3 w-28 bg-background rounded" />
          <div class="h-6 w-16 bg-background rounded" />
        </div>
      </template>
      <template v-else>
        <div
          v-for="card in summaryCards"
          :key="card.label"
          class="bg-card-background border border-primary-border rounded-xl p-4"
        >
          <p
            class="text-[11px] uppercase tracking-wide text-secondary-text mb-1"
          >
            {{ card.label }}
          </p>
          <p class="text-2xl font-bold" :class="card.color">{{ card.value }}</p>
        </div>
      </template>
    </div>

    <!-- Filters -->
    <div
      class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 mb-5"
    >
      <div
        class="flex w-full min-w-0 flex-col gap-2 rounded-xl border border-primary-border bg-card-background/40 p-2 sm:flex-row sm:items-center xl:flex-1 xl:flex-nowrap"
      >
        <!-- Client Search -->
        <BaseSelect
          v-model="store.filters.user_id"
          :options="clientOptions"
          placeholder="All Clients"
          searchable
          class="w-full sm:w-40 xl:w-40"
          @search="onClientSearch"
          @update:modelValue="store.applyFilters()"
        />

        <!-- Account Search -->
        <BaseSelect
          v-model="store.filters.trading_account_id"
          :options="accountOptions"
          placeholder="All Accounts"
          searchable
          class="w-full sm:w-44 xl:w-44"
          @search="onAccountSearch"
          @update:modelValue="store.applyFilters()"
        />

        <!-- Type -->
        <BaseSelect
          v-model="store.filters.type"
          :options="typeOptions"
          placeholder="All Types"
          :allow-all="true"
          all-label="All Types"
          class="w-full sm:w-36 xl:w-36"
          @update:modelValue="store.applyFilters()"
        />

        <!-- Approval Status -->
        <BaseSelect
          v-model="store.filters.approval_status"
          :options="statusOptions"
          placeholder="All Statuses"
          :allow-all="true"
          all-label="All Statuses"
          class="w-full sm:w-36 xl:w-36"
          @update:modelValue="store.applyFilters()"
        />

        <!-- Date Range -->
        <div
          class="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:w-[310px] xl:flex-none"
        >
          <input
            v-model="store.filters.from_date"
            type="date"
            class="w-full px-3 py-2 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors"
            @change="onDateChange"
          />
          <input
            v-model="store.filters.to_date"
            type="date"
            class="w-full px-3 py-2 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors"
            @change="onDateChange"
          />
        </div>

        <!-- Clear -->
        <button
          v-if="hasFilters"
          class="rounded-lg px-3 py-2 text-xs font-medium text-secondary-text hover:bg-background hover:text-primary-text transition-colors sm:flex-none"
          @click="store.resetFilters()"
        >
          Clear
        </button>

        <Tooltip text="Refresh" position="right">
          <button
            type="button"
            :disabled="store.loading"
            class="inline-flex items-center justify-center rounded-lg border border-primary-border p-1.5 text-secondary-text transition-colors hover:text-primary-text hover:bg-background disabled:opacity-60 disabled:cursor-not-allowed"
            @click="
              () => {
                store.fetchRequests(true);
              }
            "
          >
            <RefreshCw
              class="h-3.5 w-3.5"
              :class="{ 'animate-spin': store.loading }"
            />
          </button>
        </Tooltip>
      </div>
    </div>

    <!-- Table -->
    <div class="w-full border border-primary-border rounded-xl overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-primary-border bg-card-background">
            <th
              class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-3 py-3"
            >
              ID
            </th>
            <th
              class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-3 py-3"
            >
              User
            </th>
            <th
              class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-3 py-3"
            >
              Account
            </th>
            <th
              class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-3 py-3"
            >
              Type
            </th>
            <th
              class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-3 py-3"
            >
              Amount
            </th>
            <th
              class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-3 py-3"
            >
              Method & Reference
            </th>
            <th
              class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-3 py-3"
            >
              Status
            </th>
            <th
              class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-3 py-3"
            >
              Timing
            </th>
            <th
              class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-widest px-3 py-3"
            >
              Actions
            </th>
          </tr>
        </thead>

        <!-- Skeleton -->
        <tbody v-if="store.loading">
          <tr
            v-for="n in 8"
            :key="n"
            class="border-b border-primary-border bg-card-background animate-pulse"
          >
            <td class="px-3 py-3.5">
              <div class="h-3 w-8 bg-background rounded" />
            </td>
            <td class="px-3 py-3.5">
              <div class="space-y-1">
                <div class="h-3 w-24 bg-background rounded" />
                <div class="h-2.5 w-28 bg-background rounded" />
                <div class="h-2.5 w-12 bg-background rounded" />
              </div>
            </td>
            <td class="px-3 py-3.5">
              <div class="space-y-1">
                <div class="h-3 w-20 bg-background rounded" />
                <div class="h-2.5 w-24 bg-background rounded" />
                <div class="h-2.5 w-12 bg-background rounded" />
              </div>
            </td>
            <td class="px-3 py-3.5">
              <div class="h-5 w-16 bg-background rounded-full" />
            </td>
            <td class="px-3 py-3.5">
              <div class="space-y-1">
                <div class="h-3 w-14 bg-background rounded" />
                <div class="h-2.5 w-10 bg-background rounded" />
              </div>
            </td>
            <td class="px-3 py-3.5">
              <div class="space-y-1">
                <div class="h-3 w-20 bg-background rounded" />
                <div class="h-2.5 w-24 bg-background rounded" />
              </div>
            </td>
            <td class="px-3 py-3.5">
              <div class="space-y-1">
                <div class="h-5 w-14 bg-background rounded-full" />
                <div class="h-5 w-14 bg-background rounded-full" />
              </div>
            </td>
            <td class="px-3 py-3.5">
              <div class="h-3 w-20 bg-background rounded" />
            </td>
            <td class="px-3 py-3.5 flex justify-end gap-1">
              <div class="h-6 w-16 bg-background rounded-lg" />
              <div class="h-6 w-14 bg-background rounded-lg" />
            </td>
          </tr>
        </tbody>

        <!-- Empty -->
        <tbody v-else-if="store.records.length === 0">
          <tr>
            <td colspan="9" class="py-20 text-center bg-card-background">
              <div class="flex flex-col items-center gap-3">
                <div
                  class="w-12 h-12 rounded-full bg-background flex items-center justify-center"
                >
                  <Receipt class="w-5 h-5 text-secondary-text" />
                </div>
                <p class="text-sm font-semibold text-primary-text">
                  No payment requests found
                </p>
                <p class="text-xs text-secondary-text">
                  Try adjusting your filters.
                </p>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Data -->
        <tbody v-else>
          <tr
            v-for="req in store.records"
            :key="req.id"
            class="border-b border-primary-border last:border-none bg-card-background hover:bg-background transition-colors"
          >
            <td class="px-3 py-3.5 text-xs font-medium text-primary-text">
              #{{ req.id }}
            </td>

            <td class="px-3 py-3.5">
              <div class="space-y-0.5">
                <p class="text-xs font-medium text-primary-text">
                  {{ req.user_name || "—" }}
                </p>
                <p class="text-[11px] text-secondary-text">
                  {{ req.user_email || "—" }}
                </p>
                <!-- <p class="text-[11px] text-secondary-text">ID {{ req.user_id }}</p> -->
              </div>
            </td>
            <td class="px-3 py-3.5">
              <div class="space-y-0.5">
                <p class="text-xs font-medium text-primary-text">
                  {{ req.trading_account_number || "IB Wallet Withdrawal" }}
                </p>
                <!-- <p class="text-[11px] text-secondary-text">Account ID {{ req.trading_account_id }}</p> -->
                <p
                  class="text-[11px] text-secondary-text capitalize font-medium"
                >
                  {{ req.account_type }} {{ req.broker_currency }}
                </p>
              </div>
            </td>

            <td class="px-3 py-3.5">
              <span
                class="text-[11px] font-semibold px-2 py-0.5 rounded-full border capitalize"
                :class="
                  req.type === 'deposit'
                    ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                    : 'bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20'
                "
                >{{ req.type }}</span
              >
            </td>

            <td class="px-3 py-3.5">
              <div class="space-y-0.5">
                <p class="text-xs font-semibold text-primary-text tabular-nums">
                  ${{ fmt(req.amount) }}
                </p>
                <!-- <p class="text-[11px] text-secondary-text">{{ req.currency }} <span v-if="req.broker_currency && req.broker_currency !== req.currency" class="opacity-50">({{ req.broker_currency }})</span></p> -->
              </div>
            </td>

            <td class="px-3 py-3.5">
              <div class="space-y-1">
                <p class="text-xs text-primary-text capitalize font-medium">
                  {{ req.gateway }} &middot; {{ req.method }}
                </p>
                <p class="text-[11px] text-secondary-text capitalize">
                  {{ req.acquirer }}
                </p>
                <p
                  v-if="req.txid"
                  class="text-[10px] text-secondary-text font-mono truncate max-w-[140px]"
                  :title="req.txid"
                >
                  TX: {{ req.txid }}
                </p>
                <p
                  v-if="req.external_payment_id"
                  class="text-[10px] text-secondary-text font-mono truncate max-w-[140px]"
                  :title="req.external_payment_id"
                >
                  Ref: {{ req.external_payment_id }}
                </p>
              </div>
            </td>

            <td class="px-3 py-3.5">
              <div class="flex flex-col gap-1.5 items-start">
                <!-- <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full border capitalize"
                  :class="paymentStatusClass(req.payment_status)"
                >
                  {{ req.payment_status }}
                </span> -->
                <span
                  class="text-[11px] font-semibold px-2 py-0.5 rounded-full border capitalize"
                  :class="[
                    approvalStatusClass(req.approval_status),
                    req.approval_status === 'pending' ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                  ]"
                  @click="req.approval_status === 'pending' && openChangeStatusDialog(req)"
                >
                  {{ req.approval_status }}
                </span>
                <p
                  v-if="req.rejection_reason"
                  class="text-[10px] text-red-500 max-w-[140px] leading-tight mt-1"
                  :title="req.rejection_reason"
                >
                  {{ req.rejection_reason }}
                </p>
              </div>
            </td>

            <td class="px-3 py-3.5">
              <div class="space-y-1.5">
                <div class="flex flex-col">
                  <span
                    class="text-[10px] text-secondary-text uppercase font-semibold"
                    >Created</span
                  >
                  <span class="text-xs text-primary-text">{{
                    formatDate(req.created_at)
                  }}</span>
                </div>
                <div v-if="req.approved_at" class="flex flex-col">
                  <span
                    class="text-[10px] text-secondary-text uppercase font-semibold"
                    >Processed</span
                  >
                  <span class="text-xs text-primary-text">{{
                    formatDate(req.approved_at)
                  }}</span>
                  <!-- <span class="text-[10px] text-secondary-text">By ID {{ req.approved_by }}</span> -->
                </div>
              </div>
            </td>

            <td class="px-3 py-3.5">
              <div class="flex items-center justify-end gap-1.5">
                <template v-if="req.approval_status === 'pending'">
                  <button
                    class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border bg-primary-green/10 text-primary-green border-primary-green/20 hover:bg-primary-green/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    @click="openConfirmDialog('approve', req)"
                  >
                    <Check class="w-3 h-3" />
                    Approve
                  </button>
                  <button
                    class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border bg-primary-red/10 text-primary-red border-primary-red/20 hover:bg-primary-red/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    @click="openConfirmDialog('reject', req)"
                  >
                    <X class="w-3 h-3" />
                    Reject
                  </button>
                </template>
                <span v-else class="text-[11px] text-secondary-text"
                  >Processed</span
                >
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4">
      <Pagination
        v-if="store.pagination.total_items > store.pagination.per_page"
        :pagination="store.pagination"
        @page-change="handlePageChange"
      />
    </div>

    <PaymentRequestConfirmDialog
      :open="confirmDialog.open"
      :request="confirmDialog.request"
      :action="confirmDialog.action"
      :loading="isConfirmLoading"
      @close="closeConfirmDialog"
      @confirm="handleConfirm"
    />

    <ChangePaymentStatusDialog
      :open="changeStatusDialog.open"
      :request="changeStatusDialog.request"
      @close="closeChangeStatusDialog"
      @success="handleStatusChangeSuccess"
    />
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from "vue";
import { Receipt, Check, X, RefreshCw } from "lucide-vue-next";
import { usePaymentRequestsStore } from "@/stores/paymentRequests/paymentRequests";
import { useProfileStore } from "@/stores/profile/profile";
import Pagination from "@/components/common/Pagination.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
import PaymentRequestConfirmDialog from "@/components/paymentRequests/PaymentRequestConfirmDialog.vue";
import ChangePaymentStatusDialog from "@/components/paymentRequests/ChangePaymentStatusDialog.vue";
import { formatDate } from "@/utils/timeFormatter";

const store = usePaymentRequestsStore();
const profileStore = useProfileStore();

// ── Client / Account search options (populated from store methods) ──
const clientOptions = ref([]);
const accountOptions = ref([]);
const confirmDialog = ref({
  open: false,
  action: "approve",
  request: null,
});

const changeStatusDialog = ref({
  open: false,
  request: null,
});

const openChangeStatusDialog = (request) => {
  changeStatusDialog.value = {
    open: true,
    request,
  };
};

const closeChangeStatusDialog = () => {
  changeStatusDialog.value = {
    open: false,
    request: null,
  };
};

const handleStatusChangeSuccess = () => {
  store.fetchRequests(true);
};

let clientTimer = null;
let accountTimer = null;

const onClientSearch = (q) => {
  clearTimeout(clientTimer);
  clientTimer = setTimeout(async () => {
    const res = await store.fetchAllClients(q);
    const data = res?.data || res || [];
    clientOptions.value = (data || []).map((c) => ({
      label: c.label || c.email,
      value: c.value,
    }));
  }, 350);
};

const onAccountSearch = (q) => {
  clearTimeout(accountTimer);
  accountTimer = setTimeout(async () => {
    const res = await store.fetchAllAccounts(q);
    const data = res?.data || res || [];
    accountOptions.value = (data || []).map((a) => ({
      label: `#${a.account_number} · ${a.broker_label ?? ""}`.trim(),
      value: a.account_id,
    }));
  }, 350);
};

// ── Dropdown options ──
const typeOptions = [
  { label: "Deposit", value: "deposit" },
  { label: "Withdrawal", value: "withdrawal" },
];

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

// ── Date range: only apply when both dates selected ──
const onDateChange = () => {
  if (store.filters.from_date && store.filters.to_date) {
    store.applyFilters();
  }
};

// ── Filters active check ──
const hasFilters = computed(
  () =>
    store.filters.user_id ||
    store.filters.trading_account_id ||
    store.filters.type ||
    store.filters.approval_status ||
    store.filters.from_date ||
    store.filters.to_date,
);

// ── Summary cards ──
const summaryCards = computed(() => {
  const s = store.summary;
  return [
    {
      label: "Pending Deposits",
      value: s.pending_deposits ?? 0,
      color: "text-primary-yellow",
    },
    {
      label: "Approved Deposits",
      value: s.approved_deposits ?? 0,
      color: "text-primary-green",
    },
    {
      label: "Rejected Deposits",
      value: s.rejected_deposits ?? 0,
      color: "text-primary-red",
    },
    {
      label: "Pending Withdrawals",
      value: s.pending_withdrawals ?? 0,
      color: "text-primary-yellow",
    },
    {
      label: "Approved Withdrawals",
      value: s.approved_withdrawals ?? 0,
      color: "text-primary-green",
    },
    {
      label: "Rejected Withdrawals",
      value: s.rejected_withdrawals ?? 0,
      color: "text-primary-red",
    },
  ];
});

// ── Badge helpers ──
const paymentStatusClass = (s) =>
  ({
    paid: "bg-primary-green/10 text-primary-green border-primary-green/20",
    pending:
      "bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20",
    failed: "bg-primary-red/10 text-primary-red border-primary-red/20",
  })[s] ?? "bg-background text-secondary-text border-primary-border";

const approvalStatusClass = (s) =>
  ({
    pending:
      "bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20",
    approved: "bg-primary-green/10 text-primary-green border-primary-green/20",
    rejected: "bg-primary-red/10 text-primary-red border-primary-red/20",
  })[s] ?? "bg-background text-secondary-text border-primary-border";

const fmt = (v) =>
  (v ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
// const formatDate = (v) => v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const isConfirmLoading = computed(() =>
  confirmDialog.value.action === "approve"
    ? store.approveLoading
    : store.rejectLoading,
);

const openConfirmDialog = (action, request) => {
  confirmDialog.value = {
    open: true,
    action,
    request,
  };
};

const closeConfirmDialog = () => {
  if (isConfirmLoading.value) return;

  confirmDialog.value = {
    open: false,
    action: "approve",
    request: null,
  };
};

const handleConfirm = async () => {
  if (!confirmDialog.value.request) return;

  const requestId = confirmDialog.value.request.id;

  try {
    if (confirmDialog.value.action === "approve") {
      await store.approveRequest(requestId);
    } else {
      await store.rejectRequest(requestId);
    }
  } finally {
    closeConfirmDialog();
  }
};

const handlePageChange = (page) => {
  store.setPage(page);
  store.fetchRequests(true);
};

onMounted(() => store.fetchRequests());
</script>
