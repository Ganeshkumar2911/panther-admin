<script setup>
import { ref, watch, computed } from 'vue'
import { X } from 'lucide-vue-next'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import { useTradingAccountsStore } from '@/stores/tradingAccounts/tradingAccounts'

const props = defineProps({
  open: Boolean,
  editData: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close'])

const snackbar = useSnackbarStore()
const tradingAccountsStore = useTradingAccountsStore()

const isLoading = ref(false)

const form = ref({
  account_number: '',
  broker: 'MT5',
  broker_label: '',
})


const resetForm = () => {
  form.value = {
    account_number: '',
    broker: 'MT5',
    broker_label: '',
    server: 'mt-5',
  }
}

const isEdit = computed(() => !!props.editData)

watch(
  () => props.editData,
  (val) => {
    if (val) {
      form.value.account_number = val.account_number || ''
      form.value.broker = val.platform || 'MT5'
      form.value.broker_label = val.broker_label || ''
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

const closeDialog = () => {
  emit('close')
}

const submit = () => {
  isLoading.value = true

  const payload = {
    account_number: form.value.account_number,
    broker: form.value.broker,
    server: form.value.server,
    broker_label: form.value.broker_label,
  }

  const successHandler = () => {
    isLoading.value = false
    tradingAccountsStore.fetchTradingAccounts(true)
    closeDialog()
  }

  const failureHandler = (err) => {
    isLoading.value = false
    snackbar.show(err?.error || 'Something went wrong.', 'error')
  }

  apiRequest(
    isEdit.value ? urls.KEYS.PUT : urls.KEYS.POST,
    urls.tradingAccounts.create,
    {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    }
  )
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    @click="closeDialog"
  >
    <div
      class="bg-card-background rounded-2xl border border-primary-border w-full max-w-md"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between">
        <h2 class="text-primary-text text-sm font-semibold">
          {{ isEdit ? 'Edit Account' : 'Add Account' }}
        </h2>
        <button class="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-background transition-colors" @click="closeDialog">
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <!-- Content -->
      <div class="px-6 py-5 space-y-4">
        <div>
          <p class="text-secondary-text text-xs mb-1.5">Account Number</p>
          <input
            v-model="form.account_number"
            type="text"
            placeholder="986538645"
            class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
          />
        </div>

        <div>
          <p class="text-secondary-text text-xs mb-1.5">Broker</p>
          <input
            v-model="form.broker"
            type="text"
            disabled
            class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-secondary-text text-sm cursor-not-allowed opacity-60"
          />
        </div>

        <div>
          <p class="text-secondary-text text-xs mb-1.5">Broker Label</p>
          <input
            v-model="form.broker_label"
            type="text"
            placeholder="metatrader"
            class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
          />
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-primary-border flex gap-3">
        <button
          @click="closeDialog"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors"
        >
          Cancel
        </button>

        <button
          @click="submit"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          :disabled="isLoading"
        >
          <span v-if="!isLoading">Save</span>
          <template v-else>
            <svg class="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            <span>Saving...</span>
          </template>
        </button>
      </div>
    </div>
  </div>
</template>