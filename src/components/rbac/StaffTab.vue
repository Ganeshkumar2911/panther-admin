<template>
  <div>
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text" />
        <input
          v-model="staffStore.filters.search"
          type="text"
          placeholder="Search staff..."
          class="pl-8 pr-3 py-2 text-xs rounded-xl bg-card-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text w-48"
          @input="onSearch"
        />
      </div>
      <button
        v-if="hasPermission('team_management.create')"
        class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors cursor-pointer"
        @click="dialogOpen = true"
      >
        <Plus class="w-3.5 h-3.5" /> Add Staff
      </button>
    </div>

    <!-- Table -->
    <div class="border border-primary-border rounded-2xl bg-card-background">
      <table class="w-full border-collapse">
        <thead class="border-b border-primary-border bg-card-background">
          <tr>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-4 py-3 rounded-tl-2xl">Name</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-4 py-3">Email</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-4 py-3">Role</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-4 py-3">Status</th>
            <th class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-widest px-4 py-3 rounded-tr-2xl">Actions</th>
          </tr>
        </thead>

        <!-- Skeleton -->
        <tbody v-if="staffStore.loading">
          <tr v-for="n in 5" :key="n" class="border-b border-primary-border last:border-none bg-card-background animate-pulse group">
            <td class="px-4 py-3.5 group-last:rounded-bl-2xl">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-full bg-background" />
                <div class="h-3 w-28 bg-background rounded" />
              </div>
            </td>
            <td class="px-4 py-3.5"><div class="h-3 w-36 bg-background rounded" /></td>
            <td class="px-4 py-3.5"><div class="h-7 w-28 bg-background rounded-lg" /></td>
            <td class="px-4 py-3.5"><div class="h-5 w-12 bg-background rounded-full" /></td>
            <td class="px-4 py-3.5 flex justify-end group-last:rounded-br-2xl"><div class="h-7 w-16 bg-background rounded-lg" /></td>
          </tr>
        </tbody>

        <!-- Empty -->
        <tbody v-else-if="staffStore.records.length === 0">
          <tr>
            <td colspan="5" class="py-20 text-center bg-card-background rounded-b-2xl">
              <div class="flex flex-col items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-background flex items-center justify-center">
                  <Users class="w-5 h-5 text-secondary-text" />
                </div>
                <p class="text-sm font-semibold text-primary-text">No staff found</p>
                <p class="text-xs text-secondary-text">Add your first staff member to get started</p>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Data -->
        <tbody v-else>
          <tr
            v-for="staff in staffStore.records"
            :key="staff.id"
            class="border-b border-primary-border last:border-none bg-card-background hover:bg-background transition-colors group"
          >
            <td class="px-4 py-3.5 group-last:rounded-bl-2xl">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  {{ staff.name?.charAt(0)?.toUpperCase() }}
                </div>
                <p class="text-xs font-medium text-primary-text">{{ staff.name }}</p>
              </div>
            </td>

            <td class="px-4 py-3.5 text-xs text-secondary-text">{{ staff.email }}</td>

            <td class="px-4 py-3.5">
              <BaseSelect
                :model-value="staff.role_id"
                :options="roleOptions"
                variant="surface"
                placeholder="Select role"
                @update:model-value="(val) => handleRoleSelect(staff, val)"
              />
            </td>

            <td class="px-4 py-3.5">
              <button
                class="relative w-9 h-5 rounded-full transition-colors duration-200"
                :class="staff.is_active ? 'bg-primary' : 'border border-primary-border bg-background'"
                :disabled="staffStore.actionLoading"
                @click="staffStore.updateStaffStatus(staff.id, !staff.is_active)"
              >
                <span
                  class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
                  :class="staff.is_active ? 'translate-x-4' : 'translate-x-0'"
                />
              </button>
            </td>

            <td class="px-4 py-3.5 text-right group-last:rounded-br-2xl">
              <div class="flex items-center justify-end gap-2">
                <button
                  class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                  @click="openPermissionsDrawer(staff)"
                >
                  <ShieldCheck class="w-3.5 h-3.5" /> Permissions
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4">
      <Pagination
        v-if="staffStore.pagination.total_items > staffStore.pagination.per_page"
        :pagination="staffStore.pagination"
        @page-change="staffStore.changePage"
      />
    </div>

    <StaffDialog :open="dialogOpen" @close="dialogOpen = false" />

    <!-- User Permission Drawer -->
    <UserPermissionDrawer
      :open="permissionDrawerOpen"
      :staff="permissionStaff"
      @close="permissionDrawerOpen = false"
    />

    <!-- Role Change Confirmation Dialog -->
    <RoleChangeConfirmDialog
      :open="roleChangeTarget !== null"
      :staff-name="roleChangeTarget?.staff?.name || ''"
      :current-role-name="roleChangeTarget?.currentRoleName || ''"
      :new-role-name="roleChangeTarget?.newRoleName || ''"
      :loading="staffStore.actionLoading"
      @close="roleChangeTarget = null"
      @confirm="executeRoleChange"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { Search, Plus, Users, Loader2, ShieldCheck } from 'lucide-vue-next'
import { useRbacStaffStore } from '@/stores/rbac/staff'
import { useRbacRolesStore } from '@/stores/rbac/roles'
import { usePermissionCheck } from '@/composables/usePermissionCheck'
import Pagination from '@/components/common/Pagination.vue'
import StaffDialog from './StaffDialog.vue'
import UserPermissionDrawer from './UserPermissionDrawer.vue'
import RoleChangeConfirmDialog from './RoleChangeConfirmDialog.vue'

const staffStore = useRbacStaffStore()
const rolesStore = useRbacRolesStore()
const { hasPermission } = usePermissionCheck()

const roleOptions = computed(() =>
  rolesStore.records.map((role) => ({
    label: role.name,
    value: role.id,
  }))
)

const dialogOpen = ref(false)

const permissionDrawerOpen = ref(false)
const permissionStaff = ref(null)

const roleChangeTarget = ref(null)

const handleRoleSelect = (staff, newRoleIdVal) => {
  const newRoleId = Number(newRoleIdVal)
  if (Number(staff.role_id) === newRoleId) {
    // Feature 1: Selected existing role again -> skip API call
    return
  }

  // Feature 2: Open confirmation dialog before updating
  const currentRole = roleOptions.value.find((r) => Number(r.value) === Number(staff.role_id))
  const newRole = roleOptions.value.find((r) => Number(r.value) === newRoleId)

  roleChangeTarget.value = {
    staff,
    newRoleId,
    currentRoleName: currentRole?.label || '',
    newRoleName: newRole?.label || '',
  }
}

const executeRoleChange = () => {
  if (!roleChangeTarget.value) return
  const { staff, newRoleId } = roleChangeTarget.value
  staffStore.updateStaffRole(staff.id, newRoleId, () => {
    roleChangeTarget.value = null
  })
}

const openPermissionsDrawer = (staff) => {
  permissionStaff.value = staff
  permissionDrawerOpen.value = true
}

let searchTimer = null
const onSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => staffStore.applyFilters(), 400)
}

onMounted(() => {
  staffStore.fetchStaff()
  rolesStore.fetchRoles()
})
</script>