<template>
  <Transition name="slide">
    <div
      v-if="open"
      class="fixed inset-0 z-40 flex"
    >
      <!-- Backdrop -->
      <div class="flex-1 bg-black/40" @click="handleClose" />

      <!-- Panel -->
      <div
        class="w-full max-w-xl bg-card-background border-l border-primary-border flex flex-col h-full overflow-hidden"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2">
            <Wallet class="w-4 h-4 text-primary" />
            <div>
              <h2 class="text-sm font-semibold text-primary-text">
                {{ isEdit ? 'Edit Payment Method' : 'Create Payment Method' }}
              </h2>
              <p class="text-[11px] text-secondary-text mt-0.5">{{ isEdit ? `Editing: ${form.wallet_label}` : 'Fill in the details below' }}</p>
            </div>
          </div>
          <button
            class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
            @click="handleClose"
            :disabled="submitting"
          >
            <X class="w-4 h-4 text-secondary-text" />
          </button>
        </div>

        <!-- Tabs (Top area, disabled/read-only in Edit mode) -->
        <div class="px-6 pt-3 flex border-b border-primary-border bg-background/10 gap-2 shrink-0">
          <button
            v-for="tab in [
              { id: 'bank', label: 'Bank Transfer' },
              { id: 'upi', label: 'UPI' },
              { id: 'crypto', label: 'Crypto' }
            ]"
            :key="tab.id"
            type="button"
            :disabled="isEdit"
            @click="activeTab = tab.id"
            class="pb-2 px-2 text-xs font-semibold border-b-2 transition-all focus:outline-none"
            :class="[
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-secondary-text hover:text-primary-text',
              isEdit ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Scrollable Form Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4 no-scrollbar">
        <!-- Validation Error Message -->
        <p v-if="validationError" class="text-primary-red text-xs bg-primary-red/10 border border-primary-red/20 px-3 py-2 rounded-lg">
          {{ validationError }}
        </p>

        <!-- Read-Only Context Info (Edit mode only) -->
        <div v-if="isEdit" class="grid grid-cols-2 gap-3 bg-background/40 p-3 rounded-xl border border-primary-border/30">
          <div>
            <p class="text-[10px] text-secondary-text uppercase tracking-wider mb-0.5">Gateway / Method Type</p>
            <p class="text-xs font-semibold text-primary-text capitalize">
              {{ paymentMethod?.gateway || '—' }} ({{ paymentMethod?.method_type || '—' }})
            </p>
          </div>
          <div v-if="paymentMethod?.wallet_id">
            <p class="text-[10px] text-secondary-text uppercase tracking-wider mb-0.5">Wallet ID</p>
            <p class="text-xs font-mono text-primary-text truncate" :title="paymentMethod?.wallet_id">
              {{ paymentMethod?.wallet_id }}
            </p>
          </div>
        </div>

        <!-- Wallet Label -->
        <div>
          <label class="block text-xs font-medium text-secondary-text mb-1.5">Wallet Label <span class="text-primary-red">*</span></label>
          <input
            v-model="form.wallet_label"
            type="text"
            placeholder="e.g. HDFC Current Account, Coinsbuy Wallet"
            :disabled="submitting"
            class="w-full px-3 py-2 rounded-lg bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
          />
        </div>

        <!-- BANK TRANSFER FIELDS -->
        <div v-if="activeTab === 'bank'" class="space-y-4 pt-2">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-secondary-text border-b border-primary-border/50 pb-1.5">Bank Account Details</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-secondary-text mb-1.5">Bank Name <span class="text-primary-red">*</span></label>
              <input
                v-model="form.bank_name"
                type="text"
                placeholder="e.g. HDFC Bank"
                :disabled="submitting"
                class="w-full px-3 py-2 rounded-lg bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-secondary-text mb-1.5">Account Name <span class="text-primary-red">*</span></label>
              <input
                v-model="form.account_name"
                type="text"
                placeholder="e.g. Panther Capital Pvt Ltd"
                :disabled="submitting"
                class="w-full px-3 py-2 rounded-lg bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-secondary-text mb-1.5">Account Number <span class="text-primary-red">*</span></label>
              <input
                v-model="form.account_number"
                type="text"
                placeholder="e.g. 123456789012"
                :disabled="submitting"
                class="w-full px-3 py-2 rounded-lg bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-secondary-text mb-1.5">IFSC Code <span class="text-primary-red">*</span></label>
              <input
                v-model="form.ifsc_code"
                type="text"
                placeholder="e.g. HDFC0001234"
                :disabled="submitting"
                class="w-full px-3 py-2 rounded-lg bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-secondary-text mb-1.5">Branch Name</label>
              <input
                v-model="form.branch_name"
                type="text"
                placeholder="e.g. Mumbai"
                :disabled="submitting"
                class="w-full px-3 py-2 rounded-lg bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-secondary-text mb-1.5">SWIFT Code</label>
              <input
                v-model="form.swift_code"
                type="text"
                placeholder="e.g. HDFCINBB"
                :disabled="submitting"
                class="w-full px-3 py-2 rounded-lg bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        <!-- UPI FIELDS -->
        <div v-if="activeTab === 'upi'" class="space-y-4 pt-2">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-secondary-text border-b border-primary-border/50 pb-1.5">UPI Details</h3>
          
          <div>
            <label class="block text-xs font-medium text-secondary-text mb-1.5">UPI ID <span class="text-primary-red">*</span></label>
            <input
              v-model="form.upi_id"
              type="text"
              placeholder="e.g. panther@hdfcbank"
              :disabled="submitting"
              class="w-full px-3 py-2 rounded-lg bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
            />
          </div>
        </div>

        <!-- CRYPTO FIELDS -->
        <div v-if="activeTab === 'crypto'" class="space-y-4 pt-2">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-secondary-text border-b border-primary-border/50 pb-1.5">Crypto Details</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-secondary-text mb-1.5">Wallet ID / ID <span class="text-primary-red">*</span></label>
              <input
                v-model="form.wallet_id"
                type="text"
                placeholder="e.g. 1491"
                :disabled="submitting"
                class="w-full px-3 py-2 rounded-lg bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-secondary-text mb-1.5">Wallet Address (optional)</label>
              <input
                v-model="form.wallet_address"
                type="text"
                placeholder="e.g. 0x71C... or T..."
                :disabled="submitting"
                class="w-full px-3 py-2 rounded-lg bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        <!-- Remarks -->
        <div>
          <label class="block text-xs font-medium text-secondary-text mb-1.5">Remarks</label>
          <textarea
            v-model="form.remarks"
            rows="2"
            placeholder="Enter payment method notes or remarks..."
            :disabled="submitting"
            class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50 resize-none"
          />
        </div>

        <!-- Limits Section -->
        <div class="space-y-4 pt-2">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-secondary-text border-b border-primary-border/50 pb-1.5">Transaction Limits</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

            <!-- Max Withdrawals Per Day -->
            <div>
              <label class="block text-[11px] font-medium text-secondary-text mb-1.5">Max Withdrawals / Day</label>
              <div class="relative">
                <input
                  v-model="form.maximum_withdrawals_per_day"
                  type="text"
                  placeholder="Unlimited"
                  :disabled="submitting"
                  class="w-full px-3 py-2 rounded-lg bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors disabled:opacity-50"
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

          <!-- Is Active Toggle (Edit mode only) -->
          <div v-if="isEdit" class="flex items-center justify-between p-4 bg-background/20 rounded-xl border border-primary-border/30">
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

          <!-- Withdrawal Notification Emails -->
          <div class="space-y-3 p-4 bg-background/20 rounded-xl border border-primary-border/30">
            <div>
              <p class="text-xs font-semibold text-primary-text">Withdrawal Notification Emails</p>
              <p class="text-[10px] text-secondary-text mt-0.5">Alerts will be sent to these emails upon withdrawal requests</p>
            </div>

            <!-- Input and button -->
            <div class="flex gap-2">
              <input
                v-model="newEmailInput"
                type="text"
                placeholder="e.g. finance@panther.capital"
                :disabled="submitting"
                class="flex-1 px-3 py-2 rounded-lg bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
                @keydown.enter.prevent="addEmail"
              />
              <button
                type="button"
                @click="addEmail"
                :disabled="submitting || !newEmailInput.trim()"
                class="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Plus class="w-3 h-3" /> Add
              </button>
            </div>

            <!-- Input error message -->
            <p v-if="emailInputError" class="text-primary-red text-[11px] font-medium leading-none">
              {{ emailInputError }}
            </p>

            <!-- Tags container -->
            <div v-if="form.withdraw_notification_emails?.length" class="flex flex-wrap gap-1.5 pt-1">
              <div
                v-for="(email, idx) in form.withdraw_notification_emails"
                :key="email"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background border border-primary-border text-primary-text text-xs font-medium"
              >
                <span class="truncate max-w-[200px]">{{ email }}</span>
                <button
                  type="button"
                  @click="removeEmail(idx)"
                  class="w-4 h-4 flex items-center justify-center rounded-full hover:bg-primary-red/10 text-secondary-text hover:text-primary-red transition-colors focus:outline-none shrink-0"
                >
                  <X class="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
            <p v-else class="text-[11px] text-secondary-text italic text-center py-2">
              No notification emails added yet.
            </p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="px-6 py-4 border-t border-primary-border flex gap-3 shrink-0 bg-card-background">
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
          <span>{{ submitting ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create') }}</span>
        </button>
      </div>
    </div>
  </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Wallet, X, Loader2, Plus } from 'lucide-vue-next'
import { usePaymentMethodsStore } from '@/stores/paymentMethods/paymentMethods'

const props = defineProps({
  open: { type: Boolean, default: false },
  paymentMethod: { type: Object, default: null }
})

const emit = defineEmits(['close'])
const store = usePaymentMethodsStore()

const submitting = ref(false)
const validationError = ref('')
const activeTab = ref('bank') // 'bank', 'upi', 'crypto'

const isEdit = computed(() => !!props.paymentMethod)

const newEmailInput = ref('')
const emailInputError = ref('')

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const addEmail = () => {
  const email = newEmailInput.value.trim()
  if (!email) return

  if (!emailRegex.test(email)) {
    emailInputError.value = 'Please enter a valid email address.'
    return
  }

  if (form.value.withdraw_notification_emails.includes(email)) {
    emailInputError.value = 'This email has already been added.'
    return
  }

  form.value.withdraw_notification_emails.push(email)
  newEmailInput.value = ''
  emailInputError.value = ''
}

const removeEmail = (index) => {
  form.value.withdraw_notification_emails.splice(index, 1)
}

const form = ref({
  // Common:
  wallet_label: '',
  minimum_deposit_amount: 0,
  maximum_withdrawal_amount: 0,
  maximum_withdrawals_per_day: null,
  enable_deposit: true,
  enable_withdrawal: true,
  is_default_deposit: false,
  is_default_withdrawal: false,
  remarks: '',
  is_active: true,
  withdraw_notification_emails: [],

  // Bank:
  bank_name: '',
  account_name: '',
  account_number: '',
  ifsc_code: '',
  branch_name: '',
  swift_code: '',

  // UPI:
  upi_id: '',

  // Crypto:
  wallet_id: '',
  wallet_address: '',
})

// Populate form when the dialog opens or when the mode changes
watch(() => props.open, (newVal) => {
  if (newVal) {
    validationError.value = ''
    if (props.paymentMethod) {
      // Edit mode: determine active tab from paymentMethod payload properties
      const type = props.paymentMethod.method_type || props.paymentMethod.gateway || 'crypto'
      activeTab.value = type === 'coinsbuy' ? 'crypto' : type
      
      form.value = {
        wallet_label: props.paymentMethod.wallet_label ?? '',
        minimum_deposit_amount: props.paymentMethod.minimum_deposit_amount ?? 0,
        maximum_withdrawal_amount: props.paymentMethod.maximum_withdrawal_amount ?? 0,
        maximum_withdrawals_per_day: props.paymentMethod.maximum_withdrawals_per_day ?? null,
        enable_deposit: props.paymentMethod.enable_deposit ?? true,
        enable_withdrawal: props.paymentMethod.enable_withdrawal ?? true,
        is_default_deposit: props.paymentMethod.is_default_deposit ?? false,
        is_default_withdrawal: props.paymentMethod.is_default_withdrawal ?? false,
        remarks: props.paymentMethod.remarks ?? '',
        is_active: props.paymentMethod.is_active ?? true,
        withdraw_notification_emails: props.paymentMethod.withdraw_notification_emails ?? [],

        // Bank fields:
        bank_name: props.paymentMethod.bank_name ?? '',
        account_name: props.paymentMethod.account_name ?? '',
        account_number: props.paymentMethod.account_number ?? '',
        ifsc_code: props.paymentMethod.ifsc_code ?? '',
        branch_name: props.paymentMethod.branch_name ?? '',
        swift_code: props.paymentMethod.swift_code ?? '',

        // UPI fields:
        upi_id: props.paymentMethod.upi_id ?? '',

        // Crypto fields:
        wallet_id: props.paymentMethod.wallet_id ?? '',
        wallet_address: props.paymentMethod.wallet_address ?? '',
      }
    } else {
      // Create mode: defaults
      activeTab.value = 'bank'
      form.value = {
        wallet_label: '',
        minimum_deposit_amount: 0,
        maximum_withdrawal_amount: 0,
        maximum_withdrawals_per_day: null,
        enable_deposit: true,
        enable_withdrawal: true,
        is_default_deposit: false,
        is_default_withdrawal: false,
        remarks: '',
        is_active: true,
        withdraw_notification_emails: [],

        // Bank fields:
        bank_name: '',
        account_name: '',
        account_number: '',
        ifsc_code: '',
        branch_name: '',
        swift_code: '',

        // UPI fields:
        upi_id: '',

        // Crypto fields:
        wallet_id: '',
        wallet_address: '',
      }
    }
  }
}, { immediate: true })

const isValid = computed(() => {
  if (!form.value.wallet_label.trim()) return false
  if (form.value.minimum_deposit_amount < 0 || form.value.maximum_withdrawal_amount < 0) return false
  if (form.value.maximum_withdrawals_per_day !== null && form.value.maximum_withdrawals_per_day !== '') {
    const val = Number(form.value.maximum_withdrawals_per_day)
    if (isNaN(val) || val < 0) return false
  }

  if (activeTab.value === 'bank') {
    return (
      form.value.bank_name.trim() !== '' &&
      form.value.account_name.trim() !== '' &&
      form.value.account_number.trim() !== '' &&
      form.value.ifsc_code.trim() !== ''
    )
  } else if (activeTab.value === 'upi') {
    return form.value.upi_id.trim() !== ''
  } else if (activeTab.value === 'crypto') {
    return form.value.wallet_id.trim() !== ''
  }
  return false
})

const handleClose = () => {
  if (submitting.value) return
  emit('close')
}

const submit = async () => {
  if (!isValid.value) {
    validationError.value = 'Please provide all required fields correctly.'
    return
  }

  validationError.value = ''
  submitting.value = true

  try {
    let payload = {}

    // Construct payload based on selected gateway/method
    if (activeTab.value === 'bank') {
      payload = {
        gateway: 'bank',
        method_type: 'bank',
        wallet_label: form.value.wallet_label.trim(),
        bank_name: form.value.bank_name.trim(),
        account_name: form.value.account_name.trim(),
        account_number: form.value.account_number.trim(),
        ifsc_code: form.value.ifsc_code.trim(),
        branch_name: form.value.branch_name.trim(),
        swift_code: form.value.swift_code.trim(),
        minimum_deposit_amount: Number(form.value.minimum_deposit_amount),
        maximum_withdrawal_amount: Number(form.value.maximum_withdrawal_amount),
        maximum_withdrawals_per_day: form.value.maximum_withdrawals_per_day !== null && form.value.maximum_withdrawals_per_day !== ''
          ? Number(form.value.maximum_withdrawals_per_day)
          : null,
        enable_deposit: form.value.enable_deposit,
        enable_withdrawal: form.value.enable_withdrawal,
        is_default_deposit: form.value.is_default_deposit,
        is_default_withdrawal: form.value.is_default_withdrawal,
        remarks: form.value.remarks.trim(),
        withdraw_notification_emails: form.value.withdraw_notification_emails || []
      }
    } else if (activeTab.value === 'upi') {
      payload = {
        gateway: 'upi',
        method_type: 'upi',
        wallet_label: form.value.wallet_label.trim(),
        upi_id: form.value.upi_id.trim(),
        minimum_deposit_amount: Number(form.value.minimum_deposit_amount),
        maximum_withdrawal_amount: Number(form.value.maximum_withdrawal_amount),
        maximum_withdrawals_per_day: form.value.maximum_withdrawals_per_day !== null && form.value.maximum_withdrawals_per_day !== ''
          ? Number(form.value.maximum_withdrawals_per_day)
          : null,
        enable_deposit: form.value.enable_deposit,
        enable_withdrawal: form.value.enable_withdrawal,
        is_default_deposit: form.value.is_default_deposit,
        is_default_withdrawal: form.value.is_default_withdrawal,
        remarks: form.value.remarks.trim(),
        withdraw_notification_emails: form.value.withdraw_notification_emails || []
      }
    } else if (activeTab.value === 'crypto') {
      payload = {
        gateway: 'coinsbuy',
        method_type: 'crypto',
        wallet_id: form.value.wallet_id.trim(),
        wallet_label: form.value.wallet_label.trim(),
        wallet_address: form.value.wallet_address.trim() || null,
        minimum_deposit_amount: Number(form.value.minimum_deposit_amount),
        maximum_withdrawal_amount: Number(form.value.maximum_withdrawal_amount),
        maximum_withdrawals_per_day: form.value.maximum_withdrawals_per_day !== null && form.value.maximum_withdrawals_per_day !== ''
          ? Number(form.value.maximum_withdrawals_per_day)
          : null,
        enable_deposit: form.value.enable_deposit,
        enable_withdrawal: form.value.enable_withdrawal,
        is_default_deposit: form.value.is_default_deposit,
        is_default_withdrawal: form.value.is_default_withdrawal,
        remarks: form.value.remarks.trim(),
        withdraw_notification_emails: form.value.withdraw_notification_emails || []
      }
    }

    if (isEdit.value) {
      payload.is_active = form.value.is_active
      await store.updatePaymentMethod(props.paymentMethod.id, payload)
    } else {
      payload.is_active = true
      await store.createPaymentMethod(payload)
    }

    emit('close')
  } catch (error) {
    console.error('Failed to save payment method:', error)
    validationError.value = error?.message || 'An error occurred while saving changes.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: transform 0.25s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }

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
