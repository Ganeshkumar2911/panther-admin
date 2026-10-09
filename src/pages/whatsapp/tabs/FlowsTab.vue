<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import {
  Plus,
  RotateCw,
  RotateCcw,
  Search,
  Eye,
  Edit2,
  Trash2,
  ArrowUpDown,
  Clock,
  Layers,
  Sparkles,
  FileText,
  CheckCircle2,
  CheckCheck,
  Smartphone,
  XCircle,
  AlertCircle,
  ShieldAlert,
  LayoutGrid,
  List,
  GitFork,
  ArrowRight,
  ArrowDown,
  ShieldCheck,
  Wallet,
  TrendingUp,
  Award,
  Zap,
  Check,
  MessageSquare,
} from 'lucide-vue-next'
import { useWhatsAppFlowsStore } from '@/stores/whatsapp/flows'
import { useWhatsAppTemplatesStore } from '@/stores/whatsapp/templates'
import { usePermissionCheck } from '@/composables/usePermissionCheck'
import BaseSelect from '@/components/common/BaseSelect.vue'
import Tooltip from '@/components/common/Tooltip.vue'
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue'
import TemplatePreviewModal from '@/components/whatsapp/TemplatePreviewModal.vue'
import CreateFlowModal from '../components/CreateFlowModal.vue'
import EditFlowModal from '../components/EditFlowModal.vue'
import ReorderFlowsModal from '../components/ReorderFlowsModal.vue'
import { formatDate } from '@/utils/timeFormatter'

const flowsStore = useWhatsAppFlowsStore()
const templatesStore = useWhatsAppTemplatesStore()
const { hasPermission } = usePermissionCheck()

// Permissions
const canViewFlows = computed(() =>
  hasPermission(['whatsapp.template_view', 'template_view'])
)
const canCreateTemplate = computed(() =>
  hasPermission(['whatsapp.template_create', 'template_create'])
)
const canUpdateTemplate = computed(() =>
  hasPermission(['whatsapp.template_update', 'template_update'])
)
const canDeleteTemplate = computed(() =>
  hasPermission(['whatsapp.template_delete', 'template_delete'])
)

// UI States
const viewMode = ref('journey') // 'journey' | 'table'
const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isReorderModalOpen = ref(false)
const isPreviewModalOpen = ref(false)
const isDeleteDialogOpen = ref(false)

const selectedFlowForEdit = ref(null)
const selectedFlowForDelete = ref(null)
const selectedTemplateForPreview = ref(null)
const defaultStageForCreate = ref('KYC')

// Dynamic Stage Filter Options based on flows present
const stageFilterOptions = computed(() => {
  const defaultStages = ['KYC', 'ONBOARDING', 'DEPOSIT', 'TRADING', 'WITHDRAWAL', 'COMPLETED', 'RETENTION']
  const existingStages = (flowsStore.flows || [])
    .map((f) => (f.stage || '').toUpperCase().trim())
    .filter(Boolean)
  const allStages = Array.from(new Set([...defaultStages, ...existingStages]))

  return [
    { label: 'All Stages', value: '' },
    ...allStages.map((s) => ({ label: s, value: s })),
  ]
})

onMounted(() => {
  if (canViewFlows.value) {
    flowsStore.fetchFlows()
  }
  if (templatesStore.templates.length === 0) {
    templatesStore.fetchTemplates()
  }
})

// Open modals
const openCreateModal = (stage = 'KYC') => {
  if (!canCreateTemplate.value) return
  defaultStageForCreate.value = stage || 'KYC'
  isCreateModalOpen.value = true
}

const openEditModal = (flow) => {
  if (!canUpdateTemplate.value) return
  selectedFlowForEdit.value = flow
  isEditModalOpen.value = true
}

const openDeleteDialog = (flow) => {
  if (!canDeleteTemplate.value) return
  selectedFlowForDelete.value = flow
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!canDeleteTemplate.value || !selectedFlowForDelete.value) return
  await flowsStore.deleteFlow(selectedFlowForDelete.value.id)
  isDeleteDialogOpen.value = false
  selectedFlowForDelete.value = null
}

const getTemplateData = (templateName) => {
  if (!templateName) return null
  return (templatesStore.templates || []).find(
    (t) => (t.name || '').toLowerCase() === templateName.toLowerCase()
  ) || null
}

