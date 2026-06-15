<script setup>
import { ref, watch } from 'vue'
import { Loader2, X, Pencil, Check } from 'lucide-vue-next'

const props = defineProps({
  open:         { type: Boolean,  default: false },
  item:         { type: Object,   default: null  },
  action:       { type: String,   default: 'accept' },
  isSubmitting: { type: Boolean,  default: false },
})

const emit = defineEmits(['close', 'confirm'])

// ─── State
const reason   = ref('')
const isEditing = ref(false)
const message  = ref('')

const form = ref({
  broker_share:       '',
  fm_share:           '',
  ib_pool_percentage: '',
  performance_fee:    '',
  settlement_type:    '',
  settlement_time:    '',
})

// ─── Pre-fill form from item
watch(() => props.item, (val) => {
  if (!val) {
    form.value = {
      broker_share:       '',
      fm_share:           '',
      ib_pool_percentage: '',
      performance_fee:    '',
      settlement_type:    '',
      settlement_time:    '',
    }
    return
  }
  form.value = {
    broker_share:       val.broker_share ?? '',
    fm_share:           val.fm_share ?? '',
    ib_pool_percentage: val.ib_pool_percentage ?? '',
    performance_fee:    val.performance_fee ?? '',
    settlement_type:    val.settlement_type ?? '',
    settlement_time:    val.settlement_time ?? '',
  }
}, { immediate: true, deep: true })

// ─── Reset on close
const closeDialog = () => {
  reason.value    = ''
  message.value   = ''
  isEditing.value = false
  emit('close')
}

// ─── Confirm
const handleConfirm = () => {
  if (props.action === 'accept') {
    // Always send form.value - it's pre-filled from item
    emit('confirm', {
      data:    { ...form.value },
      message: message.value.trim() || null,
    })
  } else {
    emit('confirm', { reason: reason.value })
  }
}

