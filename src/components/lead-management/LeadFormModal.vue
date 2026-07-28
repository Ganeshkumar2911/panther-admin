<script setup>
import { ref, watch } from 'vue'
import { STAGES, STAFF, COUNTRIES, SOURCES } from '@/pages/lead-management/mockLeadData'
import { X, UserPlus, Edit, ArrowRightLeft, Upload, Check } from 'lucide-vue-next'

const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: 'add' }, // 'add', 'edit', 'moveStage', 'import'
  lead: { type: Object, default: null },
})

const emit = defineEmits(['close', 'save-lead', 'import-csv'])

const formData = ref({
  name: '',
  email: '',
  phone: '',
  country: 'United Arab Emirates',
  source: 'Website',
  assignedStaff: 'Rahul Sharma',
  stage: 'NEW',
  priority: 'Medium',
})

watch(
  () => props.lead,
  (newLead) => {
    if (newLead) {
      formData.value = {
        name: newLead.name || '',
        email: newLead.email || '',
        phone: newLead.phone || '',
        country: newLead.country || 'United Arab Emirates',
        source: newLead.source || 'Website',
        assignedStaff: newLead.assignedStaff || 'Rahul Sharma',
        stage: newLead.stage || 'NEW',
        priority: newLead.priority || 'Medium',
      }
    } else {
      formData.value = {
        name: '',
        email: '',
        phone: '',
        country: 'United Arab Emirates',
        source: 'Website',
        assignedStaff: 'Rahul Sharma',
        stage: 'NEW',
        priority: 'Medium',
      }
    }
  },
  { immediate: true }
)

function handleSubmit() {
  if (props.mode === 'import') {
    emit('import-csv')
    return
  }

  const matchedCountry = COUNTRIES.find((c) => c.name === formData.value.country)
  const matchedStaff = STAFF.find((s) => s.name === formData.value.assignedStaff)
  const matchedSource = SOURCES.find((s) => s.label === formData.value.source)

  const payload = {
    ...formData.value,
    flag: matchedCountry?.flag || '🇦🇪',
    staffAvatar: matchedStaff?.avatarColor || 'bg-blue-600',
    sourceKey: matchedSource?.key || 'website',
  }

  emit('save-lead', { mode: props.mode, leadId: props.lead?.id, payload })
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        @click="emit('close')"
      >
        <div
          class="bg-card-background border border-primary-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
          @click.stop
        >
          <!-- Header -->
          <div class="px-5 py-4 border-b border-primary-border flex items-center justify-between bg-background/50">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                <UserPlus v-if="mode === 'add'" class="w-4 h-4" />
                <Edit v-else-if="mode === 'edit'" class="w-4 h-4" />
                <ArrowRightLeft v-else-if="mode === 'moveStage'" class="w-4 h-4" />
                <Upload v-else class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-primary-text">
                  <span v-if="mode === 'add'">Create New Lead</span>
                  <span v-else-if="mode === 'edit'">Edit Lead Details</span>
                  <span v-else-if="mode === 'moveStage'">Move Lead Stage</span>
                  <span v-else>Import Leads from CSV</span>
                </h3>
                <p class="text-[11px] text-secondary-text">
                  <span v-if="mode === 'add'">Add a new lead to the CRM onboarding pipeline.</span>
                  <span v-else-if="mode === 'edit'">Update lead contact or assignment details.</span>
                  <span v-else-if="mode === 'moveStage'">Advance lead status to the next funnel stage.</span>
                  <span v-else font-sans>Upload CSV batch file to import leads.</span>
                </p>
              </div>
            </div>

            <button
              @click="emit('close')"
              class="p-1.5 rounded-lg border border-primary-border hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Body Form -->
          <form @submit.prevent="handleSubmit" class="p-5 space-y-4 text-xs">

            <!-- Mode: Move Stage Only -->
            <div v-if="mode === 'moveStage'" class="space-y-3">
              <p class="text-xs text-primary-text font-medium">
                Select target stage for lead <strong class="text-primary">{{ lead?.name }}</strong>:
              </p>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  v-for="s in STAGES"
                  :key="s.key"
                  @click="formData.stage = s.key"
                  :class="[
                    'p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer',
                    formData.stage === s.key ? s.activeGlow + ' font-bold' : 'border-primary-border bg-background hover:border-primary/40'
                  ]"
                >
                  <span class="text-[11px] uppercase tracking-tight text-primary-text">{{ s.label }}</span>
                  <Check v-if="formData.stage === s.key" class="w-3.5 h-3.5 text-primary" />
                </button>
              </div>
            </div>

            <!-- Mode: Import CSV -->
            <div v-else-if="mode === 'import'" class="space-y-3 text-center py-6">
              <div class="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
                <Upload class="w-8 h-8" />
              </div>
              <div>
                <h4 class="text-xs font-bold text-primary-text">Upload CSV File</h4>
                <p class="text-[11px] text-secondary-text mt-1 max-w-xs mx-auto">
                  Drag and drop your lead export CSV or click browse to select file (.csv, .xlsx).
                </p>
              </div>
              <div class="border-2 border-dashed border-primary-border hover:border-primary/50 rounded-xl p-6 transition-colors bg-background/50 cursor-pointer">
                <span class="text-xs text-primary font-medium">Browse File from Computer</span>
              </div>
            </div>

            <!-- Mode: Add or Edit -->
            <div v-else class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-secondary-text mb-1">Lead Name *</label>
                  <input
                    v-model="formData.name"
                    required
                    type="text"
                    placeholder="e.g. John Doe"
                    class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label class="block text-secondary-text mb-1">Email Address *</label>
                  <input
                    v-model="formData.email"
                    required
                    type="email"
                    placeholder="john@example.com"
                    class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-secondary-text mb-1">Phone Number</label>
                  <input
                    v-model="formData.phone"
                    type="text"
                    placeholder="+971 50 123 4567"
                    class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label class="block text-secondary-text mb-1">Country</label>
                  <select
                    v-model="formData.country"
                    class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option v-for="c in COUNTRIES" :key="c.code" :value="c.name">
                      {{ c.flag }} {{ c.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-secondary-text mb-1">Lead Source</label>
                  <select
                    v-model="formData.source"
                    class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option v-for="s in SOURCES" :key="s.key" :value="s.label">
                      {{ s.label }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-secondary-text mb-1">Assigned Staff</label>
                  <select
                    v-model="formData.assignedStaff"
                    class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option v-for="st in STAFF" :key="st.id" :value="st.name">
                      {{ st.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-secondary-text mb-1">Pipeline Stage</label>
                  <select
                    v-model="formData.stage"
                    class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option v-for="s in STAGES" :key="s.key" :value="s.key">
                      {{ s.label }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-secondary-text mb-1">Priority</label>
                  <select
                    v-model="formData.priority"
                    class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Footer Buttons -->
            <div class="pt-3 border-t border-primary-border flex items-center justify-end gap-2">
              <button
                type="button"
                @click="emit('close')"
                class="px-4 py-2 rounded-xl border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary-text text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-semibold transition-colors cursor-pointer"
              >
                <span v-if="mode === 'add'">Create Lead</span>
                <span v-else-if="mode === 'edit'">Save Changes</span>
                <span v-else-if="mode === 'moveStage'">Update Stage</span>
                <span v-else>Import File</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
