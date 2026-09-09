<template>
  <div class="px-4 pb-8 space-y-6">
    <!-- Submodule Tab Navigation -->
    <div
      v-if="hasPermission('loyalty.view')"
      class="flex items-center gap-1 bg-card-background border border-primary-border rounded-xl p-1 w-full sm:w-fit overflow-x-auto shadow-2xs"
    >
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="cursor-pointer px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
        :class="
          activeTab === tab.value
            ? 'bg-primary text-white shadow-xs font-bold'
            : 'text-secondary-text hover:text-primary-text hover:bg-background/60'
        "
        @click="activeTab = tab.value"
      >
        <component :is="tab.icon" class="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- Active Tab Component -->
    <div v-if="hasPermission('loyalty.view')">
      <Transition name="tab-fade" mode="out-in">
        <component :is="activeComponent" :key="activeTab" />
      </Transition>
    </div>

    <!-- Access Restricted Fallback -->
    <div
      v-else
      class="flex flex-col items-center justify-center p-12 bg-card-background/40 border border-primary-border rounded-2xl text-center min-h-[400px] gap-3"
    >
      <div class="w-14 h-14 rounded-xl bg-card-background border border-primary-border flex items-center justify-center text-secondary-text">
        <ShieldAlert class="w-6 h-6 text-primary-red" />
      </div>
      <h3 class="text-sm font-bold text-primary-text">Access Restricted</h3>
      <p class="text-xs text-secondary-text max-w-sm">
        You do not have permission to view the Loyalty Program module. Please contact your system administrator.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Award,
  Layers,
  Gift,
  Users,
  Activity,
  History,
  ShieldAlert,
} from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

import ProgramTab from "./tabs/ProgramTab.vue";
import TiersTab from "./tabs/TiersTab.vue";
import RewardsTab from "./tabs/RewardsTab.vue";
import EnrollmentsTab from "./tabs/EnrollmentsTab.vue";
import DealsTab from "./tabs/DealsTab.vue";
import BackfillTab from "./tabs/BackfillTab.vue";

const route = useRoute();
const router = useRouter();
const store = useLoyaltyStore();
const { hasPermission } = usePermissionCheck();

const tabs = [
  { label: "Program & Rules", value: "program", icon: Award },
  { label: "Tiers", value: "tiers", icon: Layers },
  { label: "Rewards", value: "rewards", icon: Gift },
  { label: "Enrollments", value: "enrollments", icon: Users },
  { label: "Deals History", value: "deals", icon: Activity },
  { label: "MT5 Backfill", value: "backfill", icon: History },
];

const activeTab = ref(
  typeof route.query.tab === "string" && ["program", "tiers", "rewards", "enrollments", "deals", "backfill"].includes(route.query.tab)
    ? route.query.tab
    : "program"
);

// Sync query parameter with tab
watch(
  () => route.query.tab,
  (tab) => {
    if (typeof tab === "string" && ["program", "tiers", "rewards", "enrollments", "deals", "backfill"].includes(tab)) {
      activeTab.value = tab;
    }
  }
);

watch(activeTab, (tab) => {
  if (route.query.tab !== tab) {
    router.replace({ query: { ...route.query, tab } });
  }
});

const activeComponent = computed(() => {
  switch (activeTab.value) {
    case "tiers":
      return TiersTab;
    case "rewards":
      return RewardsTab;
    case "enrollments":
      return EnrollmentsTab;
    case "deals":
      return DealsTab;
    case "backfill":
      return BackfillTab;
    case "program":
    default:
      return ProgramTab;
  }
});

onMounted(() => {
  store.fetchProgram();
});
</script>

<style scoped>
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(3px);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}
</style>
