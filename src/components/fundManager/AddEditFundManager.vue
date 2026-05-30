<script setup>
import { ref, watch } from 'vue'
import { Loader2, X, Plus } from 'lucide-vue-next'
import { useFmLeaderboardStore } from '@/stores/fmLeaderboard/fmLeaderboard'
import BaseSelect from '@/components/common/BaseSelect.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: 'add' },
  item: { type: Object, default: null },
})

const emit = defineEmits(['close', 'success'])

const store = useFmLeaderboardStore()

const settlementOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
]

const form = ref({
  label_name: '',
  email: '',
  min_capital: '',
  broker_share: '',
  fm_share: '',
  ib_pool_percentage: '',
  performance_fee: '',
  settlement_type: '',
  settlement_time: '',
})

const errors = ref({})

// Function to reset the form to its initial state based on mode and item
const resetForm = () => {
  if (props.mode === 'edit' && props.item) {
    form.value = {
      label_name: props.item.label_name ?? '',
      email: '',
      min_capital: props.item.min_capital ?? '',
      broker_share: props.item.broker_share ?? '',
      fm_share: props.item.fm_share ?? '',
      ib_pool_percentage: props.item.ib_pool_percentage ?? '',
      performance_fee: props.item.performance_fee ?? '',
      settlement_type: props.item.settlement ?? '',
      settlement_time: props.item.settlement_time ?? '',
    }
  } else { // 'add' mode or no item provided
    form.value = {
      label_name: '',
      email: '',
      min_capital: '',
      broker_share: '',
      fm_share: '',
      ib_pool_percentage: '',
      performance_fee: '',
      settlement_type: '',
      settlement_time: '',
    }
  }
  errors.value = {}
}

// Watch for the dialog opening to reset the form
// This ensures that if an API call failed and the dialog was closed and reopened for the same item,
// the form will display the original item data, not the unsaved changes.
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    resetForm()
  }
}, { immediate: true }) // immediate: true to handle initial opening if component is mounted with open=true

const closeDialog = () => {
  errors.value = {}
  emit('close')
}

const validateForm = () => {
  const newErrors = {}
  if (!form.value.label_name?.trim()) newErrors.label_name = 'Required'
  if (props.mode === 'add') {
    const email = form.value.email?.trim()
    if (!email) {
      newErrors.email = 'Required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email'
    }
  }
  if (!form.value.min_capital) newErrors.min_capital = 'Required'
  if (!form.value.broker_share) newErrors.broker_share = 'Required'
  if (!form.value.fm_share) newErrors.fm_share = 'Required'
  if (!form.value.ib_pool_percentage) newErrors.ib_pool_percentage = 'Required'
  if (!form.value.performance_fee) newErrors.performance_fee = 'Required'
  if (!form.value.settlement_type) newErrors.settlement_type = 'Required'
  if (!form.value.settlement_time) newErrors.settlement_time = 'Required'

  const fm = parseFloat(form.value.fm_share) || 0
  const broker = parseFloat(form.value.broker_share) || 0
  if (Math.abs(fm + broker - 100) > 0.01) {
    newErrors.share_distribution = 'FM and Broker share must sum to exactly 100%'
  }

  if (parseFloat(form.value.ib_pool_percentage) > 100) newErrors.ib_pool_percentage = 'Max 100%'
  if (parseFloat(form.value.performance_fee) > 100) newErrors.performance_fee = 'Max 100%'

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  if (props.mode === 'add') {
    await store.createFundManager(form.value)
  } else {
    const { email, ...payload } = form.value
    await store.editFundManager(props.item.id, payload)
  }

  // Only close the dialog and emit success if there were no API errors
  if (!store.error) {
    closeDialog()
    emit('success')
  }
}

