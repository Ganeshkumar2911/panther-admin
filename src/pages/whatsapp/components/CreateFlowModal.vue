<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import {
  X,
  Plus,
  Clock,
  Layers,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ArrowRight,
  Tag,
} from 'lucide-vue-next'
import { useWhatsAppFlowsStore } from '@/stores/whatsapp/flows'
import { useWhatsAppTemplatesStore } from '@/stores/whatsapp/templates'
import BaseSelect from '@/components/common/BaseSelect.vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  defaultStage: {
    type: String,
    default: 'KYC',
  },
})

const emit = defineEmits(['close', 'created'])

const flowsStore = useWhatsAppFlowsStore()
const templatesStore = useWhatsAppTemplatesStore()

// Stage quick suggestions
const stageSuggestions = [
  'KYC',
  'ONBOARDING',
  'DEPOSIT',
  'TRADING',
  'WITHDRAWAL',
  'COMPLETED',
  'RETENTION',
]

const intervalPresets = [
  { label: '12 Hours', value: 12 },
  { label: '24 Hours (1 Day)', value: 24 },
  { label: '48 Hours (2 Days)', value: 48 },
  { label: '72 Hours (3 Days)', value: 72 },
  { label: '7 Days', value: 168 },
]

const form = reactive({
  stage: 'KYC',
  template_name: '',
  execution_order: 1,
  interval_hours: 24,
})

const errors = reactive({
  stage: '',
  template_name: '',
  execution_order: '',
  interval_hours: '',
})

// Auto compute next execution order based on selected stage
const computeNextOrder = (stage) => {
  const stageFlows = (flowsStore.flows || []).filter(
    (f) => (f.stage || '').toUpperCase() === (stage || '').toUpperCase()
  )
  if (stageFlows.length === 0) {
    const allFlows = flowsStore.flows || []
    return allFlows.length + 1
  }
  const maxOrder = Math.max(...stageFlows.map((f) => Number(f.execution_order) || 0))
  return maxOrder + 1
}

onMounted(() => {
  if (templatesStore.templates.length === 0) {
    templatesStore.fetchTemplates()
  }
})

watch(
  () => props.open,
  (val) => {
    if (val) {
      if (templatesStore.templates.length === 0) {
        templatesStore.fetchTemplates()
      }
      form.stage = props.defaultStage || 'KYC'
      form.execution_order = computeNextOrder(form.stage)
      form.interval_hours = 24
      form.template_name = ''
      errors.stage = ''
      errors.template_name = ''
      errors.execution_order = ''
      errors.interval_hours = ''
    }
  }
)

watch(
  () => form.stage,
  (newStage) => {
    form.execution_order = computeNextOrder(newStage)
  }
)

// Templates options for BaseSelect
const templateSelectOptions = computed(() => {
  return (templatesStore.templates || []).map((tpl) => ({
    label: `${tpl.name} (${tpl.category || 'MARKETING'})`,
    value: tpl.name,
    category: tpl.category,
    status: tpl.status,
    body: tpl.body_text,
  }))
})

// Selected template details for preview inside modal
const selectedTemplateObj = computed(() => {
  if (!form.template_name) return null
  return (templatesStore.templates || []).find(
    (t) => (t.name || '').toLowerCase() === form.template_name.toLowerCase()
  )
})

const selectStageSuggestion = (suggestion) => {
  form.stage = suggestion
}

const validate = () => {
  let valid = true
  errors.stage = ''
  errors.template_name = ''
  errors.execution_order = ''
  errors.interval_hours = ''

  if (!form.stage || !form.stage.trim()) {
    errors.stage = 'Stage / Flow Name is required'
    valid = false
  }

  if (!form.template_name) {
    errors.template_name = 'Please select a WhatsApp template'
    valid = false
  }

  if (form.execution_order === '' || form.execution_order === null || Number(form.execution_order) < 1) {
    errors.execution_order = 'Execution order must be at least 1'
    valid = false
  }

  if (form.interval_hours === '' || form.interval_hours === null || Number(form.interval_hours) < 0) {
    errors.interval_hours = 'Interval hours cannot be negative'
    valid = false
  }

  return valid
}

const handleSubmit = async () => {
  if (!validate()) return

  const payload = {
    stage: form.stage.trim().toUpperCase(),
    template_name: form.template_name.trim(),
    execution_order: Number(form.execution_order),
    interval_hours: Number(form.interval_hours),
    is_active: true, // by default all flows are active
  }

  try {
    await flowsStore.createFlow(payload)
    emit('created')
    emit('close')
  } catch (err) {
    // Error is handled in store snackbar
  }
}
</script>

