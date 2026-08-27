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
    permission: [
      "watchlist.view",
      "watchlist.manage",
      "watchlist.settings_view",
      "watchlist.settings_update",
      "watchlist.settings",
      "watchlist.update",
    ],
  },
  {
    label: "Symbol Catalog",
    value: "symbols",
    permission: [
      "watchlist.view",
      "watchlist.manage",
      "watchlist.symbols",
      "watchlist.symbol_view",
      "watchlist.symbol_create",
      "watchlist.symbol_update",
      "watchlist.symbol_delete",
      "watchlist.create",
      "watchlist.update",
      "watchlist.delete",
    ],
  },
  {
    label: "Excel Import",
    value: "import",
    permission: [
      "watchlist.view",
      "watchlist.manage",
      "watchlist.import",
      "watchlist.import_export",
      "watchlist.symbol_create",
      "watchlist.create",
    ],
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
      v-if="tabs.length > 0"
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
      <component :is="activeComponent" v-if="tabs.length > 0" @switch-tab="switchTab" />
      <div
        v-else
        class="py-16 text-center text-sm text-secondary-text bg-card-background border border-primary-border rounded-xl"
      >
        You do not have permission to view Watchlist.
      </div>
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
