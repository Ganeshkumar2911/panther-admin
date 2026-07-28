<script setup>
import { ref, computed } from 'vue'
import { INITIAL_LEADS } from '@/pages/lead-management/mockLeadData'

import LeadKpiCards from '@/components/lead-management/LeadKpiCards.vue'
import LeadPipelineOverview from '@/components/lead-management/LeadPipelineOverview.vue'
import LeadFunnelVisualization from '@/components/lead-management/LeadFunnelVisualization.vue'
import LeadFilterBar from '@/components/lead-management/LeadFilterBar.vue'
import LeadTable from '@/components/lead-management/LeadTable.vue'
import LeadDetailDrawer from '@/components/lead-management/LeadDetailDrawer.vue'
import LeadFormModal from '@/components/lead-management/LeadFormModal.vue'
import LeadCharts from '@/components/lead-management/LeadCharts.vue'

import {
  Plus,
  Upload,
  Download,
  Target,
  Sparkles,
} from 'lucide-vue-next'

// Reactive state for mock leads
const leads = ref([...INITIAL_LEADS])

// Filter state
const searchQuery = ref('')
const selectedStage = ref('')
const selectedStaff = ref('')
const selectedCountry = ref('')
const selectedSource = ref('')
const selectedPriority = ref('')
const selectedDate = ref('')

// Modal & Drawer state
const drawer = ref({ open: false, lead: null })
const modal = ref({ open: false, mode: 'add', lead: null })

// Computed Filtered Leads
const filteredLeads = computed(() => {
  return leads.value.filter((l) => {
    // 1. Search Query
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase().trim()
      const matchesName = l.name.toLowerCase().includes(q)
      const matchesEmail = l.email.toLowerCase().includes(q)
      const matchesPhone = l.phone.toLowerCase().includes(q)
      if (!matchesName && !matchesEmail && !matchesPhone) return false
    }

    // 2. Stage
    if (selectedStage.value && l.stage !== selectedStage.value) return false

    // 3. Staff
    if (selectedStaff.value && l.assignedStaff !== selectedStaff.value) return false

    // 4. Country
    if (selectedCountry.value && l.country !== selectedCountry.value) return false

    // 5. Source
    if (selectedSource.value && l.source !== selectedSource.value) return false

    // 6. Priority
    if (selectedPriority.value && l.priority !== selectedPriority.value) return false

    return true
  })
})

// KPI Metrics
const totalLeadsCount = computed(() => leads.value.length)
const newLeadsCount = computed(() => leads.value.filter(l => l.stage === 'NEW').length)
const interestedCount = computed(() => leads.value.filter(l => l.stage === 'INTERESTED').length)
const registeredCount = computed(() => leads.value.filter(l => l.stage === 'REGISTERED').length)
const kycApprovedCount = computed(() => leads.value.filter(l => l.stage === 'KYC_APPROVED').length)
const tradingAccountsCount = computed(() => leads.value.filter(l => l.stage === 'TRADING_ACCOUNT_CREATED').length)

function resetFilters() {
  searchQuery.value = ''
  selectedStage.value = ''
  selectedStaff.value = ''
  selectedCountry.value = ''
  selectedSource.value = ''
  selectedPriority.value = ''
  selectedDate.value = ''
}

// Drawer Handlers
function openDrawer(lead) {
  drawer.value = { open: true, lead }
}

function closeDrawer() {
  drawer.value = { open: false, lead: null }
}

function handleAddNote({ leadId, noteText }) {
  const target = leads.value.find((l) => l.id === leadId)
  if (target) {
    if (!target.notes) target.notes = []
    target.notes.unshift({
      id: Date.now(),
      text: noteText,
      time: 'Just now',
      author: 'Super Admin',
    })
    if (drawer.value.lead?.id === leadId) {
      drawer.value.lead = { ...target }
    }
  }
}

// Modal Handlers
function openModal(mode, lead = null) {
  modal.value = { open: true, mode, lead }
}

function closeModal() {
  modal.value = { open: false, mode: 'add', lead: null }
}

