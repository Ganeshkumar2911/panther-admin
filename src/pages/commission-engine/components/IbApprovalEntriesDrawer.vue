<template>
  <Transition name="drawer-fade">
    <div
      v-if="open"
      class="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        @click="handleClose"
      />

      <!-- Drawer Panel -->
      <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          class="w-screen max-w-2xl bg-card-background border-l border-primary-border shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-300"
        >
          <!-- Drawer Header -->
          <div class="px-6 py-4 border-b border-primary-border bg-card-background flex items-center justify-between gap-4 shrink-0">
            <div class="min-w-0 space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base font-bold text-primary-text truncate">
                  {{ ib?.ib_name || `IB #${ib?.ib_id}` }}
                </h3>
                <span class="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                  IB #{{ ib?.ib_id }}
                </span>
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono"
                  :class="
                    ib?.wallet_target === 'demo'
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  "
                >
                  {{ ib?.wallet_target === 'demo' ? 'Demo Wallet' : 'Main Wallet' }}
                </span>
              </div>
              <p class="text-xs text-secondary-text truncate">
                {{ ib?.ib_email || "No email" }} &middot; User #{{ ib?.ib_user_id || "N/A" }} &middot; Period: <span class="font-semibold text-primary-text">{{ periodLabel || periodKey }}</span>
              </p>
            </div>

            <button
              type="button"
              class="p-2 text-secondary-text hover:text-primary-text hover:bg-background rounded-xl transition-colors cursor-pointer shrink-0"
              title="Close Drawer"
              @click="handleClose"
            >
              <HugeIcon :icon="Cancel01Icon" :size="18" />
            </button>
          </div>

          <!-- Drawer Quick Summary Bar -->
          <div class="px-6 py-3 bg-background/60 border-b border-primary-border flex items-center justify-between gap-4 flex-wrap shrink-0">
            <div class="flex items-center gap-4 text-xs font-mono flex-wrap">
              <div>
                <span class="text-secondary-text">Pending Entries: </span>
                <strong class="text-primary-text">{{ currentPendingEntries }}</strong>
              </div>
              <div>
                <span class="text-secondary-text">Total Commission: </span>
                <strong class="text-primary-green font-bold text-sm">+${{ formatNum(currentTotalCommission) }}</strong>
              </div>
              <div v-if="currentTotalLots != null">
                <span class="text-secondary-text">Total Lots: </span>
                <strong class="text-primary-text font-bold">{{ formatNum(currentTotalLots) }} lots</strong>
              </div>
            </div>

            <!-- Approve Button inside Drawer -->
            <button
              v-if="canApprove && ib?.can_approve !== false"
              type="button"
              :disabled="store.approveIbLoading"
              class="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary-green hover:bg-primary-green/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
              @click="$emit('approve', ib)"
            >
              <HugeIcon :icon="CheckmarkCircle02Icon" :size="14" />
              <span>Approve IB Period</span>
            </button>
          </div>

          <!-- Client Search Filter Bar -->
          <div class="px-6 py-2.5 bg-card-background border-b border-primary-border flex items-center justify-between gap-3 flex-wrap shrink-0">
            <div class="flex items-center gap-2 flex-1 min-w-[260px] max-w-md">
              <!-- <span class="text-[11px] font-bold text-secondary-text uppercase tracking-wider shrink-0 font-mono">
                Client:
              </span> -->
              <div class="flex-1">
                <BaseSelect
                  v-model="selectedUserId"
                  :options="clientOptions"
                  :is-loading="clientsLoading"
                  placeholder="All Clients / Search by name, email, ID..."
                  searchable
                  clearable
                  variant="surface"
                  @search="onClientSearch"
                  @update:model-value="handleClientChange"
                />
              </div>
            </div>

            <div v-if="selectedUserId" class="flex items-center gap-2">
              <span class="text-[11px] font-mono font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                User ID: {{ selectedUserId }}
              </span>
              <button
                type="button"
                class="inline-flex items-center gap-1 px-2 py-1 text-xs text-secondary-text hover:text-primary-red hover:bg-primary-red/5 rounded-lg transition-colors cursor-pointer"
                title="Clear Client Filter"
                @click="clearClientFilter"
              >
                <HugeIcon :icon="Cancel01Icon" :size="12" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <!-- Drawer Body with DataTable -->
          <div class="flex-1 overflow-hidden p-4 sm:p-6 flex flex-col min-h-0">
            <DataTable
              :columns="columns"
              :data="store.approvalEntriesList"
              :loading="store.approvalEntriesLoading"
              :pagination="store.approvalEntriesPagination"
              row-key="id"
              table-key="ib-approval-entries-datatable"
              :per-page-options="[10, 20, 50, 100]"
              empty-title="No line items found"
              empty-text="There are no individual trade commission entries for this IB in the selected period."
              @page-change="handlePageChange"
              @per-page-change="handlePerPageChange"
            >
              <!-- Cell: Entry ID -->
              <template #cell-id="{ row }">
                <span class="font-mono text-primary-text font-bold text-xs">
                  #{{ row.id }}
                </span>
              </template>

              <!-- Cell: Position ID -->
              <template #cell-position_id="{ row }">
                <span class="font-mono text-primary-text font-medium text-xs">
                  {{ row.trade?.position_id || '—' }}
                </span>
              </template>

              <!-- Cell: Trade (Symbol & Login) -->
              <template #cell-trade="{ row }">
                <div class="space-y-0.5">
                  <span class="font-mono font-bold text-primary-text">
                    {{ row.trade?.symbol || '—' }}
                  </span>
                  <p class="text-[10px] text-secondary-text font-mono">
                    Login: {{ row.trade?.login || '—' }}
                  </p>
                </div>
              </template>

              <!-- Cell: Lots -->
              <template #cell-lots="{ row }">
                <span class="font-mono font-semibold text-primary-text text-xs tabular-nums">
                  {{ row.trade?.lots ?? row.closed_volume_lots ?? row.lots ?? '—' }}
                </span>
              </template>

              <!-- Cell: Commission -->
              <template #cell-total_commission="{ row }">
                <span class="font-mono text-xs font-bold text-primary-green tabular-nums">
                  +${{ formatNum(row.total_commission) }}
                </span>
              </template>

              <!-- Cell: Open Time -->
              <template #cell-open_time="{ row }">
                <span class="text-[11px] text-secondary-text whitespace-nowrap font-mono">
                  {{ formatDate(row.trade?.open_time) }}
                </span>
              </template>

              <!-- Cell: Close Time -->
              <template #cell-close_time="{ row }">
                <span class="text-[11px] text-secondary-text whitespace-nowrap font-mono">
                  {{ formatDate(row.trade?.close_time) }}
                </span>
              </template>

              <!-- Cell: Created At -->
              <template #cell-created_at="{ row }">
                <span class="text-[11px] text-secondary-text whitespace-nowrap font-mono">
                  {{ formatDate(row.created_at) }}
                </span>
              </template>
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { useCommissionEngineStore } from "@/stores/commissionEngine/commissionEngine";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import DataTable from "@/components/common/DataTable/DataTable.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  ib: {
    type: Object,
    default: null,
  },
  frequency: {
    type: String,
    default: "monthly",
  },
  periodKey: {
    type: String,
    default: "",
  },
  periodLabel: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["close", "approve"]);

