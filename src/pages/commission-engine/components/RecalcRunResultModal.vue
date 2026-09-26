<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Alert02Icon,
  RefreshCwIcon,
  Coins01Icon,
  Activity01Icon,
  UserIcon,
  Calendar01Icon,
  ArrowRight01Icon,
  Layers01Icon,
} from "@hugeicons/core-free-icons";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  result: {
    type: Object,
    default: null,
  },
  isDryRun: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);
const router = useRouter();

const closeModal = () => {
  emit("update:modelValue", false);
};

const data = computed(() => props.result?.data || props.result || {});

const tradesProcessed = computed(() => {
  return data.value.trades_processed ?? data.value.positions_evaluated ?? data.value.trades_count ?? 0;
});

const entriesCreated = computed(() => {
  return data.value.entries_created ?? data.value.pending_entries ?? data.value.commissions_created ?? 0;
});

const entriesRejected = computed(() => {
  return data.value.entries_rejected ?? data.value.stale_rejected ?? data.value.rejected_entries ?? 0;
});

const unlockedTrades = computed(() => {
  return data.value.unlocked_trades ?? data.value.trades_unlocked ?? data.value.unlocked_count ?? 0;
});

const navigateToPendingCommissions = () => {
  closeModal();
  router.push({
    path: "/commission-engine/commissions",
    query: { status: "pending" },
  });
};
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="closeModal"
      >
        <div
          class="w-full max-w-xl bg-card-background border border-primary-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        >
          <!-- Modal Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-primary-border bg-card-background">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0"
                :class="
                  isDryRun
                    ? 'bg-primary-blue/10 text-primary-blue border-primary-blue/20'
                    : 'bg-primary-green/10 text-primary-green border-primary-green/20'
                "
              >
                <HugeIcon :icon="isDryRun ? InformationCircleIcon : CheckmarkCircle02Icon" :size="20" />
              </div>
              <div>
                <h3 class="title-text text-base text-primary-text font-semibold flex items-center gap-2">
                  <span>{{ isDryRun ? "Recalculation Dry Run Preview" : "Recalculation Completed" }}</span>
                  <span
                    v-if="isDryRun"
                    class="text-[11px] font-mono px-2 py-0.5 rounded-full bg-primary-blue/10 text-primary-blue border border-primary-blue/20 font-medium"
                  >
                    PREVIEW ONLY
                  </span>
                </h3>
                <p class="sub-text text-secondary-text">
                  {{
                    isDryRun
                      ? "Match preview evaluated without writing database modifications"
                      : "Retroactive trades recalculated & commissions updated successfully"
                  }}
                </p>
              </div>
            </div>
            <button
              class="w-8 h-8 rounded-lg flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-background transition-colors"
              @click="closeModal"
            >
              <HugeIcon :icon="Cancel01Icon" :size="18" />
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-5 overflow-y-auto custom-scrollbar">
            <!-- Run Meta Banner -->
            <div
              class="p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              :class="
                isDryRun
                  ? 'bg-primary-blue/5 border-primary-blue/20 text-primary-text'
                  : 'bg-primary-green/5 border-primary-green/20 text-primary-text'
              "
            >
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-secondary-text">Date Kind:</span>
                  <span class="font-mono uppercase font-bold text-primary">{{ data.kind || "next" }}</span>
                </div>
                <div v-if="data.from_date" class="flex items-center gap-2">
                  <span class="font-semibold text-secondary-text">Effective From Date:</span>
                  <span class="font-mono font-medium">{{ data.from_date }}</span>
                </div>
                <div v-if="data.ib_id" class="flex items-center gap-2">
                  <span class="font-semibold text-secondary-text">Target IB:</span>
                  <span class="font-mono font-medium">IB #{{ data.ib_id }}</span>
                </div>
              </div>

              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card-background border border-primary-border shadow-xs text-secondary-text">
                <HugeIcon :icon="RefreshCwIcon" :size="14" class="text-primary" />
                <span>{{ isDryRun ? "No changes written" : "Live data modified" }}</span>
              </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-2 gap-3.5">
              <!-- Trades Processed -->
              <div class="p-4 rounded-xl bg-background border border-primary-border flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs text-secondary-text font-medium">Trades Evaluated</span>
                  <HugeIcon :icon="Activity01Icon" :size="16" class="text-primary" />
                </div>
                <div class="text-xl font-bold font-mono text-primary-text mt-1">
                  {{ tradesProcessed }}
                </div>
                <span class="text-[11px] text-secondary-text">Closed positions evaluated</span>
              </div>

              <!-- Pending Entries Created -->
              <div class="p-4 rounded-xl bg-background border border-primary-border flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs text-secondary-text font-medium">Commissions Created</span>
                  <HugeIcon :icon="Coins01Icon" :size="16" class="text-primary-green" />
                </div>
                <div class="text-xl font-bold font-mono text-primary-green mt-1">
                  {{ entriesCreated }}
                </div>
                <span class="text-[11px] text-secondary-text">Pending entries ready for review</span>
              </div>

              <!-- Stale Entries Rejected -->
              <div class="p-4 rounded-xl bg-background border border-primary-border flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs text-secondary-text font-medium">Stale Rejected</span>
                  <HugeIcon :icon="Alert02Icon" :size="16" class="text-primary-yellow" />
                </div>
                <div class="text-xl font-bold font-mono text-primary-yellow mt-1">
                  {{ entriesRejected }}
                </div>
                <span class="text-[11px] text-secondary-text">Outside new IB chain</span>
              </div>

              <!-- Unlocked Trades -->
              <div class="p-4 rounded-xl bg-background border border-primary-border flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs text-secondary-text font-medium">Unlocked Trades</span>
                  <HugeIcon :icon="Layers01Icon" :size="16" class="text-primary-blue" />
                </div>
                <div class="text-xl font-bold font-mono text-primary-blue mt-1">
                  {{ unlockedTrades }}
                </div>
                <span class="text-[11px] text-secondary-text">Trade locks reset for sync</span>
              </div>
            </div>

            <!-- Hint Message -->
            <div class="p-3.5 rounded-xl bg-card-background border border-primary-border flex items-start gap-2.5 text-xs text-secondary-text">
              <HugeIcon :icon="InformationCircleIcon" :size="18" class="text-primary shrink-0 mt-0.5" />
              <div>
                <span v-if="isDryRun">
                  This was a simulation dry-run. No trades or pending commissions were modified. Click <strong>Run Recalculation</strong> when ready to execute.
                </span>
                <span v-else>
                  Commissions have been calculated based on live IB hierarchy and customer assignments. You can review and approve them in the <strong>Commissions</strong> tab.
                </span>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="flex items-center justify-between px-6 py-4 border-t border-primary-border bg-card-background gap-3">
            <button
              class="px-4 py-2 rounded-lg border border-primary-border text-xs font-semibold text-secondary-text hover:text-primary-text hover:bg-background transition-colors"
              @click="closeModal"
            >
              Close
            </button>

            <button
              v-if="!isDryRun && entriesCreated > 0"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition-colors"
              @click="navigateToPendingCommissions"
            >
              <span>View Pending Commissions</span>
              <HugeIcon :icon="ArrowRight01Icon" :size="14" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
