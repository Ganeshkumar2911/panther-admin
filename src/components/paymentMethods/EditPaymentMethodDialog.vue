<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
  >
    <div
      class="bg-card-background rounded-2xl border border-primary-border w-full max-w-lg overflow-hidden shadow-xl"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Wallet class="w-4 h-4 text-primary" />
          <h2 class="text-sm font-semibold text-primary-text">Edit Payment Method</h2>
        </div>
        <button
          class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
          @click="handleClose"
          :disabled="submitting"
        >
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <!-- Scrollable Form Body -->
      <div class="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">
        <!-- Read-Only Context Info -->
        <div class="grid grid-cols-2 gap-3 bg-background/40 p-3 rounded-xl border border-primary-border/30">
          <div>
            <p class="text-[10px] text-secondary-text uppercase tracking-wider mb-0.5">Wallet ID / Address</p>
            <p class="text-xs font-mono text-primary-text truncate" :title="paymentMethod?.wallet_id">
              {{ paymentMethod?.wallet_id || '—' }}
            </p>
          </div>
          <div>
            <p class="text-[10px] text-secondary-text uppercase tracking-wider mb-0.5">Currency / Type</p>
            <p class="text-xs font-semibold text-primary-text capitalize">
              {{ paymentMethod?.currency_id || '—' }} ({{ paymentMethod?.wallet_type === 1 ? 'Crypto' : 'Fiat' }})
            </p>
          </div>
          <!-- <div class="col-span-2 pt-2 border-t border-primary-border/20">
            <p class="text-[10px] text-secondary-text uppercase tracking-wider mb-0.5">Confirmed Balance</p>
            <p class="text-sm font-bold text-primary-green">
              {{ formatNum(paymentMethod?.balance_confirmed) }} <span class="text-xs font-normal text-secondary-text">{{ paymentMethod?.currency_id }}</span>
            </p>
          </div> -->
        </div>

        <!-- Validation Error Message -->
        <p v-if="validationError" class="text-primary-red text-xs bg-primary-red/10 border border-primary-red/20 px-3 py-2 rounded-lg">
          {{ validationError }}
        </p>

        <!-- Wallet Label -->
        <div>
          <label class="block text-xs font-medium text-secondary-text mb-1.5">Wallet Label</label>
          <input
            v-model="form.wallet_label"
            type="text"
            placeholder="e.g. USDT Tron Wallet"
            :disabled="submitting"
            class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
          />
        </div>

        <!-- Limits Section -->
        <div class="space-y-4 pt-2">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-secondary-text border-b border-primary-border/50 pb-1.5">Transaction Limits</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Min Deposit -->
            <div>
              <label class="block text-[11px] font-medium text-secondary-text mb-1.5">Min Deposit</label>
              <div class="relative">
                <input
                  v-model.number="form.minimum_deposit_amount"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0.00"
                  :disabled="submitting"
                  class="w-full pl-3 pr-2 py-2 rounded-lg bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            <!-- Max Withdraw -->
            <div>
              <label class="block text-[11px] font-medium text-secondary-text mb-1.5">Max Withdraw</label>
              <div class="relative">
                <input
                  v-model.number="form.maximum_withdrawal_amount"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0.00"
                  :disabled="submitting"
                  class="w-full pl-3 pr-2 py-2 rounded-lg bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Configuration Section -->
        <div class="space-y-4 pt-2">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-secondary-text border-b border-primary-border/50 pb-1.5">Configuration</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Deposit settings group -->
            <div class="space-y-4 p-4 bg-background/20 rounded-xl border border-primary-border/30">
              <span class="text-[10px] font-bold uppercase tracking-wider text-secondary-text block">Deposit Settings</span>
              
              <!-- Enable Deposit -->
              <div class="flex items-center justify-between">
                <span class="text-xs text-primary-text font-medium">Enable Deposit</span>
                <button
                  type="button"
                  :disabled="submitting"
                  @click="form.enable_deposit = !form.enable_deposit"
                  class="relative w-11 h-6 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 focus:outline-none"
                  :class="form.enable_deposit ? 'bg-primary' : 'bg-primary-border'"
                >
                  <span
                    class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
                    :class="form.enable_deposit ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>
              </div>

              <!-- Default Deposit -->
              <div class="flex items-center justify-between">
                <span class="text-xs text-primary-text font-medium">Default Deposit</span>
                <button
                  type="button"
                  :disabled="submitting"
                  @click="form.is_default_deposit = !form.is_default_deposit"
                  class="relative w-11 h-6 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 focus:outline-none"
                  :class="form.is_default_deposit ? 'bg-primary' : 'bg-primary-border'"
                >
                  <span
                    class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
                    :class="form.is_default_deposit ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>
              </div>
            </div>

            <!-- Withdrawal settings group -->
            <div class="space-y-4 p-4 bg-background/20 rounded-xl border border-primary-border/30">
              <span class="text-[10px] font-bold uppercase tracking-wider text-secondary-text block">Withdrawal Settings</span>

              <!-- Enable Withdrawal -->
              <div class="flex items-center justify-between">
                <span class="text-xs text-primary-text font-medium">Enable Withdrawal</span>
                <button
                  type="button"
                  :disabled="submitting"
                  @click="form.enable_withdrawal = !form.enable_withdrawal"
                  class="relative w-11 h-6 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 focus:outline-none"
                  :class="form.enable_withdrawal ? 'bg-primary' : 'bg-primary-border'"
                >
                  <span
                    class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
                    :class="form.enable_withdrawal ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>
              </div>

              <!-- Default Withdrawal -->
              <div class="flex items-center justify-between">
                <span class="text-xs text-primary-text font-medium">Default Withdrawal</span>
                <button
                  type="button"
                  :disabled="submitting"
                  @click="form.is_default_withdrawal = !form.is_default_withdrawal"
                  class="relative w-11 h-6 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 focus:outline-none"
                  :class="form.is_default_withdrawal ? 'bg-primary' : 'bg-primary-border'"
                >
                  <span
                    class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
                    :class="form.is_default_withdrawal ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>
              </div>
            </div>
          </div>

          <!-- Is Active Toggle -->
          <div class="flex items-center justify-between p-4 bg-background/20 rounded-xl border border-primary-border/30">
            <div>
              <p class="text-xs font-semibold text-primary-text">Active Status</p>
              <p class="text-[10px] text-secondary-text mt-0.5">Control whether this payment method is visible and usable</p>
            </div>
            <button
              type="button"
              :disabled="submitting"
              @click="form.is_active = !form.is_active"
              class="relative w-11 h-6 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 focus:outline-none"
              :class="form.is_active ? 'bg-primary-green' : 'bg-primary-border'"
            >
              <span
                class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
                :class="form.is_active ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="px-6 py-4 border-t border-primary-border flex gap-3 bg-background/10">
        <button
          :disabled="submitting"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          @click="handleClose"
        >
          Cancel
        </button>
        <button
          :disabled="submitting || !isValid"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          @click="submit"
        >
          <Loader2 v-if="submitting" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ submitting ? 'Saving...' : 'Save Changes' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Wallet, X, Loader2 } from 'lucide-vue-next'
