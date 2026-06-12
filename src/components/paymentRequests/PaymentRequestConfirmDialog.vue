<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    @click="handleClose"
  >
    <div
      class="w-full max-w-lg rounded-2xl border border-primary-border bg-card-background shadow-2xl"
      @click.stop
    >
      <div class="flex items-start justify-between gap-4 border-b border-primary-border px-5 py-4">
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl border"
            :class="dialogTone.wrapper"
          >
            <component :is="dialogTone.icon" class="h-4 w-4" :class="dialogTone.iconClass" />
          </div>
          <div>
            <h2 class="text-sm font-semibold text-primary-text">
              {{ title }}
            </h2>
            <p class="mt-0.5 text-xs text-secondary-text">
              {{ subtitle }}
            </p>
          </div>
        </div>

        <button
          class="flex h-8 w-8 items-center justify-center rounded-lg text-secondary-text transition-colors hover:bg-background hover:text-primary-text disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="loading"
          @click="handleClose"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <div class="space-y-4 px-5 py-5">
        <div class="rounded-xl border border-primary-border bg-background/60 p-4">
          <p class="text-[11px] uppercase tracking-[0.2em] text-secondary-text">
            Request
          </p>
          <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p class="text-[11px] text-secondary-text">Request ID</p>
              <p class="text-sm font-medium text-primary-text">#{{ request?.id ?? '—' }}</p>
            </div>
            <div>
              <p class="text-[11px] text-secondary-text">Type</p>
              <p class="text-sm font-medium capitalize text-primary-text">
                {{ request?.type ?? '—' }}
              </p>
            </div>
            <div>
              <p class="text-[11px] text-secondary-text">Amount</p>
              <p class="text-sm font-medium text-primary-text">
                {{ formattedAmount }}
              </p>
            </div>
            <div>
              <p class="text-[11px] text-secondary-text">User</p>
              <p class="text-sm font-medium text-primary-text">
                {{ request?.user_name ?? '—' }}
              </p>
            </div>
            <div>
              <p class="text-[11px] text-secondary-text">Email</p>
              <p class="text-sm font-medium text-primary-text">
                {{ request?.user_email ?? '—' }}
              </p>
            </div>
            <div>
              <p class="text-[11px] text-secondary-text">Account</p>
              <p class="text-sm font-medium text-primary-text">
                {{ request?.trading_account_number ?? '—' }}
              </p>
            </div>
            <div>
              <p class="text-[11px] text-secondary-text">User ID / Account ID</p>
              <p class="text-sm font-medium text-primary-text">
                {{ request?.user_id ?? '—' }} / {{ request?.trading_account_id ?? '—' }}
              </p>
            </div>
          </div>
        </div>

        <div class="rounded-xl border px-4 py-3" :class="dialogTone.notice">
          <div class="flex items-start gap-2">
            <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0" :class="dialogTone.iconClass" />
            <p class="text-xs leading-5" :class="dialogTone.text">
              {{ confirmationText }}
            </p>
          </div>
        </div>
      </div>

      <div class="flex gap-3 border-t border-primary-border px-5 py-4">
        <button
          class="flex-1 rounded-lg border border-primary-border px-4 py-2.5 text-xs font-medium text-secondary-text transition-colors hover:bg-background hover:text-primary-text disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="loading"
          @click="handleClose"
        >
          Cancel
        </button>
        <button
          class="flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium text-black transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          :class="dialogTone.button"
          :disabled="loading"
          @click="emit('confirm')"
        >
          <Loader2 v-if="loading" class="h-3.5 w-3.5 animate-spin" />
          <span>{{ loading ? loadingLabel : confirmLabel }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-vue-next'

const props = defineProps({
  open: { type: Boolean, default: false },
  request: { type: Object, default: null },
  action: { type: String, default: 'approve' },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'confirm'])

const actionMeta = {
  approve: {
    title: 'Approve Payment Request',
    subtitle: 'Confirm this action before continuing.',
    confirmLabel: 'Approve',
    loadingLabel: 'Approving...',
    button: 'bg-primary-green hover:bg-primary-green/90',
    wrapper: 'border-primary-green/20 bg-primary-green/10',
    iconClass: 'text-primary-green',
    notice: 'border-primary-green/20 bg-primary-green/10',
    text: 'text-primary-green',
    icon: CheckCircle2,
    confirmationText: 'This payment request will be approved immediately. Please confirm that you want to continue.',
  },
  reject: {
    title: 'Reject Payment Request',
    subtitle: 'Confirm this action before continuing.',
    confirmLabel: 'Reject',
    loadingLabel: 'Rejecting...',
    button: 'bg-primary-red hover:bg-primary-red/90',
    wrapper: 'border-primary-red/20 bg-primary-red/10',
    iconClass: 'text-primary-red',
    notice: 'border-primary-red/20 bg-primary-red/10',
    text: 'text-primary-red',
    icon: AlertTriangle,
    confirmationText: 'This payment request will be rejected immediately. Please confirm that you want to continue.',
  },
}

const dialogTone = computed(() => actionMeta[props.action] ?? actionMeta.approve)
const title = computed(() => dialogTone.value.title)
const subtitle = computed(() => dialogTone.value.subtitle)
const confirmLabel = computed(() => dialogTone.value.confirmLabel)
const loadingLabel = computed(() => dialogTone.value.loadingLabel)
const confirmationText = computed(() => dialogTone.value.confirmationText)

const formattedAmount = computed(() => {
  const amount = Number(props.request?.amount ?? 0)

  if (Number.isNaN(amount)) return '—'

  return `${props.request?.currency ?? ''} ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`.trim()
})

const handleClose = () => {
  if (props.loading) return
  emit('close')
}
</script>
