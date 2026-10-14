<template>
  <div class="space-y-6">
    <!-- Header & Actions -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-base font-semibold text-primary-text">
          Store Redemptions & Fulfillment Queue
        </h2>
        <p class="text-xs text-secondary-text">
          Manage product claims, review pending redemptions, and record
          fulfillment dispatch tracking.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-secondary-text hover:text-primary-text text-xs font-medium transition cursor-pointer"
          @click="fetchData"
        >
          <RefreshCw
            class="w-3.5 h-3.5 text-primary"
            :class="store.loading ? 'animate-spin' : ''"
          />
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Status Tabs & Filter Bar -->
    <div class="space-y-3">
      <!-- Status Pills -->
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="st in statusTabs"
          :key="st.value"
          type="button"
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border flex items-center gap-1.5"
          :class="
            filters.status === st.value
              ? 'bg-primary text-white border-primary shadow-xs font-semibold'
              : 'bg-card-background text-secondary-text border-primary-border hover:text-primary-text hover:bg-background'
          "
          @click="selectStatus(st.value)"
        >
          <span>{{ st.label }}</span>
        </button>
      </div>

      <!-- Search & Filters -->
      <div
        class="flex flex-wrap items-center gap-2.5 p-3 bg-card-background border border-primary-border rounded-xl text-xs"
      >
        <!-- Client / Email Search Filter -->
        <div class="w-full sm:w-40">
          <BaseSelect
            v-model="filters.email"
            :options="clientOptions"
            :isLoading="isSearchingClients"
            placeholder="All Clients (Email)"
            searchable
            allowAll
            allLabel="All Clients"
            variant="surface"
            @update:modelValue="() => { filters.page = 1; fetchData(); }"
            @search="onClientSearch"
          />
        </div>

        <!-- <div class="relative w-full sm:w-44">
          <Search
            class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text"
          />
          <input
            v-model="filters.product_id"
            type="number"
            placeholder="Product ID..."
            class="w-full pl-8 pr-3 py-1.5 bg-background border border-primary-border rounded-lg text-primary-text placeholder:text-secondary-text/60 outline-none focus:border-primary transition font-mono text-xs"
            @keyup.enter="fetchData"
          />
        </div> -->

        <div class="w-full sm:w-40">
          <BaseDatePicker
            v-model="dateRange"
            :range="true"
            valueFormat="YYYY-MM-DD"
            placeholder="Filter by date range..."
          />
        </div>

        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold transition cursor-pointer text-xs"
          @click="fetchData"
        >
          <Search class="w-3 h-3" />
          <span>Search</span>
        </button>

        <button
          v-if="
            filters.email ||
            filters.product_id ||
            filters.from_at ||
            filters.to_at ||
            filters.status
          "
          type="button"
          class="px-2.5 py-1.5 rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition cursor-pointer text-xs"
          @click="resetFilters"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Redemptions DataTable -->
    <DataTable
      :columns="columns"
      :data="redemptions"
      :loading="store.loading"
      :pagination="pagination"
      row-key="id"
      @page-change="changePage"
    >
      <template #empty>
        <div
          class="flex flex-col items-center justify-center p-12 text-center gap-3"
        >
          <div
            class="w-12 h-12 rounded-xl bg-card-background border border-primary-border flex items-center justify-center text-secondary-text"
          >
            <PackageCheck class="w-6 h-6 text-primary" />
          </div>
          <div class="space-y-1">
            <h3 class="text-sm font-semibold text-primary-text">
              No Store Redemptions Found
            </h3>
            <p class="text-xs text-secondary-text max-w-sm mx-auto">
              {{
                filters.email || filters.product_id || filters.status
                  ? "No redemption requests match your filter parameters."
                  : "Member claims for store products, vouchers, and merchandise will queue here for review and fulfillment."
              }}
            </p>
          </div>
        </div>
      </template>

      <template #cell-id="{ row }">
        <span class="font-mono text-secondary-text">#{{ row.id }}</span>
      </template>

      <template #cell-member="{ row }">
        <div class="space-y-0.5">
          <span class="font-mono font-semibold text-primary block"
            >A/C #{{ row.trading_account_id }}</span
          >
          <span class="text-[10px] text-secondary-text font-mono"
            >User #{{ row.user_id }}</span
          >
        </div>
      </template>

      <template #cell-product="{ row }">
        <div class="space-y-0.5">
          <span
            class="font-semibold text-primary-text block max-w-xs truncate"
          >
            {{
              row.item_snapshot?.title ||
              row.item_snapshot?.name ||
              `Product #${row.product_id || row.reward_item_id}`
            }}
          </span>
          <span
            class="text-[10px] uppercase font-mono text-secondary-text"
          >
            {{ row.reward_type || row.item_snapshot?.type || "item" }}
          </span>
        </div>
      </template>

      <template #cell-points="{ row }">
        <span class="font-mono font-bold text-primary-green">
          {{ row.points || row.points_requested }} pts
        </span>
      </template>

      <template #cell-cash_value="{ row }">
        <span class="font-mono text-secondary-text">
          ${{ row.cash_value_snapshot || row.cash_amount || "—" }}
        </span>
      </template>

      <template #cell-status="{ row }">
        <span
          class="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono inline-flex items-center gap-1.5"
          :class="getStatusBadgeClass(row.status)"
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="getStatusDotClass(row.status)"
          />
          <span>{{ row.status }}</span>
        </span>
      </template>

      <template #cell-requested_at="{ row }">
        <span class="text-secondary-text whitespace-nowrap">
          {{ formatDate(row.requested_at || row.created_at) }}
        </span>
      </template>

      <template #cell-actions="{ row }">
        <div class="flex items-center justify-end gap-1.5 whitespace-nowrap">
          <!-- PENDING: Approve -->
          <button
            v-if="
              row.status?.toUpperCase() === 'PENDING' &&
              hasPermission('loyalty_redemption.approve')
            "
            type="button"
            class="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white font-semibold text-[11px] transition cursor-pointer"
            title="Approve Redemption"
            @click="handleApprove(row)"
          >
            Approve
          </button>

          <!-- PENDING: Reject -->
          <button
            v-if="
              row.status?.toUpperCase() === 'PENDING' &&
              hasPermission('loyalty_redemption.reject')
            "
            type="button"
            class="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white font-semibold text-[11px] transition cursor-pointer"
            title="Reject Redemption"
            @click="handleOpenReject(row)"
          >
            Reject
          </button>

          <!-- APPROVED: Fulfill -->
          <button
            v-if="
              row.status?.toUpperCase() === 'APPROVED' &&
              hasPermission('loyalty_redemption.fulfill')
            "
            type="button"
            class="px-2.5 py-1 rounded-lg bg-primary-green/10 hover:bg-primary-green text-primary-green hover:text-white font-semibold text-[11px] transition cursor-pointer flex items-center gap-1"
            title="Fulfill Redemption"
            @click="handleOpenFulfill(row)"
          >
            <CheckCircle2 class="w-3 h-3" />
            <span>Fulfill</span>
          </button>

          <!-- Inspect Details -->
          <button
            type="button"
            class="p-1.5 rounded-lg border border-primary-border hover:bg-background text-secondary-text hover:text-primary transition cursor-pointer"
            title="Inspect Details"
            @click="handleInspect(row)"
          >
            <Eye class="w-3.5 h-3.5" />
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Modals & Drawers -->
    <RedemptionDetailDrawer
      :open="isDetailDrawerOpen"
      :redemption="selectedRedemption"
      @close="isDetailDrawerOpen = false"
      @approve="handleApprove"
      @reject="handleOpenReject"
      @fulfill="handleOpenFulfill"
    />

    <FulfillRedemptionModal
      :open="isFulfillModalOpen"
      :redemption="selectedRedemption"
      @close="isFulfillModalOpen = false"
      @fulfilled="fetchData"
    />

    <RejectRedemptionModal
      :open="isRejectModalOpen"
      :redemption="selectedRedemption"
      @close="isRejectModalOpen = false"
      @rejected="fetchData"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import {
  RefreshCw,
  PackageCheck,
  Search,
  Eye,
  CheckCircle2,
} from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import { formatDate } from "@/utils/timeFormatter";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import BaseDatePicker from "@/components/common/BaseDatePicker.vue";
import DataTable from "@/components/common/DataTable/DataTable.vue";
import RedemptionDetailDrawer from "../components/RedemptionDetailDrawer.vue";
import FulfillRedemptionModal from "../components/FulfillRedemptionModal.vue";
import RejectRedemptionModal from "../components/RejectRedemptionModal.vue";

