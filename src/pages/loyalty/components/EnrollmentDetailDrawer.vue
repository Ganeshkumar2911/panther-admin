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
                Live balances, multi-account memberships, and recent deals audit
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
          <p class="text-xs text-secondary-text">Loading enrollment metrics and accounts...</p>
        </div>

        <!-- Scrollable Content -->
        <div v-else-if="detail" class="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs">
          <!-- Member Identification Header -->
          <div
            class="p-4 rounded-2xl border flex items-center justify-between gap-4"
            :style="detail.current_tier?.color ? {
              background: `linear-gradient(to right, ${detail.current_tier.color}15, ${detail.current_tier.color}08, transparent)`,
              borderColor: `${detail.current_tier.color}35`
            } : {}"
            :class="!detail.current_tier?.color ? 'bg-linear-to-r from-primary/10 via-primary/5 to-transparent border-primary/20' : ''"
          >
            <div class="space-y-1">
              <span class="text-[10px] uppercase font-bold text-secondary-text">Primary Trading Account</span>
              <h4 class="text-base font-bold text-primary-text font-mono">
                Trading A/C #{{ detail.trading_account_id }}
              </h4>
              <p class="text-[11px] text-secondary-text">User ID: <span class="font-mono text-primary-text font-semibold">#{{ detail.user_id }}</span></p>
            </div>

            <div class="text-right space-y-1">
              <span class="text-[10px] uppercase font-bold text-secondary-text block">Current Tier</span>
              <span
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold font-mono text-xs shadow-xs text-white"
                :style="detail.current_tier?.color ? { backgroundColor: detail.current_tier.color } : {}"
                :class="!detail.current_tier?.color ? 'bg-primary' : ''"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-white/80 shrink-0" />
                <span>{{ detail.current_tier?.name || detail.current_tier?.code || '—' }}</span>
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

          <!-- Attached Trading Accounts Membership (Multi-Account) -->
          <div class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text flex items-center gap-1.5">
                <LinkIcon class="w-3.5 h-3.5 text-primary" />
                Linked Trading Accounts ({{ attachedAccounts.length }})
              </span>

              <button
                v-if="hasPermission('loyalty.enroll') && !isAttaching"
                type="button"
                class="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-[11px] transition cursor-pointer border border-primary/20"
                @click="isAttaching = true"
              >
                <Plus class="w-3 h-3" />
                <span>Attach Account</span>
              </button>
            </div>

            <!-- Inline Attach Account Form -->
            <div v-if="isAttaching" class="p-3 bg-card-background border border-primary-border rounded-xl space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="font-semibold text-primary-text text-[11px]">Attach Trading Account to Enrollment</span>
                <button
                  type="button"
                  class="text-secondary-text hover:text-primary-text text-xs"
                  @click="isAttaching = false"
                >
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  v-model.number="attachForm.trading_account_id"
                  type="number"
                  placeholder="Trading A/C ID..."
                  class="px-3 py-1.5 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary font-mono text-xs"
                />

                <label class="flex items-center gap-2 text-[11px] text-secondary-text cursor-pointer select-none">
                  <input
                    v-model="attachForm.set_primary"
                    type="checkbox"
                    class="w-3.5 h-3.5 rounded text-primary border-primary-border cursor-pointer"
                  />
                  <span>Set as Primary</span>
                </label>
              </div>

              <div class="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  class="px-2.5 py-1 rounded-lg border border-primary-border text-secondary-text hover:bg-background text-xs"
                  @click="isAttaching = false"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  :disabled="!attachForm.trading_account_id || store.actionLoading"
                  class="px-3 py-1 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-xs disabled:opacity-50 flex items-center gap-1"
                  @click="handleAttachSubmit"
                >
                  <Loader2 v-if="store.actionLoading" class="w-3 h-3 animate-spin" />
                  <span>Attach</span>
                </button>
              </div>
            </div>

            <!-- Accounts List -->
            <div class="space-y-1.5">
              <div
                v-for="acctId in attachedAccounts"
                :key="acctId"
                class="flex items-center justify-between p-2.5 bg-card-background border border-primary-border rounded-lg"
              >
                <div class="flex items-center gap-2">
                  <span class="font-mono font-bold text-primary text-xs">Trading A/C #{{ acctId }}</span>
                  <span
                    v-if="acctId === detail.trading_account_id"
                    class="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-primary-green/10 text-primary-green border border-primary-green/20"
                  >
                    Primary
                  </span>
                </div>

                <!-- Detach Action -->
                <button
                  v-if="hasPermission('loyalty.enroll') && attachedAccounts.length > 1"
                  type="button"
                  class="text-[11px] text-rose-400 hover:text-rose-300 hover:underline cursor-pointer disabled:opacity-50"
                  :disabled="store.actionLoading"
                  @click="handleDetachAccount(acctId)"
                >
                  Detach
                </button>
              </div>
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
              <span>Last Qualifying Trade:</span>
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
import { ref, reactive, computed } from "vue";
import { X, Loader2, UserCheck, Activity, Link as LinkIcon, Plus } from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import { formatDate } from "@/utils/timeFormatter";
import StatusBadge from "@/components/common/StatusBadge.vue";

defineProps({
  open: { type: Boolean, default: false },
});

defineEmits(["close"]);
const store = useLoyaltyStore();
const { hasPermission } = usePermissionCheck();

const isAttaching = ref(false);
const attachForm = reactive({
  trading_account_id: "",
  set_primary: false,
});

const detail = computed(() => store.enrollmentDetail);

const attachedAccounts = computed(() => {
  if (Array.isArray(detail.value?.trading_account_ids) && detail.value.trading_account_ids.length > 0) {
    return detail.value.trading_account_ids;
  }
  if (detail.value?.trading_account_id) {
    return [detail.value.trading_account_id];
  }
  return [];
});

const handleAttachSubmit = async () => {
  if (!detail.value?.id || !attachForm.trading_account_id) return;
  await store.attachAccountToEnrollment(detail.value.id, {
    trading_account_id: Number(attachForm.trading_account_id),
    set_primary: Boolean(attachForm.set_primary),
  });
  attachForm.trading_account_id = "";
  attachForm.set_primary = false;
  isAttaching.value = false;
};

const handleDetachAccount = async (accountId) => {
  if (!detail.value?.id || !accountId) return;
  await store.detachAccountFromEnrollment(detail.value.id, accountId);
};
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