const isRejectDisabled  = () => props.action === 'reject' && !reason.value.trim()
const isAcceptDisabled  = () => props.isSubmitting
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    @click="closeDialog"
  >
    <div
      class="bg-card-background border border-primary-border rounded-2xl w-full max-w-lg
             flex flex-col max-h-[90vh]"
      @click.stop
    >
      <!-- Header -->
      <div class="px-5 py-4 border-b border-primary-border flex items-center justify-between flex-shrink-0">
        <div>
          <h2 class="text-primary-text text-sm font-medium">
            {{ action === 'accept' ? 'Accept Request' : 'Reject Request' }}
          </h2>
          <p class="text-secondary-text text-xs mt-0.5">{{ item?.user_email }}</p>
        </div>
        <div class="flex items-center gap-2">
          <!-- Edit toggle (accept only) -->
          <button
            v-if="action === 'accept'"
            @click="isEditing = !isEditing"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all cursor-pointer"
            :class="isEditing
              ? 'bg-accent text-card-background border-accent'
              : 'border-primary-border text-secondary-text hover:text-primary-text hover:bg-primary-border'"
          >
            <Pencil v-if="!isEditing" class="w-3 h-3" />
            <Check  v-else            class="w-3 h-3" />
            {{ isEditing ? 'Done' : 'Edit' }}
          </button>
          <button
            @click="closeDialog"
            class="w-7 h-7 flex items-center justify-center rounded-lg text-secondary-text
                   hover:text-primary-text hover:bg-primary-border transition-all cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="px-5 py-5 flex flex-col gap-4 overflow-y-auto flex-1 no-scrollbar">

        <!-- ── ACCEPT mode -->
        <template v-if="action === 'accept'">

          <!-- Info row: user -->
          <div class="bg-background border border-primary-border rounded-xl px-4 py-3 flex items-center justify-between">
            <span class="text-secondary-text text-xs">User ID</span>
            <span class="text-primary-text text-xs font-medium">{{ item?.user_id }}</span>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="bg-background border border-primary-border rounded-xl px-4 py-3">
              <span class="block text-secondary-text text-[11px] uppercase tracking-widest">Broker Currency</span>
              <span class="block text-primary-text text-xs font-medium mt-1">{{ item?.broker_currency ?? '-' }}</span>
            </div>
            <div class="bg-background border border-primary-border rounded-xl px-4 py-3">
              <span class="block text-secondary-text text-[11px] uppercase tracking-widest">Min Capital</span>
              <span class="block text-primary-text text-xs font-medium mt-1">
                {{ item?.min_capital ?? '-' }}
              </span>
            </div>
            <div class="bg-background border border-primary-border rounded-xl px-4 py-3 col-span-2">
              <span class="block text-secondary-text text-[11px] uppercase tracking-widest">Broker Group</span>
              <span class="block text-primary-text text-xs font-medium mt-1 break-all">
                {{ item?.broker_group ?? '-' }}
              </span>
            </div>
            <div class="bg-background border border-primary-border rounded-xl px-4 py-3">
              <span class="block text-secondary-text text-[11px] uppercase tracking-widest">Broker Leverage</span>
              <span class="block text-primary-text text-xs font-medium mt-1">
                {{ item?.broker_leverage ?? '-' }}
              </span>
            </div>
            <div class="bg-background border border-primary-border rounded-xl px-4 py-3">
              <span class="block text-secondary-text text-[11px] uppercase tracking-widest">Created At</span>
              <span class="block text-primary-text text-xs font-medium mt-1">
                {{ item?.created_at ?? '-' }}
              </span>
            </div>
          </div>

          <!-- Editable fields grid -->
          <div class="grid grid-cols-2 gap-3">

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-secondary-text">Broker Share (%)</label>
              <input
                v-model="form.broker_share"
                type="number"
                :disabled="!isEditing"
                class="bg-background border border-primary-border rounded-xl px-3.5 py-2.5 text-sm
                       text-primary-text outline-none transition-colors"
                :class="isEditing ? 'focus:border-accent' : 'opacity-70 cursor-not-allowed'"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-secondary-text">FM Share (%)</label>
              <input
                v-model="form.fm_share"
                type="number"
                :disabled="!isEditing"
                class="bg-background border border-primary-border rounded-xl px-3.5 py-2.5 text-sm
                       text-primary-text outline-none transition-colors"
                :class="isEditing ? 'focus:border-accent' : 'opacity-70 cursor-not-allowed'"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-secondary-text">IB Pool (%)</label>
              <input
                v-model="form.ib_pool_percentage"
                type="number"
                :disabled="!isEditing"
                class="bg-background border border-primary-border rounded-xl px-3.5 py-2.5 text-sm
                       text-primary-text outline-none transition-colors"
                :class="isEditing ? 'focus:border-accent' : 'opacity-70 cursor-not-allowed'"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-secondary-text">Performance Fee (%)</label>
              <input
                v-model="form.performance_fee"
                type="number"
                :disabled="!isEditing"
                class="bg-background border border-primary-border rounded-xl px-3.5 py-2.5 text-sm
                       text-primary-text outline-none transition-colors"
                :class="isEditing ? 'focus:border-accent' : 'opacity-70 cursor-not-allowed'"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-secondary-text">Settlement Type</label>
              <input
                v-model="form.settlement_type"
                type="text"
                :disabled="!isEditing"
                class="bg-background border border-primary-border rounded-xl px-3.5 py-2.5 text-sm
                       text-primary-text outline-none transition-colors capitalize"
                :class="isEditing ? 'focus:border-accent' : 'opacity-70 cursor-not-allowed'"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-secondary-text">Settlement Time</label>
              <input
                v-model="form.settlement_time"
                type="text"
                :disabled="!isEditing"
                class="bg-background border border-primary-border rounded-xl px-3.5 py-2.5 text-sm
                       text-primary-text outline-none transition-colors"
                :class="isEditing ? 'focus:border-accent' : 'opacity-70 cursor-not-allowed'"
              />
            </div>

          </div>

          <!-- Optional message (always visible for accept) -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-secondary-text">
              Message <span class="font-normal text-secondary-text">(optional)</span>
            </label>
            <textarea
              v-model="message"
              rows="2"
              placeholder="Add a note for the user..."
              class="w-full bg-background border border-primary-border rounded-xl px-3.5 py-2.5
                     text-sm text-primary-text placeholder:text-secondary-text outline-none
                     resize-none focus:border-accent transition-colors"
            />
          </div>

          <!-- Edited badge -->
          <div
            v-if="isEditing"
            class="flex items-center gap-1.5 text-xs text-primary-yellow"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-primary-yellow" />
            Editing — changes will be sent with acceptance
          </div>

        </template>

        <!-- ── REJECT mode -->
        <template v-else>
          <div class="bg-background border border-primary-border rounded-xl px-4 py-3 flex items-center justify-between">
            <span class="text-secondary-text text-xs">User</span>
            <span class="text-primary-text text-xs font-medium">{{ item?.user_email }}</span>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-secondary-text">
              Reason <span class="text-primary-red">*</span>
            </label>
            <textarea
              v-model="reason"
              rows="3"
              placeholder="Enter rejection reason..."
              class="w-full bg-background border border-primary-border rounded-xl px-3.5 py-2.5
                     text-sm text-primary-text placeholder:text-secondary-text outline-none
                     resize-none focus:border-primary-red transition-colors"
            />
          </div>
        </template>

      </div>

      <!-- Footer -->
      <div class="px-5 py-4 border-t border-primary-border flex gap-2 flex-shrink-0">
        <button
          @click="closeDialog"
          :disabled="isSubmitting"
          class="flex-1 px-4 py-2 rounded-xl text-sm text-secondary-text border border-primary-border
                 hover:text-primary-text hover:bg-primary-border transition-all cursor-pointer
                 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          @click="handleConfirm"
          :disabled="isSubmitting || isRejectDisabled()"
          class="flex-1 px-4 py-2 rounded-xl text-sm font-medium flex items-center justify-center
                 gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          :class="action === 'accept'
            ? 'bg-primary-green/500/10 hover:bg-primary-green/500/20'
            : 'bg-primary-red/500/10 text-primary-red hover:bg-primary-red/500/20'"
        >
          <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
          <span v-else>{{ action === 'accept' ? 'Accept' : 'Reject' }}</span>
        </button>
      </div>

    </div>
  </div>
</template>