const store = useCommissionEngineStore();
const { hasPermission } = usePermissionCheck();
const canApprove = computed(() =>
  hasPermission([
    "ib_commission_approvals.approve",
    "ib_commission.approvals.approve",
    "ib_commission_settlements.approve",
    "ib_commission.settlements.approve",
  ])
);

// ─── Client Search & Filter State ───────────────────────────
const selectedUserId = ref(null);
const clientsList = ref([]);
const clientsLoading = ref(false);

const fetchClients = (query = "") => {
  const ibId = props.ib?.ib_id;
  if (!ibId) {
    clientsList.value = [];
    return;
  }

  clientsLoading.value = true;
  apiRequest(urls.KEYS.GET, urls.ibTree.clients, {
    look_up_key: ibId,
    params: {
      search: query ? String(query).trim() : undefined,
      page: 1,
      per_page: 20,
    },
    isTokenRequired: true,
    onSuccess: (res) => {
      let list = [];
      if (Array.isArray(res?.data)) {
        list = res.data;
      } else if (res?.data?.items && Array.isArray(res.data.items)) {
        list = res.data.items;
      } else if (res?.data?.clients && Array.isArray(res.data.clients)) {
        list = res.data.clients;
      } else if (Array.isArray(res?.clients)) {
        list = res.clients;
      }
      clientsList.value = list;
      clientsLoading.value = false;
    },
    onFailure: () => {
      clientsList.value = [];
      clientsLoading.value = false;
    },
  });
};

