<template>
  <div class="space-y-6">
    <!-- Active Route Component -->
    <div v-if="hasAccess">
      <Transition name="tab-fade" mode="out-in">
        <component :is="activeComponent" :key="activeTab" />
      </Transition>
    </div>

    <!-- Access Restricted Fallback -->
    <div
      v-else
      class="flex flex-col items-center justify-center p-12 bg-card-background border border-primary-border rounded-xl text-center min-h-[360px] gap-3"
    >
      <div
        class="w-12 h-12 rounded-xl bg-card-background border border-primary-border flex items-center justify-center text-secondary-text"
      >
        <HugeIcon :icon="ShieldAlertIcon" :size="24" class="text-primary-red" />
      </div>
      <div class="space-y-1">
        <h3 class="text-sm font-semibold text-primary-text">Access Restricted</h3>
        <p class="text-xs text-secondary-text max-w-sm mx-auto">
          You do not have permission to view the Commission Engine module. Please contact your system administrator.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { ShieldAlertIcon } from "@hugeicons/core-free-icons";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

import RateMatrixTab from "./tabs/RateMatrixTab.vue";
import SymbolGroupsTab from "./tabs/SymbolGroupsTab.vue";
import SymbolsCatalogTab from "./tabs/SymbolsCatalogTab.vue";
import SyncStatusTab from "./tabs/SyncStatusTab.vue";

const route = useRoute();
const { hasPermission } = usePermissionCheck();

const hasAccess = computed(
  () =>
    hasPermission("ib_commission.view") ||
    hasPermission("ib_commission.manage_rates") ||
    hasPermission("ib_commission.manage_symbol_groups") ||
    hasPermission("ib_commission.sync")
);

const validTabKeys = ["rates", "groups", "symbols", "sync"];

const activeTab = computed(() => {
  const path = route.path;
  if (path.endsWith("/rates")) return "rates";
  if (path.endsWith("/symbol-groups")) return "groups";
  if (path.endsWith("/symbols")) return "symbols";
  if (path.endsWith("/sync")) return "sync";

  if (typeof route.query.tab === "string" && validTabKeys.includes(route.query.tab)) {
    return route.query.tab;
  }
  return "rates";
});

const activeComponent = computed(() => {
  switch (activeTab.value) {
    case "groups":
      return SymbolGroupsTab;
    case "symbols":
      return SymbolsCatalogTab;
    case "sync":
      return SyncStatusTab;
    case "rates":
    default:
      return RateMatrixTab;
  }
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
