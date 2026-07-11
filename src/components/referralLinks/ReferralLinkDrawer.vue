<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] bg-black/45 backdrop-blur-xs cursor-pointer"
        @click="emit('close')"
      />
    </Transition>

    <!-- Drawer Panel -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-lg bg-card-background border-l border-primary-border flex flex-col shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between">
          <div>
            <h3 class="text-sm font-semibold text-primary-text">
              {{ isEdit ? 'Edit Campaign' : 'Create Referral Link' }}
            </h3>
            <p class="text-[11px] text-secondary-text mt-0.5">
              {{ isEdit ? 'Update details and group configurations' : 'Generate standard and tracking affiliate URLs' }}
            </p>
          </div>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
            @click="emit('close')"
          >
            <X :size="16" />
          </button>
        </div>

        <!-- Scrollable Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <!-- Campaign Name -->
          <div>
            <label class="block text-xs font-semibold text-primary-text mb-1.5">Campaign Name</label>
            <input
              v-model="modalForm.name"
              type="text"
              placeholder="e.g. RAW Campaign"
              class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text/50"
            />
          </div>

          <!-- Referral Code (Auto-generated & read-only, regeneratable on create) -->
          <div>
            <label class="block text-xs font-semibold text-primary-text mb-1.5">Referral Code</label>
            <div class="flex items-center gap-2">
              <input
                v-model="modalForm.code"
                type="text"
                readonly
                class="flex-1 px-3 py-2.5 rounded-lg bg-background/50 border border-primary-border text-primary text-sm outline-none placeholder:text-secondary-text/50 font-mono uppercase"
              />
              <button
                v-if="!isEdit"
                type="button"
                class="p-2.5 rounded-lg border border-primary-border bg-background hover:bg-primary-border/20 text-secondary-text hover:text-primary-text transition cursor-pointer flex items-center justify-center shrink-0"
                title="Regenerate random code"
                @click="regenerateCode"
              >
                <RefreshCw :size="16" />
              </button>
            </div>
            <p v-if="!isEdit" class="text-[10px] text-secondary-text mt-1">Unique affiliate parameter. Auto-generated and regeneratable.</p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-xs font-semibold text-primary-text mb-1.5">Description</label>
            <textarea
              v-model="modalForm.description"
              placeholder="Explain the focus or purpose of this campaign link..."
              rows="3"
              class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text/50"
            />
          </div>

          <!-- Category Selection dropdown -->
          <div>
            <label class="block text-xs font-semibold text-primary-text mb-1.5">Category</label>
            <BaseSelect
              v-model="selectedCategoryIndex"
              :options="categoryOptions"
              placeholder="Select an account category"
              @update:modelValue="onCategorySelect"
            />
          </div>

          <!-- Selected Group Chips -->
          <div v-if="modalForm.broker_group_config_ids.length > 0" class="space-y-1.5">
            <label class="block text-xs font-semibold text-primary-text">Selected Groups ({{ modalForm.broker_group_config_ids.length }})</label>
            <div class="flex flex-wrap gap-1.5 p-2.5 bg-background border border-primary-border rounded-xl">
              <div
                v-for="chip in selectedGroupChips"
                :key="chip.config_id"
                class="inline-flex items-center gap-1.5 text-[11px] font-medium bg-primary-blue/10 text-primary-blue px-2.5 py-1 rounded-full border border-primary-blue/20"
              >
                <span>{{ chip.label }}</span>
                <button
                  type="button"
                  class="text-primary-blue/60 hover:text-primary-red transition cursor-pointer"
                  @click="removeGroup(chip.config_id)"
                >
                  <X :size="10" />
                </button>
              </div>
            </div>
          </div>

          <!-- MT5 Group Selection (Dynamic list on category selection) -->
          <div v-if="selectedCategoryIndex !== null" class="space-y-2">
            <label class="block text-xs font-semibold text-primary-text">Configure MT5 Groups</label>
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text" />
              <input
                v-model="groupSearchQuery"
                type="text"
                placeholder="Filter groups by label..."
                class="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text/50"
              />
            </div>

            <div v-if="store.groupsLoading" class="text-xs text-secondary-text py-4 text-center">
              <Loader2 class="w-4 h-4 animate-spin mx-auto mb-1.5" /> Loading groups...
            </div>
            <div v-else-if="filteredGroups.length === 0" class="text-xs text-secondary-text py-4 text-center">
              No matching MT5 groups found.
            </div>
            <div v-else class="max-h-48 overflow-y-auto border border-primary-border rounded-xl p-2 bg-background space-y-1">
              <label
                v-for="group in filteredGroups"
                :key="group.config_id"
                class="flex items-center gap-2.5 text-xs text-primary-text cursor-pointer hover:bg-card-background/60 p-2 rounded-lg transition-colors"
              >
                <input
                  type="checkbox"
                  :value="group.config_id"
                  v-model="modalForm.broker_group_config_ids"
                  class="rounded text-primary focus:ring-primary border-primary-border w-3.5 h-3.5"
                />
                <div class="flex-1 min-w-0">
                  <div class="font-medium truncate">{{ group.label }}</div>
                  <div class="text-[10px] text-secondary-text truncate">
                    {{ group.platform }} · {{ group.currency }} · {{ group.account_type }}
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-primary-border flex gap-3 bg-card-background">
          <button
            class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            :disabled="store.actionLoading || !isValid"
            class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            @click="submit"
          >
            <Loader2 v-if="store.actionLoading" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ store.actionLoading ? 'Saving...' : 'Save' }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { X, Search, Loader2, RefreshCw } from 'lucide-vue-next'
