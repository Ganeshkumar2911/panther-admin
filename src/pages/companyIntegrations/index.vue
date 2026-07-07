<template>
  <div class="px-4 pb-8">
    <!-- Header -->
    <div class="flex items-center justify-end gap-3 mb-6">
      <!-- <div class="flex items-center gap-2.5">
         <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Cpu class="w-5 h-5" />
        </div>
        <div>
          <h1 class="text-base font-bold text-primary-text">Company Integrations</h1>
          <p class="text-xs text-secondary-text mt-0.5">Manage external system connections and API providers</p>
        </div>
      </div> -->

      <button
        class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer"
        @click="handleOpenCreate"
      >
        <Plus class="w-3.5 h-3.5" />
        Add Integration
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="store.loading" class="w-full border border-primary-border rounded-xl overflow-hidden bg-card-background/10">
      <div class="p-4 border-b border-primary-border bg-card-background/30 flex gap-4">
        <div v-for="n in 5" :key="n" class="h-4 bg-background animate-pulse rounded w-full" />
      </div>
      <div class="p-4 space-y-4">
        <div v-for="n in 4" :key="n" class="flex gap-4">
          <div v-for="c in 5" :key="c" class="h-5 bg-background animate-pulse rounded w-full" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="store.records.length === 0" class="flex flex-col items-center gap-4 py-20 bg-card-background/20 rounded-2xl border border-primary-border">
      <div class="w-14 h-14 rounded-2xl bg-card-background border border-primary-border flex items-center justify-center text-secondary-text">
        <Cpu class="w-6 h-6" />
      </div>
      <div class="text-center">
        <p class="text-sm font-semibold text-primary-text">No integrations found</p>
        <p class="text-xs text-secondary-text mt-1">Add your first provider integration to get started.</p>
      </div>
    </div>

    <!-- Data Table -->
    <div v-else class="w-full border border-primary-border rounded-xl overflow-x-auto bg-card-background/40">
      <table class="w-full border-collapse text-left">
        <thead>
          <tr class="border-b border-primary-border text-[10px] uppercase tracking-wider text-secondary-text bg-card-background/70 font-semibold select-none">
            <th class="p-3">ID</th>
            <th class="p-3">Company ID</th>
            <th class="p-3">Provider</th>
            <th class="p-3">Base URL</th>
            <th class="p-3">Created / Updated</th>
            <th class="p-3">Status</th>
            <th class="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="record in store.records"
            :key="record.id"
            class="border-b border-primary-border last:border-none hover:bg-card-background transition-colors"
          >
            <td class="p-3 text-xs text-primary-text font-mono">#{{ record.id }}</td>
            <td class="p-3 text-xs text-primary-text font-semibold">{{ record.company_id }}</td>
            <td class="p-3">
              <span class="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium uppercase tracking-wider">
                {{ record.provider }}
              </span>
            </td>
            <td class="p-3 text-xs text-primary-text max-w-xs truncate" :title="record.base_url">
              {{ record.base_url }}
            </td>
            <td class="p-3 text-[10px] text-secondary-text space-y-0.5">
              <div>Created: {{ formatDate(record.created_at) }}</div>
              <div>Updated: {{ formatDate(record.updated_at) }}</div>
            </td>
            <td class="p-3">
              <span
                class="px-2 py-0.5 rounded-full border text-[10px] font-semibold inline-block"
                :class="record.is_active
                  ? 'bg-green-500/10 text-green-700 border-green-500/20'
                  : 'bg-red-500/10 text-red-700 border-red-500/20'"
              >
                {{ record.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="p-3">
              <div class="flex items-center justify-center gap-2">
                <Tooltip text="Manual Fetch" position="top">
                  <button
                    @click="handleConfirmRun(record)"
                    class="p-2 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 transition cursor-pointer flex items-center justify-center"
                  >
                    <Play class="w-3.5 h-3.5" />
                  </button>
                </Tooltip>

                <Tooltip text="Edit Integration" position="top">
                  <button
                    @click="handleOpenEdit(record)"
                    class="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition cursor-pointer flex items-center justify-center"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="mt-4">
      <Pagination
        v-if="store.pagination.total_items > store.pagination.per_page"
        :pagination="store.pagination"
        @page-change="handlePageChange"
      />
    </div>

    <!-- Modal Form Component -->
    <IntegrationDialog
      :open="showModal"
      :record="selectedRecord"
      @close="closeModal"
      @success="handleSuccess"
    />

    <!-- Confirmation Dialog for manual fetch -->
    <ConfirmationDialog
      :open="showRunConfirm"
      title="Manual Fetch Confirmation"
      :message="`Are you sure you want to run the manual fetch for integration provider '${runRecord?.provider}' (URL: ${runRecord?.base_url})?`"
      confirm-text="Run Fetch"
      cancel-text="Cancel"
      :loading="store.isRunning"
      type="info"
      @confirm="handleRunIntegration"
      @cancel="closeRunConfirm"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Cpu, Plus, Pencil, Play } from 'lucide-vue-next'
import { useCompanyIntegrationsStore } from '@/stores/companyIntegrations/companyIntegrations'
import Pagination from '@/components/common/Pagination.vue'
import IntegrationDialog from '@/components/common/IntegrationDialog.vue'
import Tooltip from '@/components/common/Tooltip.vue'
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue'

const store = useCompanyIntegrationsStore()

const showModal = ref(false)
const selectedRecord = ref(null)

const showRunConfirm = ref(false)
const runRecord = ref(null)

const handlePageChange = (page) => {
  store.pagination.page = page
  store.fetchIntegrations(true)
}

const handleOpenCreate = () => {
  selectedRecord.value = null
  showModal.value = true
}

const handleOpenEdit = (record) => {
  selectedRecord.value = record
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedRecord.value = null
}

const handleConfirmRun = (record) => {
  runRecord.value = record
  showRunConfirm.value = true
}

const closeRunConfirm = () => {
  showRunConfirm.value = false
  runRecord.value = null
}

const handleRunIntegration = async () => {
  if (!runRecord.value) return
  await store.runIntegration(runRecord.value.id)
  closeRunConfirm()
}

const handleSuccess = () => {
  store.fetchIntegrations(true)
}

const formatDate = (val) => {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  store.fetchIntegrations()
})
</script>
