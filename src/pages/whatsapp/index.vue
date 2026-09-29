<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  MessageSquare,
  GitFork,
  FileText,
  ShieldAlert,
} from 'lucide-vue-next'
import { usePermissionCheck } from '@/composables/usePermissionCheck'
import TemplatesTab from './tabs/TemplatesTab.vue'
import FlowsTab from './tabs/FlowsTab.vue'

const route = useRoute()
const router = useRouter()
const { hasPermission } = usePermissionCheck()

// Permissions
const canViewWhatsApp = computed(() =>
  hasPermission(['whatsapp.view', 'whatsapp.create', 'whatsapp.manage'])
)

const tabs = [
  {
    key: 'templates',
    label: 'Templates',
    description: 'WhatsApp message templates & approvals',
    icon: FileText,
  },
  {
    key: 'flows',
    label: 'Flows',
    description: 'Automated journey drip sequences',
    icon: GitFork,
  },
]

const validTabKeys = ['templates', 'flows']

const activeTab = ref(
  typeof route.query.tab === 'string' && validTabKeys.includes(route.query.tab)
    ? route.query.tab
    : 'templates'
)

// Sync query parameter with tab state
watch(
  () => route.query.tab,
  (tab) => {
    if (typeof tab === 'string' && validTabKeys.includes(tab) && activeTab.value !== tab) {
      activeTab.value = tab
    }
  }
)

watch(activeTab, (tab) => {
  if (route.query.tab !== tab) {
    router.replace({ query: { ...route.query, tab } })
  }
})

const activeComponent = computed(() => {
  switch (activeTab.value) {
    case 'flows':
      return FlowsTab
    case 'templates':
    default:
      return TemplatesTab
  }
})
</script>

<template>
  <div class="px-4 pb-8 space-y-4">
    <!-- Top WhatsApp Module Tab Navigation -->
    <div v-if="canViewWhatsApp" class="w-full">
      <div class="border-b border-primary-border w-full relative">
        <nav
          class="flex items-center gap-1 w-full overflow-x-auto no-scrollbar -mb-px"
          aria-label="WhatsApp Tabs"
        >
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="flex items-center gap-2 py-3 px-4 sm:px-5 text-xs font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer select-none text-center shrink-0"
            :class="[
              activeTab === tab.key
                ? 'border-primary text-primary font-bold bg-primary/5 rounded-t-lg'
                : 'border-transparent text-secondary-text hover:text-primary-text hover:border-primary-border/60'
            ]"
            @click="activeTab = tab.key"
          >
            <component
              :is="tab.icon"
              class="w-4 h-4 shrink-0 transition-colors"
              :class="activeTab === tab.key ? 'text-primary' : 'text-secondary-text'"
            />
            <div class="flex flex-col text-left">
              <span class="leading-none">{{ tab.label }}</span>
            </div>
          </button>
        </nav>
      </div>
    </div>

    <!-- Active Tab Component Display -->
    <div v-if="canViewWhatsApp" class="min-h-[calc(100vh-160px)]">
      <Transition name="tab-fade" mode="out-in">
        <component :is="activeComponent" :key="activeTab" />
      </Transition>
    </div>

    <!-- Access Restricted Fallback -->
    <div
      v-else
      class="flex flex-col items-center justify-center p-12 bg-card-background border border-primary-border rounded-2xl text-center min-h-[360px] gap-3"
    >
      <div class="w-12 h-12 rounded-xl bg-card-background border border-primary-border flex items-center justify-center text-secondary-text">
        <ShieldAlert class="w-6 h-6 text-primary-red" />
      </div>
      <div class="space-y-1">
        <h3 class="text-sm font-semibold text-primary-text">Access Restricted</h3>
        <p class="text-xs text-secondary-text max-w-sm mx-auto">
          You do not have permission to view the WhatsApp module. Please contact your system administrator.
        </p>
      </div>
    </div>
  </div>
</template>

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
