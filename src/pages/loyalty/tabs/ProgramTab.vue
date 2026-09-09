<template>
  <div class="space-y-6">
    <!-- Header & Action -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-lg font-bold text-primary-text">
          {{ program?.name || 'PantherTrade Loyalty Program' }}
        </h2>
        <p class="text-xs text-secondary-text">
          Core rules, points calculation multipliers, and cycle timeline.
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          v-if="hasPermission('loyalty.update') && program"
          type="button"
          class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-xs"
          @click="isEditModalOpen = true"
        >
          <Settings class="w-3.5 h-3.5" />
          <span>Edit Program Rules</span>
        </button>

        <button
          type="button"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-primary-text text-xs font-semibold transition cursor-pointer shadow-2xs"
          @click="handleRefresh"
        >
          <RefreshCw class="w-3.5 h-3.5 text-primary" :class="store.loading ? 'animate-spin' : ''" />
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="store.loading && !program" class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <div v-for="n in 6" :key="n" class="h-24 bg-card-background border border-primary-border rounded-2xl animate-pulse" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!program"
      class="flex flex-col items-center justify-center p-12 bg-card-background border border-dashed border-primary-border rounded-2xl text-center gap-3"
    >
      <div class="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
        <Award class="w-6 h-6" />
      </div>
      <p class="text-sm font-bold text-primary-text">No active loyalty program found</p>
      <p class="text-xs text-secondary-text max-w-sm">
        No loyalty program is currently configured or active on this server.
      </p>
    </div>

    <!-- Program Data View -->
    <div v-else class="space-y-6">
      <!-- Metric Cards Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          title="Tiers"
          :value="program.summary?.tiers ?? 0"
          subtext="Progression Stages"
        />
        <MetricCard
          title="Rewards"
          :value="program.summary?.rewards ?? 0"
          subtext="Active Reward Items"
        />
        <MetricCard
          title="Enrollments"
          :value="program.summary?.enrollments ?? 0"
          subtext="Enrolled Accounts"
        />
        <MetricCard
          title="Base Earn Rate"
          :value="`${program.base_points_per_lot ?? '5.00'} pts`"
          subtext="Per Standard Lot"
        />
        <MetricCard
          title="Min Redemption"
          :value="`${program.min_redemption_points ?? '100'} pts`"
          subtext="Threshold to Claim"
        />
        <MetricCard
          title="Point Validity"
          :value="`${program.point_validity_days ?? 180} days`"
          subtext="6-Month Expiry Window"
        />
      </div>

      <!-- Main Config Cards Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4.5">
        <!-- Program Rules & Durations -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-5 space-y-4 shadow-2xs">
          <div class="flex items-center justify-between pb-3 border-b border-primary-border/60">
            <h3 class="text-sm font-bold text-primary-text flex items-center gap-2">
              <ShieldCheck class="w-4 h-4 text-primary" />
              <span>Program Parameters & Rules</span>
            </h3>
            <span
              class="text-[10px] font-bold uppercase font-mono px-2.5 py-0.5 rounded-md border tracking-wider"
              :class="program.status === 'active' ? 'bg-primary-green/10 text-primary-green border-primary-green/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'"
            >
              {{ program.status }}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div class="p-3 bg-background/50 border border-primary-border rounded-xl space-y-1">
              <span class="text-[10px] uppercase font-semibold text-secondary-text">Min Trade Duration</span>
              <p class="font-bold text-primary-text font-mono">{{ program.min_trade_duration_seconds ?? 120 }} seconds (2 mins)</p>
            </div>

            <div class="p-3 bg-background/50 border border-primary-border rounded-xl space-y-1">
              <span class="text-[10px] uppercase font-semibold text-secondary-text">Tier Qualification Window</span>
              <p class="font-bold text-primary-text font-mono">{{ program.tier_window_days ?? 90 }} days (rolling)</p>
            </div>

            <div class="p-3 bg-background/50 border border-primary-border rounded-xl space-y-1">
              <span class="text-[10px] uppercase font-semibold text-secondary-text">Downgrade Grace Period</span>
              <p class="font-bold text-primary-text font-mono">{{ program.grace_period_days ?? 14 }} days</p>
            </div>

            <div class="p-3 bg-background/50 border border-primary-border rounded-xl space-y-1">
              <span class="text-[10px] uppercase font-semibold text-secondary-text">Dormant Account Expiry</span>
              <p class="font-bold text-primary-text font-mono">{{ program.dormant_days ?? 90 }} consecutive days</p>
            </div>

            <div class="p-3 bg-background/50 border border-primary-border rounded-xl space-y-1">
              <span class="text-[10px] uppercase font-semibold text-secondary-text">Terms Version</span>
              <p class="font-bold text-primary-text font-mono">v{{ program.terms_version || '1.0' }}</p>
            </div>

            <div class="p-3 bg-background/50 border border-primary-border rounded-xl space-y-1">
              <span class="text-[10px] uppercase font-semibold text-secondary-text">Carry Over Enrollments</span>
              <p class="font-bold text-primary-text font-mono">{{ program.carry_over_enrollments ? 'Enabled' : 'Disabled' }}</p>
            </div>
          </div>
        </div>

        <!-- Cycle Timelines & Lifecycle -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-5 space-y-4 shadow-2xs">
          <div class="flex items-center justify-between pb-3 border-b border-primary-border/60">
            <h3 class="text-sm font-bold text-primary-text flex items-center gap-2">
              <Calendar class="w-4 h-4 text-primary" />
              <span>Cycle Timeline & Lifespan</span>
            </h3>
            <span class="text-[10px] font-mono text-secondary-text">ID #{{ program.id }}</span>
          </div>

          <div class="space-y-3 text-xs">
            <div class="flex items-center justify-between p-3 bg-background/50 border border-primary-border rounded-xl">
              <span class="text-secondary-text">Programme Start Date:</span>
              <span class="font-bold font-mono text-primary-text">{{ formatDate(program.start_at) }}</span>
            </div>

            <div class="flex items-center justify-between p-3 bg-background/50 border border-primary-border rounded-xl">
              <span class="text-secondary-text">Programme End Date:</span>
              <span class="font-bold font-mono text-primary-text">{{ formatDate(program.end_at) }}</span>
            </div>

            <div class="flex items-center justify-between p-3 bg-background/50 border border-primary-border rounded-xl">
              <span class="text-secondary-text">Created At:</span>
              <span class="font-mono text-secondary-text">{{ formatDate(program.created_at) }}</span>
            </div>

            <div class="flex items-center justify-between p-3 bg-background/50 border border-primary-border rounded-xl">
              <span class="text-secondary-text">Last Updated:</span>
              <span class="font-mono text-secondary-text">{{ formatDate(program.updated_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Program Modal -->
    <EditProgramModal
      :open="isEditModalOpen"
      :program="program"
      @close="isEditModalOpen = false"
      @saved="handleRefresh"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  Award,
  Settings,
  RefreshCw,
  ShieldCheck,
  Calendar,
} from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import { formatDate } from "@/utils/timeFormatter";
import MetricCard from "@/components/common/MetricCard.vue";
import EditProgramModal from "../components/EditProgramModal.vue";

const store = useLoyaltyStore();
const { hasPermission } = usePermissionCheck();

const isEditModalOpen = ref(false);
const program = computed(() => store.program);

const handleRefresh = () => {
  store.fetchProgram(program.value?.id);
};
</script>
