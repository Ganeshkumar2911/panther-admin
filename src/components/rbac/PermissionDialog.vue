<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click="emit('close')">
    <div class="bg-card-background rounded-2xl border border-primary-border w-full max-w-2xl max-h-[90vh] flex flex-col" @click.stop>

      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0">
        <div>
          <h2 class="text-sm font-semibold text-primary-text">Manage Permissions</h2>
          <p class="text-[11px] text-secondary-text mt-0.5">{{ role?.name }}</p>
        </div>
        <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors" @click="emit('close')">
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-6 py-5">
        <div v-if="store.permissionLoading" class="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-pulse">
          <div v-for="n in 8" :key="n" class="h-28 bg-background border border-primary-border rounded-xl" />
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="(perms, resource) in store.permissions"
            :key="resource"
            class="bg-background border border-primary-border rounded-xl p-4"
          >
            <p class="text-[11px] uppercase tracking-widest font-semibold text-secondary-text mb-3 capitalize">
              {{ resource.replace(/_/g, ' ') }}
            </p>
            <div class="space-y-2">
              <label
                v-for="perm in perms"
                :key="perm.id"
                class="flex items-center gap-2.5 cursor-pointer group"
              >
                <div
                  class="w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0"
                  :class="localSelected.includes(perm.id)
                    ? 'bg-primary border-primary'
                    : 'bg-card-background border-primary-border group-hover:border-primary/60'"
                  @click="togglePermission(perm.id)"
                >
                  <Check v-if="localSelected.includes(perm.id)" class="w-2.5 h-2.5 text-black" />
                </div>
                <span class="text-xs text-primary-text capitalize">{{ perm.action.replace(/_/g, ' ') }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-primary-border flex items-center justify-between shrink-0 bg-card-background">
        <p class="text-[11px] text-secondary-text">{{ localSelected.length }} permissions selected</p>
        <div class="flex gap-3">
          <button class="px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors" @click="emit('close')">Cancel</button>
          <button
            :disabled="store.actionLoading"
            class="px-4 py-2.5 rounded-lg text-xs font-medium text-black bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            @click="save"
          >
            <Loader2 v-if="store.actionLoading" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ store.actionLoading ? 'Saving...' : 'Save Permissions' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { X, Check, Loader2 } from 'lucide-vue-next'
import { useRbacRolesStore } from '@/stores/rbac/roles'

const props = defineProps({ open: { type: Boolean, default: false }, role: { type: Object, default: null } })
const emit  = defineEmits(['close'])
const store = useRbacRolesStore()

const localSelected = ref([])

watch(() => props.open, (val) => {
  if (val && props.role) {
    localSelected.value = [...(props.role.permission_ids ?? [])]
    store.fetchPermissions()
    store.fetchRolePermissions(props.role.id)
  }
})

watch(() => store.selectedRolePermissions, (val) => {
  if (val?.length) localSelected.value = [...val]
})

const togglePermission = (id) => {
  const idx = localSelected.value.indexOf(id)
  if (idx === -1) localSelected.value.push(id)
  else localSelected.value.splice(idx, 1)
}

const save = () => {
  store.assignPermissions(props.role.id, localSelected.value, () => emit('close'))
}
</script>