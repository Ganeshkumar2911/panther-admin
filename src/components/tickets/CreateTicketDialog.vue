<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
  >
    <div class="bg-card-background rounded-2xl border border-primary-border w-full max-w-lg" @click.stop>

      <!-- Header -->
      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between">
        <h2 class="text-sm font-semibold text-primary-text">Create Ticket</h2>
        <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors" @click="emit('close')">
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <!-- Body -->
      <div class="px-6 py-5 space-y-4">
        <div>
          <p class="text-xs text-secondary-text mb-1.5">Subject</p>
          <input
            ref="firstInput"
            v-model="form.subject"
            type="text"
            placeholder="e.g. MT5 Issue"
            :disabled="store.actionLoading"
            class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
          />
        </div>

        <div>
          <p class="text-xs text-secondary-text mb-1.5">Description</p>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Describe the issue..."
            :disabled="store.actionLoading"
            class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50 resize-none"
          />
        </div>

        <div>
          <p class="text-xs text-secondary-text mb-1.5">Priority</p>
          <BaseSelect
            v-model="form.priority"
            :options="priorityOptions"
            variant="surface"
            placeholder="Select priority"
          />
        </div>

        <div>
          <p class="text-xs text-secondary-text mb-1.5">Attachments</p>
          <label
            class="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-background border border-primary-border border-dashed cursor-pointer hover:bg-card-background transition-colors"
          >
            <Paperclip class="w-3.5 h-3.5 text-secondary-text shrink-0" />
            <span class="text-xs text-secondary-text">Click to attach files</span>
            <input type="file" multiple class="hidden" @change="onFileChange" />
          </label>
          <div v-if="form.files.length" class="mt-2 space-y-1">
            <div
              v-for="(file, i) in form.files"
              :key="i"
              class="flex items-center justify-between px-3 py-1.5 rounded-lg bg-background border border-primary-border"
            >
              <span class="text-xs text-primary-text truncate max-w-[80%]">{{ file.name }}</span>
              <button @click="removeFile(i)">
                <X class="w-3 h-3 text-secondary-text hover:text-primary-text" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-primary-border flex gap-3">
        <button
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors"
          @click="emit('close')"
        >Cancel</button>
        <button
          :disabled="store.actionLoading || !isValid"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          @click="submit"
        >
          <Loader2 v-if="store.actionLoading" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ store.actionLoading ? 'Submitting...' : 'Submit' }}</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { X, Loader2, Paperclip } from 'lucide-vue-next'
import { useTicketsStore } from '@/stores/tickets/tickets'
import BaseSelect from '@/components/common/BaseSelect.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])

const store = useTicketsStore()
const firstInput = ref(null)

const form = ref({ subject: '', description: '', priority: null, files: [] })

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
]

const isValid = computed(() => form.value.subject && form.value.description && form.value.priority)

watch(() => props.open, (val) => {
  if (val) {
    form.value = { subject: '', description: '', priority: null, files: [] }
    nextTick(() => firstInput.value?.focus())
  }
})

const onFileChange = (e) => {
  form.value.files.push(...Array.from(e.target.files))
  e.target.value = ''
}

const removeFile = (i) => { form.value.files.splice(i, 1) }

const submit = () => {
  const fd = new FormData()
  fd.append('subject', form.value.subject)
  fd.append('description', form.value.description)
  fd.append('priority', form.value.priority)
  form.value.files.forEach((f) => fd.append('attachments', f))
  store.createTicket(fd, () => emit('close'))
}
</script>