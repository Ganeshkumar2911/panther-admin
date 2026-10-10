<script setup>
import { ref, computed, onMounted } from "vue";
import {
  Calendar,
  CalendarDays,
  CalendarRange,
  Users,
  GitFork,
  UserSquare2,
  Tag,
  Wallet,
  Download,
  Settings2,
  SlidersHorizontal,
  RefreshCw,
  Search,
  Check,
  ChevronDown,
  Coins,
  Clock,
  Layers,
  FileSpreadsheet,
  AlertCircle,
  CandlestickChart,
  Receipt,
  X,
  FileDown,
} from "lucide-vue-next";
import { useCommissionEngineStore } from "@/stores/commissionEngine/commissionEngine";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import DataTable from "@/components/common/DataTable/DataTable.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
import BaseDatePicker from "@/components/common/BaseDatePicker.vue";
import StatusBadge from "@/components/common/StatusBadge.vue";
import ReportColumnsModal from "../components/reports/ReportColumnsModal.vue";

const store = useCommissionEngineStore();
const snackbar = useSnackbarStore();

// ─── Exact Report Types from ib_commission_reports_frontend.md ────────────────
const reportTypes = [
  {
    id: "daily_performance",
    label: "Daily Performance",
    icon: Calendar,
    iconColor: "text-emerald-500",
    frequency: "daily",
    type: "performance",
    description: "Daily breakdown of IB commissions, lots, entries and sub-IB splits",
  },
  {
    id: "weekly_performance",
    label: "Weekly Performance",
    icon: CalendarDays,
    iconColor: "text-blue-500",
    frequency: "weekly",
    type: "performance",
    description: "Weekly aggregated performance across the network",
  },
  {
    id: "monthly_performance",
    label: "Monthly Performance",
    icon: CalendarRange,
    iconColor: "text-orange-500",
    frequency: "monthly",
    type: "performance",
    description: "Monthly commission cycle and volume summary",
  },
  {
    id: "affiliate_performance",
    label: "Affiliate Performance",
    icon: Users,
    iconColor: "text-indigo-500",
    frequency: "monthly",
    type: "affiliates",
    description: "Ranked list of top performing IBs and partners",
  },
  {
    id: "sub_affiliate_performance",
    label: "Sub Affiliate Performance",
    icon: GitFork,
    iconColor: "text-amber-500",
    frequency: "daily",
    type: "sub-affiliates",
    description: "Direct downline children breakdown for selected parent IB",
  },
  {
    id: "customers",
    label: "Customers",
    icon: UserSquare2,
    iconColor: "text-cyan-500",
    frequency: "daily",
    type: "customers",
    description: "Client-wise trading volumes, commissions, and parent IB attribution",
  },
  {
    id: "symbols",
    label: "Symbol Performance",
    icon: Tag,
    iconColor: "text-yellow-500",
    frequency: "daily",
    type: "symbols",
    description: "Symbol and asset class volume and commission distribution",
  },
  {
    id: "payouts",
    label: "Payout / Wallet",
    icon: Wallet,
    iconColor: "text-emerald-500",
    frequency: "monthly",
    type: "payouts",
    description: "Approved commission payout totals and wallet settlement readiness",
  },
];

// Active State
const selectedReportId = ref("daily_performance");
const isTypeDropdownOpen = ref(false);
const isExportDropdownOpen = ref(false);
const showColumnsModal = ref(false);

// Active Filters (Date Range is required to run report)
const dateFrom = ref("");
const dateTo = ref("");
const statusFilter = ref("all");
const walletTargetFilter = ref("all");
const filterIbId = ref(null);
const filterParentIbId = ref(null);
const tableSearch = ref("");

// Status Options
const statusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

// Wallet Target Options
const walletTargetOptions = [
  { label: "All Wallets", value: "all" },
  { label: "Main Wallet", value: "main" },
  { label: "Demo Wallet", value: "demo" },
];

// Active Report Object
const activeReportType = computed(() => {
  return reportTypes.find((r) => r.id === selectedReportId.value) || reportTypes[0];
});

// Active Period / Date Label
const activePeriodLabel = computed(() => {
  if (dateFrom.value && dateTo.value) {
    return `${dateFrom.value} to ${dateTo.value}`;
  }
  return `${activeReportType.value.label} (${activeReportType.value.frequency || "daily"})`;
});

// Date Range model wrapper for BaseDatePicker
const dateRangeValue = computed({
  get() {
    if (dateFrom.value || dateTo.value) {
      return {
        start: dateFrom.value || null,
        end: dateTo.value || null,
      };
    }
    return null;
  },
  set(val) {
    if (!val) {
      dateFrom.value = "";
      dateTo.value = "";
    } else if (Array.isArray(val)) {
      dateFrom.value = val[0] || "";
      dateTo.value = val[1] || "";
    } else if (typeof val === "object") {
      dateFrom.value = val.start || val.from || "";
      dateTo.value = val.end || val.to || "";
    }
  },
});

