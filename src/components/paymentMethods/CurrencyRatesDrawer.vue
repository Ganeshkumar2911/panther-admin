<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] bg-black/45 backdrop-blur-xs cursor-pointer"
        @click="handleClose"
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
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0">
          <div>
            <h3 class="text-sm font-bold text-primary-text">
              Currency Rates
            </h3>
            <p class="text-[11px] text-secondary-text mt-0.5">
              Configure exchange rates relative to USD
            </p>
          </div>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
            @click="handleClose"
          >
            <X :size="16" />
          </button>
        </div>

        <!-- Body Content -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          <!-- Mode 1: List View -->
          <template v-if="mode === 'list'">
            <!-- Controls Bar: Search & Filter & Add Button -->
            <div class="flex items-center gap-2">
              <!-- Search Input -->
              <div class="relative flex-1">
                <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search currency..."
                  class="w-full pl-8 pr-3 py-1.5 bg-background border border-primary-border rounded-lg text-xs text-primary-text placeholder:text-secondary-text/60 outline-none focus:border-primary transition-all"
                />
              </div>

              <!-- Filter Tabs -->
              <div class="flex items-center p-0.5 bg-background border border-primary-border rounded-lg text-[11px] shrink-0">
                <button
                  v-for="tab in filterTabs"
                  :key="tab.value"
                  class="px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer select-none"
                  :class="activeTab === tab.value
                    ? 'bg-card-background text-primary font-semibold shadow-2xs'
                    : 'text-secondary-text hover:text-primary-text'"
                  @click="setFilterTab(tab.value)"
                >
                  {{ tab.label }}
                </button>
              </div>

              <!-- Add Rate Button -->
              <button
                v-if="hasPermission('payment_methods.create')"
                class="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-medium transition active:scale-95 cursor-pointer shrink-0"
                @click="openCreateForm"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>Add Rate</span>
              </button>
            </div>

            <!-- Rates List -->
            <!-- Loading Skeletons -->
            <div v-if="currencyStore.loading" class="space-y-2 pt-2">
              <div v-for="n in 3" :key="n" class="bg-background border border-primary-border rounded-lg p-3.5 animate-pulse space-y-2">
                <div class="flex justify-between items-center">
                  <div class="h-4 w-24 bg-card-background rounded" />
                  <div class="h-4 w-12 bg-card-background rounded-full" />
                </div>
                <div class="h-3 w-44 bg-card-background rounded" />
              </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="filteredRecords.length === 0" class="py-12 text-center bg-background/30 border border-dashed border-primary-border rounded-lg p-6 space-y-2">
              <p class="text-xs font-semibold text-primary-text">No currency rates found</p>
              <p class="text-[11px] text-secondary-text max-w-xs mx-auto">
                {{ searchQuery ? 'No rates match your search query.' : 'Add currency exchange rates (e.g. INR, USD).' }}
              </p>
              <button
                v-if="hasPermission('payment_methods.create') && !searchQuery"
                class="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-medium transition cursor-pointer"
                @click="openCreateForm"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>Add Currency Rate</span>
              </button>
            </div>

            <!-- Clean Rate Items List -->
            <div v-else class="space-y-2.5 pt-1">
              <div
                v-for="rate in filteredRecords"
                :key="rate.id"
                class="flex items-center justify-between p-3.5 bg-background border border-primary-border rounded-lg hover:border-primary/30 transition-all group"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <!-- Currency ISO Tag -->
                  <div class="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-mono font-bold text-xs text-primary shrink-0">
                    {{ rate.currency }}
                  </div>

                  <!-- Info -->
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-bold text-primary-text truncate">
                        {{ rate.label || rate.currency }}
                      </span>
                      <span
                        class="text-[9px] font-semibold px-2 py-0.5 rounded-full border uppercase"
                        :class="rate.is_active
                          ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                          : 'bg-primary-red/10 text-primary-red border-primary-red/20'"
                      >
                        {{ rate.is_active ? 'Active' : 'Inactive' }}
                      </span>
                    </div>

                    <p class="text-[11px] text-secondary-text mt-0.5 font-mono">
                      1 {{ rate.currency }} = ${{ formatRate(rate.rate_to_usd) }} USD
                      <span class="text-secondary-text/40 mx-1">•</span>
                      1 USD = {{ formatUnits(rate.units_per_usd, rate.rate_to_usd) }} {{ rate.currency }}
                    </p>

                    <p v-if="rate.description" class="text-[10px] text-secondary-text/75 truncate mt-0.5">
                      {{ rate.description }}
                    </p>
                  </div>
                </div>

                <!-- Quick Action Buttons -->
                <div class="flex items-center gap-1.5 shrink-0 ml-3">
                  <button
                    v-if="hasPermission('payment_methods.update')"
                    class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-card-background border border-transparent hover:border-primary-border text-secondary-text hover:text-primary transition cursor-pointer"
                    title="Edit Rate"
                    @click="openEditForm(rate)"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                  </button>

                  <button
                    v-if="hasPermission('payment_methods.delete') && rate.is_active"
                    class="w-7 h-7 flex items-center justify-center rounded-lg border border-primary-red/30 hover:bg-primary-red/10 text-primary-red transition cursor-pointer disabled:opacity-50"
                    :disabled="currencyStore.deactivatingId === rate.id"
                    title="Deactivate Rate"
                    @click="handleDeactivate(rate)"
                  >
                    <Loader2 v-if="currencyStore.deactivatingId === rate.id" class="w-3.5 h-3.5 animate-spin text-primary-red" />
                    <PowerOff v-else class="w-3.5 h-3.5 text-primary-red" />
                  </button>

                  <button
                    v-else-if="hasPermission('payment_methods.update') && !rate.is_active"
                    class="w-7 h-7 flex items-center justify-center rounded-lg border border-primary-green/30 hover:bg-primary-green/10 text-primary-green transition cursor-pointer"
                    title="Activate Rate"
                    @click="handleActivate(rate)"
                  >
                    <Check class="w-3.5 h-3.5 text-primary-green" />
                  </button>
                </div>
              </div>
            </div>
          </template>

          <!-- Mode 2: Create / Edit Form View -->
          <template v-else-if="mode === 'create' || mode === 'edit'">
            <div class="space-y-4">
              <!-- Form Header -->
              <div class="flex items-center justify-between pb-3 border-b border-primary-border">
                <button
                  class="flex items-center gap-1 text-xs font-medium text-secondary-text hover:text-primary-text transition cursor-pointer"
                  @click="mode = 'list'"
                >
                  <ArrowLeft class="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <span class="text-xs font-bold text-primary">
                  {{ mode === 'create' ? 'Add Currency Rate' : `Edit ${formData.currency}` }}
                </span>
              </div>

              <!-- Form Inputs -->
              <div class="space-y-3.5">
                <!-- Currency ISO -->
                <div>
                  <label class="block text-xs font-semibold text-primary-text mb-1">
                    Currency ISO Code <span class="text-primary-red">*</span>
                  </label>
                  <input
                    v-model="formData.currency"
                    type="text"
                    maxlength="3"
                    placeholder="e.g. INR"
                    class="w-full px-3 py-2 rounded-lg bg-background border text-xs font-mono font-bold uppercase text-primary-text outline-none focus:border-primary transition"
                    :class="formErrors.currency ? 'border-primary-red' : 'border-primary-border'"
                    @input="formData.currency = formData.currency.toUpperCase()"
                  />
                  <p v-if="formErrors.currency" class="text-[10px] text-primary-red mt-1">
                    {{ formErrors.currency }}
                  </p>
                  <p v-else class="text-[10px] text-secondary-text mt-1">
                    3-letter currency code (e.g. INR, USD, EUR).
                  </p>
                </div>

                <!-- Rate to USD -->
                <div>
                  <label class="block text-xs font-semibold text-primary-text mb-1">
                    Rate to USD <span class="text-primary-red">*</span>
                  </label>
                  <input
                    v-model.number="formData.rate_to_usd"
                    type="number"
                    step="any"
                    min="0.00000001"
                    placeholder="e.g. 0.012 for INR, 1.0 for USD"
                    class="w-full px-3 py-2 rounded-lg bg-background border text-xs font-mono text-primary-text outline-none focus:border-primary transition"
                    :class="formErrors.rate_to_usd ? 'border-primary-red' : 'border-primary-border'"
                  />
                  <p v-if="formErrors.rate_to_usd" class="text-[10px] text-primary-red mt-1">
                    {{ formErrors.rate_to_usd }}
                  </p>
                  <p v-else-if="calculatedRatePreview.isValid" class="text-[10px] text-secondary-text font-mono mt-1">
                    1 {{ formData.currency || 'unit' }} = ${{ calculatedRatePreview.rateFormatted }} USD (1 USD = {{ calculatedRatePreview.unitsPerUsd }} {{ formData.currency || 'units' }})
                  </p>
                  <p v-else class="text-[10px] text-secondary-text mt-1">
                    USD value of 1 unit of this currency.
                  </p>
                </div>

                <!-- Display Label -->
                <div>
                  <label class="block text-xs font-semibold text-primary-text mb-1">
                    Display Label
                  </label>
                  <input
                    v-model="formData.label"
                    type="text"
                    placeholder="e.g. Indian Rupee"
                    class="w-full px-3 py-2 rounded-lg bg-background border border-primary-border text-xs text-primary-text outline-none focus:border-primary transition"
                  />
                </div>

                <!-- Description -->
                <div>
                  <label class="block text-xs font-semibold text-primary-text mb-1">
                    Description / Notes
                  </label>
                  <textarea
                    v-model="formData.description"
                    rows="2"
                    placeholder="Admin notes or conversion details"
                    class="w-full px-3 py-2 rounded-lg bg-background border border-primary-border text-xs text-primary-text outline-none focus:border-primary transition resize-none"
                  />
                </div>

                <!-- Active Toggle Switch -->
                <div class="flex items-center justify-between p-3 rounded-lg bg-background border border-primary-border">
                  <div>
                    <p class="text-xs font-semibold text-primary-text">Active Status</p>
                    <p class="text-[10px] text-secondary-text">Enable rate for deposits</p>
                  </div>
                  <button
                    type="button"
                    class="relative w-11 h-6 rounded-full transition-colors flex-shrink-0 cursor-pointer"
                    :class="formData.is_active ? 'bg-primary-green' : 'bg-primary-red'"
                    @click="formData.is_active = !formData.is_active"
                  >
                    <span
                      class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
                      :class="formData.is_active ? 'translate-x-5' : 'translate-x-0'"
                    />
                  </button>
                </div>
              </div>
            </div>
          </template>

        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-primary-border bg-card-background flex items-center justify-end gap-3 shrink-0">
          <template v-if="mode === 'list'">
            <button
              class="w-full px-4 py-2 rounded-lg text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition cursor-pointer"
              @click="handleClose"
            >
              Close
            </button>
          </template>

          <template v-else>
            <button
              class="px-4 py-2 rounded-lg text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition cursor-pointer"
              :disabled="currencyStore.submitting"
              @click="mode = 'list'"
            >
              Cancel
            </button>

            <button
              class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              :disabled="currencyStore.submitting"
              @click="handleSubmit"
            >
              <Loader2 v-if="currencyStore.submitting" class="w-3.5 h-3.5 animate-spin" />
              <span>{{ currencyStore.submitting ? 'Saving...' : (mode === 'create' ? 'Create Rate' : 'Save Changes') }}</span>
            </button>
          </template>
        </div>

      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import {
  X,
  Plus,
  Pencil,
  PowerOff,
  Check,
  Search,
  ArrowLeft,
  Loader2,
} from 'lucide-vue-next'
import { useCurrencyRatesStore } from '@/stores/paymentMethods/currencyRates'
import { usePermissionCheck } from '@/composables/usePermissionCheck'

