<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
        @click="emit('close')"
      />
    </Transition>

    <!-- Drawer Panel -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-xl bg-card-background border-l border-primary-border flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0 bg-background/50">
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
              :class="getHeaderIconClass(statusValue)"
            >
              <ShieldAlert v-if="isFailed(statusValue)" class="w-5 h-5 text-primary-red" />
              <CheckCircle2 v-else-if="isSuccess(statusValue)" class="w-5 h-5 text-primary-green" />
              <Activity v-else class="w-5 h-5 text-primary-yellow" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-sm font-bold text-primary-text truncate">
                  {{ formatAction(actionValue) }}
                </h3>
                <span
                  class="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border capitalize"
                  :class="getStatusClass(statusValue)"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(statusValue)"></span>
                  {{ statusValue }}
                </span>
              </div>
              <div class="flex items-center gap-2 text-[11px] text-secondary-text mt-0.5 flex-wrap">
                <span class="font-mono bg-background px-1.5 py-0.5 rounded border border-primary-border/60 text-primary-text text-[10px]">
                  #{{ eventId }}
                </span>
                <span>·</span>
                <span class="font-semibold text-primary-text uppercase">{{ moduleValue }}</span>
                <span>/</span>
                <span>{{ entityValue }}</span>
                <span v-if="isValidId(entityIdValue)" class="font-mono text-[10px] text-secondary-text">#{{ entityIdValue }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              class="p-2 rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
              title="Copy Event ID"
              @click="copyText(String(eventId), 'Event ID')"
            >
              <Copy class="w-4 h-4" />
            </button>
            <button
              type="button"
              class="p-2 rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
              @click="emit('close')"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-1 px-6 border-b border-primary-border bg-background/30 text-xs font-medium shrink-0">
          <button
            type="button"
            class="py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5"
            :class="activeTab === 'overview' ? 'border-primary text-primary font-semibold' : 'border-transparent text-secondary-text hover:text-primary-text'"
            @click="activeTab = 'overview'"
          >
            <Info class="w-3.5 h-3.5" />
            <span>Overview & Event</span>
          </button>
          <button
            v-if="hasChanges || log?.old_data || log?.new_data"
            type="button"
            class="py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5"
            :class="activeTab === 'diff' ? 'border-primary text-primary font-semibold' : 'border-transparent text-secondary-text hover:text-primary-text'"
            @click="activeTab = 'diff'"
          >
            <FileCode class="w-3.5 h-3.5" />
            <span>Data Changes</span>
          </button>
          <button
            type="button"
            class="py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5"
            :class="activeTab === 'raw' ? 'border-primary text-primary font-semibold' : 'border-transparent text-secondary-text hover:text-primary-text'"
            @click="activeTab = 'raw'"
          >
            <Code class="w-3.5 h-3.5" />
            <span>Raw Payload</span>
          </button>
        </div>

        <!-- Scrollable Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <!-- Loading State -->
          <div v-if="store.detailLoading" class="space-y-4 animate-pulse">
            <div class="h-20 bg-background rounded-xl border border-primary-border"></div>
            <div class="h-36 bg-background rounded-xl border border-primary-border"></div>
            <div class="h-36 bg-background rounded-xl border border-primary-border"></div>
            <div class="h-28 bg-background rounded-xl border border-primary-border"></div>
          </div>

          <!-- TAB 1: OVERVIEW -->
          <template v-else-if="activeTab === 'overview'">
            <!-- Summary Banner -->
            <div
              v-if="summaryText"
              class="rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs flex gap-3 items-start"
            >
              <Info class="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p class="text-xs text-primary-text font-medium leading-relaxed">
                {{ summaryText }}
              </p>
            </div>

            <!-- Failure Reason Alert Banner -->
            <div
              v-if="failureReason"
              class="rounded-xl border border-primary-red/30 bg-primary-red/5 p-4 text-xs space-y-2 relative overflow-hidden"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-primary-red font-bold">
                  <AlertTriangle class="w-4 h-4 shrink-0" />
                  <span>Execution Failure Details</span>
                </div>
                <button
                  type="button"
                  class="text-[10px] font-semibold text-primary-red hover:underline cursor-pointer"
                  @click="copyText(failureReason, 'Failure Reason')"
                >
                  Copy Reason
                </button>
              </div>
              <p class="text-secondary-text font-mono text-[11px] leading-relaxed break-words bg-black/20 p-2.5 rounded-lg border border-primary-red/20">
                {{ failureReason }}
              </p>
            </div>

            <!-- Actor & Session Information -->
            <div class="bg-background/50 border border-primary-border rounded-xl p-4 space-y-3">
              <div class="flex items-center justify-between">
                <p class="text-[10px] uppercase tracking-wider text-secondary-text font-bold flex items-center gap-1.5">
                  <User class="w-3.5 h-3.5 text-primary" />
                  <span>Actor & Session</span>
                </p>
                <span v-if="actorUser.role" class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 capitalize">
                  {{ actorUser.role }}
                </span>
              </div>

              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0 border border-primary/20">
                  {{ userInitial }}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <p class="text-xs font-bold text-primary-text truncate">
                      {{ actorUser.name }}
                    </p>
                    <span v-if="actorUser.id" class="text-[10px] font-mono text-secondary-text bg-background px-1.5 py-0.2 rounded border border-primary-border/60">
                      ID: {{ actorUser.id }}
                    </span>
                  </div>
                  <p v-if="actorUser.email" class="text-[11px] text-secondary-text truncate mt-0.5 flex items-center gap-1">
                    <Mail class="w-3 h-3 text-secondary-text shrink-0" />
                    <span>{{ actorUser.email }}</span>
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 pt-3 border-t border-primary-border/60 text-xs">
                <div>
                  <span class="text-secondary-text text-[10px] block font-medium">IP Address</span>
                  <div class="flex items-center gap-1 mt-0.5">
                    <Globe class="w-3.5 h-3.5 text-secondary-text" />
                    <span class="font-mono font-semibold text-primary-text select-all text-[11px]">{{ ipAddress || '—' }}</span>
                    <button
                      v-if="ipAddress"
                      type="button"
                      class="text-secondary-text hover:text-primary transition p-0.5 cursor-pointer"
                      title="Copy IP"
                      @click="copyText(ipAddress, 'IP Address')"
                    >
                      <Copy class="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div>
                  <span class="text-secondary-text text-[10px] block font-medium">Event Time</span>
                  <div class="flex items-center gap-1 mt-0.5">
                    <Clock class="w-3.5 h-3.5 text-secondary-text" />
                    <span class="font-medium text-primary-text text-[11px]">{{ formatDate(createdAt) }}</span>
                  </div>
                </div>
              </div>

              <!-- User Agent -->
              <div v-if="userAgent" class="pt-3 border-t border-primary-border/60 text-xs">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-secondary-text text-[10px] font-medium flex items-center gap-1">
                    <Laptop class="w-3.5 h-3.5 text-secondary-text" />
                    <span>Device & User Agent</span>
                  </span>
                  <span class="text-[11px] font-semibold text-primary-text">
                    {{ parsedUserAgent.browser }} on {{ parsedUserAgent.os }}
                  </span>
                </div>
                <p class="text-[10px] text-secondary-text font-mono break-all bg-background/60 p-2 rounded-lg border border-primary-border/50">
                  {{ userAgent }}
                </p>
              </div>
            </div>

            <!-- Action Flow: Source -> Destination -->
            <div v-if="sourceFlow || destinationFlow" class="bg-background/50 border border-primary-border rounded-xl p-4 space-y-3">
              <p class="text-[10px] uppercase tracking-wider text-secondary-text font-bold flex items-center gap-1.5">
                <ArrowRight class="w-3.5 h-3.5 text-primary" />
                <span>Action Flow</span>
              </p>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                <!-- Source -->
                <div class="bg-card-background border border-primary-border/80 rounded-lg p-3 space-y-1 flex flex-col justify-between">
                  <div>
                    <span class="text-[9px] font-bold uppercase tracking-wider text-secondary-text block">Source</span>
                    <p class="text-xs font-bold text-primary-text truncate" :title="sourceFlow?.title">
                      {{ sourceFlow?.title || 'N/A' }}
                    </p>
                    <p v-if="sourceFlow?.subtitle" class="text-[10px] text-secondary-text truncate font-mono">
                      {{ sourceFlow.subtitle }}
                    </p>
                  </div>
                  <div class="flex items-center gap-1.5 pt-1.5 flex-wrap">
                    <span v-if="sourceFlow?.role" class="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 capitalize">
                      {{ sourceFlow.role }}
                    </span>
                    <span v-if="sourceFlow?.type" class="text-[9px] font-medium px-1.5 py-0.5 rounded bg-background border border-primary-border text-secondary-text capitalize">
                      {{ formatLabel(sourceFlow.type) }}
                    </span>
                    <span v-if="sourceFlow?.userId" class="text-[9px] font-mono text-secondary-text">
                      User #{{ sourceFlow.userId }}
                    </span>
                    <span v-if="sourceFlow?.accountId" class="text-[9px] font-mono text-primary-green font-semibold">
                      Account #{{ sourceFlow.accountId }}
                    </span>
                  </div>
                </div>

                <!-- Destination -->
                <div class="bg-card-background border border-primary-border/80 rounded-lg p-3 space-y-1 flex flex-col justify-between">
                  <div>
                    <span class="text-[9px] font-bold uppercase tracking-wider text-secondary-text block">Destination</span>
                    <p class="text-xs font-bold text-primary-text truncate" :title="destinationFlow?.title">
                      {{ destinationFlow?.title || 'N/A' }}
                    </p>
                    <p v-if="destinationFlow?.subtitle" class="text-[10px] text-secondary-text break-all font-mono">
                      {{ destinationFlow.subtitle }}
                    </p>
                  </div>
                  <div class="flex items-center gap-1.5 pt-1.5 flex-wrap">
                    <span v-if="destinationFlow?.role" class="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 capitalize">
                      {{ destinationFlow.role }}
                    </span>
                    <span v-if="destinationFlow?.type" class="text-[9px] font-medium px-1.5 py-0.5 rounded bg-background border border-primary-border text-secondary-text capitalize">
                      {{ formatLabel(destinationFlow.type) }}
                    </span>
                    <span v-if="destinationFlow?.userId" class="text-[9px] font-mono text-secondary-text">
                      User #{{ destinationFlow.userId }}
                    </span>
                    <span v-if="destinationFlow?.accountId" class="text-[9px] font-mono text-primary-green font-semibold">
                      Account #{{ destinationFlow.accountId }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Event Attributes & Metadata -->
            <div v-if="miscellaneousFields.length > 0" class="bg-background/50 border border-primary-border rounded-xl p-4 space-y-3">
              <p class="text-[10px] uppercase tracking-wider text-secondary-text font-bold flex items-center gap-1.5">
                <Layers class="w-3.5 h-3.5 text-primary" />
                <span>Event Attributes & Metadata</span>
              </p>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div
                  v-for="item in miscellaneousFields"
                  :key="item.key"
                  class="bg-card-background/60 border border-primary-border/60 rounded-lg p-2.5 space-y-1"
                  :class="item.fullWidth ? 'sm:col-span-2' : ''"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] text-secondary-text font-semibold uppercase tracking-wider">{{ item.label }}</span>
                    <button
                      v-if="item.isCopyable"
                      type="button"
                      class="text-secondary-text hover:text-primary transition p-0.5 cursor-pointer text-[10px] flex items-center gap-0.5"
                      @click="copyText(item.rawValue, item.label)"
                    >
                      <Copy class="w-3 h-3" />
                    </button>
                  </div>

                  <div v-if="item.isBadge" class="inline-flex">
                    <span
                      class="text-[11px] font-bold px-2 py-0.5 rounded border"
                      :class="item.badgeClass"
                    >
                      {{ item.displayValue }}
                    </span>
                  </div>
                  <div v-else-if="item.isCode" class="font-mono text-[10px] text-primary-text bg-background p-2 rounded border border-primary-border/50 break-all select-all">
                    {{ item.displayValue }}
                  </div>
                  <div v-else class="font-semibold text-primary-text break-words leading-snug">
                    {{ item.displayValue }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Entity & Target Specs Card -->
            <div class="bg-background/50 border border-primary-border rounded-xl p-4 space-y-3">
              <p class="text-[10px] uppercase tracking-wider text-secondary-text font-bold flex items-center gap-1.5">
                <Hash class="w-3.5 h-3.5 text-primary" />
                <span>Entity & Target Specs</span>
              </p>

              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span class="text-[10px] text-secondary-text block">Module</span>
                  <span class="font-bold text-primary-text uppercase text-[11px]">{{ moduleValue }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-secondary-text block">Entity</span>
                  <span class="font-bold text-primary-text text-[11px]">{{ entityValue }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-secondary-text block">Entity ID</span>
                  <span class="font-mono font-bold text-primary text-[11px]">{{ isValidId(entityIdValue) ? `#${entityIdValue}` : '—' }}</span>
                </div>
              </div>
            </div>
          </template>

          <!-- TAB 2: DATABASE CHANGES DIFF -->
          <template v-else-if="activeTab === 'diff'">
            <div class="bg-background/50 border border-primary-border rounded-xl p-4 space-y-3">
              <div class="flex items-center justify-between">
                <p class="text-[10px] uppercase tracking-wider text-secondary-text font-bold flex items-center gap-1.5">
                  <FileCode class="w-3.5 h-3.5 text-primary" />
                  <span>State Changes & Database Diff</span>
                </p>
                <span v-if="changedFields" class="text-[10px] font-semibold text-secondary-text">
                  {{ changedFields.length }} fields affected
                </span>
              </div>

              <!-- Structured Diff Grid -->
              <div v-if="changedFields && changedFields.length > 0" class="space-y-3">
                <div
                  v-for="field in changedFields"
                  :key="field.key"
                  class="rounded-xl border border-primary-border overflow-hidden bg-card-background"
                >
                  <div class="px-3 py-1.5 bg-background border-b border-primary-border font-bold text-primary-text text-[11px] flex items-center justify-between">
                    <span class="font-mono">{{ field.key }}</span>
                    <span
                      v-if="field.hasChanged"
                      class="text-[9px] font-semibold px-2 py-0.2 rounded bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20"
                    >
                      MODIFIED
                    </span>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-primary-border text-xs">
                    <div class="p-3 bg-primary-red/5">
                      <span class="text-[9px] font-bold uppercase tracking-wider text-primary-red block mb-1">Before (Old Value)</span>
                      <span v-if="field.oldValue !== undefined" class="font-mono text-primary-red break-all select-all text-[11px]">
                        {{ formatValue(field.oldValue) }}
                      </span>
                      <span v-else class="text-secondary-text opacity-50 italic">— (none)</span>
                    </div>
                    <div class="p-3 bg-primary-green/5">
                      <span class="text-[9px] font-bold uppercase tracking-wider text-primary-green block mb-1">After (New Value)</span>
                      <span v-if="field.newValue !== undefined" class="font-mono text-primary-green break-all select-all text-[11px]">
                        {{ formatValue(field.newValue) }}
                      </span>
                      <span v-else class="text-secondary-text opacity-50 italic">— (none)</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Fallback raw JSON -->
              <div v-else class="space-y-3 text-xs">
                <div v-if="currentData?.changes" class="space-y-1">
                  <span class="text-[10px] uppercase font-bold text-primary tracking-wider">Changes Payload</span>
                  <pre class="bg-card-background border border-primary-border rounded-xl p-3 text-[10px] font-mono text-primary-text overflow-auto max-h-56 leading-relaxed">{{ JSON.stringify(currentData.changes, null, 2) }}</pre>
                </div>
                <div v-if="currentData?.created" class="space-y-1">
                  <span class="text-[10px] uppercase font-bold text-primary-green tracking-wider">Created Payload</span>
                  <pre class="bg-primary-green/5 border border-primary-green/20 rounded-xl p-3 text-[10px] font-mono text-primary-green overflow-auto max-h-56 leading-relaxed">{{ JSON.stringify(currentData.created, null, 2) }}</pre>
                </div>
                <div v-if="currentData?.deleted" class="space-y-1">
                  <span class="text-[10px] uppercase font-bold text-primary-red tracking-wider">Deleted Payload</span>
                  <pre class="bg-primary-red/5 border border-primary-red/20 rounded-xl p-3 text-[10px] font-mono text-primary-red overflow-auto max-h-56 leading-relaxed">{{ JSON.stringify(currentData.deleted, null, 2) }}</pre>
                </div>
              </div>
            </div>
          </template>

          <!-- TAB 3: RAW PAYLOAD -->
          <template v-else-if="activeTab === 'raw'">
            <div class="bg-background/50 border border-primary-border rounded-xl p-4 space-y-3">
              <div class="flex items-center justify-between">
                <p class="text-[10px] uppercase tracking-wider text-secondary-text font-bold flex items-center gap-1.5">
                  <Code class="w-3.5 h-3.5 text-primary" />
                  <span>Full API Payload JSON</span>
                </p>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  @click="copyText(JSON.stringify(currentData, null, 2), 'Raw JSON')"
                >
                  <Copy class="w-3 h-3" />
                  <span>Copy JSON</span>
                </button>
              </div>

              <pre class="bg-card-background border border-primary-border text-primary-text rounded-xl p-3 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[450px] overflow-y-auto select-all">{{ JSON.stringify(currentData, null, 2) }}</pre>
            </div>
          </template>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-primary-border bg-card-background shrink-0 flex items-center justify-between gap-3">
          <div class="text-[11px] text-secondary-text font-mono">
            ID: {{ eventId }}
          </div>
          <button
            type="button"
            class="px-5 py-2 rounded-lg text-xs font-semibold text-primary-text border border-primary-border hover:bg-background transition cursor-pointer"
            @click="emit('close')"
          >
            Close
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  X,
  Info,
  FileCode,
  ShieldAlert,
  CheckCircle2,
  Activity,
  Copy,
  User,
  Mail,
  Globe,
  Clock,
  Laptop,
  ArrowRight,
  Layers,
  Hash,
  AlertTriangle,
  Code
} from 'lucide-vue-next'
import { formatDate } from '@/utils/timeFormatter'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import { useEnhancedAuditLogsStore } from '@/stores/enhancedAuditLogs/enhancedAuditLogs'

const props = defineProps({
  open: { type: Boolean, default: false },
  log: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close'])

const store = useEnhancedAuditLogsStore()
const snackbar = useSnackbarStore()
const detailData = ref(null)
const activeTab = ref('overview')

// Copy helper
const copyText = (text, label = 'Content') => {
  if (!text) return
  navigator.clipboard.writeText(String(text))
  snackbar.show(`${label} copied to clipboard`, 'success')
}

// Current combined data
const currentData = computed(() => {
  return detailData.value || props.log || {}
})

const eventId = computed(() => {
  return props.log?.audit_log_id || props.log?.id || currentData.value?.audit?.id || '—'
})

const actionValue = computed(() => {
  return currentData.value?.audit?.action || props.log?.action || 'AUDIT_LOG_EVENT'
})

const moduleValue = computed(() => {
  return currentData.value?.audit?.module || props.log?.module || 'SYSTEM'
})

const entityValue = computed(() => {
  return currentData.value?.audit?.entity || props.log?.entity || 'LOG'
})

const entityIdValue = computed(() => {
  return currentData.value?.audit?.entity_id || props.log?.entity_id || null
})

const statusValue = computed(() => {
  return currentData.value?.result?.status || 
    currentData.value?.business_context?.status?.current || 
    props.log?.status || 
    'SUCCESS'
})

const summaryText = computed(() => {
  return currentData.value?.summary || props.log?.summary || null
})

const createdAt = computed(() => {
  return currentData.value?.audit?.created_at || props.log?.created_at || null
})

const ipAddress = computed(() => {
  return currentData.value?.request_context?.ip_address || props.log?.ip_address || null
})

const userAgent = computed(() => {
  return currentData.value?.request_context?.user_agent || props.log?.user_agent || null
})

const failureReason = computed(() => {
  const meta = currentData.value?.meta_data
  const bc = currentData.value?.business_context
  if (currentData.value?.reason) return String(currentData.value.reason)
  if (bc?.reason) return String(bc.reason)
  if (meta?.miscellaneous?.reason) return String(meta.miscellaneous.reason)
  if (meta?.reason) return String(meta.reason)
  if (meta?.error) return String(meta.error)
  if (isFailed(statusValue.value)) return 'Action execution reported failure.'
  return null
})

// Actor info
const actorUser = computed(() => {
  const actor = currentData.value?.actor || {}
  const source = currentData.value?.source || {}
  const user = props.log?.user || {}
  return {
    id: actor.id || source.user_id || source.id || user.id || props.log?.user_id || null,
    name: actor.name || source.name || user.name || props.log?.name || 'Anonymous User',
    email: actor.email || source.email || user.email || props.log?.email || null,
    role: actor.role || source.role || user.role || null
  }
})

const userInitial = computed(() => {
  const name = actorUser.value.name || 'A'
  return name.charAt(0).toUpperCase()
})

// Source flow
const sourceFlow = computed(() => {
  const s = currentData.value?.source
  const metaSource = currentData.value?.meta_data?.source
  const src = s || metaSource
  if (!src) return null

  return {
    title: src.name || src.account_name || src.email || 'Source',
    subtitle: src.account_number || src.email || null,
    role: src.role || null,
    type: src.account_type || null,
    userId: src.user_id || src.id || null,
    accountId: src.account_id || null
  }
})

// Destination flow
const destinationFlow = computed(() => {
  const d = currentData.value?.destination
  const t = currentData.value?.target
  const metaDest = currentData.value?.meta_data?.destination
  const dest = d || metaDest || t
  if (!dest) return null

  return {
    title: dest.display_name || dest.name || dest.account_name || 'Destination',
    subtitle: dest.account_number || dest.email || null,
    role: dest.role || null,
    type: dest.account_type || dest.type || null,
    userId: dest.user_id || null,
    accountId: dest.id || dest.trading_account_id || null
  }
})

// Miscellaneous fields & business attributes
const miscellaneousFields = computed(() => {
  const items = []
  const bc = currentData.value?.business_context
  const tx = currentData.value?.transaction
  const acc = currentData.value?.account
  const misc = currentData.value?.meta_data?.miscellaneous

  // 1. Transaction Amount
  let amountStr = null
  if (tx?.formatted && tx.formatted !== 'null') {
    amountStr = tx.formatted
  } else if (tx?.amount) {
    amountStr = `${tx.currency || ''} ${tx.amount}`.trim()
  } else if (bc?.amount) {
    if (typeof bc.amount === 'object' && bc.amount.value !== null && bc.amount.value !== undefined) {
      amountStr = `${bc.amount.currency || ''} ${bc.amount.value}`.trim()
    } else if (typeof bc.amount === 'object' && bc.amount.currency) {
      amountStr = bc.amount.currency
    } else if (typeof bc.amount !== 'object') {
      amountStr = String(bc.amount)
    }
  } else if (misc?.amount !== undefined) {
    amountStr = `${misc.amount} ${misc.currency || 'USD'}`
  }

  if (amountStr) {
    items.push({
      key: 'amount',
      label: 'Amount',
      displayValue: amountStr,
      isBadge: true,
      badgeClass: 'bg-primary-green/10 text-primary-green border border-primary-green/20'
    })
  }

  // 2. Transaction Type
  const txType = bc?.transaction_type
  if (txType) {
    items.push({
      key: 'transaction_type',
      label: 'Transaction Type',
      displayValue: formatLabel(txType),
      isBadge: false
    })
  }

  // 3. Gateway
  if (bc?.gateway) {
    const gw = typeof bc.gateway === 'object' ? (bc.gateway.name || bc.gateway.gateway) : bc.gateway
    items.push({
      key: 'gateway',
      label: 'Gateway',
      displayValue: String(gw).toUpperCase(),
      isBadge: true,
      badgeClass: 'bg-primary/10 text-primary border border-primary/20'
    })
  }

  // 4. Payment Method
  if (bc?.payment_method) {
    const pm = typeof bc.payment_method === 'object' 
      ? (bc.payment_method.method_type || bc.payment_method.wallet_label || bc.payment_method.name || 'Crypto') 
      : bc.payment_method
    items.push({
      key: 'payment_method',
      label: 'Payment Method',
      displayValue: formatLabel(pm),
      isBadge: false
    })
  }

  // 5. Trading Account
  if (acc?.account_number) {
    items.push({
      key: 'trading_account',
      label: 'Trading Account Number',
      displayValue: acc.account_number,
      rawValue: acc.account_number,
      isCode: true,
      isCopyable: true
    })
  }

  // 6. Broker Group
  if (acc?.broker_group) {
    items.push({
      key: 'broker_group',
      label: 'Broker Group',
      displayValue: acc.broker_group,
      isBadge: true,
      badgeClass: 'bg-background border border-primary-border font-mono text-primary-text'
    })
  }

  // 7. Reference ID / TXID
  const refId = bc?.reference_id || misc?.reference_id
  if (refId) {
    items.push({
      key: 'reference_id',
      label: 'Reference ID',
      displayValue: refId,
      rawValue: refId,
      isCode: true,
      isCopyable: true,
      fullWidth: true
    })
  }

  if (bc?.txid) {
    items.push({
      key: 'txid',
      label: 'TXID / Hash',
      displayValue: bc.txid,
      rawValue: bc.txid,
      isCode: true,
      isCopyable: true,
      fullWidth: true
    })
  }

  if (bc?.transaction_id) {
    items.push({
      key: 'transaction_id',
      label: 'Transaction ID',
      displayValue: bc.transaction_id,
      rawValue: bc.transaction_id,
      isCode: true,
      isCopyable: true
    })
  }

  // 8. Description
  if (bc?.description) {
    items.push({
      key: 'description',
      label: 'Description',
      displayValue: bc.description,
      fullWidth: true
    })
  }

  // 9. Extra meta fields
  if (misc && typeof misc === 'object') {
    const handledKeys = new Set([
      'reason', 'amount', 'currency', 'reference_id'
    ])
    for (const [k, v] of Object.entries(misc)) {
      if (!handledKeys.has(k) && v !== null && v !== undefined && v !== '') {
        const label = k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        const strVal = typeof v === 'object' ? JSON.stringify(v) : String(v)
        items.push({
          key: k,
          label,
          displayValue: strVal,
          rawValue: strVal,
          isCode: typeof v === 'object' || k.includes('id') || k.includes('code'),
          isCopyable: typeof v === 'string' && (k.includes('id') || k.includes('token'))
        })
      }
    }
  }

  return items
})

const parsedUserAgent = computed(() => {
  const ua = userAgent.value
  if (!ua) return { browser: 'Unknown', os: 'Unknown OS' }

  const l = ua.toLowerCase()
  let os = 'Unknown OS'
  if (l.includes('iphone') || l.includes('ipad')) os = 'iOS'
  else if (l.includes('macintosh') || l.includes('mac os')) os = 'macOS'
  else if (l.includes('windows')) os = 'Windows'
  else if (l.includes('linux')) os = 'Linux'
  else if (l.includes('android')) os = 'Android'

  let browser = 'Browser'
  if (l.includes('crios') || (l.includes('chrome') && !l.includes('edg'))) browser = 'Chrome'
  else if (l.includes('safari') && !l.includes('chrome') && !l.includes('crios')) browser = 'Safari'
  else if (l.includes('firefox')) browser = 'Firefox'
  else if (l.includes('edg')) browser = 'Edge'

  return { browser, os }
})

// Diff viewer computed
const hasChanges = computed(() => {
  return currentData.value?.changes && Object.keys(currentData.value.changes).length > 0
})

const changedFields = computed(() => {
  const changes = currentData.value?.changes
  if (changes && typeof changes === 'object' && Object.keys(changes).length > 0) {
    return Object.entries(changes).map(([key, change]) => ({
      key,
      oldValue: change?.old,
      newValue: change?.new,
      hasChanged: true
    }))
  }

  const oldObj = props.log?.old_data
  const newObj = props.log?.new_data

  if (!oldObj && !newObj) return null

  const isObject = (val) => val && typeof val === 'object' && !Array.isArray(val)
  const oldData = isObject(oldObj) ? oldObj : {}
  const newData = isObject(newObj) ? newObj : {}

  if (Object.keys(oldData).length === 0 && Object.keys(newData).length === 0) {
    return null
  }

  const allKeys = [...new Set([...Object.keys(oldData), ...Object.keys(newData)])]

  return allKeys.map((key) => {
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

// Helpers
const isFailed = (status) => {
  const s = String(status || '').toLowerCase()
  return s === 'failed' || s === 'error' || s === 'failure' || s === 'rejected'
}

const isSuccess = (status) => {
  const s = String(status || '').toLowerCase()
  return s === 'success' || s === 'completed' || s === 'approved'
}

const formatAction = (action) => {
  if (!action) return 'Audit Log Event'
  return String(action)
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const formatLabel = (str) => {
  if (!str) return 'N/A'
  return String(str)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const isValidId = (id) => {
  return id !== null && id !== undefined && id !== '' && id !== 'null' && id !== 'N/A'
}

const getStatusClass = (status) => {
  if (isSuccess(status)) {
    return 'bg-primary-green/10 text-primary-green border-primary-green/20'
  }
  if (isFailed(status)) {
    return 'bg-primary-red/10 text-primary-red border-primary-red/20'
  }
  return 'bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20'
}

const getStatusDotClass = (status) => {
  if (isSuccess(status)) return 'bg-primary-green'
  if (isFailed(status)) return 'bg-primary-red'
  return 'bg-primary-yellow'
}

const getHeaderIconClass = (status) => {
  if (isSuccess(status)) return 'bg-primary-green/10 border-primary-green/20'
  if (isFailed(status)) return 'bg-primary-red/10 border-primary-red/20'
  return 'bg-primary-yellow/10 border-primary-yellow/20'
}

const formatValue = (val) => {
  if (val === null) return 'null'
  if (val === undefined) return 'undefined'
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    activeTab.value = 'overview'
    const logId = props.log?.audit_log_id || props.log?.id
    if (logId) {
      try {
        const res = await store.fetchAuditDetails(logId)
        detailData.value = res
      } catch (e) {
        // Handled in store
      }
    }
  } else {
    detailData.value = null
  }
})
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease-out;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>
