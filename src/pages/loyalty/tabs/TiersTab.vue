<template>
  <div class="space-y-6">
    <!-- Header & Action -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-lg font-bold text-primary-text">Loyalty Tiers & Multipliers</h2>
        <p class="text-xs text-secondary-text">
          Configure stage thresholds, point multipliers, and cash conversion rates.
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
          <span>Add New Tier</span>
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
    <div v-if="store.loading && tiers.length === 0" class="space-y-2">
      <div v-for="n in 5" :key="n" class="h-14 bg-card-background border border-primary-border rounded-xl animate-pulse" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="tiers.length === 0"
      class="flex flex-col items-center justify-center p-12 bg-card-background border border-dashed border-primary-border rounded-2xl text-center gap-3"
    >
      <div class="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
        <Layers class="w-6 h-6" />
      </div>
      <p class="text-sm font-bold text-primary-text">No loyalty tiers configured</p>
      <p class="text-xs text-secondary-text max-w-sm">
        Create tiers (e.g. Bronze, Silver, Gold, Platinum, Elite) to enable tier-based point multiplier progression.
      </p>
      <button
        v-if="hasPermission('loyalty.update')"
        type="button"
        class="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition cursor-pointer shadow-xs"
        @click="handleCreate"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Create First Tier</span>
      </button>
    </div>

    <!-- Tiers Table -->
    <div v-else class="bg-card-background border border-primary-border rounded-2xl overflow-hidden shadow-2xs">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-background/80 text-secondary-text font-semibold border-b border-primary-border">
            <tr>
              <th class="py-3 px-4">Order</th>
              <th class="py-3 px-4">Tier Code</th>
              <th class="py-3 px-4">Name</th>
              <th class="py-3 px-4">Min Points</th>
              <th class="py-3 px-4">Max Points</th>
              <th class="py-3 px-4">Multiplier</th>
              <th class="py-3 px-4">Cash Rate ($/pt)</th>
              <th class="py-3 px-4">Status</th>
              <th v-if="hasPermission('loyalty.update')" class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-primary-border">
            <tr
              v-for="tier in tiers"
              :key="tier.id"
              class="hover:bg-background/40 transition-colors"
            >
              <td class="py-3 px-4 font-mono font-bold text-secondary-text">#{{ tier.sort_order }}</td>
              <td class="py-3 px-4">
                <span class="px-2.5 py-0.5 rounded-md font-bold font-mono text-[10px] tracking-wider uppercase border bg-primary/10 text-primary border-primary/20">
                  {{ tier.code }}
                </span>
              </td>
              <td class="py-3 px-4 font-bold text-primary-text">{{ tier.name }}</td>
              <td class="py-3 px-4 font-mono text-primary-text">{{ tier.min_points }}</td>
              <td class="py-3 px-4 font-mono text-secondary-text">{{ tier.max_points ?? 'Unlimited' }}</td>
              <td class="py-3 px-4 font-mono font-bold text-primary">{{ tier.point_multiplier }}×</td>
              <td class="py-3 px-4 font-mono text-primary-text">${{ tier.cash_conversion_rate }}</td>
              <td class="py-3 px-4">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                  :class="tier.is_active ? 'bg-primary-green/10 text-primary-green border border-primary-green/20' : 'bg-secondary-text/10 text-secondary-text border border-primary-border'"
                >
                  {{ tier.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td v-if="hasPermission('loyalty.update')" class="py-3 px-4 text-right">
                <button
                  type="button"
                  class="w-7 h-7 inline-flex items-center justify-center rounded-lg bg-background border border-primary-border hover:border-primary/40 text-secondary-text hover:text-primary transition cursor-pointer shadow-2xs"
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

    <!-- Tier Modal -->
    <TierModal
      :open="isModalOpen"
      :tier="selectedTier"
      :programId="programId"
      @close="isModalOpen = false"
      @saved="handleRefresh"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { Plus, RefreshCw, Layers, Pencil } from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import TierModal from "../components/TierModal.vue";

const store = useLoyaltyStore();
const { hasPermission } = usePermissionCheck();

const isModalOpen = ref(false);
const selectedTier = ref(null);

const tiers = computed(() => store.tiers || []);
const programId = computed(() => store.program?.id || 1);

const handleCreate = () => {
  selectedTier.value = null;
  isModalOpen.value = true;
};

const handleEdit = (tier) => {
  selectedTier.value = tier;
  isModalOpen.value = true;
};

const handleRefresh = () => {
  if (programId.value) {
    store.fetchTiers(programId.value);
  }
};
</script>
