<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { X, Loader2 } from 'lucide-vue-next'
import { useIbTreeStore } from '@/stores/ibTree/ibTree'

const props = defineProps({
  open: { type: Boolean, default: false },
  editData: { type: Object, default: null },
  parentIbId: { type: Number, default: null },
})

const emit = defineEmits(['close'])

const store = useIbTreeStore()
const firstInput = ref(null)

const form = ref({ email: '', password: '', split_percentage: null })

const isEdit = computed(() => !!props.editData)

const title = computed(() => {
  if (isEdit.value) return 'Edit IB'
  return props.parentIbId ? 'Add Sub-IB' : 'Add IB'
})

const isValid = computed(() =>
  form.value.email &&
  form.value.split_percentage >= 0 &&
  form.value.split_percentage <= 100 &&
  (isEdit.value || !!form.value.password)
)

watch(() => props.open, (val) => {
  if (val) {
    form.value = {
      email: props.editData?.name ?? '',
      password: '',
      split_percentage: props.editData?.split ?? null,
    }
    nextTick(() => firstInput.value?.focus())
  }
})

const submit = () => {
  store.saveIb({
    email: form.value.email,
    password: form.value.password || undefined,
    split_percentage: form.value.split_percentage,
    parent_ib_id: props.parentIbId ?? undefined,
    ib_id: props.editData?.ib_id ?? undefined,
  })
  // close after action — watch actionLoading transition
  const unwatch = watch(() => store.actionLoading, (val) => {
    if (!val) {
      emit('close')
      unwatch()
    }
  })
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
  >
    <div
      class="bg-card-background rounded-2xl border border-primary-border w-full max-w-md"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between">
        <h2 class="text-sm font-semibold text-primary-text">{{ title }}</h2>
        <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors" @click="emit('close')">
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <!-- Body -->
      <div class="px-6 py-5 space-y-4">
        <div>
          <p class="text-xs text-secondary-text mb-1.5">Email</p>
          <input
            ref="firstInput"
            v-model="form.email"
            type="email"
            placeholder="example@gmail.com"
            :disabled="store.actionLoading"
            class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
          />
        </div>

        <div>
          <p class="text-xs text-secondary-text mb-1.5">
            Password <span v-if="isEdit" class="text-secondary-text">(optional)</span>
          </p>
          <input
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            :disabled="store.actionLoading"
            class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
          />
        </div>

        <div>
          <p class="text-xs text-secondary-text mb-1.5">Split Percentage</p>
          <input
            v-model.number="form.split_percentage"
            type="number"
            min="0"
            max="100"
            placeholder="50"
            :disabled="store.actionLoading"
            class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
          />
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-primary-border flex gap-3">
        <button
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors"
          @click="emit('close')"
        >
          Cancel
        </button>
        <button
          :disabled="store.actionLoading || !isValid"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          @click="submit"
        >
          <Loader2 v-if="store.actionLoading" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ store.actionLoading ? 'Saving...' : 'Save' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>