<template>
  <Transition name="modal-fade">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      @click.self="emit('close')"
    >
      <div
        class="bg-card-background border border-primary-border rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0 bg-background/40">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Plus class="w-5 h-5" />
            </div>
            <div>
              <h2 class="text-base font-bold text-primary-text">Create Flow Step</h2>
              <p class="text-xs text-secondary-text">
                Add an automated WhatsApp message step to the customer journey drip
              </p>
            </div>
          </div>
          <button
            class="w-8 h-8 rounded-lg flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
            @click="emit('close')"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="flex-1 overflow-y-auto p-6 space-y-5">
          <!-- 1. Stage / Flow Name Input Box -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-xs font-bold text-primary-text">
                Flow Stage / Journey Name <span class="text-primary-red">*</span>
              </label>
              <span class="text-[11px] text-secondary-text">
                Type flow name or pick a suggestion
              </span>
            </div>

            <div class="relative">
              <input
                v-model="form.stage"
                type="text"
                placeholder="e.g. KYC, ONBOARDING, DEPOSIT, TRADING, RETENTION..."
                class="input-field px-3.5 py-2.5 text-xs sm:text-sm font-semibold uppercase tracking-wider font-mono"
                :class="{ '!border-primary-red ring-1 ring-primary-red/20': errors.stage }"
                @input="errors.stage = ''"
              />
            </div>

            <p v-if="errors.stage" class="text-xs text-primary-red mt-1 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5" /> {{ errors.stage }}
            </p>

            <!-- Quick Stage Suggestions -->
            <div class="flex flex-wrap items-center gap-1.5 mt-2.5">
              <span class="text-[11px] font-medium text-secondary-text">Suggestions:</span>
              <button
                v-for="sug in stageSuggestions"
                :key="sug"
                type="button"
                class="px-2.5 py-0.5 rounded-md text-[11px] font-semibold border transition-all cursor-pointer"
                :class="[
                  form.stage.toUpperCase() === sug
                    ? 'bg-primary text-white border-primary'
                    : 'bg-background hover:bg-card-background border-primary-border text-secondary-text hover:text-primary-text',
                ]"
                @click="selectStageSuggestion(sug)"
              >
                {{ sug }}
              </button>
            </div>
          </div>

          <!-- 2. WhatsApp Template Selection -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-xs font-bold text-primary-text">
                WhatsApp Template <span class="text-primary-red">*</span>
              </label>
              <span class="text-[11px] text-secondary-text">
                Only approved templates are dispatched
              </span>
            </div>

            <BaseSelect
              v-model="form.template_name"
              :options="templateSelectOptions"
              placeholder="Select an approved WhatsApp template..."
              searchable
              class="w-full"
            />
            <p v-if="errors.template_name" class="text-xs text-primary-red mt-1 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5" /> {{ errors.template_name }}
            </p>

            <!-- Template Live Preview Snippet -->
            <div
              v-if="selectedTemplateObj"
              class="mt-2.5 p-3.5 rounded-xl border border-primary-border bg-background/70 space-y-2 text-xs"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <FileText class="w-3.5 h-3.5 text-primary" />
                  <span class="font-mono font-bold text-primary-text">{{ selectedTemplateObj.name }}</span>
                  <span class="text-[10px] uppercase font-semibold px-2 py-0.2 rounded border bg-primary/10 text-primary border-primary/20">
                    {{ selectedTemplateObj.category }}
                  </span>
                </div>
                <span class="text-[11px] text-secondary-text">
                  Status: <strong class="text-primary-green">{{ selectedTemplateObj.status }}</strong>
                </span>
              </div>
              <p
                v-if="selectedTemplateObj.body_text"
                class="text-xs text-secondary-text bg-card-background p-2.5 rounded-lg border border-primary-border line-clamp-3 leading-relaxed font-sans"
              >
                {{ selectedTemplateObj.body_text }}
              </p>
            </div>
          </div>

          <!-- 3. Interval (Delay Hours) & Execution Order -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Execution Order -->
            <div>
              <label class="block text-xs font-bold text-primary-text mb-1.5">
                Execution Order <span class="text-primary-red">*</span>
              </label>
              <div class="relative">
                <input
                  v-model.number="form.execution_order"
                  type="number"
                  min="1"
                  placeholder="e.g. 1, 2, 3"
                  class="input-field px-3 py-2 text-xs font-mono font-bold"
                />
              </div>
              <span class="text-[11px] text-secondary-text mt-1 block">
                Sequence position for execution (1 = 1st step)
              </span>
              <p v-if="errors.execution_order" class="text-xs text-primary-red mt-1 flex items-center gap-1">
                <AlertCircle class="w-3.5 h-3.5" /> {{ errors.execution_order }}
              </p>
            </div>

            <!-- Interval Hours -->
            <div>
              <label class="block text-xs font-bold text-primary-text mb-1.5">
                Interval Delay (Hours) <span class="text-primary-red">*</span>
              </label>
              <div class="relative">
                <input
                  v-model.number="form.interval_hours"
                  type="number"
                  min="0"
                  placeholder="e.g. 24"
                  class="input-field px-3 py-2 text-xs font-mono font-bold"
                />
              </div>
              <span class="text-[11px] text-secondary-text mt-1 block">
                Wait time before sending this message
              </span>
              <p v-if="errors.interval_hours" class="text-xs text-primary-red mt-1 flex items-center gap-1">
                <AlertCircle class="w-3.5 h-3.5" /> {{ errors.interval_hours }}
              </p>
            </div>
          </div>

          <!-- Quick Interval Presets -->
          <div>
            <span class="text-[11px] font-semibold text-secondary-text block mb-1.5">Quick Interval Presets:</span>
            <div class="flex flex-wrap items-center gap-1.5">
              <button
                v-for="preset in intervalPresets"
                :key="preset.value"
                type="button"
                class="px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer"
                :class="[
                  form.interval_hours === preset.value
                    ? 'bg-primary text-white border-primary'
                    : 'bg-card-background border-primary-border text-secondary-text hover:text-primary-text hover:bg-background',
                ]"
                @click="form.interval_hours = preset.value"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-primary-border bg-background/50 flex items-center justify-between shrink-0">
          <button
            type="button"
            class="px-4 py-2 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
            :disabled="flowsStore.actionLoading"
            @click="emit('close')"
          >
            Cancel
          </button>

          <button
            type="button"
            class="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-semibold transition-all duration-150 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="flowsStore.actionLoading"
            @click="handleSubmit"
          >
            <Plus v-if="!flowsStore.actionLoading" class="w-4 h-4" />
            <div
              v-else
              class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
            />
            <span>{{ flowsStore.actionLoading ? 'Creating Step...' : 'Create Flow Step' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
