<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] bg-black/45 backdrop-blur-xs cursor-pointer"
      />
    </Transition>

    <!-- Drawer Panel -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-md bg-card-background border-l border-primary-border flex flex-col shadow-2xl text-xs"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0">
          <div>
            <h3 class="text-sm font-semibold text-primary-text">Audit Log Event Details</h3>
            <p class="text-[10px] text-secondary-text mt-0.5">Event ID: #{{ log?.id }}</p>
          </div>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
            @click="emit('close')"
          >
            <X :size="16" />
          </button>
        </div>

        <!-- Scrollable Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-primary-text">
          <!-- Summary Info Grid -->
          <div class="grid grid-cols-2 gap-4 bg-background/50 border border-primary-border rounded-xl p-4">
            <div class="col-span-2">
              <span class="text-[9px] text-secondary-text uppercase tracking-wider block font-bold mb-0.5">Performed By</span>
              <span class="font-semibold text-primary-text text-[13px]">{{ log?.name || 'Anonymous' }}</span>
            </div>
            <div>
              <span class="text-[9px] text-secondary-text uppercase tracking-wider block font-bold mb-0.5">IP Address</span>
              <span class="font-mono text-primary-text">{{ log?.ip_address || '—' }}</span>
            </div>
            <div>
              <span class="text-[9px] text-secondary-text uppercase tracking-wider block font-bold mb-0.5">Status</span>
              <span
                class="inline-flex text-[9px] font-semibold px-2 py-0.5 rounded-full border capitalize"
                :class="getStatusClass(log?.status)"
              >
                {{ log?.status }}
              </span>
            </div>
            <div>
              <span class="text-[9px] text-secondary-text uppercase tracking-wider block font-bold mb-0.5">Action Code</span>
              <span class="font-semibold text-primary-text">{{ log?.action }}</span>
            </div>
            <div>
              <span class="text-[9px] text-secondary-text uppercase tracking-wider block font-bold mb-0.5">Module & Entity</span>
              <span class="font-medium text-primary-text uppercase">{{ log?.module }} / {{ log?.entity }}</span>
            </div>
            <div class="col-span-2 border-t border-primary-border/40 pt-2">
              <span class="text-[9px] text-secondary-text uppercase tracking-wider block font-bold mb-0.5">Date & Time</span>
              <span>{{ formatDate(log?.created_at) }}</span>
            </div>
            <div class="col-span-2 border-t border-primary-border/40 pt-2">
              <span class="text-[9px] text-secondary-text uppercase tracking-wider block font-bold mb-0.5">User Agent</span>
              <span class="text-[10px] text-secondary-text leading-relaxed font-mono block select-all break-all bg-background/30 p-2 rounded-lg border border-primary-border/40">{{ log?.user_agent }}</span>
            </div>
          </div>

          <!-- Meta Data (e.g. Failure Reason) -->
          <div v-if="log?.meta_data" class="space-y-1.5">
            <div class="flex items-center gap-1.5">
              <Info class="w-3.5 h-3.5 text-primary-blue shrink-0" />
              <span class="font-semibold text-primary-text">Event Meta Information</span>
            </div>
            <pre class="bg-background/80 border border-primary-border rounded-xl p-3 text-[10px] font-mono text-primary-text overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">{{ JSON.stringify(log.meta_data, null, 2) }}</pre>
          </div>

          <!-- Changes Structured Data -->
          <div v-if="log?.old_data || log?.new_data" class="space-y-2.5">
            <div class="flex items-center gap-1.5">
              <FileCode class="w-3.5 h-3.5 text-primary shrink-0" />
              <span class="font-semibold text-primary-text">Database Changes Info</span>
            </div>

            <!-- Structured Diff Table -->
            <div v-if="changedFields" class="border border-primary-border rounded-xl overflow-hidden bg-background/30">
              <table class="w-full text-[10px] text-left border-collapse table-fixed">
                <thead>
                  <tr class="bg-background border-b border-primary-border text-[9px] uppercase tracking-wider text-secondary-text">
                    <th class="p-2 w-1/4">Field</th>
                    <th class="p-2 w-3/8">Before</th>
                    <th class="p-2 w-3/8">After</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="field in changedFields"
                    :key="field.key"
                    class="border-b border-primary-border/60 last:border-none hover:bg-card-background/40 transition-colors"
                    :class="{ 'bg-primary/5': field.hasChanged }"
                  >
                    <td class="p-2 font-bold text-primary-text truncate" :title="field.key">{{ field.key }}</td>
                    
                    <!-- Old Value -->
                    <td class="p-2 font-mono text-red-500/80 break-all select-all leading-normal">
                      <span v-if="field.oldValue !== undefined" class="line-through">
                        {{ formatValue(field.oldValue) }}
                      </span>
                      <span v-else class="opacity-40">—</span>
                    </td>
                    
                    <!-- New Value -->
                    <td class="p-2 font-mono text-green-500/90 break-all select-all leading-normal">
                      <span v-if="field.newValue !== undefined">
                        {{ formatValue(field.newValue) }}
                      </span>
                      <span v-else class="opacity-40">—</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Fallback raw JSON pre blocks -->
            <div v-else class="space-y-3">
              <div v-if="log?.old_data" class="space-y-1">
                <span class="text-[9px] uppercase font-bold text-red-500/80 tracking-wider">Old Data</span>
                <pre class="bg-red-500/5 border border-red-500/15 rounded-xl p-3 text-[10px] font-mono text-red-400 overflow-auto max-h-48 leading-relaxed">{{ JSON.stringify(log.old_data, null, 2) }}</pre>
              </div>
              <div v-if="log?.new_data" class="space-y-1">
                <span class="text-[9px] uppercase font-bold text-green-500/80 tracking-wider">New Data</span>
                <pre class="bg-green-500/5 border border-green-500/15 rounded-xl p-3 text-[10px] font-mono text-green-400 overflow-auto max-h-48 leading-relaxed">{{ JSON.stringify(log.new_data, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-primary-border flex justify-end shrink-0 bg-card-background">
          <button
            class="px-4 py-2 rounded-lg text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors cursor-pointer w-full text-center"
            @click="emit('close')"
          >
            Close Details
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { X, Info, FileCode } from 'lucide-vue-next'

const props = defineProps({
  open: { type: Boolean, default: false },
  log: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close'])

// Compute table comparison of changed keys
const changedFields = computed(() => {
  const oldObj = props.log?.old_data
  const newObj = props.log?.new_data

  if (!oldObj && !newObj) return null

  // Ensure they are standard objects (and not arrays)
  const isObject = (val) => val && typeof val === 'object' && !Array.isArray(val)
  
  const oldData = isObject(oldObj) ? oldObj : {}
  const newData = isObject(newObj) ? newObj : {}

  if (Object.keys(oldData).length === 0 && Object.keys(newData).length === 0) {
    return null
  }

  const allKeys = [...new Set([...Object.keys(oldData), ...Object.keys(newData)])]
  
  return allKeys.map(key => {
    const oldValue = oldData[key]
    const newValue = newData[key]
    const hasChanged = JSON.stringify(oldValue) !== JSON.stringify(newValue)
    return {
      key,
      oldValue,
      newValue,
      hasChanged
    }
  })
})

const formatValue = (val) => {
  if (val === null) return 'null'
  if (val === undefined) return 'undefined'
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

const getStatusClass = (status) => {
  const s = (status || '').toLowerCase()
  if (s === 'success' || s === 'completed') {
    return 'bg-green-500/10 text-green-700 border-green-500/20'
  }
  if (s === 'failed' || s === 'error') {
    return 'bg-red-500/10 text-red-700 border-red-500/20'
  }
  return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20'
}

const formatDate = (val) => {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
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
