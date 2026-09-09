<template>
  <div class="space-y-6">
    <!-- Header & Action -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-base font-semibold text-primary-text">Loyalty Stages & Multipliers</h2>
        <p class="text-xs text-secondary-text">
          Configure stage thresholds, point multipliers, and cash conversion rates.
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
          <span>Add New Tier</span>
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
    <div v-if="store.loading && tiers.length === 0" class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div v-for="n in 5" :key="n" class="h-32 bg-card-background border border-primary-border rounded-xl animate-pulse" />
      </div>
      <div class="h-44 bg-card-background border border-primary-border rounded-xl animate-pulse" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="tiers.length === 0"
      class="flex flex-col items-center justify-center p-12 bg-card-background border border-dashed border-primary-border rounded-xl text-center gap-3"
    >
      <div class="w-12 h-12 rounded-xl bg-card-background border border-primary-border flex items-center justify-center text-secondary-text">
        <Layers class="w-6 h-6 text-primary" />
      </div>
      <div class="space-y-1">
        <h3 class="text-sm font-semibold text-primary-text">No Loyalty Tiers Configured</h3>
        <p class="text-xs text-secondary-text max-w-sm mx-auto">
          Create tiers (Bronze, Silver, Gold, Platinum, Elite) to activate tier multiplier progression.
        </p>
      </div>
      <button
        v-if="hasPermission('loyalty.update')"
        type="button"
        class="mt-2 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
        @click="handleCreate"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Create First Tier</span>
      </button>
    </div>

    <!-- Content: Stage Cards Grid + Data Table -->
    <div v-else class="space-y-6">
      <!-- Visual Stage Cards Progression Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div
          v-for="tier in tiers"
          :key="tier.id"
          class="bg-card-background border border-primary-border rounded-xl p-4 flex flex-col justify-between gap-3 shadow-2xs hover:border-primary/40 transition-colors"
        >
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-medium font-mono px-2 py-0.5 rounded border uppercase bg-primary/10 text-primary border-primary/20">
                {{ tier.code }}
              </span>
              <span class="text-[10px] text-secondary-text">#{{ tier.sort_order }}</span>
            </div>

            <div>
              <h4 class="text-sm font-semibold text-primary-text">{{ tier.name }}</h4>
              <p class="text-[11px] font-mono text-secondary-text mt-0.5">
                {{ tier.min_points }} &ndash; {{ tier.max_points !== null && tier.max_points !== undefined ? `${tier.max_points} pts` : '&infin;' }}
              </p>
            </div>
          </div>

          <div class="pt-2 border-t border-primary-border space-y-1 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-[10px] text-secondary-text">Multiplier:</span>
              <span class="font-semibold text-primary font-mono text-xs">{{ tier.point_multiplier }}&times;</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[10px] text-secondary-text">Cash Rate:</span>
              <span class="font-medium text-primary-text font-mono text-xs">${{ tier.cash_conversion_rate }}/pt</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tiers Table -->
      <div class="bg-card-background border border-primary-border rounded-xl overflow-hidden shadow-2xs">
        <div class="px-4 py-3 border-b border-primary-border flex items-center justify-between bg-background/50">
          <h3 class="text-xs font-semibold text-primary-text uppercase tracking-wider">All Tier Stages ({{ tiers.length }})</h3>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-background/60 text-secondary-text border-b border-primary-border">
              <tr>
                <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Order</th>
                <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Tier Code</th>
                <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Name</th>
                <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Min Points</th>
                <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Max Points</th>
                <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Multiplier</th>
                <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Cash Rate</th>
                <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Status</th>
                <th v-if="hasPermission('loyalty.update')" class="py-2.5 px-4 text-right text-[11px] font-medium uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-primary-border">
              <tr
                v-for="tier in tiers"
                :key="tier.id"
                class="hover:bg-background/40 transition-colors"
              >
                <td class="py-2.5 px-4 text-secondary-text font-mono">#{{ tier.sort_order }}</td>
                <td class="py-2.5 px-4">
                  <span class="px-2 py-0.5 rounded text-[10px] font-medium font-mono uppercase border bg-primary/10 text-primary border-primary/20">
                    {{ tier.code }}
                  </span>
                </td>
                <td class="py-2.5 px-4 font-medium text-primary-text">{{ tier.name }}</td>
                <td class="py-2.5 px-4 text-primary-text font-mono">{{ tier.min_points }}</td>
                <td class="py-2.5 px-4 text-secondary-text font-mono">{{ tier.max_points !== null && tier.max_points !== undefined ? tier.max_points : 'Unlimited' }}</td>
                <td class="py-2.5 px-4 font-semibold text-primary font-mono">{{ tier.point_multiplier }}&times;</td>
                <td class="py-2.5 px-4 text-primary-text font-mono">${{ tier.cash_conversion_rate }}</td>
                <td class="py-2.5 px-4">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-medium uppercase"
                    :class="tier.is_active ? 'bg-primary-green/10 text-primary-green border border-primary-green/20' : 'bg-background text-secondary-text border border-primary-border'"
                  >
                    {{ tier.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td v-if="hasPermission('loyalty.update')" class="py-2.5 px-4 text-right">
                  <button
                    type="button"
                    class="w-7 h-7 inline-flex items-center justify-center rounded-lg border border-primary-border hover:bg-background text-secondary-text hover:text-primary transition cursor-pointer"
                    title="Edit Tier"
                    @click="handleEdit(tier)"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Tier Slide-Over Drawer -->
    <TierDrawer
      :open="isDrawerOpen"
      :tier="selectedTier"
      :programId="programId"
      @close="isDrawerOpen = false"
      @saved="handleRefresh"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { Plus, RefreshCw, Layers, Pencil } from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import TierDrawer from "../components/TierDrawer.vue";

const store = useLoyaltyStore();
const { hasPermission } = usePermissionCheck();

const isDrawerOpen = ref(false);
const selectedTier = ref(null);

const tiers = computed(() => store.tiers || []);
const programId = computed(() => store.program?.id || 1);

const handleCreate = () => {
  selectedTier.value = null;
  isDrawerOpen.value = true;
};

const handleEdit = (tier) => {
  selectedTier.value = tier;
  isDrawerOpen.value = true;
};

const handleRefresh = () => {
  if (programId.value) {
    store.fetchTiers(programId.value);
  }
};
</script>
