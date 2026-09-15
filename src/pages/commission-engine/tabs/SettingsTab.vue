<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  Settings01Icon,
  RefreshCwIcon,
  Search01Icon,
  Cancel01Icon,
  Tick02Icon,
  Alert02Icon,
  InformationCircleIcon,
  Coins01Icon,
  UserIcon,
  Clock01Icon,
  Calendar01Icon,
  PlayIcon,
  FilterIcon,
  Invoice01Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  Loading03Icon,
  EyeIcon,
} from "@hugeicons/core-free-icons";
import { useCommissionEngineStore } from "@/stores/commissionEngine/commissionEngine";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import ConfirmationDialog from "@/components/common/ConfirmationDialog.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
import SettlementRunResultModal from "../components/SettlementRunResultModal.vue";
import BatchDetailsModal from "../components/BatchDetailsModal.vue";

const store = useCommissionEngineStore();
const router = useRouter();
const { hasPermission } = usePermissionCheck();

// ─── Permissions ─────────────────────────────────────────
const canView = computed(() => hasPermission("ib_commission.view"));
const canManageRates = computed(() => hasPermission("ib_commission.manage_rates"));
const canApprove = computed(() => hasPermission("ib_commission.approve"));

// ─── Master Form State ───────────────────────────────────
const masterForm = ref({
  payout_mode: "require_approval", // 'require_approval' | 'auto_settlement'
  settlement_frequency: "daily", // 'daily' | 'weekly' | 'monthly'
  settle_hour: 0,
  settle_minute: 0,
  weekly_weekday: 0, // 0=Mon ... 6=Sun
  monthly_day: 1, // 1-28
  wallet_target: "main", // 'main' | 'demo'
  is_active: true,
  only_active_ibs: true,
});

// ─── Per-IB Form State ───────────────────────────────────
const selectedIbId = ref(null);
const ibSearchQuery = ref("");
const searchDebounceTimer = ref(null);

const ibForm = ref({
  payout_mode: "require_approval",
  settlement_frequency: "daily",
  settle_hour: 0,
  settle_minute: 0,
  weekly_weekday: 0,
  monthly_day: 1,
  wallet_target: "main",
  is_active: true,
});

const ibFormErrors = ref({});

// ─── Settlements Filters State ───────────────────────────
const settlementFilterIbId = ref("");
const settlementFilterPeriodType = ref("");
const settlementFilterPeriodKey = ref("");
const settlementFilterStatus = ref("");
const filterDebounceTimer = ref(null);

// ─── Modals & Dialogs State ──────────────────────────────
const isApplyAllConfirmOpen = ref(false);
const isSettleIbConfirmOpen = ref(false);
const isRunAllDueConfirmOpen = ref(false);

const isRunResultModalOpen = ref(false);
const runResultData = ref(null);
const isRunResultDryRun = ref(false);

const isBatchDetailsModalOpen = ref(false);
const selectedBatchForDetails = ref(null);

// ─── Options Constants ───────────────────────────────────
const WEEKDAYS = [
  { value: 0, label: "Monday" },
  { value: 1, label: "Tuesday" },
  { value: 2, label: "Wednesday" },
  { value: 3, label: "Thursday" },
  { value: 4, label: "Friday" },
  { value: 5, label: "Saturday" },
  { value: 6, label: "Sunday" },
];

const MODES = [
  {
    value: "require_approval",
    label: "Require Approval",
    hint: "Pending commissions stay pending until admin manual approval",
  },
  {
    value: "auto_settlement",
    label: "Auto Settlement",
    hint: "Pending commissions accumulate & auto-credit wallet on schedule",
  },
];

const WALLET_TARGETS = [
  {
    value: "main",
    label: "Main CRM Wallet",
    hint: "Credit standard CRM IB wallet balances (default)",
  },
  {
    value: "demo",
    label: "Demo Wallet",
    hint: "Credit separate demo wallet balances",
  },
];

const FREQUENCIES = [
  { value: "daily", label: "Daily (Yesterday's Trades)" },
  { value: "weekly", label: "Weekly (Last ISO Week)" },
  { value: "monthly", label: "Monthly (Last Calendar Month)" },
];

const PERIOD_TYPE_OPTIONS = [
  { label: "All Periods", value: "" },
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Paid", value: "paid" },
  { label: "Empty (0 Payable)", value: "empty" },
  { label: "Failed", value: "failed" },
];

// ─── Table Columns ───────────────────────────────────────
const columns = [
  { key: "id", label: "Batch ID", width: "90px", sortable: true },
  { key: "ib", label: "IB Partner", width: "160px" },
  { key: "period", label: "Period", width: "140px" },
  { key: "entries", label: "Entries", align: "center", width: "90px" },
  { key: "amount", label: "Total Amount", align: "right", width: "140px", sortable: true },
  { key: "status", label: "Status", align: "center", width: "120px" },
  { key: "wallet_tx", label: "Wallet Tx", align: "center", width: "110px" },
  { key: "paid_at", label: "Paid At", width: "160px" },
  { key: "actions", label: "Actions", align: "right", width: "100px" },
];

// ─── Lifecycle & Initial Load ────────────────────────────
onMounted(() => {
  store.fetchMasterPayoutSummary();
  store.fetchSettlements({ page: 1 });
  store.searchIbs("");
});

// Watch master summary to initialize master form state when available
watch(
  () => store.masterPayoutSummary,
  (summary) => {
    if (summary?.master_state === "all_auto_settlement") {
      masterForm.value.payout_mode = "auto_settlement";
    } else if (summary?.master_state === "all_require_approval") {
      masterForm.value.payout_mode = "require_approval";
    }
    if (summary?.wallet_target_master_state === "all_demo") {
      masterForm.value.wallet_target = "demo";
    } else if (summary?.wallet_target_master_state === "all_main") {
      masterForm.value.wallet_target = "main";
    }
  },
  { immediate: true }
);

// Watch selected IB changes to fetch and populate per-IB form
watch(
  () => selectedIbId.value,
  async (newIbId) => {
    ibFormErrors.value = {};
    if (!newIbId) {
      store.currentIbPayoutSettings = null;
      return;
    }
    await store.fetchIbPayoutSettings(newIbId, true);
  }
);

