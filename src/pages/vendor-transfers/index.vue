<template>
  <div class="px-4 pb-8">
    <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 mb-5 mt-4">
      <div class="flex w-full min-w-0 flex-col gap-2 rounded-xl border border-primary-border bg-card-background/40 p-2 sm:flex-row sm:items-center xl:flex-1 xl:flex-nowrap">
        <!-- Type -->
        <BaseSelect
          v-model="store.filters.type"
          :options="typeOptions"
          placeholder="All Types"
          clearable
          class="w-full sm:w-36 xl:w-36"
          @update:modelValue="store.applyFilters()"
        />

        <!-- Status -->
        <BaseSelect
          v-model="store.filters.status"
          :options="statusOptions"
          placeholder="All Statuses"
          clearable
          class="w-full sm:w-36 xl:w-36"
          @update:modelValue="store.applyFilters()"
        />

        <BaseSelect
          :modelValue="store.pagination.per_page"
          :options="store.perPageOptions"
          placeholder="Per page..."
          class="sm:w-2 xl:w-20"
          @update:modelValue="store.updatePerPage"
        />

        <!-- Clear -->
        <button
          v-if="hasFilters"
          class="rounded-lg px-3 py-2 text-xs font-medium text-secondary-text hover:bg-background hover:text-primary-text transition-colors sm:flex-none cursor-pointer"
          @click="store.resetFilters()"
        >
          Clear
        </button>

        <Tooltip text="Refresh" position="right">
          <button
            type="button"
            :disabled="store.loading"
            class="inline-flex items-center justify-center rounded-lg border border-primary-border p-1.5 text-secondary-text transition-colors hover:text-primary-text hover:bg-background disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            @click="store.fetchTransfers(true)"
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
      <table class="w-full min-w-275 border-collapse text-left">
        <thead>
          <tr class="border-b border-primary-border bg-card-background">
            <th class="w-16 min-w-16 text-left text-[11px] font-semibold text-secondary-text uppercase tracking-wider px-3 py-3">ID</th>
            <th class="min-w-32 text-left text-[11px] font-semibold text-secondary-text uppercase tracking-wider px-3 py-3">Type</th>
            <th class="min-w-32 text-left text-[11px] font-semibold text-secondary-text uppercase tracking-wider px-3 py-3">Status</th>
            <th class="min-w-32 text-left text-[11px] font-semibold text-secondary-text uppercase tracking-wider px-3 py-3">Assigned To</th>
            <th class="min-w-40 text-left text-[11px] font-semibold text-secondary-text uppercase tracking-wider px-3 py-3">Amount</th>
            <th class="min-w-40 text-left text-[11px] font-semibold text-secondary-text uppercase tracking-wider px-3 py-3">Note / Proof</th>
          </tr>
        </thead>
        
        <tbody v-if="store.loading">
          <tr v-for="n in 8" :key="n" class="border-b border-primary-border bg-card-background animate-pulse">
            <td class="px-3 py-3.5"><div class="h-3 w-8 bg-background rounded" /></td>
            <td class="px-3 py-3.5"><div class="h-5 w-16 bg-background rounded-full" /></td>
            <td class="px-3 py-3.5"><div class="h-5 w-16 bg-background rounded-full" /></td>
            <td class="px-3 py-3.5"><div class="h-3 w-16 bg-background rounded" /></td>
            <td class="px-3 py-3.5"><div class="h-3 w-20 bg-background rounded" /></td>
            <td class="px-3 py-3.5"><div class="h-3 w-24 bg-background rounded" /></td>
          </tr>
        </tbody>
        
        <tbody v-else-if="store.records.length === 0">
          <tr>
            <td colspan="6" class="py-20 text-center bg-card-background">
              <div class="flex flex-col items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-background flex items-center justify-center">
                  <Handshake class="w-5 h-5 text-secondary-text" />
                </div>
                <p class="text-sm font-semibold text-primary-text">No vendor transfers found</p>
                <p class="text-xs text-secondary-text">Try adjusting your filters.</p>
              </div>
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr v-for="req in store.records" :key="req.id" class="border-b border-primary-border last:border-none bg-card-background hover:bg-background/80 transition-colors">
            <td class="px-3 py-3 text-xs font-semibold text-primary-text/80 font-mono w-16 min-w-16">
              #{{ req.id }}
            </td>
            
            <td class="px-3 py-3 min-w-32">
              <span
                class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border capitalize inline-block"
                :class="
                  req.payment_request?.type?.toLowerCase() === 'deposit'
                    ? 'bg-primary-blue/10 text-primary-blue border-primary-blue/20'
                    : 'bg-primary-red/10 text-primary-red border-primary-red/20'
                "
              >
                {{ req.payment_request?.type || '—' }}
              </span>
            </td>

            <td class="px-3 py-3 min-w-32">
              <span
                class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border capitalize inline-flex items-center gap-1 shrink-0"
                :class="statusClass(req.status)"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0"></span>
                <span>{{ req.status || '—' }}</span>
              </span>
            </td>

            <td class="px-3 py-3 min-w-32">
              <span class="text-xs font-semibold text-primary-text">{{ req.assigned_to || '—' }}</span>
            </td>

            <td class="px-3 py-3 min-w-40">
              <div v-if="req.payment_request" class="space-y-0.5">
                <span class="text-xs font-bold text-primary-text tabular-nums">
                  ${{ fmt(req.payment_request.amount, 2) }}
                </span>
                <span v-if="req.payment_request.currency" class="text-[10px] text-secondary-text font-medium uppercase ml-1">
                  {{ req.payment_request.currency }}
                </span>
              </div>
              <span v-else class="text-xs text-secondary-text">—</span>
            </td>

            <td class="px-3 py-3 min-w-40">
              <div class="space-y-1">
                <div v-if="req.vendor_note" class="text-xs text-secondary-text max-w-[200px] truncate" :title="req.vendor_note">
                  {{ req.vendor_note }}
                </div>
                <a v-if="req.proof_url" :href="req.proof_url" target="_blank" class="text-[11px] text-primary hover:underline inline-flex items-center gap-1">
                  Proof <ExternalLink class="w-3 h-3" />
                </a>
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
  </div>
</template>

<script setup>
import { onMounted, computed, onUnmounted } from "vue";
import { Handshake, RefreshCw, ExternalLink } from "lucide-vue-next";
import BaseSelect from "@/components/common/BaseSelect.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import Pagination from "@/components/common/Pagination.vue";
import { useVendorTransfersStore } from "@/stores/vendorTransfers/vendorTransfers";

const store = useVendorTransfersStore();

const typeOptions = [
  { label: "Deposit", value: "deposit" },
  { label: "Withdrawal", value: "withdrawal" },
];

const statusOptions = [
  { label: "Assigned", value: "assigned" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const hasFilters = computed(() => {
  return store.filters.type || store.filters.status;
});

const fmt = (num, dec = 2) => {
  if (num === null || num === undefined) return "0.00";
  return Number(num).toLocaleString("en-US", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });
};

const statusClass = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "completed") return "bg-primary-green/10 text-primary-green border-primary-green/20";
  if (s === "cancelled") return "bg-primary-red/10 text-primary-red border-primary-red/20";
  if (s === "assigned") return "bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20";
  return "bg-background border border-primary-border text-secondary-text";
};

const handlePageChange = (page) => {
  store.setPage(page);
};

onMounted(() => {
  store.fetchTransfers();
});

onUnmounted(() => {
  store.reset();
});
</script>