const getTitle = () => props.mode === 'add' ? 'Add Fund Manager' : 'Edit Fund Manager'
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    @click="closeDialog"
  >
    <div
      class="bg-card-background border border-primary-border rounded-2xl w-full max-w-lg flex flex-col max-h-[90vh]"
      @click.stop
    >
      <!-- Header -->
      <div class="px-5 py-4 border-b border-primary-border flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-2">
          <div class="p-1.5 rounded-lg bg-accent/10">
            <Plus class="w-4 h-4 text-accent" />
          </div>
          <div>
            <h2 class="text-primary-text text-sm font-medium">{{ getTitle() }}</h2>
            <p class="text-secondary-text text-xs mt-0.5">
              {{ mode === 'add' ? 'Create a new fund manager' : `Update fund manager ID: ${item?.id}` }}
            </p>
          </div>
        </div>
        <button
          @click="closeDialog"
          class="w-7 h-7 flex items-center justify-center rounded-lg text-secondary-text hover:text-primary-text hover:bg-primary-border transition-all cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Body -->
      <div class="px-5 py-5 flex flex-col gap-4 overflow-y-auto flex-1 no-scrollbar">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-secondary-text">
            Label Name <span class="text-primary-red">*</span>
          </label>
          <input
            v-model="form.label_name"
            type="text"
            placeholder="e.g. Growth Manager"
            class="bg-background border rounded-xl px-3.5 py-2.5 text-sm text-primary-text outline-none transition-colors"
            :class="errors.label_name ? 'border-primary-red' : 'border-primary-border focus:border-accent'"
          />
          <span v-if="errors.label_name" class="text-xs text-primary-red">{{ errors.label_name }}</span>
        </div>

        <div v-if="mode === 'add'" class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-secondary-text">
            Email <span class="text-primary-red">*</span>
          </label>
          <input
            v-model="form.email"
            type="email"
            placeholder="e.g. manager@example.com"
            class="bg-background border rounded-xl px-3.5 py-2.5 text-sm text-primary-text outline-none transition-colors"
            :class="errors.email ? 'border-primary-red' : 'border-primary-border focus:border-accent'"
          />
          <span v-if="errors.email" class="text-xs text-primary-red">{{ errors.email }}</span>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-secondary-text">
            Min Capital <span class="text-primary-red">*</span>
          </label>
          <input
            v-model="form.min_capital"
            type="number"
            placeholder="e.g. 1000"
            class="bg-background border rounded-xl px-3.5 py-2.5 text-sm text-primary-text outline-none transition-colors"
            :class="errors.min_capital ? 'border-primary-red' : 'border-primary-border focus:border-accent'"
          />
          <span v-if="errors.min_capital" class="text-xs text-primary-red">{{ errors.min_capital }}</span>
        </div>

         <!-- Row 3 — Settlement Type + Settlement Time -->
        <div class="grid grid-cols-2 gap-3">

          <!-- ✅ Change 4: Settlement Type → BaseSelect dropdown -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-secondary-text">
              Settlement Type <span class="text-primary-red">*</span>
            </label>
            <BaseSelect
              :modelValue="form.settlement_type"
              variant="surface"
              :options="settlementOptions"
              placeholder="Select type"
              :allowAll="false"
              @update:modelValue="form.settlement_type = $event"
              :class="errors.settlement_type ? 'border-primary-red' : ''"
            />
            <span v-if="errors.settlement_type" class="text-xs text-primary-red">{{ errors.settlement_type }}</span>
          </div>

          <!-- ✅ Change 3: Settlement Time → time picker -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-secondary-text">
              Settlement Time <span class="text-primary-red">*</span>
            </label>
            <input
              v-model="form.settlement_time"
              type="time"
              class="bg-background border rounded-xl px-3.5 py-2.5 text-sm text-primary-text outline-none transition-colors"
              :class="errors.settlement_time ? 'border-primary-red' : 'border-primary-border focus:border-accent'"
            />
            <span v-if="errors.settlement_time" class="text-xs text-primary-red">{{ errors.settlement_time }}</span>
          </div>

        </div>

        <!-- ✅ Change 2: Row 1 — Broker Share + FM Share -->
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-secondary-text">
              Broker Share (%) <span class="text-primary-red">*</span>
            </label>
            <input
              v-model="form.broker_share"
              type="number"
              placeholder="e.g. 50"
              class="bg-background border rounded-xl px-3.5 py-2.5 text-sm text-primary-text outline-none transition-colors"
              :class="errors.broker_share ? 'border-primary-red' : 'border-primary-border focus:border-accent'"
            />
            <span v-if="errors.broker_share" class="text-xs text-primary-red">{{ errors.broker_share }}</span>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-secondary-text">
              FM Share (%) <span class="text-primary-red">*</span>
            </label>
            <input
              v-model="form.fm_share"
              type="number"
              placeholder="e.g. 50"
              class="bg-background border rounded-xl px-3.5 py-2.5 text-sm text-primary-text outline-none transition-colors"
              :class="errors.fm_share ? 'border-primary-red' : 'border-primary-border focus:border-accent'"
            />
            <span v-if="errors.fm_share" class="text-xs text-primary-red">{{ errors.fm_share }}</span>
          </div>
        </div>

        <!-- Row 2 — IB Pool + Performance Fee -->
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-secondary-text">
              IB Pool (%) <span class="text-primary-red">*</span>
            </label>
            <input
              v-model="form.ib_pool_percentage"
              type="number"
              placeholder="e.g. 10"
              class="bg-background border rounded-xl px-3.5 py-2.5 text-sm text-primary-text outline-none transition-colors"
              :class="errors.ib_pool_percentage ? 'border-primary-red' : 'border-primary-border focus:border-accent'"
            />
            <span v-if="errors.ib_pool_percentage" class="text-xs text-primary-red">{{ errors.ib_pool_percentage }}</span>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-secondary-text">
              Performance Fee (%) <span class="text-primary-red">*</span>
            </label>
            <input
              v-model="form.performance_fee"
              type="number"
              placeholder="e.g. 20"
              class="bg-background border rounded-xl px-3.5 py-2.5 text-sm text-primary-text outline-none transition-colors"
              :class="errors.performance_fee ? 'border-primary-red' : 'border-primary-border focus:border-accent'"
            />
            <span v-if="errors.performance_fee" class="text-xs text-primary-red">{{ errors.performance_fee }}</span>
          </div>
        </div>


        <!-- ✅ Change 5: Conditional fields from FM Registration form -->
        <!-- Only shown when settlement_type type is set (mirrors FM form pattern) -->
        <template v-if="form.settlement_type">
          <div class="border-t border-primary-border pt-3 flex flex-col gap-3">
            <p class="text-xs font-medium text-secondary-text">Share Distribution</p>

            <!-- FM Share + Broker Share live sum hint (from FM form) -->
            <p
              class="text-[10px]"
              :class="Math.abs((parseFloat(form.fm_share) || 0) + (parseFloat(form.broker_share) || 0) - 100) <= 0.01
                ? 'text-green-500'
                : 'text-secondary-text'"
            >
              FM + Broker = {{ ((parseFloat(form.fm_share) || 0) + (parseFloat(form.broker_share) || 0)).toFixed(2) }} / 100
            </p>
            <span v-if="errors.share_distribution" class="text-xs text-primary-red">{{ errors.share_distribution }}</span>
          </div>
        </template>

      </div>

      <!-- Footer -->
      <div class="px-5 py-4 border-t border-primary-border flex gap-2 flex-shrink-0">
        <button
          @click="closeDialog"
          :disabled="store.isSubmitting"
          class="flex-1 px-4 py-2 rounded-xl text-sm text-secondary-text border border-primary-border hover:text-primary-text hover:bg-primary-border transition-all cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          @click="handleSubmit"
          :disabled="store.isSubmitting"
          class="flex-1 px-4 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary-hover hover:bg-accent/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Loader2 v-if="store.isSubmitting" class="w-3.5 h-3.5 animate-spin" />
          <span v-else>{{ mode === 'add' ? 'Create' : 'Update' }}</span>
        </button>
      </div>

    </div>
  </div>
</template>