// Populate IB form when currentIbPayoutSettings changes
watch(
  () => store.currentIbPayoutSettings,
  (settings) => {
    if (settings) {
      ibForm.value = {
        payout_mode: settings.payout_mode || "require_approval",
        settlement_frequency: settings.settlement_frequency || "daily",
        settle_hour: settings.settle_hour ?? 0,
        settle_minute: settings.settle_minute ?? 0,
        weekly_weekday: settings.weekly_weekday ?? 0,
        monthly_day: settings.monthly_day ?? 1,
        wallet_target: settings.wallet_target || "main",
        is_active: settings.is_active !== undefined ? settings.is_active : true,
      };
    }
  }
);

// ─── Master Form Handlers ────────────────────────────────
const handleApplyToAllClick = () => {
  isApplyAllConfirmOpen.value = true;
};

const handleConfirmApplyToAll = async () => {
  isApplyAllConfirmOpen.value = false;
  const payload = {
    payout_mode: masterForm.value.payout_mode,
    wallet_target: masterForm.value.wallet_target || "main",
    only_active_ibs: !!masterForm.value.only_active_ibs,
  };

  if (masterForm.value.payout_mode === "auto_settlement") {
    payload.settlement_frequency = masterForm.value.settlement_frequency || "daily";
    payload.settle_hour = Number(masterForm.value.settle_hour) || 0;
    payload.settle_minute = Number(masterForm.value.settle_minute) || 0;
    payload.weekly_weekday = Number(masterForm.value.weekly_weekday) || 0;
    payload.monthly_day = Number(masterForm.value.monthly_day) || 1;
    payload.is_active = !!masterForm.value.is_active;
  }

  await store.applyPayoutToAll(payload);
};

// ─── IB Search & Selection Handlers ──────────────────────
const handleIbSearchInput = (e) => {
  const q = e?.target ? e.target.value : String(e || "");
  if (searchDebounceTimer.value) clearTimeout(searchDebounceTimer.value);
  searchDebounceTimer.value = setTimeout(() => {
    store.searchIbs(q);
  }, 300);
};

const selectIbFromSearch = (ib) => {
  selectedIbId.value = ib.value || ib.ib_id || ib.id;
};

// ─── Per-IB Form Validation & Save ───────────────────────
const validateIbForm = () => {
  const errors = {};
  if (ibForm.value.payout_mode === "auto_settlement") {
    if (!ibForm.value.settlement_frequency) {
      errors.settlement_frequency = "Settlement frequency is required for auto mode.";
    }
    const hour = Number(ibForm.value.settle_hour);
    if (isNaN(hour) || hour < 0 || hour > 23) {
      errors.settle_hour = "Hour must be between 0 and 23.";
    }
    const minute = Number(ibForm.value.settle_minute);
    if (isNaN(minute) || minute < 0 || minute > 59) {
      errors.settle_minute = "Minute must be between 0 and 59.";
    }
    if (ibForm.value.settlement_frequency === "weekly") {
      const weekday = Number(ibForm.value.weekly_weekday);
      if (isNaN(weekday) || weekday < 0 || weekday > 6) {
        errors.weekly_weekday = "Weekday must be between 0 (Mon) and 6 (Sun).";
      }
    }
    if (ibForm.value.settlement_frequency === "monthly") {
      const day = Number(ibForm.value.monthly_day);
      if (isNaN(day) || day < 1 || day > 28) {
        errors.monthly_day = "Monthly day must be between 1 and 28.";
      }
    }
  }
  ibFormErrors.value = errors;
  return Object.keys(errors).length === 0;
};

const handleSaveIb = async () => {
  if (!selectedIbId.value) return;
  if (!validateIbForm()) return;

  const payload = {
    payout_mode: ibForm.value.payout_mode,
    wallet_target: ibForm.value.wallet_target || "main",
    is_active: !!ibForm.value.is_active,
  };

  if (ibForm.value.payout_mode === "auto_settlement") {
    payload.settlement_frequency = ibForm.value.settlement_frequency;
    payload.settle_hour = Number(ibForm.value.settle_hour) || 0;
    payload.settle_minute = Number(ibForm.value.settle_minute) || 0;
    if (ibForm.value.settlement_frequency === "weekly") {
      payload.weekly_weekday = Number(ibForm.value.weekly_weekday) || 0;
    }
    if (ibForm.value.settlement_frequency === "monthly") {
      payload.monthly_day = Number(ibForm.value.monthly_day) || 1;
    }
  }

  await store.saveIbPayoutSettings(selectedIbId.value, payload);
};

// ─── Single IB Settlement Actions (Dry Run / Settle Now) ─
const handleDryRunSingleIb = async () => {
  if (!selectedIbId.value) return;
  try {
    const res = await store.runSettlement({
      ib_id: Number(selectedIbId.value),
      dry_run: true,
      force: true,
    });
    runResultData.value = res?.data || res;
    isRunResultDryRun.value = true;
    isRunResultModalOpen.value = true;
  } catch (err) {
    console.error("Dry run error:", err);
  }
};

const handleSettleSingleIbClick = () => {
  if (!selectedIbId.value) return;
  isSettleIbConfirmOpen.value = true;
};

const handleConfirmSettleSingleIb = async () => {
  isSettleIbConfirmOpen.value = false;
  if (!selectedIbId.value) return;
  try {
    const res = await store.runSettlement({
      ib_id: Number(selectedIbId.value),
      dry_run: false,
      force: true,
    });
    runResultData.value = res?.data || res;
    isRunResultDryRun.value = false;
    isRunResultModalOpen.value = true;
  } catch (err) {
    console.error("Settle now error:", err);
  }
};

const navigateToCommissionsForIb = () => {
  if (!selectedIbId.value) return;
  router.push({
    path: "/commission-engine/commissions",
    query: { ib_id: selectedIbId.value, status: "pending" },
  });
};