import { useIbReferralLinksStore } from '@/stores/ibTree/ibReferralLinks'

const props = defineProps({
  open: { type: Boolean, default: false },
  isEdit: { type: Boolean, default: false },
  editData: { type: Object, default: null },
  ibId: { type: [String, Number], required: true }
})

const emit = defineEmits(['close', 'success'])

const store = useIbReferralLinksStore()

// State
const selectedCategoryIndex = ref(null)
const groupSearchQuery = ref('')

// Helpers for random alphanumeric code generation
const generateRandomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const regenerateCode = () => {
  modalForm.value.code = generateRandomCode()
}

const modalForm = ref({
  name: '',
  code: '',
  description: '',
  broker_group_config_ids: []
})

// Cache of group labels/currencies to render chips of selected groups
const groupCache = ref({})

// Watch upper casing for referral code
watch(() => modalForm.value.code, (val) => {
  if (val) {
    modalForm.value.code = val.toUpperCase()
  }
})

// Watch open state to fetch categories and map default edit data
watch(() => props.open, (val) => {
  if (val) {
    store.fetchCategories()
    groupSearchQuery.value = ''
    selectedCategoryIndex.value = null

    if (props.isEdit && props.editData) {
      modalForm.value = {
        name: props.editData.name || '',
        code: props.editData.code || '',
        description: props.editData.description || '',
        broker_group_config_ids: props.editData.groups?.map(g => g.id) || []
      }

      // Initialize cache from already attached groups
      if (props.editData.groups) {
        props.editData.groups.forEach(g => {
          groupCache.value[g.id] = {
            config_id: g.id,
            label: g.label,
            platform: g.platform,
            currency: g.currency,
            account_type: g.account_type
          }
        })
      }
    } else {
      modalForm.value = {
        name: '',
        code: generateRandomCode(),
        description: '',
        broker_group_config_ids: []
      }
    }
  }
})

// Watch store groups to expand chip configurations label cache
watch(() => store.groups, (newGroups) => {
  if (newGroups) {
    newGroups.forEach(g => {
      groupCache.value[g.config_id] = {
        config_id: g.config_id,
        label: g.label,
        platform: g.platform,
        currency: g.currency,
        account_type: g.account_type
      }
    })
  }
}, { deep: true })

// Categories format for BaseSelect
const categoryOptions = computed(() => {
  return store.categories.map((c, index) => ({
    label: `${c.account_category} (${c.account_type.toUpperCase()})`,
    value: index
  }))
})

// Load groups for target category
const onCategorySelect = (index) => {
  selectedCategoryIndex.value = index
  if (index === null || index === undefined) {
    store.groups = []
    return
  }
  const categoryObj = store.categories[index]
  if (categoryObj) {
    store.fetchGroupsForCategory(categoryObj.account_category, categoryObj.account_type, 'added')
  }
}

// Filter groups via query
const filteredGroups = computed(() => {
  const query = groupSearchQuery.value.trim().toLowerCase()
  if (!query) return store.groups
  return store.groups.filter(g =>
    g.label?.toLowerCase().includes(query) ||
    g.group?.toLowerCase().includes(query)
  )
})

// Map selected group ids to label objects
const selectedGroupChips = computed(() => {
  return modalForm.value.broker_group_config_ids.map(id => {
    return groupCache.value[id] || { config_id: id, label: `ID: ${id}` }
  })
})

const removeGroup = (configId) => {
  modalForm.value.broker_group_config_ids = modalForm.value.broker_group_config_ids.filter(id => id !== configId)
}

// Validity check
const isValid = computed(() => {
  if (!modalForm.value.name) return false
  if (!props.isEdit && !modalForm.value.code) return false
  return true
})

const submit = () => {
  if (!isValid.value) return

  const payload = {
    name: modalForm.value.name,
    code: modalForm.value.code,
    description: modalForm.value.description,
    broker_group_config_ids: modalForm.value.broker_group_config_ids
  }

  const successCb = () => {
    emit('success')
    emit('close')
  }

  if (props.isEdit && props.editData) {
    store.updateReferralLink(props.ibId, props.editData.id, payload, successCb)
  } else {
    store.createReferralLink(props.ibId, payload, successCb)
  }
}
</script>

<style scoped>
/* Backdrop transitions */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease-out;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* Panel slide-out-from-right transitions */
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>
