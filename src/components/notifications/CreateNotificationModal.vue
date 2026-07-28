<script setup>
import { ref, reactive, watch } from 'vue'
import { useNotificationsStore } from '@/stores/notifications/notifications'
import { useClientLedgerStore } from '@/stores/clientLedger/clientLedger'
import { X, Send, Bell, UserPlus } from 'lucide-vue-next'
import BaseSelect from '@/components/common/BaseSelect.vue'

const typeOptions = [
  { label: 'Announcement', value: 'ANNOUNCEMENT' },
  { label: 'System Alert', value: 'SYSTEM' },
  { label: 'Promotion', value: 'PROMOTION' },
  { label: 'Critical Alert', value: 'ALERT' },
]

const priorityOptions = [
  { label: 'High Priority', value: 'HIGH' },
  { label: 'Medium Priority', value: 'MEDIUM' },
  { label: 'Low Priority', value: 'LOW' },
]

const props = defineProps({
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

const store = useNotificationsStore()
const clientLedgerStore = useClientLedgerStore()

const clientOptions = ref([])
const isSearchingClients = ref(false)
let clientSearchTimer = null

const selectedUsers = ref([])
const selectedUserSelect = ref(null)

const form = reactive({
  title: '',
  message: '',
  note: '',
  type: 'ANNOUNCEMENT',
  priority: 'HIGH',
  action_url: '',
  metadata_key: '',
  metadata_value: '',
  sendToAll: true,
  roles: {
    client: false,
    fm: false,
    ib: false,
    admin: false,
  },
  userIds: '',
})

function onClientSearch(query) {
  clearTimeout(clientSearchTimer)
  isSearchingClients.value = true

  clientSearchTimer = setTimeout(async () => {
    try {
      const results = await clientLedgerStore.fetchAllClients(query || '')
      clientOptions.value = results
    } catch (err) {
      clientOptions.value = []
    } finally {
      isSearchingClients.value = false
    }
  }, 250)
}

function handleUserSelect(val) {
  if (!val) return
  const found = clientOptions.value.find((o) => o.value === val)
  if (found) {
    if (!selectedUsers.value.some((u) => u.id === found.value)) {
      selectedUsers.value.push({
        id: found.value,
        name: found.label,
        email: found.email || '',
      })
    }
  }
  selectedUserSelect.value = null
}

function removeUser(userId) {
  selectedUsers.value = selectedUsers.value.filter((u) => u.id !== userId)
}

// Initial fetch when drawer opens
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      onClientSearch('')
    }
  }
)

function resetForm() {
  form.title = ''
  form.message = ''
  form.note = ''
  form.type = 'ANNOUNCEMENT'
  form.priority = 'HIGH'
  form.action_url = ''
  form.metadata_key = ''
  form.metadata_value = ''
  form.sendToAll = true
  form.roles.client = false
  form.roles.fm = false
  form.roles.ib = false
  form.roles.admin = false
  form.userIds = ''
  selectedUsers.value = []
  selectedUserSelect.value = null
}

