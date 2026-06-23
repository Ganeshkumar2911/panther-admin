<script setup>
import { ref, computed } from 'vue'

import EmailSettings from './EmailSettings.vue'
import EmailTemplates from './EmailTemplates.vue'
import EmailTriggerRules from './EmailTriggerRules.vue'

const activeTab = ref('settings')

const tabs = [
  {
    label: 'Email Settings',
    value: 'settings',
  },
  {
    label: 'Email Templates',
    value: 'templates',
  },
  {
    label: 'Email Trigger Rules',
    value: 'trigger-rules',
  },
]

const activeComponent = computed(() => {
  switch (activeTab.value) {
    case 'templates':
      return EmailTemplates

    case 'trigger-rules':
      return EmailTriggerRules

    default:
      return EmailSettings
  }
})
</script>

<template>
  <div class="px-4">
    <!-- Tabs -->
    <div class="flex items-center gap-1 bg-card-background border border-primary-border rounded-lg p-1 w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="px-4 py-2 rounded-md text-xs font-medium transition-colors"
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