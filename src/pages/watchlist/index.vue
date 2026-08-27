<script setup>
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import WatchlistSettings from "./WatchlistSettings.vue";
import SymbolCatalog from "./SymbolCatalog.vue";
import ExcelImport from "./ExcelImport.vue";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

const { hasPermission } = usePermissionCheck();
const route = useRoute();
const router = useRouter();

const allTabs = [
  {
    label: "Settings",
    value: "settings",
  },
  {
    label: "Symbol Catalog",
    value: "symbols",
  },
  {
    label: "Excel Import",
    value: "import",
  },
];

const tabs = computed(() => {
  return allTabs.filter((tab) => {
    if (!tab.permission) return true;
    return hasPermission(tab.permission);
  });
});

const activeTab = ref(route.query.tab || "settings");

watch(
  () => route.query.tab,
  (tab) => {
    if (
      typeof tab === "string" &&
      ["settings", "symbols", "import"].includes(tab)
    ) {
      activeTab.value = tab;
    }
  },
);

watch(activeTab, (tab) => {
  if (route.query.tab !== tab) {
    router.replace({ query: { ...route.query, tab } });
  }
});

watch(
  tabs,
  (newTabs) => {
    if (
      newTabs.length > 0 &&
      !newTabs.some((t) => t.value === activeTab.value)
    ) {
      activeTab.value = newTabs[0].value;
    }
  },
  { immediate: true },
);

const activeComponent = computed(() => {
  switch (activeTab.value) {
    case "symbols":
      return SymbolCatalog;
    case "import":
      return ExcelImport;
    case "settings":
    default:
      return WatchlistSettings;
  }
});

function switchTab(tabValue) {
  activeTab.value = tabValue;
}
</script>

<template>
  <div class="pb-12 max-w-screen-2xl mx-auto space-y-5">
    <!-- Top Tabs Navigation (matching Panther Admin tabs) -->
    <div
      class="flex items-center gap-1 bg-card-background border border-primary-border rounded-xl p-1.5 w-fit shadow-xs"
    >
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="cursor-pointer px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 select-none"
        :class="
          activeTab === tab.value
            ? 'bg-primary text-white shadow-xs'
            : 'text-secondary-text hover:text-primary-text hover:bg-background/60'
        "
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Active Tab Component -->
    <transition name="fade" mode="out-in">
      <component :is="activeComponent" @switch-tab="switchTab" />
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
