<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    @click.self="emit('close')"
  >
    <div class="bg-card-background rounded-2xl border border-primary-border w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] shadow-2xl shadow-black/20" @click.stop>
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2">
          <Tag class="w-4 h-4 text-primary" />
          <h2 class="text-sm font-bold text-primary-text">
            {{ isEditing ? 'Edit Subscription Offer' : 'Create Subscription Offer' }}
          </h2>
        </div>
        <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors cursor-pointer" @click="emit('close')">
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        <!-- Basic Info -->
        <div class="bg-background border border-primary-border rounded-xl p-4 space-y-4">
          <p class="text-[11px] uppercase tracking-widest font-semibold text-secondary-text">Basic Information</p>
          <div>
            <p class="text-xs text-secondary-text mb-1.5">Offer Name</p>
            <input
              v-model="form.name"
              type="text"
              placeholder="e.g. VIP Offer"
              class="w-full px-3 py-2.5 rounded-lg bg-card-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
            />
          </div>
          <div>
            <p class="text-xs text-secondary-text mb-1.5">Visibility</p>
            <div class="flex items-center gap-1 bg-card-background border border-primary-border rounded-lg p-1 w-fit">
              <button
                v-for="v in ['public', 'private']"
                :key="v"
                type="button"
                class="px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors cursor-pointer"
                :class="form.visibility === v ? 'bg-primary text-white' : 'text-secondary-text hover:text-primary-text'"
                @click="form.visibility = v"
              >
                {{ v }}
              </button>
            </div>
            <p class="text-[11px] text-secondary-text/90 mt-2">
              Public offers are visible to all followers registering a subscription. Private offers are accessible via direct join links.
            </p>
          </div>
          <div>
            <p class="text-xs text-secondary-text mb-1.5">Summary</p>
            <textarea
              v-model="form.summary"
              rows="2"
              placeholder="Brief description..."
              class="w-full px-3 py-2.5 rounded-lg bg-card-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text resize-none"
            />
          </div>
        </div>

        <!-- Fees -->
        <div class="bg-background border border-primary-border rounded-xl p-4 space-y-4">
          <p class="text-[11px] uppercase tracking-widest font-semibold text-secondary-text">Fees</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p class="text-xs text-secondary-text mb-1.5">Performance Fee (%)</p>
              <input
                v-model.number="form.performance_fee"
                type="number"
                min="0"
                max="100"
                placeholder="e.g. 15"
                class="w-full px-3 py-2.5 rounded-lg bg-card-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
              />
            </div>
            <div>
              <p class="text-xs text-secondary-text mb-1.5">Management Fee (%)</p>
              <input
                v-model.number="form.management_fee"
                type="number"
                min="0"
                max="100"
                placeholder="e.g. 10"
                class="w-full px-3 py-2.5 rounded-lg bg-card-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
              />
            </div>
            <div>
              <p class="text-xs text-secondary-text mb-1.5">Management Fee Interval</p>
              <BaseSelect
                v-model="form.management_fee_interval"
                :options="intervalOptions"
                placeholder="Select interval"
              />
            </div>
            <div>
              <p class="text-xs text-secondary-text mb-1.5">Registration Fee ($)</p>
              <input
                v-model.number="form.registration_fee"
                type="number"
                min="0"
                placeholder="e.g. 10"
                class="w-full px-3 py-2.5 rounded-lg bg-card-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
              />
            </div>
          </div>
        </div>

        <!-- Requirements -->
        <div class="bg-background border border-primary-border rounded-xl p-4 space-y-4">
          <p class="text-[11px] uppercase tracking-widest font-semibold text-secondary-text">Account Requirements</p>
          <div>
            <p class="text-xs text-secondary-text mb-1.5">Minimum Balance ($)</p>
            <input
              v-model.number="form.minimum_balance"
              type="number"
              min="0"
              placeholder="e.g. 2000"
              class="w-full px-3 py-2.5 rounded-lg bg-card-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
            />
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-4 border-t border-primary-border flex gap-3 shrink-0 bg-card-background">
        <button
          type="button"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
          @click="emit('close')"
        >
          Cancel
        </button>
        <button
          type="button"
          :disabled="loading || !isValid"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          @click="submit"
        >
          <Loader2 v-if="loading" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ isEditing ? (loading ? 'Updating...' : 'Update Offer') : (loading ? 'Creating...' : 'Create Offer') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { X, Tag, Loader2 } from 'lucide-vue-next'
import { useFmOffersStore } from '@/stores/fmOffers/fmOffers'
import BaseSelect from '@/components/common/BaseSelect.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  editOffer: { type: Object, default: null },
})
const emit = defineEmits(['close'])
const store = useFmOffersStore()

function getDefaultForm() {
  return {
    name: '',
    visibility: 'public',
    summary: '',
    performance_fee: null,
    management_fee: null,
    management_fee_interval: 'monthly',
    registration_fee: null,
    minimum_balance: null,
  }
}

const form = ref(getDefaultForm())
const isEditing = computed(() => !!props.editOffer)
const loading = computed(() => isEditing.value ? store.updateLoading : store.createLoading)

const intervalOptions = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Yearly', value: 'yearly' },
]

const isValid = computed(() => Boolean(form.value.name && form.value.visibility))

watch(() => props.open, (val) => {
  if (!val) return
  if (props.editOffer) {
    form.value = {
      name: props.editOffer.name || '',
      visibility: props.editOffer.visibility || 'public',
      summary: props.editOffer.summary || props.editOffer.description || '',
      performance_fee: props.editOffer.performance_fee ?? null,
      management_fee: props.editOffer.management_fee ?? null,
      management_fee_interval: props.editOffer.management_fee_interval || 'monthly',
      registration_fee: props.editOffer.registration_fee ?? null,
      minimum_balance: props.editOffer.minimum_balance ?? null,
    }
  } else {
    form.value = getDefaultForm()
  }
})

const submit = () => {
  if (isEditing.value) {
    store.updateOffer(props.editOffer.id, { ...form.value }, () => emit('close'))
  } else {
    store.createOffer({ ...form.value }, () => emit('close'))
  }
}
</script>
