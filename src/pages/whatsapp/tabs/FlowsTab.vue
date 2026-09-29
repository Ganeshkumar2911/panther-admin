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
  MoveUp,
  MoveDown,
  Clock,
  Layers,
  Sparkles,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  LayoutGrid,
  List,
  GitFork,
  ArrowRight,
  ShieldCheck,
  Wallet,
  TrendingUp,
  Award,
  Zap,
  Check,
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

const canManageFlows = computed(() => hasPermission(['whatsapp.create', 'whatsapp.manage', 'whatsapp.view']))

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

// Stage filter options for BaseSelect
const stageFilterOptions = [
  { label: 'All Stages', value: '' },
  { label: 'KYC Onboarding', value: 'KYC' },
  { label: 'Deposit Activation', value: 'DEPOSIT' },
  { label: 'Trading Activity', value: 'TRADING' },
  { label: 'Completed / Retention', value: 'COMPLETED' },
]

// Status filter options
const statusFilterOptions = [
  { label: 'All Statuses', value: null },
  { label: 'Active Only', value: true },
  { label: 'Inactive Only', value: false },
]

onMounted(() => {
  flowsStore.fetchFlows()
  if (templatesStore.templates.length === 0) {
    templatesStore.fetchTemplates()
  }
})

// Open modals
const openCreateModal = (stage = 'KYC') => {
  defaultStageForCreate.value = stage || 'KYC'
  isCreateModalOpen.value = true
}

const openEditModal = (flow) => {
  selectedFlowForEdit.value = flow
  isEditModalOpen.value = true
}

const openDeleteDialog = (flow) => {
  selectedFlowForDelete.value = flow
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!selectedFlowForDelete.value) return
  await flowsStore.deleteFlow(selectedFlowForDelete.value.id)
  isDeleteDialogOpen.value = false
  selectedFlowForDelete.value = null
}