const store = useLoyaltyStore();
const { hasPermission } = usePermissionCheck();

const columns = [
  { key: "id", label: "ID", sortable: true },
  { key: "member", label: "Member Account", sortable: true },
  { key: "product", label: "Product Claimed", sortable: true },
  { key: "points", label: "Points", sortable: true },
  { key: "cash_value", label: "Est. Value", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "requested_at", label: "Requested At", sortable: true },
  { key: "actions", label: "Actions", align: "right" },
];

const isDetailDrawerOpen = ref(false);
const isFulfillModalOpen = ref(false);
const isRejectModalOpen = ref(false);
const selectedRedemption = ref(null);

// Client Search & Options
const isSearchingClients = ref(false);
const clientOptions = ref([]);
let clientSearchTimer = null;

const onClientSearch = (query) => {
  if (!query || !query.trim()) {
    fetchInitialClients();
    return;
  }

  clearTimeout(clientSearchTimer);
  isSearchingClients.value = true;

  clientSearchTimer = setTimeout(async () => {
    try {
      await apiRequest(urls.KEYS.GET, urls.clientLedger.allClients, {
        params: { search: query.trim() },
        isTokenRequired: true,
        onSuccess: (res) => {
          const list = (res?.data || []).map((c) => ({
            label: c.email ? `${c.name} (${c.email})` : c.name,
            value: c.email || c.name,
            name: c.name,
            email: c.email,
          }));
          if (query.includes("@") && !list.some((item) => item.value === query.trim())) {
            list.unshift({ label: query.trim(), value: query.trim() });
          }
          clientOptions.value = list;
        },
        onFailure: () => {
          clientOptions.value = [];
        },
      });
    } catch {
      clientOptions.value = [];
    } finally {
      isSearchingClients.value = false;
    }
  }, 300);
};

