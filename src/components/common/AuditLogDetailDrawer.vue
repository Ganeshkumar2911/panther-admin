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
        class="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-md bg-card-background border-l border-primary-border flex flex-col shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0">
          <div>
            <h3 class="text-sm font-semibold text-primary-text flex items-center gap-2">
              <span>Audit Log Details</span>
              <span
                class="inline-flex text-[9px] font-bold px-2 py-0.5 rounded-full border capitalize select-none"
                :class="getStatusClass(log?.status)"
              >
                {{ log?.status }}
              </span>
            </h3>
            <p class="text-[11px] text-secondary-text mt-0.5">
              Event #{{ log?.id }} · {{ log?.module }} / {{ log?.entity }}
            </p>
          </div>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
            @click="emit('close')"
          >
            <X :size="16" />
          </button>
        </div>

        <!-- Scrollable Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <!-- Actor & Session Card -->
          <div class="bg-background/50 border border-primary-border rounded-xl px-4 py-3.5 space-y-3">
            <p class="text-[9px] uppercase tracking-wider text-secondary-text font-bold">Actor & Session</p>
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0 select-none">
                {{ userInitial }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-semibold text-primary-text truncate">{{ log?.user?.name || log?.name || 'Anonymous' }}</p>
                <p v-if="log?.user?.email || log?.email" class="text-[11px] text-secondary-text truncate mt-0.5">{{ log?.user?.email || log?.email }}</p>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-3 pt-2.5 border-t border-primary-border/60 text-[11px]">
              <div>
                <span class="text-secondary-text block">IP Address</span>
                <span class="font-mono font-medium text-primary-text select-all mt-0.5 block">{{ log?.ip_address || '—' }}</span>
              </div>
              <div>
                <span class="text-secondary-text block">Timestamp</span>
                <span class="font-medium text-primary-text mt-0.5 block">{{ formatDate(log?.created_at) }}</span>
              </div>
            </div>

            <div v-if="log?.user_agent" class="pt-2.5 border-t border-primary-border/60">
              <span class="text-secondary-text text-[11px] block">User Agent</span>
              <span class="text-[10px] text-secondary-text font-mono block select-all break-all mt-1 bg-background/40 p-2 rounded-lg border border-primary-border/50">
                {{ log.user_agent }}
              </span>
            </div>
          </div>

          <!-- Meta Information Card -->
          <div v-if="log?.meta_data && Object.keys(log.meta_data).length > 0" class="bg-background/50 border border-primary-border rounded-xl px-4 py-3.5 space-y-3">
            <p class="text-[9px] uppercase tracking-wider text-secondary-text font-bold flex items-center gap-1.5">
              <Info class="w-3 h-3 text-primary-blue" />
              <span>Meta Information</span>
            </p>
            
            <div class="grid grid-cols-1 gap-2.5 text-[11px]">
              <div v-for="item in formattedMeta" :key="item.key" class="flex flex-col gap-0.5">
                <span class="text-[10px] text-secondary-text font-medium">{{ item.label }}</span>
                <span
                  :class="[
                    'text-xs font-semibold text-primary-text break-all select-all leading-normal',
                    item.key.includes('address') || item.key.includes('id') || item.key.includes('token') ? 'font-mono' : ''
                  ]"
                >
                  {{ item.value }}
                </span>
              </div>
            </div>

            <!-- Collapsible Raw JSON -->
            <details class="group pt-2 border-t border-primary-border/60">
              <summary class="text-[10px] text-secondary-text cursor-pointer hover:text-primary-text transition-colors select-none font-medium flex items-center gap-1">
                <span>Raw Payload</span>
              </summary>
              <pre class="mt-2 bg-background border border-primary-border text-primary-text rounded-xl p-3 text-[10px] font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">{{ JSON.stringify(log.meta_data, null, 2) }}</pre>
            </details>
          </div>

          <!-- Database Changes Card -->
          <div v-if="log?.old_data || log?.new_data" class="bg-background/50 border border-primary-border rounded-xl px-4 py-3.5 space-y-3">
            <p class="text-[9px] uppercase tracking-wider text-secondary-text font-bold flex items-center gap-1.5">
              <FileCode class="w-3 h-3 text-primary" />
              <span>Database Changes</span>
            </p>

            <!-- Structured Diff -->
            <div v-if="changedFields && changedFields.length > 0" class="space-y-3">
              <div
                v-for="field in changedFields"
                :key="field.key"
                class="rounded-xl border border-primary-border overflow-hidden bg-background"
              >
                <div class="px-3 py-1.5 bg-background border-b border-primary-border font-bold text-primary-text text-[10px]">
                  {{ field.key }}
                </div>
                <div class="grid grid-cols-2 divide-x divide-primary-border">
                  <div class="p-2.5">
                    <span class="text-[8px] font-bold uppercase tracking-wider text-primary-red block mb-0.5">Before</span>
                    <span v-if="field.oldValue !== undefined" class="font-mono text-primary-red break-all select-all text-[10px] line-through decoration-primary-red/50">
                      {{ formatValue(field.oldValue) }}
                    </span>
                    <span v-else class="text-secondary-text opacity-50">—</span>
                  </div>
                  <div class="p-2.5">
                    <span class="text-[8px] font-bold uppercase tracking-wider text-primary-green block mb-0.5">After</span>
                    <span v-if="field.newValue !== undefined" class="font-mono text-primary-green break-all select-all text-[10px]">
                      {{ formatValue(field.newValue) }}
                    </span>
                    <span v-else class="text-secondary-text opacity-50">—</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Fallback raw JSON -->
            <div v-else class="space-y-3 text-[11px]">
              <div v-if="log?.old_data" class="space-y-1">
                <span class="text-[9px] uppercase font-bold text-primary-red tracking-wider flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-primary-red"></span> Old Data
                </span>
                <pre class="bg-primary-red/5 border border-primary-red/20 rounded-xl p-3 text-[10px] font-mono text-primary-red overflow-auto max-h-48 leading-relaxed">{{ JSON.stringify(log.old_data, null, 2) }}</pre>
              </div>
              <div v-if="log?.new_data" class="space-y-1">
                <span class="text-[9px] uppercase font-bold text-primary-green tracking-wider flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-primary-green"></span> New Data
                </span>
                <pre class="bg-primary-green/5 border border-primary-green/20 rounded-xl p-3 text-[10px] font-mono text-primary-green overflow-auto max-h-48 leading-relaxed">{{ JSON.stringify(log.new_data, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-primary-border bg-card-background shrink-0">
          <button
            class="w-full px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors cursor-pointer text-center"
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
import { formatDate } from '@/utils/timeFormatter'

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
    return 'bg-primary-green/10 text-primary-green border-primary-green/20'
  }
  if (s === 'failed' || s === 'error') {
    return 'bg-primary-red/10 text-primary-red border-primary-red/20'
  }
  return 'bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20'
}

const userInitial = computed(() => {
  const name = props.log?.user?.name || props.log?.name || 'A'
  return name.charAt(0).toUpperCase()
})

const formattedMeta = computed(() => {
  if (!props.log?.meta_data) return []
  const items = []
  
  const processVal = (val) => {
    if (val === null || val === undefined) return '—'
    if (typeof val === 'object') {
      if (val.wallet_label || val.gateway || val.method_type) {
        const parts = []
        if (val.wallet_label) parts.push(val.wallet_label)
        if (val.gateway) parts.push(`Gateway: ${val.gateway}`)
        if (val.method_type) parts.push(`Type: ${val.method_type}`)
        return parts.join(' | ')
      }
      return JSON.stringify(val)
    }
    return String(val)
  }

  for (const [key, val] of Object.entries(props.log.meta_data)) {
    const label = key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    items.push({
      key,
      label,
      value: processVal(val),
    })
  }
  return items
})
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