const props = defineProps({
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

const currencyStore = useCurrencyRatesStore()
const { hasPermission } = usePermissionCheck()

// Component State
const mode = ref('list') // 'list' | 'create' | 'edit'
const searchQuery = ref('')
const activeTab = ref('all') // 'all' | 'active' | 'inactive'
const editingId = ref(null)

// Form State
const formData = ref({
  currency: '',
  rate_to_usd: null,
  label: '',
  description: '',
  is_active: true,
})

const formErrors = ref({})

// Filter Tabs Config
const filterTabs = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

// Fetch data on open
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      mode.value = 'list'
      searchQuery.value = ''
      activeTab.value = 'all'
      currencyStore.fetchCurrencyRates(null, true)
    }
  },
  { immediate: true }
)

// Computed Filtered Records
const filteredRecords = computed(() => {
  let list = currencyStore.records || []

  if (activeTab.value === 'active') {
    list = list.filter((r) => r.is_active)
  } else if (activeTab.value === 'inactive') {
    list = list.filter((r) => !r.is_active)
  }

  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (r) =>
        (r.currency && r.currency.toLowerCase().includes(q)) ||
        (r.label && r.label.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q))
    )
  }

  return list
})

// Rate calculation helper for form inline text
const calculatedRatePreview = computed(() => {
  const rate = Number(formData.value.rate_to_usd)
  if (!rate || isNaN(rate) || rate <= 0) {
    return { isValid: false }
  }

  const rateFormatted = rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })
  const unitsPerUsd = (1 / rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })

  return {
    isValid: true,
    rateFormatted,
    unitsPerUsd,
  }
})