const fetchInitialClients = () => {
  apiRequest(urls.KEYS.GET, urls.clientLedger.allClients, {
    params: { search: "" },
    isTokenRequired: true,
    onSuccess: (res) => {
      clientOptions.value = (res?.data || []).map((c) => ({
        label: c.email ? `${c.name} (${c.email})` : c.name,
        value: c.email || c.name,
        name: c.name,
        email: c.email,
      }));
    },
    onFailure: () => {
      clientOptions.value = [];
    },
  });
};

const statusTabs = [
  { label: "All Redemptions", value: "" },
  { label: "Pending (Action Req.)", value: "pending" },
  { label: "Approved (Ready to Fulfill)", value: "approved" },
  { label: "Fulfilled (Dispatched)", value: "fulfilled" },
  { label: "Rejected", value: "rejected" },
];

const filters = reactive({
  status: "",
  email: "",
  product_id: "",
  from_at: "",
  to_at: "",
  page: 1,
});

const dateRange = computed({
  get() {
    if (filters.from_at || filters.to_at) {
      return {
        start: filters.from_at || null,
        end: filters.to_at || null,
      };
    }
    return null;
  },
  set(val) {
    if (!val) {
      filters.from_at = "";
      filters.to_at = "";
    } else if (Array.isArray(val)) {
      filters.from_at = val[0] || "";
      filters.to_at = val[1] || "";
    } else if (typeof val === "object") {
      filters.from_at = val.start || val.from || "";
      filters.to_at = val.end || val.to || "";
    }
    fetchData();
  },
});

const redemptions = computed(() => store.storeRedemptions || []);
const pagination = computed(
  () =>
    store.storeRedemptionsPagination || {
      page: 1,
      per_page: 20,
      total: 0,
      pages: 1,
    },
);

const selectStatus = (statusValue) => {
  filters.status = statusValue;
  filters.page = 1;
  fetchData();
};

const fetchData = (force = false) => {
  const params = {
    page: filters.page,
    per_page: 20,
  };
  if (filters.status) params.status = filters.status;
  if (filters.email) params.email = filters.email.trim();
  if (filters.product_id) params.product_id = Number(filters.product_id);
  if (filters.from_at) params.from_at = filters.from_at.trim();
  if (filters.to_at) params.to_at = filters.to_at.trim();
  if (store.program?.id) params.program_id = store.program.id;

  store.fetchStoreRedemptions(params, force);
};

const handleRefresh = () => {
  fetchData(true);
};

const resetFilters = () => {
  filters.status = "";
  filters.email = "";
  filters.product_id = "";
  filters.from_at = "";
  filters.to_at = "";
  filters.page = 1;
  fetchData(true);
};

const changePage = (p) => {
  filters.page = p;
  fetchData();
};

const handleInspect = async (item) => {
  selectedRedemption.value = item;
  isDetailDrawerOpen.value = true;
  await store.fetchStoreRedemptionDetail(item.id);
  if (store.activeRedemption) {
    selectedRedemption.value = store.activeRedemption;
  }
};

const handleApprove = async (item) => {
  await store.approveStoreRedemption(
    item.id,
    {},
    { page: filters.page, status: filters.status },
  );
  if (selectedRedemption.value?.id === item.id) {
    selectedRedemption.value = {
      ...selectedRedemption.value,
      status: "APPROVED",
    };
  }
};

const handleOpenReject = (item) => {
  selectedRedemption.value = item;
  isRejectModalOpen.value = true;
};

const handleOpenFulfill = (item) => {
  selectedRedemption.value = item;
  isFulfillModalOpen.value = true;
};

const getStatusBadgeClass = (status) => {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
    case "APPROVED":
      return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
    case "FULFILLED":
      return "bg-primary-green/10 text-primary-green border border-primary-green/20";
    case "REJECTED":
      return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
    default:
      return "bg-background text-secondary-text border border-primary-border";
  }
};

const getStatusDotClass = (status) => {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return "bg-amber-500 animate-ping";
    case "APPROVED":
      return "bg-blue-500";
    case "FULFILLED":
      return "bg-primary-green";
    case "REJECTED":
      return "bg-rose-500";
    default:
      return "bg-secondary-text";
  }
};

const programId = computed(() => store.program?.id || null);

watch(
  programId,
  (newId) => {
    if (newId) {
      fetchData(true);
    }
  },
  { immediate: true },
);

onMounted(() => {
  fetchInitialClients();
});
</script>