const openPreviewForFlow = (flow) => {
  const found = getTemplateData(flow.template_name)
  if (found) {
    selectedTemplateForPreview.value = found
  } else {
    selectedTemplateForPreview.value = {
      id: flow.id,
      name: flow.template_name,
      category: 'MARKETING',
      status: 'APPROVED',
      body_text: `Automated message step for stage ${flow.stage} (Template: ${flow.template_name}).\nTrigger delay: ${flow.interval_hours} hours.`,
      language: 'en',
    }
  }
  isPreviewModalOpen.value = true
}

// Stage badge styling
const getStageBadgeClass = (stage) => {
  const s = (stage || '').toUpperCase().trim()
  if (s === 'KYC') return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  if (s === 'DEPOSIT') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  if (s === 'TRADING') return 'bg-sky-500/10 text-sky-500 border-sky-500/20'
  if (s === 'COMPLETED' || s === 'RETENTION') return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
  if (s === 'WITHDRAWAL') return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
  if (s === 'ONBOARDING') return 'bg-teal-500/10 text-teal-500 border-teal-500/20'
  return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
}

const formatIntervalHours = (hours) => {
  const h = Number(hours) || 0
  if (h === 0) return 'Immediate'
  if (h === 24) return 'After 24 hrs (1 Day)'
  if (h === 48) return 'After 48 hrs (2 Days)'
  if (h === 72) return 'After 72 hrs (3 Days)'
  if (h % 24 === 0) return `After ${h / 24} Days (${h} hrs)`
  return `After ${h} Hours`
}

// Helper to escape and highlight {{variable}} tags in WhatsApp message body
const formatBodyWithVariables = (text) => {
  if (!text) return ''
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

  return escaped.replace(/\{\{([a-zA-Z0-9_-]+)\}\}/g, (match, v) => {
    return `<span class="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md bg-primary/10 text-primary font-mono text-[11px] font-bold border border-primary/20">\{\{${v}\}\}</span>`
  })
}

const formatTime = (dateStr) => {
  if (!dateStr || dateStr === '-') {
    const now = new Date()
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
  }
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) {
      const now = new Date()
      return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    }
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
  } catch (_) {
    const now = new Date()
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
  }
}
</script>