function handleSubmit() {
  if (!form.title.trim() || !form.message.trim()) return

  // Build target list according to API spec
  const targets = []

  if (form.sendToAll) {
    targets.push({ target_type: 'ALL' })
  } else {
    // Add selected roles
    Object.entries(form.roles).forEach(([roleName, isSelected]) => {
      if (isSelected) {
        targets.push({ target_type: 'ROLE', target_id: roleName })
      }
    })

    // Add selected users from multi-select search
    selectedUsers.value.forEach((u) => {
      targets.push({ target_type: 'USER', target_id: String(u.id) })
    })

    // Add specific user IDs from text input if provided
    if (form.userIds.trim()) {
      const ids = form.userIds.split(',').map((id) => id.trim()).filter(Boolean)
      ids.forEach((id) => {
        if (!targets.some((t) => t.target_type === 'USER' && String(t.target_id) === String(id))) {
          targets.push({ target_type: 'USER', target_id: String(id) })
        }
      })
    }
  }

  // Fallback to ALL if no targets selected
  if (targets.length === 0) {
    targets.push({ target_type: 'ALL' })
  }

  let metadata_json = null
  if (form.metadata_key.trim() && form.metadata_value.trim()) {
    metadata_json = { [form.metadata_key.trim()]: form.metadata_value.trim() }
  }

  const payload = {
    title: form.title.trim(),
    message: form.message.trim(),
    note: form.note.trim() || null,
    type: form.type,
    priority: form.priority,
    action_url: form.action_url.trim() || null,
    metadata_json,
    targets,
  }

  store.createNotification(payload, () => {
    resetForm()
    emit('close')
  })
}
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop Overlay -->
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
        @click="emit('close')"
      />
    </Transition>

    <!-- Side Panel Drawer -->
    <Transition name="slide-right">
      <div
        v-if="open"
        class="fixed top-0 right-0 z-50 h-full w-full sm:w-[480px] lg:w-[480px] bg-card-background border-l border-primary-border shadow-2xl flex flex-col justify-between overflow-hidden"
      >
        <!-- Header -->
        <div class="px-5 py-4 border-b border-primary-border flex items-center justify-between bg-background/50 shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
              <Bell class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-primary-text">Create & Dispatch Notification</h3>
              <p class="text-[11px] text-secondary-text">Broadcast alerts or targeted memos to users.</p>
            </div>
          </div>

          <button
            type="button"
            @click="emit('close')"
            class="p-1.5 rounded-lg border border-primary-border hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="handleSubmit" class="p-5 overflow-y-auto space-y-4 text-xs no-scrollbar flex-1 flex flex-col justify-between">
          <div class="space-y-4">
            <!-- Title & Type -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="sm:col-span-2">
                <label class="block text-secondary-text font-medium mb-1">Title *</label>
                <input
                  v-model="form.title"
                  required
                  type="text"
                  placeholder="e.g. Scheduled System Maintenance"
                  class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label class="block text-secondary-text font-medium mb-1">Type</label>
                <BaseSelect
                  v-model="form.type"
                  :options="typeOptions"
                  placeholder="Select Type"
                />
              </div>
            </div>

            <!-- Priority & Action URL -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-secondary-text font-medium mb-1">Priority</label>
                <BaseSelect
                  v-model="form.priority"
                  :options="priorityOptions"
                  placeholder="Select Priority"
                />
              </div>

              <div class="sm:col-span-2">
                <label class="block text-secondary-text font-medium mb-1">Action URL (Optional)</label>
                <input
                  v-model="form.action_url"
                  type="url"
                  placeholder="https://example.com/status"
                  class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <!-- Message Body -->
            <div>
              <label class="block text-secondary-text font-medium mb-1">Message Content *</label>
              <textarea
                v-model="form.message"
                required
                rows="3"
                placeholder="The system will undergo scheduled maintenance tonight at 12:00 AM UTC..."
                class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <!-- Internal Admin Note -->
            <div>
              <label class="block text-secondary-text font-medium mb-1">Internal Admin Note (Hidden from Users)</label>
              <input
                v-model="form.note"
                type="text"
                placeholder="Internal memo for admin tracking..."
                class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary"
              />
            </div>

            <!-- Target Selection Box -->
            <div class="bg-background border border-primary-border rounded-xl p-3.5 space-y-3">
              <span class="block text-xs font-semibold text-primary-text uppercase tracking-wider">
                Target Recipients
              </span>

              <!-- All Radio -->
              <label class="flex items-center gap-2 cursor-pointer text-xs text-primary-text font-medium">
                <input
                  type="checkbox"
                  v-model="form.sendToAll"
                  class="rounded bg-card-background border-primary-border text-primary focus:ring-0"
                />
                <span>Broadcast to ALL Users (Everyone)</span>
              </label>

              <!-- Targeted Options (if not All) -->
              <div v-if="!form.sendToAll" class="space-y-3.5 pt-2.5 border-t border-primary-border/60">
                <div>
                  <span class="block text-[11px] text-secondary-text mb-1.5 font-medium">Target Specific Roles:</span>
                  <div class="flex flex-wrap items-center gap-3">
                    <label class="flex items-center gap-1.5 text-xs text-primary-text cursor-pointer">
                      <input type="checkbox" v-model="form.roles.client" class="rounded text-primary focus:ring-0" />
                      <span>Clients (`client`)</span>
                    </label>
                    <label class="flex items-center gap-1.5 text-xs text-primary-text cursor-pointer">
                      <input type="checkbox" v-model="form.roles.fm" class="rounded text-primary focus:ring-0" />
                      <span>Fund Managers (`fm`)</span>
                    </label>
                    <label class="flex items-center gap-1.5 text-xs text-primary-text cursor-pointer">
                      <input type="checkbox" v-model="form.roles.ib" class="rounded text-primary focus:ring-0" />
                      <span>IB Partners (`ib`)</span>
                    </label>
                    <label class="flex items-center gap-1.5 text-xs text-primary-text cursor-pointer">
                      <input type="checkbox" v-model="form.roles.admin" class="rounded text-primary focus:ring-0" />
                      <span>Admins (`admin`)</span>
                    </label>
                  </div>
                </div>

                <!-- Live User Search Multi-Select -->
                <div>
                  <label class="block text-[11px] text-secondary-text mb-1 font-medium">
                    Search & Select Target Users (Multiple):
                  </label>
                  <BaseSelect
                    v-model="selectedUserSelect"
                    :options="clientOptions"
                    :isLoading="isSearchingClients"
                    placeholder="Search user by name or email..."
                    searchable
                    class="w-full"
                    @update:modelValue="handleUserSelect"
                    @search="onClientSearch"
                  />

                  <!-- Selected User Tags / Chips -->
                  <div v-if="selectedUsers.length > 0" class="flex flex-wrap gap-1.5 mt-2.5">
                    <span
                      v-for="u in selectedUsers"
                      :key="u.id"
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium"
                    >
                      <span>{{ u.name }} <span class="text-[10px] opacity-75">(#{{ u.id }})</span></span>
                      <button
                        type="button"
                        @click="removeUser(u.id)"
                        class="hover:text-rose-400 transition-colors cursor-pointer ml-0.5"
                        title="Remove user"
                      >
                        <X class="w-3 h-3" />
                      </button>
                    </span>
                  </div>
                </div>

                <!-- Optional Manual User IDs Fallback -->
                <div class="pt-2 border-t border-primary-border/40">
                  <label class="block text-[10px] text-secondary-text mb-1">Additional User IDs (Comma-separated):</label>
                  <input
                    v-model="form.userIds"
                    type="text"
                    placeholder="e.g. 793, 802"
                    class="w-full px-3 py-1.5 bg-card-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary text-xs"
                  />
                </div>
              </div>
            </div>

            <!-- Optional Metadata Key/Value -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-secondary-text mb-1">Custom Key (Optional)</label>
                <input
                  v-model="form.metadata_key"
                  type="text"
                  placeholder="e.g. event_id"
                  class="w-full px-3 py-1.5 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label class="block text-secondary-text mb-1">Custom Value (Optional)</label>
                <input
                  v-model="form.metadata_value"
                  type="text"
                  placeholder="e.g. 1042"
                  class="w-full px-3 py-1.5 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <!-- Buttons -->
          <div class="pt-4 mt-4 border-t border-primary-border flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              @click="emit('close')"
              class="px-4 py-2 rounded-xl border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary-text font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="store.createLoading"
              class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-btn-text-primary font-semibold shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send class="w-3.5 h-3.5" />
              <span>{{ store.createLoading ? 'Dispatching...' : 'Dispatch Notification' }}</span>
            </button>
          </div>
        </form>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
