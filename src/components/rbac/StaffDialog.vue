<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click="emit('close')">
    <div class="bg-card-background rounded-2xl border border-primary-border w-full max-w-md" @click.stop>

      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between">
        <h2 class="text-sm font-semibold text-primary-text">Add Staff</h2>
        <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors" @click="emit('close')">
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <div class="px-6 py-5 space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <p class="text-xs text-secondary-text mb-1.5">First Name</p>
            <input v-model="form.first_name" type="text" placeholder="John"
              class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text" />
          </div>
          <div>
            <p class="text-xs text-secondary-text mb-1.5">Last Name</p>
            <input v-model="form.last_name" type="text" placeholder="Doe"
              class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text" />
          </div>
        </div>
        <div>
          <p class="text-xs text-secondary-text mb-1.5">Email</p>
          <input v-model="form.email" type="email" placeholder="staff@company.com"
            class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text" />
        </div>
        <div>
          <p class="text-xs text-secondary-text mb-1.5">Password</p>
          <input v-model="form.password" type="password" placeholder="••••••••"
            class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text" />
        </div>
        <div>
          <p class="text-xs text-secondary-text mb-1.5">Role</p>
          <select v-model="form.role_id"
            class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors">
            <option value="" disabled>Select role</option>
            <option v-for="role in rolesStore.records" :key="role.id" :value="role.id">{{ role.name }}</option>
          </select>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-primary-border flex gap-3">
        <button class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors" @click="emit('close')">Cancel</button>
        <button
          :disabled="staffStore.actionLoading || !isValid"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-black bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          @click="submit"
        >
          <Loader2 v-if="staffStore.actionLoading" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ staffStore.actionLoading ? 'Creating...' : 'Create Staff' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { X, Loader2 } from 'lucide-vue-next'
import { useRbacStaffStore } from '@/stores/rbac/staff'
import { useRbacRolesStore } from '@/stores/rbac/roles'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit  = defineEmits(['close'])

const staffStore = useRbacStaffStore()
const rolesStore = useRbacRolesStore()

const form = ref({ first_name: '', last_name: '', email: '', password: '', role_id: '' })

const isValid = computed(() => form.value.first_name && form.value.email && form.value.password && form.value.role_id)

watch(() => props.open, (val) => {
  if (val) form.value = { first_name: '', last_name: '', email: '', password: '', role_id: '' }
})

const submit = () => {
  staffStore.createStaff({ ...form.value }, () => emit('close'))
}
</script>