<script setup>
import { onMounted, ref } from "vue";
import { useFmRequestStore } from "@/stores/fmRequest/fmRequest";
import FmRequestFilters from "@/components/fmRequest/FmRequestFilters.vue";
import Pagination from "@/components/common/Pagination.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import FmRequestActionDialog from "@/components/fmRequest/FmRequestActionDialog.vue";
import AddEditFundManager from "@/components/fundManager/AddEditFundManager.vue";

const store = useFmRequestStore();
const activeStatus = ref(null);

const dialogOpen = ref(false);
const selectedItem = ref(null);
const actionType = ref("accept");

const fundManagerDialogOpen = ref(false);
const fundManagerMode = ref("add");
const selectedFundManager = ref(null);

const onFilter = (val) => {
  activeStatus.value = val;
  store.isFetched = false;
  store.fetchFmRequests(true, 1, val, store.search);
};

const onSearch = (val) => {
  store.setSearch(val, activeStatus.value);
};

const handlePageChange = (page) => {
  store.pagination.page = page;
  store.fetchFmRequests(true, page, activeStatus.value, store.search);
};

const handleAccept = (item) => {
  selectedItem.value = item;
  actionType.value = "accept";
  dialogOpen.value = true;
};

const handleReject = (item) => {
  selectedItem.value = item;
  actionType.value = "reject";
  dialogOpen.value = true;
};

const handleConfirm = ({ data, message, reason }) => {
  if (actionType.value === "accept") {
    // ✅ pass form data + optional message
    store.acceptRequest(selectedItem.value.request_id, data, message);
  } else {
    store.rejectRequest(selectedItem.value.request_id, reason);
  }
  dialogOpen.value = false;
};

const handleAddFundManager = () => {
  fundManagerMode.value = "add";
  selectedFundManager.value = null;
  fundManagerDialogOpen.value = true;
};

const handleEditFundManager = (item) => {
  fundManagerMode.value = "edit";
  selectedFundManager.value = item;
  fundManagerDialogOpen.value = true;
};

const handleFundManagerSuccess = () => {
  fundManagerDialogOpen.value = false;
};

const formatMoney = (value, currency = "USD") => {
  const amount = Number(value ?? 0);

  if (Number.isNaN(amount)) return "-";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
};

