<template>
  <div class="px-4 pb-8">

    <div class="mb-6">
      <h1 class="text-base font-semibold text-primary-text">Access Control</h1>
      <p class="text-xs text-secondary-text mt-0.5">Manage staff accounts, roles, and permissions</p>
    </div>

    <div class="flex items-center gap-1 bg-card-background border border-primary-border rounded-lg p-1 w-fit mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="px-4 py-1.5 rounded-md text-xs font-medium transition-colors"
        :class="activeTab === tab.value ? 'bg-primary text-black' : 'text-secondary-text hover:text-primary-text'"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <StaffTab v-if="activeTab === 'staff'" />
    <RolesTab v-if="activeTab === 'roles'" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StaffTab from '@/components/rbac/StaffTab.vue'
import RolesTab from '@/components/rbac/RolesTab.vue'

const activeTab = ref('staff')
const tabs = [
  { label: 'Staff',  value: 'staff'  },
  { label: 'Roles',  value: 'roles'  },
]
</script>