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
        class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors"
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
            class="border-b border-primary-border last:border-none bg-card-background hover:bg-background transition-colors relative hover:z-20 focus-within:z-30 group"
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

            <td class="px-4 py-3.5 relative z-30">
              <BaseSelect
                :model-value="staff.role_id"
                :options="roleOptions"
                variant="surface"
                placeholder="Select role"
                @update:model-value="(val) => staffStore.updateStaffRole(staff.id, Number(val))"
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
              <button
                :disabled="staffStore.actionLoading"
                class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold border bg-primary-red/10 text-primary-red border-primary-red/20 hover:bg-primary-red/20 transition-colors ml-auto disabled:opacity-50"
                @click="confirmDelete(staff)"
              >
                <Trash2 class="w-3 h-3" /> Delete
              </button>
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

    <!-- Delete Confirm -->
    <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click="deleteTarget = null">
      <div class="bg-card-background rounded-2xl border border-primary-border w-full max-w-sm p-6" @click.stop>
        <div class="w-10 h-10 rounded-full bg-primary-red/10 flex items-center justify-center mb-4">
          <Trash2 class="w-4 h-4 text-primary-red" />
        </div>
        <p class="text-sm font-semibold text-primary-text mb-1">Delete Staff</p>
        <p class="text-xs text-secondary-text mb-5">Are you sure you want to delete <strong>{{ deleteTarget.name }}</strong>? This action cannot be undone.</p>
        <div class="flex gap-3">
          <button class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background transition-colors" @click="deleteTarget = null">Cancel</button>
          <button
            :disabled="staffStore.actionLoading"
            class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary-red hover:opacity-90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            @click="executeDelete"
          >
            <Loader2 v-if="staffStore.actionLoading" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ staffStore.actionLoading ? 'Deleting...' : 'Delete' }}</span>
          </button>
        </div>
      </div>
    </div>

    <StaffDialog :open="dialogOpen" @close="dialogOpen = false" />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { Search, Plus, Users, Trash2, Loader2 } from 'lucide-vue-next'
import { useRbacStaffStore } from '@/stores/rbac/staff'
import { useRbacRolesStore } from '@/stores/rbac/roles'
import Pagination from '@/components/common/Pagination.vue'
import StaffDialog from './StaffDialog.vue'

const staffStore = useRbacStaffStore()
const rolesStore = useRbacRolesStore()

const roleOptions = computed(() =>
  rolesStore.records.map((role) => ({
    label: role.name,
    value: role.id,
  }))
)

const dialogOpen   = ref(false)
const deleteTarget = ref(null)

const confirmDelete = (staff) => { deleteTarget.value = staff }
const executeDelete = () => {
  staffStore.deleteStaff(deleteTarget.value.id, () => { deleteTarget.value = null })
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