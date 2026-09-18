<template>
  <div v-if="open" class="fixed inset-0 z-50 flex justify-end">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      @click="$emit('close')"
    ></div>

    <!-- Drawer Panel -->
    <div class="relative w-full max-w-3xl bg-card-background h-full shadow-2xl flex flex-col animate-slide-left">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-background/50">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg border border-primary-border bg-card-background flex items-center justify-center">
            <ClipboardList class="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-primary-text">Audit Log Details</h2>
            <p class="text-xs text-secondary-text font-mono mt-0.5">Event ID: #{{ log.audit_log_id || log.id }}</p>
          </div>
        </div>
        <button 
          @click="$emit('close')"
          class="p-2 hover:bg-background rounded-full transition-colors text-secondary-text hover:text-primary-text"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- Loading State -->
        <div v-if="store.detailLoading" class="space-y-6 animate-pulse">
          <div class="h-24 bg-background rounded-xl border border-primary-border"></div>
          <div class="grid grid-cols-2 gap-6">
            <div class="h-40 bg-background rounded-xl border border-primary-border"></div>
            <div class="h-40 bg-background rounded-xl border border-primary-border"></div>
          </div>
          <div class="h-64 bg-background rounded-xl border border-primary-border"></div>
        </div>

        <!-- Loaded State -->
        <div v-else-if="detailData" class="space-y-6">
          
          <!-- Summary Banner -->
          <div class="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-4 items-start">
            <Info class="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p class="text-sm text-primary-text font-medium leading-relaxed">{{ detailData.summary || log.summary }}</p>
              <div class="flex items-center gap-4 mt-3 text-xs text-secondary-text font-mono">
                <span class="flex items-center gap-1.5"><Calendar class="w-3.5 h-3.5" /> {{ formatDate(detailData.audit?.created_at || log.created_at) }}</span>
                <span class="flex items-center gap-1.5"><Globe class="w-3.5 h-3.5" /> {{ detailData.request_context?.ip_address || log.ip_address || 'System' }}</span>
              </div>
            </div>
          </div>

          <!-- Actor & Target Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <!-- Actor Card -->
            <div class="border border-primary-border rounded-xl bg-background/30 p-4">
              <div class="flex items-center gap-2 mb-4 pb-3 border-b border-primary-border/50">
                <User class="w-4 h-4 text-secondary-text" />
                <h3 class="text-xs font-semibold text-secondary-text uppercase tracking-wider">Actor / Source</h3>
              </div>
              <div v-if="detailData.actor || detailData.source" class="space-y-2.5 text-sm">
                <div class="flex justify-between">
                  <span class="text-secondary-text text-xs">Name:</span>
                  <span class="font-medium text-primary-text">{{ (detailData.actor || detailData.source)?.name || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-secondary-text text-xs">Email:</span>
                  <span class="font-medium text-primary-text">{{ (detailData.actor || detailData.source)?.email || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-secondary-text text-xs">Role:</span>
                  <span class="font-medium text-primary-text capitalize">{{ (detailData.actor || detailData.source)?.role || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-secondary-text text-xs">ID:</span>
                  <span class="font-mono text-xs text-primary-text">#{{ (detailData.actor || detailData.source)?.id || 'N/A' }}</span>
                </div>
              </div>
              <div v-else class="text-xs text-secondary-text italic text-center py-2">System Generated</div>
            </div>

            <!-- Target Card -->
            <div class="border border-primary-border rounded-xl bg-background/30 p-4">
              <div class="flex items-center gap-2 mb-4 pb-3 border-b border-primary-border/50">
                <Target class="w-4 h-4 text-secondary-text" />
                <h3 class="text-xs font-semibold text-secondary-text uppercase tracking-wider">Target / Destination</h3>
              </div>
              <div v-if="detailData.target || detailData.destination" class="space-y-2.5 text-sm">
                <div class="flex justify-between">
                  <span class="text-secondary-text text-xs">Type:</span>
                  <span class="font-medium text-primary-text">{{ (detailData.target || detailData.destination)?.type || detailData.audit?.entity || 'N/A' }}</span>
                </div>
                <div class="flex justify-between" v-if="(detailData.target || detailData.destination)?.name">
                  <span class="text-secondary-text text-xs">Name:</span>
                  <span class="font-medium text-primary-text">{{ (detailData.target || detailData.destination)?.name }}</span>
                </div>
                <div class="flex justify-between" v-if="(detailData.target || detailData.destination)?.email">
                  <span class="text-secondary-text text-xs">Email:</span>
                  <span class="font-medium text-primary-text">{{ (detailData.target || detailData.destination)?.email }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-secondary-text text-xs">ID:</span>
                  <span class="font-mono text-xs text-primary-text">#{{ (detailData.target || detailData.destination)?.id || detailData.audit?.entity_id || 'N/A' }}</span>
                </div>
              </div>
              <div v-else class="text-xs text-secondary-text italic text-center py-2">No specific target</div>
            </div>

          </div>

          <!-- Changes / Diff Section -->
          <div v-if="hasChanges" class="border border-primary-border rounded-xl overflow-hidden">
            <div class="px-4 py-3 bg-background/50 border-b border-primary-border flex items-center gap-2">
              <FileDiff class="w-4 h-4 text-secondary-text" />
              <h3 class="text-xs font-semibold text-secondary-text uppercase tracking-wider">Data Changes</h3>
            </div>
            
            <div class="p-0 overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-background/20 text-[11px] uppercase tracking-wider text-secondary-text">
                    <th class="p-3 border-b border-primary-border font-medium w-1/3">Field Name</th>
                    <th class="p-3 border-b border-primary-border font-medium w-1/3 border-l">Old Value</th>
                    <th class="p-3 border-b border-primary-border font-medium w-1/3 border-l">New Value</th>
                  </tr>
                </thead>
                <tbody class="text-xs">
                  <tr v-for="(change, field) in detailData.changes" :key="field" class="border-b border-primary-border last:border-none">
                    <td class="p-3 font-mono text-primary-text break-all">{{ field }}</td>
                    <td class="p-3 border-l border-primary-border bg-red-500/5 text-red-600/90 break-all">
                      {{ formatValue(change.old) }}
                    </td>
                    <td class="p-3 border-l border-primary-border bg-green-500/5 text-green-600/90 break-all">
                      {{ formatValue(change.new) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Creation / Deletion Payload -->
          <div v-if="hasCreationOrDeletion" class="border border-primary-border rounded-xl overflow-hidden">
            <div class="px-4 py-3 bg-background/50 border-b border-primary-border flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Database class="w-4 h-4 text-secondary-text" />
                <h3 class="text-xs font-semibold text-secondary-text uppercase tracking-wider">
                  {{ hasCreation ? 'Created Entity Data' : 'Deleted Entity Data' }}
                </h3>
              </div>
            </div>
            <div class="p-4 bg-background/20">
              <pre class="text-[11px] font-mono text-primary-text overflow-x-auto whitespace-pre-wrap">{{ JSON.stringify(detailData.created || detailData.deleted, null, 2) }}</pre>
            </div>
          </div>

          <!-- Request Context -->
          <div v-if="detailData.request_context && Object.keys(detailData.request_context).length > 0" class="border border-primary-border rounded-xl overflow-hidden">
             <div class="px-4 py-3 bg-background/50 border-b border-primary-border flex items-center gap-2">
              <Server class="w-4 h-4 text-secondary-text" />
              <h3 class="text-xs font-semibold text-secondary-text uppercase tracking-wider">Request Context</h3>
            </div>
            <div class="p-4 bg-background/20 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div v-if="detailData.request_context.endpoint">
                <span class="text-secondary-text block mb-1">Endpoint</span>
                <span class="font-mono text-primary-text break-all bg-background px-2 py-1 rounded border border-primary-border inline-block">{{ detailData.request_context.http_method }} {{ detailData.request_context.endpoint }}</span>
              </div>
              <div v-if="detailData.request_context.request_id">
                <span class="text-secondary-text block mb-1">Request ID</span>
                <span class="font-mono text-primary-text">{{ detailData.request_context.request_id }}</span>
              </div>
              <div v-if="detailData.request_context.user_agent" class="sm:col-span-2">
                <span class="text-secondary-text block mb-1">User Agent</span>
                <span class="font-mono text-primary-text break-all text-[10px]">{{ detailData.request_context.user_agent }}</span>
              </div>
            </div>
          </div>

          <!-- Raw Data (Fallback/Advanced) -->
          <div class="border border-primary-border rounded-xl overflow-hidden">
            <button 
              @click="showRaw = !showRaw"
              class="w-full px-4 py-3 bg-background/50 hover:bg-background border-b border-primary-border flex items-center justify-between transition-colors"
            >
              <div class="flex items-center gap-2">
                <Code class="w-4 h-4 text-secondary-text" />
                <h3 class="text-xs font-semibold text-secondary-text uppercase tracking-wider">Raw JSON Details</h3>
              </div>
              <ChevronDown class="w-4 h-4 text-secondary-text transition-transform" :class="{ 'rotate-180': showRaw }" />
            </button>
            <div v-show="showRaw" class="p-4 bg-gray-900 overflow-x-auto">
              <pre class="text-[10px] text-gray-300 font-mono leading-relaxed">{{ JSON.stringify(detailData, null, 2) }}</pre>
            </div>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { 
  X, ClipboardList, Info, Calendar, Globe, 
  User, Target, FileDiff, Database, Server, Code, ChevronDown
} from 'lucide-vue-next';
import { useEnhancedAuditLogsStore } from '@/stores/enhancedAuditLogs/enhancedAuditLogs';
import { formatDate } from '@/utils/timeFormatter';

const props = defineProps({
  open: { type: Boolean, default: false },
  log: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['close']);

const store = useEnhancedAuditLogsStore();
const detailData = ref(null);
const showRaw = ref(false);

const hasChanges = computed(() => {
  return detailData.value?.changes && Object.keys(detailData.value.changes).length > 0;
});

const hasCreation = computed(() => {
  return detailData.value?.created && Object.keys(detailData.value.created).length > 0;
});

const hasDeletion = computed(() => {
  return detailData.value?.deleted && Object.keys(detailData.value.deleted).length > 0;
});

const hasCreationOrDeletion = computed(() => hasCreation.value || hasDeletion.value);

const formatValue = (val) => {
  if (val === null || val === undefined) return 'null';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
};

watch(() => props.open, async (isOpen) => {
  if (isOpen && props.log?.audit_log_id) {
    try {
      showRaw.value = false;
      const res = await store.fetchAuditDetails(props.log.audit_log_id);
      detailData.value = res;
    } catch (e) {
      // Error handled in store
    }
  } else if (isOpen && props.log?.id) {
     try {
      showRaw.value = false;
      const res = await store.fetchAuditDetails(props.log.id);
      detailData.value = res;
    } catch (e) {
      // Error handled in store
    }
  } else {
    detailData.value = null;
  }
});
</script>

<style scoped>
.animate-slide-left {
  animation: slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideLeft {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
</style>
