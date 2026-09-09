<template>
  <div class="px-4 pb-8 space-y-6">
    <!-- Header with Integrated Navigation -->
    <div v-if="hasPermission('loyalty.view')" class="w-full">
      <!-- Full-Width Equal-Space Underline Tab Navigation -->
      <div class="border-b border-primary-border w-full">
        <!-- Desktop Tabs (Full width, each tab takes equal space) -->
        <nav class="hidden sm:flex items-center w-full -mb-px" aria-label="Tabs">
          <button
            v-for="tab in tabList"
            :key="tab.value"
            type="button"
            class="flex-1 flex items-center justify-center gap-2 py-3 px-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 cursor-pointer select-none text-center"
            :class="[
              activeTab === tab.value
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-secondary-text hover:text-primary-text hover:border-primary-border'
            ]"
            @click="activeTab = tab.value"
          >
            <component
              :is="tab.icon"
              class="w-4 h-4 shrink-0"
              :class="activeTab === tab.value ? 'text-primary' : 'text-secondary-text'"
            />
            <span>{{ tab.label }}</span>
            <span
              v-if="tab.badge !== undefined && tab.badge !== null"
              class="ml-1 text-[10px] px-1.5 py-0.2 rounded-full border"
              :class="
                activeTab === tab.value
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-background text-secondary-text border-primary-border'
              "
            >
              {{ tab.badge }}
            </span>
          </button>
        </nav>

        <!-- Mobile Select Dropdown -->
        <div class="sm:hidden pb-2">
          <BaseSelect
            v-model="activeTab"
            :options="mobileTabOptions"
            placeholder="Select tab..."
          />
        </div>
      </div>
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
      class="flex flex-col items-center justify-center p-12 bg-card-background border border-primary-border rounded-xl text-center min-h-[360px] gap-3"
    >
      <div class="w-12 h-12 rounded-xl bg-card-background border border-primary-border flex items-center justify-center text-secondary-text">
        <ShieldAlert class="w-6 h-6 text-primary-red" />
      </div>
      <div class="space-y-1">
        <h3 class="text-sm font-semibold text-primary-text">Access Restricted</h3>
        <p class="text-xs text-secondary-text max-w-sm mx-auto">
          You do not have permission to view the Loyalty Program module. Please contact your system administrator.
        </p>
      </div>
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
  ChevronDown,
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

const program = computed(() => store.program);
const programSummary = computed(() => store.program?.summary || {});

const tabList = computed(() => [
  { label: "Program & Rules", value: "program", icon: Award },
  { label: "Tiers", value: "tiers", icon: Layers, badge: programSummary.value?.tiers },
  { label: "Rewards", value: "rewards", icon: Gift, badge: programSummary.value?.rewards },
  { label: "Enrollments", value: "enrollments", icon: Users, badge: programSummary.value?.enrollments },
  { label: "Deals History", value: "deals", icon: Activity },
  { label: "MT5 Backfill", value: "backfill", icon: History },
]);

const mobileTabOptions = computed(() =>
  tabList.value.map((tab) => ({
    label: `${tab.label} ${tab.badge !== undefined && tab.badge !== null ? `(${tab.badge})` : ""}`.trim(),
    value: tab.value,
  }))
);

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

const handleGlobalRefresh = () => {
  store.fetchProgram(program.value?.id);
};

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
  transform: translateY(2px);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-2px);
}
</style>
