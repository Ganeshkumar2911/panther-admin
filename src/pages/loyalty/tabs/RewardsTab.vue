<template>
  <div class="space-y-6">
    <!-- Header & Action -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-lg font-bold text-primary-text">Rewards & Catalog</h2>
        <p class="text-xs text-secondary-text">
          Redemption items including cash credit, bonus funds, VPS hosting, merchandise, and boosts.
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          v-if="hasPermission('loyalty.update')"
          type="button"
          class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-xs"
          @click="handleCreate"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Add New Reward</span>
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
    <div v-if="store.loading && rewards.length === 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="n in 6" :key="n" class="h-44 bg-card-background border border-primary-border rounded-2xl animate-pulse" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="rewards.length === 0"
      class="flex flex-col items-center justify-center p-12 bg-card-background border border-dashed border-primary-border rounded-2xl text-center gap-3"
    >
      <div class="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
        <Gift class="w-6 h-6" />
      </div>
      <p class="text-sm font-bold text-primary-text">No reward items created</p>
      <p class="text-xs text-secondary-text max-w-sm">
        Add catalog rewards such as cash credits, deposit bonus funds, VPS access, or merchandise items.
      </p>
      <button
        v-if="hasPermission('loyalty.update')"
        type="button"
        class="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition cursor-pointer shadow-xs"
        @click="handleCreate"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Create First Reward</span>
      </button>
    </div>

    <!-- Rewards Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
      <div
        v-for="reward in rewards"
        :key="reward.id"
        class="bg-card-background border border-primary-border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-200 group relative shadow-2xs hover:shadow-md"
      >
        <div class="space-y-3">
          <!-- Card Header -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex flex-wrap items-center gap-1.5">
              <span
                class="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md border uppercase tracking-wider"
                :class="getRewardTypeBadgeClass(reward.type)"
              >
                {{ reward.type }}
              </span>
              <span
                class="text-[9px] font-bold px-1.5 py-0.5 rounded-md border"
                :class="reward.is_active ? 'bg-primary-green/10 text-primary-green border-primary-green/20' : 'bg-secondary-text/10 text-secondary-text border-primary-border'"
              >
                {{ reward.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>

            <!-- Edit button -->
            <button
              v-if="hasPermission('loyalty.update')"
              type="button"
              class="w-7 h-7 flex items-center justify-center rounded-lg bg-background border border-primary-border hover:border-primary/40 text-secondary-text hover:text-primary transition cursor-pointer shadow-2xs shrink-0"
              title="Edit Reward"
              @click="handleEdit(reward)"
            >
              <Pencil class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Title & Description -->
          <div>
            <h3 class="text-sm font-bold text-primary-text">{{ reward.title }}</h3>
            <p class="text-xs text-secondary-text mt-1 line-clamp-2">
              {{ reward.description || 'No description provided.' }}
            </p>
          </div>

          <!-- Key Details Grid -->
          <div class="grid grid-cols-2 gap-2 pt-2 border-t border-primary-border/60 text-xs">
            <div class="p-2 bg-background/50 border border-primary-border/60 rounded-xl space-y-0.5">
              <span class="text-[9px] uppercase text-secondary-text font-semibold">Cost</span>
              <p class="font-bold text-primary font-mono text-[11px]">
                {{ reward.points_cost !== null && reward.points_cost !== undefined ? `${reward.points_cost} pts` : 'Variable' }}
              </p>
            </div>

            <div class="p-2 bg-background/50 border border-primary-border/60 rounded-xl space-y-0.5">
              <span class="text-[9px] uppercase text-secondary-text font-semibold">Min Tier</span>
              <p class="font-bold text-primary-text font-mono text-[11px]">
                {{ getTierName(reward.min_tier_id) }}
              </p>
            </div>

            <div class="p-2 bg-background/50 border border-primary-border/60 rounded-xl space-y-0.5">
              <span class="text-[9px] uppercase text-secondary-text font-semibold">Stock Qty</span>
              <p class="font-bold text-primary-text font-mono text-[11px]">
                {{ reward.stock_qty ?? 'Unlimited' }}
              </p>
            </div>

            <div class="p-2 bg-background/50 border border-primary-border/60 rounded-xl space-y-0.5">
              <span class="text-[9px] uppercase text-secondary-text font-semibold">Max Per User</span>
              <p class="font-bold text-primary-text font-mono text-[11px]">
                {{ reward.max_per_user ?? 'Unlimited' }}
              </p>
            </div>
          </div>
        </div>

        <div class="pt-2 border-t border-primary-border/40 flex items-center justify-between text-[10px] text-secondary-text">
          <span class="font-mono">Order #{{ reward.sort_order }}</span>
          <span class="font-mono">ID #{{ reward.id }}</span>
        </div>
      </div>
    </div>

    <!-- Reward Modal -->
    <RewardModal
      :open="isModalOpen"
      :reward="selectedReward"
      :tiers="tiers"
      :programId="programId"
      @close="isModalOpen = false"
      @saved="handleRefresh"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { Plus, RefreshCw, Gift, Pencil } from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import RewardModal from "../components/RewardModal.vue";

const store = useLoyaltyStore();
const { hasPermission } = usePermissionCheck();

const isModalOpen = ref(false);
const selectedReward = ref(null);

const rewards = computed(() => store.rewards || []);
const tiers = computed(() => store.tiers || []);
const programId = computed(() => store.program?.id || 1);

const handleCreate = () => {
  selectedReward.value = null;
  isModalOpen.value = true;
};

const handleEdit = (reward) => {
  selectedReward.value = reward;
  isModalOpen.value = true;
};

const handleRefresh = () => {
  if (programId.value) {
    store.fetchRewards(programId.value);
  }
};

const getTierName = (tierId) => {
  if (!tierId) return "All Tiers";
  const matched = tiers.value.find((t) => t.id === tierId);
  return matched ? matched.name : `Tier #${tierId}`;
};

const getRewardTypeBadgeClass = (type) => {
  switch (type?.toLowerCase()) {
    case "cash":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "bonus_funds":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "vps":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "merchandise":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "tier_boost":
      return "bg-primary/10 text-primary border-primary/20";
    default:
      return "bg-secondary-text/10 text-secondary-text border-primary-border";
  }
};
</script>