// ─── Dynamic Column Configuration per Report Type ─────────────────────────────
const columnDefinitions = ref({
  performance: [
    { key: "period_or_ib", label: "Date / Period", visible: true, default: true, width: "230px" },
    { key: "entry_count_all", label: "Total Deals", visible: true, default: true, sortable: true, width: "120px" },
    { key: "entry_count", label: "Direct Entries", visible: true, default: true, sortable: true, width: "120px" },
    { key: "entry_count_from_subibs", label: "From Sub-IBs", visible: true, default: true, sortable: true, width: "120px" },
    { key: "performance_commission", label: "Performance $", visible: true, default: true, sortable: true, align: "right", width: "140px" },
    { key: "commission_from_subibs", label: "From Sub-IBs $", visible: true, default: true, sortable: true, align: "right", width: "140px" },
    { key: "total_commission", label: "Grand Total $", visible: true, default: true, sortable: true, align: "right", width: "150px" },
    { key: "total_lots", label: "Lots Traded", visible: true, default: true, sortable: true, align: "right", width: "130px" },
    { key: "by_status", label: "Status Breakdown", visible: true, default: true, width: "240px" },
  ],
  affiliates: [
    { key: "ib", label: "IB Partner", visible: true, default: true, width: "240px" },
    { key: "entry_count_all", label: "Total Deals", visible: true, default: true, sortable: true, width: "120px" },
    { key: "entry_count", label: "Direct Entries", visible: true, default: true, sortable: true, width: "120px" },
    { key: "entry_count_from_subibs", label: "From Sub-IBs", visible: true, default: true, sortable: true, width: "120px" },
    { key: "performance_commission", label: "Performance $", visible: true, default: true, sortable: true, align: "right", width: "140px" },
    { key: "commission_from_subibs", label: "From Sub-IBs $", visible: true, default: true, sortable: true, align: "right", width: "140px" },
    { key: "total_commission", label: "Grand Total $", visible: true, default: true, sortable: true, align: "right", width: "150px" },
    { key: "total_lots", label: "Lots Traded", visible: true, default: true, sortable: true, align: "right", width: "130px" },
    { key: "by_status", label: "Status Breakdown", visible: true, default: true, width: "240px" },
  ],
  "sub-affiliates": [
    { key: "child_ib", label: "Sub-Affiliate (Child IB)", visible: true, default: true, width: "240px" },
    { key: "entry_count_all", label: "Total Deals", visible: true, default: true, sortable: true, width: "120px" },
    { key: "entry_count", label: "Direct Entries", visible: true, default: true, sortable: true, width: "120px" },
    { key: "entry_count_from_subibs", label: "From Sub-IBs", visible: true, default: true, sortable: true, width: "120px" },
    { key: "performance_commission", label: "Performance $", visible: true, default: true, sortable: true, align: "right", width: "140px" },
    { key: "commission_from_subibs", label: "Sub-IB Override $", visible: true, default: true, sortable: true, align: "right", width: "140px" },
    { key: "total_commission", label: "Total Commission", visible: true, default: true, sortable: true, align: "right", width: "150px" },
    { key: "total_lots", label: "Volume (Lots)", visible: true, default: true, sortable: true, align: "right", width: "130px" },
    { key: "by_status", label: "Status Breakdown", visible: true, default: true, width: "240px" },
  ],
  customers: [
    { key: "customer", label: "Client Account", visible: true, default: true, width: "240px" },
    { key: "logins", label: "MT5 Logins", visible: true, default: true, width: "150px" },
    { key: "entry_count", label: "Trades Count", visible: true, default: true, sortable: true, width: "120px" },
    { key: "total_lots", label: "Lots Traded", visible: true, default: true, sortable: true, align: "right", width: "130px" },
    { key: "total_commission", label: "Commission Generated", visible: true, default: true, sortable: true, align: "right", width: "170px" },
    { key: "attribution", label: "Parent IB Attribution", visible: true, default: true, width: "190px" },
  ],
  symbols: [
    { key: "symbol", label: "Trading Symbol", visible: true, default: true, width: "180px" },
    { key: "entry_count", label: "Entry Count", visible: true, default: true, sortable: true, width: "140px" },
    { key: "total_lots", label: "Total Lots", visible: true, default: true, sortable: true, align: "right", width: "140px" },
    { key: "total_commission", label: "Total Commission", visible: true, default: true, sortable: true, align: "right", width: "170px" },
  ],
  payouts: [
    { key: "ib", label: "IB Partner", visible: true, default: true, width: "240px" },
    { key: "total_commission", label: "Approved Payout ($)", visible: true, default: true, sortable: true, align: "right", width: "160px" },
    { key: "total_lots", label: "Volume (Lots)", visible: true, default: true, sortable: true, align: "right", width: "140px" },
    { key: "entry_count", label: "Entries Count", visible: true, default: true, sortable: true, width: "130px" },
    { key: "wallet_target", label: "Wallet Target", visible: true, default: true, width: "140px" },
    { key: "status_badge", label: "Payout Status", visible: true, default: true, align: "center", width: "140px" },
  ],
});

// Current Column Definitions
const currentColumnList = computed(() => {
  const type = activeReportType.value.type;
  if (columnDefinitions.value[type]) {
    return columnDefinitions.value[type];
  }
  return columnDefinitions.value.performance;
});

const visibleColumns = computed(() => {
  return currentColumnList.value.filter((c) => c.visible);
});

// ─── Query Params Builder ──────────────────────────────────────────────────────
const currentQueryParams = computed(() => {
  const params = {};
  const rep = activeReportType.value;

  // Always send frequency derived from selected report type (daily, weekly, monthly)
  params.frequency = rep.frequency || "daily";

  // Date Range (Required)
  if (dateFrom.value && dateTo.value) {
    params.date_from = dateFrom.value;
    params.date_to = dateTo.value;
  }

  // Status Filter: only pass if not 'all'
  if (statusFilter.value && statusFilter.value !== "all") {
    params.status = statusFilter.value;
  }

  // Wallet Target: only pass if not 'all'
  if (walletTargetFilter.value && walletTargetFilter.value !== "all") {
    params.wallet_target = walletTargetFilter.value;
  }

  // Admin Sub-Affiliate Parent (parent_ib_id) for Sub-Affiliate report
  if (rep.type === "sub-affiliates") {
    if (filterParentIbId.value) {
      params.parent_ib_id = filterParentIbId.value;
    } else if (filterIbId.value) {
      params.parent_ib_id = filterIbId.value;
    }
  } else {
    // Admin Affiliate (ib_id) for all other reports (performance, affiliates, customers, symbols, payouts)
    if (filterIbId.value) {
      params.ib_id = filterIbId.value;
    }
  }

  params.page = store.reportsPagination?.page || 1;
  params.per_page = store.reportsPagination?.per_page || 50;

  return params;
});

// ─── Data Loading (Triggered only on Run Report button or Pagination) ──────────
const loadReport = async (page = 1) => {
  if (!dateFrom.value || !dateTo.value) {
    snackbar.show("Please select a Date Range before running the report.", "warning");
    return;
  }

  if (activeReportType.value.type === "sub-affiliates" && !filterParentIbId.value && !filterIbId.value) {
    snackbar.show("Please select a Parent Affiliate (parent_ib_id) for Sub-Affiliate report.", "warning");
    return;
  }

  if (page) {
    store.reportsPagination.page = page;
  }
  try {
    await store.fetchReportData(activeReportType.value.type, currentQueryParams.value);
  } catch (err) {
    // Handled in store
  }
};

const handlePageChange = (newPage) => {
  const pageVal = typeof newPage === "object" && newPage !== null ? newPage.page || 1 : newPage;
  loadReport(Number(pageVal) || 1);
};

const handlePerPageChange = (newPerPage) => {
  const perPageVal = typeof newPerPage === "object" && newPerPage !== null ? newPerPage.per_page || 50 : newPerPage;
  store.reportsPagination.per_page = Number(perPageVal) || 50;
  loadReport(1);
};

// Report Type selection: changes report type without immediately calling API
const handleSelectReportType = (report) => {
  selectedReportId.value = report.id;
  isTypeDropdownOpen.value = false;
  store.reportsPagination.page = 1;
};