// ─── Settlement Batches Table Handlers ───────────────────
const loadSettlements = (page = 1, force = false) => {
  const ibVal = settlementFilterIbId.value != null ? String(settlementFilterIbId.value).trim() : "";
  const keyVal = settlementFilterPeriodKey.value != null ? String(settlementFilterPeriodKey.value).trim() : "";

  const params = {
    ib_id: ibVal ? Number(ibVal) : undefined,
    period_type: settlementFilterPeriodType.value || undefined,
    period_key: keyVal || undefined,
    status: settlementFilterStatus.value || undefined,
    page,
    per_page: store.settlementPagination.per_page || 50,
  };

  store.fetchSettlements(params, force);
};

const handleFilterChange = () => {
  if (filterDebounceTimer.value) clearTimeout(filterDebounceTimer.value);
  filterDebounceTimer.value = setTimeout(() => {
    loadSettlements(1, true);
  }, 350);
};

const handleResetFilters = () => {
  settlementFilterIbId.value = "";
  settlementFilterPeriodType.value = "";
  settlementFilterPeriodKey.value = "";
  settlementFilterStatus.value = "";
  loadSettlements(1, true);
};

const handlePageChange = (newPage) => {
  loadSettlements(newPage, true);
};

const handlePerPageChange = (newPerPage) => {
  const perPageVal =
    typeof newPerPage === "object" && newPerPage !== null
      ? newPerPage.per_page || newPerPage.value || 50
      : newPerPage;
  store.settlementPagination.per_page = Number(perPageVal) || 50;
  loadSettlements(1, true);
};

const openBatchDetails = (batch) => {
  selectedBatchForDetails.value = batch;
  isBatchDetailsModalOpen.value = true;
};

// ─── Global Settlement Actions (Run Due / Dry Run All) ────
const handleDryRunAll = async () => {
  try {
    const res = await store.runSettlement({
      dry_run: true,
      force: false,
    });
    runResultData.value = res?.data || res;
    isRunResultDryRun.value = true;
    isRunResultModalOpen.value = true;
  } catch (err) {
    console.error("Dry run all error:", err);
  }
};

const handleRunAllDueClick = () => {
  isRunAllDueConfirmOpen.value = true;
};

const handleConfirmRunAllDue = async () => {
  isRunAllDueConfirmOpen.value = false;
  try {
    const res = await store.runSettlement({
      dry_run: false,
      force: false,
    });
    runResultData.value = res?.data || res;
    isRunResultDryRun.value = false;
    isRunResultModalOpen.value = true;
  } catch (err) {
    console.error("Run due all error:", err);
  }
};

