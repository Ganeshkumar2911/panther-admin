<template>
  <div>
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text" />
        <input
          v-model="rolesStore.filters.search"
          type="text"
          placeholder="Search roles..."
          class="pl-8 pr-3 py-2 text-xs rounded-xl bg-card-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text w-48"
          @input="onSearch"
        />
      </div>
      <button
        class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-black text-xs font-semibold transition-colors"
        @click="openCreate"
      >
        <Plus class="w-3.5 h-3.5" /> Add Role
      </button>
    </div>

    <!-- Skeleton -->
    <div v-if="rolesStore.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="n in 4" :key="n" class="bg-card-background border border-primary-border rounded-2xl p-5 animate-pulse space-y-3">
        <div class="flex items-center justify-between">
          <div class="h-4 w-28 bg-background rounded" />
          <div class="h-5 w-16 bg-background rounded-full" />
        </div>
        <div class="h-3 w-full bg-background rounded" />
        <div class="h-3 w-20 bg-background rounded" />
        <div class="flex gap-2 pt-2">
          <div class="flex-1 h-7 bg-background rounded-lg" />
          <div class="flex-1 h-7 bg-background rounded-lg" />
          <div class="flex-1 h-7 bg-background rounded-lg" />
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="rolesStore.records.length === 0" class="flex flex-col items-center gap-4 py-20">
      <div class="w-12 h-12 rounded-full bg-card-background border border-primary-border flex items-center justify-center">
        <Shield class="w-5 h-5 text-secondary-text" />
      </div>
      <p class="text-sm font-semibold text-primary-text">No roles found</p>
      <p class="text-xs text-secondary-text">Create your first role to get started</p>
    </div>

    <!-- Cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="role in rolesStore.records"
        :key="role.id"
        class="bg-card-background border border-primary-border rounded-2xl p-5 flex flex-col gap-3 hover:border-primary/30 transition-all duration-200"
      >
        <div class="flex items-start justify-between gap-2">
          <p class="text-sm font-semibold text-primary-text">{{ role.name }}</p>
          <div class="flex items-center gap-1.5 shrink-0">
            <span v-if="role.is_system" class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">System</span>
          </div>
        </div>

        <p class="text-[11px] text-secondary-text">{{ role.description || 'No description' }}</p>

        <div class="flex items-center gap-1.5">
          <Shield class="w-3.5 h-3.5 text-secondary-text" />
          <span class="text-[11px] text-secondary-text">{{ role.permission_ids?.length ?? 0 }} permissions</span>
        </div>

        <div class="flex gap-1.5 pt-1 border-t border-primary-border">
          <button
            class="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-primary-border text-[11px] text-secondary-text hover:text-primary-text hover:bg-background transition-colors"
            @click="openPermissions(role)"
          >
            <Lock class="w-3 h-3" /> Permissions
          </button>
          <button
            class="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-primary-border text-[11px] text-secondary-text hover:text-primary-text hover:bg-background transition-colors"
            @click="openEdit(role)"
          >
            <Pencil class="w-3 h-3" />
          </button>
          <button
            v-if="!role.is_system"
            :disabled="rolesStore.actionLoading"
            class="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] bg-primary-red/10 text-primary-red border border-primary-red/20 hover:bg-primary-red/20 transition-colors disabled:opacity-50"
            @click="deleteTarget = role"
          >
            <Trash2 class="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirm -->
    <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click="deleteTarget = null">
      <div class="bg-card-background rounded-2xl border border-primary-border w-full max-w-sm p-6" @click.stop>
        <div class="w-10 h-10 rounded-full bg-primary-red/10 flex items-center justify-center mb-4">
          <Trash2 class="w-4 h-4 text-primary-red" />
        </div>
        <p class="text-sm font-semibold text-primary-text mb-1">Delete Role</p>
        <p class="text-xs text-secondary-text mb-5">Are you sure you want to delete <strong>{{ deleteTarget.name }}</strong>?</p>
        <div class="flex gap-3">
          <button class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background transition-colors" @click="deleteTarget = null">Cancel</button>
          <button
            :disabled="rolesStore.actionLoading"
            class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary-red hover:opacity-90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            @click="rolesStore.deleteRole(deleteTarget.id, () => deleteTarget = null)"
          >
            <Loader2 v-if="rolesStore.actionLoading" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ rolesStore.actionLoading ? 'Deleting...' : 'Delete' }}</span>
          </button>
        </div>
      </div>
    </div>

    <RoleDialog :open="roleDialog.open" :edit-data="roleDialog.editData" @close="roleDialog.open = false" />
    <PermissionDialog :open="permDialog.open" :role="permDialog.role" @close="permDialog.open = false" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { Search, Plus, Shield, Pencil, Trash2, Lock, Loader2 } from 'lucide-vue-next'
import { useRbacRolesStore } from '@/stores/rbac/roles'
import RoleDialog from './RoleDialog.vue'
import PermissionDialog from './PermissionDialog.vue'

const rolesStore = useRbacRolesStore()

const deleteTarget = ref(null)
const roleDialog   = ref({ open: false, editData: null })
const permDialog   = ref({ open: false, role: null })

const openCreate = () => { roleDialog.value = { open: true, editData: null } }
const openEdit   = (r) => { roleDialog.value = { open: true, editData: r } }
const openPermissions = (r) => { permDialog.value = { open: true, role: r } }

let searchTimer = null
const onSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => rolesStore.applyFilters(), 400)
}

onMounted(() => rolesStore.fetchRoles())
</script>