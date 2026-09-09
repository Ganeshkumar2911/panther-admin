<template>
  <div class="space-y-6">
    <!-- Header Banner -->
       <div
      v-if="program"
      class="relative overflow-hidden bg-card-background border border-primary-border rounded-2xl p-6  flex flex-wrap items-center justify-between gap-4 group"
    >
      <div class="absolute inset-0 bg-linear-to-r from-primary/10 via-transparent to-transparent pointer-events-none" />
      <div class="absolute top-0 right-0 w-64 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div class="relative space-y-1.5 z-10">
        <div class="flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase font-mono px-2.5 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20">
            <Sparkles class="w-3 h-3" />
            <span>Active Programme Cycle</span>
          </span>
          <span
            class="text-[10px] font-bold uppercase font-mono px-2.5 py-0.5 rounded-full border flex items-center gap-1.5"
            :class="program.status === 'active' ? 'bg-primary-green/10 text-primary-green border-primary-green/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="program.status === 'active' ? 'bg-primary-green animate-ping' : 'bg-amber-500'" />
            <span>{{ program.status }}</span>
          </span>
          <span class="text-[10px] font-mono text-secondary-text">ID #{{ program.id }}</span>
        </div>

        <h2 class="text-xl font-bold text-primary-text tracking-tight">
          {{ program.name || 'PantherTrade Loyalty Program' }}
        </h2>
        <p class="text-xs text-secondary-text max-w-xl">
          Point accumulation engine converting live trading volume into reward stages, tier multipliers, and merchandise claims.
        </p>
      </div>

      <div class="relative z-10 flex items-center gap-2.5 ml-auto">
        <button
          v-if="hasPermission('loyalty.update')"
          type="button"
          class="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer "
          @click="isEditDrawerOpen = true"
        >
          <SlidersHorizontal class="w-3.5 h-3.5" />
          <span>Edit Program Rules</span>
        </button>

        <button
          type="button"
          class="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-primary-border bg-card-background hover:bg-background text-primary-text text-xs font-semibold transition cursor-pointer "
          @click="handleRefresh"
        >
          <RefreshCw class="w-3.5 h-3.5 text-primary" :class="store.loading ? 'animate-spin' : ''" />
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Skeleton Loading -->
    <div v-if="store.loading && !program" class="space-y-4">
      <div class="h-28 bg-card-background border border-primary-border rounded-lg animate-pulse" />
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div v-for="n in 6" :key="n" class="h-20 bg-card-background border border-primary-border rounded-lg animate-pulse" />
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!program"
      class="flex flex-col items-center justify-center p-12 bg-card-background border border-dashed border-primary-border rounded-lg text-center gap-3"
    >
      <div class="w-12 h-12 rounded-lg bg-card-background border border-primary-border flex items-center justify-center text-secondary-text">
        <Award class="w-6 h-6 text-primary" />
      </div>
      <div class="space-y-1">
        <h3 class="text-sm font-semibold text-primary-text">No Active Loyalty Program</h3>
        <p class="text-xs text-secondary-text max-w-sm mx-auto">
          No loyalty program configuration was found on this server.
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="space-y-6">
      <!-- 6-Card High Fidelity KPI Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          title="Tiers"
          :value="program.summary?.tiers ?? 0"
          subtext="Progression Stages"
        />
        <MetricCard
          title="Rewards"
          :value="program.summary?.rewards ?? 0"
          subtext="Redemption Items"
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
          subtext="Minimum Claim"
        />
        <MetricCard
          title="Point Validity"
          :value="`${program.point_validity_days ?? 180} days`"
          subtext="Validity Period"
        />
      </div>

      <!-- Main Specifications & Policy Sections -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Card 1: Core Trade & Tier Policy -->
        <div class="bg-card-background border border-primary-border rounded-lg p-4.5 space-y-4 ">
          <div class="flex items-center justify-between pb-3 border-b border-primary-border">
            <h3 class="text-xs font-semibold text-primary-text flex items-center gap-2">
              <ShieldCheck class="w-4 h-4 text-primary" />
              <span>Core Program Rules & Thresholds</span>
            </h3>
            <span class="text-[10px] text-secondary-text">Terms v{{ program.terms_version || '1.0' }}</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div class="p-3 bg-background/50 border border-primary-border rounded-lg space-y-1">
              <span class="text-[10px] uppercase font-medium text-secondary-text flex items-center gap-1">
                <Clock class="w-3 h-3 text-primary" />
                Min Trade Duration
              </span>
              <p class="font-medium text-primary-text font-mono text-sm">
                {{ program.min_trade_duration_seconds ?? 120 }}s <span class="text-[11px] font-sans font-normal text-secondary-text">(2 mins)</span>
              </p>
              <p class="text-[10px] text-secondary-text">Trades closed &le; 2 mins excluded</p>
            </div>

            <div class="p-3 bg-background/50 border border-primary-border rounded-lg space-y-1">
              <span class="text-[10px] uppercase font-medium text-secondary-text flex items-center gap-1">
                <Calendar class="w-3 h-3 text-primary" />
                Tier Rolling Window
              </span>
              <p class="font-medium text-primary-text font-mono text-sm">
                {{ program.tier_window_days ?? 90 }} days
              </p>
              <p class="text-[10px] text-secondary-text">Qualification volume window</p>
            </div>

            <div class="p-3 bg-background/50 border border-primary-border rounded-lg space-y-1">
              <span class="text-[10px] uppercase font-medium text-secondary-text flex items-center gap-1">
                <ShieldAlert class="w-3 h-3 text-amber-500" />
                Downgrade Grace Period
              </span>
              <p class="font-medium text-primary-text font-mono text-sm">
                {{ program.grace_period_days ?? 14 }} days
              </p>
              <p class="text-[10px] text-secondary-text">Buffer before tier downgrade</p>
            </div>

            <div class="p-3 bg-background/50 border border-primary-border rounded-lg space-y-1">
              <span class="text-[10px] uppercase font-medium text-secondary-text flex items-center gap-1">
                <Hourglass class="w-3 h-3 text-rose-400" />
                Dormancy Expiry Rule
              </span>
              <p class="font-medium text-primary-text font-mono text-sm">
                {{ program.dormant_days ?? 90 }} days
              </p>
              <p class="text-[10px] text-secondary-text">Inactive accounts forfeit points</p>
            </div>
          </div>

          <!-- Carry Over Status -->
          <div class="flex items-center justify-between p-3 bg-background/40 border border-primary-border rounded-lg text-xs">
            <div>
              <p class="font-medium text-primary-text">Enrollment Carry-Over</p>
              <p class="text-[10px] text-secondary-text">Carry over enrolled accounts to subsequent cycles</p>
            </div>
            <span
              class="px-2 py-0.5 rounded text-[10px] font-medium uppercase"
              :class="program.carry_over_enrollments ? 'bg-primary-green/10 text-primary-green border border-primary-green/20' : 'bg-background text-secondary-text border border-primary-border'"
            >
              {{ program.carry_over_enrollments ? 'Enabled' : 'Disabled' }}
            </span>
          </div>
        </div>

        <!-- Card 2: Cycle Timelines & Lifecycle -->
        <div class="bg-card-background border border-primary-border rounded-lg p-4.5 space-y-4 ">
          <div class="flex items-center justify-between pb-3 border-b border-primary-border">
            <h3 class="text-xs font-semibold text-primary-text flex items-center gap-2">
              <Calendar class="w-4 h-4 text-primary" />
              <span>Cycle Lifespan & Schedule</span>
            </h3>
            <span class="text-[10px] text-secondary-text">FIFO Points Expiry</span>
          </div>

          <div class="space-y-3 text-xs">
            <div class="flex items-center justify-between p-3 bg-background/50 border border-primary-border rounded-lg">
              <div>
                <span class="text-[10px] uppercase font-medium text-secondary-text block">Programme Start Date</span>
                <span class="font-medium font-mono text-primary-text text-sm">{{ formatDate(program.start_at) }}</span>
              </div>
              <span class="text-[10px] text-secondary-text">Points track begins</span>
            </div>

            <div class="flex items-center justify-between p-3 bg-background/50 border border-primary-border rounded-lg">
              <div>
                <span class="text-[10px] uppercase font-medium text-secondary-text block">Programme End Date</span>
                <span class="font-medium font-mono text-primary-text text-sm">{{ formatDate(program.end_at) }}</span>
              </div>
              <span class="text-[10px] text-secondary-text">Cycle closes</span>
            </div>

            <div class="grid grid-cols-2 gap-3 pt-1">
              <div class="p-2.5 bg-background/30 border border-primary-border rounded-lg space-y-0.5">
                <span class="text-[10px] uppercase font-medium text-secondary-text">Created At</span>
                <p class="text-primary-text text-[11px] truncate">{{ formatDate(program.created_at) }}</p>
              </div>

              <div class="p-2.5 bg-background/30 border border-primary-border rounded-lg space-y-0.5">
                <span class="text-[10px] uppercase font-medium text-secondary-text">Last Updated</span>
                <p class="text-primary-text text-[11px] truncate">{{ formatDate(program.updated_at) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Program Slide-Over Drawer -->
    <EditProgramDrawer
      :open="isEditDrawerOpen"
      :program="program"
      @close="isEditDrawerOpen = false"
      @saved="handleRefresh"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  Award,
  RefreshCw,
  ShieldCheck,
  Calendar,
  Clock,
  ShieldAlert,
  Hourglass,
  SlidersHorizontal,
} from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import { formatDate } from "@/utils/timeFormatter";
import MetricCard from "@/components/common/MetricCard.vue";
import EditProgramDrawer from "../components/EditProgramDrawer.vue";

const store = useLoyaltyStore();
const { hasPermission } = usePermissionCheck();

const isEditDrawerOpen = ref(false);
const program = computed(() => store.program);

const handleRefresh = () => {
  store.fetchProgram(program.value?.id);
};
</script>
