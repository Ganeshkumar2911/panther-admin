<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs cursor-pointer"
        @click="$emit('close')"
      />
    </Transition>

    <!-- Drawer Panel -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-xl bg-card-background border-l border-primary-border flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <!-- Sticky Header -->
        <div class="px-6 py-4.5 border-b border-primary-border flex items-center justify-between shrink-0 bg-card-background/90 backdrop-blur-md">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <UserCheck class="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-primary-text">
                Enrollment Overview #{{ detail?.id || '—' }}
              </h3>
              <p class="text-[11px] text-secondary-text">
                Live balances, active point lots, and recent deal execution audits
              </p>
            </div>
          </div>
          <button
            type="button"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
            @click="$emit('close')"
          >
            <X class="w-4.5 h-4.5" />
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="store.detailLoading" class="flex-1 flex flex-col items-center justify-center p-12 gap-3">
          <Loader2 class="w-7 h-7 text-primary animate-spin" />
          <p class="text-xs text-secondary-text">Loading enrollment metrics and deals...</p>
        </div>

        <!-- Scrollable Content -->
        <div v-else-if="detail" class="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs">
          <!-- Member Identification Header -->
          <div class="p-4 rounded-2xl bg-linear-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex items-center justify-between gap-4">
            <div class="space-y-1">
              <span class="text-[10px] uppercase font-bold text-secondary-text">Member Account</span>
              <h4 class="text-base font-bold text-primary-text font-mono">
                Trading A/C #{{ detail.trading_account_id }}
              </h4>
              <p class="text-[11px] text-secondary-text">User ID: <span class="font-mono text-primary-text font-semibold">#{{ detail.user_id }}</span></p>
            </div>

            <div class="text-right space-y-1">
              <span class="text-[10px] uppercase font-bold text-secondary-text block">Current Tier</span>
              <span class="inline-block px-3 py-1 rounded-lg bg-primary text-white font-bold font-mono text-xs shadow-xs">
                {{ detail.current_tier?.name || detail.current_tier?.code || '—' }}
              </span>
            </div>
          </div>

          <!-- Points & Balances KPI Grid -->
          <div class="grid grid-cols-3 gap-2.5">
            <div class="p-3.5 rounded-xl bg-background/50 border border-primary-border space-y-1">
              <span class="text-[10px] uppercase font-semibold text-primary">Available Pts</span>
              <p class="text-lg font-bold text-primary font-mono">{{ detail.available_points ?? '0.00' }}</p>
            </div>
            <div class="p-3.5 rounded-xl bg-background/50 border border-primary-border space-y-1">
              <span class="text-[10px] uppercase font-semibold text-secondary-text">Lifetime Earned</span>
              <p class="text-lg font-bold text-primary-text font-mono">{{ detail.lifetime_earned_points ?? '0.00' }}</p>
            </div>
            <div class="p-3.5 rounded-xl bg-background/50 border border-primary-border space-y-1">
              <span class="text-[10px] uppercase font-semibold text-secondary-text">Active Lots</span>
              <p class="text-lg font-bold text-primary-text font-mono">{{ detail.summary?.active_point_lots ?? 0 }}</p>
            </div>
          </div>

          <!-- Status & Compliance Grid -->
          <div class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3">
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text">Status & Compliance</span>

            <div class="grid grid-cols-2 gap-3 text-secondary-text">
              <div class="flex items-center justify-between p-2.5 bg-card-background border border-primary-border/60 rounded-lg">
                <span>Enrollment Status:</span>
                <StatusBadge :status="detail.status" />
              </div>

              <div class="flex items-center justify-between p-2.5 bg-card-background border border-primary-border/60 rounded-lg">
                <span>Abuse Status:</span>
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase"
                  :class="detail.abuse_status === 'flagged' ? 'bg-rose-500/10 text-rose-400' : 'bg-primary-green/10 text-primary-green'"
                >
                  {{ detail.abuse_status || 'clear' }}
                </span>
              </div>

              <div class="flex items-center justify-between p-2.5 bg-card-background border border-primary-border/60 rounded-lg">
                <span>Points On Hold:</span>
                <span class="font-mono font-bold text-primary-text">{{ detail.points_on_hold ? 'YES' : 'NO' }}</span>
              </div>

              <div class="flex items-center justify-between p-2.5 bg-card-background border border-primary-border/60 rounded-lg">
                <span>Opted-In At:</span>
                <span class="font-sans text-primary-text">{{ formatDate(detail.opted_in_at) }}</span>
              </div>
            </div>

            <div class="flex items-center justify-between p-2.5 bg-card-background border border-primary-border/60 rounded-lg text-secondary-text">
              <span>Last Qualifying Trade At:</span>
              <span class="font-sans text-primary-text font-medium">{{ formatDate(detail.last_trade_at) }}</span>
            </div>
          </div>

          <!-- Recent Deals Audit -->
          <div class="space-y-2.5">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-primary-text flex items-center gap-1.5">
                <Activity class="w-4 h-4 text-primary" />
                <span>Recent Deals for This Account</span>
              </h4>
              <span class="text-[10px] font-mono text-secondary-text">
                {{ detail.summary?.recent_deals?.length || 0 }} deal(s)
              </span>
            </div>

            <div v-if="detail.summary?.recent_deals && detail.summary.recent_deals.length > 0" class="border border-primary-border rounded-xl overflow-hidden shadow-2xs">
              <table class="w-full text-left text-xs">
                <thead class="bg-background/80 text-secondary-text font-semibold border-b border-primary-border">
                  <tr>
                    <th class="py-2.5 px-3">Deal ID</th>
                    <th class="py-2.5 px-3">Symbol</th>
                    <th class="py-2.5 px-3">Side</th>
                    <th class="py-2.5 px-3">Lots</th>
                    <th class="py-2.5 px-3">Points</th>
                    <th class="py-2.5 px-3">Status</th>
                    <th class="py-2.5 px-3">Close Time</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-primary-border font-mono">
                  <tr v-for="deal in detail.summary.recent_deals" :key="deal.id" class="hover:bg-background/40">
                    <td class="py-2.5 px-3 text-primary-text">#{{ deal.mt5_deal_id || deal.id }}</td>
                    <td class="py-2.5 px-3 font-sans font-bold text-primary-text">{{ deal.symbol }}</td>
                    <td class="py-2.5 px-3 font-sans font-bold" :class="deal.side === 'BUY' ? 'text-primary-green' : 'text-primary-red'">
                      {{ deal.side }}
                    </td>
                    <td class="py-2.5 px-3 text-primary-text">{{ deal.lots }}</td>
                    <td class="py-2.5 px-3 font-bold text-primary">{{ deal.points_awarded }}</td>
                    <td class="py-2.5 px-3 font-sans">
                      <span
                        class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                        :class="deal.eligibility_status === 'awarded' ? 'bg-primary-green/10 text-primary-green' : 'bg-secondary-text/10 text-secondary-text'"
                      >
                        {{ deal.eligibility_status }}
                      </span>
                    </td>
                    <td class="py-2.5 px-3 font-sans text-secondary-text">{{ formatDate(deal.close_time) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="p-6 text-center text-secondary-text bg-background/30 rounded-xl border border-primary-border">
              No recent trade deals recorded for this enrollment.
            </div>
          </div>
        </div>

        <!-- Sticky Footer -->
        <div class="px-6 py-4 border-t border-primary-border flex items-center justify-end bg-card-background shrink-0">
          <button
            type="button"
            class="px-5 py-2.5 rounded-xl border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background font-medium transition cursor-pointer text-xs"
            @click="$emit('close')"
          >
            Close
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { X, Loader2, UserCheck, Activity } from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";
import { formatDate } from "@/utils/timeFormatter";
import StatusBadge from "@/components/common/StatusBadge.vue";

defineProps({
  open: { type: Boolean, default: false },
});

defineEmits(["close"]);
const store = useLoyaltyStore();

const detail = computed(() => store.enrollmentDetail);
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease-out;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>