<template>
  <div class="h-full">
    <!-- Access Restricted Fallback -->
    <div
      v-if="!canViewFlows"
      class="flex flex-col items-center justify-center p-12 bg-card-background border border-primary-border rounded-2xl text-center min-h-[360px] gap-3"
    >
      <div class="w-12 h-12 rounded-xl bg-card-background border border-primary-border flex items-center justify-center text-secondary-text">
        <ShieldAlert class="w-6 h-6 text-primary-red" />
      </div>
      <div class="space-y-1">
        <h3 class="text-sm font-semibold text-primary-text">Access Restricted</h3>
        <p class="text-xs text-secondary-text max-w-sm mx-auto">
          You do not have permission to view WhatsApp flows. Please contact your system administrator.
        </p>
      </div>
    </div>

    <div v-else class="h-full flex flex-col overflow-hidden space-y-3">
    <!-- Filter Toolbar Section (Fixed at Top) -->
    <div class="shrink-0 relative z-10">
      <div
        class="flex w-full min-w-0 flex-col gap-2.5 rounded-xl border border-primary-border bg-card-background/50 p-2.5 sm:flex-row sm:items-center justify-between overflow-visible"
      >
        <!-- Left: Search & Filter Controls -->
        <div class="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          <!-- Search input -->
          <div class="relative w-full sm:w-60">
            <Search class="w-3.5 h-3.5 text-secondary-text absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              v-model="flowsStore.filters.search"
              type="text"
              placeholder="Search template name..."
              class="input-field pl-8.5 pr-3 py-1.5 text-xs"
              @input="flowsStore.fetchFlows({}, true)"
            />
          </div>

          <!-- Stage Filter -->
          <BaseSelect
            v-model="flowsStore.filters.stage"
            :options="stageFilterOptions"
            placeholder="All Stages"
            class="w-full sm:w-48"
            @change="flowsStore.fetchFlows({}, true)"
          />

          <!-- Refresh & Reset Buttons -->
          <div class="flex items-center gap-1.5 h-9">
            <Tooltip text="Refresh Flows" placement="top">
              <button
                :disabled="flowsStore.loading"
                @click="flowsStore.fetchFlows({}, true)"
                class="w-9 h-9 flex items-center justify-center text-xs font-medium text-secondary-text hover:text-primary-text bg-card-background hover:bg-background rounded-lg border border-primary-border transition-colors cursor-pointer"
                :class="{ 'opacity-50 cursor-not-allowed': flowsStore.loading }"
              >
                <RotateCw
                  class="w-4 h-4"
                  :class="{ 'animate-spin': flowsStore.loading }"
                />
              </button>
            </Tooltip>

            <button
              v-if="flowsStore.filters.stage || flowsStore.filters.search"
              @click="flowsStore.resetFilters"
              class="h-9 px-3 text-xs font-semibold text-secondary-text hover:text-primary-text bg-card-background hover:bg-background rounded-lg border border-primary-border transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <!-- Right: Action Buttons + View Mode Toggle -->
        <div class="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-auto">
          <!-- Reorder Button -->
          <button
            v-if="canUpdateTemplate && flowsStore.flows.length > 1"
            @click="isReorderModalOpen = true"
            class="h-9 inline-flex items-center gap-1.5 px-3 rounded-lg border border-primary-border bg-card-background hover:bg-background text-secondary-text hover:text-primary-text text-xs font-semibold transition-all cursor-pointer"
          >
            <ArrowUpDown class="w-3.5 h-3.5 text-primary" />
            <span>Reorder Sequence</span>
          </button>

          <!-- New Flow Step Button -->
          <button
            v-if="canCreateTemplate"
            @click="openCreateModal(flowsStore.filters.stage || 'KYC')"
            class="h-9 inline-flex items-center justify-center gap-1.5 px-3.5 rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
          >
            <Plus class="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Flow Step</span>
          </button>

          <!-- Layout Switcher -->
          <div class="flex items-center gap-1 bg-background border border-primary-border rounded-lg p-1 h-9 shrink-0">
            <Tooltip text="Visual Journey Sequence" placement="top">
              <button
                @click="viewMode = 'journey'"
                class="w-7 h-7 flex items-center justify-center rounded-md text-xs transition-colors cursor-pointer"
                :class="
                  viewMode === 'journey'
                    ? 'bg-primary text-white font-medium'
                    : 'text-secondary-text hover:text-primary-text'
                "
              >
                <GitFork class="w-4 h-4" />
              </button>
            </Tooltip>

            <Tooltip text="Table List View" placement="top">
              <button
                @click="viewMode = 'table'"
                class="w-7 h-7 flex items-center justify-center rounded-md text-xs transition-colors cursor-pointer"
                :class="
                  viewMode === 'table'
                    ? 'bg-primary text-white font-medium'
                    : 'text-secondary-text hover:text-primary-text'
                "
              >
                <List class="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area (Scrollable Cards/Table Container) -->
    <div class="flex-1 min-h-0 overflow-y-auto no-scrollbar pr-1 pb-4">
      <!-- Loading Skeleton State -->
      <div
        v-if="flowsStore.loading && flowsStore.flows.length === 0"
        class="space-y-4 max-w-2xl mx-auto w-full"
      >
        <div
          v-for="n in 3"
          :key="n"
          class="bg-card-background border border-primary-border rounded-2xl p-5 animate-pulse space-y-4"
        >
          <div class="flex items-center justify-between">
            <div class="h-4 w-40 bg-background rounded-md" />
            <div class="h-5 w-20 bg-background rounded-full" />
          </div>
          <div class="h-32 w-full bg-background rounded-xl" />
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="flowsStore.flows.length === 0"
        class="flex-1 flex flex-col items-center justify-center gap-4 py-20 bg-card-background/30 border border-primary-border rounded-2xl text-center px-4"
      >
        <div class="w-16 h-16 rounded-2xl bg-card-background border border-primary-border flex items-center justify-center text-secondary-text">
          <GitFork class="w-8 h-8 stroke-[1.5]" />
        </div>
        <div class="max-w-sm">
          <h3 class="text-base font-bold text-primary-text">No template flows configured</h3>
          <p class="text-xs text-secondary-text mt-1">
            {{
              flowsStore.filters.stage || flowsStore.filters.search
                ? "No flow steps match your active filters."
                : "Create automated drip message steps triggered sequentially based on customer lifecycle stages."
            }}
          </p>
        </div>
        <button
          v-if="flowsStore.filters.stage || flowsStore.filters.search"
          @click="flowsStore.resetFilters"
          class="px-4 py-2 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
        >
          Clear Filters
        </button>
        <button
          v-else-if="canCreateTemplate"
          @click="openCreateModal(flowsStore.filters.stage || 'KYC')"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-semibold transition-colors cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>Create First Step</span>
        </button>
      </div>

      <!-- 1. PROFESSIONAL VISUAL JOURNEY TIMELINE VIEW -->
      <div
        v-else-if="viewMode === 'journey'"
        class="space-y-0 max-w-2xl mx-auto w-full py-2"
      >
        <div
          v-for="(flow, idx) in flowsStore.flows"
          :key="flow.id"
          class="relative flex flex-col items-stretch"
        >
          <!-- Clean Flow Step Card -->
          <div
            class="group bg-card-background border border-primary-border rounded-2xl p-4 sm:p-4.5 flex items-center justify-between gap-4 transition-colors relative"
          >
            <!-- Left: Badges & Template Name Heading -->
            <div class="space-y-1.5 min-w-0 flex-1">
              <!-- Top Row Badges -->
              <div class="flex items-center gap-2 flex-wrap">
                <!-- Stage Badge -->
                <span
                  class="text-[11px] font-bold px-2.5 py-0.5 rounded-md border tracking-wide uppercase"
                  :class="getStageBadgeClass(flow.stage)"
                >
                  {{ flow.stage }}
                </span>

                <!-- Step Number Badge -->
                <span
                  class="text-[11px] text-secondary-text font-semibold px-2 py-0.5 bg-background rounded-md border border-primary-border shrink-0 font-mono"
                >
                  #Step {{ flow.execution_order || idx + 1 }}
                </span>

                <!-- Interval Delay Badge -->
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary-green/10 text-primary-green border border-primary-green/20"
                >
                  <Clock class="w-3 h-3" />
                  <span>{{ formatIntervalHours(flow.interval_hours) }}</span>
                </span>
              </div>

              <!-- Template Heading -->
              <div class="flex items-center gap-2 min-w-0 pt-0.5">
                <MessageSquare class="w-4 h-4 text-primary-green shrink-0" />
                <h2
                  class="font-mono text-base font-bold text-primary-text truncate"
                  :title="flow.template_name"
                >
                  {{ flow.template_name }}
                </h2>
              </div>
            </div>

            <!-- Right: Action Buttons -->
            <div class="flex items-center gap-1.5 shrink-0">
              <Tooltip text="Preview WhatsApp Template" placement="top">
                <button
                  @click="openPreviewForFlow(flow)"
                  class="w-8 h-8 flex items-center justify-center rounded-lg border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary transition-colors cursor-pointer"
                >
                  <Eye class="w-4 h-4" />
                </button>
              </Tooltip>

              <Tooltip v-if="canUpdateTemplate" text="Edit Step" placement="top">
                <button
                  @click="openEditModal(flow)"
                  class="w-8 h-8 flex items-center justify-center rounded-lg border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary transition-colors cursor-pointer"
                >
                  <Edit2 class="w-4 h-4" />
                </button>
              </Tooltip>

              <Tooltip v-if="canDeleteTemplate" text="Delete Step" placement="top">
                <button
                  @click="openDeleteDialog(flow)"
                  class="w-8 h-8 flex items-center justify-center rounded-lg border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary-red transition-colors cursor-pointer"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          </div>

          <!-- Flow Downward Connecting Arrow Between Steps -->
          <div
            v-if="idx < flowsStore.flows.length - 1"
            class="flex items-center justify-center py-2 select-none"
          >
            <div class="flex flex-col items-center">
              <div class="w-0.5 h-3 bg-gradient-to-b from-primary/50 to-primary"></div>
              <div class="w-6 h-6 rounded-full bg-card-background border border-primary/40 text-primary flex items-center justify-center my-0.5">
                <ArrowDown class="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <div class="w-0.5 h-3 bg-gradient-to-b from-primary to-primary/50"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. TABLE DATA VIEW (NO ACTIVE TOGGLE) -->
      <div
        v-else-if="viewMode === 'table'"
        class="bg-card-background border border-primary-border rounded-2xl overflow-hidden"
      >
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left text-xs">
            <thead>
              <tr class="border-b border-primary-border bg-background/50 text-secondary-text font-semibold uppercase text-[11px]">
                <th class="p-3.5 pl-5">Step #</th>
                <th class="p-3.5">Stage</th>
                <th class="p-3.5 min-w-[240px]">WhatsApp Template</th>
                <th class="p-3.5">Interval Delay</th>
                <th class="p-3.5">Created Date</th>
                <th class="p-3.5 text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-primary-border text-primary-text">
              <tr
                v-for="(flow, idx) in flowsStore.flows"
                :key="flow.id"
                class="hover:bg-background/40 transition-colors group"
              >
                <!-- Order # -->
                <td class="p-3.5 pl-5 font-mono font-bold text-primary">
                  #{{ flow.execution_order || idx + 1 }}
                </td>

                <!-- Stage -->
                <td class="p-3.5">
                  <span
                    class="text-[10px] font-bold px-2 py-0.5 rounded border uppercase"
                    :class="getStageBadgeClass(flow.stage)"
                  >
                    {{ flow.stage }}
                  </span>
                </td>

                <!-- Template Name -->
                <td class="p-3.5">
                  <div class="space-y-0.5">
                    <span class="font-mono text-xs font-bold text-primary-text block truncate max-w-[260px]">
                      {{ flow.template_name }}
                    </span>
                    <span class="text-[10px] text-secondary-text font-mono">
                      ID: #{{ flow.id }}
                    </span>
                  </div>
                </td>

                <!-- Interval Delay -->
                <td class="p-3.5">
                  <span class="inline-flex items-center gap-1 font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/20 text-[11px]">
                    <Clock class="w-3 h-3" />
                    <span>{{ formatIntervalHours(flow.interval_hours) }}</span>
                  </span>
                </td>

                <!-- Created Date -->
                <td class="p-3.5 text-secondary-text text-xs">
                  {{ formatDate(flow.created_at || flow.updated_at) }}
                </td>

                <!-- Actions -->
                <td class="p-3.5 text-right pr-5">
                  <div class="flex items-center justify-end gap-1.5">
                    <Tooltip text="Preview Template" placement="top">
                      <button
                        class="p-1.5 rounded-lg border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary transition-colors cursor-pointer"
                        @click="openPreviewForFlow(flow)"
                      >
                        <Eye class="w-3.5 h-3.5" />
                      </button>
                    </Tooltip>

                    <Tooltip v-if="canUpdateTemplate" text="Edit Step" placement="top">
                      <button
                        class="p-1.5 rounded-lg border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary transition-colors cursor-pointer"
                        @click="openEditModal(flow)"
                      >
                        <Edit2 class="w-3.5 h-3.5" />
                      </button>
                    </Tooltip>

                    <Tooltip v-if="canDeleteTemplate" text="Delete Step" placement="top">
                      <button
                        class="p-1.5 rounded-lg border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary-red transition-colors cursor-pointer"
                        @click="openDeleteDialog(flow)"
                      >
                        <Trash2 class="w-3.5 h-3.5" />
                      </button>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <!-- 1. Create Flow Modal -->
    <CreateFlowModal
      :open="isCreateModalOpen"
      :default-stage="defaultStageForCreate"
      @close="isCreateModalOpen = false"
      @created="flowsStore.fetchFlows({}, true)"
    />

    <!-- 2. Edit Flow Modal -->
    <EditFlowModal
      :open="isEditModalOpen"
      :flow="selectedFlowForEdit"
      @close="isEditModalOpen = false"
      @updated="flowsStore.fetchFlows({}, true)"
    />

    <!-- 3. Reorder Flows Modal -->
    <ReorderFlowsModal
      :open="isReorderModalOpen"
      @close="isReorderModalOpen = false"
      @reordered="flowsStore.fetchFlows({}, true)"
    />

    <!-- 4. WhatsApp Live Preview Modal -->
    <TemplatePreviewModal
      :is-open="isPreviewModalOpen"
      :template="selectedTemplateForPreview"
      @close="isPreviewModalOpen = false"
    />

    <!-- 5. Delete Confirmation Dialog -->
    <ConfirmationDialog
      :open="isDeleteDialogOpen"
      title="Delete Flow Step"
      :message="`Are you sure you want to delete this flow step (${selectedFlowForDelete?.template_name || 'step'})? This automation step will no longer execute.`"
      type="danger"
      confirm-text="Delete Step"
      :loading="flowsStore.actionLoading"
      @confirm="confirmDelete"
      @cancel="isDeleteDialogOpen = false"
    />
  </div>
  </div>
</template>
