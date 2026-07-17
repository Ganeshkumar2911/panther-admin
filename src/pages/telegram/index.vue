<script setup>
import { ref, computed } from "vue";
import TelegramSettings from "@/pages/telegram/TelegramSettings.vue";
import TelegramConfiguration from "@/pages/telegram/TelegramConfiguration.vue";
import TelegramConfigurationAudit from "@/pages/telegram/TelegramConfigurationAudit.vue";

const activeTab = ref("settings");

const tabs = [
  {
    label: "Telegram Settings",
    value: "settings",
  },
  {
    label: "Telegram Configuration",
    value: "configuration",
  },
  // {
  //   label: "Configuration Audit",
  //   value: "audit",
  // },
];

const activeComponent = computed(() => {
  switch (activeTab.value) {
    case "settings":
      return TelegramSettings;

    // case "configuration":
    //   return TelegramConfiguration;

    // case "audit":
    //   return TelegramConfigurationAudit;

    default:
      return TelegramConfigurationAudit;
  }
});
</script>

<template>
  <div class="px-4">
    <!-- Tabs -->
    <div
      class="flex items-center gap-1 cursor-pointer bg-card-background border border-primary-border rounded-lg p-1 w-fit"
    >
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="px-4 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer"
        :class="
          activeTab === tab.value
            ? 'bg-primary text-white'
            : 'text-secondary-text hover:text-primary-text'
        "
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Active Tab Content -->
    <component :is="activeComponent" />
  </div>
</template>