onMounted(() => {
  store.fetchFmRequests();
});
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <FmRequestFilters
        :filters="store.filters?.status ?? []"
        :active-status="activeStatus"
        :search="store.search"
        @filter="onFilter"
        @search="onSearch"
      />
      <button
        @click="handleAddFundManager"
        class="px-4 py-2 rounded-xl text-sm font-medium bg-primary text-background
               hover:bg-primary-hover transition-all cursor-pointer whitespace-nowrap"
      >
        + Add Fund Manager
      </button>
    </div>

    <div class="w-full overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-primary-border">
            <th
              class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest pb-3 px-3"
            >
              User
            </th>
            <th
              class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest pb-3 px-3"
            >
              Broker
            </th>
            <th
              class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest pb-3 px-3"
            >
              Min Capital
            </th>
            <th
              class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest pb-3 px-3"
            >
              Settlement
            </th>
            <th
              class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest pb-3 px-3"
            >
              Broker Share
            </th>
            <th
              class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest pb-3 px-3"
            >
              FM Share
            </th>
            <th
              class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest pb-3 px-3"
            >
              IB Pool
            </th>
            <th
              class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest pb-3 px-3"
            >
              Perf. Fee
            </th>
            <th
              class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest pb-3 px-3"
            >
              Status
            </th>
            <th
              class="text-center text-[11px] font-medium text-secondary-text uppercase tracking-widest pb-3 px-3"
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody v-if="store.isLoading">
          <tr
            v-for="n in 6"
            :key="n"
            class="border-b border-primary-border animate-pulse"
          >
            <td class="px-3 py-3.5">
              <div class="space-y-1.5">
                <div class="h-3 w-28 bg-card-background rounded" />
                <div class="h-2.5 w-16 bg-card-background rounded" />
              </div>
            </td>
            <td class="px-3 py-3.5">
              <div class="space-y-1.5">
                <div class="h-3 w-28 bg-card-background rounded" />
                <div class="h-2.5 w-20 bg-card-background rounded" />
              </div>
            </td>
            <td class="px-3 py-3.5">
              <div class="h-3 w-20 bg-card-background rounded" />
            </td>
            <td class="px-3 py-3.5">
              <div class="h-3 w-20 bg-card-background rounded" />
            </td>
            <td class="px-3 py-3.5">
              <div class="h-3 w-10 bg-card-background rounded" />
            </td>
            <td class="px-3 py-3.5">
              <div class="h-3 w-10 bg-card-background rounded" />
            </td>
            <td class="px-3 py-3.5">
              <div class="h-3 w-10 bg-card-background rounded" />
            </td>
            <td class="px-3 py-3.5">
              <div class="h-3 w-10 bg-card-background rounded" />
            </td>
            <td class="px-3 py-3.5">
              <div class="flex justify-end">
                <div class="h-5 w-16 bg-card-background rounded-full" />
              </div>
            </td>
            <td class="px-3 py-3.5">
              <div class="flex justify-center gap-2">
                <div class="h-8 w-8 bg-card-background rounded" />
                <div class="h-8 w-8 bg-card-background rounded" />
              </div>
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr
            v-for="item in store.data"
            :key="item.request_id"
            class="border-b border-primary-border last:border-none hover:bg-card-background transition-colors"
          >
            <td class="px-3 py-3.5">
              <p class="text-xs font-medium text-primary-text">
                {{ item.user_email }}
              </p>
              <p class="text-[11px] text-secondary-text mt-0.5">
                ID {{ item.user_id }}
              </p>
              <p class="text-[11px] text-secondary-text mt-0.5">
                {{ item.created_at }}
              </p>
            </td>
            <td class="px-3 py-3.5">
              <p class="text-xs font-medium text-primary-text">
                {{ item.broker_currency }}
              </p>
              <p class="text-[11px] text-secondary-text mt-0.5 break-all">
                {{ item.broker_group }}
              </p>
              <p class="text-[11px] text-secondary-text mt-0.5">
                Leverage: {{ item.broker_leverage }}
              </p>
              <p class="text-[11px] text-secondary-text mt-0.5">
                Category: {{ item.broker_category }}
              </p>
            </td>
            <td class="px-3 py-3.5 text-xs text-primary-text">
              {{ formatMoney(item.min_capital, item.broker_currency) }}
            </td>
            <td class="px-3 py-3.5">
              <p class="text-xs text-primary-text capitalize">
                {{ item.settlement_type }}
              </p>
              <p class="text-[11px] text-secondary-text mt-0.5">
                {{ item.settlement_time }}
              </p>
            </td>
            <td class="px-3 py-3.5 text-xs text-primary-text">
              {{ item.broker_share }}%
            </td>
            <td class="px-3 py-3.5 text-xs text-primary-text">
              {{ item.fm_share }}%
            </td>
            <td class="px-3 py-3.5 text-xs text-primary-text">
              {{ item.ib_pool_percentage }}%
            </td>
            <td class="px-3 py-3.5 text-xs text-primary-text">
              {{ item.performance_fee }}%
            </td>
            <td class="px-3 py-3.5 text-xs text-primary-text">
              <span
                class="text-[11px] font-medium px-2.5 py-1 rounded-full border"
                :class="{
                  'bg-green-50 text-green-800 border-green-200':
                    item.status === 'approved',
                  'bg-yellow-50 text-yellow-800 border-yellow-200':
                    item.status === 'pending',
                  'bg-red-50 text-red-800 border-red-200':
                    item.status === 'rejected',
                }"
              >
                {{ item.status }}
              </span>
            </td>
            <td class="px-3 py-3.5">
              <div
                v-if="item.status === 'pending'"
                class="flex justify-center gap-2"
              >
                <Tooltip text="Accept">
                  <button
                    class="inline-flex items-center justify-center w-8 h-8 border border-gray-300 rounded bg-gray-100 text-green-500 cursor-pointer transition-all duration-200 hover:bg-green-50 hover:border-green-500"
                    @click="handleAccept(item)"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </button>
                </Tooltip>
                <Tooltip text="Reject">
                  <button
                    class="inline-flex items-center justify-center w-8 h-8 border border-gray-300 rounded bg-gray-100 text-red-500 cursor-pointer transition-all duration-200 hover:bg-red-50 hover:border-red-500"
                    @click="handleReject(item)"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </Tooltip>
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
    <FmRequestActionDialog
      :open="dialogOpen"
      :item="selectedItem"
      :action="actionType"
      :isSubmitting="store.isSubmitting"
      @close="dialogOpen = false"
      @confirm="handleConfirm"
    />

    <AddEditFundManager
      :open="fundManagerDialogOpen"
      :mode="fundManagerMode"
      :item="selectedFundManager"
      @close="fundManagerDialogOpen = false"
      @success="handleFundManagerSuccess"
    />
  </div>
</template>