// ─── Format Helpers ──────────────────────────────────────
const formatDate = (val) => {
  if (!val) return "-";
  const d = new Date(val);
  return isNaN(d.getTime())
    ? val
    : d.toLocaleString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const getMasterStateBadge = (state) => {
  switch (state) {
    case "all_auto_settlement":
      return { label: "All Auto Settlement", class: "bg-primary-green/10 text-primary-green border-primary-green/20" };
    case "all_require_approval":
      return { label: "All Require Approval", class: "bg-primary/10 text-primary border-primary/20" };
    case "mixed":
      return { label: "Mixed / Custom per IB", class: "bg-primary-blue/10 text-primary-blue border-primary-blue/20" };
    case "empty":
      return { label: "No IBs Configured", class: "bg-background text-secondary-text border-primary-border" };
    default:
      return { label: state || "Mixed", class: "bg-background text-secondary-text border-primary-border" };
  }
};

const getWalletTargetMasterBadge = (state) => {
  switch (state) {
    case "all_main":
      return { label: "All Main Wallet", class: "bg-primary-green/10 text-primary-green border-primary-green/20" };
    case "all_demo":
      return { label: "All Demo Wallet", class: "bg-primary-blue/10 text-primary-blue border-primary-blue/20" };
    case "mixed":
      return { label: "Mixed Destinations", class: "bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20" };
    case "empty":
      return { label: "No IBs", class: "bg-background text-secondary-text border-primary-border" };
    default:
      return { label: state || "Mixed", class: "bg-background text-secondary-text border-primary-border" };
  }
};
</script>

<template>
  <div class="space-y-6">
    <!-- ═════════════════════════════════════════════════════════════ -->
    <!-- SECTION 0: MASTER (ALL IBs) SETTINGS                        -->
    <!-- ═════════════════════════════════════════════════════════════ -->
    <div class="rounded-2xl bg-card-background border border-primary-border shadow-xs overflow-hidden">
      <!-- Section Header -->
      <div class="p-5 border-b border-primary-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background/50">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
            <HugeIcon :icon="Settings01Icon" :size="20" />
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="title-text text-base font-bold text-primary-text">
                Master Payout Settings (All IBs)
              </h2>
              <span
                v-if="store.masterPayoutSummary?.master_state"
                class="px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                :class="getMasterStateBadge(store.masterPayoutSummary.master_state).class"
              >
                {{ getMasterStateBadge(store.masterPayoutSummary.master_state).label }}
              </span>
            </div>
            <p class="sub-text text-secondary-text">
              Apply a universal default payout mode & settlement schedule across all active IB partners
            </p>
          </div>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-primary-border bg-card-background text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer self-start sm:self-auto"
          :disabled="store.settingsLoading"
          @click="store.fetchMasterPayoutSummary(true)"
        >
          <HugeIcon :icon="RefreshCwIcon" :size="14" :class="{ 'animate-spin': store.settingsLoading }" />
          <span>Refresh</span>
        </button>
      </div>

      <div class="p-6 space-y-6">
        <!-- Summary Stats Pills Grid -->
        <div v-if="store.masterPayoutSummary" class="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <div class="p-3.5 rounded-xl bg-background border border-primary-border">
            <span class="text-xs text-secondary-text block mb-1">Total IBs</span>
            <span class="text-lg font-bold text-primary-text font-mono">
              {{ store.masterPayoutSummary.total_ibs ?? 0 }}
            </span>
          </div>
          <div class="p-3.5 rounded-xl bg-primary-green/10 border border-primary-green/20">
            <span class="text-xs text-primary-green block mb-1">Auto Settlement</span>
            <span class="text-lg font-bold text-primary-green font-mono">
              {{ store.masterPayoutSummary.auto_settlement_count ?? 0 }}
            </span>
          </div>
          <div class="p-3.5 rounded-xl bg-primary/10 border border-primary/20">
            <span class="text-xs text-primary block mb-1">Require Approval</span>
            <span class="text-lg font-bold text-primary font-mono">
              {{ store.masterPayoutSummary.require_approval_count ?? 0 }}
            </span>
          </div>
          <div class="p-3.5 rounded-xl bg-background border border-primary-border">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs text-secondary-text">Wallet Target</span>
              <span
                v-if="store.masterPayoutSummary.wallet_target_master_state"
                class="px-1.5 py-0.2 rounded text-[10px] font-semibold border"
                :class="getWalletTargetMasterBadge(store.masterPayoutSummary.wallet_target_master_state).class"
              >
                {{ store.masterPayoutSummary.wallet_target_master_state }}
              </span>
            </div>
            <span class="text-xs font-semibold text-primary-text block font-mono">
              Main: {{ store.masterPayoutSummary.wallet_target_main_count ?? 0 }} &middot; Demo: {{ store.masterPayoutSummary.wallet_target_demo_count ?? 0 }}
            </span>
          </div>
          <div class="p-3.5 rounded-xl bg-background border border-primary-border">
            <span class="text-xs text-secondary-text block mb-1">Configured Status</span>
            <span class="text-xs font-semibold text-primary-text">
              {{ store.masterPayoutSummary.configured_count ?? 0 }} configured / {{ store.masterPayoutSummary.unconfigured_count ?? 0 }} defaults
            </span>
          </div>
        </div>

        <!-- Master Configuration Form Controls -->
        <div class="space-y-4 pt-2">
          <!-- Mode Selector Radios -->
          <div class="space-y-2">
            <label class="text-xs font-bold text-primary-text uppercase tracking-wider block">
              Universal Payout Mode
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                v-for="mode in MODES"
                :key="mode.value"
                class="flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer"
                :class="
                  masterForm.payout_mode === mode.value
                    ? 'border-primary bg-primary/5 shadow-2xs'
                    : 'border-primary-border bg-background hover:bg-background/80'
                "
              >
                <input
                  v-model="masterForm.payout_mode"
                  type="radio"
                  name="master_payout_mode"
                  :value="mode.value"
                  class="mt-0.5 text-primary focus:ring-primary h-4 w-4"
                />
                <div class="space-y-0.5">
                  <span class="text-sm font-semibold text-primary-text block">{{ mode.label }}</span>
                  <span class="text-xs text-secondary-text block">{{ mode.hint }}</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Universal Wallet Target Radios -->
          <div class="space-y-2">
            <label class="text-xs font-bold text-primary-text uppercase tracking-wider block">
              Universal Wallet Destination (Target)
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                v-for="target in WALLET_TARGETS"
                :key="target.value"
                class="flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer"
                :class="
                  masterForm.wallet_target === target.value
                    ? 'border-primary bg-primary/5 shadow-2xs'
                    : 'border-primary-border bg-background hover:bg-background/80'
                "
              >
                <input
                  v-model="masterForm.wallet_target"
                  type="radio"
                  name="master_wallet_target"
                  :value="target.value"
                  class="mt-0.5 text-primary focus:ring-primary h-4 w-4"
                />
                <div class="space-y-0.5">
                  <span class="text-sm font-semibold text-primary-text block">{{ target.label }}</span>
                  <span class="text-xs text-secondary-text block">{{ target.hint }}</span>
                </div>
              </label>
            </div>
          </div>

          <!-- If Auto Settlement Selected: Detailed Schedule Settings -->
          <div
            v-if="masterForm.payout_mode === 'auto_settlement'"
            class="p-4 rounded-xl bg-background border border-primary-border space-y-4 animate-in fade-in duration-200"
          >
            <h4 class="text-xs font-bold text-primary-text uppercase tracking-wider flex items-center gap-1.5">
              <HugeIcon :icon="Clock01Icon" :size="14" class="text-primary" />
              <span>Master Settlement Schedule</span>
            </h4>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Frequency -->
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-primary-text">Settlement Frequency</label>
                <BaseSelect
                  v-model="masterForm.settlement_frequency"
                  :options="FREQUENCIES"
                  placeholder="Select frequency..."
                  variant="surface"
                />
              </div>

              <!-- Settle Time (Server UTC Hour & Minute) -->
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-primary-text">Settle Time (Server UTC)</label>
                <div class="flex items-center gap-1.5">
                  <div class="flex-1">
                    <input
                      v-model.number="masterForm.settle_hour"
                      type="number"
                      min="0"
                      max="23"
                      placeholder="HH (0-23)"
                      class="input-field w-full px-2.5 py-2 text-xs font-mono text-center"
                    />
                  </div>
                  <span class="text-secondary-text font-bold">:</span>
                  <div class="flex-1">
                    <input
                      v-model.number="masterForm.settle_minute"
                      type="number"
                      min="0"
                      max="59"
                      placeholder="MM (0-59)"
                      class="input-field w-full px-2.5 py-2 text-xs font-mono text-center"
                    />
                  </div>
                </div>
              </div>

              <!-- Weekly Weekday (If Weekly) -->
              <div v-if="masterForm.settlement_frequency === 'weekly'" class="space-y-1.5">
                <label class="text-xs font-semibold text-primary-text">Weekly Settle Day</label>
                <BaseSelect
                  v-model="masterForm.weekly_weekday"
                  :options="WEEKDAYS"
                  placeholder="Select weekday..."
                  variant="surface"
                />
              </div>

              <!-- Monthly Day (If Monthly) -->
              <div v-if="masterForm.settlement_frequency === 'monthly'" class="space-y-1.5">
                <label class="text-xs font-semibold text-primary-text">Monthly Day of Month (1–28)</label>
                <input
                  v-model.number="masterForm.monthly_day"
                  type="number"
                  min="1"
                  max="28"
                  placeholder="Day (1-28)"
                  class="input-field w-full px-3 py-2 text-xs font-mono"
                />
              </div>

              <!-- Target Scope Checkbox -->
              <div class="space-y-1.5 flex flex-col justify-end">
                <label class="flex items-center gap-2 p-2 rounded-lg bg-card-background border border-primary-border cursor-pointer">
                  <input
                    v-model="masterForm.only_active_ibs"
                    type="checkbox"
                    class="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <span class="text-xs font-medium text-primary-text">Apply to active IBs only</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Master Apply Action Button -->
          <div v-if="canManageRates" class="flex items-center justify-between pt-2">
            <span class="text-xs text-secondary-text">
              Upserts this payout configuration to all matching IB records. Individual IB overrides can still be set below.
            </span>
            <button
              type="button"
              class="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="store.actionLoading"
              @click="handleApplyToAllClick"
            >
              <HugeIcon v-if="store.actionLoading" :icon="Loading03Icon" :size="15" class="animate-spin" />
              <HugeIcon v-else :icon="CheckmarkCircle02Icon" :size="15" />
              <span>Apply to All IBs</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═════════════════════════════════════════════════════════════ -->
    <!-- SECTION 1: PER-IB OVERRIDE PANEL                             -->
    <!-- ═════════════════════════════════════════════════════════════ -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left Column: IB Picker / Search -->
      <div class="lg:col-span-4 space-y-4">
        <div class="p-5 rounded-2xl bg-card-background border border-primary-border shadow-xs space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <HugeIcon :icon="UserIcon" :size="18" />
            </div>
            <div>
              <h3 class="title-text text-sm font-bold text-primary-text">Select IB Partner</h3>
              <p class="sub-text text-secondary-text text-xs">Search and pick an IB to configure per-IB settings</p>
            </div>
          </div>

          <!-- Search Input -->
          <div class="relative">
            <HugeIcon
              :icon="Search01Icon"
              :size="15"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none"
            />
            <input
              v-model="ibSearchQuery"
              type="text"
              placeholder="Search by IB name, email, or ID..."
              class="input-field w-full pl-9 pr-3 py-2 text-xs"
              @input="handleIbSearchInput"
            />
          </div>

          <!-- IB List -->
          <div class="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
            <div v-if="store.searchLoading" class="p-4 text-center text-xs text-secondary-text">
              <HugeIcon :icon="Loading03Icon" :size="16" class="animate-spin mx-auto mb-1 text-primary" />
              Searching IB partners...
            </div>

            <div
              v-else-if="!store.ibSearchOptions || store.ibSearchOptions.length === 0"
              class="p-6 text-center text-xs text-secondary-text rounded-xl bg-background border border-primary-border"
            >
              No IB partners found.
            </div>

            <button
              v-for="ib in store.ibSearchOptions"
              :key="ib.value"
              type="button"
              class="w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer"
              :class="
                selectedIbId === ib.value
                  ? 'bg-primary text-white border-primary shadow-xs font-semibold'
                  : 'bg-background hover:bg-card-background border-primary-border text-primary-text'
              "
              @click="selectIbFromSearch(ib)"
            >
              <div class="truncate mr-2">
                <span class="text-xs font-semibold block truncate" :class="selectedIbId === ib.value ? 'text-white' : 'text-primary-text'">
                  {{ ib.name || `IB #${ib.value}` }}
                </span>
                <span class="text-[11px] block truncate font-mono" :class="selectedIbId === ib.value ? 'text-white/80' : 'text-secondary-text'">
                  {{ ib.email ? ib.email : `ID: ${ib.value}` }}
                </span>
              </div>
              <span
                class="px-2 py-0.5 rounded text-[10px] font-mono shrink-0"
                :class="selectedIbId === ib.value ? 'bg-white/20 text-white' : 'bg-card-background border border-primary-border text-secondary-text'"
              >
                #{{ ib.value }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Right Column: Per-IB Override Form -->
      <div class="lg:col-span-8">
        <div class="p-6 rounded-2xl bg-card-background border border-primary-border shadow-xs space-y-5 min-h-[420px]">
          <!-- No IB Selected Placeholder -->
          <div
            v-if="!selectedIbId"
            class="flex flex-col items-center justify-center p-12 text-center h-full min-h-[340px] gap-3"
          >
            <div class="w-12 h-12 rounded-2xl bg-background border border-primary-border flex items-center justify-center text-secondary-text">
              <HugeIcon :icon="UserIcon" :size="22" />
            </div>
            <div class="space-y-1">
              <h4 class="text-sm font-semibold text-primary-text">No IB Selected</h4>
              <p class="text-xs text-secondary-text max-w-sm">
                Choose an IB partner from the left picker to inspect and configure individual payout settings and manual settlements.
              </p>
            </div>
          </div>

          <!-- IB Form Active State -->
          <template v-else>
            <!-- Form Header & Status Notice -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-primary-border">
              <div>
                <h3 class="title-text text-base font-bold text-primary-text flex items-center gap-2">
                  <span>IB #{{ selectedIbId }} Payout Override</span>
                  <span
                    v-if="store.currentIbPayoutSettings?.is_active === false"
                    class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary-red/10 text-primary-red border border-primary-red/20"
                  >
                    INACTIVE
                  </span>
                </h3>
                <p v-if="store.currentIbPayoutSettings?.exists === false" class="text-xs text-primary-yellow font-medium mt-0.5 flex items-center gap-1">
                  <HugeIcon :icon="Alert02Icon" :size="13" />
                  <span>Using default: Require approval (no custom record saved yet).</span>
                </p>
                <p v-else-if="store.currentIbPayoutSettings?.updated_at" class="text-xs text-secondary-text mt-0.5">
                  Last updated: {{ formatDate(store.currentIbPayoutSettings.updated_at) }}
                  <span v-if="store.currentIbPayoutSettings.updated_by" class="font-mono">
                    (Admin #{{ store.currentIbPayoutSettings.updated_by }})
                  </span>
                </p>
              </div>

              <!-- Quick Action: Go to Commissions Tab -->
              <button
                type="button"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-background border border-primary-border text-primary hover:text-primary-hover hover:border-primary/40 transition-colors cursor-pointer self-start sm:self-auto"
                @click="navigateToCommissionsForIb"
              >
                <span>View Pending Commissions</span>
                <HugeIcon :icon="ArrowRight01Icon" :size="14" />
              </button>
            </div>

            <!-- Mode Selector for This IB -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-primary-text uppercase tracking-wider block">
                Payout Mode for IB #{{ selectedIbId }}
              </label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  v-for="mode in MODES"
                  :key="mode.value"
                  class="flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer"
                  :class="
                    ibForm.payout_mode === mode.value
                      ? 'border-primary bg-primary/5 shadow-2xs'
                      : 'border-primary-border bg-background hover:bg-background/80'
                  "
                >
                  <input
                    v-model="ibForm.payout_mode"
                    type="radio"
                    name="ib_payout_mode"
                    :value="mode.value"
                    class="mt-0.5 text-primary focus:ring-primary h-4 w-4"
                  />
                  <div class="space-y-0.5">
                    <span class="text-sm font-semibold text-primary-text block">{{ mode.label }}</span>
                    <span class="text-xs text-secondary-text block">{{ mode.hint }}</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Wallet Destination for This IB -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-primary-text uppercase tracking-wider block">
                Wallet Destination (Target) for IB #{{ selectedIbId }}
              </label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  v-for="target in WALLET_TARGETS"
                  :key="target.value"
                  class="flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer"
                  :class="
                    ibForm.wallet_target === target.value
                      ? 'border-primary bg-primary/5 shadow-2xs'
                      : 'border-primary-border bg-background hover:bg-background/80'
                  "
                >
                  <input
                    v-model="ibForm.wallet_target"
                    type="radio"
                    name="ib_wallet_target"
                    :value="target.value"
                    class="mt-0.5 text-primary focus:ring-primary h-4 w-4"
                  />
                  <div class="space-y-0.5">
                    <span class="text-sm font-semibold text-primary-text block">{{ target.label }}</span>
                    <span class="text-xs text-secondary-text block">{{ target.hint }}</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Auto Settlement Configuration for This IB -->
            <div
              v-if="ibForm.payout_mode === 'auto_settlement'"
              class="p-4 rounded-xl bg-background border border-primary-border space-y-4 animate-in fade-in duration-200"
            >
              <h4 class="text-xs font-bold text-primary-text uppercase tracking-wider flex items-center gap-1.5">
                <HugeIcon :icon="Clock01Icon" :size="14" class="text-primary" />
                <span>Auto Settlement Schedule for IB #{{ selectedIbId }}</span>
              </h4>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- Frequency -->
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-primary-text">Frequency</label>
                  <BaseSelect
                    v-model="ibForm.settlement_frequency"
                    :options="FREQUENCIES"
                    placeholder="Select frequency..."
                    variant="surface"
                  />
                  <span v-if="ibFormErrors.settlement_frequency" class="text-[11px] text-primary-red block">
                    {{ ibFormErrors.settlement_frequency }}
                  </span>
                </div>

                <!-- Settle Time -->
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-primary-text">Settle Time (Server UTC)</label>
                  <div class="flex items-center gap-1.5">
                    <input
                      v-model.number="ibForm.settle_hour"
                      type="number"
                      min="0"
                      max="23"
                      placeholder="HH (0-23)"
                      class="input-field flex-1 px-2.5 py-2 text-xs font-mono text-center"
                      :class="{ 'border-primary-red': ibFormErrors.settle_hour }"
                    />
                    <span class="text-secondary-text font-bold">:</span>
                    <input
                      v-model.number="ibForm.settle_minute"
                      type="number"
                      min="0"
                      max="59"
                      placeholder="MM (0-59)"
                      class="input-field flex-1 px-2.5 py-2 text-xs font-mono text-center"
                      :class="{ 'border-primary-red': ibFormErrors.settle_minute }"
                    />
                  </div>
                  <span v-if="ibFormErrors.settle_hour || ibFormErrors.settle_minute" class="text-[11px] text-primary-red block">
                    {{ ibFormErrors.settle_hour || ibFormErrors.settle_minute }}
                  </span>
                </div>

                <!-- Weekly Weekday -->
                <div v-if="ibForm.settlement_frequency === 'weekly'" class="space-y-1.5">
                  <label class="text-xs font-semibold text-primary-text">Weekly Day</label>
                  <BaseSelect
                    v-model="ibForm.weekly_weekday"
                    :options="WEEKDAYS"
                    placeholder="Select weekday..."
                    variant="surface"
                  />
                  <span v-if="ibFormErrors.weekly_weekday" class="text-[11px] text-primary-red block">
                    {{ ibFormErrors.weekly_weekday }}
                  </span>
                </div>

                <!-- Monthly Day -->
                <div v-if="ibForm.settlement_frequency === 'monthly'" class="space-y-1.5">
                  <label class="text-xs font-semibold text-primary-text">Month Day (1–28)</label>
                  <input
                    v-model.number="ibForm.monthly_day"
                    type="number"
                    min="1"
                    max="28"
                    placeholder="Day (1-28)"
                    class="input-field w-full px-3 py-2 text-xs font-mono"
                    :class="{ 'border-primary-red': ibFormErrors.monthly_day }"
                  />
                  <span v-if="ibFormErrors.monthly_day" class="text-[11px] text-primary-red block">
                    {{ ibFormErrors.monthly_day }}
                  </span>
                </div>

                <!-- Active Toggle for This IB -->
                <div class="space-y-1.5 flex flex-col justify-end">
                  <label class="flex items-center gap-2 p-2 rounded-lg bg-card-background border border-primary-border cursor-pointer">
                    <input
                      v-model="ibForm.is_active"
                      type="checkbox"
                      class="rounded text-primary focus:ring-primary h-4 w-4"
                    />
                    <span class="text-xs font-medium text-primary-text">Active for auto scheduler</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Bottom Action Buttons for This IB -->
            <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-primary-border">
              <!-- Ops Triggers: Dry Run & Settle Now for Single IB -->
              <div v-if="canApprove" class="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-background border border-primary-border text-primary-blue hover:bg-primary-blue/10 hover:border-primary-blue/30 transition-colors cursor-pointer disabled:opacity-50"
                  :disabled="store.runSettlementLoading"
                  @click="handleDryRunSingleIb"
                >
                  <HugeIcon :icon="InformationCircleIcon" :size="14" />
                  <span>Dry Run (This IB)</span>
                </button>

                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-primary-green/10 text-primary-green border border-primary-green/30 hover:bg-primary-green hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                  :disabled="store.runSettlementLoading"
                  @click="handleSettleSingleIbClick"
                >
                  <HugeIcon :icon="PlayIcon" :size="14" />
                  <span>Settle Now (This IB)</span>
                </button>
              </div>
              <div v-else />

              <!-- Save IB Button -->
              <button
                v-if="canManageRates"
                type="button"
                class="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="store.actionLoading"
                @click="handleSaveIb"
              >
                <HugeIcon v-if="store.actionLoading" :icon="Loading03Icon" :size="14" class="animate-spin" />
                <HugeIcon v-else :icon="Tick02Icon" :size="14" />
                <span>Save This IB</span>
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- ═════════════════════════════════════════════════════════════ -->
    <!-- SECTION 2: SETTLEMENT BATCHES & HISTORY                     -->
    <!-- ═════════════════════════════════════════════════════════════ -->
    <div class="space-y-4">
      <DataTable
        :columns="columns"
        :data="store.settlementBatches"
        :loading="store.settlementLoading"
        :pagination="store.settlementPagination"
        row-key="id"
        table-key="ib-settlements-table"
        :per-page-options="[20, 50, 100, 200]"
        empty-title="No settlement batches found"
        empty-text="No settlement history matches the given filter criteria."
        @page-change="handlePageChange"
        @per-page-change="handlePerPageChange"
      >
        <!-- Toolbar Slot -->
        <template #toolbar>
          <div class="space-y-3">
            <!-- Top Row: Section Title & Global Ops Buttons -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 class="title-text text-base font-bold text-primary-text flex items-center gap-2">
                  <HugeIcon :icon="Invoice01Icon" :size="18" class="text-primary" />
                  <span>Settlement Batches & History</span>
                </h3>
                <p class="sub-text text-secondary-text">
                  Audit and track aggregated settlement payouts credited to IB wallets
                </p>
              </div>

              <!-- Ops Actions (Dry Run All & Settle Due) -->
              <div v-if="canApprove" class="flex items-center gap-2">
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-background border border-primary-border text-primary-blue hover:bg-primary-blue/10 hover:border-primary-blue/30 transition-colors cursor-pointer disabled:opacity-50"
                  :disabled="store.runSettlementLoading"
                  @click="handleDryRunAll"
                >
                  <HugeIcon :icon="InformationCircleIcon" :size="14" />
                  <span>Dry Run All Due</span>
                </button>

                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-primary-green text-white hover:bg-primary-green/90 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  :disabled="store.runSettlementLoading"
                  @click="handleRunAllDueClick"
                >
                  <HugeIcon v-if="store.runSettlementLoading" :icon="Loading03Icon" :size="14" class="animate-spin" />
                  <HugeIcon v-else :icon="PlayIcon" :size="14" />
                  <span>Run Due Settlements (All)</span>
                </button>
              </div>
            </div>

            <!-- Bottom Row: Filter Controls -->
            <div class="flex flex-wrap items-center gap-2.5 pt-1">
              <!-- IB ID Filter -->
              <div class="w-28 sm:w-32">
                <input
                  v-model="settlementFilterIbId"
                  type="number"
                  placeholder="IB ID"
                  class="input-field w-full px-2.5 py-1.5 text-xs font-mono"
                  @input="handleFilterChange"
                />
              </div>

              <!-- Period Type Filter -->
              <div class="w-36 sm:w-40">
                <BaseSelect
                  v-model="settlementFilterPeriodType"
                  :options="PERIOD_TYPE_OPTIONS"
                  placeholder="All Periods"
                  variant="surface"
                  @update:model-value="handleFilterChange"
                />
              </div>

              <!-- Period Key Filter -->
              <div class="w-36 sm:w-44">
                <input
                  v-model="settlementFilterPeriodKey"
                  type="text"
                  placeholder="Period Key (e.g. 2026-09)"
                  class="input-field w-full px-2.5 py-1.5 text-xs font-mono"
                  @input="handleFilterChange"
                />
              </div>

              <!-- Status Filter -->
              <div class="w-36 sm:w-40">
                <BaseSelect
                  v-model="settlementFilterStatus"
                  :options="STATUS_OPTIONS"
                  placeholder="All Statuses"
                  variant="surface"
                  @update:model-value="handleFilterChange"
                />
              </div>

              <!-- Reset & Refresh -->
              <div class="flex items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  class="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-background border border-primary-border text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                  title="Reset Filters"
                  @click="handleResetFilters"
                >
                  Reset
                </button>
                <button
                  type="button"
                  class="p-1.5 rounded-lg bg-background border border-primary-border text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                  title="Refresh Settlements"
                  :disabled="store.settlementLoading"
                  @click="loadSettlements(store.settlementPagination.page, true)"
                >
                  <HugeIcon :icon="RefreshCwIcon" :size="14" :class="{ 'animate-spin': store.settlementLoading }" />
                </button>
              </div>
            </div>
          </div>
        </template>

        <!-- Custom Cell: ID -->
        <template #cell-id="{ row }">
          <span class="font-mono font-bold text-xs text-primary-text">#{{ row.id }}</span>
        </template>

        <!-- Custom Cell: IB -->
        <template #cell-ib="{ row }">
          <div class="truncate">
            <span class="font-bold text-xs text-primary-text font-mono block">IB #{{ row.ib_id }}</span>
            <span v-if="row.ib_user_id" class="text-[11px] text-secondary-text font-mono">User #{{ row.ib_user_id }}</span>
          </div>
        </template>

        <!-- Custom Cell: Period -->
        <template #cell-period="{ row }">
          <div>
            <span class="font-mono font-semibold text-xs text-primary block">{{ row.period_key }}</span>
            <span class="text-[11px] text-secondary-text capitalize">{{ row.period_type }}</span>
          </div>
        </template>

        <!-- Custom Cell: Entries -->
        <template #cell-entries="{ row }">
          <span class="font-mono text-xs font-bold text-primary-text">{{ row.entry_count ?? 0 }}</span>
        </template>

        <!-- Custom Cell: Amount -->
        <template #cell-amount="{ row }">
          <div>
            <span class="font-mono font-bold text-xs text-primary-green">
              ${{ Number(row.total_amount || 0).toFixed(2) }}
            </span>
            <span class="text-[10px] text-secondary-text ml-1 font-mono">{{ row.account_currency || 'USD' }}</span>
          </div>
        </template>

        <!-- Custom Cell: Status -->
        <template #cell-status="{ row }">
          <span
            class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border inline-block"
            :class="
              row.status === 'paid'
                ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                : row.status === 'empty'
                ? 'bg-background text-secondary-text border-primary-border'
                : 'bg-primary-red/10 text-primary-red border-primary-red/20'
            "
          >
            {{ row.status?.toUpperCase() || 'UNKNOWN' }}
          </span>
        </template>

        <!-- Custom Cell: Wallet Tx -->
        <template #cell-wallet_tx="{ row }">
          <span v-if="row.wallet_transaction_id" class="font-mono text-xs font-semibold text-primary-blue">
            #{{ row.wallet_transaction_id }}
          </span>
          <span v-else class="text-xs text-secondary-text">-</span>
        </template>

        <!-- Custom Cell: Paid At -->
        <template #cell-paid_at="{ row }">
          <span class="text-xs font-mono text-secondary-text">{{ formatDate(row.paid_at || row.created_at) }}</span>
        </template>

        <!-- Custom Cell: Actions -->
        <template #cell-actions="{ row }">
          <button
            type="button"
            class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-background border border-primary-border text-secondary-text hover:text-primary-text hover:border-primary/40 transition-colors cursor-pointer"
            @click="openBatchDetails(row)"
          >
            <HugeIcon :icon="EyeIcon" :size="13" />
            <span>Details</span>
          </button>
        </template>
      </DataTable>
    </div>

    <!-- ═════════════════════════════════════════════════════════════ -->
    <!-- SECTION 3: HOW AUTO SETTLEMENT TIMING WORKS (HELP BANNER)   -->
    <!-- ═════════════════════════════════════════════════════════════ -->
    <div class="p-5 rounded-2xl bg-card-background border border-primary-border shadow-xs space-y-3">
      <div class="flex items-center gap-2.5 text-primary">
        <HugeIcon :icon="InformationCircleIcon" :size="18" />
        <h4 class="title-text text-sm font-bold text-primary-text">
          How Auto Settlement Timing Works
        </h4>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-secondary-text">
        <div class="p-3.5 rounded-xl bg-background border border-primary-border space-y-1.5">
          <span class="font-bold text-primary-text block">1. Five-Minute Engine Cron</span>
          <p>
            The background settlement scheduler executes every ~5 minutes, checking which active IBs have reached their specified UTC settle hour and minute window.
          </p>
        </div>
        <div class="p-3.5 rounded-xl bg-background border border-primary-border space-y-1.5">
          <span class="font-bold text-primary-text block">2. Completed Periods Only</span>
          <p>
            Settlement aggregates trades strictly from the <strong>previous completed</strong> period:
            <strong>Daily</strong> (yesterday <code class="text-primary-text">YYYY-MM-DD</code>),
            <strong>Weekly</strong> (last ISO week <code class="text-primary-text">YYYY-Www</code>), or
            <strong>Monthly</strong> (last calendar month <code class="text-primary-text">YYYY-MM</code>).
          </p>
        </div>
        <div class="p-3.5 rounded-xl bg-background border border-primary-border space-y-1.5">
          <span class="font-bold text-primary-text block">3. Single Wallet Credit & Idempotency</span>
          <p>
            Pending commissions for the period are summed and credited into the IB wallet in <strong>one single batch</strong>. Re-running the same completed period will never double-pay.
          </p>
        </div>
      </div>
    </div>

    <!-- ═════════════════════════════════════════════════════════════ -->
    <!-- CONFIRMATION & RESULT MODALS                                -->
    <!-- ═════════════════════════════════════════════════════════════ -->
    <!-- Apply to All Confirmation -->
    <ConfirmationDialog
      :open="isApplyAllConfirmOpen"
      title="Apply Payout Settings to All IBs?"
      :message="`This will override and upsert the '${masterForm.payout_mode === 'auto_settlement' ? 'Auto Settlement' : 'Require Approval'}' payout mode onto all active IB partners. Continue?`"
      confirm-text="Apply to All"
      type="warning"
      :loading="store.actionLoading"
      @confirm="handleConfirmApplyToAll"
      @cancel="isApplyAllConfirmOpen = false"
    />

    <!-- Settle Single IB Confirmation -->
    <ConfirmationDialog
      :open="isSettleIbConfirmOpen"
      :title="`Settle Now for IB #${selectedIbId}?`"
      message="This will immediately sum pending commissions for this IB's previous completed period, create a settlement batch, and credit the IB wallet."
      confirm-text="Execute Settlement"
      type="warning"
      :loading="store.runSettlementLoading"
      @confirm="handleConfirmSettleSingleIb"
      @cancel="isSettleIbConfirmOpen = false"
    />

    <!-- Run Due All Confirmation -->
    <ConfirmationDialog
      :open="isRunAllDueConfirmOpen"
      title="Run Due Settlements for All IBs?"
      message="This will process all IBs currently in their settlement window, sum their pending commissions for the previous period, and credit their respective wallets."
      confirm-text="Run Due Settlements"
      type="warning"
      :loading="store.runSettlementLoading"
      @confirm="handleConfirmRunAllDue"
      @cancel="isRunAllDueConfirmOpen = false"
    />

    <!-- Run / Dry-Run Result Preview Modal -->
    <SettlementRunResultModal
      v-model="isRunResultModalOpen"
      :result="runResultData"
      :is-dry-run="isRunResultDryRun"
    />

    <!-- Batch Metadata Details Modal -->
    <BatchDetailsModal
      v-model="isBatchDetailsModalOpen"
      :batch="selectedBatchForDetails"
    />
  </div>
</template>