// Search IB Remote (/admin/search/ib)
let ibSearchTimer = null;
const onIbSearch = (query = "") => {
  clearTimeout(ibSearchTimer);
  ibSearchTimer = setTimeout(() => {
    store.searchIbs(query);
  }, 300);
};

// ─── Format Date Helpers ───────────────────────────────────────────────────────
const formatDateLabel = (val) => {
  if (!val) return "";
  const str = String(val).trim();

  // Weekly format: YYYY-Www (e.g. 2026-W38)
  if (str.includes("-W")) {
    const parts = str.split("-W");
    return `Week ${parts[1]}, ${parts[0]}`;
  }

  // Monthly format: YYYY-MM (e.g. 2026-06)
  if (/^\d{4}-\d{2}$/.test(str)) {
    const [year, month] = str.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
  }

  // Daily format: YYYY-MM-DD (e.g. 2026-06-03)
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const [year, month, day] = str.slice(0, 10).split("-");
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }

  return str;
};

// ─── Robust Row Title & Subtitle Helpers ───────────────────────────────────────
const getIbDisplayId = (row) => {
  if (!row) return "";
  const id =
    row.ib_id ??
    row.ib_user_id ??
    row.user_id ??
    row.partner_id ??
    row.affiliate_id ??
    row.id ??
    (row.ib && typeof row.ib === "object" ? row.ib.id : null);

  if (id !== undefined && id !== null && id !== "" && id !== "undefined") {
    return String(id);
  }
  return "";
};

const getRowTitle = (row, reportType) => {
  if (!row) return "-";

  // For performance timeline reports (Daily, Weekly, Monthly performance)
  if (reportType?.type === "performance") {
    if (row.label || row.period_key || row.start) {
      return formatDateLabel(row.label || row.period_key || row.start);
    }
  }

  // For IB Partner rows (Affiliates, Payouts, Sub-Affiliates)
  if (row.ib_name) return row.ib_name;
  if (row.name) return row.name;
  if (row.partner_name) return row.partner_name;
  if (row.affiliate_name) return row.affiliate_name;
  if (row.username) return row.username;
  if (row.ib && typeof row.ib === "object" && row.ib.name) return row.ib.name;
  if (typeof row.ib === "string" && row.ib) return row.ib;

  // Fallback to date label if present
  if (row.label || row.period_key) {
    return formatDateLabel(row.label || row.period_key);
  }

  const id = getIbDisplayId(row);
  if (id) return `Partner #${id}`;
  return "Record";
};

const getRowSubtitle = (row, reportType) => {
  if (!row) return "";

  // For performance timeline reports
  if (reportType?.type === "performance") {
    const rawKey = row.period_key || row.label || (row.start ? row.start.slice(0, 10) : "");
    const freq = (row.period_type || reportType?.frequency || "daily").toUpperCase();
    if (rawKey) {
      return `${rawKey} • ${freq}`;
    }
  }

  if (row.ib_email) return row.ib_email;
  if (row.email) return row.email;
  if (row.partner_email) return row.partner_email;
  if (row.affiliate_email) return row.affiliate_email;
  if (row.ib && typeof row.ib === "object" && row.ib.email) return row.ib.email;

  const id = getIbDisplayId(row);
  if (id) return `ID: ${id}`;

  if (row.period_key || row.label) {
    return String(row.period_key || row.label);
  }
  return "";
};

// ─── Filtered Table Items ─────────────────────────────────────────────────────
const filteredTableItems = computed(() => {
  let list = [...(store.reportsList || [])];

  if (tableSearch.value.trim()) {
    const q = tableSearch.value.toLowerCase().trim();
    list = list.filter((item) => {
      const title = String(getRowTitle(item, activeReportType.value)).toLowerCase();
      const sub = String(getRowSubtitle(item, activeReportType.value)).toLowerCase();
      const symbol = String(item.symbol || "").toLowerCase();
      const label = String(item.label || item.period_key || "").toLowerCase();
      return title.includes(q) || sub.includes(q) || symbol.includes(q) || label.includes(q);
    });
  }

  return list;
});

// Table Footer Totals
const tableTotals = computed(() => {
  const items = filteredTableItems.value;
  return {
    count: items.length,
    total_commission: items.reduce((sum, item) => sum + Number(item.total_commission || item.commission || 0), 0),
    total_lots: items.reduce((sum, item) => sum + Number(item.total_lots || item.lots || 0), 0),
    entry_count: items.reduce((sum, item) => sum + Number(item.entry_count || item.entries || 0), 0),
    entry_count_all: items.reduce(
      (sum, item) =>
        sum +
        Number(
          item.entry_count_all ??
            (Number(item.entry_count || 0) + Number(item.entry_count_from_subibs || 0))
        ),
      0
    ),
    entry_count_from_subibs: items.reduce((sum, item) => sum + Number(item.entry_count_from_subibs || 0), 0),
    performance_commission: items.reduce((sum, item) => sum + Number(item.performance_commission || 0), 0),
    commission_from_subibs: items.reduce((sum, item) => sum + Number(item.commission_from_subibs || 0), 0),
  };
});

// ─── Column Toggle & Reordering ────────────────────────────────────────────────
const toggleColumn = (key) => {
  const col = currentColumnList.value.find((c) => c.key === key);
  if (col) col.visible = !col.visible;
};

const selectAllColumns = (val) => {
  currentColumnList.value.forEach((c) => (c.visible = val));
};

const resetColumns = () => {
  currentColumnList.value.forEach((c) => (c.visible = c.default));
};

// ─── Export Actions (API Backend /admin/ib-commission/reports/export) ────────
const getExportColumns = () => {
  const currentList = currentColumnList.value;
  const visible = currentList.filter((c) => c.visible);

  // If all columns are visible, omit to include all fields
  if (visible.length === currentList.length) {
    return undefined;
  }

  // Map UI column keys to API-accepted export column keys
  const mapped = [];
  for (const c of visible) {
    if (c.key === "ib" || c.key === "child_ib") {
      mapped.push("ib_id", "ib_name", "ib_email");
    } else if (c.key === "customer") {
      mapped.push("user_id", "name", "email");
    } else if (c.key === "period_or_ib") {
      mapped.push("period_key", "label", "start", "end");
    } else if (c.key === "by_status") {
      mapped.push("status_split");
    } else {
      mapped.push(c.key);
    }
  }
  return [...new Set(mapped)].join(",");
};