let clientSearchDebounce = null;
const onClientSearch = (query) => {
  clearTimeout(clientSearchDebounce);
  clientSearchDebounce = setTimeout(() => {
    fetchClients(query);
  }, 300);
};

const clientOptions = computed(() => {
  return clientsList.value.map((c) => {
    const userId = c.user_id || c.id;
    const name = c.name || "Client";
    const email = c.email || "";
    return {
      label: email ? `${name} (${email}) - #${userId}` : `${name} - #${userId}`,
      value: Number(userId),
      userId: Number(userId),
      name,
      email,
    };
  });
});

const handleClientChange = (val) => {
  selectedUserId.value = val ? Number(val) : null;
  loadEntries(1);
};

const clearClientFilter = () => {
  selectedUserId.value = null;
  loadEntries(1);
};

// ─── DataTable Columns ──────────────────────────────────────
const columns = [
  {
    key: "id",
    label: "ID",
    width: "75px",
    sortable: true,
  },
  {
    key: "position_id",
    label: "Position ID",
    width: "110px",
    sortable: true,
  },
  {
    key: "trade",
    label: "Trade",
    sortable: true,
  },
  {
    key: "lots",
    label: "Lots",
    align: "right",
    width: "80px",
    sortable: true,
  },
  {
    key: "total_commission",
    label: "Commission",
    align: "right",
    width: "115px",
    sortable: true,
  },
  {
    key: "open_time",
    label: "Open Time",
    align: "right",
    width: "140px",
    sortable: true,
  },
  {
    key: "close_time",
    label: "Close Time",
    align: "right",
    width: "140px",
    sortable: true,
  },
  {
    key: "created_at",
    label: "Created At",
    align: "right",
    width: "140px",
    sortable: true,
  },
];

// ─── Data Loading ───────────────────────────────────────────
const loadEntries = (page = 1, perPage = 50) => {
  if (!props.ib?.ib_id || !props.periodKey) return;
  const params = {
    frequency: props.frequency,
    period_key: props.periodKey,
    ib_id: props.ib.ib_id,
    page,
    per_page: perPage,
  };
  if (selectedUserId.value) {
    params.user_id = selectedUserId.value;
  }
  store.fetchApprovalEntries(params);
};

// ─── Dynamic Summary Values ─────────────────────────────────
const currentPendingEntries = computed(() => {
  if (store.approvalEntriesSummary?.entry_count != null) {
    return store.approvalEntriesSummary.entry_count;
  }
  if (store.approvalEntriesPagination?.total_items != null) {
    return store.approvalEntriesPagination.total_items;
  }
  return props.ib?.entry_count ?? 0;
});

const currentTotalCommission = computed(() => {
  if (store.approvalEntriesSummary?.total_commission != null) {
    return store.approvalEntriesSummary.total_commission;
  }
  return props.ib?.total_commission ?? 0;
});

const currentTotalLots = computed(() => {
  if (store.approvalEntriesSummary?.total_lots != null) {
    return store.approvalEntriesSummary.total_lots;
  }
  return props.ib?.total_lots ?? null;
});

watch(
  () => [props.open, props.ib?.ib_id, props.periodKey],
  ([isOpen, ibId]) => {
    if (isOpen && ibId) {
      selectedUserId.value = null;
      store.approvalEntriesSummary = null;
      fetchClients("");
      loadEntries(1);
    } else if (!isOpen) {
      store.approvalEntriesSummary = null;
    }
  },
  { immediate: true }
);

const handleClose = () => {
  emit("close");
};

const handlePageChange = (page) => {
  loadEntries(page, store.approvalEntriesPagination?.per_page || 50);
};

const handlePerPageChange = (perPage) => {
  loadEntries(1, perPage);
};

const handleKeyDown = (e) => {
  if (e.key === "Escape" && props.open) {
    handleClose();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

// ─── Helpers ────────────────────────────────────────────────
const formatNum = (val, maxDecimals = 4) => {
  if (val == null || isNaN(Number(val))) return "0.00";
  return Number(val).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxDecimals,
  });
};

const formatDate = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  return isNaN(d.getTime())
    ? val
    : d.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
};
</script>

<style scoped>
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.2s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}
</style>
