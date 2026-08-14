<template>
  <div class="space-y-6 py-2">
    <!-- Top Header Banner -->
    <div class="bg-card-background border border-primary-border rounded-2xl p-4 sm:p-5 shadow-2xs">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3.5 min-w-0">
          <div class="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm flex items-center justify-center shrink-0">
            <Tag class="w-5 h-5" />
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-base font-bold text-primary-text truncate">
                {{ activeOffer?.name || 'Offer Details' }}
              </h1>
              <span
                v-if="activeOffer?.visibility"
                class="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-md border text-secondary-text bg-background/80 border-primary-border"
              >
                {{ activeOffer.visibility }}
              </span>
              <span
                v-if="activeOffer"
                class="text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5"
                :class="activeOffer.is_active
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="activeOffer.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'" />
                {{ activeOffer.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <p v-if="activeOffer?.offer_code" class="text-xs font-mono text-primary font-semibold mt-1">
              Code: {{ activeOffer.offer_code }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <Tooltip text="Refresh Data">
            <button
              class="p-2 rounded-lg border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
              @click="refreshData"
            >
              <RotateCw class="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>

    <!-- Main Depth Sections -->
    <template v-if="activeOffer">
      <!-- 1. COMMON INFORMATION -->
      <div class="bg-card-background border border-primary-border rounded-2xl overflow-hidden shadow-2xs">
        <div class="flex items-center justify-between p-4 sm:p-5 border-b border-primary-border">
          <div class="flex items-start gap-3">
            <div class="w-1 h-10 rounded-full bg-primary shrink-0 mt-0.5" />
            <div>
              <p class="text-sm font-bold text-primary-text">Common Information</p>
              <p class="text-xs text-secondary-text mt-0.5">Offer's title, visibility, and description</p>
            </div>
          </div>
          <button
            class="px-3.5 py-1.5 rounded-lg border border-primary-border text-xs font-semibold text-primary-text hover:bg-background transition-colors cursor-pointer"
            @click="openEditInfoDialog('common')"
          >
            Edit
          </button>
        </div>
        <div class="divide-y divide-primary-border/60 text-xs">
          <div class="flex items-center justify-between py-3 px-5">
            <span class="font-medium text-secondary-text">Title</span>
            <span class="font-bold text-primary-text">{{ activeOffer.name }}</span>
          </div>
          <div class="flex items-center justify-between py-3 px-5">
            <span class="font-medium text-secondary-text">Visibility</span>
            <span class="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-primary-border bg-background text-secondary-text">
              {{ activeOffer.visibility }}
            </span>
          </div>
          <div class="flex items-center justify-between py-3 px-5">
            <span class="font-medium text-secondary-text">Summary</span>
            <span class="text-secondary-text">{{ activeOffer.summary || activeOffer.description || '—' }}</span>
          </div>
        </div>
      </div>

      <!-- 2. FEES -->
      <div class="bg-card-background border border-primary-border rounded-2xl overflow-hidden shadow-2xs">
        <div class="flex items-center justify-between p-4 sm:p-5 border-b border-primary-border">
          <div class="flex items-start gap-3">
            <div class="w-1 h-10 rounded-full bg-primary shrink-0 mt-0.5" />
            <div>
              <p class="text-sm font-bold text-primary-text">Fees</p>
              <p class="text-xs text-secondary-text mt-0.5">Setting up fee structure for the offer</p>
            </div>
          </div>
          <button
            class="px-3.5 py-1.5 rounded-lg border border-primary-border text-xs font-semibold text-primary-text hover:bg-background transition-colors cursor-pointer"
            @click="openEditInfoDialog('fees')"
          >
            Edit
          </button>
        </div>
        <div class="divide-y divide-primary-border/60 text-xs">
          <div class="flex items-center justify-between py-3 px-5">
            <span class="font-medium text-secondary-text">Performance Fee</span>
            <span class="font-bold text-primary-text">{{ activeOffer.performance_fee ?? 0 }}%</span>
          </div>
          <div class="flex items-center justify-between py-3 px-5">
            <span class="font-medium text-secondary-text">Management Fee</span>
            <span class="font-bold text-primary-text">{{ activeOffer.management_fee ?? 0 }}%</span>
          </div>
          <div class="flex items-center justify-between py-3 px-5">
            <span class="font-medium text-secondary-text">Registration Fee</span>
            <span class="font-bold text-primary-text">${{ fmt(activeOffer.registration_fee) }}</span>
          </div>
        </div>
      </div>

      <!-- 3. FILTERS -->
      <div class="bg-card-background border border-primary-border rounded-2xl overflow-hidden shadow-2xs">
        <div class="flex items-center justify-between p-4 sm:p-5 border-b border-primary-border">
          <div class="flex items-start gap-3">
            <div class="w-1 h-10 rounded-full bg-primary shrink-0 mt-0.5" />
            <div>
              <p class="text-sm font-bold text-primary-text">Filters & Limitations</p>
              <p class="text-xs text-secondary-text mt-0.5">Minimum balance requirement for followers</p>
            </div>
          </div>
          <button
            class="px-3.5 py-1.5 rounded-lg border border-primary-border text-xs font-semibold text-primary-text hover:bg-background transition-colors cursor-pointer"
            @click="openEditInfoDialog('filters')"
          >
            Edit
          </button>
        </div>
        <div class="divide-y divide-primary-border/60 text-xs">
          <div class="flex items-center justify-between py-3 px-5">
            <span class="font-medium text-secondary-text">Minimum Balance</span>
            <span class="font-bold text-primary-text font-mono">${{ fmt(activeOffer.minimum_balance) }}</span>
          </div>
        </div>
      </div>

      <!-- 4. ADDITIONAL AGENTS -->
      <div class="bg-card-background border border-primary-border rounded-2xl overflow-hidden shadow-2xs">
        <div class="flex items-center justify-between p-4 sm:p-5 border-b border-primary-border">
          <div class="flex items-start gap-3">
            <div class="w-1 h-10 rounded-full bg-primary shrink-0 mt-0.5" />
            <div>
              <p class="text-sm font-bold text-primary-text">Additional Agents</p>
              <p class="text-xs text-secondary-text mt-0.5">Configure profit sharing agents for this offer</p>
            </div>
          </div>
          <button
            class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors cursor-pointer"
            @click="openCreateAgentDialog"
          >
            <Plus class="w-3.5 h-3.5" /> Add Agent
          </button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-background/50 border-b border-primary-border">
          <div class="bg-card-background border border-primary-border rounded-xl px-3 py-2">
            <p class="text-[10px] uppercase tracking-widest text-secondary-text font-bold">Total Share</p>
            <p class="text-sm font-bold text-primary-text mt-0.5">{{ formatShare(store.agentsSummary.total_share) }}</p>
          </div>
          <div class="bg-card-background border border-primary-border rounded-xl px-3 py-2">
            <p class="text-[10px] uppercase tracking-widest text-secondary-text font-bold">Remaining Share</p>
            <p class="text-sm font-bold text-primary-text mt-0.5">{{ formatShare(store.agentsSummary.remaining_share) }}</p>
          </div>
        </div>

        <div v-if="store.agentsLoading" class="flex items-center justify-center gap-2 py-8 text-xs text-secondary-text">
          <Loader2 class="w-4 h-4 animate-spin opacity-60" /> Loading additional agents...
        </div>
        <div v-else-if="store.agents.length === 0" class="flex items-center justify-center gap-2 py-8 text-xs text-secondary-text">
          <Users class="w-5 h-5 opacity-40" /> No additional agents configured
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full border-collapse text-xs text-left">
            <thead>
              <tr class="border-b border-primary-border bg-background/60 text-secondary-text font-bold uppercase tracking-wider text-[10px]">
                <th class="py-3 px-4 whitespace-nowrap">Trading Account</th>
                <th class="py-3 px-4 whitespace-nowrap">Broker Label</th>
                <th class="py-3 px-4 whitespace-nowrap">Share</th>
                <th class="py-3 px-4 whitespace-nowrap">Status</th>
                <th class="py-3 px-4 whitespace-nowrap">Created</th>
                <th class="py-3 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-primary-border/60">
              <tr v-for="agent in store.agents" :key="agent.id" class="hover:bg-background/40 transition-colors">
                <td class="py-3.5 px-4 font-bold text-primary-text whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Users class="w-3 h-3" />
                    </div>
                    <span>{{ formatAgentAccount(agent) }}</span>
                  </div>
                </td>
                <td class="py-3.5 px-4 text-secondary-text whitespace-nowrap">{{ agent.broker_label || '—' }}</td>
                <td class="py-3.5 px-4 whitespace-nowrap">
                  <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-primary-border bg-background text-secondary-text">
                    {{ formatShare(agent.share_percentage) }}
                  </span>
                </td>
                <td class="py-3.5 px-4 whitespace-nowrap">
                  <span
                    class="text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1"
                    :class="agent.is_active
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 border-rose-500/20'"
                  >
                    {{ agent.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-secondary-text whitespace-nowrap">{{ formatDate(agent.created_at) }}</td>
                <td class="py-3.5 px-4 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      class="w-7 h-7 flex items-center justify-center rounded-lg border border-transparent hover:border-primary-border hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                      @click="openEditAgentDialog(agent)"
                      title="Edit Agent"
                    >
                      <Pencil class="w-3.5 h-3.5" />
                    </button>
                    <button
                      class="w-7 h-7 flex items-center justify-center rounded-lg border border-transparent hover:border-rose-500/20 hover:bg-rose-500/10 text-secondary-text hover:text-rose-500 transition-colors cursor-pointer"
                      @click="confirmDeleteAgent(agent)"
                      title="Delete Agent"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 5. OFFER'S JOIN LINKS -->
      <div class="bg-card-background border border-primary-border rounded-2xl overflow-hidden shadow-2xs">
        <div class="flex items-center justify-between p-4 sm:p-5 border-b border-primary-border">
          <div class="flex items-start gap-3">
            <div class="w-1 h-10 rounded-full bg-primary shrink-0 mt-0.5" />
            <div>
              <p class="text-sm font-bold text-primary-text">Offer's Join Links</p>
              <p class="text-xs text-secondary-text mt-0.5">Campaign and invitation URLs for private or direct subscription</p>
            </div>
          </div>
          <button
            class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors cursor-pointer"
            @click="openCreateLinkDialog"
          >
            <Plus class="w-3.5 h-3.5" /> Add Link
          </button>
        </div>

        <div v-if="store.linksLoading" class="flex items-center justify-center gap-2 py-8 text-xs text-secondary-text">
          <Loader2 class="w-4 h-4 animate-spin opacity-60" /> Loading join links...
        </div>
        <div v-else-if="store.joinLinks.length === 0" class="flex items-center justify-center gap-2 py-8 text-xs text-secondary-text">
          <Link2 class="w-5 h-5 opacity-40" /> No join links created yet
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full border-collapse text-xs text-left">
            <thead>
              <tr class="border-b border-primary-border bg-background/60 text-secondary-text font-bold uppercase tracking-wider text-[10px]">
                <th class="py-3 px-4 whitespace-nowrap">Title & Token</th>
                <th class="py-3 px-4 whitespace-nowrap">Expiration</th>
                <th class="py-3 px-4 whitespace-nowrap">Status</th>
                <th class="py-3 px-4 whitespace-nowrap">Link Usage</th>
                <th class="py-3 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-primary-border/60">
              <tr v-for="link in store.joinLinks" :key="link.id" class="hover:bg-background/40 transition-colors">
                <td class="py-3.5 px-4 whitespace-nowrap">
                  <div class="flex items-center gap-2.5">
                    <div class="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Link2 class="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p class="font-bold text-primary-text text-xs">{{ link.title || 'Untitled' }}</p>
                      <p class="text-[11px] font-mono text-primary select-all mt-0.5">{{ link.token || link.link_code }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-3.5 px-4 text-secondary-text whitespace-nowrap">
                  {{ link.expires_at ? formatDate(link.expires_at) : 'No expiry' }}
                </td>
                <td class="py-3.5 px-4 whitespace-nowrap">
                  <span
                    class="text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1"
                    :class="link.is_active !== false
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 border-rose-500/20'"
                  >
                    <CheckCircle2 v-if="link.is_active !== false" class="w-3 h-3" />
                    <XCircle v-else class="w-3 h-3" />
                    {{ link.is_active !== false ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="py-3.5 px-4 whitespace-nowrap">
                  <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-primary-border bg-background text-secondary-text">
                    {{ link.max_uses ? `${link.used_count ?? 0}/${link.max_uses}` : 'No limit' }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      class="w-7 h-7 flex items-center justify-center rounded-lg border border-transparent hover:border-primary/20 hover:bg-primary/10 text-secondary-text hover:text-primary transition-colors cursor-pointer"
                      @click="copyLink(link.token)"
                      title="Copy Token"
                    >
                      <Copy class="w-3.5 h-3.5" />
                    </button>
                    <button
                      class="w-7 h-7 flex items-center justify-center rounded-lg border border-transparent hover:border-primary-border hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                      @click="openEditLinkDialog(link)"
                      title="Edit Link"
                    >
                      <Pencil class="w-3.5 h-3.5" />
                    </button>
                    <button
                      class="w-7 h-7 flex items-center justify-center rounded-lg border border-transparent hover:border-rose-500/20 hover:bg-rose-500/10 text-secondary-text hover:text-rose-500 transition-colors cursor-pointer"
                      @click="confirmDeleteLink(link)"
                      title="Delete Link"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- DIALOGS -->
    <CreateJoinLinkDialog
      :open="linkDialogOpen"
      :offer-id="offerId"
      :edit-link="editingLink"
      @close="linkDialogOpen = false"
    />

    <EditOfferInfoDialog
      v-if="activeOffer && editingSection"
      :open="editInfoDialogOpen"
      :section="editingSection"
      :offer-id="offerId"
      :offer="activeOffer"
      @close="editInfoDialogOpen = false"
      @updated="refreshData"
    />

    <CreateAgentDialog
      :open="agentDialogOpen"
      :offer-id="offerId"
      @close="agentDialogOpen = false"
    />

    <EditAgentDialog
      :open="agentEditDialogOpen"
      :offer-id="offerId"
      :agent="editingAgent"
      @close="agentEditDialogOpen = false"
    />

    <DeleteAgentConfirmationDialog
      :open="!!deleteAgentTarget"
      :agent="deleteAgentTarget"
      :loading="store.deleteAgentLoading"
      @close="deleteAgentTarget = null"
      @confirm="doDeleteAgent"
    />

    <!-- Delete Link Modal -->
    <div
      v-if="deleteLinkTarget"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="deleteLinkTarget = null"
    >
      <div class="bg-card-background rounded-2xl border border-primary-border w-full max-w-sm overflow-hidden shadow-2xl">
        <div class="px-5 py-4 border-b border-primary-border flex items-center gap-2">
          <Trash2 class="w-4 h-4 text-rose-500" />
          <h2 class="text-sm font-bold text-primary-text">Delete Join Link</h2>
        </div>
        <div class="px-5 py-4">
          <p class="text-xs text-secondary-text">
            Are you sure you want to delete <span class="font-bold text-primary-text">"{{ deleteLinkTarget.title }}"</span>? This action cannot be undone.
          </p>
        </div>
        <div class="px-5 py-4 border-t border-primary-border flex gap-3 bg-card-background">
          <button
            class="flex-1 px-4 py-2 rounded-lg text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
            @click="deleteLinkTarget = null"
          >
            Cancel
          </button>
          <button
            :disabled="store.deleteLinkLoading"
            class="flex-1 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            @click="doDeleteLink"
          >
            <Loader2 v-if="store.deleteLinkLoading" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ store.deleteLinkLoading ? 'Deleting...' : 'Delete' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Plus, Tag, Link2, Pencil, Trash2, Copy, RotateCw, Loader2, CheckCircle2, XCircle, Users } from 'lucide-vue-next'
import { useFmOffersStore } from '@/stores/fmOffers/fmOffers'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import CreateJoinLinkDialog from '@/components/fmOffers/CreateJoinLinkDialog.vue'
import EditOfferInfoDialog from '@/components/fmOffers/EditOfferInfoDialog.vue'
import CreateAgentDialog from '@/components/fmOffers/CreateAgentDialog.vue'
import EditAgentDialog from '@/components/fmOffers/EditAgentDialog.vue'
import DeleteAgentConfirmationDialog from '@/components/fmOffers/DeleteAgentConfirmationDialog.vue'

const route = useRoute()
const snackbar = useSnackbarStore()
const store = useFmOffersStore()

const offerId = computed(() => route.params.id)
const storedActiveOffer = ref(null)

const activeOffer = computed(() => {
  const currentOffer = store.offers.find((o) => String(o.id) === String(offerId.value))
  if (currentOffer) return currentOffer
  if (storedActiveOffer.value && String(storedActiveOffer.value.id) === String(offerId.value)) {
    return storedActiveOffer.value
  }
  return null
})

// Dialog States
const linkDialogOpen = ref(false)
const editingLink = ref(null)
const deleteLinkTarget = ref(null)

const editInfoDialogOpen = ref(false)
const editingSection = ref(null)

const agentDialogOpen = ref(false)
const agentEditDialogOpen = ref(false)
const editingAgent = ref(null)
const deleteAgentTarget = ref(null)

const openCreateLinkDialog = () => {
  editingLink.value = null
  linkDialogOpen.value = true
}
const openEditLinkDialog = (link) => {
  editingLink.value = { ...link }
  linkDialogOpen.value = true
}
const confirmDeleteLink = (link) => {
  deleteLinkTarget.value = link
}
const doDeleteLink = () => {
  if (!deleteLinkTarget.value) return
  store.deleteJoinLink(offerId.value, deleteLinkTarget.value.id, () => {
    deleteLinkTarget.value = null
  })
}

const openEditInfoDialog = (section) => {
  editingSection.value = section
  editInfoDialogOpen.value = true
}

const openCreateAgentDialog = () => { agentDialogOpen.value = true }
const openEditAgentDialog = (agent) => {
  editingAgent.value = agent
  agentEditDialogOpen.value = true
}
const confirmDeleteAgent = (agent) => { deleteAgentTarget.value = agent }
const doDeleteAgent = () => {
  if (!deleteAgentTarget.value) return
  store.deleteAgent(offerId.value, deleteAgentTarget.value.id, () => {
    deleteAgentTarget.value = null
  })
}

const copyLink = async (token) => {
  try {
    const fullUrl = `${window.location.origin}/join/${token}`
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(fullUrl)
    } else {
      const ta = document.createElement('textarea')
      ta.value = fullUrl
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    snackbar.show('Link copied to clipboard.', 'success')
  } catch {
    snackbar.show('Failed to copy link.', 'error')
  }
}

const fmt = (v) => (v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatDate = (val) => val ? new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const formatShare = (s) => (s === null || s === undefined || s === '') ? '—' : `${Number(s)}%`
const formatAgentAccount = (a) => a?.trading_account_id ?? a?.account_number ?? a?.trading_account?.account_number ?? '—'

const refreshData = () => {
  store.fetchOffers(null, true)
  store.fetchJoinLinks(offerId.value)
  store.fetchAgents(offerId.value)
}

onMounted(() => {
  refreshData()
  try {
    storedActiveOffer.value = JSON.parse(localStorage.getItem('active_offer') || 'null')
  } catch {
    storedActiveOffer.value = null
  }
})

watch(activeOffer, (offer) => {
  if (offer) localStorage.setItem('active_offer', JSON.stringify(offer))
}, { immediate: true, deep: true })
</script>