const handleExport = async (format = "csv", orientation = "landscape") => {
  isExportDropdownOpen.value = false;

  if (!dateFrom.value || !dateTo.value) {
    snackbar.show("Please select a Date Range before exporting.", "warning");
    return;
  }

  const rep = activeReportType.value;
  if (rep.type === "sub-affiliates" && !filterParentIbId.value && !filterIbId.value) {
    snackbar.show("Please select a Parent Affiliate (parent_ib_id) before exporting sub-affiliates.", "warning");
    return;
  }

  const exportPayload = {
    report: rep.type,
    format,
    orientation: format === "pdf" ? orientation : undefined,
    columns: getExportColumns(),
    frequency: rep.frequency || "daily",
    date_from: dateFrom.value,
    date_to: dateTo.value,
    status: statusFilter.value !== "all" ? statusFilter.value : undefined,
    wallet_target: walletTargetFilter.value !== "all" ? walletTargetFilter.value : undefined,
    ib_id: rep.type !== "sub-affiliates" && filterIbId.value ? filterIbId.value : undefined,
    parent_ib_id: rep.type === "sub-affiliates" ? (filterParentIbId.value || filterIbId.value) : undefined,
  };

  try {
    await store.exportReportFile(exportPayload);
  } catch (err) {
    // Handled in store with snackbar
  }
};

const copyTableToClipboard = () => {
  isExportDropdownOpen.value = false;
  const items = filteredTableItems.value;
  navigator.clipboard.writeText(JSON.stringify(items, null, 2));
  snackbar.show("Table data copied to clipboard", "success");
};

