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
          <div class="px-6 py-4 border-b border-primary-border bg-card-background flex items-center justify-between gap-4">
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
          <div class="px-6 py-3 bg-background/60 border-b border-primary-border flex items-center justify-between gap-4 flex-wrap">
            <div class="flex items-center gap-4 text-xs font-mono">
              <div>
                <span class="text-secondary-text">Pending Entries: </span>
                <strong class="text-primary-text">{{ ib?.entry_count || store.approvalEntriesPagination.total_items }}</strong>
              </div>
              <div>
                <span class="text-secondary-text">Total Commission: </span>
                <strong class="text-primary-green font-bold text-sm">+${{ formatNum(ib?.total_commission) }}</strong>
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

          <!-- Drawer Body / Line Items Table -->
          <div class="flex-1 overflow-y-auto p-6 space-y-4">
            <!-- Loading Skeleton -->
            <div v-if="store.approvalEntriesLoading" class="space-y-3">
              <div v-for="n in 5" :key="n" class="p-3 bg-background/50 border border-primary-border rounded-xl animate-pulse flex justify-between">
                <div class="h-4 w-32 bg-background rounded" />
                <div class="h-4 w-20 bg-background rounded" />
              </div>
            </div>

            <!-- Empty State -->
            <div
              v-else-if="!store.approvalEntriesList.length"
              class="py-16 text-center text-secondary-text space-y-2"
            >
              <p class="text-sm font-semibold text-primary-text">No line items found</p>
              <p class="text-xs">There are no individual trade commission entries for this IB in the selected period.</p>
            </div>

            <!-- Line Items Table -->
            <div v-else class="border border-primary-border rounded-xl overflow-hidden bg-card-background">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="border-b border-primary-border bg-background/80 text-secondary-text font-bold text-[11px] uppercase tracking-wider">
                      <th class="py-3 px-3.5">ID</th>
                      <th class="py-3 px-3.5">Trade (Login & Symbol)</th>
                      <th class="py-3 px-3.5 text-right">Lots</th>
                      <th class="py-3 px-3.5 text-right">Commission</th>
                      <th class="py-3 px-3.5 text-right">Close Time</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-primary-border/60">
                    <tr
                      v-for="entry in store.approvalEntriesList"
                      :key="entry.id"
                      class="hover:bg-background/40 transition-colors"
                    >
                      <!-- Entry ID -->
                      <td class="py-3 px-3.5 font-mono text-primary-text font-semibold whitespace-nowrap">
                        #{{ entry.id }}
                      </td>

                      <!-- Trade Login & Symbol -->
                      <td class="py-3 px-3.5 whitespace-nowrap">
                        <div class="space-y-0.5">
                          <span class="font-mono font-bold text-primary-text">
                            {{ entry.trade?.symbol || '—' }}
                          </span>
                          <p class="text-[10px] text-secondary-text font-mono">
                            Login: {{ entry.trade?.login || '—' }}
                          </p>
                        </div>
                      </td>

                      <!-- Lots (trade.lots) -->
                      <td class="py-3 px-3.5 text-right font-mono font-semibold text-primary-text whitespace-nowrap">
                        {{ entry.trade?.lots ?? entry.closed_volume_lots ?? '—' }}
                      </td>

                      <!-- Commission Amount -->
                      <td class="py-3 px-3.5 text-right font-mono font-bold text-primary-green whitespace-nowrap">
                        +${{ formatNum(entry.total_commission) }}
                      </td>

                      <!-- Trade Close Time -->
                      <td class="py-3 px-3.5 text-right text-[11px] text-secondary-text whitespace-nowrap font-mono">
                        {{ formatDate(entry.trade?.close_time || entry.created_at) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Drawer Footer / Pagination -->
          <div class="px-6 py-3 border-t border-primary-border bg-card-background flex items-center justify-between gap-4">
            <p class="text-xs text-secondary-text font-mono">
              Showing {{ store.approvalEntriesList.length }} of {{ store.approvalEntriesPagination.total_items }} entries
            </p>

            <!-- Pagination Buttons -->
            <div class="flex items-center gap-2">
              <button
                type="button"
                :disabled="store.approvalEntriesPagination.page <= 1 || store.approvalEntriesLoading"
                class="px-2.5 py-1 text-xs font-semibold rounded-lg border border-primary-border bg-card-background text-secondary-text hover:text-primary-text disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                @click="handlePageChange(store.approvalEntriesPagination.page - 1)"
              >
                Previous
              </button>
              <span class="text-xs font-mono text-primary-text font-semibold px-1">
                {{ store.approvalEntriesPagination.page }} / {{ store.approvalEntriesPagination.total_pages || 1 }}
              </span>
              <button
                type="button"
                :disabled="store.approvalEntriesPagination.page >= store.approvalEntriesPagination.total_pages || store.approvalEntriesLoading"
                class="px-2.5 py-1 text-xs font-semibold rounded-lg border border-primary-border bg-card-background text-secondary-text hover:text-primary-text disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                @click="handlePageChange(store.approvalEntriesPagination.page + 1)"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, watch, onMounted, onBeforeUnmount } from "vue";
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { useCommissionEngineStore } from "@/stores/commissionEngine/commissionEngine";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

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
  hasPermission(["ib_commission.approvals.approve", "ib_commission.settlements.approve"])
);

const loadEntries = (page = 1) => {
  if (!props.ib?.ib_id || !props.periodKey) return;
  store.fetchApprovalEntries({
    frequency: props.frequency,
    period_key: props.periodKey,
    ib_id: props.ib.ib_id,
    page,
    per_page: 50,
  });
};

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && props.ib?.ib_id) {
      loadEntries(1);
    }
  },
  { immediate: true }
);

const handleClose = () => {
  emit("close");
};

const handlePageChange = (page) => {
  loadEntries(page);
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

const formatNum = (val) => {
  if (val == null || isNaN(Number(val))) return "0.00";
  return Number(val).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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
