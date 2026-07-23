<template>
  <div class="px-4 pb-8">
    <!-- Top Level Tabs -->
    <div
      v-if="tabs.length > 1"
      class="flex items-center gap-1 bg-card-background border border-primary-border rounded-lg p-1 w-fit mb-6"
    >
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="px-4 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
        :class="activeTab === tab.value ? 'bg-primary text-white' : 'text-secondary-text hover:text-primary-text'"
        @click="activeTab = tab.value"
      >
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- Main Tab Views -->
    <StaffTab
      v-if="activeTab === 'staff' && hasPermission(['team_management.view', 'team_management.create', 'team_management.role_manage', 'team_management.role_view'])"
    />
    <RolesTab
      v-if="activeTab === 'roles' && hasPermission(['team_management.role_manage', 'role.manage'])"
    />

    <!-- Modules & Permissions Tab -->
    <div v-if="activeTab === 'modules' && hasPermission(['role.manage', 'team_management.role_manage', 'team_management.view'])" class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary-border pb-4">
        <div>
          <h2 class="text-base font-bold text-primary-text flex items-center gap-2">
            <Layers class="w-5 h-5 text-primary" />
            <span>Modules & RBAC Config</span>
          </h2>
          <p class="text-xs text-secondary-text mt-0.5">
            Dynamically register resources, actions, and permissions mapping for RBAC.
          </p>
        </div>

        <button
          class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-xs transition-colors cursor-pointer shrink-0"
          @click="quickModuleOpen = true"
        >
          <PlusCircle class="w-4 h-4" />
          <span>Add New Module</span>
        </button>
      </div>

      <!-- Sub Tabs for Modules -->
      <div class="flex items-center gap-1 bg-card-background border border-primary-border rounded-xl p-1 w-fit">
        <button
          v-for="subTab in moduleSubTabs"
          :key="subTab.value"
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          :class="activeModuleSubTab === subTab.value
            ? 'bg-primary text-white shadow-xs'
            : 'text-secondary-text hover:text-primary-text hover:bg-background/50'"
          @click="activeModuleSubTab = subTab.value"
        >
          <component :is="subTab.icon" class="w-3.5 h-3.5" />
          <span>{{ subTab.label }}</span>
        </button>
      </div>

      <!-- Module Sub Tab Content -->
      <ResourcesTab
        v-if="activeModuleSubTab === 'resources'"
        @open-quick-module="quickModuleOpen = true"
      />
      <ActionsTab
        v-else-if="activeModuleSubTab === 'actions'"
      />
      <PermissionsMappingTab
        v-else-if="activeModuleSubTab === 'permissions'"
      />

      <QuickModuleDrawer
        :open="quickModuleOpen"
        @close="quickModuleOpen = false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import StaffTab from '@/components/rbac/StaffTab.vue'
import RolesTab from '@/components/rbac/RolesTab.vue'
import ResourcesTab from '@/components/rbac/ResourcesTab.vue'
import ActionsTab from '@/components/rbac/ActionsTab.vue'
import PermissionsMappingTab from '@/components/rbac/PermissionsMappingTab.vue'
import QuickModuleDrawer from '@/components/rbac/QuickModuleDrawer.vue'
import { usePermissionCheck } from '@/composables/usePermissionCheck'
import { Layers, Box, Zap, KeyRound, PlusCircle } from 'lucide-vue-next'
import { useRbacModulesStore } from '@/stores/rbac/modules'

const route = useRoute()
const { hasPermission } = usePermissionCheck()
const modulesStore = useRbacModulesStore()

const quickModuleOpen = ref(false)
const activeModuleSubTab = ref('resources')

const allTabs = [
  {
    label: 'Staff',
    value: 'staff',
    permission: ['team_management.view', 'team_management.create', 'team_management.role_manage', 'team_management.role_view', 'role.manage'],
  },
  {
    label: 'Roles',
    value: 'roles',
    permission: ['team_management.role_manage', 'role.manage'],
  },
  {
    label: 'Modules & Resources',
    value: 'modules',
    permission: ['role.manage', 'team_management.role_manage', 'team_management.view'],
  },
]

const moduleSubTabs = [
  { label: 'Resources', value: 'resources', icon: Box },
  { label: 'Actions', value: 'actions', icon: Zap },
  { label: 'Permissions Mapping', value: 'permissions', icon: KeyRound },
]

const tabs = computed(() => {
  return allTabs.filter((tab) => hasPermission(tab.permission))
})

const activeTab = ref('staff')

watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab && ['staff', 'roles', 'modules'].includes(newTab)) {
      activeTab.value = newTab
    }
  },
  { immediate: true }
)

watch(
  tabs,
  (newTabs) => {
    if (newTabs.length > 0 && !newTabs.some((t) => t.value === activeTab.value)) {
      activeTab.value = newTabs[0].value
    }
  },
  { immediate: true }
)

onMounted(() => {
  modulesStore.fetchAll()
})
</script>