const openPreviewForFlow = (flow) => {
  // Find template matching flow.template_name in templatesStore
  const found = (templatesStore.templates || []).find(
    (t) => (t.name || '').toLowerCase() === (flow.template_name || '').toLowerCase()
  )
  if (found) {
    selectedTemplateForPreview.value = found
  } else {
    // Generate synthetic template preview object
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

// Quick inline toggle active
const handleToggleActive = async (flow) => {
  await flowsStore.toggleFlowActive(flow)
}

// Quick move up / down
const handleMoveStep = async (flow, direction) => {
  const currentFlows = [...flowsStore.flows].sort(
    (a, b) => (Number(a.execution_order) || 0) - (Number(b.execution_order) || 0)
  )
  const idx = currentFlows.findIndex((f) => f.id === flow.id)
  if (idx === -1) return

  if (direction === 'up' && idx > 0) {
    const temp = currentFlows[idx]
    currentFlows[idx] = currentFlows[idx - 1]
    currentFlows[idx - 1] = temp
  } else if (direction === 'down' && idx < currentFlows.length - 1) {
    const temp = currentFlows[idx]
    currentFlows[idx] = currentFlows[idx + 1]
    currentFlows[idx + 1] = temp
  } else {
    return
  }

  const orders = currentFlows.map((item, index) => ({
    id: item.id,
    execution_order: index + 1,
    interval_hours: Number(item.interval_hours) || 24,
    stage: item.stage,
  }))

  await flowsStore.reorderFlows(orders)
}

// Helpers for visual badges
const getStageBadgeClass = (stage) => {
  const s = (stage || '').toUpperCase()
  if (s === 'KYC') return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  if (s === 'DEPOSIT') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  if (s === 'TRADING') return 'bg-sky-500/10 text-sky-500 border-sky-500/20'
  return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
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

// Get template body snippet from templates store
const getTemplateSnippet = (templateName) => {
  if (!templateName) return ''
  const tpl = (templatesStore.templates || []).find(
    (t) => (t.name || '').toLowerCase() === templateName.toLowerCase()
  )
  return tpl?.body_text || ''
}
</script>

<template>
  <div class="space-y-3 py-1 min-h-[calc(100vh-140px)] flex flex-col">
    <!-- Filter Toolbar Section (Search, Stage, Status, Refresh, Reset, Reorder, New Step, Layout) -->
    <div class="relative z-10">
      <div
        class="flex w-full min-w-0 flex-col gap-2.5 rounded-xl border border-primary-border bg-card-background/50 p-2.5 sm:flex-row sm:items-center justify-between overflow-visible"
      >
        <!-- Left: Search & Filter Controls -->
        <div class="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          <!-- Search input -->
          <div class="relative w-full sm:w-56">
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
            class="w-full sm:w-44"
            @change="flowsStore.fetchFlows({}, true)"
          />

          <!-- Status Filter -->
          <BaseSelect
            v-model="flowsStore.filters.is_active"
            :options="statusFilterOptions"
            placeholder="Status"
            class="w-full sm:w-36"
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
              v-if="flowsStore.filters.stage || flowsStore.filters.is_active !== null || flowsStore.filters.search"
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
            v-if="canManageFlows && flowsStore.flows.length > 1"
            @click="isReorderModalOpen = true"
            class="h-9 inline-flex items-center gap-1.5 px-3 rounded-lg border border-primary-border bg-card-background hover:bg-background text-secondary-text hover:text-primary-text text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <ArrowUpDown class="w-3.5 h-3.5 text-primary" />
            <span>Reorder Sequence</span>
          </button>

          <!-- New Flow Step Button -->
          <button
            v-if="canManageFlows"
            @click="openCreateModal(flowsStore.filters.stage || 'KYC')"
            class="h-9 inline-flex items-center justify-center gap-1.5 px-3.5 rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-semibold shadow-xs transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
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

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-h-0">
      <!-- Loading Skeleton State -->
      <div
        v-if="flowsStore.loading"
        class="space-y-4"
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
          <div class="h-16 w-full bg-background rounded-xl" />
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
              flowsStore.filters.stage || flowsStore.filters.search || flowsStore.filters.is_active !== null
                ? "No flow steps match your active filters."
                : "Create automated drip message steps triggered sequentially based on customer lifecycle stages."
            }}
          </p>
        </div>
        <button
          v-if="flowsStore.filters.stage || flowsStore.filters.search || flowsStore.filters.is_active !== null"
          @click="flowsStore.resetFilters"
          class="px-4 py-2 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
        >
          Clear Filters
        </button>
        <button
          v-else-if="canManageFlows"
          @click="openCreateModal(flowsStore.filters.stage || 'KYC')"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>Create First Step</span>
        </button>
      </div>

      <!-- 1. VISUAL JOURNEY TIMELINE VIEW -->
      <div
        v-else-if="viewMode === 'journey'"
        class="space-y-4"
      >
        <div
          v-for="(flow, idx) in flowsStore.flows"
          :key="flow.id"
          class="relative flex flex-col items-stretch group"
        >
          <!-- Step Card -->
          <div
            class="bg-card-background border border-primary-border hover:border-primary/40 rounded-2xl p-4.5 transition-all duration-200 hover:shadow-md relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            :class="{ 'opacity-70 bg-card-background/60': !flow.is_active }"
          >
            <!-- Left: Step Sequence Number & Info -->
            <div class="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
              <!-- Step Order Pill -->
              <div class="flex flex-col items-center gap-1 shrink-0">
                <span
                  class="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 font-mono font-bold text-sm flex items-center justify-center shadow-2xs"
                >
                  #{{ flow.execution_order || idx + 1 }}
                </span>
                <span class="text-[9px] font-bold text-secondary-text uppercase">Step</span>
              </div>

              <!-- Details & Message Snippet -->
              <div class="space-y-1.5 min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <!-- Stage Badge -->
                  <span
                    class="text-[10px] font-bold px-2 py-0.5 rounded-md border tracking-wide uppercase"
                    :class="getStageBadgeClass(flow.stage)"
                  >
                    {{ flow.stage }}
                  </span>

                  <!-- Template Name -->
                  <h3
                    class="font-mono text-xs sm:text-sm font-bold text-primary-text truncate"
                    :title="flow.template_name"
                  >
                    {{ flow.template_name }}
                  </h3>

                  <!-- ID Badge -->
                  <span class="text-[10px] text-secondary-text font-semibold px-1.5 py-0.2 bg-background rounded border border-primary-border shrink-0">
                    ID: {{ flow.id }}
                  </span>
                </div>

                <!-- Template Snippet / Text preview -->
                <p
                  v-if="getTemplateSnippet(flow.template_name)"
                  class="text-xs text-secondary-text line-clamp-1 italic max-w-xl font-sans"
                >
                  "{{ getTemplateSnippet(flow.template_name) }}"
                </p>

                <!-- Trigger Delay & Metadata -->
                <div class="flex flex-wrap items-center gap-3 text-[11px] text-secondary-text pt-0.5">
                  <span class="flex items-center gap-1 font-semibold text-primary">
                    <Clock class="w-3.5 h-3.5" />
                    <span>{{ formatIntervalHours(flow.interval_hours) }}</span>
                  </span>

                  <span v-if="flow.created_at">
                    Created {{ formatDate(flow.created_at) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Right: Status Toggle & Action Buttons -->
            <div class="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-primary-border/60 shrink-0">
              <!-- Active Toggle Switch -->
              <div class="flex items-center gap-2">
                <span
                  class="text-[11px] font-semibold"
                  :class="flow.is_active ? 'text-primary-green' : 'text-secondary-text'"
                >
                  {{ flow.is_active ? 'Active' : 'Paused' }}
                </span>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="flow.is_active"
                    class="sr-only peer"
                    @change="handleToggleActive(flow)"
                  />
                  <div
                    class="w-9 h-5 bg-gray-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"
                  ></div>
                </label>
              </div>

              <!-- Move Up / Down Buttons -->
              <div class="flex items-center gap-1 border-l border-primary-border pl-2">
                <Tooltip text="Move Step Up" placement="top">
                  <button
                    :disabled="idx === 0"
                    class="w-7 h-7 flex items-center justify-center rounded-lg border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    @click="handleMoveStep(flow, 'up')"
                  >
                    <MoveUp class="w-3.5 h-3.5" />
                  </button>
                </Tooltip>

                <Tooltip text="Move Step Down" placement="top">
                  <button
                    :disabled="idx === flowsStore.flows.length - 1"
                    class="w-7 h-7 flex items-center justify-center rounded-lg border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    @click="handleMoveStep(flow, 'down')"
                  >
                    <MoveDown class="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
              </div>

              <!-- Action Menu: Preview, Edit, Delete -->
              <div class="flex items-center gap-1.5 border-l border-primary-border pl-2">
                <!-- Preview WhatsApp Mobile Modal -->
                <Tooltip text="Preview WhatsApp Mobile View" placement="top">
                  <button
                    class="w-7 h-7 flex items-center justify-center rounded-lg border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary transition-colors cursor-pointer"
                    @click="openPreviewForFlow(flow)"
                  >
                    <Eye class="w-3.5 h-3.5" />
                  </button>
                </Tooltip>

                <!-- Edit Step -->
                <Tooltip text="Edit Step Configuration" placement="top">
                  <button
                    class="w-7 h-7 flex items-center justify-center rounded-lg border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary transition-colors cursor-pointer"
                    @click="openEditModal(flow)"
                  >
                    <Edit2 class="w-3.5 h-3.5" />
                  </button>
                </Tooltip>

                <!-- Delete Step -->
                <Tooltip text="Delete Step" placement="top">
                  <button
                    class="w-7 h-7 flex items-center justify-center rounded-lg border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary-red transition-colors cursor-pointer"
                    @click="openDeleteDialog(flow)"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>

          <!-- Visual Connecting Arrow between steps -->
          <div
            v-if="idx < flowsStore.flows.length - 1"
            class="flex items-center justify-center py-2 relative"
          >
            <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-primary-border text-[11px] font-semibold text-secondary-text shadow-2xs">
              <Clock class="w-3 h-3 text-primary" />
              <span>Delay interval: <strong>{{ flowsStore.flows[idx + 1]?.interval_hours || 24 }} hours</strong> before Step #{{ idx + 2 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. TABLE DATA VIEW -->
      <div
        v-else-if="viewMode === 'table'"
        class="bg-card-background border border-primary-border rounded-2xl overflow-hidden shadow-xs"
      >
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left text-xs">
            <thead>
              <tr class="border-b border-primary-border bg-background/50 text-secondary-text font-semibold uppercase text-[11px]">
                <th class="p-3.5 pl-5">Step #</th>
                <th class="p-3.5">Stage</th>
                <th class="p-3.5 min-w-[220px]">WhatsApp Template</th>
                <th class="p-3.5">Interval Delay</th>
                <th class="p-3.5">Status</th>
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
                    <span class="font-mono text-xs font-bold text-primary-text block truncate max-w-[240px]">
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

                <!-- Status -->
                <td class="p-3.5">
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      :checked="flow.is_active"
                      class="sr-only peer"
                      @change="handleToggleActive(flow)"
                    />
                    <div
                      class="w-9 h-5 bg-gray-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"
                    ></div>
                  </label>
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

                    <Tooltip text="Edit Step" placement="top">
                      <button
                        class="p-1.5 rounded-lg border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary transition-colors cursor-pointer"
                        @click="openEditModal(flow)"
                      >
                        <Edit2 class="w-3.5 h-3.5" />
                      </button>
                    </Tooltip>

                    <Tooltip text="Delete Step" placement="top">
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
</template>