import { usePaymentMethodsStore } from '@/stores/paymentMethods/paymentMethods'

const props = defineProps({
  open: { type: Boolean, default: false },
  paymentMethod: { type: Object, default: null }
})

const emit = defineEmits(['close'])
const store = usePaymentMethodsStore()

const submitting = ref(false)
const validationError = ref('')

const form = ref({
  wallet_label: '',
  minimum_deposit_amount: 0,
  maximum_withdrawal_amount: 0,
  enable_deposit: true,
  enable_withdrawal: true,
  is_default_deposit: false,
  is_default_withdrawal: false,
  is_active: true
})

// Populate form when the dialog opens or the selected payment method changes
watch(() => props.open, (newVal) => {
  if (newVal && props.paymentMethod) {
    validationError.value = ''
    form.value = {
      wallet_label: props.paymentMethod.wallet_label ?? '',
      minimum_deposit_amount: props.paymentMethod.minimum_deposit_amount ?? 0,
      maximum_withdrawal_amount: props.paymentMethod.maximum_withdrawal_amount ?? 0,
      enable_deposit: props.paymentMethod.enable_deposit ?? true,
      enable_withdrawal: props.paymentMethod.enable_withdrawal ?? true,
      is_default_deposit: props.paymentMethod.is_default_deposit ?? false,
      is_default_withdrawal: props.paymentMethod.is_default_withdrawal ?? false,
      is_active: props.paymentMethod.is_active ?? true
    }
  }
}, { immediate: true })

const isValid = computed(() => {
  return (
    form.value.wallet_label.trim() !== '' &&
    form.value.minimum_deposit_amount >= 0 &&
    form.value.maximum_withdrawal_amount >= 0
  )
})

const handleClose = () => {
  if (submitting.value) return
  emit('close')
}

const formatNum = (val) => {
  return (val ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })
}

const submit = async () => {
  if (!isValid.value) {
    validationError.value = 'Please provide a valid wallet label and non-negative limit values.'
    return
  }

  validationError.value = ''
  submitting.value = true

  try {
    const payload = {
      wallet_label: form.value.wallet_label.trim(),
      minimum_deposit_amount: Number(form.value.minimum_deposit_amount),
      maximum_withdrawal_amount: Number(form.value.maximum_withdrawal_amount),
      enable_deposit: form.value.enable_deposit,
      enable_withdrawal: form.value.enable_withdrawal,
      is_default_deposit: form.value.is_default_deposit,
      is_default_withdrawal: form.value.is_default_withdrawal,
      is_active: form.value.is_active
    }
    
    // Call store action (which now returns a Promise)
    await store.updatePaymentMethod(props.paymentMethod.id, payload)
    
    // Success: close the dialog
    emit('close')
  } catch (error) {
    console.error('Failed to update payment method:', error)
    validationError.value = error?.message || 'An error occurred while saving changes.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* Remove scrollbar for Chrome, Safari and Opera */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
/* Remove scrollbar for IE, Edge and Firefox */
.no-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>