function handleSaveLead({ mode, leadId, payload }) {
  if (mode === 'add') {
    const newLeadObj = {
      id: `LEAD-${1000 + leads.value.length + 1}`,
      name: payload.name,
      email: payload.email,
      phone: payload.phone || '+971 50 000 0000',
      country: payload.country,
      flag: payload.flag,
      source: payload.source,
      sourceKey: payload.sourceKey,
      assignedStaff: payload.assignedStaff,
      staffAvatar: payload.staffAvatar,
      stage: payload.stage || 'NEW',
      priority: payload.priority || 'Medium',
      createdAt: 'Just now',
      dateObj: new Date().toISOString().split('T')[0],
      notes: [],
      timeline: [
        { id: 1, title: 'Lead Created', desc: 'Added via CRM Lead Management', time: 'Just now', icon: 'Plus' }
      ],
      followUp: { date: 'Tomorrow', time: '10:00 AM', reminder: true }
    }
    leads.value.unshift(newLeadObj)
  } else if (mode === 'edit' || mode === 'moveStage') {
    const idx = leads.value.findIndex((l) => l.id === leadId)
    if (idx !== -1) {
      const updated = { ...leads.value[idx], ...payload }
      leads.value[idx] = updated
      if (drawer.value.lead?.id === leadId) {
        drawer.value.lead = updated
      }
    }
  }
  closeModal()
}

function handleExportCSV() {
  const headers = ['ID', 'Name', 'Email', 'Phone', 'Country', 'Source', 'Assigned Staff', 'Stage', 'Priority', 'Created Date']
  const rows = filteredLeads.value.map(l => [
    l.id, l.name, l.email, l.phone, l.country, l.source, l.assignedStaff, l.stage, l.priority, l.createdAt
  ])
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function handleImportCSV() {
  alert('Mock CSV Import: Successfully imported 12 new leads into the pipeline!')
  closeModal()
}
</script>

<template>
  <div class="px-4 mx-auto space-y-6 pb-12">
    <!-- Header Row -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-end gap-4">

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 shrink-0">
        <button
          @click="openModal('import')"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-secondary-text hover:text-primary-text text-xs font-medium transition-all duration-200  cursor-pointer"
        >
          <Upload class="w-3.5 h-3.5" />
          <span>Import CSV</span>
        </button>

        <button
          @click="handleExportCSV"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-secondary-text hover:text-primary-text text-xs font-medium transition-all duration-200  cursor-pointer"
        >
          <Download class="w-3.5 h-3.5" />
          <span>Export Leads</span>
        </button>

        <button
          @click="openModal('add')"
          class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-semibold  shadow-primary/20 hover:shadow-primary/30 transition-all duration-200 cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>Add Lead</span>
        </button>
      </div>
    </div>

    <!-- Section 1: KPI Overview Cards -->
    <LeadKpiCards
      :total-leads="totalLeadsCount"
      :new-leads="newLeadsCount"
      :interested="interestedCount"
      :registered="registeredCount"
      :kyc-approved="kycApprovedCount"
      :trading-accounts="tradingAccountsCount"
      :conversion-rate="41"
    />

    <!-- Section 2: Pipeline Overview (Hero Section) -->
    <LeadPipelineOverview
      :leads="leads"
      :selected-stage="selectedStage"
      @select-stage="selectedStage = $event"
    />

    <!-- Section 3: Funnel Visualization -->
    <!-- <LeadFunnelVisualization /> -->

    <!-- Section 4: Filters -->
    <LeadFilterBar
      v-model:searchQuery="searchQuery"
      v-model:selectedStage="selectedStage"
      v-model:selectedStaff="selectedStaff"
      v-model:selectedCountry="selectedCountry"
      v-model:selectedSource="selectedSource"
      v-model:selectedPriority="selectedPriority"
      v-model:selectedDate="selectedDate"
      @reset-filters="resetFilters"
    />

    <!-- Section 5: Primary Lead Table -->
    <LeadTable
      :leads="filteredLeads"
      @open-drawer="openDrawer"
      @edit-lead="openModal('edit', $event)"
      @move-stage="openModal('moveStage', $event)"
      @add-lead="openModal('add')"
    />

    <!-- Section 6: Analytics & Charts -->
    <!-- <LeadCharts :leads="leads" /> -->

    <!-- Detail Drawer Slide-over -->
    <LeadDetailDrawer
      :open="drawer.open"
      :lead="drawer.lead"
      @close="closeDrawer"
      @add-note="handleAddNote"
      @move-stage="openModal('moveStage', drawer.lead)"
      @edit-lead="openModal('edit', drawer.lead)"
    />

    <!-- Action & Form Modal -->
    <LeadFormModal
      :open="modal.open"
      :mode="modal.mode"
      :lead="modal.lead"
      @close="closeModal"
      @save-lead="handleSaveLead"
      @import-csv="handleImportCSV"
    />
  </div>
</template>
