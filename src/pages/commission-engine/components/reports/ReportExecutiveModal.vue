<script setup>
import { computed } from "vue";
import {
  FileText,
  Printer,
  X,
  TrendingUp,
  Coins,
  Layers,
  Calendar,
  ShieldCheck,
  Building,
} from "lucide-vue-next";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  reportType: {
    type: String,
    default: "Daily Performance",
  },
  reportSummary: {
    type: Object,
    default: () => ({}),
  },
  reportItems: {
    type: Array,
    default: () => [],
  },
  periodLabel: {
    type: String,
    default: "",
  },
  filterScope: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:modelValue"]);

const formatUSD = (num) => {
  const val = Number(num || 0);
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatLots = (num) => {
  const val = Number(num || 0);
  return val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " lots";
};

const topPerformers = computed(() => {
  return [...(props.reportItems || [])]
    .sort((a, b) => Number(b.total_commission || 0) - Number(a.total_commission || 0))
    .slice(0, 5);
});

const handlePrint = () => {
  window.print();
};
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm"
        @click.self="emit('update:modelValue', false)"
      >
        <div
          class="w-full max-w-3xl bg-card-background border border-primary-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 print:max-w-none print:m-0 print:border-none print:shadow-none"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-primary-border bg-card-background"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-2xs"
              >
                <FileText :size="20" />
              </div>
              <div>
                <h3 class="text-base font-semibold text-primary-text flex items-center gap-2">
                  <span>Executive Commission Summary</span>
                </h3>
                <p class="text-xs text-secondary-text">
                  {{ reportType }} • {{ periodLabel || "Current Cycle" }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                class="btn-secondary text-xs gap-1.5"
                @click="handlePrint"
              >
                <Printer :size="14" />
                <span>Print Report</span>
              </button>
              <button
                type="button"
                class="btn-icon"
                @click="emit('update:modelValue', false)"
              >
                <X :size="18" />
              </button>
            </div>
          </div>

          <!-- Printable Document Body -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6 bg-card-background">
            <!-- Brand Banner -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-primary-border gap-2">
              <div>
                <h2 class="text-lg font-bold text-primary-text tracking-tight">Panther Capitals</h2>
                <p class="text-xs text-secondary-text">IB Commission Engine & Network Analytics</p>
              </div>
              <div class="text-left sm:text-right text-xs text-secondary-text">
                <p><span class="font-semibold text-primary-text">Date Generated:</span> {{ new Date().toLocaleDateString() }}</p>
                <p><span class="font-semibold text-primary-text">Scope:</span> {{ filterScope?.mode || "All Partners" }}</p>
              </div>
            </div>

            <!-- Key Metrics Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="p-4 rounded-xl bg-background border border-primary-border">
                <p class="text-[11px] font-semibold text-secondary-text uppercase tracking-wider">Grand Total Commission</p>
                <p class="text-xl font-bold text-primary-green mt-1">
                  {{ formatUSD(reportSummary?.total_commission) }}
                </p>
                <p class="text-[10px] text-secondary-text mt-0.5">Total partner earnings</p>
              </div>

              <div class="p-4 rounded-xl bg-background border border-primary-border">
                <p class="text-[11px] font-semibold text-secondary-text uppercase tracking-wider">Traded Volume</p>
                <p class="text-xl font-bold text-primary-text mt-1">
                  {{ formatLots(reportSummary?.total_lots) }}
                </p>
                <p class="text-[10px] text-secondary-text mt-0.5">Total closed lots</p>
              </div>

              <div class="p-4 rounded-xl bg-background border border-primary-border">
                <p class="text-[11px] font-semibold text-secondary-text uppercase tracking-wider">Direct Commission</p>
                <p class="text-xl font-bold text-primary mt-1">
                  {{ formatUSD(reportSummary?.performance_commission) }}
                </p>
                <p class="text-[10px] text-secondary-text mt-0.5">{{ reportSummary?.entry_count_direct || 0 }} direct entries</p>
              </div>

              <div class="p-4 rounded-xl bg-background border border-primary-border">
                <p class="text-[11px] font-semibold text-secondary-text uppercase tracking-wider">Sub-IB Downline</p>
                <p class="text-xl font-bold text-primary-yellow mt-1">
                  {{ formatUSD(reportSummary?.commission_from_subibs) }}
                </p>
                <p class="text-[10px] text-secondary-text mt-0.5">{{ reportSummary?.entry_count_from_subibs || 0 }} sub-IB entries</p>
              </div>
            </div>

            <!-- Status Breakdown Bar -->
            <div class="p-4 rounded-xl bg-background border border-primary-border space-y-3">
              <h4 class="text-xs font-semibold text-primary-text uppercase tracking-wider">
                Payout Status Distribution
              </h4>
              <div class="grid grid-cols-3 gap-2">
                <div class="p-3 rounded-lg bg-card-background border border-primary-yellow/20">
                  <span class="text-[10px] font-bold text-primary-yellow uppercase">Pending Approval</span>
                  <p class="text-base font-bold text-primary-text mt-0.5">
                    {{ formatUSD(reportSummary?.by_status?.pending?.commission) }}
                  </p>
                  <p class="text-[10px] text-secondary-text">
                    {{ reportSummary?.by_status?.pending?.entry_count || 0 }} trades • {{ formatLots(reportSummary?.by_status?.pending?.lots) }}
                  </p>
                </div>

                <div class="p-3 rounded-lg bg-card-background border border-primary-green/20">
                  <span class="text-[10px] font-bold text-primary-green uppercase">Approved & Paid</span>
                  <p class="text-base font-bold text-primary-text mt-0.5">
                    {{ formatUSD(reportSummary?.by_status?.approved?.commission) }}
                  </p>
                  <p class="text-[10px] text-secondary-text">
                    {{ reportSummary?.by_status?.approved?.entry_count || 0 }} trades • {{ formatLots(reportSummary?.by_status?.approved?.lots) }}
                  </p>
                </div>

                <div class="p-3 rounded-lg bg-card-background border border-primary-red/20">
                  <span class="text-[10px] font-bold text-primary-red uppercase">Rejected</span>
                  <p class="text-base font-bold text-primary-text mt-0.5">
                    {{ formatUSD(reportSummary?.by_status?.rejected?.commission) }}
                  </p>
                  <p class="text-[10px] text-secondary-text">
                    {{ reportSummary?.by_status?.rejected?.entry_count || 0 }} trades
                  </p>
                </div>
              </div>
            </div>

            <!-- Top 5 Ranked Table -->
            <div class="space-y-2.5">
              <h4 class="text-xs font-semibold text-primary-text uppercase tracking-wider">
                Top Generating Entities
              </h4>
              <div class="rounded-xl border border-primary-border overflow-hidden">
                <table class="w-full text-left text-xs">
                  <thead class="bg-background border-b border-primary-border text-[11px] font-semibold text-secondary-text uppercase">
                    <tr>
                      <th class="px-4 py-2.5">#</th>
                      <th class="px-4 py-2.5">Entity / Partner</th>
                      <th class="px-4 py-2.5">Lots Traded</th>
                      <th class="px-4 py-2.5">Direct $</th>
                      <th class="px-4 py-2.5">Sub-IB $</th>
                      <th class="px-4 py-2.5 text-right">Total Commission</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-primary-border/60">
                    <tr
                      v-for="(row, idx) in topPerformers"
                      :key="idx"
                      class="hover:bg-background/40 transition-colors"
                    >
                      <td class="px-4 py-2.5 font-bold text-secondary-text">{{ idx + 1 }}</td>
                      <td class="px-4 py-2.5">
                        <p class="font-semibold text-primary-text">{{ row.ib_name || row.name || row.symbol || `ID #${row.ib_id || row.user_id}` }}</p>
                        <p v-if="row.ib_email || row.email" class="text-[10px] text-secondary-text font-mono">{{ row.ib_email || row.email }}</p>
                      </td>
                      <td class="px-4 py-2.5 font-mono text-primary-text">{{ formatLots(row.total_lots || row.lots) }}</td>
                      <td class="px-4 py-2.5 font-mono text-secondary-text">{{ formatUSD(row.performance_commission || 0) }}</td>
                      <td class="px-4 py-2.5 font-mono text-secondary-text">{{ formatUSD(row.commission_from_subibs || 0) }}</td>
                      <td class="px-4 py-2.5 font-mono font-bold text-primary-green text-right">{{ formatUSD(row.total_commission || row.commission) }}</td>
                    </tr>
                    <tr v-if="topPerformers.length === 0">
                      <td colspan="6" class="px-4 py-6 text-center text-xs text-secondary-text">
                        No rows available in this period dataset.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
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