// Handlers
const setFilterTab = (tabValue) => {
  activeTab.value = tabValue
}

const handleClose = () => {
  mode.value = 'list'
  emit('close')
}

const openCreateForm = () => {
  mode.value = 'create'
  editingId.value = null
  formErrors.value = {}
  formData.value = {
    currency: '',
    rate_to_usd: null,
    label: '',
    description: '',
    is_active: true,
  }
}

const openEditForm = (rateRecord) => {
  mode.value = 'edit'
  editingId.value = rateRecord.id
  formErrors.value = {}
  formData.value = {
    currency: rateRecord.currency || '',
    rate_to_usd: rateRecord.rate_to_usd ?? null,
    label: rateRecord.label || '',
    description: rateRecord.description || '',
    is_active: rateRecord.is_active ?? true,
  }
}

const validateForm = () => {
  const errors = {}

  if (!formData.value.currency || !formData.value.currency.trim()) {
    errors.currency = 'Currency code is required'
  } else if (formData.value.currency.trim().length !== 3) {
    errors.currency = 'Currency must be a 3-letter ISO code (e.g. INR)'
  }

  if (formData.value.rate_to_usd === null || formData.value.rate_to_usd === undefined || formData.value.rate_to_usd === '') {
    errors.rate_to_usd = 'Rate to USD is required'
  } else if (Number(formData.value.rate_to_usd) <= 0) {
    errors.rate_to_usd = 'Rate to USD must be greater than zero'
  }

  formErrors.value = errors
  return Object.keys(errors).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  const payload = {
    currency: formData.value.currency.trim().toUpperCase(),
    rate_to_usd: Number(formData.value.rate_to_usd),
    label: formData.value.label ? formData.value.label.trim() : '',
    description: formData.value.description ? formData.value.description.trim() : '',
    is_active: formData.value.is_active,
  }

  try {
    if (mode.value === 'create') {
      await currencyStore.createCurrencyRate(payload)
    } else if (mode.value === 'edit' && editingId.value) {
      await currencyStore.updateCurrencyRate(editingId.value, payload)
    }
    mode.value = 'list'
  } catch (err) {
    if (err?.message) {
      const msg = err.message.toLowerCase()
      if (msg.includes('currency')) {
        formErrors.value.currency = err.message
      } else if (msg.includes('rate')) {
        formErrors.value.rate_to_usd = err.message
      }
    }
  }
}

const handleDeactivate = async (rate) => {
  try {
    await currencyStore.deactivateCurrencyRate(rate.id)
  } catch (e) {
    // Error handled in store
  }
}

const handleActivate = async (rate) => {
  try {
    await currencyStore.updateCurrencyRate(rate.id, { is_active: true })
  } catch (e) {
    // Error handled in store
  }
}

// Helpers
const formatRate = (val) => {
  if (val === undefined || val === null) return '0'
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })
}

const formatUnits = (unitsVal, rateVal) => {
  if (unitsVal !== undefined && unitsVal !== null && !isNaN(Number(unitsVal))) {
    return Number(unitsVal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
  }
  const r = Number(rateVal)
  if (!r || isNaN(r) || r <= 0) return '0'
  return (1 / r).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
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