// ─── Format Helpers ────────────────────────────────────────────────────────────
const formatUSD = (num) => {
  const val = Number(num || 0);
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatLots = (num) => {
  const val = Number(num || 0);
  return val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Reset Filters
const resetFilters = () => {
  statusFilter.value = "all";
  walletTargetFilter.value = "all";
  filterIbId.value = null;
  filterParentIbId.value = null;
  dateFrom.value = "";
  dateTo.value = "";
  tableSearch.value = "";
};

// Computed Active Filter Labels
const activeIbLabel = computed(() => {
  if (!filterIbId.value) return "";
  const found = (store.ibSearchOptions || []).find((o) => o.value === filterIbId.value);
  return found?.name || `IB #${filterIbId.value}`;
});

const activeParentIbLabel = computed(() => {
  const pId = filterParentIbId.value || (activeReportType.value.type === "sub-affiliates" ? filterIbId.value : null);
  if (!pId) return "";
  const found = (store.ibSearchOptions || []).find((o) => o.value === pId);
  return found?.name || `Parent IB #${pId}`;
});

const hasActiveFilters = computed(() => {
  return (
    (filterIbId.value && activeReportType.value.type !== "sub-affiliates") ||
    (activeReportType.value.type === "sub-affiliates" && (filterParentIbId.value || filterIbId.value)) ||
    statusFilter.value !== "all" ||
    walletTargetFilter.value !== "all" ||
    Boolean(dateFrom.value && dateTo.value)
  );
});

onMounted(async () => {
  await store.fetchReportsCatalog();
  store.searchIbs(""); // Pre-populate initial IBs via /admin/search/ib
});
</script>

<template>
  <div class="space-y-5">
    <!-- ================================================================= -->
    <!-- TOP TOOLBAR & CONTROLS                                            -->
    <!-- ================================================================= -->
    <div
      class="flex flex-wrap items-center justify-between gap-3 bg-card-background border border-primary-border rounded-2xl p-3"
    >
      <!-- LEFT: Report Type Dropdown -->
      <div class="flex items-center gap-2">
        <div class="relative">
          <button
            type="button"
            class="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-background hover:bg-card-background text-primary-text border border-primary-border hover:border-primary/40 transition-all font-semibold text-xs cursor-pointer"
            @click="isTypeDropdownOpen = !isTypeDropdownOpen"
          >
            <component
              :is="activeReportType.icon"
              :size="16"
              :class="activeReportType.iconColor || 'text-primary'"
            />
            <span class="text-sm font-semibold tracking-tight">{{ activeReportType.label }}</span>
            <ChevronDown
              :size="14"
              class="text-secondary-text transition-transform duration-200"
              :class="isTypeDropdownOpen ? 'rotate-180' : ''"
            />
          </button>

          <!-- Dropdown Menu -->
          <Teleport to="body">
            <div
              v-if="isTypeDropdownOpen"
              class="fixed inset-0 z-40"
              @click="isTypeDropdownOpen = false"
            />
          </Teleport>

          <Transition name="fade">
            <div
              v-if="isTypeDropdownOpen"
              class="absolute left-0 top-full mt-1.5 w-72 bg-card-background border border-primary-border rounded-2xl py-2 z-50 max-h-[440px] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-150"
            >
              <div class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-secondary-text">
                Commission Reports
              </div>

              <button
                v-for="rep in reportTypes"
                :key="rep.id"
                type="button"
                class="w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-colors hover:bg-background cursor-pointer"
                :class="
                  selectedReportId === rep.id
                    ? 'bg-primary/5 text-primary font-semibold'
                    : 'text-primary-text'
                "
                @click="handleSelectReportType(rep)"
              >
                <div class="flex items-center gap-2.5">
                  <component
                    :is="rep.icon"
                    :size="16"
                    :class="rep.iconColor || 'text-secondary-text'"
                  />
                  <span>{{ rep.label }}</span>
                </div>
                <Check
                  v-if="selectedReportId === rep.id"
                  :size="15"
                  class="text-primary font-bold"
                />
              </button>
            </div>
          </Transition>
        </div>
      </div>

      <!-- RIGHT: Export, Columns, Date Range (Required), Run Report -->
      <div class="flex items-center gap-2 flex-wrap">
        <!-- 1. Export Button & Dropdown -->
        <div class="relative">
          <button
            type="button"
            :disabled="store.reportsExportLoading"
            class="btn-secondary text-xs gap-1.5 py-2 px-3 rounded-xl cursor-pointer"
            @click="isExportDropdownOpen = !isExportDropdownOpen"
          >
            <Download
              :size="14"
              :class="store.reportsExportLoading ? 'animate-spin' : ''"
            />
            <span>{{ store.reportsExportLoading ? `Exporting (${store.reportsExportFormat?.toUpperCase()})...` : "Export" }}</span>
            <ChevronDown :size="12" class="text-secondary-text" />
          </button>

          <Teleport to="body">
            <div
              v-if="isExportDropdownOpen"
              class="fixed inset-0 z-40"
              @click="isExportDropdownOpen = false"
            />
          </Teleport>

          <Transition name="fade">
            <div
              v-if="isExportDropdownOpen"
              class="absolute right-0 top-full mt-1.5 w-60 bg-card-background border border-primary-border rounded-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs"
            >
              <div class="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary-text">
                File Formats (Server Export)
              </div>

              <!-- CSV Export -->
              <button
                type="button"
                class="w-full flex items-center justify-between px-3.5 py-2 text-left hover:bg-background cursor-pointer text-primary-text font-medium transition-colors"
                @click="handleExport('csv')"
              >
                <div class="flex items-center gap-2">
                  <FileSpreadsheet :size="14" class="text-primary-green" />
                  <span>Export as CSV (.csv)</span>
                </div>
                <span class="text-[10px] text-secondary-text font-mono">UTF-8 BOM</span>
              </button>

              <!-- Excel Export -->
              <button
                type="button"
                class="w-full flex items-center justify-between px-3.5 py-2 text-left hover:bg-background cursor-pointer text-primary-text font-medium transition-colors"
                @click="handleExport('xlsx')"
              >
                <div class="flex items-center gap-2">
                  <FileSpreadsheet :size="14" class="text-primary-blue" />
                  <span>Export as Excel (.xlsx)</span>
                </div>
                <span class="text-[10px] text-secondary-text font-mono">OOXML</span>
              </button>

              <!-- PDF Landscape Export -->
              <button
                type="button"
                class="w-full flex items-center justify-between px-3.5 py-2 text-left hover:bg-background cursor-pointer text-primary-text font-medium transition-colors"
                @click="handleExport('pdf', 'landscape')"
              >
                <div class="flex items-center gap-2">
                  <FileDown :size="14" class="text-red-500" />
                  <span>Export PDF (Landscape)</span>
                </div>
                <span class="text-[10px] text-secondary-text font-mono">Wide</span>
              </button>

              <!-- PDF Portrait Export -->
              <button
                type="button"
                class="w-full flex items-center justify-between px-3.5 py-2 text-left hover:bg-background cursor-pointer text-primary-text font-medium transition-colors"
                @click="handleExport('pdf', 'portrait')"
              >
                <div class="flex items-center gap-2">
                  <FileDown :size="14" class="text-orange-500" />
                  <span>Export PDF (Portrait)</span>
                </div>
                <span class="text-[10px] text-secondary-text font-mono">Print</span>
              </button>

              <div class="my-1 border-t border-primary-border" />

              <div class="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary-text">
                Quick Dev Tools
              </div>

              <button
                type="button"
                class="w-full flex items-center gap-2 px-3.5 py-2 text-left hover:bg-background cursor-pointer text-primary-text font-medium transition-colors"
                @click="copyTableToClipboard"
              >
                <Receipt :size="14" class="text-secondary-text" />
                <span>Copy Table Data (JSON)</span>
              </button>
            </div>
          </Transition>
        </div>

        <!-- 2. Columns Visibility Button -->
        <button
          type="button"
          class="btn-secondary text-xs gap-1.5 py-2 px-3 rounded-xl whitespace-nowrap"
          @click="showColumnsModal = true"
        >
          <Settings2 :size="14" />
          <span>Columns: {{ visibleColumns.length }} out of {{ currentColumnList.length }}</span>
        </button>

        <!-- 3. Date Range Picker (Required) -->
        <div class="w-56 sm:w-64">
          <BaseDatePicker
            v-model="dateRangeValue"
            range
            placeholder="Select date range (Required) *"
            customClass="h-9 text-xs rounded-xl font-medium"
          />
        </div>

        <!-- 4. Run Report Button -->
        <button
          type="button"
          :disabled="store.reportsLoading"
          class="btn-primary py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          @click="loadReport(1)"
        >
          <RefreshCw
            :size="13"
            :class="store.reportsLoading ? 'animate-spin' : ''"
          />
          <span>{{ store.reportsLoading ? "Running..." : "Run Report" }}</span>
        </button>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- SHARED FILTER PARAMETERS BAR                                      -->
    <!-- ================================================================= -->
    <div
      class="bg-card-background border border-primary-border rounded-2xl p-4 space-y-3"
    >
      <div class="flex items-center justify-between">
        <h4 class="text-xs font-semibold text-primary-text flex items-center gap-1.5 uppercase tracking-wider">
          <SlidersHorizontal :size="13" />
          <span>Shared Filter Parameters ({{ (activeReportType.frequency || 'daily').toUpperCase() }} BREAKDOWN)</span>
        </h4>
        <button
          type="button"
          class="text-xs text-primary hover:underline font-semibold cursor-pointer"
          @click="resetFilters"
        >
          Reset All Filters
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <!-- Status Filter -->
        <div>
          <label class="text-[11px] font-semibold text-secondary-text block mb-1">Status</label>
          <BaseSelect
            v-model="statusFilter"
            :options="statusOptions"
            placeholder="All Statuses"
            customClass="h-9 text-xs rounded-xl font-medium"
          />
        </div>

        <!-- Wallet Target Filter -->
        <div>
          <label class="text-[11px] font-semibold text-secondary-text block mb-1">Wallet Target</label>
          <BaseSelect
            v-model="walletTargetFilter"
            :options="walletTargetOptions"
            placeholder="All Wallets"
            customClass="h-9 text-xs rounded-xl font-medium"
          />
        </div>

        <!-- Network Root IB Filter (Admin Affiliate - ib_id) -->
        <div v-if="activeReportType.type !== 'sub-affiliates'">
          <label class="text-[11px] font-semibold text-secondary-text block mb-1">Admin Affiliate (ib_id)</label>
          <BaseSelect
            v-model="filterIbId"
            :options="store.ibSearchOptions"
            :is-loading="store.searchLoading"
            placeholder="Search Affiliate (ib_id)..."
            searchable
            clearable
            customClass="h-9 text-xs rounded-xl font-medium"
            @search="onIbSearch"
          />
        </div>

        <!-- Parent IB (Admin Sub-Affiliate - parent_ib_id) -->
        <div v-if="activeReportType.type === 'sub-affiliates'">
          <label class="text-[11px] font-semibold text-secondary-text block mb-1">Admin Sub-affiliate (parent_ib_id) *</label>
          <BaseSelect
            v-model="filterParentIbId"
            :options="store.ibSearchOptions"
            :is-loading="store.searchLoading"
            placeholder="Search Parent IB (parent_ib_id)..."
            searchable
            clearable
            customClass="h-9 text-xs rounded-xl font-medium"
            @search="onIbSearch"
          />
        </div>
      </div>
    </div>

    <!-- Active Filter Chips Bar -->
    <div
      v-if="hasActiveFilters"
      class="flex items-center gap-2 flex-wrap text-xs px-1"
    >
      <span class="text-[11px] font-semibold text-secondary-text uppercase tracking-wider">Active Filters:</span>
      <span
        v-if="dateFrom && dateTo"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 font-medium"
      >
        <span>Date Range: {{ dateFrom }} to {{ dateTo }}</span>
        <button type="button" class="hover:text-red-500 cursor-pointer" @click="dateFrom = ''; dateTo = ''">
          <X :size="12" />
        </button>
      </span>
      <span
        v-if="filterIbId && activeReportType.type !== 'sub-affiliates'"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 font-medium"
      >
        <span>Affiliate: {{ activeIbLabel }} (ib_id: {{ filterIbId }})</span>
        <button type="button" class="hover:text-red-500 cursor-pointer" @click="filterIbId = null">
          <X :size="12" />
        </button>
      </span>
      <span
        v-if="(filterParentIbId || (activeReportType.type === 'sub-affiliates' && filterIbId))"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium"
      >
        <span>Parent IB: {{ activeParentIbLabel }} (parent_ib_id: {{ filterParentIbId || filterIbId }})</span>
        <button type="button" class="hover:text-red-500 cursor-pointer" @click="filterParentIbId = null; filterIbId = null">
          <X :size="12" />
        </button>
      </span>
      <span
        v-if="statusFilter !== 'all'"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card-background text-primary-text border border-primary-border font-medium"
      >
        <span>Status: {{ statusFilter }}</span>
        <button type="button" class="hover:text-red-500 cursor-pointer" @click="statusFilter = 'all'">
          <X :size="12" />
        </button>
      </span>
      <span
        v-if="walletTargetFilter !== 'all'"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card-background text-primary-text border border-primary-border font-medium"
      >
        <span>Wallet: {{ walletTargetFilter }}</span>
        <button type="button" class="hover:text-red-500 cursor-pointer" @click="walletTargetFilter = 'all'">
          <X :size="12" />
        </button>
      </span>
      <button
        type="button"
        class="text-[11px] text-red-500 hover:underline font-semibold ml-1 cursor-pointer"
        @click="resetFilters"
      >
        Clear All
      </button>
    </div>

    <!-- Sub-affiliate Parent IB required Prompt banner -->
    <div
      v-if="activeReportType.type === 'sub-affiliates' && !filterParentIbId && !filterIbId"
      class="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div class="flex items-center gap-3">
        <GitFork :size="20" class="text-amber-500 shrink-0" />
        <div>
          <h5 class="text-xs font-bold text-primary-text">Select Parent IB to view Sub-Affiliates</h5>
          <p class="text-[11px] text-secondary-text">
            Admin Sub-affiliate report uses <code class="text-amber-600 dark:text-amber-400 font-mono font-bold">/admin/search/ib</code> to query downline children by <code class="text-amber-600 dark:text-amber-400 font-mono font-bold">parent_ib_id</code>.
          </p>
        </div>
      </div>
      <div class="w-full sm:w-72">
        <BaseSelect
          v-model="filterParentIbId"
          :options="store.ibSearchOptions"
          :is-loading="store.searchLoading"
          placeholder="Search Parent IB (parent_ib_id)..."
          searchable
          clearable
          customClass="h-9 text-xs rounded-xl font-medium"
          @search="onIbSearch"
        />
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- SUMMARY KPI METRIC CARDS                                          -->
    <!-- ================================================================= -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      <!-- Loading Skeleton -->
      <template v-if="store.reportsLoading && !store.reportsSummary">
        <div
          v-for="n in 5"
          :key="n"
          class="bg-card-background border border-primary-border rounded-2xl p-4 animate-pulse space-y-2.5"
        >
          <div class="flex items-center justify-between">
            <div class="h-3 w-20 bg-background rounded" />
            <div class="h-4 w-4 bg-background rounded-full" />
          </div>
          <div class="h-7 w-28 bg-background rounded mt-2" />
          <div class="h-2.5 w-24 bg-background rounded mt-1" />
        </div>
      </template>

      <!-- KPI 1: Grand Total Commission -->
      <div
        v-else
        class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between hover:border-primary-green/40 transition-colors"
      >
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Grand Total Commission</span>
          <Coins :size="16" class="text-primary-green" />
        </div>
        <div class="mt-2">
          <p class="text-2xl font-bold text-primary-green tabular-nums">
            +{{ formatUSD(store.reportsSummary?.total_commission ?? tableTotals.total_commission) }}
          </p>
          <p class="text-[10px] text-secondary-text mt-0.5">
            Total payout ({{ activePeriodLabel }})
          </p>
        </div>
      </div>

      <!-- KPI 2: Total Lots Traded -->
      <div
        class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between"
      >
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Total Traded Volume</span>
          <CandlestickChart :size="16" class="text-secondary-text" />
        </div>
        <div class="mt-2">
          <p class="text-2xl font-bold text-primary-text tabular-nums">
            {{ formatLots(store.reportsSummary?.total_lots ?? tableTotals.total_lots) }} lots
          </p>
          <p class="text-[10px] text-secondary-text mt-0.5">
            Volume executed across deals
          </p>
        </div>
      </div>

      <!-- KPI 3: Direct vs Sub-IB Split -->
      <div
        class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between"
      >
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Direct vs Sub-IBs</span>
          <Layers :size="16" class="text-primary" />
        </div>
        <div class="mt-2 space-y-0.5">
          <div class="flex items-center justify-between text-xs font-semibold">
            <span class="text-primary">Direct:</span>
            <span class="text-primary-text font-mono">{{ formatUSD(store.reportsSummary?.performance_commission ?? tableTotals.performance_commission) }}</span>
          </div>
          <div class="flex items-center justify-between text-xs font-semibold">
            <span class="text-primary-yellow">Sub-IBs:</span>
            <span class="text-primary-text font-mono">{{ formatUSD(store.reportsSummary?.commission_from_subibs ?? tableTotals.commission_from_subibs) }}</span>
          </div>
        </div>
      </div>

      <!-- KPI 4: Executed Entries / Deals -->
      <div
        class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between"
      >
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Total Deals / Entries</span>
          <Receipt :size="16" class="text-secondary-text" />
        </div>
        <div class="mt-2">
          <p class="text-2xl font-bold text-primary-text tabular-nums">
            {{ (store.reportsSummary?.entry_count ?? tableTotals.entry_count_all).toLocaleString() }}
          </p>
          <p class="text-[10px] text-secondary-text mt-0.5">
            {{ store.reportsSummary?.entry_count_direct ?? store.reportsSummary?.entry_count ?? tableTotals.entry_count }} direct • {{ store.reportsSummary?.entry_count_from_subibs ?? tableTotals.entry_count_from_subibs }} sub-IBs
          </p>
        </div>
      </div>

      <!-- KPI 5: Pending & Status Liability -->
      <div
        class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between hover:border-primary-yellow/40 transition-colors"
      >
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Pending Approvals</span>
          <Clock :size="16" class="text-primary-yellow" />
        </div>
        <div class="mt-2">
          <div class="flex items-baseline justify-between gap-1">
            <p class="text-2xl font-bold text-primary-yellow tabular-nums">
              {{ formatUSD(store.reportsSummary?.by_status?.pending?.commission) }}
            </p>
            <span class="text-[11px] font-mono font-semibold text-primary-yellow">
              {{ store.reportsSummary?.by_status?.pending?.entry_count || 0 }} deals
            </span>
          </div>
          <div class="flex items-center justify-between text-[10px] text-secondary-text mt-1 pt-1 border-t border-primary-border/60">
            <span>Appr: <strong class="text-emerald-500 font-mono">{{ formatUSD(store.reportsSummary?.by_status?.approved?.commission) }}</strong></span>
            <span>Rej: <strong class="text-rose-500 font-mono">{{ formatUSD(store.reportsSummary?.by_status?.rejected?.commission) }}</strong> ({{ store.reportsSummary?.by_status?.rejected?.entry_count || 0 }})</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- STANDARD DATA TABLE (DataTable Component)                         -->
    <!-- ================================================================= -->
    <div class="space-y-2">
      <DataTable
        :columns="visibleColumns"
        :data="filteredTableItems"
        :loading="store.reportsLoading"
        :pagination="store.reportsPagination"
        :row-key="(row, idx) => row.period_key || row.label || row.ib_id || row.user_id || row.symbol || idx"
        table-key="ib-commission-reports-table"
        :per-page-options="[25, 50, 100, 200]"
        empty-title="No report records found"
        empty-text="Select a Date Range and click 'Run Report' to view commission analytics."
        @page-change="handlePageChange"
        @per-page-change="handlePerPageChange"
      >
        <!-- Table Toolbar Slot -->
        <template #toolbar>
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div class="flex items-center gap-2">
              <div class="relative w-64">
                <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
                <input
                  v-model="tableSearch"
                  type="text"
                  placeholder="Quick search in rows..."
                  class="input-field pl-9 pr-3 py-1.5 text-xs w-full rounded-xl font-medium"
                />
              </div>
              <span class="text-xs text-secondary-text font-medium">
                Showing <strong class="text-primary-text">{{ filteredTableItems.length }}</strong> rows
              </span>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-[11px] text-secondary-text font-mono">
                Scope: <strong class="text-primary">{{ store.reportsScope?.mode || "All IBs" }}</strong>
              </span>
            </div>
          </div>
        </template>

        <!-- Date / Period Cell (for Daily, Weekly, Monthly Performance Reports) -->
        <template #cell-period_or_ib="{ row }">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Calendar :size="15" />
            </div>
            <div>
              <p class="font-semibold text-primary-text">
                {{ getRowTitle(row, activeReportType) }}
              </p>
              <p v-if="getRowSubtitle(row, activeReportType)" class="text-[11px] text-secondary-text font-mono">
                {{ getRowSubtitle(row, activeReportType) }}
              </p>
            </div>
          </div>
        </template>

        <!-- IB Partner Cell (for Affiliates and Payouts) -->
        <template #cell-ib="{ row }">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Users :size="15" />
            </div>
            <div>
              <p class="font-semibold text-primary-text">
                {{ getRowTitle(row, activeReportType) }}
              </p>
              <p v-if="getRowSubtitle(row, activeReportType)" class="text-[11px] text-secondary-text font-mono">
                {{ getRowSubtitle(row, activeReportType) }}
              </p>
            </div>
          </div>
        </template>

        <!-- Sub-Affiliate Cell -->
        <template #cell-child_ib="{ row }">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <GitFork :size="15" />
            </div>
            <div>
              <p class="font-semibold text-primary-text">
                {{ getRowTitle(row, activeReportType) }}
              </p>
              <p v-if="getRowSubtitle(row, activeReportType)" class="text-[11px] text-secondary-text font-mono">
                {{ getRowSubtitle(row, activeReportType) }}
              </p>
            </div>
          </div>
        </template>

        <!-- Customer Cell -->
        <template #cell-customer="{ row }">
          <div>
            <p class="font-semibold text-primary-text">
              {{ row.name || row.customer_name || (row.user_id ? `Client #${row.user_id}` : 'Client') }}
            </p>
            <p v-if="row.email || row.user_id" class="text-[11px] text-secondary-text font-mono">
              {{ row.email || `ID: ${row.user_id}` }}
            </p>
          </div>
        </template>

        <!-- Logins Cell -->
        <template #cell-logins="{ row }">
          <span class="font-mono text-secondary-text">
            {{ Array.isArray(row.logins) ? row.logins.join(', ') : (row.logins || '-') }}
          </span>
        </template>

        <!-- Attribution Cell -->
        <template #cell-attribution="{ row }">
          <span class="font-mono text-primary font-semibold">
            {{ row.attribution || row.parent_ib_name || (row.ib_id ? `IB #${row.ib_id}` : '-') }}
          </span>
        </template>

        <!-- Symbol Cell -->
        <template #cell-symbol="{ row }">
          <span class="font-mono font-bold text-primary">
            {{ row.symbol || '-' }}
          </span>
        </template>

        <!-- Total Deals Count -->
        <template #cell-entry_count_all="{ row }">
          <span class="font-mono text-primary-text font-semibold">
            {{ (row.entry_count_all ?? (Number(row.entry_count || 0) + Number(row.entry_count_from_subibs || 0))).toLocaleString() }}
          </span>
        </template>

        <!-- Direct Entries -->
        <template #cell-entry_count="{ row }">
          <span class="font-mono text-primary-text font-medium">
            {{ (row.entry_count || row.entries || 0).toLocaleString() }}
          </span>
        </template>

        <!-- Sub-IB Entries -->
        <template #cell-entry_count_from_subibs="{ row }">
          <span class="font-mono text-primary-text font-medium">
            {{ (row.entry_count_from_subibs || 0).toLocaleString() }}
          </span>
        </template>

        <!-- Currencies Cells -->
        <template #cell-total_commission="{ row }">
          <span class="font-mono font-bold text-primary-green">
            {{ formatUSD(row.total_commission || row.commission) }}
          </span>
        </template>

        <template #cell-performance_commission="{ row }">
          <span class="font-mono font-medium text-primary-text">
            {{ formatUSD(row.performance_commission) }}
          </span>
        </template>

        <template #cell-commission_from_subibs="{ row }">
          <span class="font-mono font-medium text-primary-text">
            {{ formatUSD(row.commission_from_subibs) }}
          </span>
        </template>

        <!-- Lots Traded -->
        <template #cell-total_lots="{ row }">
          <span class="font-mono text-primary-text font-medium">
            {{ formatLots(row.total_lots || row.lots) }}
          </span>
        </template>

        <!-- Status Breakdown Cell -->
        <template #cell-by_status="{ row }">
          <div v-if="row.by_status" class="flex items-center gap-1.5 flex-wrap">
            <span
              v-if="row.by_status.pending && (row.by_status.pending.commission > 0 || row.by_status.pending.entry_count > 0)"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
              :title="`Pending: ${formatUSD(row.by_status.pending.commission)} • ${row.by_status.pending.entry_count} entries • ${formatLots(row.by_status.pending.lots)} lots`"
            >
              <span>Pending:</span>
              <span class="font-mono font-bold">{{ formatUSD(row.by_status.pending.commission) }}</span>
              <span class="opacity-75">({{ row.by_status.pending.entry_count }})</span>
            </span>
            <span
              v-if="row.by_status.approved && (row.by_status.approved.commission > 0 || row.by_status.approved.entry_count > 0)"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              :title="`Approved: ${formatUSD(row.by_status.approved.commission)} • ${row.by_status.approved.entry_count} entries • ${formatLots(row.by_status.approved.lots)} lots`"
            >
              <span>Approved:</span>
              <span class="font-mono font-bold">{{ formatUSD(row.by_status.approved.commission) }}</span>
              <span class="opacity-75">({{ row.by_status.approved.entry_count }})</span>
            </span>
            <span
              v-if="row.by_status.rejected && (row.by_status.rejected.commission > 0 || row.by_status.rejected.entry_count > 0)"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
              :title="`Rejected: ${formatUSD(row.by_status.rejected.commission)} • ${row.by_status.rejected.entry_count} entries • ${formatLots(row.by_status.rejected.lots)} lots`"
            >
              <span>Rejected:</span>
              <span class="font-mono font-bold">{{ formatUSD(row.by_status.rejected.commission) }}</span>
              <span class="opacity-75">({{ row.by_status.rejected.entry_count }})</span>
            </span>
            <span
              v-if="
                (!row.by_status.pending || (row.by_status.pending.commission === 0 && row.by_status.pending.entry_count === 0)) &&
                (!row.by_status.approved || (row.by_status.approved.commission === 0 && row.by_status.approved.entry_count === 0)) &&
                (!row.by_status.rejected || (row.by_status.rejected.commission === 0 && row.by_status.rejected.entry_count === 0))
              "
              class="text-xs text-secondary-text font-mono"
            >
              $0.00
            </span>
          </div>
          <span v-else class="text-xs text-secondary-text font-mono">-</span>
        </template>

        <!-- Wallet Target Cell -->
        <template #cell-wallet_target="{ row }">
          <span class="capitalize font-medium text-xs">
            {{ row.wallet_target || 'Main' }}
          </span>
        </template>

        <!-- Status Badge (for Payouts report) -->
        <template #cell-status_badge="{ row }">
          <StatusBadge :status="row.status || 'approved'" />
        </template>

        <!-- Empty State Slot Override -->
        <template #empty>
          <div class="flex flex-col items-center justify-center p-12 text-center bg-card-background gap-2 max-w-md mx-auto">
            <div class="w-12 h-12 rounded-2xl bg-background border border-primary-border flex items-center justify-center text-secondary-text">
              <AlertCircle :size="24" class="text-secondary-text" />
            </div>
            <h4 class="text-sm font-semibold text-primary-text">No Report Records Found</h4>
            <p class="text-xs text-secondary-text">
              Please select a Date Range and click "Run Report" to load analytics.
            </p>
            <button
              v-if="hasActiveFilters"
              type="button"
              class="btn-secondary text-xs mt-2"
              @click="resetFilters"
            >
              Clear Filters
            </button>
          </div>
        </template>
      </DataTable>

      <!-- Table Summary Footer Totals -->
      <div
        v-if="filteredTableItems.length > 0"
        class="bg-card-background border border-primary-border rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold"
      >
        <div class="flex items-center gap-4 text-secondary-text flex-wrap">
          <span>Rows on Page: <strong class="text-primary-text">{{ filteredTableItems.length }}</strong></span>
          <span v-if="store.reportsPagination.total > filteredTableItems.length">
            Total Records: <strong class="text-primary font-mono">{{ store.reportsPagination.total }}</strong>
          </span>
          <span>Deals Sum: <strong class="text-primary-text font-mono">{{ tableTotals.entry_count_all.toLocaleString() }}</strong></span>
          <span>Direct Entries: <strong class="text-primary-text font-mono">{{ tableTotals.entry_count.toLocaleString() }}</strong></span>
          <span>Sub-IB Entries: <strong class="text-primary-text font-mono">{{ tableTotals.entry_count_from_subibs.toLocaleString() }}</strong></span>
          <span>Volume: <strong class="text-primary-text font-mono">{{ formatLots(tableTotals.total_lots) }} lots</strong></span>
        </div>

        <div class="flex items-center gap-4 flex-wrap">
          <span v-if="tableTotals.performance_commission">Direct: <strong class="text-primary font-mono">{{ formatUSD(tableTotals.performance_commission) }}</strong></span>
          <span v-if="tableTotals.commission_from_subibs">Sub-IBs: <strong class="text-primary-yellow font-mono">{{ formatUSD(tableTotals.commission_from_subibs) }}</strong></span>
          <span>Page Total: <strong class="text-primary-green font-mono text-sm">+{{ formatUSD(tableTotals.total_commission) }}</strong></span>
        </div>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- DIALOGS & MODALS                                                  -->
    <!-- ================================================================= -->
    <!-- Column Manager Modal -->
    <ReportColumnsModal
      v-model="showColumnsModal"
      :all-columns="currentColumnList"
      @toggle-column="toggleColumn"
      @select-all="selectAllColumns"
      @reset-columns="resetColumns"
    />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
