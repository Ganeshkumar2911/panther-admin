<template>
  <div class="space-y-6">
    <!-- Header & Action -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-base font-semibold text-primary-text">Reward Store & Catalogue</h2>
        <p class="text-xs text-secondary-text">
          Redemption items including cash credit, bonus funds, VPS hosting, merchandise, and tier boosts.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="hasPermission('loyalty.update')"
          type="button"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs"
          @click="handleCreate"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Add New Reward</span>
        </button>

        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-secondary-text hover:text-primary-text text-xs font-medium transition cursor-pointer"
          @click="handleRefresh"
        >
          <RefreshCw class="w-3.5 h-3.5 text-primary" :class="store.loading ? 'animate-spin' : ''" />
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="store.loading && rewards.length === 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="n in 6" :key="n" class="h-44 bg-card-background border border-primary-border rounded-lg animate-pulse" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="rewards.length === 0"
      class="flex flex-col items-center justify-center p-12 bg-card-background border border-dashed border-primary-border rounded-lg text-center gap-3"
    >
      <div class="w-12 h-12 rounded-lg bg-card-background border border-primary-border flex items-center justify-center text-secondary-text">
        <Gift class="w-6 h-6 text-primary" />
      </div>
      <div class="space-y-1">
        <h3 class="text-sm font-semibold text-primary-text">No Reward Items Found</h3>
        <p class="text-xs text-secondary-text max-w-sm mx-auto">
          Add rewards to allow active traders to redeem accumulated points.
        </p>
      </div>
      <button
        v-if="hasPermission('loyalty.update')"
        type="button"
        class="mt-2 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
        @click="handleCreate"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Create First Reward</span>
      </button>
    </div>

    <!-- Rewards Grid (Rendered directly from API) -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="reward in rewards"
        :key="reward.id"
        class="bg-card-background border border-primary-border rounded-lg p-4 flex flex-col justify-between gap-3 shadow-2xs hover:border-primary/40 transition-colors"
      >
        <div class="space-y-3">
          <!-- Card Header -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex flex-wrap items-center gap-1.5">
              <span
                class="text-[10px] font-medium font-mono px-2 py-0.5 rounded border uppercase"
                :class="getRewardTypeBadgeClass(reward.type)"
              >
                {{ formatTypeLabel(reward.type) }}
              </span>
              <span
                class="text-[10px] font-medium px-2 py-0.5 rounded border"
                :class="reward.is_active ? 'bg-primary-green/10 text-primary-green border-primary-green/20' : 'bg-background text-secondary-text border-primary-border'"
              >
                {{ reward.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>

            <!-- Action Edit -->
            <button
              v-if="hasPermission('loyalty.update')"
              type="button"
              class="w-7 h-7 flex items-center justify-center rounded-lg border border-primary-border hover:bg-background text-secondary-text hover:text-primary transition cursor-pointer shrink-0"
              title="Edit Reward"
              @click="handleEdit(reward)"
            >
              <Pencil class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Title & Description -->
          <div class="space-y-1">
            <h3 class="text-xs font-semibold text-primary-text leading-snug">{{ reward.title }}</h3>
            <p class="text-xs text-secondary-text line-clamp-2 leading-relaxed">
              {{ reward.description || '—' }}
            </p>
          </div>

          <!-- Specs Matrix -->
          <div class="grid grid-cols-2 gap-2 pt-2 border-t border-primary-border text-xs">
            <div class="p-2 bg-background/50 border border-primary-border rounded-lg space-y-0.5">
              <span class="text-[10px] uppercase text-secondary-text font-medium">Redemption Cost</span>
              <p class="font-semibold text-primary font-mono text-xs">
                {{ reward.points_cost !== null && reward.points_cost !== undefined ? `${reward.points_cost} pts` : 'Variable' }}
              </p>
            </div>

            <div class="p-2 bg-background/50 border border-primary-border rounded-lg space-y-0.5">
              <span class="text-[10px] uppercase text-secondary-text font-medium">Required Tier</span>
              <p class="font-medium text-primary-text text-xs truncate">
                {{ getTierName(reward.min_tier_id) }}
              </p>
            </div>

            <div class="p-2 bg-background/50 border border-primary-border rounded-lg space-y-0.5">
              <span class="text-[10px] uppercase text-secondary-text font-medium">Stock Qty</span>
              <p class="font-medium text-primary-text text-xs">
                {{ reward.stock_qty ?? 'Unlimited' }}
              </p>
            </div>

            <div class="p-2 bg-background/50 border border-primary-border rounded-lg space-y-0.5">
              <span class="text-[10px] uppercase text-secondary-text font-medium">Max Per Client</span>
              <p class="font-medium text-primary-text text-xs">
                {{ reward.max_per_user ?? 'Unlimited' }}
              </p>
            </div>
          </div>
        </div>

        <div class="pt-2 border-t border-primary-border flex items-center justify-between text-[10px] text-secondary-text">
          <span>Sort Order #{{ reward.sort_order }}</span>
          <span>ID #{{ reward.id }}</span>
        </div>
      </div>
    </div>

    <!-- Reward Slide-Over Drawer -->
    <RewardDrawer
      :open="isDrawerOpen"
      :reward="selectedReward"
      :tiers="tiers"
      :programId="programId"
      @close="isDrawerOpen = false"
      @saved="handleRefresh"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { Plus, RefreshCw, Gift, Pencil } from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import RewardDrawer from "../components/RewardDrawer.vue";

const store = useLoyaltyStore();
const { hasPermission } = usePermissionCheck();

const isDrawerOpen = ref(false);
const selectedReward = ref(null);

const rewards = computed(() => store.rewards || []);
const tiers = computed(() => store.tiers || []);
const programId = computed(() => store.program?.id || 1);

const handleCreate = () => {
  selectedReward.value = null;
  isDrawerOpen.value = true;
};

const handleEdit = (reward) => {
  selectedReward.value = reward;
  isDrawerOpen.value = true;
};

const handleRefresh = () => {
  if (programId.value) {
    store.fetchRewards(programId.value);
  }
};

const getTierName = (tierId) => {
  if (!tierId) return "All Tiers";
  const matched = tiers.value.find((t) => t.id === tierId);
  return matched ? `${matched.name} (${matched.code})` : `Tier #${tierId}`;
};

const formatTypeLabel = (type) => {
  switch (type?.toLowerCase()) {
    case "bonus_funds":
      return "Bonus Funds";
    case "tier_boost":
      return "Tier Boost";
    case "vps":
      return "VPS Hosting";
    case "cash":
      return "Cash Credit";
    case "merchandise":
      return "Merchandise";
    default:
      return type || "Reward";
  }
};

const getRewardTypeBadgeClass = (type) => {
  switch (type?.toLowerCase()) {
    case "cash":
      return "bg-primary-green/10 text-primary-green border-primary-green/20";
    case "bonus_funds":
      return "bg-primary/10 text-primary border-primary/20";
    case "vps":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "merchandise":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "tier_boost":
      return "bg-primary/10 text-primary border-primary/20";
    default:
      return "bg-background text-secondary-text border-primary-border";
  }
};
</script>
