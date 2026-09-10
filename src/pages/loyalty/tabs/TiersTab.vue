<template>
  <div class="space-y-6">
    <!-- Header & Action -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-base font-semibold text-primary-text">Loyalty Stages & Multipliers</h2>
        <p class="text-xs text-secondary-text">
          Configure stage thresholds, point multipliers, custom badge colors, and cash conversion rates.
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
          Create tiers (Bronze, Silver, Gold, Platinum, Elite) to activate tier multiplier progression for this program.
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
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div
          v-for="tier in tiers"
          :key="tier.id"
          class="rounded-2xl border border-primary-border p-4.5 bg-gradient-to-b from-card-background to-card-background/70 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:border-primary/50 group cursor-pointer shadow-2xs"
          :style="{
            borderColor: tier.color ? `${tier.color}45` : undefined,
          }"
          @click="handleEdit(tier)"
        >
          <!-- Moving Light Sheen Effect -->
          <div class="card-shine pointer-events-none" />

          <!-- Top Accent Bar -->
          <div
            class="absolute top-0 left-0 right-0 h-1"
            :style="{ backgroundColor: tier.color || 'var(--color-primary)' }"
          />

          <div class="relative z-10 space-y-3 pt-0.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Award
                  class="w-4 h-4 shrink-0"
                  :style="{ color: tier.color || 'var(--color-primary)' }"
                />
                <h3 class="text-sm font-bold text-primary-text">{{ tier.name }}</h3>
              </div>

              <div class="flex items-center gap-1.5">
                <span class="text-[10px] font-mono font-semibold text-secondary-text bg-background/60 border border-primary-border px-1.5 py-0.5 rounded">
                  #{{ tier.sort_order }}
                </span>
                <button
                  v-if="hasPermission('loyalty.update')"
                  type="button"
                  class="w-6 h-6 rounded-md hover:bg-background/80 text-secondary-text hover:text-primary-text flex items-center justify-center transition cursor-pointer"
                  title="Edit Tier"
                  @click.stop="handleEdit(tier)"
                >
                  <Pencil class="w-3 h-3" />
                </button>
              </div>
            </div>

            <p class="text-[11px] text-secondary-text font-mono">
              {{ Number(tier.min_points).toLocaleString() }} &ndash; {{ tier.max_points !== null && tier.max_points !== undefined ? `${Number(tier.max_points).toLocaleString()} pts` : '∞' }}
            </p>

            <div class="space-y-2 text-xs pt-2.5 border-t border-primary-border">
              <div class="flex items-center justify-between">
                <span class="text-secondary-text">Tier Code</span>
                <span
                  class="font-semibold font-mono text-[11px] px-1.5 py-0.5 rounded uppercase"
                  :style="{
                    backgroundColor: tier.color ? `${tier.color}15` : 'var(--color-primary-10)',
                    color: tier.color || 'var(--color-primary)',
                  }"
                >
                  {{ tier.code }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-secondary-text">Multiplier</span>
                <span
                  class="font-bold font-mono text-xs"
                  :style="{ color: tier.color || 'var(--color-primary)' }"
                >
                  {{ tier.point_multiplier }}&times;
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-secondary-text">Cash Rate</span>
                <span class="font-semibold text-primary-text font-mono text-xs">${{ tier.cash_conversion_rate }}/pt</span>
              </div>
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
                <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Color</th>
                <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Min Points</th>
                <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Max Points</th>
                <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Multiplier</th>
                <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Cash Rate</th>
                <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Status</th>
                <th v-if="hasPermission('loyalty.update')" class="py-2.5 px-4 text-right text-[11px] font-medium uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-primary-border">
              <tr v-for="tier in tiers" :key="tier.id" class="hover:bg-background/50 transition">
                <td class="py-3 px-4 font-mono font-medium text-secondary-text">#{{ tier.sort_order }}</td>
                <td class="py-3 px-4">
                  <span
                    class="px-2 py-0.5 rounded font-mono text-[11px] font-bold border"
                    :style="{
                      backgroundColor: tier.color ? `${tier.color}15` : 'var(--color-primary-10)',
                      color: tier.color || 'var(--color-primary)',
                      borderColor: tier.color ? `${tier.color}35` : 'var(--color-primary-20)',
                    }"
                  >
                    {{ tier.code }}
                  </span>
                </td>
                <td class="py-3 px-4 font-semibold text-primary-text">{{ tier.name }}</td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <span
                      class="w-3.5 h-3.5 rounded-full border border-white/20 shadow-2xs shrink-0"
                      :style="{ backgroundColor: tier.color || '#CD7F32' }"
                    />
                    <span class="font-mono text-[11px] text-secondary-text">{{ tier.color || 'Default' }}</span>
                  </div>
                </td>
                <td class="py-3 px-4 font-mono text-primary-text">{{ tier.min_points }}</td>
                <td class="py-3 px-4 font-mono text-secondary-text">
                  {{ tier.max_points !== null && tier.max_points !== undefined ? tier.max_points : 'Open-Ended (∞)' }}
                </td>
                <td class="py-3 px-4 font-mono font-semibold text-primary">{{ tier.point_multiplier }}&times;</td>
                <td class="py-3 px-4 font-mono text-primary-text">${{ tier.cash_conversion_rate }}</td>
                <td class="py-3 px-4">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                    :class="tier.is_active ? 'bg-primary-green/10 text-primary-green' : 'bg-rose-500/10 text-rose-400'"
                  >
                    {{ tier.is_active ? 'ACTIVE' : 'INACTIVE' }}
                  </span>
                </td>
                <td v-if="hasPermission('loyalty.update')" class="py-3 px-4 text-right">
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
import { ref, computed, onMounted } from "vue";
import { Award, Plus, RefreshCw, Layers, Pencil } from "lucide-vue-next";
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
    store.fetchTiers(programId.value, true);
  }
};

onMounted(() => {
  if (!store.isFetched.tiers && programId.value) {
    store.fetchTiers(programId.value);
  }
});
</script>

<style scoped>
.card-shine {
  position: absolute;
  top: -50%;
  left: -120%;
  width: 90%;
  height: 200%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.02) 20%,
    rgba(255, 255, 255, 0.16) 50%,
    rgba(255, 255, 255, 0.02) 80%,
    transparent 100%
  );
  transform: rotate(25deg);
  animation: card-shine-sweep 4.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  z-index: 5;
}

.group:hover .card-shine {
  animation: card-shine-sweep 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes card-shine-sweep {
  0% {
    left: -120%;
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  45% {
    left: 140%;
    opacity: 1;
  }
  50%, 100% {
    left: 140%;
    opacity: 0;
  }
}
</style>
